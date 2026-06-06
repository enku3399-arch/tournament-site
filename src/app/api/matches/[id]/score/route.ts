import { createServiceClient } from '@/lib/supabase-server'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest, ctx: RouteContext<'/api/matches/[id]/score'>) {
  const { id } = await ctx.params
  try {
    const body = await req.json()
    const { team1_score, team2_score, status, finalize, reset, judge_code } = body

    const supabase = await createServiceClient()

    // Fetch the match to verify judge_code and get team IDs
    const { data: match, error: fetchErr } = await supabase
      .from('matches')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchErr || !match) return Response.json({ error: 'Тоглолт олдсонгүй' }, { status: 404 })

    // Verify judge code if provided (not required for reset from admin)
    if (judge_code && judge_code !== match.judge_code) {
      return Response.json({ error: 'Зөв код биш' }, { status: 403 })
    }

    // Reset match to scheduled state
    if (reset) {
      const { data, error } = await supabase
        .from('matches')
        .update({ status: 'scheduled', team1_score: null, team2_score: null, winner_id: null })
        .eq('id', id)
        .select(`*, team1:team1_id(*), team2:team2_id(*), winner:winner_id(*), sport:sport_id(*)`)
        .single()
      if (error) return Response.json({ error: error.message }, { status: 500 })
      return Response.json(data)
    }

    const updates: Record<string, any> = {
      team1_score: team1_score ?? match.team1_score,
      team2_score: team2_score ?? match.team2_score,
    }

    if (status) updates.status = status

    if (finalize) {
      const s1 = team1_score ?? match.team1_score ?? 0
      const s2 = team2_score ?? match.team2_score ?? 0
      updates.status = 'completed'
      updates.team1_score = s1
      updates.team2_score = s2
      if (s1 !== s2) {
        updates.winner_id = s1 > s2 ? match.team1_id : match.team2_id
      }

      // Advance winner to next round bracket slot (knockout only)
      if (updates.winner_id && match.stage === 'knockout') {
        const r = match.round as number
        const mn = match.match_number as number

        // Custom 12-team bracket (6 groups × 2): special advancement map
        // R4M1(A1vF2)→R2M1 t1, R4M2(B1vC2)→R3M1 t1, R4M3(C1vD2)→R3M1 t2
        // R4M4(D1vE2)→R3M2 t1, R4M5(E1vB2)→R3M2 t2, R4M6(F1vA2)→R2M2 t2
        // R3M1(QF1)→R2M1 t2, R3M2(QF2)→R2M2 t1
        // R2M1(SF1)→R1M1 t1, R2M2(SF2)→R1M1 t2
        type Adv = { round: number; match: number; slot: 1 | 2 }
        const CUSTOM_MAP: Record<string, Adv> = {
          '4-1': { round: 2, match: 1, slot: 1 },
          '4-2': { round: 3, match: 1, slot: 1 },
          '4-3': { round: 3, match: 1, slot: 2 },
          '4-4': { round: 3, match: 2, slot: 1 },
          '4-5': { round: 3, match: 2, slot: 2 },
          '4-6': { round: 2, match: 2, slot: 2 },
          '3-1': { round: 2, match: 1, slot: 2 },
          '3-2': { round: 2, match: 2, slot: 1 },
          '2-1': { round: 1, match: 1, slot: 1 },
          '2-2': { round: 1, match: 1, slot: 2 },
        }
        const customKey = `${r}-${mn}`
        const adv = CUSTOM_MAP[customKey]

        if (adv) {
          // Custom 12-team bracket
          const { data: nextMatch } = await supabase
            .from('matches').select('id')
            .eq('tournament_id', match.tournament_id)
            .eq('sport_id', match.sport_id)
            .eq('round', adv.round)
            .eq('match_number', adv.match)
            .maybeSingle()
          if (nextMatch) {
            await supabase.from('matches').update(
              adv.slot === 1 ? { team1_id: updates.winner_id } : { team2_id: updates.winner_id }
            ).eq('id', nextMatch.id)
          }

          // 3rd place: SF losers
          if (r === 2) {
            const loser = updates.winner_id === match.team1_id ? match.team2_id : match.team1_id
            const { data: thirdMatch } = await supabase
              .from('matches').select('id')
              .eq('tournament_id', match.tournament_id)
              .eq('sport_id', match.sport_id)
              .eq('stage', 'third')
              .maybeSingle()
            if (thirdMatch && loser) {
              await supabase.from('matches').update(
                mn === 1 ? { team1_id: loser } : { team2_id: loser }
              ).eq('id', thirdMatch.id)
            }
          }
        } else if (r > 1) {
          // Generic advancement for other bracket sizes
          const nextRound = r - 1
          const nextMatchNum = Math.ceil(mn / 2)
          const isFirstSlot = mn % 2 !== 0
          const { data: nextMatch } = await supabase
            .from('matches').select('id')
            .eq('tournament_id', match.tournament_id)
            .eq('sport_id', match.sport_id)
            .eq('round', nextRound)
            .eq('match_number', nextMatchNum)
            .maybeSingle()
          if (nextMatch) {
            await supabase.from('matches').update(
              isFirstSlot ? { team1_id: updates.winner_id } : { team2_id: updates.winner_id }
            ).eq('id', nextMatch.id)
          }
        }
      }
    }

    const { data, error } = await supabase
      .from('matches')
      .update(updates)
      .eq('id', id)
      .select(`*, team1:team1_id(*), team2:team2_id(*), winner:winner_id(*), sport:sport_id(*)`)
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json(data)
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
