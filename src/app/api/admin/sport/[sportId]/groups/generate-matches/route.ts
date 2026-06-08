import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

function roundRobin(teamIds: string[]): [string, string][][] {
  const teams = [...teamIds]
  if (teams.length % 2 !== 0) teams.push('BYE')
  const n = teams.length
  const rounds: [string, string][][] = []
  for (let r = 0; r < n - 1; r++) {
    const pairs: [string, string][] = []
    for (let i = 0; i < n / 2; i++) {
      const a = teams[i]
      const b = teams[n - 1 - i]
      if (a !== 'BYE' && b !== 'BYE') pairs.push([a, b])
    }
    rounds.push(pairs)
    teams.splice(1, 0, teams.pop()!)
  }
  return rounds
}

const COURT2_GROUPS = ['D', 'E', 'F']

export async function POST(req: Request, { params }: { params: Promise<{ sportId: string }> }) {
  const { sportId } = await params
  const { tournamentId, judgeCode, useTwoCourts = true } = await req.json()
  const supabase = createServiceClient()

  const { data: groups } = await supabase
    .from('groups')
    .select('*')
    .eq('sport_id', sportId)
    .order('name')

  if (!groups?.length) return NextResponse.json({ error: 'Хэсэг олдсонгүй. Эхлээд тохиргоо хадгална уу.' }, { status: 400 })

  const { data: groupTeams } = await supabase
    .from('group_teams')
    .select('*')
    .in('group_id', groups.map((g: any) => g.id))

  await supabase.from('matches').delete().eq('sport_id', sportId).eq('stage', 'group')

  // Collect rounds per group
  type GroupData = { group: any; court: number; rounds: [string, string][][] }
  const groupData: GroupData[] = []

  for (const group of groups as any[]) {
    const teamIds = (groupTeams ?? [])
      .filter((gt: any) => gt.group_id === group.id)
      .map((gt: any) => gt.team_id)
    if (teamIds.length < 2) continue
    const court = useTwoCourts && COURT2_GROUPS.includes(group.name?.toUpperCase()) ? 2 : 1
    groupData.push({ group, court, rounds: roundRobin(teamIds) })
  }

  if (!groupData.length) return NextResponse.json({ error: 'Тоглолт үүсгэх баг хангалтгүй байна' }, { status: 400 })

  // Interleave by round: round 1 of all groups, then round 2, etc.
  const maxRounds = Math.max(...groupData.map(g => g.rounds.length))
  const matchRows: any[] = []
  let matchNumber = 1
  const courtOrderCounters: Record<number, number> = { 1: 1, 2: 1 }

  for (let r = 0; r < maxRounds; r++) {
    for (const { group, court, rounds } of groupData) {
      if (r >= rounds.length) continue
      for (const [t1, t2] of rounds[r]) {
        matchRows.push({
          tournament_id: tournamentId,
          sport_id: sportId,
          stage: 'group',
          group_id: group.id,
          round: r + 1,
          match_number: matchNumber++,
          team1_id: t1,
          team2_id: t2,
          status: 'scheduled',
          court,
          schedule_order: courtOrderCounters[court]++,
          ...(judgeCode ? { judge_code: judgeCode } : {}),
        })
      }
    }
  }

  const { error } = await supabase.from('matches').insert(matchRows)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, count: matchRows.length })
}
