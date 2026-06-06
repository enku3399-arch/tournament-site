import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function POST(req: Request, { params }: { params: Promise<{ sportId: string }> }) {
  const { sportId } = await params
  const { tournamentId, groupCount, advanceCount, assignments } = await req.json()

  const supabase = createServiceClient()

  // Update sport metadata
  const { error: sportErr } = await supabase
    .from('tournament_sports')
    .update({ format: 'groups_knockout', groups_count: groupCount, advance_per_group: advanceCount })
    .eq('id', sportId)
  if (sportErr) return NextResponse.json({ error: 'Sport update failed: ' + sportErr.message }, { status: 500 })

  const letters = Array.from({ length: groupCount }, (_, i) => String.fromCharCode(65 + i))

  // Fetch existing groups for this sport
  const { data: existingGroups, error: fetchErr } = await supabase
    .from('groups')
    .select('*')
    .eq('sport_id', sportId)
    .order('name')

  if (fetchErr) return NextResponse.json({ error: 'Groups fetch failed: ' + fetchErr.message }, { status: 500 })

  const existing: any[] = existingGroups ?? []

  // Delete groups no longer needed
  const toDelete = existing.filter(g => !letters.includes(g.name))
  for (const g of toDelete) {
    await supabase.from('groups').delete().eq('id', g.id)
  }

  // Build letter → groupId map
  const groupMap: Record<string, string> = {}
  for (const g of existing) {
    if (letters.includes(g.name)) groupMap[g.name] = g.id
  }

  // Create missing groups
  for (const letter of letters) {
    if (!groupMap[letter]) {
      const { data: inserted, error: insertErr } = await supabase
        .from('groups')
        .insert({ tournament_id: tournamentId, sport_id: sportId, name: letter, advance_count: advanceCount })
        .select()
        .single()
      if (insertErr) return NextResponse.json({ error: `Group ${letter} insert failed: ` + insertErr.message }, { status: 500 })
      if (inserted) groupMap[letter] = (inserted as any).id
    } else {
      await supabase.from('groups').update({ advance_count: advanceCount }).eq('id', groupMap[letter])
    }
  }

  // Verify all groups were created
  const missingLetters = letters.filter(l => !groupMap[l])
  if (missingLetters.length) {
    return NextResponse.json({ error: `Хэсэг үүсгэж чадсангүй: ${missingLetters.join(', ')}` }, { status: 500 })
  }

  // Clear and re-insert group_team assignments
  const groupIds = Object.values(groupMap)
  const { error: deleteErr } = await supabase.from('group_teams').delete().in('group_id', groupIds)
  if (deleteErr) return NextResponse.json({ error: 'Clear assignments failed: ' + deleteErr.message }, { status: 500 })

  const rows: { group_id: string; team_id: string }[] = []
  for (const [teamId, letter] of Object.entries(assignments as Record<string, string>)) {
    const groupId = groupMap[letter]
    if (groupId) rows.push({ group_id: groupId, team_id: teamId })
  }

  if (rows.length) {
    const { error: insertErr } = await supabase.from('group_teams').insert(rows)
    if (insertErr) return NextResponse.json({ error: 'Assignments insert failed: ' + insertErr.message }, { status: 500 })
  }

  // Return created groups so client can update state without re-fetching
  const createdGroups = letters.map(l => ({
    id: groupMap[l],
    name: l,
    advance_count: advanceCount,
  }))

  return NextResponse.json({ ok: true, groups: createdGroups })
}
