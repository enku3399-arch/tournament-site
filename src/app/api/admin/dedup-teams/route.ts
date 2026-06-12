import { createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { TOURNAMENT_ID } from '@/lib/medal-calc'

export async function GET() {
  const supabase = createServiceClient()

  const [{ data: teams }, { data: sports }, { data: matches }] = await Promise.all([
    supabase.from('teams').select('id, name, sport_id, created_at').eq('tournament_id', TOURNAMENT_ID),
    supabase.from('tournament_sports').select('id, name').eq('tournament_id', TOURNAMENT_ID),
    supabase.from('matches').select('team1_id, team2_id, winner_id').eq('tournament_id', TOURNAMENT_ID),
  ])

  if (!teams || !sports) return NextResponse.json({ groups: [] })

  // Track which team IDs appear in any match
  const inMatches = new Set<string>()
  for (const m of (matches ?? [])) {
    if (m.team1_id) inMatches.add(m.team1_id)
    if (m.team2_id) inMatches.add(m.team2_id)
    if (m.winner_id) inMatches.add(m.winner_id)
  }

  // Group by sport_id + name
  const groups = new Map<string, { id: string; name: string; sport_id: string; created_at: string }[]>()
  for (const t of teams) {
    const key = `${t.sport_id}||${t.name}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(t)
  }

  const sportMap = new Map((sports ?? []).map(s => [s.id, s.name]))

  const duplicates = [...groups.entries()]
    .filter(([, g]) => g.length > 1)
    .map(([key, g]) => {
      const [sport_id] = key.split('||')
      return {
        sport_id,
        sport_name: sportMap.get(sport_id) ?? sport_id,
        team_name: g[0].name,
        entries: g
          .map(t => ({ id: t.id, created_at: t.created_at, active: inMatches.has(t.id) }))
          .sort((a, b) => (b.active ? 1 : 0) - (a.active ? 1 : 0)),
      }
    })
    .sort((a, b) => a.sport_name.localeCompare(b.sport_name) || a.team_name.localeCompare(b.team_name))

  return NextResponse.json({ groups: duplicates })
}

export async function DELETE(req: Request) {
  const { ids } = await req.json() as { ids: string[] }
  if (!Array.isArray(ids) || ids.length === 0)
    return NextResponse.json({ error: 'ids required' }, { status: 400 })

  const supabase = createServiceClient()
  const { error } = await supabase.from('teams').delete().in('id', ids)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: ids.length })
}
