import { createServiceClient } from './supabase-server'
import type { SportOverride } from './site-settings'

export const TOURNAMENT_ID = '0b05625d-2f6d-48de-b69c-d5a23c2f0e3f'


// Two-letter aimag abbreviations
export const AIMAG_ABBR: Record<string, string> = {
  'Архангай':           'АР',
  'Баян-Өлгий':         'БӨ',
  'Баянхонгор':         'БХ',
  'Булган':             'БУ',
  'Говь-Алтай':         'ГА',
  'Говьсүмбэр':         'ГС',
  'Дархан-Уул':         'ДУ',
  'Дархан':             'ДА',
  'Дорноговь':          'ДГ',
  'Дорнод':             'ДН',
  'Дундговь':           'ДД',
  'Завхан':             'ЗА',
  'Орхон':              'ОР',
  'Эрдэнэт':           'ЭР',
  'Өвөрхангай':         'ӨХ',
  'Өмнөговь':           'ӨМ',
  'Сүхбаатар':          'СҮ',
  'Сүхбаатар аймаг':   'СА',
  'Сүхбаатар дүүрэг':  'СД',
  'Сэлэнгэ':            'СЭ',
  'Төв':                'ТӨ',
  'Увс':                'УВ',
  'Ховд':               'ХВ',
  'Хөвсгөл':            'ХӨ',
  'Хэнтий':             'ХЭ',
  'Багануур':           'БГ',
  'Улаанбаатар':        'УБ',
  'Ажилчин':            'АЖ',
  'Найрамдал':          'НА',
}

type DbMatch = {
  id: string
  sport_id: string
  status: string
  stage: string | null
  round: number | null
  team1_id: string | null
  team2_id: string | null
  team1_score: number | null
  team2_score: number | null
  winner_id: string | null
}

type DbTeam = {
  id: string
  name: string
  sport_id: string
}

type DbSport = {
  id: string
  name: string
  sport_type: string
}

export type SportPlacement = {
  sportId: string
  sportName: string
  sport_type: string
  rank: number        // 1st, 2nd, 3rd... (харуулах зориулалттай)
  score: number       // base+offset оноо (нэгдсэн хүснэгтэд)
  teamName: string
}

export type AimagStanding = {
  name: string
  abbr: string
  gold: number
  silver: number
  bronze: number
  medals: number
  pts: number         // low-score placement points (lower = better)
  rank: number
  sportPlacements: SportPlacement[]
}

function winnerLoser(m: DbMatch): { winner: string; loser: string } | null {
  if (!m.team1_id || !m.team2_id) return null
  if (m.winner_id) return {
    winner: m.winner_id,
    loser: m.winner_id === m.team1_id ? m.team2_id : m.team1_id,
  }
  if (m.team1_score === null || m.team2_score === null || m.team1_score === m.team2_score) return null
  const w1 = m.team1_score > m.team2_score
  return { winner: w1 ? m.team1_id : m.team2_id, loser: w1 ? m.team2_id : m.team1_id }
}

// Спортын суурь оноо (base)
function getSportBase(name: string, sportType: string): number {
  const n = name.toLowerCase(), t = sportType.toLowerCase()
  if (n.includes('сагс') || n.includes('волейбол') || t === 'basketball' || t === 'volleyball') return 1
  if (n.includes('теннис') || n.includes('дартс') || t === 'table_tennis' || t === 'tennis' || t === 'darts') return 3
  if (n.includes('шатар') || t === 'chess') return 5
  return 1
}

// Нэг багийн оноо: base + offset (1-р байр=0, 2-р=1, 3-р=2, 4-р=3, ТФ=4, 1р шат=5, хэсэг=6)
function calcTeamScore(teamId: string, base: number, sportMatches: DbMatch[]): number {
  const comp = sportMatches.filter(m => m.status === 'completed')

  const fin = comp.find(m => m.stage === 'knockout' && m.round === 1
    && (m.team1_id === teamId || m.team2_id === teamId))
  if (fin) return fin.winner_id === teamId ? base : base + 1

  const third = comp.find(m => m.stage === 'third'
    && (m.team1_id === teamId || m.team2_id === teamId))
  if (third) return third.winner_id === teamId ? base + 2 : base + 3

  const koLoss = comp
    .filter(m => m.stage === 'knockout'
      && m.winner_id !== teamId
      && (m.team1_id === teamId || m.team2_id === teamId))
    .sort((a, b) => (a.round ?? 999) - (b.round ?? 999))[0]
  if (koLoss) {
    const r = koLoss.round ?? 999
    if (r === 2) return base + 3   // SF алдсан, 3-р байрны тоглолтгүй
    return base + 1 + r            // QF→base+4, 1р шат→base+5
  }

  return base + 6  // зөвхөн хэсэг
}

