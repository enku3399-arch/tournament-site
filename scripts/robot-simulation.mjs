/**
 * scripts/robot-simulation.mjs
 * Монгол 87/89 — Robot шүүгч симуляци (auto-setup + зогсолтгүй)
 *
 * node scripts/robot-simulation.mjs [--delay 5000] [--sport BASKET-M]
 *
 * Шаардлага: npm run dev -- --port 3002 ажиллаж байх ёстой
 */

import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'fs'

// ── Тохиргоо ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://lrbcnlpqiqhxsycjihug.supabase.co'
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyYmNubHBxaXFoeHN5Y2ppaHVnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzgxNzU4OSwiZXhwIjoyMDkzMzkzNTg5fQ.2NSFDn_fp20F-iqXvZYLYto490e8y7rIIAfzbCTajAk'
const TOURNAMENT_ID = '0b05625d-2f6d-48de-b69c-d5a23c2f0e3f'
const BASE_URL      = 'http://localhost:3002'
const GROUP_NAMES   = ['A', 'B', 'C', 'D']
const ADVANCE_PER_GROUP = 2

const args      = process.argv.slice(2)
const delayIdx  = args.indexOf('--delay')
const DELAY_MS  = delayIdx >= 0 ? parseInt(args[delayIdx + 1]) : 5000
const onlySport = args.indexOf('--sport') >= 0 ? args[args.indexOf('--sport') + 1] : null

const SPORTS = [
  { id: '771904c0-f0c9-4b53-a631-f82cecfde598', name: 'Сагсан бөмбөг (Эрэгтэй)',  type: 'basketball', code: 'BASKET-M' },
  { id: '875a61c1-6c97-4dca-96a0-dd0bcf9b2cc3', name: 'Сагсан бөмбөг (Эмэгтэй)', type: 'basketball', code: 'BASKET-F' },
  { id: '11a8b935-744d-4032-8280-6ef97ad5a9db', name: 'Волейбол (Эрэгтэй)',       type: 'volleyball', code: 'VOLLEY-M' },
  { id: '92dfbd70-204d-4293-985f-b2e49e35c526', name: 'Волейбол (Эмэгтэй)',       type: 'volleyball', code: 'VOLLEY-F' },
  { id: '094da6e9-660d-4646-b149-7a4cbd8f55a0', name: 'Ширээний теннис',           type: 'tennis',     code: 'TENNIS'   },
  { id: 'b0b7ca49-82fb-440f-8e9a-19fdbf1f6d11', name: 'Дартс',                    type: 'darts',      code: 'DARTS'    },
  { id: '4b254cc4-16e9-430d-9bf2-0257178db95c', name: 'Шатар',                    type: 'chess',      code: 'CHESS'    },
]

// ── Туслах ────────────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms))
const rand  = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a
const shuffle = arr => [...arr].sort(() => Math.random() - 0.5)

function randomScore(type) {
  if (type === 'volleyball') {
    // set_scores баганы schema cache асуудлаас зайлсхийж зөвхөн ялалтын тоо илгээнэ
    let w1 = 0, w2 = 0
    while (w1 < 2 && w2 < 2) {
      if (Math.random() > 0.5) w1++; else w2++
    }
    return { t1: w1, t2: w2 }  // e.g. 2:1 эсвэл 2:0
  }
  if (type === 'basketball') {
    let a = rand(45, 95), b = rand(45, 95)
    while (a === b) b = rand(45, 95)
    return { t1: a, t2: b }
  }
  // tennis, darts, chess: тоо-д суурилсан
  let a = rand(2, 5), b = rand(0, 4)
  if (a === b) b = b > 0 ? b - 1 : b + 1
  return { t1: a, t2: b }
}

function fmtScore(score) { return `${score.t1}:${score.t2}` }

