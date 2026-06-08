import { createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const TOURNAMENT_ID = '0b05625d-2f6d-48de-b69c-d5a23c2f0e3f'

const SPORT_ICON: Record<string, string> = {
  basketball: '🏀', volleyball: '🏐', chess: '♟️', table_tennis: '🏓', darts: '🎯',
}

export async function GET() {
  const supabase = createServiceClient()

  const [{ data: matches }, { data: sports }] = await Promise.all([
    supabase
      .from('matches')
      .select('id, team1_score, team2_score, sport_id, team1_id, team2_id, winner_id, updated_at')
      .eq('tournament_id', TOURNAMENT_ID)
      .eq('status', 'completed')
      .order('updated_at', { ascending: false })
      .limit(30),
    supabase
      .from('tournament_sports')
      .select('id, sport_type')
      .eq('tournament_id', TOURNAMENT_ID),
  ])

  const { data: teams } = await supabase
    .from('teams')
    .select('id, name')
    .eq('tournament_id', TOURNAMENT_ID)

  const teamMap = new Map((teams ?? []).map(t => [t.id, t.name]))
  const sportTypeMap = new Map((sports ?? []).map(s => [s.id, s.sport_type]))

  const results = (matches ?? []).map(m => ({
    id: m.id,
    icon: SPORT_ICON[sportTypeMap.get(m.sport_id) ?? ''] ?? '🏅',
    team1: teamMap.get(m.team1_id) ?? '?',
    team2: teamMap.get(m.team2_id) ?? '?',
    score1: m.team1_score,
    score2: m.team2_score,
    win1: m.winner_id === m.team1_id,
    win2: m.winner_id === m.team2_id,
  }))

  return NextResponse.json(results)
}
