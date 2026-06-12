import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET(_req: Request, { params }: { params: Promise<{ sportId: string }> }) {
  const { sportId } = await params
  const sb = createServiceClient()
  const { data, error } = await sb
    .from('chess_standings')
    .select('gender, rank, name, club, pts')
    .eq('sport_id', sportId)
    .order('gender').order('rank')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: Request, { params }: { params: Promise<{ sportId: string }> }) {
  const { sportId } = await params
  const { tournamentId, standings } = await req.json()
  const sb = createServiceClient()

  await sb.from('chess_standings').delete().eq('sport_id', sportId)

  if (standings?.length > 0) {
    const { error } = await sb.from('chess_standings').insert(
      standings.map((s: any) => ({
        tournament_id: tournamentId,
        sport_id: sportId,
        gender: s.gender,
        rank: Number(s.rank),
        name: String(s.name),
        club: String(s.club),
        pts: Number(s.pts),
      }))
    )
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, count: standings?.length ?? 0 })
}
