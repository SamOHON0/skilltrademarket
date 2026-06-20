# Supabase setup

Connecting SkillTrade to the live Supabase project (`pnbodcvcgzkzxfxfdxmu`).

The data layer is already implemented. These steps apply the schema and flip the
app from the mock store to the live database. Total time: about 10 minutes.

## 1. Install the dependency

```bash
npm install
```

This pulls in `@supabase/supabase-js` (added to package.json).

## 2. Apply the schema

In the Supabase dashboard for project `pnbodcvcgzkzxfxfdxmu`, open **SQL Editor**
and run, in order:

1. `supabase/migrations/0001_initial_schema.sql` (tables, enums, RLS, the
   `unlock_job()` and `job_feed()` functions)
2. `supabase/seed.sql` (the 9 launch trade categories)
3. `supabase/seed_dev.sql` *(optional)* demo trades, jobs, a review and an
   unlock so the feed and admin screens show data before auth exists. Skip in
   production.

Paste the file contents into the editor and hit Run. Or, with the Supabase CLI
linked to the project:

```bash
supabase db push          # applies migrations
# then run seed.sql / seed_dev.sql via: supabase db execute -f supabase/seed.sql
```

## 3. Get your keys

Dashboard -> **Project Settings -> API**:

- Project URL (already set: `https://pnbodcvcgzkzxfxfdxmu.supabase.co`)
- `anon` public key
- `service_role` secret key (server only, never ship to the client)

## 4. Create `.env.local`

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://pnbodcvcgzkzxfxfdxmu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
DATA_SOURCE=supabase
```

`DATA_SOURCE=supabase` is the switch. Set it to `mock` (or remove it) any time to
fall back to the in-memory store, with no code changes.

## 5. Run it

```bash
npm run dev
```

Post a job at `/post-job`, approve it in `/admin/jobs`, and it should show on the
trade feed. Data now persists in Postgres instead of resetting on restart.

## 6. Demo feed caveat (until Phase 2 auth)

`/trade/feed` has no login yet, so it picks a trade via `?as=`. The mock uses
string IDs (`trade-1`); the live DB uses UUIDs. If you ran `seed_dev.sql`, point
the demo switch at the seeded UUIDs by editing `src/app/trade/feed/page.tsx`:

```ts
// const tradeId = as ?? "trade-1";
const tradeId = as ?? "11111111-1111-1111-1111-111111111111";

// and the switcher list near the bottom:
// {["trade-1", "trade-2", "trade-3"].map((id) => (
{[
  "11111111-1111-1111-1111-111111111111",
  "22222222-2222-2222-2222-222222222222",
  "33333333-3333-3333-3333-333333333333",
].map((id) => (
```

This is throwaway demo wiring. It goes away when Supabase Auth lands and the feed
reads the logged-in trade from the session. Leave it as-is if you stay on the
mock store.

## What's implemented vs pending

Done: full `DataStore` against Supabase (`src/lib/data/supabase.ts`), service-role
client (`src/lib/supabase/server.ts`), atomic unlock via the `unlock_job()` RPC,
contact-field stripping on the feed, and the `DATA_SOURCE` toggle.

Pending (later phases): Supabase Auth for trades + admin (Phase 2), Stripe
(Phase 3), reviews/leaderboard/raffle flows (Phase 4). At that point, switch the
feed reads to the `job_feed()` security-definer function and add a cookie-bound
anon/SSR client alongside the service client.
