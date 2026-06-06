'use client'
import { useState } from 'react'
import Link from 'next/link'
import { SPORT_ICONS, sportDisplayName } from '@/lib/types'
import type { TournamentSport } from '@/lib/types'
import { SportGenderBadge, SeedAimagsButton } from './SportSettingsPanel'

interface Props {
  tournamentId: string
  sport: TournamentSport
  teamCount: number
}

export function SportCard({ tournamentId, sport, teamCount }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-surface-2 transition-colors text-left gap-3"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-lg">{SPORT_ICONS[sport.sport_type] ?? '🏅'}</span>
          <span className="font-semibold">{sportDisplayName(sport)}</span>
          {sport.gender && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
              sport.gender === 'male'
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                : 'bg-pink-500/20 text-pink-400 border-pink-500/30'
            }`}>
              {sport.gender === 'male' ? '♂ Эрэгтэй' : '♀ Эмэгтэй'}
            </span>
          )}
          <span className="text-sm text-muted">({teamCount} баг)</span>
        </div>
        <span className="text-muted text-xs shrink-0">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="border-t border-border px-5 py-3 bg-surface-2 flex items-center flex-wrap gap-3">
          <SeedAimagsButton sportId={sport.id} tournamentId={tournamentId} />
          <SportGenderBadge sport={sport} />
          <Link
            href={`/admin/${tournamentId}/groups/${sport.id}`}
            className="ml-auto rounded-lg border border-primary/50 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 transition-colors"
          >
            ⊞ Хэсгийн тохиргоо →
          </Link>
        </div>
      )}
    </div>
  )
}
