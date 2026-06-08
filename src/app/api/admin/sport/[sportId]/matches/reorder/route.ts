import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

// PATCH /api/admin/sport/[sportId]/matches/reorder
// Body: { matchId: string, direction: 'up' | 'down', court: number }
export async function PATCH(req: Request, { params }: { params: Promise<{ sportId: string }> }) {
  const { sportId } = await params
  const { matchId, direction, court } = await req.json()
  const supabase = createServiceClient()

  const { data: matches, error } = await supabase
    .from('matches')
    .select('id, schedule_order, match_number')
    .eq('sport_id', sportId)
    .eq('court', court)
    .order('schedule_order', { nullsFirst: false })
    .order('match_number')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!matches?.length) return NextResponse.json({ error: 'Тоглолт олдсонгүй' }, { status: 404 })

  // Ensure all have schedule_order (fill gaps)
  const ordered = matches.map((m, i) => ({ ...m, schedule_order: m.schedule_order ?? i + 1 }))
  const idx = ordered.findIndex(m => m.id === matchId)
  if (idx === -1) return NextResponse.json({ error: 'Тоглолт олдсонгүй' }, { status: 404 })

  const swapIdx = direction === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= ordered.length) return NextResponse.json({ ok: true })

  const a = ordered[idx]
  const b = ordered[swapIdx]
  const aOrder = a.schedule_order
  const bOrder = b.schedule_order

  const [r1, r2] = await Promise.all([
    supabase.from('matches').update({ schedule_order: bOrder }).eq('id', a.id),
    supabase.from('matches').update({ schedule_order: aOrder }).eq('id', b.id),
  ])
  if (r1.error) return NextResponse.json({ error: r1.error.message }, { status: 500 })
  if (r2.error) return NextResponse.json({ error: r2.error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
