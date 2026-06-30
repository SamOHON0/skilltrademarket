-- Per-trade travel radius. NULL = use platform default; 0 = anywhere in Ireland;
-- 1..100 = match jobs within that many km of the trade's base.
alter table trades_people add column if not exists match_radius_km int;