function getSportPlacements(
  sportMatches: DbMatch[],
  sportTeams: DbTeam[]
): Map<string, number> {
  const placements = new Map<string, number>()
  const teamIds = sportTeams.map(t => t.id)
  const n = teamIds.length

  const completed = sportMatches.filter(m => m.status === 'completed')
  if (completed.length === 0) return placements

  // 1st/2nd: knockout round=1 (Final)
  const finalMatch = completed.find(m => m.stage === 'knockout' && m.round === 1)
  if (finalMatch) {
    const r = winnerLoser(finalMatch)
    if (r) { placements.set(r.winner, 1); placements.set(r.loser, 2) }
  }

  // 3rd/4th: stage='third' тоглолт
  const thirdMatch = completed.find(m => m.stage === 'third')
  if (thirdMatch) {
    const r = winnerLoser(thirdMatch)
    if (r) { placements.set(r.winner, 3); placements.set(r.loser, 4) }
  } else if (finalMatch) {
    // SF алдсан баг → 3-р байр (round=2)
    const semis = completed.filter(m => m.stage === 'knockout' && m.round === 2)
    let rank = 3
    for (const s of semis) {
      const r = winnerLoser(s)
      if (r && !placements.has(r.loser)) placements.set(r.loser, rank++)
    }
  }

  // Нугалааны үлдсэн багуудын хамгийн дотор орсон раунд (тоо бага = дотор = дээр)
  const bestRound = new Map<string, number>()
  const groupWins = new Map<string, number>()
  const groupDiff = new Map<string, number>()

  for (const m of completed) {
    if (m.stage === 'group') {
      const r = winnerLoser(m)
      if (r) {
        groupWins.set(r.winner, (groupWins.get(r.winner) ?? 0) + 1)
        const d = Math.abs((m.team1_score ?? 0) - (m.team2_score ?? 0))
        groupDiff.set(r.winner, (groupDiff.get(r.winner) ?? 0) + d)
        groupDiff.set(r.loser, (groupDiff.get(r.loser) ?? 0) - d)
      }
    } else if (m.stage === 'knockout') {
      // Алдсан баг → хамгийн бага round (дотор орсон) хадгалах
      const r = winnerLoser(m)
      if (r && !placements.has(r.loser)) {
        const cur = bestRound.get(r.loser) ?? Infinity
        if ((m.round ?? Infinity) < cur) bestRound.set(r.loser, m.round ?? Infinity)
      }
    }
  }

  // Үлдсэн эрэмбэ: хамгийн бага round (дотор) → хэсгийн ялалт → гол зөрүү
  const remaining = teamIds
    .filter(id => !placements.has(id))
    .sort((a, b) => {
      const ra = bestRound.get(a) ?? Infinity, rb = bestRound.get(b) ?? Infinity
      if (ra !== rb) return ra - rb    // бага round = дотор орсон = дээр
      const wa = groupWins.get(a) ?? 0, wb = groupWins.get(b) ?? 0
      if (wa !== wb) return wb - wa
      return (groupDiff.get(b) ?? 0) - (groupDiff.get(a) ?? 0)
    })

  let nextRank = placements.size + 1
  for (const id of remaining) {
    if (!placements.has(id)) placements.set(id, nextRank++)
  }

  for (const id of teamIds) {
    if (!placements.has(id)) placements.set(id, n)
  }

  return placements
}

