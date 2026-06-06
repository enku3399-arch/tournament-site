-- ============================================================
-- SEED V2 — Group stage + Knockout format
-- schema-v2.sql ажиллуулсны дараа энийг ажиллуулна
-- ============================================================

do $$
declare
  t_id uuid;
  sp_bb uuid; sp_vb uuid; sp_dt uuid; sp_tt uuid;

  -- Basketball teams (16 aimag)
  bb1 uuid; bb2 uuid; bb3 uuid; bb4 uuid;
  bb5 uuid; bb6 uuid; bb7 uuid; bb8 uuid;
  bb9 uuid; bb10 uuid; bb11 uuid; bb12 uuid;
  bb13 uuid; bb14 uuid; bb15 uuid; bb16 uuid;

  -- Volleyball teams
  vb1 uuid; vb2 uuid; vb3 uuid; vb4 uuid;
  vb5 uuid; vb6 uuid; vb7 uuid; vb8 uuid;
  vb9 uuid; vb10 uuid; vb11 uuid; vb12 uuid;
  vb13 uuid; vb14 uuid; vb15 uuid; vb16 uuid;

  -- Darts teams
  dt1 uuid; dt2 uuid; dt3 uuid; dt4 uuid;
  dt5 uuid; dt6 uuid; dt7 uuid; dt8 uuid;
  dt9 uuid; dt10 uuid; dt11 uuid; dt12 uuid;
  dt13 uuid; dt14 uuid; dt15 uuid; dt16 uuid;

  -- Table tennis teams
  tt1 uuid; tt2 uuid; tt3 uuid; tt4 uuid;
  tt5 uuid; tt6 uuid; tt7 uuid; tt8 uuid;
  tt9 uuid; tt10 uuid; tt11 uuid; tt12 uuid;
  tt13 uuid; tt14 uuid; tt15 uuid; tt16 uuid;

  -- Basketball groups
  gba uuid; gbb uuid; gbc uuid; gbd uuid;
  -- Volleyball groups
  gva uuid; gvb uuid; gvc uuid; gvd uuid;
  -- Darts groups
  gda uuid; gdb uuid; gdc uuid; gdd uuid;
  -- Table tennis groups
  gta uuid; gtb uuid; gtc uuid; gtd uuid;

begin

-- ────────────────────────────────────────────────────────────
-- УСТГАХ
-- ────────────────────────────────────────────────────────────
delete from matches where true;
delete from group_teams where true;
delete from groups where true;
delete from teams where true;
delete from tournament_sports where true;
delete from tournaments where true;

-- ────────────────────────────────────────────────────────────
-- ТЭМЦЭЭН
-- ────────────────────────────────────────────────────────────
insert into tournaments (name, description, location, start_date, end_date,
  organizer_name, organizer_phone, prize_info, rules, status, admin_code)
values (
  '2026 Хаврын Спортын Их Тэмцээн',
  'Монгол улсын 16 аймгийн баг тамирчид оролцсон хаврын их тэмцээн. Хэсгийн болон нугалааны системтэй.',
  'Улаанбаатар, Хан-Уул дүүрэг, Спортын цогцолбор',
  '2026-05-10', '2026-05-22',
  'Монголын Спортын Холбоо', '99001122',
  '🥇 1-р байр: ₮5,000,000 | 🥈 2-р байр: ₮3,000,000 | 🥉 3-р байр: ₮1,500,000',
  '16 аймгаас нэг баг/тамирчин. 4 хэсэг бүр 4 баг. Хэсэг бүрээс дээд 2 баг нугалааруу гарна. Шууд хасах системтэй финал.',
  'active', 'ADMIN2026'
) returning id into t_id;

-- ────────────────────────────────────────────────────────────
-- СПОРТУУД (groups_knockout format)
-- ────────────────────────────────────────────────────────────
insert into tournament_sports (tournament_id, sport_type, name, weight, format, groups_count, advance_per_group)
values (t_id, 'basketball',   'Сагсан бөмбөг',   3, 'groups_knockout', 4, 2) returning id into sp_bb;
insert into tournament_sports (tournament_id, sport_type, name, weight, format, groups_count, advance_per_group)
values (t_id, 'volleyball',   'Волейбол',        3, 'groups_knockout', 4, 2) returning id into sp_vb;
insert into tournament_sports (tournament_id, sport_type, name, weight, format, groups_count, advance_per_group)
values (t_id, 'darts',        'Дартс',           2, 'groups_knockout', 4, 2) returning id into sp_dt;
insert into tournament_sports (tournament_id, sport_type, name, weight, format, groups_count, advance_per_group)
values (t_id, 'table_tennis', 'Ширээний теннис', 2, 'groups_knockout', 4, 2) returning id into sp_tt;

