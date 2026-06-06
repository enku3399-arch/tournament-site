/**
 * POST /api/admin/sport/:sportId/groups/generate-bracket-12
 * 6 хэсэг × 2 ялагч = 12 багийн тусгай bracket үүсгэнэ
 *
 * Зургаас уншсан bracket бүтэц:
 *   R4 (Эхний шат, 6 тоглолт):
 *     M1: A1 vs F2  ──────────────────► R2M1 team1 (SF шууд)
 *     M2: B1 vs C2  ─┐ R3M1 (QF)
 *     M3: C1 vs D2  ─┘ QF winner     ► R2M1 team2 (SF)
 *     M4: D1 vs E2  ─┐ R3M2 (QF)
 *     M5: E1 vs B2  ─┘ QF winner     ► R2M2 team1 (SF)
 *     M6: F1 vs A2  ──────────────────► R2M2 team2 (SF шууд)
 *   R3 (QF, 2 тоглолт)
 *   R2 (SF, 2 тоглолт)
 *   R1 (Final, 1 тоглолт)
 *   R0 (3-р байр, 1 тоглолт) — round=0 ашиглана
 */

import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

function calcStandings(teamIds: string[], matches: any[]): string[] {
  const map = new Map<string, { pts: number; gd: number; gf: number }>()
  for (const id of teamIds) map.set(id, { pts: 0, gd: 0, gf: 0 })
  for (const m of matches) {
    if (m.status !== 'completed' || m.team1_score == null || m.team2_score == null) continue
    const t1 = map.get(m.team1_id), t2 = map.get(m.team2_id)
    if (!t1 || !t2) continue
    t1.gf += m.team1_score; t1.gd += m.team1_score - m.team2_score
    t2.gf += m.team2_score; t2.gd += m.team2_score - m.team1_score
    if (m.team1_score > m.team2_score) t1.pts += 2
    else if (m.team2_score > m.team1_score) t2.pts += 2
    else { t1.pts += 1; t2.pts += 1 }
  }
  return [...teamIds].sort((a, b) => {
    const sa = map.get(a)!, sb = map.get(b)!
    return (sb.pts - sa.pts) || (sb.gd - sa.gd) || (sb.gf - sa.gf)
  })
}

export async function POST(req: Request, { params }: { params: Promise<{ sportId: string }> }) {
  const { sportId } = await params
  const { tournamentId, judgeCode } = await req.json()
  const supabase = createServiceClient()

  // Get groups ordered A→F
  const { data: groups } = await supabase
    .from('groups').select('*').eq('sport_id', sportId).order('name')
  if (!groups || groups.length !== 6)
    return NextResponse.json({ error: '6 хэсэг байх ёстой, одоо ' + (groups?.length ?? 0) }, { status: 400 })

  const { data: groupTeams } = await supabase
    .from('group_teams').select('*').in('group_id', groups.map((g: any) => g.id))
  const { data: groupMatches } = await supabase
    .from('matches').select('*').eq('sport_id', sportId).eq('stage', 'group')

  // Get top 2 from each group (groups are A=0, B=1, C=2, D=3, E=4, F=5)
  const tops: { first: string | null; second: string | null }[] = groups.map((group: any) => {
    const teamIds = (groupTeams ?? []).filter((gt: any) => gt.group_id === group.id).map((gt: any) => gt.team_id)
    const gm = (groupMatches ?? []).filter((m: any) => m.group_id === group.id)
    const ranked = calcStandings(teamIds, gm)
    return { first: ranked[0] ?? null, second: ranked[1] ?? null }
  })

  const [A, B, C, D, E, F] = tops

  // Delete existing knockout
  await supabase.from('matches').delete().eq('sport_id', sportId).neq('stage', 'group')

  const jc = judgeCode ?? null

  /**
   * Round 4 — Эхний шат (6 match)
   * match_number 1-6 нь FIXTURE-тэй тул дарааллыг хатуу баримтална
   */
  const r4: any[] = [
    { match_number: 1, team1_id: A.first,  team2_id: F.second }, // A1 vs F2 → SF1 team1
    { match_number: 2, team1_id: B.first,  team2_id: C.second }, // B1 vs C2 → QF1
    { match_number: 3, team1_id: C.first,  team2_id: D.second }, // C1 vs D2 → QF1
    { match_number: 4, team1_id: D.first,  team2_id: E.second }, // D1 vs E2 → QF2
    { match_number: 5, team1_id: E.first,  team2_id: B.second }, // E1 vs B2 → QF2
    { match_number: 6, team1_id: F.first,  team2_id: A.second }, // F1 vs A2 → SF2 team2
  ].map(m => ({
    tournament_id: tournamentId, sport_id: sportId,
    stage: 'knockout', round: 4, judge_code: jc,
    status: m.team1_id && m.team2_id ? 'scheduled' : 'pending',
    team1_score: null, team2_score: null, winner_id: null,
    ...m,
  }))

  /** Round 3 — QF (2 match, team TBD) */
  const r3: any[] = [1, 2].map(mn => ({
    tournament_id: tournamentId, sport_id: sportId,
    stage: 'knockout', round: 3, match_number: mn,
    judge_code: jc, status: 'pending',
    team1_id: null, team2_id: null, team1_score: null, team2_score: null, winner_id: null,
  }))

  /** Round 2 — SF (2 match, team TBD) */
  const r2: any[] = [1, 2].map(mn => ({
    tournament_id: tournamentId, sport_id: sportId,
    stage: 'knockout', round: 2, match_number: mn,
    judge_code: jc, status: 'pending',
    team1_id: null, team2_id: null, team1_score: null, team2_score: null, winner_id: null,
  }))

  /** Round 1 — Final */
  const r1: any[] = [{
    tournament_id: tournamentId, sport_id: sportId,
    stage: 'knockout', round: 1, match_number: 1,
    judge_code: jc, status: 'pending',
    team1_id: null, team2_id: null, team1_score: null, team2_score: null, winner_id: null,
  }]

  /** Round 0 — 3-р байр */
  const r0: any[] = [{
    tournament_id: tournamentId, sport_id: sportId,
    stage: 'third', round: 0, match_number: 1,
    judge_code: jc, status: 'pending',
    team1_id: null, team2_id: null, team1_score: null, team2_score: null, winner_id: null,
  }]

  const allMatches = [...r4, ...r3, ...r2, ...r1, ...r0]
  const { error } = await supabase.from('matches').insert(allMatches)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, count: allMatches.length, structure: '6G×2=12 custom bracket' })
}
