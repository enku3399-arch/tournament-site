'use client'

import { useState } from 'react'
import type { Team, TournamentSport } from '@/lib/types'
import { SPORT_ICONS, sportDisplayName } from '@/lib/types'

export function PendingRegistrations({
  initialTeams,
  sports,
  tournamentId,
}: {
  initialTeams: Team[]
  sports: TournamentSport[]
  tournamentId: string
}) {
  const [teams, setTeams] = useState<Team[]>(initialTeams)
  const [busy, setBusy] = useState<Set<string>>(new Set())
  const [open, setOpen] = useState(true)

  const sportMap = new Map(sports.map(s => [s.id, s]))

  async function approve(teamId: string) {
    setBusy(prev => new Set([...prev, teamId]))
    const res = await fetch(`/api/admin/teams/${teamId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'confirmed' }),
    })
    if (res.ok) {
      setTeams(prev => prev.filter(t => t.id !== teamId))
    }
    setBusy(prev => { const n = new Set(prev); n.delete(teamId); return n })
  }

  async function remove(teamId: string) {
    if (!confirm('Энэ хүсэлтийг устгах уу?')) return
    setBusy(prev => new Set([...prev, teamId]))
    const res = await fetch(`/api/admin/teams/${teamId}`, { method: 'DELETE' })
    if (res.ok) {
      setTeams(prev => prev.filter(t => t.id !== teamId))
    }
    setBusy(prev => { const n = new Set(prev); n.delete(teamId); return n })
  }

  async function approveAll() {
    if (!confirm(`${teams.length} хүсэлтийг бүгдийг нь баталгаажуулах уу?`)) return
    for (const t of [...teams]) await approve(t.id)
  }

  if (teams.length === 0) return null

  return (
    <section className="rounded-xl border border-accent/40 bg-surface overflow-hidden">
      <div
        className="flex items-center gap-3 px-5 py-4 border-b border-border bg-accent/5 cursor-pointer select-none"
        onClick={() => setOpen(o => !o)}
      >
        <h2 className="font-bold flex-1">
          📋 Бүртгэлийн хүсэлтүүд
          <span className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full bg-accent/20 text-accent">{teams.length}</span>
        </h2>
        <span className="text-xs text-muted">{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <>
          <div className="px-5 py-3 border-b border-border bg-surface-2 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs text-muted">
              Хэрэглэгчид өөрсдөө <strong>/register</strong> хуудсаар илгээсэн бүртгэлүүд.
              Баталгаажуулах = нийт жагсаалтад нэмэгдэнэ. Устгах = бүрэн арилна.
            </p>
            <button
              type="button"
              onClick={approveAll}
              className="text-xs px-3 py-1.5 rounded border border-live/40 bg-live/10 text-live hover:bg-live/20 font-semibold whitespace-nowrap"
            >
              ✓ Бүгдийг баталгаажуулах
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2">
                  <th className="text-left px-4 py-3 font-semibold text-muted text-xs sticky left-0 bg-surface-2 min-w-48">
                    Нэр / Мэдүүлэг
                  </th>
                  <th className="text-left px-3 py-3 font-semibold text-muted text-xs min-w-32">Спорт</th>
                  <th className="text-left px-3 py-3 font-semibold text-muted text-xs min-w-28">Холбоо барих</th>
                  <th className="text-left px-3 py-3 font-semibold text-muted text-xs min-w-32">Огноо</th>
                  <th className="px-3 py-3 text-xs font-semibold text-muted text-right min-w-40">Үйлдэл</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {teams.map(t => {
                  const sport = t.sport_id ? sportMap.get(t.sport_id) : null
                  const isBusy = busy.has(t.id)
                  return (
                    <tr key={t.id} className={`hover:bg-surface-2 transition-colors ${isBusy ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3 sticky left-0 bg-surface">
                        <span className="font-medium">{t.name}</span>
                        {t.contact_name && (
                          <span className="block text-xs text-muted mt-0.5">{t.contact_name}</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-sm">
                        {sport ? (
                          <span className="flex items-center gap-1">
                            <span>{SPORT_ICONS[sport.sport_type] ?? '🏅'}</span>
                            <span className="text-xs">{sportDisplayName(sport)}</span>
                          </span>
                        ) : (
                          <span className="text-muted text-xs">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs text-muted">
                        {t.contact_phone || '—'}
                      </td>
                      <td className="px-3 py-3 text-xs text-muted">
                        {new Date(t.created_at).toLocaleDateString('mn-MN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => approve(t.id)}
                            className="text-xs px-2.5 py-1 rounded border border-live/40 bg-live/10 text-live hover:bg-live/20 font-semibold disabled:opacity-50"
                          >
                            ✓ Баталгаажуулах
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => remove(t.id)}
                            className="text-xs px-2 py-1 rounded border border-danger/30 text-danger/60 hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}