-- ────────────────────────────────────────────────────────────
-- САГСАН БӨМБӨГИЙН БАГУУД
-- ────────────────────────────────────────────────────────────
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_bb, 'Архангай аймаг',   'Б.Болд',       '99112233', 1,  'confirmed') returning id into bb1;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_bb, 'Баян-Өлгий аймаг', 'Н.Нурлан',     '99223344', 2,  'confirmed') returning id into bb2;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_bb, 'Баянхонгор аймаг', 'Д.Дорж',       '99334455', 3,  'confirmed') returning id into bb3;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_bb, 'Булган аймаг',      'Г.Ганбаяр',    '99445566', 4,  'confirmed') returning id into bb4;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_bb, 'Говь-Алтай аймаг', 'Э.Энхбаяр',    '99556677', 5,  'confirmed') returning id into bb5;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_bb, 'Дархан-Уул аймаг', 'О.Отгонбаяр',  '99667788', 6,  'confirmed') returning id into bb6;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_bb, 'Дорноговь аймаг',  'Т.Төмөр',      '99778899', 7,  'confirmed') returning id into bb7;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_bb, 'Дорнод аймаг',     'Б.Батмөнх',    '99889900', 8,  'confirmed') returning id into bb8;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_bb, 'Завхан аймаг',      'М.Мөнхбаяр',   '98112233', 9,  'confirmed') returning id into bb9;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_bb, 'Орхон аймаг',       'Х.Хүрэлбаатар','98223344', 10, 'confirmed') returning id into bb10;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_bb, 'Өмнөговь аймаг',   'Ж.Жавзан',     '98334455', 11, 'confirmed') returning id into bb11;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_bb, 'Өвөрхангай аймаг', 'С.Сүхбаатар',  '98445566', 12, 'confirmed') returning id into bb12;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_bb, 'Сэлэнгэ аймаг',    'Р.Рэнчин',     '98556677', 13, 'confirmed') returning id into bb13;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_bb, 'Сүхбаатар аймаг',  'А.Алтанцэцэг', '98667788', 14, 'confirmed') returning id into bb14;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_bb, 'Төв аймаг',         'Л.Лхагва',     '98778899', 15, 'confirmed') returning id into bb15;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_bb, 'Хөвсгөл аймаг',    'Ц.Цэрэндорж',  '98889900', 16, 'confirmed') returning id into bb16;

-- BASKETBALL GROUPS
insert into groups (tournament_id, sport_id, name, advance_count) values (t_id, sp_bb, 'A', 2) returning id into gba;
insert into groups (tournament_id, sport_id, name, advance_count) values (t_id, sp_bb, 'B', 2) returning id into gbb;
insert into groups (tournament_id, sport_id, name, advance_count) values (t_id, sp_bb, 'C', 2) returning id into gbc;
insert into groups (tournament_id, sport_id, name, advance_count) values (t_id, sp_bb, 'D', 2) returning id into gbd;

insert into group_teams (group_id, team_id) values (gba,bb1),(gba,bb2),(gba,bb3),(gba,bb4);
insert into group_teams (group_id, team_id) values (gbb,bb5),(gbb,bb6),(gbb,bb7),(gbb,bb8);
insert into group_teams (group_id, team_id) values (gbc,bb9),(gbc,bb10),(gbc,bb11),(gbc,bb12);
insert into group_teams (group_id, team_id) values (gbd,bb13),(gbd,bb14),(gbd,bb15),(gbd,bb16);

-- BASKETBALL GROUP MATCHES
-- Хэсэг A
insert into matches (tournament_id,sport_id,team1_id,team2_id,round,match_number,scheduled_at,status,team1_score,team2_score,winner_id,stage,group_id,judge_code) values
  (t_id,sp_bb,bb1,bb4,1,1,'2026-05-10 09:00+08','completed',78,65,bb1,'group',gba,'BB-A-R1M1'),
  (t_id,sp_bb,bb2,bb3,1,2,'2026-05-10 11:00+08','completed',71,80,bb3,'group',gba,'BB-A-R1M2'),
  (t_id,sp_bb,bb1,bb3,2,1,'2026-05-12 09:00+08','completed',85,72,bb1,'group',gba,'BB-A-R2M1'),
  (t_id,sp_bb,bb2,bb4,2,2,'2026-05-12 11:00+08','completed',68,90,bb4,'group',gba,'BB-A-R2M2'),
  (t_id,sp_bb,bb1,bb2,3,1,'2026-05-14 09:00+08','scheduled',null,null,null,'group',gba,'BB-A-R3M1'),
  (t_id,sp_bb,bb3,bb4,3,2,'2026-05-14 11:00+08','scheduled',null,null,null,'group',gba,'BB-A-R3M2');
-- Хэсэг B
insert into matches (tournament_id,sport_id,team1_id,team2_id,round,match_number,scheduled_at,status,team1_score,team2_score,winner_id,stage,group_id,judge_code) values
  (t_id,sp_bb,bb5,bb8,1,3,'2026-05-10 13:00+08','completed',82,74,bb5,'group',gbb,'BB-B-R1M1'),
  (t_id,sp_bb,bb6,bb7,1,4,'2026-05-10 15:00+08','completed',91,79,bb6,'group',gbb,'BB-B-R1M2'),
  (t_id,sp_bb,bb5,bb7,2,3,'2026-05-12 13:00+08','completed',88,61,bb5,'group',gbb,'BB-B-R2M1'),
  (t_id,sp_bb,bb6,bb8,2,4,'2026-05-12 15:00+08','completed',77,85,bb8,'group',gbb,'BB-B-R2M2'),
  (t_id,sp_bb,bb5,bb6,3,3,'2026-05-14 13:00+08','scheduled',null,null,null,'group',gbb,'BB-B-R3M1'),
  (t_id,sp_bb,bb7,bb8,3,4,'2026-05-14 15:00+08','scheduled',null,null,null,'group',gbb,'BB-B-R3M2');
