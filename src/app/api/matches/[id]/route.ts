import { createServiceClient } from '@/lib/supabase-server'
import { NextRequest } from 'next/server'

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/matches/[id]'>) {
  const { id } = await ctx.params
  try {
    const body = await req.json()
    const updates: Record<string, any> = {}
    if ('team1_id' in body) updates.team1_id = body.team1_id || null
    if ('team2_id' in body) updates.team2_id = body.team2_id || null
    if (Object.keys(updates).length === 0)
      return Response.json({ error: 'Өөрчлөх утга байхгүй' }, { status: 400 })
    const supabase = await createServiceClient()
    const { data, error } = await supabase
      .from('matches').update(updates).eq('id', id).select('*').single()
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json(data)
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
