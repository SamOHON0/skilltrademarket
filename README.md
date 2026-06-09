# Skill Trade

Two-sided trades marketplace for Ireland. Customers post jobs free; subscribed tradespeople race to unlock them (first 5 get contact details). Built by SquareTwo for James Atkinson. Full spec: `Skill_Trade_PRD.md`.

**Stack:** Next.js 15 (App Router) / Supabase / Vercel / Stripe / Tailwind 4

## Status: Phase 1 Foundation

Running entirely on a mock in-memory data layer so every flow is demoable before Supabase is connected. All PRD [DECISION] recommendations are implemented as defaults and are tunable (see `src/lib/constants.ts` and the `platform_settings` table).

## Run it

```bash
npm install
npm run dev
```

| Route | What |
|---|---|
| `/` | Landing + category grid |
| `/post-job` | 5-step guided customer flow (consent capture included) |
| `/jobs/[token]` | Customer's no-account job management page |
| `/trade/feed` | Trade job feed with live unlock mechanic. Demo as different tiers via `?as=trade-1` (Elite), `?as=trade-2` (Pro), `?as=trade-3` (Basic). Tier release offsets apply for real, so seeded fresh jobs are invisible to lower tiers. |
| `/pricing` | Tier matrix (Stripe checkout = Phase 3) |
| `/admin` | Dashboard, job approval queue, trades, review moderation |

## Connecting Supabase

1. Create project, apply `supabase/migrations/0001_initial_schema.sql` then `supabase/seed.sql`
2. `npm i @supabase/supabase-js @supabase/ssr`
3. Copy `.env.example` to `.env.local`, fill keys, set `DATA_SOURCE=supabase`
4. Implement `src/lib/data/supabase.ts` (method-by-method mapping notes are in the file) and flip the export in `src/lib/data/index.ts`

The app only ever talks to the `DataStore` interface (`src/lib/data/index.ts`), so no page changes are needed for the swap.

### What the SQL already handles

- **Atomic 5-cap unlock**: `unlock_job()` Postgres function with a row lock. Two simultaneous taps can never become unlock #5 and #6 (PRD 8.1).
- **Tier early access server-side**: Elite T+0, Pro T+30, Basic T+60, read from `platform_settings`, enforced in both `unlock_job()` and the `job_feed()` function.
- **Contact data protection (GDPR)**: RLS on everything; trades never select `jobs` directly. The feed function strips contact fields; only an unlock row exposes them.
- **Monthly unlock allowances**: Basic 10 / Pro 25 / Elite unlimited, in `platform_settings`. Needs James's sign-off (PRD open item 5).
- **Admin-tunable settings**: offsets, allowances, cap, expiry, points formula all in `platform_settings`, no redeploys.

## Decisions baked in (PRD recommendations)

No customer accounts (manage-token per job) / admin approval queue before jobs go live / county-based matching, multi-county / pure tier offsets / 7-day expiry with 48h escalation flag / post-then-moderate reviews / unverified trades can unlock / both consent checkboxes captured at job post.

## Not in this phase

Supabase Auth wiring (placeholder noted in `src/app/admin/layout.tsx` and `src/lib/data/supabase.ts`), Stripe (Phase 3), reviews submission + leaderboard + raffle tool + boosts (Phase 4), photo uploads, email notifications.

## Before the foundation walkthrough with James

Open items 1 to 15 in PRD section 10, especially: unlock allowances sign-off, the "messages" interpretation in writing, and the final launch trades list (seed list in `supabase/seed.sql` is the suggested 9).
