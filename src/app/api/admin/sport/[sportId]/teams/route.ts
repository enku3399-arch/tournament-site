import { NextResponse, NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET(req: Request, { params }: { params: Promise<{ sportId: string }> }) {
  const { sportId } = await params
  const supabase = createServiceClient()
  const scope = new URL(req.url).searchParams.get('scope')

  if (scope === 'tournament') {
    const { data: sport } = await supabase
      .from('sports').select('tournament_id').eq('id', sportId).single()
    if (!sport) return NextResponse.json({ teams: [] })
    const { data } = await supabase
      .from('teams')
      .select('id, name, sports(name)')
      .eq('tournament_id', sport.tournament_id)
      .neq('sport_id', sportId)
      .order('name')
    return NextResponse.json({
      teams: (data ?? []).map((t: any) => ({ id: t.id, name: t.name, sport_name: t.sports?.name ?? null }))
    })
  }

  const { data: teams, error } = await supabase
    .from('teams')
    .select('*')
    .eq('sport_id', sportId)
    .order('seed', { nullsFirst: false })
    .order('name')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ teams: teams ?? [] })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ sportId: string }> }) {
  const { sportId } = await params
  try {
    const { name, tournamentId } = await req.json()
    if (!name?.trim()) return NextResponse.json({ error: 'Нэр хоосон байж болохгүй' }, { status: 400 })
    const supabase = createServiceClient()

    // Get current max seed for this sport
    const { data: existing } = await supabase
      .from('teams').select('seed').eq('sport_id', sportId).order('seed', { ascending: false }).limit(1)
    const nextSeed = ((existing?.[0]?.seed ?? 0) as number) + 1

    const { data, error } = await supabase
      .from('teams')
      .insert({ name: name.trim(), sport_id: sportId, tournament_id: tournamentId, seed: nextSeed, status: 'confirmed' })
      .select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ team: data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ sportId: string }> }) {
  const { sportId } = await params
  const { searchParams } = req.nextUrl
  const teamId = searchParams.get('teamId')
  if (!teamId) return NextResponse.json({ error: 'teamId хэрэгтэй' }, { status: 400 })
  const supabase = createServiceClient()
  await supabase.from('group_teams').delete().eq('team_id', teamId)
  await supabase.from('teams').delete().eq('id', teamId).eq('sport_id', sportId)
  return NextResponse.json({ ok: true })
}
