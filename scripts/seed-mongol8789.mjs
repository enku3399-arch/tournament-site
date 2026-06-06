/**
 * scripts/seed-mongol8789.mjs
 * Монгол 87/89 V Спорт Наадам 2026 — тэмцээн + спорт + 25 баг үүсгэх
 *
 * node scripts/seed-mongol8789.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lrbcnlpqiqhxsycjihug.supabase.co'
const SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyYmNubHBxaXFoeHN5Y2ppaHVnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzgxNzU4OSwiZXhwIjoyMDkzMzkzNTg5fQ.2NSFDn_fp20F-iqXvZYLYto490e8y7rIIAfzbCTajAk'

const sb = createClient(SUPABASE_URL, SERVICE_KEY)

const TOURNAMENT_ID = '0b05625d-2f6d-48de-b69c-d5a23c2f0e3f'

const TOURNAMENT = {
  id: TOURNAMENT_ID,
  name: 'Монгол 87/89 V Спорт Наадам 2026',
  location: 'Улаанбаатар',
  start_date: '2026-05-31',
  end_date: '2026-06-01',
  status: 'active',
  admin_code: 'MONGOL8789',
}

const SPORTS = [
  { id: '771904c0-f0c9-4b53-a631-f82cecfde598', name: 'Сагсан бөмбөг (Эрэгтэй)',  sport_type: 'basketball', gender: 'male',   judge_code: 'BASKET-M', groups_count: 4, advance_per_group: 2 },
  { id: '875a61c1-6c97-4dca-96a0-dd0bcf9b2cc3', name: 'Сагсан бөмбөг (Эмэгтэй)', sport_type: 'basketball', gender: 'female', judge_code: 'BASKET-F', groups_count: 4, advance_per_group: 2 },
  { id: '11a8b935-744d-4032-8280-6ef97ad5a9db', name: 'Волейбол (Эрэгтэй)',       sport_type: 'volleyball', gender: 'male',   judge_code: 'VOLLEY-M', groups_count: 4, advance_per_group: 2 },
  { id: '92dfbd70-204d-4293-985f-b2e49e35c526', name: 'Волейбол (Эмэгтэй)',      sport_type: 'volleyball', gender: 'female', judge_code: 'VOLLEY-F', groups_count: 4, advance_per_group: 2 },
  { id: '094da6e9-660d-4646-b149-7a4cbd8f55a0', name: 'Ширээний теннис',          sport_type: 'tennis',     gender: null,     judge_code: 'TENNIS',   groups_count: 4, advance_per_group: 2 },
  { id: 'b0b7ca49-82fb-440f-8e9a-19fdbf1f6d11', name: 'Дартс',                   sport_type: 'darts',      gender: null,     judge_code: 'DARTS',    groups_count: 4, advance_per_group: 2 },
  { id: '4b254cc4-16e9-430d-9bf2-0257178db95c', name: 'Шатар',                   sport_type: 'chess',      gender: null,     judge_code: 'CHESS',    groups_count: 4, advance_per_group: 2 },
]

// 21 аймаг + Багануур + Улаанбаатар + Ажилчин + Найрамдал = 25 баг
const TEAMS = [
  'Архангай', 'Баян-Өлгий', 'Баянхонгор', 'Булган', 'Говь-Алтай',
  'Говьсүмбэр', 'Дархан-Уул', 'Дорноговь', 'Дорнод', 'Дундговь',
  'Завхан', 'Орхон', 'Өвөрхангай', 'Өмнөговь', 'Сүхбаатар',
  'Сэлэнгэ', 'Төв', 'Увс', 'Ховд', 'Хөвсгөл', 'Хэнтий',
  'Багануур', 'Улаанбаатар', 'Ажилчин', 'Найрамдал',
]

async function seed() {
  console.log('='.repeat(60))
  console.log('Монгол 87/89 V Спорт Наадам 2026 — Seed')
  console.log('='.repeat(60))

  // ── 1. Тэмцээн ──────────────────────────────────────────────────────────────
  const { data: existing } = await sb
    .from('tournaments').select('id').eq('id', TOURNAMENT_ID).maybeSingle()

  if (existing) {
    console.log('⚠️  Тэмцээн аль хэдийн байна — багуудыг нэмэхгүй бол дахин ажиллуулна уу')
    console.log('   Устгаж дахин үүсгэж байна...')
    await sb.from('matches').delete().eq('tournament_id', TOURNAMENT_ID)
    const { data: gs } = await sb.from('groups').select('id').eq('tournament_id', TOURNAMENT_ID)
    if (gs?.length) await sb.from('group_teams').delete().in('group_id', gs.map(g => g.id))
    await sb.from('groups').delete().eq('tournament_id', TOURNAMENT_ID)
    await sb.from('teams').delete().eq('tournament_id', TOURNAMENT_ID)
    await sb.from('tournament_sports').delete().eq('tournament_id', TOURNAMENT_ID)
    await sb.from('tournaments').delete().eq('id', TOURNAMENT_ID)
    console.log('   ✅ Цэвэрлэлээ')
  }

  const { error: tErr } = await sb.from('tournaments').insert(TOURNAMENT)
  if (tErr) { console.error('❌ Тэмцээн үүсгэж чадсангүй:', tErr.message); process.exit(1) }
  console.log(`\n✅ Тэмцээн үүслээ: ${TOURNAMENT_ID}`)

  // ── 2. Спортууд ─────────────────────────────────────────────────────────────
  for (const s of SPORTS) {
    const { error } = await sb.from('tournament_sports').insert({
      id: s.id,
      tournament_id: TOURNAMENT_ID,
      name: s.name,
      sport_type: s.sport_type,
      gender: s.gender,
      format: 'groups_knockout',
      groups_count: s.groups_count,
      advance_per_group: s.advance_per_group,
      weight: 1,
    })
    if (error) { console.error(`❌ Спорт "${s.name}":`, error.message); continue }
    console.log(`   🏅 ${s.name} [${s.judge_code}]`)
  }

  // ── 3. 25 баг — спорт тус бүрд ──────────────────────────────────────────────
  console.log(`\n📋 25 баг бүх спортод нэмж байна...`)
  for (const s of SPORTS) {
    const rows = TEAMS.map((name, i) => ({
      tournament_id: TOURNAMENT_ID,
      sport_id: s.id,
      name,
      seed: i + 1,
      status: 'confirmed',
    }))
    const { error } = await sb.from('teams').insert(rows)
    if (error) { console.error(`   ❌ ${s.name} багууд:`, error.message) }
    else console.log(`   ✅ ${s.name}: ${rows.length} баг`)
  }

  // ── Хураангуй ────────────────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(60))
  console.log('🎉 Seed дууслаа!\n')
  console.log('📌 Чухал мэдээлэл:')
  console.log(`   Tournament ID : ${TOURNAMENT_ID}`)
  console.log(`   Admin код     : MONGOL8789`)
  console.log(`   Admin URL     : /admin/${TOURNAMENT_ID}`)
  console.log(`\n🔑 Шүүгчийн кодууд:`)
  SPORTS.forEach(s => console.log(`   ${s.judge_code.padEnd(10)} — ${s.name}`))
  console.log(`\n⚠️  Дараагийн алхам:`)
  console.log(`   Сугалааны үр дүнг admin-д оруулна:`)
  console.log(`   /admin/${TOURNAMENT_ID}/groups/<sportId>`)
}

seed().catch(err => { console.error('Fatal:', err); process.exit(1) })
