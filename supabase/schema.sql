-- ============================================================
-- Хаврын Спортын Тэмцээн - Tournament Site Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Tournaments
create table if not exists tournaments (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  location    text,
  start_date  date,
  end_date    date,
  organizer_name  text,
  organizer_phone text,
  prize_info  text,
  rules       text,
  status      text not null default 'draft', -- draft | active | completed
  admin_code  text not null default substring(md5(random()::text), 1, 8),
  created_at  timestamptz not null default now()
);

-- Sports within a tournament (basketball, volleyball, darts, etc.)
create table if not exists tournament_sports (
  id            uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  sport_type    text not null, -- basketball | volleyball | darts | custom
  name          text not null,
  weight        integer not null default 1,
  created_at    timestamptz not null default now()
);

-- Teams / athletes registered to a tournament sport
create table if not exists teams (
  id            uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  sport_id      uuid references tournament_sports(id) on delete set null,
  name          text not null,
  contact_name  text,
  contact_phone text,
  seed          integer,
  status        text not null default 'pending', -- pending | confirmed
  created_at    timestamptz not null default now()
);

-- Match schedule
create table if not exists matches (
  id            uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  sport_id      uuid not null references tournament_sports(id) on delete cascade,
  team1_id      uuid references teams(id),
  team2_id      uuid references teams(id),
  round         integer not null default 1,
  match_number  integer not null default 1,
  scheduled_at  timestamptz,
  status        text not null default 'scheduled', -- scheduled | live | completed | cancelled
  team1_score   integer,
  team2_score   integer,
  winner_id     uuid references teams(id),
  judge_code    text not null default substring(md5(random()::text), 1, 6),
  notes         text,
  created_at    timestamptz not null default now()
);

-- Enable realtime on matches and teams tables
alter publication supabase_realtime add table matches;
alter publication supabase_realtime add table teams;

-- Row Level Security (disable for easy setup, enable later for production)
alter table tournaments     enable row level security;
alter table tournament_sports enable row level security;
alter table teams           enable row level security;
alter table matches         enable row level security;

-- Public read access
create policy "public read tournaments"      on tournaments     for select using (true);
create policy "public read tournament_sports" on tournament_sports for select using (true);
create policy "public read teams"            on teams           for select using (true);
create policy "public read matches"          on matches         for select using (true);

-- Full access for service_role (used by admin API routes)
create policy "service full access tournaments"     on tournaments     using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service full access sports"          on tournament_sports using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service full access teams"           on teams           using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service full access matches"         on matches         using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
