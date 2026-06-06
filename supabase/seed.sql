-- ============================================================
-- 1. SCHEMA үүсгэх
-- ============================================================

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
  status      text not null default 'draft',
  admin_code  text not null default substring(md5(random()::text), 1, 8),
  created_at  timestamptz not null default now()
);

create table if not exists tournament_sports (
  id            uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  sport_type    text not null,
  name          text not null,
  weight        integer not null default 1,
  created_at    timestamptz not null default now()
);

create table if not exists teams (
  id            uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  sport_id      uuid references tournament_sports(id) on delete set null,
  name          text not null,
  contact_name  text,
  contact_phone text,
  seed          integer,
  status        text not null default 'pending',
  created_at    timestamptz not null default now()
);

create table if not exists matches (
  id            uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  sport_id      uuid not null references tournament_sports(id) on delete cascade,
  team1_id      uuid references teams(id),
  team2_id      uuid references teams(id),
  round         integer not null default 1,
  match_number  integer not null default 1,
  scheduled_at  timestamptz,
  status        text not null default 'scheduled',
  team1_score   integer,
  team2_score   integer,
  winner_id     uuid references teams(id),
  judge_code    text not null default substring(md5(random()::text), 1, 6),
  notes         text,
  created_at    timestamptz not null default now()
);

-- Realtime
alter publication supabase_realtime add table matches;
alter publication supabase_realtime add table teams;

-- RLS
alter table tournaments       enable row level security;
alter table tournament_sports enable row level security;
alter table teams             enable row level security;
alter table matches           enable row level security;

drop policy if exists "public read tournaments"       on tournaments;
drop policy if exists "public read tournament_sports" on tournament_sports;
drop policy if exists "public read teams"             on teams;
drop policy if exists "public read matches"           on matches;
drop policy if exists "service full access tournaments" on tournaments;
drop policy if exists "service full access sports"      on tournament_sports;
drop policy if exists "service full access teams"       on teams;
drop policy if exists "service full access matches"     on matches;

create policy "public read tournaments"       on tournaments     for select using (true);
create policy "public read tournament_sports" on tournament_sports for select using (true);
create policy "public read teams"             on teams           for select using (true);
create policy "public read matches"           on matches         for select using (true);

create policy "service full access tournaments" on tournaments     using (true) with check (true);
create policy "service full access sports"      on tournament_sports using (true) with check (true);
create policy "service full access teams"       on teams           using (true) with check (true);
create policy "service full access matches"     on matches         using (true) with check (true);

-- ============================================================
-- 2. SEED DATA — зохиомол өгөгдөл
-- ============================================================

do $$
declare
  t_id  uuid;
  s_basketball uuid; s_volleyball uuid; s_darts uuid; s_tennis uuid;

  -- 16 аймгийн баг IDs (сагсан бөмбөг)
  bb1 uuid; bb2 uuid; bb3 uuid; bb4 uuid; bb5 uuid; bb6 uuid; bb7 uuid; bb8 uuid;
  bb9 uuid; bb10 uuid; bb11 uuid; bb12 uuid; bb13 uuid; bb14 uuid; bb15 uuid; bb16 uuid;

  -- 16 аймгийн баг IDs (волейбол)
  vb1 uuid; vb2 uuid; vb3 uuid; vb4 uuid; vb5 uuid; vb6 uuid; vb7 uuid; vb8 uuid;
  vb9 uuid; vb10 uuid; vb11 uuid; vb12 uuid; vb13 uuid; vb14 uuid; vb15 uuid; vb16 uuid;

  -- 16 аймгийн баг IDs (дартс)
  dt1 uuid; dt2 uuid; dt3 uuid; dt4 uuid; dt5 uuid; dt6 uuid; dt7 uuid; dt8 uuid;
  dt9 uuid; dt10 uuid; dt11 uuid; dt12 uuid; dt13 uuid; dt14 uuid; dt15 uuid; dt16 uuid;

  -- 16 аймгийн баг IDs (ширээний теннис)
  tt1 uuid; tt2 uuid; tt3 uuid; tt4 uuid; tt5 uuid; tt6 uuid; tt7 uuid; tt8 uuid;
  tt9 uuid; tt10 uuid; tt11 uuid; tt12 uuid; tt13 uuid; tt14 uuid; tt15 uuid; tt16 uuid;