export async function calculateMedalStandings(overrides: SportOverride[] = []): Promise<{
  standings: AimagStanding[]
  sportResults: { id: string; name: string; sport_type: string; podium: { rank: number; name: string }[]; hasResults: boolean }[]
  lastUpdated: string
}> {
  const supabase = createServiceClient()

  const [{ data: sports }, { data: teams }, { data: matches }] = await Promise.all([
    supabase.from('tournament_sports').select('id, name, sport_type').eq('tournament_id', TOURNAMENT_ID),
    supabase.from('teams').select('id, name, sport_id').eq('tournament_id', TOURNAMENT_ID),
    supabase.from('matches')
      .select('id, sport_id, status, stage, round, team1_id, team2_id, team1_score, team2_score, winner_id')
      .eq('tournament_id', TOURNAMENT_ID),
  ])

  const sportList = (sports ?? []) as DbSport[]
  const teamList = (teams ?? []) as DbTeam[]
  const matchList = (matches ?? []) as DbMatch[]

  const allAimags = [...new Set(teamList.map(t => t.name))].sort()

  // Initialize per-aimag stats
  const stats = new Map<string, { gold: number; silver: number; bronze: number; pts: number; placements: SportPlacement[] }>()
  for (const name of allAimags) {
    stats.set(name, { gold: 0, silver: 0, bronze: 0, pts: 0, placements: [] })
  }

  const sportResults: { id: string; name: string; sport_type: string; podium: { rank: number; name: string }[]; hasResults: boolean }[] = []

  for (const sport of sportList) {
    const sportTeams = teamList.filter(t => t.sport_id === sport.id)
    const sportMatches = matchList.filter(m => m.sport_id === sport.id)
    const n = sportTeams.length
    if (n === 0) continue

    const override = overrides.find(o => o.sport_id === sport.id)
    const base = getSportBase(sport.name, sport.sport_type)

    // Override горим: гараар оруулсан байрлал ашиглана
    let placements: Map<string, number>
    if (override && (override.rank1 || override.rank2 || override.rank3)) {
      placements = new Map()
      const nameToId = new Map(sportTeams.map(t => [t.name, t.id]))
      const overrideRanks: [string | undefined, number][] = [
        [override.rank1, 1], [override.rank2, 2], [override.rank3, 3],
      ]
      const ranked = new Set<string>()
      for (const [name, rank] of overrideRanks) {
        if (name) {
          const id = nameToId.get(name)
          if (id) { placements.set(id, rank); ranked.add(id) }
        }
      }
      // Үлдсэн багуудыг 4-аас эхлэн нэрлэнэ
      let nextRank = 4
      for (const t of sportTeams) {
        if (!ranked.has(t.id)) placements.set(t.id, nextRank++)
      }
    } else {
      placements = getSportPlacements(sportMatches, sportTeams)
    }

    // Build podium for sport results section
    const podium: { rank: number; name: string }[] = []

    for (const team of sportTeams) {
      const rank = placements.get(team.id) ?? n
      const aimag = team.name
      const s = stats.get(aimag)
      if (!s) continue

      // Override горимд байрлалаас шууд оноо тооцно, эсвэл match-аас тооцно
      const score = override && (override.rank1 || override.rank2 || override.rank3)
        ? base + (rank - 1)   // 1-р байр=base+0, 2-р=base+1, 3-р=base+2...
        : calcTeamScore(team.id, base, sportMatches)
      s.pts += score
      if (rank === 1) s.gold++
      if (rank === 2) s.silver++
      if (rank === 3) s.bronze++
      s.placements.push({ sportId: sport.id, sportName: sport.name, sport_type: sport.sport_type, rank, score, teamName: team.name })

      podium.push({ rank, name: aimag })
    }

    podium.sort((a, b) => a.rank - b.rank)
    const hasResults = sportMatches.some(m => m.status === 'completed') || !!(override?.rank1)
    sportResults.push({ id: sport.id, name: sport.name, sport_type: sport.sport_type, podium, hasResults })
  }

  // Build and sort standings
  const standingsArr: AimagStanding[] = allAimags.map(name => {
    const s = stats.get(name)!
    return {
      name,
      abbr: AIMAG_ABBR[name] ?? name.slice(0, 2).toUpperCase(),
      gold: s.gold,
      silver: s.silver,
      bronze: s.bronze,
      medals: s.gold + s.silver + s.bronze,
      pts: s.pts,
      rank: 0,
      sportPlacements: s.placements.sort((a, b) => a.rank - b.rank),
    }
  })

  // Medal table sort: gold DESC → silver DESC → bronze DESC → pts ASC → name ASC
  standingsArr.sort((a, b) => {
    if (a.gold !== b.gold) return b.gold - a.gold
    if (a.silver !== b.silver) return b.silver - a.silver
    if (a.bronze !== b.bronze) return b.bronze - a.bronze
    if (a.pts !== b.pts) return a.pts - b.pts
    return a.name.localeCompare(b.name)
  })

  standingsArr.forEach((s, i) => { s.rank = i + 1 })

  return {
    standings: standingsArr,
    sportResults,
    lastUpdated: new Date().toISOString(),
  }
}