-- Хэсэг C
insert into matches (tournament_id,sport_id,team1_id,team2_id,round,match_number,scheduled_at,status,team1_score,team2_score,winner_id,stage,group_id,judge_code) values
  (t_id,sp_bb,bb9,bb12,1,5,'2026-05-11 09:00+08','completed',70,83,bb12,'group',gbc,'BB-C-R1M1'),
  (t_id,sp_bb,bb10,bb11,1,6,'2026-05-11 11:00+08','completed',88,75,bb10,'group',gbc,'BB-C-R1M2'),
  (t_id,sp_bb,bb9,bb11,2,5,'2026-05-13 09:00+08','completed',77,69,bb9,'group',gbc,'BB-C-R2M1'),
  (t_id,sp_bb,bb10,bb12,2,6,'2026-05-13 11:00+08','completed',91,88,bb10,'group',gbc,'BB-C-R2M2'),
  (t_id,sp_bb,bb9,bb10,3,5,'2026-05-15 09:00+08','scheduled',null,null,null,'group',gbc,'BB-C-R3M1'),
  (t_id,sp_bb,bb11,bb12,3,6,'2026-05-15 11:00+08','scheduled',null,null,null,'group',gbc,'BB-C-R3M2');
-- Хэсэг D
insert into matches (tournament_id,sport_id,team1_id,team2_id,round,match_number,scheduled_at,status,team1_score,team2_score,winner_id,stage,group_id,judge_code) values
  (t_id,sp_bb,bb13,bb16,1,7,'2026-05-11 13:00+08','completed',86,74,bb13,'group',gbd,'BB-D-R1M1'),
  (t_id,sp_bb,bb14,bb15,1,8,'2026-05-11 15:00+08','completed',79,84,bb15,'group',gbd,'BB-D-R1M2'),
  (t_id,sp_bb,bb13,bb15,2,7,'2026-05-13 13:00+08','completed',92,81,bb13,'group',gbd,'BB-D-R2M1'),
  (t_id,sp_bb,bb14,bb16,2,8,'2026-05-13 15:00+08','completed',68,77,bb16,'group',gbd,'BB-D-R2M2'),
  (t_id,sp_bb,bb13,bb14,3,7,'2026-05-15 13:00+08','scheduled',null,null,null,'group',gbd,'BB-D-R3M1'),
  (t_id,sp_bb,bb15,bb16,3,8,'2026-05-15 15:00+08','scheduled',null,null,null,'group',gbd,'BB-D-R3M2');

-- BASKETBALL KNOCKOUT (8 teams → QF → SF → Final)
-- QF: A1 vs D2, B1 vs C2, C1 vs B2, D1 vs A2
insert into matches (tournament_id,sport_id,team1_id,team2_id,round,match_number,scheduled_at,status,stage,judge_code) values
  (t_id,sp_bb,bb1,bb15,1,1,'2026-05-17 09:00+08','scheduled','knockout','BB-QF1'),
  (t_id,sp_bb,bb5,bb12,1,2,'2026-05-17 11:00+08','scheduled','knockout','BB-QF2'),
  (t_id,sp_bb,bb10,bb8,1,3,'2026-05-17 13:00+08','scheduled','knockout','BB-QF3'),
  (t_id,sp_bb,bb13,bb3,1,4,'2026-05-17 15:00+08','scheduled','knockout','BB-QF4');
insert into matches (tournament_id,sport_id,round,match_number,scheduled_at,status,stage,judge_code) values
  (t_id,sp_bb,2,1,'2026-05-19 10:00+08','scheduled','knockout','BB-SF1'),
  (t_id,sp_bb,2,2,'2026-05-19 14:00+08','scheduled','knockout','BB-SF2');
insert into matches (tournament_id,sport_id,round,match_number,scheduled_at,status,stage,judge_code) values
  (t_id,sp_bb,3,1,'2026-05-22 15:00+08','scheduled','knockout','BB-FINAL');

-- ────────────────────────────────────────────────────────────
-- ВОЛЕЙБОЛЫН БАГУУД
-- ────────────────────────────────────────────────────────────
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_vb, 'Хөвсгөл аймаг',    'Б.Батсүх',      '99100001', 1,  'confirmed') returning id into vb1;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_vb, 'Сэлэнгэ аймаг',    'Д.Дэлгэр',      '99100002', 2,  'confirmed') returning id into vb2;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_vb, 'Орхон аймаг',       'Г.Ганзориг',    '99100003', 3,  'confirmed') returning id into vb3;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_vb, 'Дархан-Уул аймаг', 'М.Мөнхзул',     '99100004', 4,  'confirmed') returning id into vb4;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_vb, 'Төв аймаг',         'О.Оюун',        '99100005', 5,  'confirmed') returning id into vb5;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_vb, 'Архангай аймаг',   'Э.Эрдэнэ',      '99100006', 6,  'confirmed') returning id into vb6;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_vb, 'Өвөрхангай аймаг', 'Ц.Цогт',        '99100007', 7,  'confirmed') returning id into vb7;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_vb, 'Баянхонгор аймаг', 'Х.Хишигт',      '99100008', 8,  'confirmed') returning id into vb8;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_vb, 'Завхан аймаг',      'Н.Наранцэцэг',  '99100009', 9,  'confirmed') returning id into vb9;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_vb, 'Говь-Алтай аймаг', 'Б.Буянтогтох',  '99100010', 10, 'confirmed') returning id into vb10;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_vb, 'Баян-Өлгий аймаг', 'А.Алтай',       '99100011', 11, 'confirmed') returning id into vb11;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_vb, 'Өмнөговь аймаг',   'С.Сарнай',      '99100012', 12, 'confirmed') returning id into vb12;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_vb, 'Дорноговь аймаг',  'Р.Рэгзэдмаа',   '99100013', 13, 'confirmed') returning id into vb13;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_vb, 'Дорнод аймаг',     'Ж.Жаргал',      '99100014', 14, 'confirmed') returning id into vb14;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_vb, 'Булган аймаг',      'Л.Лхагвасүрэн', '99100015', 15, 'confirmed') returning id into vb15;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_vb, 'Сүхбаатар аймаг',  'Т.Түвшинбаяр',  '99100016', 16, 'confirmed') returning id into vb16;