begin

-- ============================================================
-- TOURNAMENT
-- ============================================================
insert into tournaments (name, description, location, start_date, end_date,
  organizer_name, organizer_phone, prize_info, rules, status, admin_code)
values (
  '2026 Хаврын Спортын Их Тэмцээн',
  'Монгол улсын 16 аймгийн баг, тамирчид оролцсон жил бүрийн хаврын их тэмцээн. Дөрвөн төрлийн спортын нэгдсэн эрэмбэ тогтооно.',
  'Улаанбаатар хот, Хан-Уул дүүрэг, Спортын цогцолбор',
  '2026-05-10', '2026-05-18',
  'Монголын Спортын Холбоо', '99001122',
  '🥇 1-р байр: ₮5,000,000 | 🥈 2-р байр: ₮3,000,000 | 🥉 3-р байр: ₮1,500,000',
  '16 аймгаас нэг баг/тамирчин оролцоно. Шууд хасах системтэй. Тоглолт бүрийн ялагч дараагийн шатанд шилжинэ. Хагас финалын ялагчид финалд тоглоно.',
  'active', 'ADMIN2026'
) returning id into t_id;

-- ============================================================
-- SPORTS
-- ============================================================
insert into tournament_sports (tournament_id, sport_type, name, weight) values (t_id, 'basketball',   'Сагсан бөмбөг',   3) returning id into s_basketball;
insert into tournament_sports (tournament_id, sport_type, name, weight) values (t_id, 'volleyball',   'Волейбол',        3) returning id into s_volleyball;
insert into tournament_sports (tournament_id, sport_type, name, weight) values (t_id, 'darts',        'Дартс',           2) returning id into s_darts;
insert into tournament_sports (tournament_id, sport_type, name, weight) values (t_id, 'table_tennis', 'Ширээний теннис', 2) returning id into s_tennis;

-- ============================================================
-- TEAMS — САГСАН БӨМБӨГ
-- ============================================================
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_basketball, 'Архангай аймаг',    'Б.Болд',      '99112233', 1,  'confirmed') returning id into bb1;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_basketball, 'Баян-Өлгий аймаг',  'Н.Нурлан',    '99223344', 2,  'confirmed') returning id into bb2;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_basketball, 'Баянхонгор аймаг',  'Д.Дорж',      '99334455', 3,  'confirmed') returning id into bb3;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_basketball, 'Булган аймаг',       'Г.Ганбаяр',   '99445566', 4,  'confirmed') returning id into bb4;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_basketball, 'Говь-Алтай аймаг',  'Э.Энхбаяр',   '99556677', 5,  'confirmed') returning id into bb5;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_basketball, 'Дархан-Уул аймаг',  'О.Отгонбаяр', '99667788', 6,  'confirmed') returning id into bb6;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_basketball, 'Дорноговь аймаг',   'Т.Төмөр',     '99778899', 7,  'confirmed') returning id into bb7;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_basketball, 'Дорнод аймаг',      'Б.Батмөнх',   '99889900', 8,  'confirmed') returning id into bb8;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_basketball, 'Завхан аймаг',       'М.Мөнхбаяр',  '98112233', 9,  'confirmed') returning id into bb9;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_basketball, 'Орхон аймаг',        'Х.Хүрэлбаатар','98223344', 10, 'confirmed') returning id into bb10;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_basketball, 'Өмнөговь аймаг',    'Ж.Жавзан',    '98334455', 11, 'confirmed') returning id into bb11;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_basketball, 'Өвөрхангай аймаг',  'С.Сүхбаатар', '98445566', 12, 'confirmed') returning id into bb12;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_basketball, 'Сэлэнгэ аймаг',     'Р.Рэнчин',    '98556677', 13, 'confirmed') returning id into bb13;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_basketball, 'Сүхбаатар аймаг',   'А.Алтанцэцэг','98667788', 14, 'confirmed') returning id into bb14;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_basketball, 'Төв аймаг',          'Л.Лхагва',    '98778899', 15, 'confirmed') returning id into bb15;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_basketball, 'Хөвсгөл аймаг',     'Ц.Цэрэндорж', '98889900', 16, 'confirmed') returning id into bb16;

