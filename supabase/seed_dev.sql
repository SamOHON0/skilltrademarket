-- OPTIONAL dev seed: demo trades, jobs, unlocks and a review so the live feed
-- and admin screens have data to show before Supabase Auth (Phase 2) exists.
-- Mirrors the mock store in src/lib/data/mock.ts, with fixed UUIDs so the demo
-- ?as= switch on /trade/feed can target them.
--
-- Run AFTER seed.sql (it needs the trade_categories rows).
-- Do NOT run this in production.
--
-- The trade UUIDs below are what /trade/feed?as=... must use once you switch to
-- the live DB. See SUPABASE_SETUP.md step 6.
--   trade-1 -> 11111111-1111-1111-1111-111111111111  (Elite plumber, Dublin/Meath)
--   trade-2 -> 22222222-2222-2222-2222-222222222222  (Pro electrician, Dublin/Kildare)
--   trade-3 -> 33333333-3333-3333-3333-333333333333  (Basic painter, Kildare/Dublin/Wicklow)

insert into trades_people
  (id, business_name, owner_name, email, phone, trade_categories, counties, bio, tier, subscription_active, verified_at, status)
values
  ('11111111-1111-1111-1111-111111111111', 'Murphy Plumbing & Heating', 'Dec Murphy', 'dec@murphyplumbing.ie', '0861111111',
   '{plumbing}', '{Dublin,Meath}', '20 years in domestic plumbing and heating across north Dublin.', 'elite', true, now() - interval '30 days', 'active'),
  ('22222222-2222-2222-2222-222222222222', 'Bright Spark Electrical', 'Aoife Byrne', 'aoife@brightspark.ie', '0862222222',
   '{electrical}', '{Dublin,Kildare}', 'RECI registered. Domestic and light commercial.', 'pro', true, now() - interval '10 days', 'active'),
  ('33333333-3333-3333-3333-333333333333', 'O''Shea Painting', 'Tom O''Shea', 'tom@osheapainting.ie', '0863333333',
   '{painting,plastering}', '{Kildare,Dublin,Wicklow}', null, 'basic', true, null, 'active');

insert into jobs
  (id, category, title, description, answers, county, town, urgency, budget_band,
   customer_name, customer_phone, customer_email, preferred_contact,
   consent_share_contact, consent_review_contact, status, unlock_count, released_at, expires_at)
values
  ('a0000001-0000-0000-0000-000000000001', 'plumbing', 'Leaking radiator valve, Drumcondra',
   'Radiator in the front room leaking at the valve. Wood floor, want it sorted quickly.',
   '{"job_type": "Leak or burst pipe"}', 'Dublin', 'Drumcondra', 'asap', 'Under EUR 250',
   'Test Customer', '0851234567', 'customer@example.com', 'call', true, true,
   'live', 2, now() - interval '75 minutes', now() + interval '7 days'),

  ('a0000002-0000-0000-0000-000000000002', 'electrical', 'EV charger install, semi-d in Lucan',
   'Need a 7kW home charger installed, fuse board is 3 years old.',
   '{"job_type": "EV charger"}', 'Dublin', 'Lucan', 'this_month', 'EUR 250 to 1,000',
   'Test Customer', '0851234567', 'customer@example.com', 'call', true, true,
   'live', 0, now() - interval '20 minutes', now() + interval '7 days'),

  ('a0000003-0000-0000-0000-000000000003', 'painting', 'Repaint 3-bed interior before letting',
   null, '{}', 'Kildare', 'Naas', 'this_week', 'EUR 1,000 to 5,000',
   'Test Customer', '0851234567', 'customer@example.com', 'call', true, true,
   'live', 0, now() - interval '5 minutes', now() + interval '7 days'),

  ('a0000004-0000-0000-0000-000000000004', 'roofing', 'Slipped slates after storm',
   null, '{}', 'Dublin', 'Clontarf', 'asap', null,
   'Test Customer', '0851234567', 'customer@example.com', 'call', true, true,
   'pending_review', 0, null, null),

  ('a0000005-0000-0000-0000-000000000005', 'plumbing', 'Bathroom refit plumbing first fix',
   null, '{}', 'Meath', 'Ashbourne', 'this_month', null,
   'Test Customer', '0851234567', 'customer@example.com', 'call', true, true,
   'fully_claimed', 5, now() - interval '2 days', now() + interval '5 days');

insert into unlocks (job_id, trade_id, unlocked_at, outcome) values
  ('a0000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', now() - interval '70 minutes', 'none');

insert into reviews (job_id, trade_id, rating, text, status) values
  ('a0000005-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 5,
   'Dec was out within the hour, fair price, no mess.', 'live');
