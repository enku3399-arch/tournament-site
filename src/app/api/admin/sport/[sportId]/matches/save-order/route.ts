import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

// POST /api/admin/sport/[sportId]/matches/save-order
// Body: { orders: Array<{id: string, schedule_order: number}> }
export async function POST(req: Request, { params }: { params: Promise<{ sportId: string }> }) {
  const { sportId } = await params
  const { orders } = await req.json()
  const supabase = createServiceClient()

  await Promise.all(
    orders.map(({ id, schedule_order }: { id: string; schedule_order: number }) =>
      supabase.from('matches').update({ schedule_order }).eq('id', id).eq('sport_id', sportId)
    )
  )

  return NextResponse.json({ ok: true })
}