-- BASKETBALL MATCHES
-- Round 1 (completed)
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_basketball, bb1, bb16, 1, 1, '2026-05-10 09:00+08', 'completed', 82, 61, bb1, 'BB-J01');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_basketball, bb8, bb9,  1, 2, '2026-05-10 11:00+08', 'completed', 74, 79, bb9, 'BB-J02');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_basketball, bb5, bb12, 1, 3, '2026-05-10 13:00+08', 'completed', 88, 75, bb5, 'BB-J03');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_basketball, bb4, bb13, 1, 4, '2026-05-10 15:00+08', 'completed', 65, 70, bb13,'BB-J04');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_basketball, bb6, bb11, 1, 5, '2026-05-11 09:00+08', 'completed', 91, 83, bb6, 'BB-J05');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_basketball, bb3, bb14, 1, 6, '2026-05-11 11:00+08', 'completed', 77, 68, bb3, 'BB-J06');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_basketball, bb7, bb10, 1, 7, '2026-05-11 13:00+08', 'completed', 60, 85, bb10,'BB-J07');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_basketball, bb2, bb15, 1, 8, '2026-05-11 15:00+08', 'completed', 94, 72, bb2, 'BB-J08');

-- Round 2 (хагас дууссан)
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_basketball, bb1, bb9,  2, 1, '2026-05-13 10:00+08', 'completed', 78, 71, bb1, 'BB-J09');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_basketball, bb5, bb13, 2, 2, '2026-05-13 13:00+08', 'completed', 83, 76, bb5, 'BB-J10');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_basketball, bb6, bb3,  2, 3, '2026-05-14 10:00+08', 'scheduled', null, null, null, 'BB-J11');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_basketball, bb10, bb2, 2, 4, '2026-05-14 13:00+08', 'scheduled', null, null, null, 'BB-J12');

-- Round 3 - Semifinal
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, judge_code)
values (t_id, s_basketball, bb1, bb5, 3, 1, '2026-05-16 10:00+08', 'scheduled', 'BB-SF1');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, judge_code)
values (t_id, s_basketball, null, null, 3, 2, '2026-05-16 14:00+08', 'scheduled', 'BB-SF2');

-- Round 4 - Final
insert into matches (tournament_id, sport_id, round, match_number, scheduled_at, status, judge_code)
values (t_id, s_basketball, 4, 1, '2026-05-18 15:00+08', 'scheduled', 'BB-FINAL');

-- ============================================================
-- TEAMS — ВОЛЕЙБОЛ
-- ============================================================
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_volleyball, 'Хөвсгөл аймаг',     'Б.Батсүх',    '99100001', 1,  'confirmed') returning id into vb1;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_volleyball, 'Сэлэнгэ аймаг',     'Д.Дэлгэр',    '99100002', 2,  'confirmed') returning id into vb2;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_volleyball, 'Орхон аймаг',        'Г.Ганзориг',  '99100003', 3,  'confirmed') returning id into vb3;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_volleyball, 'Дархан-Уул аймаг',  'М.Мөнхзул',   '99100004', 4,  'confirmed') returning id into vb4;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_volleyball, 'Төв аймаг',          'О.Оюун',      '99100005', 5,  'confirmed') returning id into vb5;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_volleyball, 'Архангай аймаг',    'Э.Эрдэнэ',    '99100006', 6,  'confirmed') returning id into vb6;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_volleyball, 'Өвөрхангай аймаг',  'Ц.Цогт',      '99100007', 7,  'confirmed') returning id into vb7;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_volleyball, 'Баянхонгор аймаг',  'Х.Хишигт',    '99100008', 8,  'confirmed') returning id into vb8;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_volleyball, 'Завхан аймаг',       'Н.Наранцэцэг','99100009', 9,  'confirmed') returning id into vb9;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_volleyball, 'Говь-Алтай аймаг',  'Б.Буянтогтох','99100010', 10, 'confirmed') returning id into vb10;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_volleyball, 'Баян-Өлгий аймаг',  'А.Алтай',     '99100011', 11, 'confirmed') returning id into vb11;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_volleyball, 'Өмнөговь аймаг',    'С.Сарнай',    '99100012', 12, 'confirmed') returning id into vb12;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_volleyball, 'Дорноговь аймаг',   'Р.Рэгзэдмаа', '99100013', 13, 'confirmed') returning id into vb13;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_volleyball, 'Дорнод аймаг',      'Ж.Жаргал',    '99100014', 14, 'confirmed') returning id into vb14;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_volleyball, 'Булган аймаг',       'Л.Лхагвасүрэн','99100015', 15, 'confirmed') returning id into vb15;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_volleyball, 'Сүхбаатар аймаг',   'Т.Түвшинбаяр','99100016', 16, 'confirmed') returning id into vb16;

