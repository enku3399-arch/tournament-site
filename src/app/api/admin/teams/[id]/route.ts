import { createServiceClient } from '@/lib/supabase-server'
import { NextRequest } from 'next/server'

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/admin/teams/[id]'>) {
  const { id } = await ctx.params
  try {
    const body = await req.json()
    const supabase = await createServiceClient()
    // Allow updating name or status
    const update: Record<string, string> = {}
    if (body.name !== undefined) {
      if (!body.name?.trim()) return Response.json({ error: 'Нэр хоосон байж болохгүй' }, { status: 400 })
      update.name = body.name.trim()
    }
    if (body.status !== undefined) update.status = body.status
    const { data, error } = await supabase.from('teams').update(update).eq('id', id).select().single()
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ team: data })
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/admin/teams/[id]'>) {
  const { id } = await ctx.params
  const supabase = await createServiceClient()
  const { error } = await supabase.from('teams').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
