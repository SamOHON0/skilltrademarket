-- AI moderation results stored on each job for audit + admin display.
alter table jobs add column if not exists ai_decision text;     -- approve | review | reject
alter table jobs add column if not exists ai_reasons jsonb;     -- array of short strings
alter table jobs add column if not exists moderated_at timestamptz;
