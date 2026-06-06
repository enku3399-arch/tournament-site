-- ============================================================
-- SEED V3: 6 спорт (сагс эр/эм, волей эр/эм, теннис, дартс)
-- 16 аймаг, 4 бүлэг тус бүрт — хэсгийн тоглолтыг
-- admin дээр "Хэсгийн тоглолт үүсгэх" дарж үүсгэнэ
-- ============================================================
DO $$
DECLARE
  v_tid  uuid;
  v_sid  uuid;
  v_gid  uuid;
  v_tmid uuid;
  i      int;
  g      int;

  aimags text[] := ARRAY[
    'Архангай аймаг','Баян-Өлгий аймаг','Баянхонгор аймаг','Булган аймаг',
    'Говь-Алтай аймаг','Дархан-Уул аймаг','Дорноговь аймаг','Дорнод аймаг',
    'Завхан аймаг','Орхон аймаг','Өмнөговь аймаг','Өвөрхангай аймаг',
    'Сэлэнгэ аймаг','Сүхбаатар аймаг','Төв аймаг','Хөвсгөл аймаг'
  ];
  grp_letters text[] := ARRAY['A','B','C','D'];

  -- 6 спортын тодорхойлолт
  sport_types  text[]    := ARRAY['basketball','basketball','volleyball','volleyball','table_tennis','darts'];
  sport_names  text[]    := ARRAY[
    'Сагсан бөмбөг (Эрэгтэй)',
    'Сагсан бөмбөг (Эмэгтэй)',
    'Волейбол (Эрэгтэй)',
    'Волейбол (Эмэгтэй)',
    'Ширээний теннис',
    'Дартс'
  ];
  sport_genders text[]   := ARRAY['male','female','male','female',NULL,NULL];
  sport_weights int[]    := ARRAY[2,2,2,2,1,1];

  -- temp arrays for group IDs and team IDs per sport
  gids  uuid[];
  tids  uuid[];
  s     int;

BEGIN
  -- ── 1. Тэмцээн ────────────────────────────────────────────
  SELECT id INTO v_tid FROM tournaments ORDER BY created_at LIMIT 1;
  IF v_tid IS NULL THEN
    INSERT INTO tournaments(name, status, admin_code)
    VALUES('Спортын тэмцээн 2026','active', substr(md5(random()::text),1,8))
    RETURNING id INTO v_tid;
  END IF;

  -- ── 2. Хуучин өгөгдлийг цэвэрлэх ─────────────────────────
  DELETE FROM matches WHERE tournament_id = v_tid;
  DELETE FROM group_teams
    WHERE group_id IN (SELECT id FROM groups WHERE tournament_id = v_tid);
  DELETE FROM groups WHERE tournament_id = v_tid;
  DELETE FROM teams  WHERE tournament_id = v_tid;
  DELETE FROM tournament_sports WHERE tournament_id = v_tid;

  -- ── 3. 6 спорт тус бүрт давтах ───────────────────────────
  FOR s IN 1..6 LOOP

    -- Спорт үүсгэх
    INSERT INTO tournament_sports(
      tournament_id, sport_type, name, gender, weight,
      format, groups_count, advance_per_group
    ) VALUES (
      v_tid,
      sport_types[s],
      sport_names[s],
      sport_genders[s],
      sport_weights[s],
      'groups_knockout', 4, 2
    ) RETURNING id INTO v_sid;

    -- 4 бүлэг үүсгэх
    gids := ARRAY[]::uuid[];
    FOR g IN 1..4 LOOP
      INSERT INTO groups(tournament_id, sport_id, name, advance_count)
      VALUES(v_tid, v_sid, grp_letters[g], 2)
      RETURNING id INTO v_gid;
      gids := gids || v_gid;
    END LOOP;

    -- 16 аймаг үүсгэх + бүлэгт хуваах
    -- Seed 1,5,9,13 → A | 2,6,10,14 → B | 3,7,11,15 → C | 4,8,12,16 → D
    tids := ARRAY[]::uuid[];
    FOR i IN 1..16 LOOP
      INSERT INTO teams(tournament_id, sport_id, name, seed, status)
      VALUES(v_tid, v_sid, aimags[i], i, 'confirmed')
      RETURNING id INTO v_tmid;
      tids := tids || v_tmid;
    END LOOP;

    -- Бүлэгт оруулах: (i-1) % 4 → бүлгийн индекс (0-based)
    FOR i IN 1..16 LOOP
      INSERT INTO group_teams(group_id, team_id)
      VALUES(gids[((i-1) % 4) + 1], tids[i]);
    END LOOP;

  END LOOP; -- end 6 sports

  RAISE NOTICE 'Done: tournament=%, 6 sports, 16 teams each, 4 groups each', v_tid;
END;
$$ LANGUAGE plpgsql;
