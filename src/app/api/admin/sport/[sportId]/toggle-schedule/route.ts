import { createServiceClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ sportId: string }> }
) {
  const { sportId } = await params
  const supabase = createServiceClient()

  // Одоогийн жагсаалт унших
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'schedule_sports')
    .maybeSingle()

  const current: string[] = Array.isArray(data?.value) ? data.value : []

  // Toggle
  const next = current.includes(sportId)
    ? current.filter(id => id !== sportId)
    : [...current, sportId]

  const { error } = await supabase
    .from('site_settings')
    .upsert({ key: 'schedule_sports', value: next }, { onConflict: 'key' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, visible: next.includes(sportId), schedule_sports: next })
}
