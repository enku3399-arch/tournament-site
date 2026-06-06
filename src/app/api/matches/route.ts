import { createServiceClient } from '@/lib/supabase-server'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tournament_id, sport_id, team1_id, team2_id, round, match_number, scheduled_at } = body

    if (!tournament_id || !sport_id) {
      return Response.json({ error: 'tournament_id, sport_id хэрэгтэй' }, { status: 400 })
    }

    const supabase = await createServiceClient()
    const { data, error } = await supabase
      .from('matches')
      .insert({
        tournament_id,
        sport_id,
        team1_id: team1_id || null,
        team2_id: team2_id || null,
        round: round ?? 1,
        match_number: match_number ?? 1,
        scheduled_at: scheduled_at || null,
        status: 'scheduled',
      })
      .select(`*, team1:team1_id(*), team2:team2_id(*), winner:winner_id(*), sport:sport_id(*)`)
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json(data)
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
