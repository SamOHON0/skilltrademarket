-- Skill Trade: initial schema (Phase 1 Foundation)
-- Built to PRD v1.0 recommendations:
--   no customer accounts (job managed via token), admin approval queue,
--   county matching, tier release offsets, unlock allowances per tier,
--   5-unlock cap enforced atomically in Postgres.

-- ============ ENUMS ============

create type tier as enum ('basic', 'pro', 'elite');
create type trade_status as enum ('active', 'suspended', 'pending');
create type job_status as enum ('pending_review', 'live', 'fully_claimed', 'expired', 'completed', 'removed');
create type job_urgency as enum ('asap', 'this_week', 'this_month', 'flexible');
create type contact_method as enum ('whatsapp', 'call', 'email');
create type unlock_outcome as enum ('none', 'won', 'lost', 'completed');
create type review_status as enum ('live', 'flagged', 'removed');
create type doc_status as enum ('pending', 'approved', 'rejected');

-- ============ REFERENCE ============

create table trade_categories (
  slug text primary key,
  name text not null,
  sort_order int not null default 0,
  active boolean not null default true,
  questions jsonb not null default '[]' -- category-specific job questions
);

-- ============ CORE TABLES ============

create table trades_people (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique, -- references auth.users(id) once Supabase Auth is wired
  business_name text not null,
  owner_name text not null,
  email text not null unique,
  phone text not null,
  trade_categories text[] not null default '{}',
  counties text[] not null default '{}',
  bio text,
  photos text[] not null default '{}',
  tier tier not null default 'basic',
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_active boolean not null default false,
  verified_at timestamptz,
  status trade_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table jobs (
  id uuid primary key default gen_random_uuid(),
  category text not null references trade_categories(slug),
  title text not null,
  description text,
  answers jsonb not null default '{}',
  photos text[] not null default '{}',
  county text not null,
  town text,
  eircode text,
  urgency job_urgency not null default 'flexible',
  budget_band text,
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  preferred_contact contact_method not null default 'call',
  consent_share_contact boolean not null default false, -- share with up to 5 trades
  consent_review_contact boolean not null default false, -- review prompt after completion
  manage_token uuid not null default gen_random_uuid(), -- no-account job management + review
  status job_status not null default 'pending_review',
  unlock_count int not null default 0,
  released_at timestamptz, -- set on admin approval; tier offsets computed from this
  expires_at timestamptz,  -- released_at + 7 days
  created_at timestamptz not null default now()
);

create table unlocks (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id),
  trade_id uuid not null references trades_people(id),
  unlocked_at timestamptz not null default now(),
  outcome unlock_outcome not null default 'none',
  outcome_at timestamptz,
  unique (job_id, trade_id)
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) unique, -- one review per job, transaction-verified
  trade_id uuid not null references trades_people(id),
  rating int not null check (rating between 1 and 5),
  text text,
  status review_status not null default 'live',
  created_at timestamptz not null default now()
);

create table leaderboard_points (
  trade_id uuid not null references trades_people(id),
  category text not null references trade_categories(slug),
  county text not null,
  points int not null default 0,
  period text not null, -- e.g. 'rolling_90'
  updated_at timestamptz not null default now(),
  primary key (trade_id, category, county, period)
);

create table boosts (
  id uuid primary key default gen_random_uuid(),
  trade_id uuid not null references trades_people(id),
  category text not null references trade_categories(slug),
  county text not null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null
);

create table raffle_draws (
  id uuid primary key default gen_random_uuid(),
  month text not null, -- 'YYYY-MM'
  tier_rules jsonb not null default '{"pro": 1, "elite": 2}',
  winner_trade_id uuid references trades_people(id),
  drawn_at timestamptz
);

