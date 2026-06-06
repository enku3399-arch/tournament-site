import { createServiceClient } from '@/lib/supabase-server'
import { NextRequest } from 'next/server'

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/admin/teams/[id]'>) {
  const { id } = await ctx.params
  try {
    const { name } = await req.json()
    if (!name?.trim()) return Response.json({ error: 'Нэр хоосон байж болохгүй' }, { status: 400 })
    const supabase = await createServiceClient()
    const { data, error } = await supabase
      .from('teams')
      .update({ name: name.trim() })
      .eq('id', id)
      .select()
      .single()
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ team: data })
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