-- VOLLEYBALL GROUPS
insert into groups (tournament_id, sport_id, name, advance_count) values (t_id, sp_vb, 'A', 2) returning id into gva;
insert into groups (tournament_id, sport_id, name, advance_count) values (t_id, sp_vb, 'B', 2) returning id into gvb;
insert into groups (tournament_id, sport_id, name, advance_count) values (t_id, sp_vb, 'C', 2) returning id into gvc;
insert into groups (tournament_id, sport_id, name, advance_count) values (t_id, sp_vb, 'D', 2) returning id into gvd;

insert into group_teams (group_id, team_id) values (gva,vb1),(gva,vb2),(gva,vb3),(gva,vb4);
insert into group_teams (group_id, team_id) values (gvb,vb5),(gvb,vb6),(gvb,vb7),(gvb,vb8);
insert into group_teams (group_id, team_id) values (gvc,vb9),(gvc,vb10),(gvc,vb11),(gvc,vb12);
insert into group_teams (group_id, team_id) values (gvd,vb13),(gvd,vb14),(gvd,vb15),(gvd,vb16);

-- VOLLEYBALL GROUP MATCHES (sets)
-- Хэсэг A
insert into matches (tournament_id,sport_id,team1_id,team2_id,round,match_number,scheduled_at,status,team1_score,team2_score,winner_id,stage,group_id,judge_code) values
  (t_id,sp_vb,vb1,vb4,1,1,'2026-05-10 09:30+08','completed',3,0,vb1,'group',gva,'VB-A-R1M1'),
  (t_id,sp_vb,vb2,vb3,1,2,'2026-05-10 11:30+08','completed',2,3,vb3,'group',gva,'VB-A-R1M2'),
  (t_id,sp_vb,vb1,vb3,2,1,'2026-05-12 09:30+08','completed',3,1,vb1,'group',gva,'VB-A-R2M1'),
  (t_id,sp_vb,vb2,vb4,2,2,'2026-05-12 11:30+08','completed',1,3,vb4,'group',gva,'VB-A-R2M2'),
  (t_id,sp_vb,vb1,vb2,3,1,'2026-05-14 09:30+08','scheduled',null,null,null,'group',gva,'VB-A-R3M1'),
  (t_id,sp_vb,vb3,vb4,3,2,'2026-05-14 11:30+08','scheduled',null,null,null,'group',gva,'VB-A-R3M2');
-- Хэсэг B
insert into matches (tournament_id,sport_id,team1_id,team2_id,round,match_number,scheduled_at,status,team1_score,team2_score,winner_id,stage,group_id,judge_code) values
  (t_id,sp_vb,vb5,vb8,1,3,'2026-05-10 13:30+08','completed',3,1,vb5,'group',gvb,'VB-B-R1M1'),
  (t_id,sp_vb,vb6,vb7,1,4,'2026-05-10 15:30+08','completed',0,3,vb7,'group',gvb,'VB-B-R1M2'),
  (t_id,sp_vb,vb5,vb7,2,3,'2026-05-12 13:30+08','completed',3,2,vb5,'group',gvb,'VB-B-R2M1'),
  (t_id,sp_vb,vb6,vb8,2,4,'2026-05-12 15:30+08','completed',3,0,vb6,'group',gvb,'VB-B-R2M2'),
  (t_id,sp_vb,vb5,vb6,3,3,'2026-05-14 13:30+08','scheduled',null,null,null,'group',gvb,'VB-B-R3M1'),
  (t_id,sp_vb,vb7,vb8,3,4,'2026-05-14 15:30+08','scheduled',null,null,null,'group',gvb,'VB-B-R3M2');
-- Хэсэг C
insert into matches (tournament_id,sport_id,team1_id,team2_id,round,match_number,scheduled_at,status,team1_score,team2_score,winner_id,stage,group_id,judge_code) values
  (t_id,sp_vb,vb9,vb12,1,5,'2026-05-11 09:30+08','completed',1,3,vb12,'group',gvc,'VB-C-R1M1'),
  (t_id,sp_vb,vb10,vb11,1,6,'2026-05-11 11:30+08','completed',3,0,vb10,'group',gvc,'VB-C-R1M2'),
  (t_id,sp_vb,vb9,vb11,2,5,'2026-05-13 09:30+08','completed',3,1,vb9,'group',gvc,'VB-C-R2M1'),
  (t_id,sp_vb,vb10,vb12,2,6,'2026-05-13 11:30+08','completed',3,2,vb10,'group',gvc,'VB-C-R2M2'),
  (t_id,sp_vb,vb9,vb10,3,5,'2026-05-15 09:30+08','scheduled',null,null,null,'group',gvc,'VB-C-R3M1'),
  (t_id,sp_vb,vb11,vb12,3,6,'2026-05-15 11:30+08','scheduled',null,null,null,'group',gvc,'VB-C-R3M2');
