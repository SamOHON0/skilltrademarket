-- Phase 2 hardening: expiry enforced at the unlock boundary, feed function
-- brought up to date with radius matching + privacy blurring, and a
-- maintenance helper to sweep expired jobs.

-- ============ INDEX ============

create index if not exists jobs_expiry_idx on jobs (status, expires_at);

-- ============ ATOMIC UNLOCK v2 ============
-- Adds the expiry check the original missed: a job past expires_at can no
-- longer be unlocked, and gets flipped to 'expired' under the same row lock.
-- Everything else is unchanged: row lock serialises the 5-cap race, tier
-- release window and monthly allowance enforced here, never in app code.

create or replace function unlock_job(p_job_id uuid, p_trade_id uuid)
returns table (success boolean, reason text) as $$
declare
  v_job jobs%rowtype;
  v_trade trades_people%rowtype;
  v_cap int;
  v_offsets jsonb;
  v_allowances jsonb;
  v_allowance int;
  v_used int;
  v_visible_at timestamptz;
begin
  select * into v_trade from trades_people where id = p_trade_id;
  if not found or v_trade.status <> 'active' or not v_trade.subscription_active then
    return query select false, 'subscription_inactive'; return;
  end if;

  -- Lock the job row: serialises competing unlocks
  select * into v_job from jobs where id = p_job_id for update;
  if not found then
    return query select false, 'not_found'; return;
  end if;
  if v_job.status <> 'live' then
    return query select false, 'not_available'; return;
  end if;

  -- Expired jobs are dead leads: flip status while we hold the lock and refuse.
  if v_job.expires_at is not null and now() > v_job.expires_at then
    update jobs set status = 'expired' where id = p_job_id;
    return query select false, 'not_available'; return;
  end if;

  -- Tier early-access window enforced server-side
  select value into v_offsets from platform_settings where key = 'tier_release_offsets_minutes';
  v_visible_at := v_job.released_at + make_interval(mins => (v_offsets ->> v_trade.tier::text)::int);
  if now() < v_visible_at then
    return query select false, 'not_yet_visible'; return;
  end if;

  -- Monthly allowance by tier (null = unlimited)
  select value into v_allowances from platform_settings where key = 'unlock_allowances_monthly';
  if v_allowances -> v_trade.tier::text <> 'null'::jsonb then
    v_allowance := (v_allowances ->> v_trade.tier::text)::int;
    select count(*) into v_used from unlocks
      where trade_id = p_trade_id and unlocked_at >= date_trunc('month', now());
    if v_used >= v_allowance then
      return query select false, 'allowance_exhausted'; return;
    end if;
  end if;

  select (value)::int into v_cap from platform_settings where key = 'job_unlock_cap';
  if v_job.unlock_count >= v_cap then
    return query select false, 'fully_claimed'; return;
  end if;

  insert into unlocks (job_id, trade_id) values (p_job_id, p_trade_id)
    on conflict (job_id, trade_id) do nothing;
  if not found then
    return query select false, 'already_unlocked'; return;
  end if;

  update jobs set
    unlock_count = unlock_count + 1,
    status = case when unlock_count + 1 >= v_cap then 'fully_claimed'::job_status else status end
  where id = p_job_id;

  return query select true, 'ok';
end;
$$ language plpgsql security definer;

-- ============ FEED FUNCTION v2 ============
-- Brought in line with the app's matching rules (the app currently filters via
-- the service client; this stays correct for a future move to RLS + RPC):
--   category match, radius matching with county fallback, tier release window,
--   expiry filter, contact fields stripped, coordinates blurred to ~1km.

drop function if exists job_feed(uuid);
create or replace function job_feed(p_trade_id uuid)
returns table (
  id uuid, category text, title text, description text, answers jsonb,
  county text, town text, urgency job_urgency, budget_band text,
  unlock_count int, released_at timestamptz, expires_at timestamptz,
  lat double precision, lng double precision, unlocked boolean
) as $$
  select j.id, j.category, j.title, j.description, j.answers,
         j.county, j.town, j.urgency, j.budget_band,
         j.unlock_count, j.released_at, j.expires_at,
         round(j.lat::numeric, 2)::double precision,  -- area, not house
         round(j.lng::numeric, 2)::double precision,
         exists(select 1 from unlocks u where u.job_id = j.id and u.trade_id = p_trade_id)
  from jobs j
  join trades_people t on t.id = p_trade_id
  cross join lateral (
    select value as offsets from platform_settings where key = 'tier_release_offsets_minutes'
  ) s
  cross join lateral (
    select coalesce(t.match_radius_km, (select (value)::int from platform_settings where key = 'match_radius_km')) as radius_km
  ) r
  where j.status in ('live', 'fully_claimed')
    and j.category = any(t.trade_categories)
    and (j.expires_at is null or j.expires_at > now())
    and now() >= j.released_at + make_interval(mins => (s.offsets ->> t.tier::text)::int)
    and (
      r.radius_km = 0  -- anywhere in Ireland
      or (
        j.lat is not null and j.lng is not null and t.lat is not null and t.lng is not null
        and 2 * 6371 * asin(sqrt(
              power(sin(radians(j.lat - t.lat) / 2), 2)
              + cos(radians(t.lat)) * cos(radians(j.lat))
                * power(sin(radians(j.lng - t.lng) / 2), 2)
            )) <= r.radius_km
      )
      or (
        (j.lat is null or j.lng is null or t.lat is null or t.lng is null)
        and j.county = any(t.counties)  -- county fallback when coordinates missing
      )
    )
  order by j.released_at desc;
$$ language sql security definer;

-- ============ EXPIRY SWEEP ============
-- Feeds and unlock_job() already treat past-expiry jobs as gone, so this is
-- housekeeping, not correctness: flips stale rows so admin lists and customer
-- manage pages show 'expired'. Call from a scheduled job (e.g. pg_cron or a
-- Vercel cron hitting an admin route): select expire_jobs();

create or replace function expire_jobs()
returns int as $$
declare
  v_count int;
begin
  update jobs
  set status = 'expired'
  where status in ('live', 'fully_claimed')
    and expires_at is not null
    and expires_at < now();
  get diagnostics v_count = row_count;
  return v_count;
end;
$$ language plpgsql security definer;
