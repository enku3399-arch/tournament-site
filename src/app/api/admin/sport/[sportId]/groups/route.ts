import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET(_req: Request, { params }: { params: Promise<{ sportId: string }> }) {
  const { sportId } = await params
  const supabase = createServiceClient()
  const { data: groups, error } = await supabase
    .from('groups')
    .select('*')
    .eq('sport_id', sportId)
    .order('name')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ groups: groups ?? [] })
}
