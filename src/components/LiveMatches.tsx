'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import type { MatchWithTeams, TournamentSport } from '@/lib/types'
import { SPORT_ICONS } from '@/lib/types'

interface Props {
  tournamentId: string
  initialMatches: MatchWithTeams[]
  sports: TournamentSport[]
}

export default function LiveMatches({ tournamentId, initialMatches, sports }: Props) {
  const [matches, setMatches] = useState<MatchWithTeams[]>(initialMatches)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`live-matches-${tournamentId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'matches', filter: `tournament_id=eq.${tournamentId}` },
        async (payload) => {
          // Re-fetch the match with joins when updated
          const { data } = await supabase
            .from('matches')
            .select(`*, team1:team1_id(*), team2:team2_id(*), winner:winner_id(*), sport:sport_id(*)`)
            .eq('id', payload.new.id)
            .single()
          if (data) {
            setMatches(prev => prev.map(m => m.id === data.id ? data as MatchWithTeams : m))
          }
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [tournamentId])

  const sportById = new Map(sports.map(s => [s.id, s]))
  const live = matches.filter(m => m.status === 'live')
  const upcoming = matches.filter(m => m.status === 'scheduled' && m.scheduled_at)
    .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Live */}
      {live.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 font-bold">
            <span className="h-2 w-2 rounded-full bg-live animate-pulse-live" />
            Одоо явж байгаа тоглолтууд
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {live.map(m => (
              <MatchCard key={m.id} match={m} sport={sportById.get(m.sport_id)} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <h3 className="mb-3 font-bold text-muted">Дараагийн тоглолтууд</h3>
          <div className="space-y-2">
            {upcoming.map(m => (
              <UpcomingRow key={m.id} match={m} sport={sportById.get(m.sport_id)} />
            ))}
          </div>
        </div>
      )}

      {live.length === 0 && upcoming.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
          Одоогоор явж байгаа тоглолт байхгүй
        </div>
      )}
    </div>
  )
}

function MatchCard({ match, sport }: { match: MatchWithTeams; sport?: TournamentSport }) {
  return (
    <div className="rounded-xl border border-live/40 bg-live/5 p-4">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="text-muted">
          {sport ? `${SPORT_ICONS[sport.sport_type] ?? '🏅'} ${sport.name}` : ''}
        </span>
        <span className="font-bold text-live">● LIVE</span>
      </div>
      <div className="space-y-2">
        <TeamScoreLine
          name={match.team1?.name ?? 'TBD'}
          score={match.team1_score}
          isWinner={match.winner_id === match.team1_id}
        />
        <div className="text-center text-xs text-muted">VS</div>
        <TeamScoreLine
          name={match.team2?.name ?? 'TBD'}
          score={match.team2_score}
          isWinner={match.winner_id === match.team2_id}
        />
      </div>
    </div>
  )
}

function TeamScoreLine({ name, score, isWinner }: { name: string; score: number | null; isWinner: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-lg px-3 py-1.5 ${isWinner ? 'bg-live/20' : ''}`}>
      <span className="font-semibold">{name}</span>
      <span className={`text-xl font-bold tabular-nums ${isWinner ? 'text-live' : 'text-foreground'}`}>
        {score ?? 0}
      </span>
    </div>
  )
}

function UpcomingRow({ match, sport }: { match: MatchWithTeams; sport?: TournamentSport }) {
  const time = match.scheduled_at
    ? new Date(match.scheduled_at).toLocaleString('mn-MN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 text-sm">
      <div className="flex items-center gap-3">
        {sport && <span>{SPORT_ICONS[sport.sport_type] ?? '🏅'}</span>}
        <span className="font-medium">{match.team1?.name ?? 'TBD'}</span>
        <span className="text-muted">vs</span>
        <span className="font-medium">{match.team2?.name ?? 'TBD'}</span>
      </div>
      {time && <span className="text-xs text-muted shrink-0 ml-4">{time}</span>}
    </div>
  )
}
