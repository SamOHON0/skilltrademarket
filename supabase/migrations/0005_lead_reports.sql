-- Trades can report a job they unlocked as a bad / dead lead.
create table if not exists lead_reports (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id),
  trade_id uuid not null references trades_people(id),
  reason text not null,
  status text not null default 'open', -- open | reviewed | refunded | dismissed
  created_at timestamptz not null default now(),
  unique (job_id, trade_id)
);
create index if not exists lead_reports_status_idx on lead_reports (status, created_at);

alter table lead_reports enable row level security;
