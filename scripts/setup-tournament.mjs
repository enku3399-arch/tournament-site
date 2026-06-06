/**
 * scripts/setup-tournament.mjs
 * Монгол 87/89 V Спорт Наадам 2026 — бүх спортыг дахин тохируулах
 *
 * Хийх зүйлс:
 *  1. Дахилт болон pending team-г устгах
 *  2. Бүх спортын group + group_teams + matches-г устган дахин үүсгэх
 *  3. Сугалаагаар (random) group хуваарилах
 *  4. Round-robin хуваарь үүсгэх
 *  5. Judge code тохируулах
 *
 * node scripts/setup-tournament.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lrbcnlpqiqhxsycjihug.supabase.co'
const SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyYmNubHBxaXFoeHN5Y2ppaHVnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzgxNzU4OSwiZXhwIjoyMDkzMzkzNTg5fQ.2NSFDn_fp20F-iqXvZYLYto490e8y7rIIAfzbCTajAk'

const sb = createClient(SUPABASE_URL, SERVICE_KEY)

const TOURNAMENT_ID = '0b05625d-2f6d-48de-b69c-d5a23c2f0e3f'

// Sport ID-уудыг Supabase-аас авсан
const SPORTS = [
  {
    id: '771904c0-f0c9-4b53-a631-f82cecfde598',
    name: 'Сагсан бөмбөг (Эрэгтэй)',
    judgeCode: 'BASKET-M',
    groupCount: 4,
    advancePerGroup: 2,
  },
  {
    id: '875a61c1-6c97-4dca-96a0-dd0bcf9b2cc3',
    name: 'Сагсан бөмбөг (Эмэгтэй)',
    judgeCode: 'BASKET-F',
    groupCount: 4,
    advancePerGroup: 2,
  },
  {
    id: '11a8b935-744d-4032-8280-6ef97ad5a9db',
    name: 'Волейбол (Эрэгтэй)',
    judgeCode: 'VOLLEY-M',
    groupCount: 4,
    advancePerGroup: 2,
  },
  {
    id: '92dfbd70-204d-4293-985f-b2e49e35c526',
    name: 'Волейбол (Эмэгтэй)',
    judgeCode: 'VOLLEY-F',
    groupCount: 4,
    advancePerGroup: 2,
  },
  {
    id: '094da6e9-660d-4646-b149-7a4cbd8f55a0',
    name: 'Ширээний теннис',
    judgeCode: 'TENNIS',
    groupCount: 4,
    advancePerGroup: 2,
  },
  {
    id: 'b0b7ca49-82fb-440f-8e9a-19fdbf1f6d11',
    name: 'Дартс',
    judgeCode: 'DARTS',
    groupCount: 4,
    advancePerGroup: 2,
  },
  {
    id: '4b254cc4-16e9-430d-9bf2-0257178db95c',
    name: 'Шатар',
    judgeCode: 'CHESS',
    groupCount: 4,
    advancePerGroup: 2,
  },
]

// ── Algorithms ───────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Distribute teamIds evenly across groupCount groups (snake-order fill) */
function distributeToGroups(teamIds, groupCount) {
  const groups = Array.from({ length: groupCount }, () => [])
  teamIds.forEach((id, i) => groups[i % groupCount].push(id))
  return groups // groups[0] = group A teams, etc.
}

/** Round-robin schedule — returns array of rounds, each an array of [t1,t2] pairs */
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

// ── Per-sport setup ──────────────────────────────────────────────────────────

