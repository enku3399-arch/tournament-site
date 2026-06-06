/**
 * scripts/setup-brackets-empty.mjs
 * 5 спортын нугалааны хоосон bracket үүсгэнэ (хэсгийн шат дуусаагүй үед)
 *
 * node scripts/setup-brackets-empty.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lrbcnlpqiqhxsycjihug.supabase.co'
const SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyYmNubHBxaXFoeHN5Y2ppaHVnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzgxNzU4OSwiZXhwIjoyMDkzMzkzNTg5fQ.2NSFDn_fp20F-iqXvZYLYto490e8y7rIIAfzbCTajAk'

const sb = createClient(SUPABASE_URL, SERVICE_KEY)
const TOURNAMENT_ID = '0b05625d-2f6d-48de-b69c-d5a23c2f0e3f'

const SPORTS = [
  { id: '771904c0-f0c9-4b53-a631-f82cecfde598', name: 'Сагсан бөмбөг (Эрэгтэй)',  jc: 'BASKET-M' },
  { id: '875a61c1-6c97-4dca-96a0-dd0bcf9b2cc3', name: 'Сагсан бөмбөг (Эмэгтэй)', jc: 'BASKET-F' },
  { id: '11a8b935-744d-4032-8280-6ef97ad5a9db', name: 'Волейбол (Эрэгтэй)',       jc: 'VOLLEY-M' },
  { id: '92dfbd70-204d-4293-985f-b2e49e35c526', name: 'Волейбол (Эмэгтэй)',      jc: 'VOLLEY-F' },
  { id: '094da6e9-660d-4646-b149-7a4cbd8f55a0', name: 'Ширээний теннис',          jc: 'TENNIS'   },
]

/**
 * 12-bagийн тусгай bracket бүтэц (бүх slot хоосон = TBD)
 *
 * Round 4: Эхний шат — A1vF2, B1vC2, C1vD2, D1vE2, E1vB2, F1vA2
 * Round 3: ¼ Финал   — QF1, QF2
 * Round 2: Хагас финал — SF1, SF2
 * Round 1: Финал
 * stage=third: 3-р байр
 */
function buildEmptyBracket(sportId, judgeCode) {
  const base = { tournament_id: TOURNAMENT_ID, sport_id: sportId, judge_code: judgeCode,
    team1_id: null, team2_id: null, team1_score: null, team2_score: null,
    winner_id: null, status: 'pending' }

  return [
    // R4 — Эхний шат (6 тоглолт)
    { ...base, stage: 'knockout', round: 4, match_number: 1 },
    { ...base, stage: 'knockout', round: 4, match_number: 2 },
    { ...base, stage: 'knockout', round: 4, match_number: 3 },
    { ...base, stage: 'knockout', round: 4, match_number: 4 },
    { ...base, stage: 'knockout', round: 4, match_number: 5 },
    { ...base, stage: 'knockout', round: 4, match_number: 6 },
    // R3 — ¼ Финал (2 тоглолт)
    { ...base, stage: 'knockout', round: 3, match_number: 1 },
    { ...base, stage: 'knockout', round: 3, match_number: 2 },
    // R2 — Хагас финал (2 тоглолт)
    { ...base, stage: 'knockout', round: 2, match_number: 1 },
    { ...base, stage: 'knockout', round: 2, match_number: 2 },
    // R1 — Финал
    { ...base, stage: 'knockout', round: 1, match_number: 1 },
    // 3-р байр
    { ...base, stage: 'third', round: 0, match_number: 1 },
  ]
}

async function main() {
  console.log('='.repeat(60))
  console.log('Нугалааны хоосон bracket үүсгэж байна...')
  console.log('='.repeat(60))

  for (const sport of SPORTS) {
    // Одоогийн knockout match-уудыг устгана
    await sb.from('matches').delete()
      .eq('sport_id', sport.id)
      .in('stage', ['knockout', 'third'])

    const rows = buildEmptyBracket(sport.id, sport.jc)
    const { error } = await sb.from('matches').insert(rows)

    if (error) {
      console.error(`❌ ${sport.name}: ${error.message}`)
    } else {
      console.log(`✅ ${sport.name} [${sport.jc}] — ${rows.length} bracket match үүслээ`)
    }
  }

  console.log('\n✅ Бүгд дууслаа!')
  console.log('Нийтийн /groups хуудсанд хоосон bracket харагдана.')
  console.log('Хэсгийн шат дуусаад judge portal → ⟁ товч дарж нэрсийг оруулна.')
}

main().catch(e => { console.error(e); process.exit(1) })
