# Changelog

All notable changes to Skill Trade. Newest first.

## [0.8.0] - 2026-06-30 - Posting refinement, auto-approve & travel radius

### Added
- Per-trade travel radius: trades choose how far they'll travel at signup
  (5 / 10 / 15 / 25 / 50 / 100 km, or "Anywhere in Ireland"). Stored on the
  profile, shown on the dashboard, and reflected in the feed copy.
- Multi-step post-a-job flow now has a Review screen summarising the job
  before submit, plus a step counter.
- Per-step validation on the posting form with inline, field-level errors;
  you can't advance past a step with missing or invalid fields.
- Professional confirmation page: status timeline (Posted -> In review ->
  Live -> Claimed -> Complete), status pill, posted date, and budget.

### Changed
- Posted jobs auto-approve straight to live by default (flag
  `AUTO_APPROVE_JOBS`); the admin Job queue becomes the exception pile.
- Removed the "Built by SquareTwo" footer credit.

### Fixed
- `submitJob` no longer crashes the page if the database insert fails; it
  returns a friendly error instead.

### Migration
- `0003_trade_radius.sql` (adds `match_radius_km` to trades).

## [0.7.0] - 2026-06-23 - Location-based matching & maps

### Added
- Distance matching: jobs matched within a radius of the trade's base, with
  county fallback when coordinates are missing.
- Free geocoding (OpenStreetMap Nominatim) on job post and trade signup;
  results cached on the row.
- Maps on job cards, the trade dashboard, and the customer's manage page
  (OpenStreetMap embeds, no API key). Approximate area pre-unlock for privacy,
  pinned location after.
- Urgency / time-frame badges (ASAP, This week, This month, Flexible) across
  feed, dashboard, and manage page.
- Trade signup collects a base town / eircode for distance matching.

### Migration
- `0002_location.sql` (lat/lng on jobs + trades, base location, radius setting).

## [0.6.0] - 2026-06-23 - Phase 2 core loop

### Added
- Actionable contact handoff: on unlock, customer details appear as WhatsApp /
  Call / Email buttons with the preferred method highlighted (Irish numbers
  converted to wa.me format).
- Job expiry enforced: expired jobs drop out of the feed; the customer's page
  shows an expired state.

## [0.5.0] - 2026-06-22 - Phase 1 skeleton

### Added
- Authenticated trade area with a tab bar (Dashboard, Job feed, Profile,
  Plan & billing, Verification).
- Read-only trade profile page; Phase 3 placeholders for billing and
  verification.
- Admin sections: Verification queue (Phase 3), Leaderboard (Phase 4), and a
  read-only Platform settings view.
- Public and legal pages: How it works, Contact, Terms, Privacy, public
  Leaderboard, plus footer navigation.
- Shared `PhaseStub` component for consistent "coming in Phase X" placeholders.

## [0.4.0] - 2026-06-22 - Secure accounts (Phase 1)

### Added
- Supabase Auth for tradespeople and admin (email + password): signup, login,
  logout, forgot/reset password, email-confirmation callback.
- Trade signup creates a linked profile; new trades start pending and
  unsubscribed.
- Route protection via middleware; admin gated by an `ADMIN_EMAILS` allowlist.
- Trade dashboard: stats, unlocked jobs with outcomes, profile panel.
- Auth-aware navigation (Dashboard / Job feed / Log out when signed in).

### Fixed
- Session no longer drops on navigation; the middleware refreshes it on every
  page, not just the feed.

## [0.3.0] - 2026-06-20 - Toolbox brand & landing page

### Added
- "Toolbox" brand direction applied: hi-vis amber + ink palette, Archivo
  headlines, Inter body, shout-style headings.
- Rebuilt landing page with an upfront customer-vs-tradesperson chooser and a
  two-column "How it works".

## [0.2.0] - 2026-06-20 - Supabase connected & Phase 1 expanded

### Added
- Live Supabase data layer behind a `DATA_SOURCE` toggle (mock or supabase);
  atomic 5-unlock cap via the `unlock_job` Postgres function.
- Admin trade management: suspend/reactivate, verify, change tier.
- Customer self-service: cancel or complete a job, see which trades claimed it.
- Inline validation on the post-job form; global not-found, error, and loading
  screens.

## [0.1.0] - 2026-06-09 - Phase 1 Foundation

### Added
- Next.js 15 app, mock in-memory data layer, and the data-access contract.
- Supabase schema migration and seed SQL.
- Core pages: home, post a job, customer job management, trade feed, pricing,
  and the admin area structure.
