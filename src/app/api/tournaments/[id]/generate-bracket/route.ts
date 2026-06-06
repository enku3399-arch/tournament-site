import { createServiceClient } from '@/lib/supabase-server'
import { NextRequest } from 'next/server'

// Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function nextPow2(n: number) {
  let p = 1
  while (p < n) p <<= 1
  return p
}

export async function POST(req: NextRequest, ctx: RouteContext<'/api/tournaments/[id]/generate-bracket'>) {
  const { id } = await ctx.params
  try {
    const { sport_id } = await req.json()
    const supabase = await createServiceClient()

    // Fetch teams for this sport
    const { data: teams, error: tErr } = await supabase
      .from('teams')
      .select('*')
      .eq('tournament_id', id)
      .eq('sport_id', sport_id)
      .order('seed', { nullsFirst: false })
      .order('name')

    if (tErr) return Response.json({ error: tErr.message }, { status: 500 })
    if (!teams || teams.length < 2) return Response.json({ error: 'Хамгийн багадаа 2 баг хэрэгтэй' }, { status: 400 })

    // Delete existing matches for this sport
    await supabase.from('matches').delete().eq('tournament_id', id).eq('sport_id', sport_id)

    // Build single-elimination bracket
    const seeded = teams.filter(t => t.seed != null).sort((a, b) => (a.seed ?? 0) - (b.seed ?? 0))
    const unseeded = shuffle(teams.filter(t => t.seed == null))
    const ordered = [...seeded, ...unseeded]
    const size = nextPow2(ordered.length)
    // Pad with byes (null)
    const slots: (typeof ordered[0] | null)[] = [...ordered, ...Array(size - ordered.length).fill(null)]

    const inserts: any[] = []
    let matchNumber = 1
    for (let i = 0; i < size; i += 2) {
      const t1 = slots[i]
      const t2 = slots[i + 1]
      inserts.push({
        tournament_id: id,
        sport_id,
        team1_id: t1?.id ?? null,
        team2_id: t2?.id ?? null,
        round: 1,
        match_number: matchNumber++,
        status: t2 === null ? 'completed' : 'scheduled',
        winner_id: t2 === null ? t1?.id ?? null : null,
      })
    }

    // Add placeholder matches for subsequent rounds
    const rounds = Math.log2(size)
    for (let round = 2; round <= rounds; round++) {
      const matchesInRound = size / Math.pow(2, round)
      for (let m = 1; m <= matchesInRound; m++) {
        inserts.push({
          tournament_id: id,
          sport_id,
          team1_id: null,
          team2_id: null,
          round,
          match_number: m,
          status: 'scheduled',
        })
      }
    }

    const { data: created, error: mErr } = await supabase
      .from('matches')
      .insert(inserts)
      .select(`*, team1:team1_id(*), team2:team2_id(*), winner:winner_id(*), sport:sport_id(*)`)

    if (mErr) return Response.json({ error: mErr.message }, { status: 500 })

    return Response.json({ matches: created })
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
