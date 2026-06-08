/**
 * scripts/nakka-darts-robot.mjs
 * n01darts.com (Nakka) тэмцээний үр дүнг автоматаар манай сайтад шивнэ.
 *
 * node scripts/nakka-darts-robot.mjs --tdid <nakka_tournament_id> [--apply] [--watch] [--interval 30]
 *
 * --tdid      n01darts tournament ID (e.g. t_Ow4a_8768)
 * --apply     Өөрчлөлтийг бодитоор хадгална (default: dry run)
 * --watch     Тасралтгүй ажиллана, --interval секундын давтамжтай (default 30s)
 * --interval  Хэдэн секунд тутамд шалгах (--watch-тай хамт)
 * --sport-id  Манай дартсын sport UUID (default: b0b7ca49-...)
 * --map       Нэр зөрвөл гараар тааруулах: "Nakka нэр=Манай нэр,..."
 */

import { createClient } from '@supabase/supabase-js'

// ── Тохиргоо ─────────────────────────────────────────────────────────────────
const SUPABASE_URL   = 'https://lrbcnlpqiqhxsycjihug.supabase.co'
const SERVICE_KEY    = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyYmNubHBxaXFoeHN5Y2ppaHVnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzgxNzU4OSwiZXhwIjoyMDkzMzkzNTg5fQ.2NSFDn_fp20F-iqXvZYLYto490e8y7rIIAfzbCTajAk'
const DEFAULT_SPORT  = 'b0b7ca49-82fb-440f-8e9a-19fdbf1f6d11'
const NAKKA_API      = 'https://tk2-228-23746.vs.sakura.ne.jp/n01/tournament/n01_tournament.php'
const BASE_URL       = 'http://localhost:3002'

// ── Аргументууд ──────────────────────────────────────────────────────────────
const args     = process.argv.slice(2)
const get      = flag => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : null }
const has      = flag => args.includes(flag)

const TDID     = get('--tdid')
const APPLY    = has('--apply')
const WATCH    = has('--watch')
const INTERVAL = parseInt(get('--interval') ?? '30') * 1000
const SPORT_ID = get('--sport-id') ?? DEFAULT_SPORT
const MAP_RAW  = get('--map') ?? ''

if (!TDID) {
  console.error('Заавал: --tdid <nakka_tournament_id>')
  console.error('Жишээ: node scripts/nakka-darts-robot.mjs --tdid t_Ow4a_8768 --apply')
  process.exit(1)
}

// Гараар тааруулах нэрс: "Nakka нэр=Манай нэр,..."
const MANUAL_MAP = Object.fromEntries(
  MAP_RAW.split(',').filter(Boolean).map(s => s.split('=').map(x => x.trim()))
)

// ── Суурь ────────────────────────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
const sleep    = ms => new Promise(r => setTimeout(r, ms))

// Нэр нормалчлах: үсэг/тоо гарган хоорондын зайг арилгах
function norm(s) {
  return (s ?? '').toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '')
    .replace(/аймаг$/u, '')
    .replace(/дүүрэг$/u, '')
    .trim()
}

// ── Nakka API дуудах ─────────────────────────────────────────────────────────
async function fetchNakka() {
  const url = `${NAKKA_API}?cmd=get_data&tdid=${TDID}`
  const res  = await fetch(url, {
    headers: {
      'Referer':          'https://n01darts.com/',
      'X-Requested-With': 'XMLHttpRequest',
    },
  })
  if (!res.ok) throw new Error(`Nakka API алдаа: ${res.status}`)
  const data = await res.json()
  if (data.result !== undefined && data.result < 0)
    throw new Error(`Nakka API буцаасан алдаа: result=${data.result}`)
  return data
}

// ── Манай DB-ээс дартсын өгөгдөл авах ───────────────────────────────────────
async function fetchOurData() {
  const [{ data: teams }, { data: matches }] = await Promise.all([
    supabase.from('teams').select('id, name').eq('sport_id', SPORT_ID),
    supabase.from('matches')
      .select('id, stage, round, status, team1_id, team2_id, team1_score, team2_score')
      .eq('sport_id', SPORT_ID),
  ])
  return { teams: teams ?? [], matches: matches ?? [] }
}

// ── Нэр тааруулах ────────────────────────────────────────────────────────────
function buildNameMap(entryList, ourTeams) {
  // tpid → манай team id
  const map = new Map()
  const unmatched = []

  for (const entry of entryList) {
    const nakkaName = entry.name
    // 1. Гараар тааруулсан нэр
    if (MANUAL_MAP[nakkaName]) {
      const ourTeam = ourTeams.find(t => t.name === MANUAL_MAP[nakkaName])
      if (ourTeam) { map.set(entry.tpid, ourTeam.id); continue }
    }
    // 2. Яг тохирох
    const exact = ourTeams.find(t => t.name === nakkaName)
    if (exact) { map.set(entry.tpid, exact.id); continue }
    // 3. Нормалчилсан нэр
    const normNakka = norm(nakkaName)
    const fuzzy = ourTeams.find(t => norm(t.name) === normNakka)
    if (fuzzy) { map.set(entry.tpid, fuzzy.id); continue }
    // 4. Хэсэгчилсэн тохирох
    const partial = ourTeams.find(t =>
      norm(t.name).includes(normNakka) || normNakka.includes(norm(t.name))
    )
    if (partial) { map.set(entry.tpid, partial.id); continue }
    unmatched.push(nakkaName)
  }

  return { map, unmatched }
}