-- VOLLEYBALL MATCHES Round 1
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_volleyball, vb1, vb16, 1, 1, '2026-05-10 09:30+08', 'completed', 3, 0, vb1, 'VB-J01');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_volleyball, vb8, vb9,  1, 2, '2026-05-10 11:30+08', 'completed', 2, 3, vb9, 'VB-J02');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_volleyball, vb5, vb12, 1, 3, '2026-05-10 13:30+08', 'completed', 3, 1, vb5, 'VB-J03');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_volleyball, vb4, vb13, 1, 4, '2026-05-10 15:30+08', 'completed', 3, 2, vb4, 'VB-J04');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_volleyball, vb6, vb11, 1, 5, '2026-05-11 09:30+08', 'completed', 1, 3, vb11,'VB-J05');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_volleyball, vb3, vb14, 1, 6, '2026-05-11 11:30+08', 'completed', 3, 0, vb3, 'VB-J06');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_volleyball, vb7, vb10, 1, 7, '2026-05-11 13:30+08', 'completed', 0, 3, vb10,'VB-J07');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_volleyball, vb2, vb15, 1, 8, '2026-05-11 15:30+08', 'completed', 3, 1, vb2, 'VB-J08');

-- Volleyball Round 2
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_volleyball, vb1, vb9,  2, 1, '2026-05-13 10:30+08', 'completed', 3, 1, vb1, 'VB-J09');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_volleyball, vb5, vb4,  2, 2, '2026-05-13 13:30+08', 'completed', 2, 3, vb4, 'VB-J10');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, judge_code)
values (t_id, s_volleyball, vb11, vb3, 2, 3, '2026-05-14 10:30+08', 'scheduled', 'VB-J11');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, judge_code)
values (t_id, s_volleyball, vb10, vb2, 2, 4, '2026-05-14 13:30+08', 'scheduled', 'VB-J12');

-- Volleyball SF & Final
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, judge_code)
values (t_id, s_volleyball, vb1, vb4, 3, 1, '2026-05-16 11:00+08', 'scheduled', 'VB-SF1');
insert into matches (tournament_id, sport_id, round, match_number, scheduled_at, status, judge_code)
values (t_id, s_volleyball, 3, 2, '2026-05-16 15:00+08', 'scheduled', 'VB-SF2');
insert into matches (tournament_id, sport_id, round, match_number, scheduled_at, status, judge_code)
values (t_id, s_volleyball, 4, 1, '2026-05-18 16:00+08', 'scheduled', 'VB-FINAL');

-- ============================================================
-- TEAMS — ДАРТС
-- ============================================================
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_darts, 'Дорнод аймаг',      'Б.Батжаргал',  '99200001', 1,  'confirmed') returning id into dt1;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_darts, 'Сүхбаатар аймаг',  'Г.Гантулга',   '99200002', 2,  'confirmed') returning id into dt2;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_darts, 'Хөвсгөл аймаг',    'Ж.Жамбалдорж', '99200003', 3,  'confirmed') returning id into dt3;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_darts, 'Архангай аймаг',   'Н.Нарантуяа',  '99200004', 4,  'confirmed') returning id into dt4;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_darts, 'Орхон аймаг',       'Т.Түвшин',     '99200005', 5,  'confirmed') returning id into dt5;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_darts, 'Баян-Өлгий аймаг', 'О.Орхан',      '99200006', 6,  'confirmed') returning id into dt6;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_darts, 'Говь-Алтай аймаг', 'Э.Энхтайван',  '99200007', 7,  'confirmed') returning id into dt7;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_darts, 'Төв аймаг',         'Ц.Цэцэгмаа',   '99200008', 8,  'confirmed') returning id into dt8;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_darts, 'Өмнөговь аймаг',   'Р.Рагчаа',     '99200009', 9,  'confirmed') returning id into dt9;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_darts, 'Дорноговь аймаг',  'А.Амарсайхан', '99200010', 10, 'confirmed') returning id into dt10;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_darts, 'Завхан аймаг',      'С.Сандаг',     '99200011', 11, 'confirmed') returning id into dt11;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_darts, 'Булган аймаг',      'Х.Халиун',     '99200012', 12, 'confirmed') returning id into dt12;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_darts, 'Өвөрхангай аймаг', 'Б.Баярмаа',    '99200013', 13, 'confirmed') returning id into dt13;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_darts, 'Дархан-Уул аймаг', 'Л.Лүндэнгарав','99200014', 14, 'confirmed') returning id into dt14;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_darts, 'Сэлэнгэ аймаг',    'М.Мөнхцэцэг',  '99200015', 15, 'confirmed') returning id into dt15;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_darts, 'Баянхонгор аймаг', 'Д.Даваасүрэн', '99200016', 16, 'confirmed') returning id into dt16;

