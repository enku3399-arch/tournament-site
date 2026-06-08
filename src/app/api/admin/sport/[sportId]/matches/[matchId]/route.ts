import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

type Context = { params: Promise<{ sportId: string; matchId: string }> }

export async function PATCH(req: Request, ctx: Context) {
  const { sportId, matchId } = await ctx.params
  const body = await req.json()
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('matches')
    .update(body)
    .eq('id', matchId)
    .eq('sport_id', sportId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, ctx: Context) {
  const { sportId, matchId } = await ctx.params
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('matches')
    .delete()
    .eq('id', matchId)
    .eq('sport_id', sportId)
    .eq('stage', 'knockout')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