-- Хэсэг D
insert into matches (tournament_id,sport_id,team1_id,team2_id,round,match_number,scheduled_at,status,team1_score,team2_score,winner_id,stage,group_id,judge_code) values
  (t_id,sp_vb,vb13,vb16,1,7,'2026-05-11 13:30+08','completed',3,0,vb13,'group',gvd,'VB-D-R1M1'),
  (t_id,sp_vb,vb14,vb15,1,8,'2026-05-11 15:30+08','completed',2,3,vb15,'group',gvd,'VB-D-R1M2'),
  (t_id,sp_vb,vb13,vb15,2,7,'2026-05-13 13:30+08','completed',3,1,vb13,'group',gvd,'VB-D-R2M1'),
  (t_id,sp_vb,vb14,vb16,2,8,'2026-05-13 15:30+08','completed',0,3,vb16,'group',gvd,'VB-D-R2M2'),
  (t_id,sp_vb,vb13,vb14,3,7,'2026-05-15 13:30+08','scheduled',null,null,null,'group',gvd,'VB-D-R3M1'),
  (t_id,sp_vb,vb15,vb16,3,8,'2026-05-15 15:30+08','scheduled',null,null,null,'group',gvd,'VB-D-R3M2');

-- VOLLEYBALL KNOCKOUT
insert into matches (tournament_id,sport_id,team1_id,team2_id,round,match_number,scheduled_at,status,stage,judge_code) values
  (t_id,sp_vb,vb1,vb15,1,1,'2026-05-17 10:00+08','scheduled','knockout','VB-QF1'),
  (t_id,sp_vb,vb5,vb10,1,2,'2026-05-17 12:00+08','scheduled','knockout','VB-QF2'),
  (t_id,sp_vb,vb9,vb6, 1,3,'2026-05-17 14:00+08','scheduled','knockout','VB-QF3'),
  (t_id,sp_vb,vb13,vb3,1,4,'2026-05-17 16:00+08','scheduled','knockout','VB-QF4');
insert into matches (tournament_id,sport_id,round,match_number,scheduled_at,status,stage,judge_code) values
  (t_id,sp_vb,2,1,'2026-05-19 11:00+08','scheduled','knockout','VB-SF1'),
  (t_id,sp_vb,2,2,'2026-05-19 15:00+08','scheduled','knockout','VB-SF2');
insert into matches (tournament_id,sport_id,round,match_number,scheduled_at,status,stage,judge_code) values
  (t_id,sp_vb,3,1,'2026-05-22 16:00+08','scheduled','knockout','VB-FINAL');

-- ────────────────────────────────────────────────────────────
-- ДАРТСЫН БАГУУД
-- ────────────────────────────────────────────────────────────
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_dt, 'Дорнод аймаг',     'Б.Батжаргал',   '99200001', 1,  'confirmed') returning id into dt1;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_dt, 'Сүхбаатар аймаг',  'Г.Гантулга',    '99200002', 2,  'confirmed') returning id into dt2;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_dt, 'Хөвсгөл аймаг',    'Ж.Жамбалдорж',  '99200003', 3,  'confirmed') returning id into dt3;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_dt, 'Архангай аймаг',   'Н.Нарантуяа',   '99200004', 4,  'confirmed') returning id into dt4;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_dt, 'Орхон аймаг',       'Т.Түвшин',      '99200005', 5,  'confirmed') returning id into dt5;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_dt, 'Баян-Өлгий аймаг', 'О.Орхан',       '99200006', 6,  'confirmed') returning id into dt6;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_dt, 'Говь-Алтай аймаг', 'Э.Энхтайван',   '99200007', 7,  'confirmed') returning id into dt7;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_dt, 'Төв аймаг',         'Ц.Цэцэгмаа',    '99200008', 8,  'confirmed') returning id into dt8;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_dt, 'Өмнөговь аймаг',   'Р.Рагчаа',      '99200009', 9,  'confirmed') returning id into dt9;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_dt, 'Дорноговь аймаг',  'А.Амарсайхан',  '99200010', 10, 'confirmed') returning id into dt10;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_dt, 'Завхан аймаг',      'С.Сандаг',      '99200011', 11, 'confirmed') returning id into dt11;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_dt, 'Булган аймаг',      'Х.Халиун',      '99200012', 12, 'confirmed') returning id into dt12;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_dt, 'Өвөрхангай аймаг', 'Б.Баярмаа',     '99200013', 13, 'confirmed') returning id into dt13;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_dt, 'Дархан-Уул аймаг', 'Л.Лүндэнгарав', '99200014', 14, 'confirmed') returning id into dt14;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_dt, 'Сэлэнгэ аймаг',    'М.Мөнхцэцэг',   '99200015', 15, 'confirmed') returning id into dt15;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_dt, 'Баянхонгор аймаг', 'Д.Даваасүрэн',  '99200016', 16, 'confirmed') returning id into dt16;

-- DARTS GROUPS
insert into groups (tournament_id, sport_id, name, advance_count) values (t_id, sp_dt, 'A', 2) returning id into gda;
insert into groups (tournament_id, sport_id, name, advance_count) values (t_id, sp_dt, 'B', 2) returning id into gdb;
insert into groups (tournament_id, sport_id, name, advance_count) values (t_id, sp_dt, 'C', 2) returning id into gdc;
insert into groups (tournament_id, sport_id, name, advance_count) values (t_id, sp_dt, 'D', 2) returning id into gdd;