-- DARTS MATCHES Round 1
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_darts, dt1, dt16, 1, 1, '2026-05-10 10:00+08', 'completed', 5, 2, dt1, 'DT-J01');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_darts, dt8, dt9,  1, 2, '2026-05-10 11:00+08', 'completed', 3, 5, dt9, 'DT-J02');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_darts, dt5, dt12, 1, 3, '2026-05-10 12:00+08', 'completed', 5, 4, dt5, 'DT-J03');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_darts, dt4, dt13, 1, 4, '2026-05-10 13:00+08', 'completed', 2, 5, dt13,'DT-J04');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_darts, dt6, dt11, 1, 5, '2026-05-11 10:00+08', 'completed', 5, 3, dt6, 'DT-J05');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_darts, dt3, dt14, 1, 6, '2026-05-11 11:00+08', 'completed', 5, 1, dt3, 'DT-J06');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_darts, dt7, dt10, 1, 7, '2026-05-11 12:00+08', 'completed', 4, 5, dt10,'DT-J07');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_darts, dt2, dt15, 1, 8, '2026-05-11 13:00+08', 'completed', 5, 0, dt2, 'DT-J08');

-- Darts Round 2
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_darts, dt1, dt9,  2, 1, '2026-05-13 10:00+08', 'completed', 5, 3, dt1, 'DT-J09');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_darts, dt5, dt13, 2, 2, '2026-05-13 12:00+08', 'completed', 4, 5, dt13,'DT-J10');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, judge_code)
values (t_id, s_darts, dt6, dt3,  2, 3, '2026-05-14 10:00+08', 'scheduled', 'DT-J11');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, judge_code)
values (t_id, s_darts, dt10, dt2, 2, 4, '2026-05-14 12:00+08', 'scheduled', 'DT-J12');

-- Darts SF & Final
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, judge_code)
values (t_id, s_darts, dt1, dt13, 3, 1, '2026-05-16 10:00+08', 'scheduled', 'DT-SF1');
insert into matches (tournament_id, sport_id, round, match_number, scheduled_at, status, judge_code)
values (t_id, s_darts, 3, 2, '2026-05-16 13:00+08', 'scheduled', 'DT-SF2');
insert into matches (tournament_id, sport_id, round, match_number, scheduled_at, status, judge_code)
values (t_id, s_darts, 4, 1, '2026-05-18 13:00+08', 'scheduled', 'DT-FINAL');

