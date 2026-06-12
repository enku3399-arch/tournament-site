-- Darts results table (JSONB for flexible group+knockout storage)
create table if not exists darts_results (
  id uuid default gen_random_uuid() primary key,
  tournament_id uuid not null,
  sport_id uuid not null unique,
  data jsonb not null default '{}',
  updated_at timestamptz default now()
);
alter table darts_results enable row level security;
create policy "darts public select" on darts_results for select using (true);
create policy "darts service write" on darts_results for all using (auth.role() = 'service_role');
