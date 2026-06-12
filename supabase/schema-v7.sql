-- Schema v7: chess_standings table for Swiss-system final rankings
create table if not exists chess_standings (
  id          uuid    default gen_random_uuid() primary key,
  tournament_id uuid  not null,
  sport_id    uuid    not null,
  gender      text    not null,         -- 'women' | 'men'
  rank        int     not null,
  name        text    not null,
  club        text    not null,
  pts         float   not null,
  updated_at  timestamptz default now()
);

create index if not exists chess_standings_sport_gender_rank
  on chess_standings (sport_id, gender, rank);

alter table chess_standings enable row level security;
drop policy if exists "chess public select"  on chess_standings;
drop policy if exists "chess service write"  on chess_standings;
create policy "chess public select" on chess_standings for select using (true);
create policy "chess service write" on chess_standings for all using (auth.role() = 'service_role');
