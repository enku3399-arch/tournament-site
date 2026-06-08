import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

function calcStandings(teamIds: string[], matches: any[]): string[] {
  const map = new Map<string, { pts: number; gd: number; gf: number }>()
  for (const id of teamIds) map.set(id, { pts: 0, gd: 0, gf: 0 })

  for (const m of matches) {
    if (m.status !== 'completed' || m.team1_score == null || m.team2_score == null) continue
    const t1 = map.get(m.team1_id)
    const t2 = map.get(m.team2_id)
    if (!t1 || !t2) continue
    t1.gf += m.team1_score; t1.gd += m.team1_score - m.team2_score
    t2.gf += m.team2_score; t2.gd += m.team2_score - m.team1_score
    if (m.team1_score > m.team2_score) t1.pts += 3
    else if (m.team2_score > m.team1_score) t2.pts += 3
    else { t1.pts += 1; t2.pts += 1 }
  }

  return [...teamIds].sort((a, b) => {
    const sa = map.get(a)!; const sb = map.get(b)!
    return (sb.pts - sa.pts) || (sb.gd - sa.gd) || (sb.gf - sa.gf)
  })
}

export async function POST(req: Request, { params }: { params: Promise<{ sportId: string }> }) {
  const { sportId } = await params
  const { tournamentId } = await req.json()
  const supabase = createServiceClient()

  const { data: sport } = await supabase
    .from('tournament_sports')
    .select('*')
    .eq('id', sportId)
    .single()

  const { data: groups } = await supabase
    .from('groups')
    .select('*')
    .eq('sport_id', sportId)
    .order('name')

  if (!groups?.length) return NextResponse.json({ error: 'Хэсэг олдсонгүй' }, { status: 400 })

  const { data: groupTeams } = await supabase
    .from('group_teams')
    .select('*')
    .in('group_id', groups.map((g: any) => g.id))

  const { data: groupMatches } = await supabase
    .from('matches')
    .select('*')
    .eq('sport_id', sportId)
    .eq('stage', 'group')

  // Одоогийн knockout + third тоглолтуудыг бүгдийг устгах
  await supabase.from('matches').delete().eq('sport_id', sportId).eq('stage', 'knockout')
  await supabase.from('matches').delete().eq('sport_id', sportId).eq('stage', 'third')

  const advanceCount = (sport as any).advance_per_group ?? 2

  // Get top N teams from each group
  // advancers[groupIndex] = [1st, 2nd, ...]
  const advancers: (string | null)[][] = []
  for (const group of groups as any[]) {
    const teamIds = (groupTeams ?? [])
      .filter((gt: any) => gt.group_id === group.id)
      .map((gt: any) => gt.team_id)
    const gm = (groupMatches ?? []).filter((m: any) => m.group_id === group.id)
    const ranked = calcStandings(teamIds, gm)
    const slots: (string | null)[] = []
    for (let i = 0; i < advanceCount; i++) {
      slots.push(ranked[i] ?? null)
    }
    advancers.push(slots)
  }

  const totalTeams = groups.length * advanceCount
  const totalRounds = Math.ceil(Math.log2(totalTeams))

  const n = groups.length
  const COURT2_GROUPS = ['D', 'E', 'F']
  const matchRows: any[] = []

  // Round numbering: Final=1, SF=2, QF=3 (first played round = totalRounds)
  const firstRound = totalRounds
  const courtCounters: Record<number, number> = { 1: 1, 2: 1 }

  // Mirror pairing: group[i] 1st vs group[n-1-i] 2nd
  // Court determined by which group the 1st-place team came from
  for (let i = 0; i < n; i++) {
    const winner = advancers[i]?.[0] ?? null
    const mirrorIdx = n - 1 - i
    const runnerUp = advancers[mirrorIdx]?.[1] ?? null
    const court = COURT2_GROUPS.includes((groups as any[])[i].name?.toUpperCase()) ? 2 : 1
    matchRows.push({
      tournament_id: tournamentId,
      sport_id: sportId,
      stage: 'knockout',
      round: firstRound,
      match_number: i + 1,
      team1_id: winner,
      team2_id: runnerUp,
      status: winner && runnerUp ? 'scheduled' : 'pending',
      court,
      schedule_order: courtCounters[court]++,
    })
  }

  // SF, Final (медалийн тоглолтууд) → бүгд 1-р талбай
  // n=6 (12-баг): 2 баг SF-д шууд орно (bye) → QF 2 тоглолт, SF 2 тоглолт
  const innerRoundSizes: Record<number, number> | null = n === 6
    ? { [firstRound - 1]: 2, [firstRound - 2]: 2, 1: 1 }
    : null
  let prevRoundCount = n
  for (let r = firstRound - 1; r >= 1; r--) {
    const matchesInRound = innerRoundSizes ? (innerRoundSizes[r] ?? Math.ceil(prevRoundCount / 2)) : Math.ceil(prevRoundCount / 2)
    for (let m = 1; m <= matchesInRound; m++) {
      matchRows.push({
        tournament_id: tournamentId,
        sport_id: sportId,
        stage: 'knockout',
        round: r,
        match_number: m,
        team1_id: null,
        team2_id: null,
        status: 'pending',
        court: 1,
        schedule_order: courtCounters[1]++,
      })
    }
    prevRoundCount = matchesInRound
  }

  // 3-р байрны тоглолт (SF хожсон 2 баг автоматаар орно)
  matchRows.push({
    tournament_id: tournamentId,
    sport_id: sportId,
    stage: 'third',
    round: 2,
    match_number: 1,
    team1_id: null,
    team2_id: null,
    status: 'pending',
    court: 1,
    schedule_order: courtCounters[1]++,
  })

  const { error } = await supabase.from('matches').insert(matchRows)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, count: matchRows.length })
}