// ── Auto-setup: хэсэг + тоглолт байхгүй бол санамсаргүй үүсгэх ───────────────
async function ensureGroupsAndMatches(sport, sb, logs) {
  // 1. Хэсэг шалгах
  let { data: groups } = await sb.from('groups').select('*').eq('sport_id', sport.id).order('name')

  if (!groups?.length) {
    log(sport.code, '⚙️ ', 'Хэсэг олдсонгүй — санамсаргүй 4 хэсэг үүсгэж байна')
    const groupRows = GROUP_NAMES.map(name => ({
      tournament_id: TOURNAMENT_ID,
      sport_id: sport.id,
      name,
      advance_count: ADVANCE_PER_GROUP,
    }))
    const { data: newGroups, error: gErr } = await sb.from('groups').insert(groupRows).select()
    if (gErr) {
      logs.push({ sport: sport.code, stage: 'auto-setup', status: 'ERROR', error: gErr.message })
      log(sport.code, '❌', `Хэсэг үүсгэж чадсангүй: ${gErr.message}`)
      return false
    }
    groups = newGroups

    // 2. Багуудыг хэсгүүдэд санамсаргүй хуваарилах
    const { data: teams } = await sb.from('teams').select('id').eq('sport_id', sport.id)
    if (!teams?.length) {
      logs.push({ sport: sport.code, stage: 'auto-setup', status: 'ERROR', error: 'Баг олдсонгүй' })
      log(sport.code, '❌', 'Баг олдсонгүй')
      return false
    }

    const shuffled = shuffle(teams)
    const groupTeamRows = shuffled.map((t, i) => ({
      group_id: groups[i % groups.length].id,
      team_id: t.id,
    }))
    const { error: gtErr } = await sb.from('group_teams').insert(groupTeamRows)
    if (gtErr) {
      logs.push({ sport: sport.code, stage: 'auto-setup', status: 'ERROR', error: gtErr.message })
      log(sport.code, '❌', `Баг хуваарилж чадсангүй: ${gtErr.message}`)
      return false
    }
    log(sport.code, '✅', `${teams.length} баг ${groups.length} хэсэгт хуваарилагдлаа`)
  }

  // 3. Хэсгийн тоглолт шалгах
  const { data: existingMatches } = await sb
    .from('matches').select('id').eq('sport_id', sport.id).eq('stage', 'group').limit(1)

  if (!existingMatches?.length) {
    log(sport.code, '⚙️ ', 'Тоглолт олдсонгүй — generate-matches ажиллуулж байна')
    const res = await fetch(`${BASE_URL}/api/admin/sport/${sport.id}/groups/generate-matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tournamentId: TOURNAMENT_ID, judgeCode: sport.code, useTwoCourts: false }),
    })
    if (!res.ok) {
      const txt = await res.text()
      logs.push({ sport: sport.code, stage: 'auto-setup', status: 'ERROR', error: txt })
      log(sport.code, '❌', `generate-matches алдаа: ${txt.slice(0,100)}`)
      return false
    }
    const { count } = await res.json()
    log(sport.code, '✅', `${count} хэсгийн тоглолт үүслээ`)
    await sleep(500)
  }

  return true
}

// ── Нэг тоглолтын оноо оруулах ────────────────────────────────────────────────
async function finalizeMatch(match, sport, logs) {
  const score = randomScore(sport.type)
  const body = { finalize: true, team1_score: score.t1, team2_score: score.t2 }
  try {
    const res  = await fetch(`${BASE_URL}/api/matches/${match.id}/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) {
      logs.push({ sport: sport.code, stage: match.stage, matchId: match.id, status: 'ERROR', error: data.error })
      log(sport.code, '❌', `${match.stage} M#${match.match_number} → ${data.error}`)
      return false
    }
    logs.push({ sport: sport.code, stage: match.stage, matchId: match.id, status: 'OK', score: fmtScore(score) })
    log(sport.code, '✅', `${match.stage} M#${match.match_number} → ${fmtScore(score)}`)
    return true
  } catch (err) {
    logs.push({ sport: sport.code, stage: match.stage, matchId: match.id, status: 'NET_ERR', error: err.message })
    log(sport.code, '🔌', `Network: ${err.message}`)
    return false
  }
}

// ── Console log (timestamp + sport code) ──────────────────────────────────────
function log(code, icon, msg) {
  const t = new Date().toLocaleTimeString('mn-MN', { hour12: false })
  console.log(`${t} ${icon} [${code.padEnd(8)}] ${msg}`)
}

