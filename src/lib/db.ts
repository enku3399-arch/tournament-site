import { createClient } from './supabase-server'
import type { Tournament, TournamentSport, Team, Match, MatchWithTeams } from './types'

export async function getTournaments(): Promise<Tournament[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('tournaments')
    .select('*')
    .neq('status', 'draft')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getTournament(id: string): Promise<Tournament | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .single()
  return data
}

export async function getTournamentSports(tournamentId: string): Promise<TournamentSport[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('tournament_sports')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('created_at')
  return data ?? []
}

export async function getTeams(tournamentId: string, sportId?: string): Promise<Team[]> {
  const supabase = createClient()
  let q = supabase.from('teams').select('*').eq('tournament_id', tournamentId)
  if (sportId) q = q.eq('sport_id', sportId)
  const { data } = await q.order('seed', { nullsFirst: false }).order('name')
  return data ?? []
}

export async function getMatches(tournamentId: string, sportId?: string): Promise<MatchWithTeams[]> {
  const supabase = createClient()
  let q = supabase
    .from('matches')
    .select(`*, team1:team1_id(*), team2:team2_id(*), winner:winner_id(*), sport:sport_id(*)`)
    .eq('tournament_id', tournamentId)
  if (sportId) q = q.eq('sport_id', sportId)
  const { data } = await q.order('round').order('match_number')
  return (data ?? []) as MatchWithTeams[]
}

export async function getMatch(matchId: string): Promise<MatchWithTeams | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('matches')
    .select(`*, team1:team1_id(*), team2:team2_id(*), winner:winner_id(*), sport:sport_id(*)`)
    .eq('id', matchId)
    .single()
  return data as MatchWithTeams | null
}

export function calcCombinedStandings(
  sports: TournamentSport[],
  allTeams: Team[],
  allMatches: Match[]
): Map<string, { team: Team; score: number; details: Record<string, number> }> {
  const result = new Map<string, { team: Team; score: number; details: Record<string, number> }>()

  for (const team of allTeams) {
    result.set(team.id, { team, score: 0, details: {} })
  }

  for (const sport of sports) {
    const sportMatches = allMatches.filter(m => m.sport_id === sport.id && m.status === 'completed')
    const sportTeams = allTeams.filter(t => t.sport_id === sport.id)

    const winsMap = new Map<string, number>()
    for (const t of sportTeams) winsMap.set(t.id, 0)
    for (const m of sportMatches) {
      if (m.winner_id) winsMap.set(m.winner_id, (winsMap.get(m.winner_id) ?? 0) + 1)
    }

    const sorted = [...winsMap.entries()].sort((a, b) => b[1] - a[1])
    sorted.forEach(([teamId], idx) => {
      const pts = Math.max(0, sportTeams.length - idx) * sport.weight
      const entry = result.get(teamId)
      if (entry) {
        entry.score += pts
        entry.details[sport.id] = pts
      }
    })
  }

  return result
}
