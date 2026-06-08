import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

function getSportBase(name: string, sportType: string): number {
  const n = name.toLowerCase()
  const t = sportType.toLowerCase()
  if (n.includes('сагс') || n.includes('волейбол') || t === 'basketball' || t === 'volleyball') return 1
  if (n.includes('теннис') || n.includes('дартс') || t === 'table_tennis' || t === 'tennis' || t === 'darts') return 3
  if (n.includes('шатар') || t === 'chess') return 5
  return 1
}

function calcScore(teamId: string, base: number, matches: any[]): number {
  // 1. Финал (round=1, stage='knockout')
  const final = matches.find(
    m => m.stage === 'knockout' && m.round === 1 && m.status === 'completed'
      && (m.team1_id === teamId || m.team2_id === teamId),
  )
  if (final) return final.winner_id === teamId ? base : base + 1

  // 2. 3-р байрны тоглолт
  const third = matches.find(
    m => m.stage === 'third' && m.status === 'completed'
      && (m.team1_id === teamId || m.team2_id === teamId),
  )
  if (third) return third.winner_id === teamId ? base + 2 : base + 3

  // 3. Нугалааны хамгийн гүн алдал (бага round = гүн)
  const koLoss = matches
    .filter(m =>
      m.stage === 'knockout' && m.status === 'completed'
      && m.winner_id !== teamId
      && (m.team1_id === teamId || m.team2_id === teamId),
    )
    .sort((a, b) => a.round - b.round)[0]

  if (koLoss) {
    if (koLoss.round === 2) return base + 3   // SF унасан (3-р байрны тоглолт хүлээгдэж буй)
    return base + 1 + koLoss.round             // round=3(QF)→base+4, round=4→base+5
  }

  // 4. Зөвхөн хэсгийн шат
  return base + 6
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServiceClient()

  const [{ data: sports }, { data: teams }, { data: matches }] = await Promise.all([
    supabase
      .from('tournament_sports')
      .select('id, name, sport_type, weight')
      .eq('tournament_id', id)
      .order('weight', { ascending: false }),
    supabase
      .from('teams')
      .select('id, name, sport_id')
      .eq('tournament_id', id),
    supabase
      .from('matches')
      .select('id, stage, round, sport_id, team1_id, team2_id, winner_id, status')
      .eq('tournament_id', id),
  ])

  const sportList = sports ?? []
  const teamList = teams ?? []
  const matchList = matches ?? []

  // Бүх аймгийн нэрийг цуглуулах
  const aimagNames = Array.from(new Set(teamList.map((t: any) => t.name as string)))

  const standings = aimagNames.map(aimagName => {
    const scores: {
      sportId: string
      score: number
      base: number
      participated: boolean
    }[] = []
    let total = 0

    for (const sport of sportList as any[]) {
      const base = getSportBase(sport.name, sport.sport_type)
      const team = teamList.find((t: any) => t.name === aimagName && t.sport_id === sport.id)

      if (!team) {
        scores.push({ sportId: sport.id, score: 10, base, participated: false })
        total += 10
      } else {
        const sportMatches = matchList.filter((m: any) => m.sport_id === sport.id)
        const score = calcScore((team as any).id, base, sportMatches)
        scores.push({ sportId: sport.id, score, base, participated: true })
        total += score
      }
    }

    return { name: aimagName, scores, total }
  })

  standings.sort((a, b) => a.total - b.total || a.name.localeCompare(b.name, 'mn'))

  return NextResponse.json({ standings, sports: sportList })
}
