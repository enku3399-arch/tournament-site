import { createServiceClient } from '@/lib/supabase-server'

const SELECT = '*, team1:team1_id(id,name), team2:team2_id(id,name), winner:winner_id(id,name), group:group_id(id,name)'

export async function GET(_req: Request, ctx: RouteContext<'/api/admin/sport/[sportId]/matches'>) {
  const { sportId } = await ctx.params
  const supabase = await createServiceClient()
  const { data: matches, error } = await supabase
    .from('matches')
    .select(SELECT)
    .eq('sport_id', sportId)
    .order('match_number')
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ matches: matches ?? [] })
}

export async function POST(req: Request, ctx: RouteContext<'/api/admin/sport/[sportId]/matches'>) {
  const { sportId } = await ctx.params
  const { tournamentId, court } = await req.json()
  const supabase = await createServiceClient()

  const [{ data: allMatches }, { data: knockoutMatches }] = await Promise.all([
    supabase.from('matches').select('match_number').eq('sport_id', sportId)
      .order('match_number', { ascending: false }).limit(1),
    supabase.from('matches').select('schedule_order').eq('sport_id', sportId)
      .eq('stage', 'knockout').order('schedule_order', { ascending: false }).limit(1),
  ])

  const nextNumber = ((allMatches?.[0]?.match_number ?? 0) + 1)
  const nextKnockoutOrder = ((knockoutMatches?.[0]?.schedule_order ?? 0) + 1)

  const { data, error } = await supabase
    .from('matches')
    .insert({
      sport_id: sportId,
      tournament_id: tournamentId,
      stage: 'knockout',
      round: 1,
      match_number: nextNumber,
      status: 'scheduled',
      court: court ?? 1,
      schedule_order: nextKnockoutOrder,
    })
    .select(SELECT)
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ match: data })
}
