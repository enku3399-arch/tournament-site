import { createServiceClient } from '@/lib/supabase-server'

export async function GET(_req: Request, ctx: RouteContext<'/api/admin/sport/[sportId]/matches'>) {
  const { sportId } = await ctx.params
  const supabase = await createServiceClient()
  const { data: matches, error } = await supabase
    .from('matches')
    .select('*, team1:team1_id(id,name), team2:team2_id(id,name), winner:winner_id(id,name), group:group_id(id,name)')
    .eq('sport_id', sportId)
    .order('match_number')
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ matches: matches ?? [] })
}