// ── Накка тоглолтоос оноог унших ─────────────────────────────────────────────
// Буцаана: { scoreA, scoreB } — A тоглогч B-тэй тоглосон оноо
function getMatchScore(result, tpidA, tpidB) {
  const a = result?.[tpidA]?.[tpidB]?.r
  const b = result?.[tpidB]?.[tpidA]?.r
  if (a === undefined || b === undefined) return null
  if (a === b) return null // тодорхойгүй
  return { scoreA: a, scoreB: b }
}

// ── Тоглолтыг хайх (team pair-aar) ──────────────────────────────────────────
function findMatchByTeams(matches, t1id, t2id, stage = null) {
  return matches.find(m =>
    (m.stage == null || stage == null || m.stage === stage) &&
    ((m.team1_id === t1id && m.team2_id === t2id) ||
     (m.team1_id === t2id && m.team2_id === t1id))
  )
}

// ── Score шивэх ──────────────────────────────────────────────────────────────
async function applyScore(matchId, team1Id, score1, score2) {
  const res  = await fetch(`${BASE_URL}/api/matches/${matchId}/score`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ team1_score: score1, team2_score: score2, status: 'completed' }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(JSON.stringify(json))
  return json
}

// ── Гол логик ────────────────────────────────────────────────────────────────
async function runOnce() {
  console.log(`\n[${new Date().toLocaleTimeString('mn-MN')}] Nakka ${TDID} шалгаж байна...`)

  const [nakka, { teams: ourTeams, matches: ourMatches }] = await Promise.all([
    fetchNakka(),
    fetchOurData(),
  ])

  console.log(`Nakka: "${nakka.title}" — status=${nakka.status}`)
  console.log(`Манай: ${ourTeams.length} баг, ${ourMatches.length} тоглолт`)

  // Нэр зөрвөл
  const { map: nameMap, unmatched } = buildNameMap(nakka.entry_list ?? [], ourTeams)
  if (unmatched.length > 0) {
    console.warn('⚠ Тааруулагдаагүй нэрс:', unmatched.join(', '))
    console.warn('  --map "Nakka нэр=Манай нэр,..." ашиглан гараар тааруул')
  }
  console.log(`Нэр зөв тааруулсан: ${nameMap.size}/${nakka.entry_list?.length ?? 0}`)

  let pending = 0, updated = 0, skipped = 0, errors = 0

  // ── 1. Хэсгийн тоглолтууд (rr_result) ──────────────────────────────────────
  const rrResult = nakka.rr_result ?? []
  const rrTable  = nakka.rr_table ?? []

  for (let g = 0; g < rrTable.length; g++) {
    const players = rrTable[g].filter(Boolean)
    const groupResult = rrResult[g] ?? {}

    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const tpA = players[i], tpB = players[j]
        const score = getMatchScore(groupResult, tpA, tpB)
        if (!score) continue  // Тоглолт дуусаагүй

        const tA = nameMap.get(tpA), tB = nameMap.get(tpB)
        if (!tA || !tB) { skipped++; continue }

        const m = findMatchByTeams(ourMatches, tA, tB, 'group')
        if (!m) { skipped++; continue }
        if (m.status === 'completed') { skipped++; continue }

        // team1/team2 эрэмбэ зөрвөл оноог солих
        const s1 = m.team1_id === tA ? score.scoreA : score.scoreB
        const s2 = m.team1_id === tA ? score.scoreB : score.scoreA

        const nakkaA = nakka.entry_list.find(e => e.tpid === tpA)?.name ?? tpA
        const nakkaB = nakka.entry_list.find(e => e.tpid === tpB)?.name ?? tpB
        console.log(`[Хэсэг] ${nakkaA} ${s1}:${s2} ${nakkaB}${APPLY ? '' : ' [DRY]'}`)
        pending++

        if (APPLY) {
          try {
            await applyScore(m.id, m.team1_id, s1, s2)
            updated++
          } catch (e) {
            console.error('  ✗ Алдаа:', e.message)
            errors++
          }
          await sleep(300)
        }
      }
    }
  }

  // ── 2. Нугалааны тоглолтууд (t_result) ─────────────────────────────────────
  // n01darts round index:  0=R16, 1=QF, 2=SF, 3=Final
  // Манай round:          4=R16, 3=QF, 2=SF, 1=Final
  const tResult = nakka.t_result ?? []
  const N01_TO_OUR_ROUND = { 0: 4, 1: 3, 2: 2, 3: 1 }

  for (let ri = 0; ri < tResult.length; ri++) {
    const roundResult = tResult[ri]
    const ourRound    = N01_TO_OUR_ROUND[ri]
    if (!ourRound) continue

    for (const [winnerTpid, opponents] of Object.entries(roundResult)) {
      for (const [loserTpid, scoreData] of Object.entries(opponents)) {
        const wScore = scoreData.r
        // Ялагдагчийн оноог хайж олох
        const lScore = roundResult[loserTpid]?.[winnerTpid]?.r
        if (wScore === undefined || lScore === undefined) continue

        const tW = nameMap.get(winnerTpid), tL = nameMap.get(loserTpid)
        if (!tW || !tL) { skipped++; continue }

        const m = findMatchByTeams(ourMatches, tW, tL, 'knockout')
        if (!m || m.round !== ourRound) {
          // Ижил тоглолтыг давхар боловсруулахгүй байх
          continue
        }
        if (m.status === 'completed') { skipped++; continue }

        const s1 = m.team1_id === tW ? wScore : lScore
        const s2 = m.team1_id === tW ? lScore : wScore
        const nakkaW = nakka.entry_list.find(e => e.tpid === winnerTpid)?.name ?? winnerTpid
        const nakkaL = nakka.entry_list.find(e => e.tpid === loserTpid)?.name ?? loserTpid
        const label  = ourRound === 1 ? 'Финал' : ourRound === 2 ? 'ХФ' : ourRound === 3 ? 'ТФ' : 'Р16'
        console.log(`[${label}] ${nakkaW} ${s1}:${s2} ${nakkaL}${APPLY ? '' : ' [DRY]'}`)
        pending++

        if (APPLY) {
          try {
            await applyScore(m.id, m.team1_id, s1, s2)
            updated++
          } catch (e) {
            console.error('  ✗ Алдаа:', e.message)
            errors++
          }
          await sleep(300)
        }
      }
    }
  }

  // ── 3. 3-р байрны тоглолт (t3_result) ───────────────────────────────────────
  const t3Result = nakka.t3_result ?? {}
  for (const [, roundObj] of Object.entries(t3Result)) {
    for (const [winnerTpid, opponents] of Object.entries(roundObj)) {
      for (const [loserTpid, scoreData] of Object.entries(opponents)) {
        const wScore = scoreData.r
        const lScore = roundObj[loserTpid]?.[winnerTpid]?.r
        if (wScore === undefined || lScore === undefined) continue

        const tW = nameMap.get(winnerTpid), tL = nameMap.get(loserTpid)
        if (!tW || !tL) { skipped++; continue }

        const m = findMatchByTeams(ourMatches, tW, tL, 'third')
        if (!m) { skipped++; continue }
        if (m.status === 'completed') { skipped++; continue }

        const s1 = m.team1_id === tW ? wScore : lScore
        const s2 = m.team1_id === tW ? lScore : wScore
        const nakkaW = nakka.entry_list.find(e => e.tpid === winnerTpid)?.name ?? winnerTpid
        const nakkaL = nakka.entry_list.find(e => e.tpid === loserTpid)?.name ?? loserTpid
        console.log(`[3-р байр] ${nakkaW} ${s1}:${s2} ${nakkaL}${APPLY ? '' : ' [DRY]'}`)
        pending++

        if (APPLY) {
          try {
            await applyScore(m.id, m.team1_id, s1, s2)
            updated++
          } catch (e) {
            console.error('  ✗ Алдаа:', e.message)
            errors++
          }
          await sleep(300)
        }
      }
    }
  }

  if (pending === 0) {
    console.log('Шинэ дүн алга — бүх тоглолт хамрагдсан эсвэл Nakka дүнгүй')
  } else if (!APPLY) {
    console.log(`\n${pending} тоглолт шинэчлэгдэх байсан. --apply нэмж ажиллуулна уу.`)
  } else {
    console.log(`\nДүн: ${updated} шинэчлэгдсэн, ${errors} алдаа, ${skipped} алгасав`)
  }

  return { pending, updated, errors }
}

// ── Ажиллуулах ───────────────────────────────────────────────────────────────
console.log(`
╔═══════════════════════════════════════════╗
║  Nakka Darts Robot · n01darts.com         ║
╚═══════════════════════════════════════════╝
  TDID     : ${TDID}
  Sport    : ${SPORT_ID}
  Mode     : ${APPLY ? 'APPLY (бодитоор хадгална)' : 'DRY RUN (зөвхөн харуулна)'}
  Watch    : ${WATCH ? `тийм (${INTERVAL / 1000}s тутамд)` : 'үгүй'}
`)

if (WATCH) {
  while (true) {
    try { await runOnce() } catch (e) { console.error('Алдаа:', e.message) }
    console.log(`\n${INTERVAL / 1000}s-д дахин шалгана... (Ctrl+C гарах)`)
    await sleep(INTERVAL)
  }
} else {
  await runOnce()
}
