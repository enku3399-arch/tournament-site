-- Schema v5: team source references for manual knockout scheduling
alter table matches add column if not exists team1_source text; -- e.g. "A:1" = Group A 1st place
alter table matches add column if not exists team2_source text;
