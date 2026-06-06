import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const { tournament_id, sport_id, team_name, contact_name, contact_phone, athletes } = await req.json()

    if (!tournament_id || !team_name?.trim())
      return NextResponse.json({ error: 'tournament_id болон team_name шаардлагатай' }, { status: 400 })

    const supabase = createServiceClient()

    // Verify tournament exists
    const { data: tournament } = await supabase
      .from('tournaments').select('id').eq('id', tournament_id).single()
    if (!tournament)
      return NextResponse.json({ error: 'Тэмцээн олдсонгүй' }, { status: 404 })

    // Create team record
    const { data: team, error: teamErr } = await supabase
      .from('teams')
      .insert({
        tournament_id,
        sport_id: sport_id || null,
        name: team_name.trim(),
        contact_name: contact_name || null,
        contact_phone: contact_phone || null,
        status: 'pending',
      })
      .select().single()

    if (teamErr) return NextResponse.json({ error: teamErr.message }, { status: 500 })

    // Create athlete records (athletes table must exist in Supabase)
    const filledAthletes = (athletes ?? []).filter((a: any) => a.name?.trim())
    if (filledAthletes.length > 0) {
      const athleteRecords = filledAthletes.map((a: any) => ({
        team_id: team.id,
        tournament_id,
        sport_id: sport_id || null,
        name: a.name.trim(),
        register_number: a.register_number?.trim() || null,
        rank: a.rank?.trim() || null,
        participation_type: a.participation_type?.trim() || null,
        affiliation: a.affiliation?.trim() || null,
        phone: a.phone?.trim() || null,
        notes: a.notes ?? null,
      }))

      const { error: athleteErr } = await supabase.from('athletes').insert(athleteRecords)
      if (athleteErr) console.error('Athletes insert error:', athleteErr.message)
    }

    return NextResponse.json({ ok: true, team_id: team.id, athlete_count: filledAthletes.length })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const tournament_id = searchParams.get('tournament_id')
  const team_id = searchParams.get('team_id')

  if (!tournament_id && !team_id)
    return NextResponse.json({ error: 'tournament_id эсвэл team_id шаардлагатай' }, { status: 400 })

  const supabase = createServiceClient()
  let query = supabase
    .from('athletes')
    .select(`*, team:teams(id, name, status, contact_name, contact_phone), sport:tournament_sports(id, name, sport_type, gender)`)
    .order('created_at', { ascending: false })

  if (tournament_id) query = query.eq('tournament_id', tournament_id)
  if (team_id) query = query.eq('team_id', team_id)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ athletes: data ?? [] })
}
