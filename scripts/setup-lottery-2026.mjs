/**
 * scripts/setup-lottery-2026.mjs
 * 2026-06-01 сугалааны үр дүнг оруулна
 *
 * Хийх зүйл:
 *  1. Багийн нэрийг засна (Дархан-Уул→Дархан гэх мэт)
 *  2. 5 спортод хэсгүүд үүсгэж, round-robin тоглолт үүсгэнэ
 *  3. Дартс, Шатарыг орхино (тэр өглөө сугалаа хийнэ)
 *
 * node scripts/setup-lottery-2026.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lrbcnlpqiqhxsycjihug.supabase.co'
const SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyYmNubHBxaXFoeHN5Y2ppaHVnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzgxNzU4OSwiZXhwIjoyMDkzMzkzNTg5fQ.2NSFDn_fp20F-iqXvZYLYto490e8y7rIIAfzbCTajAk'

const sb = createClient(SUPABASE_URL, SERVICE_KEY)
const TOURNAMENT_ID = '0b05625d-2f6d-48de-b69c-d5a23c2f0e3f'

// ── 1. Багийн нэрийн засвар ───────────────────────────────────────────────────
const RENAMES = [
  { from: 'Дархан-Уул',    to: 'Дархан' },
  { from: 'Орхон',         to: 'Эрдэнэт' },
  { from: 'Сүхбаатар',    to: 'Сүхбаатар аймаг' },
  { from: 'Улаанбаатар',  to: 'Сүхбаатар дүүрэг' },
]

// ── 2. Сугалааны хэсгийн хуваарилалт ────────────────────────────────────────
const LOTTERY = [
  {
    sportId: '11a8b935-744d-4032-8280-6ef97ad5a9db',
    name: 'Волейбол (Эрэгтэй)',
    judgeCode: 'VOLLEY-M',
    advanceCount: 2,
    groups: {
      A: ['Сэлэнгэ', 'Увс', 'Ховд', 'Багануур'],
      B: ['Сүхбаатар аймаг', 'Архангай', 'Баянхонгор', 'Төв'],
      C: ['Завхан', 'Найрамдал', 'Өмнөговь', 'Дархан'],
      D: ['Дорноговь', 'Дундговь', 'Ажилчин', 'Булган'],
      E: ['Сүхбаатар дүүрэг', 'Хөвсгөл', 'Баян-Өлгий', 'Дорнод'],
      F: ['Эрдэнэт', 'Говь-Алтай', 'Хэнтий', 'Өвөрхангай'],
    },
  },
  {
    sportId: '92dfbd70-204d-4293-985f-b2e49e35c526',
    name: 'Волейбол (Эмэгтэй)',
    judgeCode: 'VOLLEY-F',
    advanceCount: 2,
    groups: {
      A: ['Дундговь', 'Сүхбаатар аймаг', 'Эрдэнэт', 'Увс'],
      B: ['Булган', 'Говь-Алтай', 'Ховд', 'Хэнтий'],
      C: ['Архангай', 'Сүхбаатар дүүрэг', 'Дорнод', 'Баянхонгор'],
      D: ['Ажилчин', 'Багануур', 'Дархан'],
      E: ['Хөвсгөл', 'Төв', 'Өмнөговь'],
      F: ['Дорноговь', 'Сэлэнгэ', 'Өвөрхангай', 'Завхан'],
    },
  },
  {
    sportId: '771904c0-f0c9-4b53-a631-f82cecfde598',
    name: 'Сагсан бөмбөг (Эрэгтэй)',
    judgeCode: 'BASKET-M',
    advanceCount: 2,
    groups: {
      A: ['Төв', 'Ховд', 'Баян-Өлгий', 'Дорноговь'],
      B: ['Хөвсгөл', 'Эрдэнэт', 'Дархан', 'Дундговь'],
      C: ['Булган', 'Дорнод', 'Сүхбаатар аймаг', 'Говь-Алтай'],
      D: ['Сэлэнгэ', 'Архангай', 'Завхан'],
      E: ['Сүхбаатар дүүрэг', 'Өвөрхангай', 'Увс', 'Баянхонгор'],
      F: ['Хэнтий', 'Ажилчин', 'Найрамдал', 'Өмнөговь'],
    },
  },
  {
    sportId: '875a61c1-6c97-4dca-96a0-dd0bcf9b2cc3',
    name: 'Сагсан бөмбөг (Эмэгтэй)',
    judgeCode: 'BASKET-F',
    advanceCount: 2,
    groups: {
      A: ['Эрдэнэт', 'Говь-Алтай', 'Өвөрхангай', 'Төв'],
      B: ['Архангай', 'Булган', 'Сүхбаатар дүүрэг', 'Завхан'],
      C: ['Хэнтий', 'Өмнөговь', 'Баянхонгор'],
      D: ['Дархан', 'Сүхбаатар аймаг', 'Дорнод'],
      E: ['Хөвсгөл', 'Увс', 'Дорноговь'],
      F: ['Ховд', 'Дундговь', 'Сэлэнгэ', 'Ажилчин'],
    },
  },
  {
    sportId: '094da6e9-660d-4646-b149-7a4cbd8f55a0',
    name: 'Ширээний теннис',
    judgeCode: 'TENNIS',
    advanceCount: 2,
    groups: {
      A: ['Сүхбаатар аймаг', 'Сүхбаатар дүүрэг', 'Багануур', 'Баянхонгор'],
      B: ['Хэнтий', 'Булган', 'Төв', 'Ховд'],
      C: ['Ажилчин', 'Найрамдал', 'Дорноговь', 'Эрдэнэт'],
      D: ['Баян-Өлгий', 'Увс', 'Дархан', 'Өвөрхангай'],
      E: ['Завхан', 'Дорнод', 'Дундговь', 'Хөвсгөл'],
      F: ['Сэлэнгэ', 'Өмнөговь', 'Архангай', 'Говь-Алтай'],
    },
  },
]

// ── Round-robin алгоритм ──────────────────────────────────────────────────────
function roundRobin(teamIds) {
  const teams = [...teamIds]
  if (teams.length % 2 !== 0) teams.push('BYE')
  const n = teams.length
  const rounds = []
  for (let r = 0; r < n - 1; r++) {
    const pairs = []
    for (let i = 0; i < n / 2; i++) {
      const a = teams[i], b = teams[n - 1 - i]
      if (a !== 'BYE' && b !== 'BYE') pairs.push([a, b])
    }
    rounds.push(pairs)
    teams.splice(1, 0, teams.pop())
  }
  return rounds
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('='.repeat(60))
  console.log('2026 Сугалааны хэсгийн тохиргоо')
  console.log('='.repeat(60))

  // Verify tournament
  const { data: t } = await sb.from('tournaments').select('id,name').eq('id', TOURNAMENT_ID).single()
  if (!t) { console.error('❌ Tournament олдсонгүй'); process.exit(1) }
  console.log(`✅ Tournament: ${t.name}\n`)

  // ── Step 1: Багийн нэрийг засна ────────────────────────────────────────────
  console.log('📝 Багийн нэр засч байна...')
  for (const { from, to } of RENAMES) {
    const { data: affected, error } = await sb
      .from('teams')
      .update({ name: to })
      .eq('tournament_id', TOURNAMENT_ID)
      .eq('name', from)
      .select('id')
    if (error) { console.error(`  ❌ ${from}: ${error.message}`); continue }
    if (affected?.length) console.log(`  ✏️  ${from} → ${to} (${affected.length} баг)`)
    else console.log(`  ⚠️  ${from} → олдсонгүй`)
  }

  // ── Step 2: Спорт тус бүр дэх хэсгийн тохиргоо ────────────────────────────
  for (const sport of LOTTERY) {
    console.log(`\n🏅 ${sport.name} [${sport.judgeCode}]`)

    // 2a. Одоогийн тоглолт, хэсгийг устгана
    await sb.from('matches').delete().eq('sport_id', sport.sportId)
    const { data: oldGroups } = await sb.from('groups').select('id').eq('sport_id', sport.sportId)
    if (oldGroups?.length) {
      await sb.from('group_teams').delete().in('group_id', oldGroups.map(g => g.id))
      await sb.from('groups').delete().in('id', oldGroups.map(g => g.id))
    }

    // 2b. groups_count шинэчилнэ
    const groupCount = Object.keys(sport.groups).length
    await sb.from('tournament_sports')
      .update({ groups_count: groupCount, advance_per_group: sport.advanceCount })
      .eq('id', sport.sportId)

    // 2c. Энэ спортын бүх багийг нэр → id map болгоно
    const { data: allTeams } = await sb.from('teams')
      .select('id, name')
      .eq('sport_id', sport.sportId)
    const teamMap = new Map((allTeams ?? []).map(t => [t.name.trim(), t.id]))

    let totalMatches = 0
    let matchNumber = 1

    for (const [letter, teamNames] of Object.entries(sport.groups)) {
      // Хэсэг үүсгэнэ
      const { data: group, error: gErr } = await sb.from('groups').insert({
        tournament_id: TOURNAMENT_ID,
        sport_id: sport.sportId,
        name: letter,
        advance_count: sport.advanceCount,
      }).select().single()
      if (gErr || !group) { console.error(`  ❌ Хэсэг ${letter}: ${gErr?.message}`); continue }

      // Багийн ID-уудыг lookup хийнэ
      const teamIds = []
      for (const name of teamNames) {
        const id = teamMap.get(name.trim())
        if (!id) { console.warn(`  ⚠️  Баг олдсонгүй: "${name}"`) ; continue }
        teamIds.push(id)
      }

      // group_teams нэмнэ
      if (teamIds.length > 0) {
        await sb.from('group_teams').insert(teamIds.map(tid => ({ group_id: group.id, team_id: tid })))
      }

      // Round-robin тоглолтуудыг үүсгэнэ
      const rounds = roundRobin(teamIds)
      const matchRows = []
      rounds.forEach((pairs, roundIdx) => {
        pairs.forEach(([t1, t2]) => {
          matchRows.push({
            tournament_id: TOURNAMENT_ID,
            sport_id: sport.sportId,
            stage: 'group',
            group_id: group.id,
            round: roundIdx + 1,
            match_number: matchNumber++,
            team1_id: t1,
            team2_id: t2,
            status: 'scheduled',
            judge_code: sport.judgeCode,
          })
        })
      })

      if (matchRows.length > 0) {
        const { error: mErr } = await sb.from('matches').insert(matchRows)
        if (mErr) console.error(`  ❌ Match insert (${letter}): ${mErr.message}`)
        else totalMatches += matchRows.length
      }

      console.log(`  Хэсэг ${letter}: ${teamIds.length} баг → ${matchRows.length} тоглолт`)
    }

    console.log(`  ✅ Нийт ${totalMatches} тоглолт | ${groupCount} хэсэг`)
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(60))
  console.log('🎉 Сугалааны тохиргоо дууслаа!\n')
  console.log('📌 Шүүгчийн кодууд:')
  LOTTERY.forEach(s => console.log(`   ${s.judgeCode.padEnd(10)} — ${s.name}`))
  console.log('\n⚠️  Дартс, Шатарын сугалааг өглөө хийнэ.')
  console.log('   node scripts/setup-lottery-2026.mjs --darts-chess гэж ажиллуулна.')
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
