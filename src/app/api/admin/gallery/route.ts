import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const tournamentId = searchParams.get('tournamentId')
  if (!tournamentId) return NextResponse.json({ error: 'tournamentId required' }, { status: 400 })

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('gallery_albums')
    .select('*, photos:gallery_photos(count)')
    .eq('tournament_id', tournamentId)
    .order('sort_order')
    .order('created_at')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const { tournamentId, title, description } = await req.json()
  if (!tournamentId || !title) return NextResponse.json({ error: 'tournamentId, title required' }, { status: 400 })

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('gallery_albums')
    .insert({ tournament_id: tournamentId, title, description: description ?? null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
