import { createServiceClient } from '@/lib/supabase-server'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, location, start_date, end_date, organizer_name, organizer_phone, prize_info, description, sports } = body

    if (!name?.trim()) return Response.json({ error: 'Нэр оруулна уу' }, { status: 400 })
    if (!sports?.length) return Response.json({ error: 'Спорт сонгоно уу' }, { status: 400 })

    const supabase = await createServiceClient()

    // Create tournament
    const { data: tournament, error: tErr } = await supabase
      .from('tournaments')
      .insert({
        name: name.trim(),
        location: location?.trim() || null,
        start_date: start_date || null,
        end_date: end_date || null,
        organizer_name: organizer_name?.trim() || null,
        organizer_phone: organizer_phone?.trim() || null,
        prize_info: prize_info?.trim() || null,
        description: description?.trim() || null,
        status: 'draft',
      })
      .select()
      .single()

    if (tErr || !tournament) return Response.json({ error: tErr?.message }, { status: 500 })

    // Create sports
    const sportInserts = (sports as any[]).map(s => ({
      tournament_id: tournament.id,
      sport_type: s.type,
      name: s.label,
      gender: s.gender ?? null,
      weight: s.weight ?? 1,
    }))

    const { error: sErr } = await supabase.from('tournament_sports').insert(sportInserts)
    if (sErr) return Response.json({ error: sErr.message }, { status: 500 })

    return Response.json(tournament)
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
