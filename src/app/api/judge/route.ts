import { createServiceClient } from '@/lib/supabase-server'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return Response.json({ error: 'Код оруулна уу' }, { status: 400 })

  const supabase = createServiceClient()

  const { data: matches, error } = await supabase
    .from('matches')
    .select(`
      id, status, round, match_number, team1_score, team2_score, judge_code, stage, scheduled_at, tournament_id,
      team1:team1_id(id, name),
      team2:team2_id(id, name),
      winner:winner_id(id, name),
      sport:sport_id(id, name, sport_type, gender),
      group:group_id(id, name)
    `)
    .eq('judge_code', code)
    .order('match_number')

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ matches: matches ?? [], code })
}