insert into group_teams (group_id, team_id) values (gda,dt1),(gda,dt2),(gda,dt3),(gda,dt4);
insert into group_teams (group_id, team_id) values (gdb,dt5),(gdb,dt6),(gdb,dt7),(gdb,dt8);
insert into group_teams (group_id, team_id) values (gdc,dt9),(gdc,dt10),(gdc,dt11),(gdc,dt12);
insert into group_teams (group_id, team_id) values (gdd,dt13),(gdd,dt14),(gdd,dt15),(gdd,dt16);

-- DARTS GROUP MATCHES (legs)
insert into matches (tournament_id,sport_id,team1_id,team2_id,round,match_number,scheduled_at,status,team1_score,team2_score,winner_id,stage,group_id,judge_code) values
  (t_id,sp_dt,dt1,dt4,1,1,'2026-05-10 10:00+08','completed',5,2,dt1,'group',gda,'DT-A-R1M1'),
  (t_id,sp_dt,dt2,dt3,1,2,'2026-05-10 11:00+08','completed',3,5,dt3,'group',gda,'DT-A-R1M2'),
  (t_id,sp_dt,dt1,dt3,2,1,'2026-05-12 10:00+08','completed',5,4,dt1,'group',gda,'DT-A-R2M1'),
  (t_id,sp_dt,dt2,dt4,2,2,'2026-05-12 11:00+08','completed',2,5,dt4,'group',gda,'DT-A-R2M2'),
  (t_id,sp_dt,dt1,dt2,3,1,'2026-05-14 10:00+08','scheduled',null,null,null,'group',gda,'DT-A-R3M1'),
  (t_id,sp_dt,dt3,dt4,3,2,'2026-05-14 11:00+08','scheduled',null,null,null,'group',gda,'DT-A-R3M2');
insert into matches (tournament_id,sport_id,team1_id,team2_id,round,match_number,scheduled_at,status,team1_score,team2_score,winner_id,stage,group_id,judge_code) values
  (t_id,sp_dt,dt5,dt8,1,3,'2026-05-10 12:00+08','completed',5,3,dt5,'group',gdb,'DT-B-R1M1'),
  (t_id,sp_dt,dt6,dt7,1,4,'2026-05-10 13:00+08','completed',4,5,dt7,'group',gdb,'DT-B-R1M2'),
  (t_id,sp_dt,dt5,dt7,2,3,'2026-05-12 12:00+08','completed',5,1,dt5,'group',gdb,'DT-B-R2M1'),
  (t_id,sp_dt,dt6,dt8,2,4,'2026-05-12 13:00+08','completed',5,2,dt6,'group',gdb,'DT-B-R2M2'),
  (t_id,sp_dt,dt5,dt6,3,3,'2026-05-14 12:00+08','scheduled',null,null,null,'group',gdb,'DT-B-R3M1'),
  (t_id,sp_dt,dt7,dt8,3,4,'2026-05-14 13:00+08','scheduled',null,null,null,'group',gdb,'DT-B-R3M2');
insert into matches (tournament_id,sport_id,team1_id,team2_id,round,match_number,scheduled_at,status,team1_score,team2_score,winner_id,stage,group_id,judge_code) values
  (t_id,sp_dt,dt9,dt12,1,5,'2026-05-11 10:00+08','completed',3,5,dt12,'group',gdc,'DT-C-R1M1'),
  (t_id,sp_dt,dt10,dt11,1,6,'2026-05-11 11:00+08','completed',5,2,dt10,'group',gdc,'DT-C-R1M2'),
  (t_id,sp_dt,dt9,dt11,2,5,'2026-05-13 10:00+08','completed',5,4,dt9,'group',gdc,'DT-C-R2M1'),
  (t_id,sp_dt,dt10,dt12,2,6,'2026-05-13 11:00+08','completed',5,3,dt10,'group',gdc,'DT-C-R2M2'),
  (t_id,sp_dt,dt9,dt10,3,5,'2026-05-15 10:00+08','scheduled',null,null,null,'group',gdc,'DT-C-R3M1'),
  (t_id,sp_dt,dt11,dt12,3,6,'2026-05-15 11:00+08','scheduled',null,null,null,'group',gdc,'DT-C-R3M2');
insert into matches (tournament_id,sport_id,team1_id,team2_id,round,match_number,scheduled_at,status,team1_score,team2_score,winner_id,stage,group_id,judge_code) values
  (t_id,sp_dt,dt13,dt16,1,7,'2026-05-11 12:00+08','completed',5,1,dt13,'group',gdd,'DT-D-R1M1'),
  (t_id,sp_dt,dt14,dt15,1,8,'2026-05-11 13:00+08','completed',2,5,dt15,'group',gdd,'DT-D-R1M2'),
  (t_id,sp_dt,dt13,dt15,2,7,'2026-05-13 12:00+08','completed',5,3,dt13,'group',gdd,'DT-D-R2M1'),
  (t_id,sp_dt,dt14,dt16,2,8,'2026-05-13 13:00+08','completed',4,5,dt16,'group',gdd,'DT-D-R2M2'),
  (t_id,sp_dt,dt13,dt14,3,7,'2026-05-15 12:00+08','scheduled',null,null,null,'group',gdd,'DT-D-R3M1'),
  (t_id,sp_dt,dt15,dt16,3,8,'2026-05-15 13:00+08','scheduled',null,null,null,'group',gdd,'DT-D-R3M2');

