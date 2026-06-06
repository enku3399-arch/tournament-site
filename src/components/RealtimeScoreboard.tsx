'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
import type { Match, Team, TournamentSport } from '@/lib/types'
import { SPORT_ICONS } from '@/lib/types'

interface Props {
  tournamentId: string
  sports: TournamentSport[]
  initialTeams: Team[]
  initialMatches: Match[]
}

interface StandingRow {
  team: Team
  wins: number
  losses: number
  sportPts: Record<string, number>
  total: number
}

function calcStandings(sports: TournamentSport[], teams: Team[], matches: Match[]): StandingRow[] {
  const rows = new Map<string, StandingRow>()
  for (const t of teams) {
    rows.set(t.id, { team: t, wins: 0, losses: 0, sportPts: {}, total: 0 })
  }

  for (const sport of sports) {
    const sm = matches.filter(m => m.sport_id === sport.id && m.status === 'completed')
    const sportTeams = teams.filter(t => t.sport_id === sport.id)
    const winsMap = new Map<string, number>()
    for (const t of sportTeams) winsMap.set(t.id, 0)

    for (const m of sm) {
      if (m.winner_id) winsMap.set(m.winner_id, (winsMap.get(m.winner_id) ?? 0) + 1)
      if (m.team1_id) {
        const r = rows.get(m.team1_id)
        if (r) {
          if (m.winner_id === m.team1_id) { r.wins++ } else { r.losses++ }
        }
      }
      if (m.team2_id) {
        const r = rows.get(m.team2_id)
        if (r) {
          if (m.winner_id === m.team2_id) { r.wins++ } else { r.losses++ }
        }
      }
    }

    const sorted = [...winsMap.entries()].sort((a, b) => b[1] - a[1])
    sorted.forEach(([tid], idx) => {
      const pts = Math.max(0, sportTeams.length - idx) * sport.weight
      const row = rows.get(tid)
      if (row) {
        row.sportPts[sport.id] = pts
        row.total += pts
      }
    })
  }

  return [...rows.values()].sort((a, b) => b.total - a.total)
}

export default function RealtimeScoreboard({ tournamentId, sports, initialTeams, initialMatches }: Props) {
  const [teams, setTeams] = useState<Team[]>(initialTeams)
  const [matches, setMatches] = useState<Match[]>(initialMatches)

  const standings = calcStandings(sports, teams, matches)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`tournament-${tournamentId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches', filter: `tournament_id=eq.${tournamentId}` },
        (payload) => {
          setMatches(prev => {
            if (payload.eventType === 'INSERT') return [...prev, payload.new as Match]
            if (payload.eventType === 'UPDATE') return prev.map(m => m.id === payload.new.id ? payload.new as Match : m)
            if (payload.eventType === 'DELETE') return prev.filter(m => m.id !== payload.old.id)
            return prev
          })
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'teams', filter: `tournament_id=eq.${tournamentId}` },
        (payload) => {
          setTeams(prev => {
            if (payload.eventType === 'INSERT') return [...prev, payload.new as Team]
            if (payload.eventType === 'UPDATE') return prev.map(t => t.id === payload.new.id ? payload.new as Team : t)
            if (payload.eventType === 'DELETE') return prev.filter(t => t.id !== payload.old.id)
            return prev
          })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [tournamentId])

  if (standings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
        Баг бүртгэгдээгүй байна
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-2">
            <th className="px-4 py-3 text-left font-semibold">#</th>
            <th className="px-4 py-3 text-left font-semibold">Баг</th>
            {sports.map(s => (
              <th key={s.id} className="px-3 py-3 text-center font-semibold">
                {SPORT_ICONS[s.sport_type] ?? '🏅'} {s.name}
              </th>
            ))}
            <th className="px-4 py-3 text-center font-bold text-accent">Нийт</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row, i) => (
            <tr key={row.team.id} className={`border-b border-border last:border-0 ${i === 0 ? 'bg-accent/5' : 'hover:bg-surface-2'} transition-colors`}>
              <td className="px-4 py-3 font-bold text-muted">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
              </td>
              <td className="px-4 py-3 font-semibold">{row.team.name}</td>
              {sports.map(s => (
                <td key={s.id} className="px-3 py-3 text-center text-muted">
                  {row.sportPts[s.id] ?? '—'}
                </td>
              ))}
              <td className="px-4 py-3 text-center font-bold text-accent text-base">
                {row.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
