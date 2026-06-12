import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET(_req: Request, { params }: { params: Promise<{ sportId: string }> }) {
  const { sportId } = await params
  const sb = createServiceClient()
  const { data, error } = await sb
    .from('darts_results')
    .select('data')
    .eq('sport_id', sportId)
    .single()
  if (error && error.code !== 'PGRST116') return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data?.data ?? null)
}

export async function POST(req: Request, { params }: { params: Promise<{ sportId: string }> }) {
  const { sportId } = await params
  const { tournamentId, data } = await req.json()
  const sb = createServiceClient()

  const { error } = await sb.from('darts_results').upsert(
    { tournament_id: tournamentId, sport_id: sportId, data, updated_at: new Date().toISOString() },
    { onConflict: 'sport_id' }
  )
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