-- DARTS KNOCKOUT
insert into matches (tournament_id,sport_id,team1_id,team2_id,round,match_number,scheduled_at,status,stage,judge_code) values
  (t_id,sp_dt,dt1,dt15,1,1,'2026-05-17 10:00+08','scheduled','knockout','DT-QF1'),
  (t_id,sp_dt,dt5,dt12,1,2,'2026-05-17 11:00+08','scheduled','knockout','DT-QF2'),
  (t_id,sp_dt,dt9,dt6, 1,3,'2026-05-17 12:00+08','scheduled','knockout','DT-QF3'),
  (t_id,sp_dt,dt13,dt4,1,4,'2026-05-17 13:00+08','scheduled','knockout','DT-QF4');
insert into matches (tournament_id,sport_id,round,match_number,scheduled_at,status,stage,judge_code) values
  (t_id,sp_dt,2,1,'2026-05-19 10:00+08','scheduled','knockout','DT-SF1'),
  (t_id,sp_dt,2,2,'2026-05-19 13:00+08','scheduled','knockout','DT-SF2');
insert into matches (tournament_id,sport_id,round,match_number,scheduled_at,status,stage,judge_code) values
  (t_id,sp_dt,3,1,'2026-05-22 13:00+08','scheduled','knockout','DT-FINAL');

-- ────────────────────────────────────────────────────────────
-- ШИРЭЭНИЙ ТЕННИСИЙН БАГУУД
-- ────────────────────────────────────────────────────────────
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_tt, 'Өвөрхангай аймаг', 'Б.Батчулуун',   '99300001', 1,  'confirmed') returning id into tt1;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_tt, 'Булган аймаг',      'Г.Гэрэл',       '99300002', 2,  'confirmed') returning id into tt2;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_tt, 'Дорноговь аймаг',  'Д.Дуламсүрэн',  '99300003', 3,  'confirmed') returning id into tt3;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_tt, 'Сэлэнгэ аймаг',    'Н.Нарандулам',  '99300004', 4,  'confirmed') returning id into tt4;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_tt, 'Баянхонгор аймаг', 'О.Оргил',       '99300005', 5,  'confirmed') returning id into tt5;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_tt, 'Завхан аймаг',      'Т.Тамир',       '99300006', 6,  'confirmed') returning id into tt6;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_tt, 'Дорнод аймаг',     'Э.Эрдэнэбулган','99300007', 7,  'confirmed') returning id into tt7;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_tt, 'Архангай аймаг',   'М.Мөнх-Эрдэнэ', '99300008', 8,  'confirmed') returning id into tt8;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_tt, 'Хөвсгөл аймаг',    'С.Содном',      '99300009', 9,  'confirmed') returning id into tt9;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_tt, 'Баян-Өлгий аймаг', 'Х.Хасанат',     '99300010', 10, 'confirmed') returning id into tt10;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_tt, 'Говь-Алтай аймаг', 'Ж.Жанаргүл',    '99300011', 11, 'confirmed') returning id into tt11;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_tt, 'Орхон аймаг',       'А.Алтанцэцэг',  '99300012', 12, 'confirmed') returning id into tt12;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_tt, 'Дархан-Уул аймаг', 'Р.Рэнчиндорж',  '99300013', 13, 'confirmed') returning id into tt13;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_tt, 'Өмнөговь аймаг',   'Ц.Цэдэв',       '99300014', 14, 'confirmed') returning id into tt14;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_tt, 'Сүхбаатар аймаг',  'Л.Лхамсүрэн',   '99300015', 15, 'confirmed') returning id into tt15;
insert into teams (tournament_id, sport_id, name, contact_name, contact_phone, seed, status) values (t_id, sp_tt, 'Төв аймаг',         'Б.Баянмөнх',    '99300016', 16, 'confirmed') returning id into tt16;

-- TABLE TENNIS GROUPS
insert into groups (tournament_id, sport_id, name, advance_count) values (t_id, sp_tt, 'A', 2) returning id into gta;
insert into groups (tournament_id, sport_id, name, advance_count) values (t_id, sp_tt, 'B', 2) returning id into gtb;
insert into groups (tournament_id, sport_id, name, advance_count) values (t_id, sp_tt, 'C', 2) returning id into gtc;
insert into groups (tournament_id, sport_id, name, advance_count) values (t_id, sp_tt, 'D', 2) returning id into gtd;

insert into group_teams (group_id, team_id) values (gta,tt1),(gta,tt2),(gta,tt3),(gta,tt4);
insert into group_teams (group_id, team_id) values (gtb,tt5),(gtb,tt6),(gtb,tt7),(gtb,tt8);
insert into group_teams (group_id, team_id) values (gtc,tt9),(gtc,tt10),(gtc,tt11),(gtc,tt12);
insert into group_teams (group_id, team_id) values (gtd,tt13),(gtd,tt14),(gtd,tt15),(gtd,tt16);

-- TABLE TENNIS GROUP MATCHES (games)
insert into matches (tournament_id,sport_id,team1_id,team2_id,round,match_number,scheduled_at,status,team1_score,team2_score,winner_id,stage,group_id,judge_code) values
  (t_id,sp_tt,tt1,tt4,1,1,'2026-05-10 10:00+08','completed',4,1,tt1,'group',gta,'TT-A-R1M1'),
  (t_id,sp_tt,tt2,tt3,1,2,'2026-05-10 11:00+08','completed',2,4,tt3,'group',gta,'TT-A-R1M2'),
  (t_id,sp_tt,tt1,tt3,2,1,'2026-05-12 10:00+08','completed',4,2,tt1,'group',gta,'TT-A-R2M1'),
  (t_id,sp_tt,tt2,tt4,2,2,'2026-05-12 11:00+08','completed',1,4,tt4,'group',gta,'TT-A-R2M2'),
  (t_id,sp_tt,tt1,tt2,3,1,'2026-05-14 10:00+08','scheduled',null,null,null,'group',gta,'TT-A-R3M1'),
  (t_id,sp_tt,tt3,tt4,3,2,'2026-05-14 11:00+08','scheduled',null,null,null,'group',gta,'TT-A-R3M2');