-- ============================================================
-- TEAMS — ШИРЭЭНИЙ ТЕННИС
-- ============================================================
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_tennis, 'Өвөрхангай аймаг',  'Б.Батчулуун',  '99300001', 1,  'confirmed') returning id into tt1;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_tennis, 'Булган аймаг',       'Г.Гэрэл',      '99300002', 2,  'confirmed') returning id into tt2;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_tennis, 'Дорноговь аймаг',   'Д.Дуламсүрэн', '99300003', 3,  'confirmed') returning id into tt3;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_tennis, 'Сэлэнгэ аймаг',     'Н.Нарандулам', '99300004', 4,  'confirmed') returning id into tt4;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_tennis, 'Баянхонгор аймаг',  'О.Оргил',      '99300005', 5,  'confirmed') returning id into tt5;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_tennis, 'Завхан аймаг',       'Т.Тамир',      '99300006', 6,  'confirmed') returning id into tt6;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_tennis, 'Дорнод аймаг',      'Э.Эрдэнэбулган','99300007', 7,  'confirmed') returning id into tt7;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_tennis, 'Архангай аймаг',    'М.Мөнх-Эрдэнэ','99300008', 8,  'confirmed') returning id into tt8;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_tennis, 'Хөвсгөл аймаг',     'С.Содном',     '99300009', 9,  'confirmed') returning id into tt9;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_tennis, 'Баян-Өлгий аймаг',  'Х.Хасанат',    '99300010', 10, 'confirmed') returning id into tt10;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_tennis, 'Говь-Алтай аймаг',  'Ж.Жанаргүл',   '99300011', 11, 'confirmed') returning id into tt11;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_tennis, 'Орхон аймаг',        'А.Алтанцэцэг', '99300012', 12, 'confirmed') returning id into tt12;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_tennis, 'Дархан-Уул аймаг',  'Р.Рэнчиндорж', '99300013', 13, 'confirmed') returning id into tt13;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_tennis, 'Өмнөговь аймаг',    'Ц.Цэдэв',      '99300014', 14, 'confirmed') returning id into tt14;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_tennis, 'Сүхбаатар аймаг',   'Л.Лхамсүрэн',  '99300015', 15, 'confirmed') returning id into tt15;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, s_tennis, 'Төв аймаг',          'Б.Баянмөнх',   '99300016', 16, 'confirmed') returning id into tt16;

-- TABLE TENNIS Round 1
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_tennis, tt1, tt16, 1, 1, '2026-05-10 10:00+08', 'completed', 4, 1, tt1, 'TT-J01');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_tennis, tt8, tt9,  1, 2, '2026-05-10 11:00+08', 'completed', 2, 4, tt9, 'TT-J02');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_tennis, tt5, tt12, 1, 3, '2026-05-10 12:00+08', 'completed', 4, 2, tt5, 'TT-J03');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_tennis, tt4, tt13, 1, 4, '2026-05-10 13:00+08', 'completed', 4, 3, tt4, 'TT-J04');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_tennis, tt6, tt11, 1, 5, '2026-05-11 10:00+08', 'completed', 1, 4, tt11,'TT-J05');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_tennis, tt3, tt14, 1, 6, '2026-05-11 11:00+08', 'completed', 4, 0, tt3, 'TT-J06');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_tennis, tt7, tt10, 1, 7, '2026-05-11 12:00+08', 'completed', 3, 4, tt10,'TT-J07');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_tennis, tt2, tt15, 1, 8, '2026-05-11 13:00+08', 'completed', 4, 1, tt2, 'TT-J08');

-- Table Tennis Round 2
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_tennis, tt1, tt9,  2, 1, '2026-05-13 10:00+08', 'completed', 4, 2, tt1, 'TT-J09');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, team1_score, team2_score, winner_id, judge_code)
values (t_id, s_tennis, tt5, tt4,  2, 2, '2026-05-13 12:00+08', 'completed', 3, 4, tt4, 'TT-J10');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, judge_code)
values (t_id, s_tennis, tt11, tt3, 2, 3, '2026-05-14 10:00+08', 'scheduled', 'TT-J11');
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, judge_code)
values (t_id, s_tennis, tt10, tt2, 2, 4, '2026-05-14 12:00+08', 'scheduled', 'TT-J12');

-- Table Tennis SF & Final
insert into matches (tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at, status, judge_code)
values (t_id, s_tennis, tt1, tt4, 3, 1, '2026-05-16 11:00+08', 'scheduled', 'TT-SF1');
insert into matches (tournament_id, sport_id, round, match_number, scheduled_at, status, judge_code)
values (t_id, s_tennis, 3, 2, '2026-05-16 14:00+08', 'scheduled', 'TT-SF2');
insert into matches (tournament_id, sport_id, round, match_number, scheduled_at, status, judge_code)
values (t_id, s_tennis, 4, 1, '2026-05-18 14:00+08', 'scheduled', 'TT-FINAL');

raise notice '✅ Seed амжилттай дууслаа! Tournament ID: %', t_id;

end $$;
