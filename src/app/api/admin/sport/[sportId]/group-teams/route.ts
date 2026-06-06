import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET(_req: Request, { params }: { params: Promise<{ sportId: string }> }) {
  const { sportId } = await params
  const supabase = createServiceClient()

  const { data: groups } = await supabase
    .from('groups')
    .select('id')
    .eq('sport_id', sportId)

  const groupIds = (groups ?? []).map((g: any) => g.id)
  if (!groupIds.length) return NextResponse.json({ groupTeams: [] })

  const { data: groupTeams, error } = await supabase
    .from('group_teams')
    .select('*')
    .in('group_id', groupIds)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ groupTeams: groupTeams ?? [] })
}