insert into matches (tournament_id,sport_id,team1_id,team2_id,round,match_number,scheduled_at,status,team1_score,team2_score,winner_id,stage,group_id,judge_code) values
  (t_id,sp_tt,tt5,tt8,1,3,'2026-05-10 12:00+08','completed',4,2,tt5,'group',gtb,'TT-B-R1M1'),
  (t_id,sp_tt,tt6,tt7,1,4,'2026-05-10 13:00+08','completed',1,4,tt7,'group',gtb,'TT-B-R1M2'),
  (t_id,sp_tt,tt5,tt7,2,3,'2026-05-12 12:00+08','completed',4,3,tt5,'group',gtb,'TT-B-R2M1'),
  (t_id,sp_tt,tt6,tt8,2,4,'2026-05-12 13:00+08','completed',4,1,tt6,'group',gtb,'TT-B-R2M2'),
  (t_id,sp_tt,tt5,tt6,3,3,'2026-05-14 12:00+08','scheduled',null,null,null,'group',gtb,'TT-B-R3M1'),
  (t_id,sp_tt,tt7,tt8,3,4,'2026-05-14 13:00+08','scheduled',null,null,null,'group',gtb,'TT-B-R3M2');
insert into matches (tournament_id,sport_id,team1_id,team2_id,round,match_number,scheduled_at,status,team1_score,team2_score,winner_id,stage,group_id,judge_code) values
  (t_id,sp_tt,tt9,tt12,1,5,'2026-05-11 10:00+08','completed',2,4,tt12,'group',gtc,'TT-C-R1M1'),
  (t_id,sp_tt,tt10,tt11,1,6,'2026-05-11 11:00+08','completed',4,1,tt10,'group',gtc,'TT-C-R1M2'),
  (t_id,sp_tt,tt9,tt11,2,5,'2026-05-13 10:00+08','completed',4,3,tt9,'group',gtc,'TT-C-R2M1'),
  (t_id,sp_tt,tt10,tt12,2,6,'2026-05-13 11:00+08','completed',4,2,tt10,'group',gtc,'TT-C-R2M2'),
  (t_id,sp_tt,tt9,tt10,3,5,'2026-05-15 10:00+08','scheduled',null,null,null,'group',gtc,'TT-C-R3M1'),
  (t_id,sp_tt,tt11,tt12,3,6,'2026-05-15 11:00+08','scheduled',null,null,null,'group',gtc,'TT-C-R3M2');
insert into matches (tournament_id,sport_id,team1_id,team2_id,round,match_number,scheduled_at,status,team1_score,team2_score,winner_id,stage,group_id,judge_code) values
  (t_id,sp_tt,tt13,tt16,1,7,'2026-05-11 12:00+08','completed',4,0,tt13,'group',gtd,'TT-D-R1M1'),
  (t_id,sp_tt,tt14,tt15,1,8,'2026-05-11 13:00+08','completed',1,4,tt15,'group',gtd,'TT-D-R1M2'),
  (t_id,sp_tt,tt13,tt15,2,7,'2026-05-13 12:00+08','completed',4,2,tt13,'group',gtd,'TT-D-R2M1'),
  (t_id,sp_tt,tt14,tt16,2,8,'2026-05-13 13:00+08','completed',3,4,tt16,'group',gtd,'TT-D-R2M2'),
  (t_id,sp_tt,tt13,tt14,3,7,'2026-05-15 12:00+08','scheduled',null,null,null,'group',gtd,'TT-D-R3M1'),
  (t_id,sp_tt,tt15,tt16,3,8,'2026-05-15 13:00+08','scheduled',null,null,null,'group',gtd,'TT-D-R3M2');

-- TABLE TENNIS KNOCKOUT
insert into matches (tournament_id,sport_id,team1_id,team2_id,round,match_number,scheduled_at,status,stage,judge_code) values
  (t_id,sp_tt,tt1,tt15,1,1,'2026-05-17 10:00+08','scheduled','knockout','TT-QF1'),
  (t_id,sp_tt,tt5,tt12,1,2,'2026-05-17 11:00+08','scheduled','knockout','TT-QF2'),
  (t_id,sp_tt,tt9,tt6, 1,3,'2026-05-17 12:00+08','scheduled','knockout','TT-QF3'),
  (t_id,sp_tt,tt13,tt3,1,4,'2026-05-17 13:00+08','scheduled','knockout','TT-QF4');
insert into matches (tournament_id,sport_id,round,match_number,scheduled_at,status,stage,judge_code) values
  (t_id,sp_tt,2,1,'2026-05-19 11:00+08','scheduled','knockout','TT-SF1'),
  (t_id,sp_tt,2,2,'2026-05-19 14:00+08','scheduled','knockout','TT-SF2');
insert into matches (tournament_id,sport_id,round,match_number,scheduled_at,status,stage,judge_code) values
  (t_id,sp_tt,3,1,'2026-05-22 14:00+08','scheduled','knockout','TT-FINAL');

raise notice '✅ Seed v2 амжилттай! Tournament: %', t_id;

end $$;
