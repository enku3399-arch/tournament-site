import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET(_req: Request, { params }: { params: Promise<{ sportId: string }> }) {
  const { sportId } = await params
  const supabase = createServiceClient()
  const { data: sport, error } = await supabase
    .from('tournament_sports')
    .select('*')
    .eq('id', sportId)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ sport })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ sportId: string }> }) {
  const { sportId } = await params
  const body = await req.json()
  const supabase = createServiceClient()
  const allowed = ['gender', 'name', 'weight']
  const updates: Record<string, any> = {}
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }
  const { data, error } = await supabase
    .from('tournament_sports')
    .update(updates)
    .eq('id', sportId)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, sport: data })
}
