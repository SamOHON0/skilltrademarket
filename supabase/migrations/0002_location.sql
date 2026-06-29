-- Phase 2: location-based matching (12km radius) with county fallback.
-- Coordinates are filled by geocoding (Nominatim) on job post and trade signup.

alter table jobs add column if not exists lat double precision;
alter table jobs add column if not exists lng double precision;

alter table trades_people add column if not exists lat double precision;
alter table trades_people add column if not exists lng double precision;
alter table trades_people add column if not exists base_eircode text;
alter table trades_people add column if not exists base_town text;

insert into platform_settings (key, value) values ('match_radius_km', '12')
  on conflict (key) do nothing;