// ── Нэг спортын бүрэн симуляци ────────────────────────────────────────────────
async function simulateSport(sport, sb, logs) {
  log(sport.code, '🏅', `${sport.name} — эхэлж байна`)

  // Auto-setup: хэсэг/тоглолт байхгүй бол үүсгэх
  const ready = await ensureGroupsAndMatches(sport, sb, logs)
  if (!ready) {
    log(sport.code, '⛔', 'Setup амжилтгүй — спортыг алгасаж байна')
    return
  }

  // ── Хэсгийн шат ─────────────────────────────────────────────────────────────
  const { data: groupMatches } = await sb
    .from('matches')
    .select('id, match_number, schedule_order, team1_id, team2_id, status, stage')
    .eq('sport_id', sport.id)
    .eq('stage', 'group')
    .order('schedule_order', { ascending: true })

  const groupTodo = (groupMatches ?? []).filter(m => m.status !== 'completed' && m.team1_id && m.team2_id)
  log(sport.code, '📋', `${groupTodo.length} хэсгийн тоглолт`)

  for (const m of groupTodo) {
    await finalizeMatch(m, sport, logs)
    await sleep(DELAY_MS)
  }

  log(sport.code, '🏆', 'Хэсгийн шат дууслаа — нугалаа үүсгэж байна')

  // ── Нугалааны хүснэгт үүсгэх ────────────────────────────────────────────────
  const koRes = await fetch(
    `${BASE_URL}/api/admin/sport/${sport.id}/groups/generate-knockout`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tournamentId: TOURNAMENT_ID }),
    },
  )
  if (!koRes.ok) {
    const txt = await koRes.text()
    logs.push({ sport: sport.code, stage: 'ko-gen', status: 'ERROR', error: txt })
    log(sport.code, '❌', `Нугалаа үүсгэж чадсангүй: ${txt.slice(0,100)}`)
    return
  }
  const { count: koCount } = await koRes.json()
  log(sport.code, '✅', `${koCount} нугалааны тоглолт үүслээ`)
  await sleep(1500)

  // ── Нугалааны тоглолтуудыг давтан дуусгах ───────────────────────────────────
  // Багийн ID автоматаар орно хүлээж → хэд хэдэн давталт хийнэ
  for (let attempt = 0; attempt < 20; attempt++) {
    await sleep(800)

    const { data: pending } = await sb
      .from('matches')
      .select('id, match_number, round, stage, team1_id, team2_id, status')
      .eq('sport_id', sport.id)
      .in('stage', ['knockout', 'third'])
      .order('round', { ascending: false })
      .order('match_number', { ascending: true })

    const ready = (pending ?? []).filter(m => m.team1_id && m.team2_id && m.status !== 'completed')
    if (!ready.length) {
      log(sport.code, '🎉', 'Бүх тоглолт дууслаа!')
      break
    }

    log(sport.code, '⚔️ ', `${ready.length} нугалааны тоглолт (давталт ${attempt + 1})`)
    for (const m of ready) {
      await finalizeMatch(m, sport, logs)
      await sleep(DELAY_MS)
    }
  }
}

// ── Backup ────────────────────────────────────────────────────────────────────
async function backupMatches(sb) {
  const { data } = await sb.from('matches').select('*').eq('tournament_id', TOURNAMENT_ID)
  if (!data?.length) { console.log('⚠️  Backup-д өгөгдөл олдсонгүй'); return null }
  const file = `scripts/backup-${Date.now()}.json`
  writeFileSync(file, JSON.stringify(data, null, 2), 'utf8')
  console.log(`💾 Backup: ${file} (${data.length} тоглолт)`)
  return file
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('═'.repeat(64))
  console.log('🤖 МОНГОЛ 87/89 — ROBOT SIMULATION')
  console.log(`   Delay: ${DELAY_MS}ms | Спорт: ${onlySport ?? 'Бүгд зэрэгцээ'}`)
  console.log(`   Хэрэв хэсэг/тоглолт дутуу → AUTO-SETUP`)
  console.log('═'.repeat(64))

  const sb   = createClient(SUPABASE_URL, SERVICE_KEY)
  const logs = []

  const backupFile = await backupMatches(sb)
  console.log()

  const activeSports = onlySport ? SPORTS.filter(s => s.code === onlySport) : SPORTS
  if (!activeSports.length) {
    console.error(`❌ Спорт олдсонгүй: "${onlySport}"`)
    console.log(`   Боломжит: ${SPORTS.map(s => s.code).join(', ')}`)
    process.exit(1)
  }

  const t0 = Date.now()

  // Бүх спортыг зэрэгцүүлэн ажиллуулах
  await Promise.all(activeSports.map(s => simulateSport(s, sb, logs)))

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1)

  // ── Тайлан ────────────────────────────────────────────────────────────────
  const ok  = logs.filter(l => l.status === 'OK').length
  const err = logs.filter(l => ['ERROR','NET_ERR'].includes(l.status)).length

  console.log('\n' + '═'.repeat(64))
  console.log('📊 ТАЙЛАН')
  console.log('═'.repeat(64))
  console.log(`  ✅ Амжилттай  : ${ok}`)
  console.log(`  ❌ Алдаа      : ${err}`)
  console.log(`  ⏱  Хугацаа   : ${elapsed}с`)

  if (err > 0) {
    console.log('\n🔴 Алдаанууд:')
    logs.filter(l => ['ERROR','NET_ERR'].includes(l.status))
      .forEach(l => console.log(`   [${l.sport}] ${l.stage} — ${l.error}`))
  }

  const reportFile = `scripts/report-${Date.now()}.json`
  writeFileSync(reportFile, JSON.stringify({ elapsed, ok, err, backupFile, logs }, null, 2), 'utf8')
  console.log(`\n📁 Дэлгэрэнгүй лог: ${reportFile}`)

  if (backupFile) {
    console.log(`\n♻️  Сэргээхэд:`)
    console.log(`   node scripts/robot-restore.mjs ${backupFile}`)
  }

  console.log('\n🌐 Standings харах:')
  console.log(`   http://localhost:3002/t/${TOURNAMENT_ID}/standings`)
  console.log('═'.repeat(64))
}

main().catch(e => { console.error('💥', e.message); process.exit(1) })
