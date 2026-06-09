# Skill Trade, Product Requirements Document

**Project:** Two-sided trades marketplace (working brand: Skill Trade)
**Client:** James Atkinson
**Developer:** SquareTwo
**Version:** 1.0 draft, 9 June 2026
**Stack:** Next.js / Supabase / Vercel / Stripe
**Source documents:** Project Quotation (Appendix A of the Development Agreement), signed Development Agreement, client "Skill Trade" concept doc

Decisions still open are marked **[DECISION]** with options and a recommendation. Anything marked **[SCOPE FLAG]** is in James's concept doc but sits outside or in tension with the contracted scope and needs to be agreed (and possibly quoted) before build.

---

## 1. Product summary

Skill Trade connects customers who need a job done with local tradespeople across Ireland. Customers post a job through a short guided flow, free. Matched tradespeople on a paid monthly subscription see the job in their feed and race to unlock it; the first five to unlock get the customer's contact details and deal with the customer directly. The platform takes no commission on the work itself.

Differentiators per the client's positioning: no hidden fees, no dead leads (jobs are qualified with as much customer info as possible), capped competition per job (five trades max), cancel anytime, plus community mechanics (leaderboard, monthly raffles) that reward active, well-reviewed trades.

**Revenue:** tradesperson subscriptions only. Three tiers: Basic EUR 39.99, Pro EUR 59.99, Elite EUR 89.99 per month (client states exc VAT; final price presentation is the client's call once his VAT position is confirmed).

**Out of scope for this build (per contract):** in-app messaging between customer and trade, native mobile apps, the crypto concept. Contact happens via direct handoff of customer details (WhatsApp, phone, email).

---

## 2. Users and roles

| Role | Description | Pays? |
|---|---|---|
| Customer | Posts jobs via guided flow, receives contact from trades, leaves reviews | No |
| Tradesperson | Subscribes, receives matched job alerts, unlocks jobs, builds profile and reviews | Yes, monthly |
| Admin (James + team) | Verifies trades, moderates reviews, manages jobs, oversees platform, runs raffles | n/a |

**[DECISION] Customer accounts.**
- **Option A, no account.** Customer posts a job with name + contact + job details, gets a magic link or code to manage that job and later leave a review. Lowest friction, highest job volume, standard for this market (Bark and similar work this way).
- **Option B, light account.** Email + password or magic link account created at job post. Better repeat use, review integrity, and spam control; slightly more friction.
- **Recommendation:** Option A for launch, with the review tied to the job token. Accounts can be layered in later without rework if jobs are keyed to email.

---

## 3. Core flows

### 3.1 Customer job posting (guided matching)

Multi-step form, mobile-first:

1. **Trade category** (what do you need done) from the launch trades list
2. **Job details**, category-specific questions plus free text and optional photos
3. **Location**, county + town or Eircode
4. **Timing/urgency** (ASAP, this week, this month, flexible)
5. **Budget band** (optional)
6. **Contact details**, name, phone, email, preferred contact method (WhatsApp / call / email)

On submit: job enters the matching pool, customer gets confirmation (and the manage-job link per 2 above). The "no dead leads" promise means capturing rich detail here; the per-category questions are the mechanism.

**[DECISION] Job vetting before it goes live to trades.**
- **Option A, auto-publish.** Job hits feeds instantly. Fastest experience, but risks junk/duplicate jobs reaching paying trades and undermining the no-dead-leads promise.
- **Option B, admin approval queue.** Every job is reviewed (and the customer phoned/texted for more info if thin) before release. Matches James's "we chase up all customers" promise exactly, but creates a manual bottleneck that depends on his team's availability.
- **Option C, hybrid.** Auto-publish jobs that pass completeness checks (phone verified by SMS code, minimum detail filled); route thin ones to the queue.
- **Recommendation:** Option B at launch. Volume will be low early, the manual touch IS the product promise, and it can be loosened to Option C as volume grows. Note SMS verification in Option C carries per-message cost, see 8.3.

### 3.2 Matching and the job feed

Jobs are matched to tradespeople by **trade category + service area**. Each tradesperson sets their trade(s) and coverage during onboarding.

**[DECISION] Service area model.**
- **Option A, county-based.** Trade picks one or more counties. Simple to build, simple to explain, coarse matching (Dublin is huge, Leitrim is not).
- **Option B, radius-based.** Trade sets a base location + radius in km, jobs matched by distance from Eircode. Better matching quality, needs geocoding (Google Geocoding API or similar, small per-call cost).
- **Recommendation:** Option A for launch with multi-county selection, Option B as a fast follow. County matching is good enough to prove the model and removes a third-party dependency from Phase 2.

**Tier-based early access (from client doc):** when a job is released, Elite trades see it immediately, Pro trades after 30 minutes, Basic trades after 60 minutes. (Client doc frames it as Pro 30 min and Elite 60 min *before Basic*; implemented as release offsets: Elite at T+0, Pro at T+30, Basic at T+60.)

**[DECISION] Early-access interaction with the 5-unlock cap.** An Elite trade could theoretically have jobs sewn up before Basic ever sees them.
- **Option A, pure offsets** as above. Strong upgrade incentive (this is clearly James's intent), but Basic risks feeling worthless in busy categories, hurting retention of the cheapest tier.
- **Option B, reserved slots.** Of the 5 unlocks, cap how many can go before general release (e.g. max 3 unlocks during the early window, 2 always survive to T+60). Softens the worst case, more complex to explain.
- **Recommendation:** Option A at launch for simplicity and upsell pressure, with unlock-timing analytics built in so the call on Option B can be made with data. Flag to James that Basic churn is the metric to watch.

### 3.3 Unlock and contact handoff

- Feed shows job details with customer contact hidden.
- Trade hits **Unlock**. First five unlocks get the customer's name, phone, email, and preferred contact method, plus one-tap WhatsApp/call/email links.
- At five unlocks the job locks for everyone else and shows as "fully claimed."
- Unlocks are included in the subscription (no per-lead fee, that is the brand promise).

**[DECISION] Unlock allowance per tier.**
The client doc implies unlimited unlocks on subscription. Unlimited on Basic at EUR 39.99 invites one aggressive trade to hoover up every lead in a county.
- **Option A, unlimited all tiers.** Simplest, truest to "no secret fees," exploitable.
- **Option B, monthly unlock allowances by tier** (e.g. Basic 10, Pro 25, Elite unlimited). Protects the lead pool, creates a clean upgrade ladder, but must be messaged carefully so it never reads as a hidden cap.
- **Option C, unlimited but rate-limited** (e.g. max 3 active unlocked jobs not yet marked won/lost/done). Anti-hoarding without a visible number to resent.
- **Recommendation:** Option B, with the allowances shown plainly on the pricing page so it is a stated feature, not a secret fee. Needs James's sign-off since it touches his pricing doc.

**[DECISION] What happens to a job nobody unlocks.**
- **Option A, expiry.** Job auto-expires after X days (suggest 7), customer notified and invited to repost or broaden.
- **Option B, admin escalation.** Unclaimed after 48h triggers an admin task to ring trades manually. On-brand with the concierge promise, manual cost.
- **Recommendation:** both, Option B inside Option A's window. Build is trivial (a status + a timer + an admin list).

### 3.4 Job completion, reviews, leaderboard

- Trade marks an unlocked job **won / lost / completed** (also feeds Elite analytics).
- On completion (or after a time window), the customer is invited to review: star rating + text, tied to the actual job so reviews are verified-by-transaction.
- Reviews display on the trade's public profile.
- **Leaderboard:** ranks trades on a points system from completed jobs and review scores.

**[DECISION] Leaderboard scoping.**
- **Option A, per trade category nationally.** One "Top Plumbers in Ireland" board. Simple, but a Dublin firm with volume will sit on top forever and Donegal trades will not care.
- **Option B, per category per county.** Local relevance, matches "local search" in the client doc, more boards but identical code.
- **Recommendation:** Option B, with a national view as a vanity page. Points formula to start simple: completed job = 10 pts, each review star = 2 pts, recency-weighted over rolling 90 days so the board moves and stays winnable. Formula tunable from admin.

**[DECISION] Review moderation model.**
- **Option A, post-then-moderate.** Reviews appear instantly, admin can pull flagged ones. Fresher, riskier.
- **Option B, hold-for-approval.** Every review queued. Safe, slow, bottleneck.
- **Recommendation:** Option A with a profanity/spam filter and a one-tap flag for trades, given reviews are already transaction-verified. Defamation risk is mitigated by takedown ability.

### 3.5 Tradesperson onboarding and verification

1. Sign-up: business name, trade(s), service area, contact details, profile (bio, photos, portfolio)
2. Pick tier, pay via Stripe Checkout, subscription active
3. **Verification (Pro/Elite badge):** upload ID and proof of insurance, admin reviews and approves, badge appears on profile

**[DECISION] Can unverified trades unlock jobs?**
- **Option A, yes.** Verification is purely the badge (this is what the client doc's tiering implies, since Basic has no badge at all). Fastest activation, fastest revenue.
- **Option B, no unlocks until verified,** any tier. Safer for customers, but adds an activation delay and contradicts the tier structure.
- **Recommendation:** Option A, consistent with the doc: verification is a trust signal you pay for at Pro+, not a gate. Customers see the badge and can choose accordingly. Revisit if quality complaints emerge.

### 3.6 Subscriptions and billing (Stripe)

- Three monthly prices in Stripe (Basic / Pro / Elite), Stripe Checkout for sign-up, Stripe Customer Portal for card changes, upgrades, downgrades, cancellation ("cancel anytime" is a brand promise, so the portal does the work).
- Webhooks drive access: active subscription = feed access at tier level; failed payment = grace period then feed lockout (Stripe Smart Retries + dunning emails).
- Upgrades take effect immediately with proration; downgrades at period end.

**[DECISION] Free trial.**
- **Option A, none.** Clean, but cold-start: trades will not pay before jobs exist.
- **Option B, time-based trial** (14 or 30 days, card upfront). Standard, solves chicken-and-egg at launch.
- **Option C, founding-member rate,** discounted first 3 months for the first N trades per county. Builds supply density exactly where needed and creates urgency.
- **Recommendation:** Option C, optionally combined with B. This is a launch-strategy call for James more than a build question; Stripe coupons make any of these cheap to implement, so the build supports all three.

### 3.7 Raffles (from client doc)

Monthly prize draws for trades, Pro entered automatically, Elite double entries, prizes from supplier/tool-company partnerships.

**[SCOPE FLAG]** Raffles are operational, not contracted platform scope. Lightweight support is cheap though:
- **Option A, fully off-platform.** James runs draws manually, announces on socials. Zero build.
- **Option B, light support.** Admin button that snapshots eligible entrants per the tier rules and picks a random winner, logged for fairness. Half a day of build.
- **Recommendation:** Option B, folded into the admin area in Phase 4. Anything richer (entrant-facing raffle pages, prize galleries) is a change request. Note: prize draws tied to a paid subscription can engage promotions/lottery rules in Ireland; flag to James to keep entry incidental to the subscription (no extra payment to enter) and to check the competition terms. Not legal advice, worth a proper look before the first draw.

---

## 4. Tier matrix (consolidated from client doc + decisions above)

| Feature | Basic 39.99 | Pro 59.99 | Elite 89.99 |
|---|---|---|---|
| Profile listing in local search | Yes | Yes | Yes |
| Job alerts | T+60 min | T+30 min | T+0 |
| Job unlocks | Allowance TBD | Allowance TBD | Unlimited (proposed) |
| Reviews + portfolio on profile | Yes | Yes | Yes |
| Placement in category listings | Standard | Priority | Top of chosen category |
| Verified badge (ID + insurance) | No | Yes | Yes |
| Quote + invoice templates | No | Yes | Yes |
| Review booster (auto SMS) | No | Yes | Yes |
| Support level | Basic | Priority | Priority |
| Monthly raffle | No | Auto-entry | Double entries |
| Profile boosts | No | No | 2 per month |
| Analytics (alerts seen, unlocks, jobs won) | No | No | Yes |
| Sponsor/social advertising | No | No | Yes (operational) |

**[SCOPE FLAG] Three items in this matrix were not in the contracted quotation and need an explicit call before Phase 2 planning:**

1. **"Job alerts and messages" (Basic).** In-app messaging is expressly out of scope in the Agreement. Interpret "messages" as job alert notifications plus the contact handoff. If James means actual customer-to-trade messaging, that is a change request with real scope. **Recommendation:** confirm the interpretation in writing at the foundation walkthrough.
2. **Quote and invoice templates (Pro+).** Not in the quotation.
   - Option A, downloadable branded PDF templates (static). Hours of work, ship it as a goodwill inclusion.
   - Option B, in-app quote/invoice generator with the trade's details prefilled. Real feature, real scope, quote separately.
   - **Recommendation:** Option A included, Option B parked as a v2 change request.
3. **Review booster auto-SMS (Pro+).** Sends the customer an SMS prompting a review after job completion. Needs an SMS provider (Twilio or similar, roughly 5 to 8 cent per SMS in Ireland) and consent capture at job post. Cheap to build on top of the completion event, but it is new scope plus an ongoing per-message cost that someone has to own. **Recommendation:** build the trigger email-first (free) in Phase 4, add SMS as a toggle once James accepts the running cost. Either way, get the consent checkbox into the customer flow now.

**Profile boosts (Elite):** define as 7 days pinned-to-top in the trade's category + county listing, max 2 active per month, self-served from the trade dashboard. Simple flag + expiry.

---

## 5. Admin area

- **Job queue:** review/edit/approve/reject incoming jobs (per 3.1), see unlock counts, manually close or extend
- **Trade management:** approve verifications (view uploaded ID/insurance docs), suspend accounts, change tiers manually
- **Review moderation:** flagged-review queue, takedown with reason logged
- **Leaderboard controls:** points formula settings, manual adjustment with audit trail
- **Raffle tool** (per 3.7 Option B)
- **Dashboard:** jobs posted/claimed/expired, active subs by tier, MRR, churn, unlock latency by tier

---

## 6. Data model (Supabase, first pass)

`trades_people` (id, business_name, owner_name, email, phone, trade_categories[], counties[], bio, photos[], tier, stripe_customer_id, stripe_subscription_id, verified_at, status)
`jobs` (id, category, title, description, answers jsonb, photos[], county, town, eircode, urgency, budget_band, customer_name, customer_phone, customer_email, preferred_contact, status [pending_review | live | fully_claimed | expired | completed | removed], released_at, expires_at)
`unlocks` (id, job_id, trade_id, unlocked_at, outcome [none | won | lost | completed])
`reviews` (id, job_id, trade_id, rating, text, status [live | flagged | removed], created_at)
`leaderboard_points` (trade_id, category, county, points, period)
`boosts` (id, trade_id, category, county, starts_at, ends_at)
`raffle_draws` (id, month, tier_rules jsonb, winner_trade_id, drawn_at)
`verification_docs` (id, trade_id, type, file_url, status, reviewed_by, reviewed_at)

Row-level security throughout; customer contact fields readable only via the unlock relationship or admin role. Early-access windows enforced server-side (released_at + tier offset), never client-side.

---

## 7. Build phases (mapped to the contracted five)

| Phase | Contracted scope | PRD additions/notes |
|---|---|---|
| 1 Foundation (EUR 1,750) | Project + hosting setup, DB, secure accounts, admin structure | Schema above, auth (trades + admin), RLS, seed trade categories, walkthrough with James to close every [DECISION] |
| 2 Core loop (EUR 2,900) | Guided matching, matched feed, capped access, contact handoff | Tier release offsets, unlock mechanic + 5-cap, job expiry, admin job queue |
| 3 Billing + accounts (EUR 2,900) | Stripe subscriptions, paywall, verification flow | 3 tiers + portal + webhooks + dunning, verification doc upload + admin review, founding-member coupons |
| 4 Reviews + ranking (EUR 2,450) | Completion tracking, reviews, profiles, moderation, leaderboard | Points engine + per-county boards, review trigger (email-first), raffle tool, boosts, Elite analytics |
| 5 Launch + hardening (EUR 4,000, holdback) | Full QA, payment/access stress-testing, deploy, supported soft launch | Load-test unlock race conditions specifically (five-cap under simultaneous taps is the highest-risk concurrency point), GDPR review, go-live |

Phase 1 walkthrough with James is where every [DECISION] in this document gets closed. Take this PRD to that meeting.

---

## 8. Non-functional requirements

**8.1 Performance.** Feed and job-post flow fast on mid-range mobile over 4G; "fast simple site" is in the client's own pitch. Unlock action must be transactional: the 5-cap enforced atomically in Postgres (row lock or atomic counter), never in app code, or two trades tapping simultaneously becomes unlock #5 and #6.

**8.2 GDPR.** Customer contact details are the product's crown jewels and its biggest liability. Specifics: contact data exposed only post-unlock and only to the unlocking trades; consent language at job post covering sharing details with up to five tradespeople; retention policy (suggest auto-anonymise customer PII X months after job close, propose 12); the contracted Data Processing Agreement between SquareTwo and James to be in place before launch; review-SMS consent if 4.3 proceeds. Privacy notice and cookie policy are the Client's responsibility under the Agreement but SquareTwo should supply working drafts.

**8.3 Running costs (Client's, post-handover).** Stripe fees on subscriptions, Vercel + Supabase hosting beyond free tiers, domain + email, SMS per-message if review booster goes SMS, geocoding API if radius matching (3.2 Option B) is adopted.

**8.4 Brand.** Skill Trade name, logo, palette and identity developed with James under the included branding work. Tone per his doc: straight-talking, anti-hidden-fees, trade-first.

---

## 9. Success metrics (first 90 days)

- Jobs posted per week, and % reaching at least 1 unlock within 24h (lead quality promise)
- Average unlocks per job (target trending toward the 5-cap in core counties)
- Paying trades by tier, and Basic-to-Pro upgrade rate (validates the early-access ladder)
- Churn by tier (watch Basic per 3.2 decision)
- Review submission rate on completed jobs
- MRR

---

## 10. Open items summary (for the foundation walkthrough)

1. Customer accounts: none vs light (rec: none, token-managed)
2. Job vetting: admin queue vs auto vs hybrid (rec: admin queue at launch)
3. Service area: county vs radius (rec: county now, radius fast-follow)
4. Early access vs 5-cap interaction (rec: pure offsets + analytics)
5. Unlock allowances per tier (rec: allowances, shown openly; needs James sign-off)
6. Unclaimed job handling (rec: 7-day expiry + 48h admin escalation)
7. Leaderboard scope + points formula (rec: per category per county, simple tunable formula)
8. Review moderation (rec: post-then-moderate, transaction-verified)
9. Unverified unlock rights (rec: allowed, badge is the differentiator)
10. Trial/launch offer (rec: founding-member rate per county)
11. "Messages" interpretation, confirm no in-app messaging (contract scope)
12. Quote/invoice templates: static PDFs included, generator parked
13. Review booster: email-first, SMS later + consent capture now
14. Launch trades list: **not yet defined anywhere, James to supply**, suggest 8 to 12 categories with proven lead demand (plumbing, electrical, carpentry, painting, tiling, plastering, roofing, landscaping/gardening, general handyman)
15. Raffle legal check before first draw

