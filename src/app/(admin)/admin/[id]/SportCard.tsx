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
  scheduleVisible?: boolean
}

export function SportCard({ tournamentId, sport, teamCount, scheduleVisible = false }: Props) {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(scheduleVisible)
  const [toggling, setToggling] = useState(false)

  async function toggleSchedule(e: React.MouseEvent) {
    e.stopPropagation()
    if (toggling) return
    setToggling(true)
    try {
      const res = await fetch(`/api/admin/sport/${sport.id}/toggle-schedule`, { method: 'POST' })
      const json = await res.json()
      if (json.ok) setVisible(json.visible)
    } finally {
      setToggling(false)
    }
  }

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
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleSchedule}
            disabled={toggling}
            title={visible ? 'Хуваарийн хуудсаас нуух' : 'Хуваарийн хуудсанд нийтлэх'}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold border transition-colors ${
              visible
                ? 'bg-live/15 text-live border-live/30 hover:bg-live/25'
                : 'bg-surface text-muted border-border hover:border-primary/50 hover:text-primary'
            } ${toggling ? 'opacity-50' : ''}`}
          >
            {visible ? '🟢 Нийтлэгдсэн' : '⚪ Нуугдсан'}
          </button>
          <span className="text-muted text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-border px-5 py-3 bg-surface-2 flex items-center flex-wrap gap-3">
          <SeedAimagsButton sportId={sport.id} tournamentId={tournamentId} />
          <SportGenderBadge sport={sport} />
          {sport.sport_type === 'chess' ? (
            <Link
              href={`/admin/${tournamentId}/chess/${sport.id}`}
              className="ml-auto rounded-lg border border-primary/50 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 transition-colors"
            >
              ♟️ Шатрын дүн →
            </Link>
          ) : sport.sport_type === 'darts' ? (
            <Link
              href={`/admin/${tournamentId}/darts/${sport.id}`}
              className="ml-auto rounded-lg border border-primary/50 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 transition-colors"
            >
              🎯 Дартсын дүн →
            </Link>
          ) : (
            <Link
              href={`/admin/${tournamentId}/groups/${sport.id}`}
              className="ml-auto rounded-lg border border-primary/50 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 transition-colors"
            >
              ⊞ Хэсгийн тохиргоо →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
