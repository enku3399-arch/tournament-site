import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function POST(req: Request, { params }: { params: Promise<{ sportId: string }> }) {
  const { sportId } = await params
  const { tournamentId, teamCount } = await req.json()

  const count = Number(teamCount)
  if (!count || count < 2) return NextResponse.json({ error: 'Дор хаяж 2 баг хэрэгтэй' }, { status: 400 })

  const supabase = createServiceClient()

  await supabase.from('matches').delete().eq('sport_id', sportId).eq('stage', 'knockout')

  const totalRounds = Math.ceil(Math.log2(count))
  const matchRows: any[] = []

  const r1Count = Math.floor(count / 2)
  for (let m = 1; m <= r1Count; m++) {
    matchRows.push({
      tournament_id: tournamentId,
      sport_id: sportId,
      stage: 'knockout',
      round: 1,
      match_number: m,
      team1_id: null,
      team2_id: null,
      status: 'pending',
    })
  }

  let prevCount = r1Count
  for (let round = 2; round <= totalRounds; round++) {
    const cnt = Math.ceil(prevCount / 2)
    for (let m = 1; m <= cnt; m++) {
      matchRows.push({
        tournament_id: tournamentId,
        sport_id: sportId,
        stage: 'knockout',
        round,
        match_number: m,
        team1_id: null,
        team2_id: null,
        status: 'pending',
      })
    }
    prevCount = cnt
  }

  const { error } = await supabase.from('matches').insert(matchRows)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, count: matchRows.length })
}
