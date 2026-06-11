import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

/**
 * POST — Add missing QF/SF/Final rounds without touching existing first-round data.
 * Assumes first round already exists at round=1 with 6 matches (12-team bracket).
 * Adds: round=2 (2 QF), round=3 (2 SF), round=4 (1 Final), stage='third' (1 match).
 */
export async function POST(req: Request, { params }: { params: Promise<{ sportId: string }> }) {
  const { sportId } = await params
  const { tournamentId, judgeCode: explicitCode } = await req.json()
  const supabase = createServiceClient()

  const { data: existing } = await supabase
    .from('matches')
    .select('round, match_number')
    .eq('sport_id', sportId)
    .eq('stage', 'knockout')

  if (!existing) return NextResponse.json({ error: 'DB error' }, { status: 500 })

  const rounds = new Set(existing.map((m: any) => m.round))
  const firstRoundCount = existing.filter((m: any) => m.round === Math.min(...rounds)).length

  if (firstRoundCount !== 6) {
    return NextResponse.json({ error: `6-н эхний шатны тоглолт хэрэгтэй, одоо ${firstRoundCount} байна` }, { status: 400 })
  }

  // Auto-detect judge_code from existing matches
  const { data: jcRow } = await supabase
    .from('matches').select('judge_code').eq('sport_id', sportId).not('judge_code', 'is', null).limit(1).single()
  const jc = explicitCode ?? jcRow?.judge_code ?? ''

  // Check which rounds are missing
  const toAdd: any[] = []

  if (!rounds.has(2)) {
    for (let m = 1; m <= 2; m++) {
      toAdd.push({ tournament_id: tournamentId, sport_id: sportId, stage: 'knockout', round: 2, match_number: m, judge_code: jc, status: 'pending', team1_id: null, team2_id: null })
    }
  }
  if (!rounds.has(3)) {
    for (let m = 1; m <= 2; m++) {
      toAdd.push({ tournament_id: tournamentId, sport_id: sportId, stage: 'knockout', round: 3, match_number: m, judge_code: jc, status: 'pending', team1_id: null, team2_id: null })
    }
  }
  if (!rounds.has(4)) {
    toAdd.push({ tournament_id: tournamentId, sport_id: sportId, stage: 'knockout', round: 4, match_number: 1, judge_code: jc, status: 'pending', team1_id: null, team2_id: null })
  }

  // Check third place
  const { data: thirdCheck } = await supabase
    .from('matches').select('id').eq('sport_id', sportId).eq('stage', 'third').limit(1)
  if (!thirdCheck?.length) {
    toAdd.push({ tournament_id: tournamentId, sport_id: sportId, stage: 'third', round: 5, match_number: 1, judge_code: jc, status: 'pending', team1_id: null, team2_id: null })
  }

  if (toAdd.length === 0) {
    return NextResponse.json({ ok: true, count: 0, message: 'Бүх шат бүрэн байна' })
  }

  const { error } = await supabase.from('matches').insert(toAdd)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, count: toAdd.length })
}
