# Skill Trade

Two-sided trades marketplace for Ireland. Customers post home-improvement jobs free; subscribed local tradespeople pay to unlock leads and contact customers directly. No commission, no dead leads, hard cap of five trades per job. Built by SquareTwo for James Atkinson. Full spec: `Skill_Trade_PRD.md`.

**Stack:** Next.js 15 (App Router, Server Components, Server Actions) / TypeScript strict / Tailwind CSS 4 / Supabase (Postgres) / Vercel

## Status: Phase 2 core loop, complete

The full loop works end to end on either data source: post a job, matching, tiered release, atomic capped unlock, contact handoff, customer job management, trade dashboard. Phase 1 (secure trade accounts via Supabase Auth) is live underneath it.

## Run it

```bash
npm install
npm run dev
```

By default `DATA_SOURCE=mock`: an in-memory store seeded with demo trades and jobs, so every flow is demoable with zero setup. Flip to the live database by setting `DATA_SOURCE=supabase` in `.env.local` (see below). The app only ever talks to the `DataStore` interface (`src/lib/data/index.ts`); no page knows which backend is live.

| Route | What |
|---|---|
| `/` | Landing + category grid |
| `/post-job` | 6-step guided customer flow: Trade, Details (category-specific questions), Location, Timing, Contact, Review |
| `/jobs/[token]` | Customer's private no-account job management page: status timeline, claimants, map, complete/cancel |
| `/trade/feed` | Personalised job feed with the unlock mechanic. In mock mode, demo tiers via `?as=trade-1` (Elite), `?as=trade-2` (Pro), `?as=trade-3` (Basic). Tier release offsets apply for real, so fresh seeded jobs are invisible to lower tiers. |
| `/trade/dashboard` | Stats, unlocked jobs with contact buttons + won/lost/completed outcomes, profile summary |
| `/trade/signup`, `/login` | Trade accounts (Supabase mode) |
| `/pricing` | Tier matrix (Stripe checkout = Phase 3) |
| `/admin` | Dashboard, job queue, trades, reports, review moderation (allowlist via `ADMIN_EMAILS`) |

## Flipping DATA_SOURCE

1. Create a Supabase project, apply `supabase/migrations/0001` through `0006` in order, then `supabase/seed.sql` (categories). `supabase/seed_dev.sql` is optional demo data; never in production.
2. Copy `.env.example` to `.env.local`, fill the Supabase keys, set `DATA_SOURCE=supabase`.
3. Restart dev. Same UI, live Postgres.

If you already applied 0001-0005, `0006_phase2_hardening.sql` is the only new migration: expiry enforced inside `unlock_job()`, `job_feed()` updated to radius matching + coordinate blurring, and an `expire_jobs()` sweep you can call from a cron.

## How the core loop is enforced (where the guarantees live)

- **Atomic 5-cap**: `unlock_job()` Postgres function takes a row lock on the job. Two simultaneous taps can never become #5 and #6. Never enforced in app code; the mock mirrors the same rule order so the UI behaves identically.
- **Tier release windows**: Elite T+0, Pro T+30m, Basic T+60m, read from `platform_settings`, enforced in `unlock_job()` server-side and filtered in the feed.
- **Monthly allowances**: Basic 10 / Pro 25 / Elite unlimited, enforced in `unlock_job()`.
- **Expiry**: jobs die 7 days after release. Filtered from feeds, refused at unlock (and flipped to `expired` under the lock), `expire_jobs()` sweeps stale rows for admin views.
- **Privacy by design**: trade-facing payloads (`FeedJob`) strip customer name/phone/email, the manage token, and the eircode, and blur coordinates to ~1km. Exact pin and contact details exist only behind an unlock row. Geocoding (Nominatim, cached on the row) and every external call fail soft to county matching.
- **Matching**: category + travel radius (5-100km or anywhere in Ireland), county fallback when either side lacks coordinates.

## Verification

- `npx tsc -p tsconfig.check.json --noEmit` clean, `next build` passing.
- Scripted walk of the loop against the mock store (post, tier visibility, unlock to cap, 6th refused, allowance, contact stripping pre-unlock, complete) plus a manual browser pass of every page.

## Not in this phase

Stripe billing (Phase 3), reviews submission + leaderboard + raffle + boosts (Phase 4), photo uploads, email/WhatsApp notifications, profile editing.