create table verification_docs (
  id uuid primary key default gen_random_uuid(),
  trade_id uuid not null references trades_people(id),
  type text not null, -- 'id' | 'insurance'
  file_url text not null,
  status doc_status not null default 'pending',
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============ PLATFORM SETTINGS ============
-- Tunable from admin without redeploys (offsets, allowances, points formula).

create table platform_settings (
  key text primary key,
  value jsonb not null
);

insert into platform_settings (key, value) values
  ('tier_release_offsets_minutes', '{"elite": 0, "pro": 30, "basic": 60}'),
  ('unlock_allowances_monthly', '{"basic": 10, "pro": 25, "elite": null}'),
  ('job_unlock_cap', '5'),
  ('job_expiry_days', '7'),
  ('admin_escalation_hours', '48'),
  ('points_formula', '{"completed_job": 10, "per_review_star": 2, "window_days": 90}');

-- ============ INDEXES ============

create index jobs_feed_idx on jobs (status, county, category, released_at);
create index unlocks_trade_idx on unlocks (trade_id, unlocked_at);
create index unlocks_job_idx on unlocks (job_id);
create index reviews_trade_idx on reviews (trade_id, status);
create index boosts_active_idx on boosts (category, county, ends_at);

-- ============ ATOMIC UNLOCK (the 5-cap race) ============
-- The cap must be enforced in Postgres, never app code (PRD 8.1).
-- Row lock on the job guarantees two simultaneous taps cannot become #5 and #6.

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

-- ============ ROW LEVEL SECURITY ============
-- Customer contact fields are the crown jewels (PRD 8.2).
-- Strategy: trades NEVER select jobs directly. Feed and unlocked-job reads go
-- through security-definer functions/views that strip contact fields unless
-- an unlock row links the caller to the job. Admin role bypasses via service key.

alter table trades_people enable row level security;
alter table jobs enable row level security;
alter table unlocks enable row level security;
alter table reviews enable row level security;
alter table leaderboard_points enable row level security;
alter table boosts enable row level security;
alter table raffle_draws enable row level security;
alter table verification_docs enable row level security;
alter table platform_settings enable row level security;
alter table trade_categories enable row level security;

-- Public reference data
create policy "categories readable by all" on trade_categories for select using (true);
create policy "settings readable by all" on platform_settings for select using (true);

-- Trades manage their own row
create policy "trade reads own row" on trades_people
  for select using (auth.uid() = auth_user_id);
create policy "trade updates own row" on trades_people
  for update using (auth.uid() = auth_user_id);

-- Public trade profiles (name, bio, reviews) are served via a view, not direct table reads,
-- so stripe ids and contact details stay private. See public_trade_profiles below.

-- Jobs: no direct select policy for trades (feed goes through job_feed function).
-- Customer manages their job by manage_token through an edge/server route using the service key.

-- Unlocks: a trade sees their own unlocks
create policy "trade reads own unlocks" on unlocks
  for select using (trade_id in (select id from trades_people where auth_user_id = auth.uid()));

-- Reviews are public when live
create policy "live reviews readable" on reviews for select using (status = 'live');

-- Leaderboard and boosts public read
create policy "leaderboard readable" on leaderboard_points for select using (true);
create policy "boosts readable" on boosts for select using (true);

-- Verification docs: trade sees own
create policy "trade reads own docs" on verification_docs
  for select using (trade_id in (select id from trades_people where auth_user_id = auth.uid()));
create policy "trade uploads own docs" on verification_docs
  for insert with check (trade_id in (select id from trades_people where auth_user_id = auth.uid()));

-- ============ PUBLIC VIEWS ============

create view public_trade_profiles as
  select id, business_name, trade_categories, counties, bio, photos, tier,
         (verified_at is not null) as verified, created_at
  from trades_people
  where status = 'active';

-- Job feed for trades: contact fields stripped, tier window enforced
create or replace function job_feed(p_trade_id uuid)
returns table (
  id uuid, category text, title text, description text, answers jsonb,
  county text, town text, urgency job_urgency, budget_band text,
  unlock_count int, released_at timestamptz, unlocked boolean
) as $$
  select j.id, j.category, j.title, j.description, j.answers,
         j.county, j.town, j.urgency, j.budget_band,
         j.unlock_count, j.released_at,
         exists(select 1 from unlocks u where u.job_id = j.id and u.trade_id = p_trade_id)
  from jobs j
  join trades_people t on t.id = p_trade_id
  cross join lateral (
    select value as offsets from platform_settings where key = 'tier_release_offsets_minutes'
  ) s
  where j.status in ('live', 'fully_claimed')
    and j.category = any(t.trade_categories)
    and j.county = any(t.counties)
    and now() >= j.released_at + make_interval(mins => (s.offsets ->> t.tier::text)::int)
  order by j.released_at desc;
$$ language sql security definer;