async function setupSport(sport) {
  console.log(`\n🏅 ${sport.name} [${sport.judgeCode}]`)

  // 1. Get confirmed teams only (deduplicated by name — take newest)
  const { data: allTeams } = await sb
    .from('teams')
    .select('id, name, status')
    .eq('sport_id', sport.id)
    .order('created_at', { ascending: false })

  // De-dup by name: keep first (newest) confirmed, discard duplicates & pending
  const seen = new Set()
  const pendingIds = []
  const confirmedTeams = []
  for (const t of allTeams ?? []) {
    const key = t.name.trim().toLowerCase()
    if (seen.has(key) || t.status !== 'confirmed') {
      pendingIds.push(t.id)
    } else {
      seen.add(key)
      confirmedTeams.push(t)
    }
  }
  if (pendingIds.length > 0) {
    console.log(`   ⚠️  Устгаж байна: ${pendingIds.length} дахилт/pending team`)
    // Remove group_teams first to avoid FK errors
    await sb.from('group_teams').delete().in('team_id', pendingIds)
    await sb.from('teams').delete().in('id', pendingIds)
  }

  console.log(`   Баг: ${confirmedTeams.length}`)

  // 2. Delete existing matches for this sport
  const { count: delCount } = await sb
    .from('matches')
    .delete({ count: 'exact' })
    .eq('sport_id', sport.id)
  if (delCount) console.log(`   🗑  Устгасан тоглолт: ${delCount}`)

  // 3. Delete existing groups (cascade group_teams via Supabase FK or manual)
  const { data: existingGroups } = await sb
    .from('groups')
    .select('id')
    .eq('sport_id', sport.id)
  const existingGroupIds = (existingGroups ?? []).map(g => g.id)
  if (existingGroupIds.length > 0) {
    await sb.from('group_teams').delete().in('group_id', existingGroupIds)
    await sb.from('groups').delete().in('id', existingGroupIds)
  }

  // 4. Update sport metadata (groups_count, advance_per_group)
  await sb
    .from('tournament_sports')
    .update({ groups_count: sport.groupCount, advance_per_group: sport.advancePerGroup })
    .eq('id', sport.id)

  // 5. Create groups A,B,C,D...
  const letters = Array.from({ length: sport.groupCount }, (_, i) =>
    String.fromCharCode(65 + i)
  )
  const groupRows = letters.map(letter => ({
    tournament_id: TOURNAMENT_ID,
    sport_id: sport.id,
    name: letter,
    advance_count: sport.advancePerGroup,
  }))
  const { data: groups } = await sb.from('groups').insert(groupRows).select()
  const groupMap = Object.fromEntries((groups ?? []).map(g => [g.name, g.id]))
  console.log(`   Groups: ${letters.join(', ')}`)

  // 6. Lottery: shuffle teams and distribute to groups
  const shuffled = shuffle(confirmedTeams.map(t => t.id))
  const distributed = distributeToGroups(shuffled, sport.groupCount)

  // 7. Insert group_teams
  const gtRows = []
  distributed.forEach((teamIds, gi) => {
    const groupId = groupMap[letters[gi]]
    teamIds.forEach(teamId => gtRows.push({ group_id: groupId, team_id: teamId }))
  })
  await sb.from('group_teams').insert(gtRows)

  // 8. Generate round-robin matches per group
  const matchRows = []
  let matchNumber = 1
  distributed.forEach((teamIds, gi) => {
    const groupId = groupMap[letters[gi]]
    const rounds = roundRobin(teamIds)
    rounds.forEach((pairs, roundIdx) => {
      pairs.forEach(([t1, t2]) => {
        matchRows.push({
          tournament_id: TOURNAMENT_ID,
          sport_id: sport.id,
          stage: 'group',
          group_id: groupId,
          round: roundIdx + 1,
          match_number: matchNumber++,
          team1_id: t1,
          team2_id: t2,
          status: 'scheduled',
          judge_code: sport.judgeCode,
        })
      })
    })
    const groupLetter = letters[gi]
    console.log(`   Хэсэг ${groupLetter}: ${teamIds.length} баг → ${rounds.reduce((s, r) => s + r.length, 0)} тоглолт`)
  })

  if (matchRows.length > 0) {
    const { error } = await sb.from('matches').insert(matchRows)
    if (error) console.error('   ❌ matches insert error:', error.message)
    else console.log(`   ✅ Нийт ${matchRows.length} group тоглолт үүслээ`)
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('='.repeat(60))
  console.log('Монгол 87/89 V Спорт Наадам 2026 — Tournament Setup')
  console.log('='.repeat(60))

  // Verify tournament exists
  const { data: t } = await sb.from('tournaments').select('id, name').eq('id', TOURNAMENT_ID).single()
  if (!t) { console.error('❌ Tournament not found!'); process.exit(1) }
  console.log(`\n✅ Tournament: ${t.name}`)

  for (const sport of SPORTS) {
    await setupSport(sport)
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ Бүх спорт тохиргоо дууслаа!')
  console.log('\n🔑 Шүүгчийн кодууд:')
  SPORTS.forEach(s => console.log(`   ${s.judgeCode.padEnd(10)} — ${s.name}`))
  console.log('\n📊 Admin: /admin/0b05625d-2f6d-48de-b69c-d5a23c2f0e3f')
  console.log('⚖️  Шүүгч: /judge')
  console.log('\n⚠️  Нугалааны bracket-г admin-аас үүсгэнэ:')
  console.log('   /admin/0b05625d-2f6d-48de-b69c-d5a23c2f0e3f/groups/{sportId}')
  console.log('   → «⟁ Bracket үүсгэх» товч')
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
