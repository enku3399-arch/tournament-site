import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { type, label, gender, weight } = await req.json()
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('tournament_sports')
    .insert({
      tournament_id: id,
      sport_type: type,
      name: label,
      gender: gender ?? null,
      weight: weight ?? 1,
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, sport: data })
}
