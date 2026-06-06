import { createServiceClient } from '@/lib/supabase-server'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tournament_id, sport_id, name, contact_name, contact_phone } = body

    if (!tournament_id) return Response.json({ error: 'tournament_id хэрэгтэй' }, { status: 400 })
    if (!name?.trim()) return Response.json({ error: 'Нэр оруулна уу' }, { status: 400 })

    const supabase = await createServiceClient()

    // Verify tournament exists and is accepting registrations
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('status')
      .eq('id', tournament_id)
      .single()

    if (!tournament) return Response.json({ error: 'Тэмцээн олдсонгүй' }, { status: 404 })

    const { data, error } = await supabase
      .from('teams')
      .insert({
        tournament_id,
        sport_id: sport_id || null,
        name: name.trim(),
        contact_name: contact_name?.trim() || null,
        contact_phone: contact_phone?.trim() || null,
        status: 'pending',
      })
      .select()
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json(data)
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
