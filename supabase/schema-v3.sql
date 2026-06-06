-- Schema v3: gender field for tournament_sports
alter table tournament_sports add column if not exists gender text; -- 'male', 'female', null
