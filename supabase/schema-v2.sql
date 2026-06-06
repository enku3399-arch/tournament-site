-- ============================================================
-- SCHEMA V2 — Groups + stage support
-- Supabase SQL Editor дээр ажиллуулна
-- ============================================================

-- Groups (хэсгүүд: A, B, C, D)
create table if not exists groups (
  id            uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  sport_id      uuid not null references tournament_sports(id) on delete cascade,
  name          text not null,         -- 'A', 'B', 'C', 'D'
  advance_count int  not null default 2,
  created_at    timestamptz not null default now()
);

-- Group memberships (ямар баг аль хэсэгт)
create table if not exists group_teams (
  id       uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  team_id  uuid not null references teams(id)  on delete cascade,
  unique (group_id, team_id)
);

-- Add stage + group to matches
alter table matches add column if not exists stage    text default 'knockout';
alter table matches add column if not exists group_id uuid references groups(id) on delete set null;

-- Add format config to tournament_sports
alter table tournament_sports add column if not exists format           text default 'groups_knockout';
alter table tournament_sports add column if not exists groups_count     int  default 4;
alter table tournament_sports add column if not exists advance_per_group int  default 2;

-- Realtime for groups
alter publication supabase_realtime add table groups;
alter publication supabase_realtime add table group_teams;

-- RLS
alter table groups      enable row level security;
alter table group_teams enable row level security;

drop policy if exists "public read groups"      on groups;
drop policy if exists "public read group_teams" on group_teams;
drop policy if exists "service full access groups"      on groups;
drop policy if exists "service full access group_teams" on group_teams;

create policy "public read groups"      on groups      for select using (true);
create policy "public read group_teams" on group_teams for select using (true);
create policy "service full access groups"      on groups      using (true) with check (true);
create policy "service full access group_teams" on group_teams using (true) with check (true);
