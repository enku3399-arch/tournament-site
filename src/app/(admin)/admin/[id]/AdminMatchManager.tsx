'use client'
import { useState } from 'react'
import type { TournamentSport, Team, MatchWithTeams } from '@/lib/types'
import Link from 'next/link'

interface Props {
  tournamentId: string
  sport: TournamentSport
  teams: Team[]
  matches: MatchWithTeams[]
}

export default function AdminMatchManager({ tournamentId, sport, teams, matches: initialMatches }: Props) {
  const [matches, setMatches] = useState<MatchWithTeams[]>(initialMatches)

  const groupMatches = matches.filter(m => m.stage === 'group')
  const knockoutMatches = matches.filter(m => m.stage === 'knockout')

  // Group stage matches by group_id
  const groupIds = [...new Set(groupMatches.map(m => m.group_id).filter(Boolean))]

  const updateMatch = (updated: MatchWithTeams) =>
    setMatches(prev => prev.map(x => x.id === updated.id ? updated : x))

  if (matches.length === 0) {
    return (
      <div className="text-sm text-muted space-y-2">
        <p>Тоглолт үүсгэгдээгүй байна.</p>
        <Link
          href={`/admin/${tournamentId}/groups/${sport.id}`}
          className="inline-block rounded-lg border border-primary/50 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
        >
          ⊞ Хэсэг тохируулах →
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Group stage */}
      {groupMatches.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">⊞ Хэсгийн шат</p>
          <div className="space-y-4">
            {groupIds.map(gid => {
              const gms = groupMatches.filter(m => m.group_id === gid)
              const groupName = (gms[0] as any)?.group?.name ?? gid?.slice(0, 4)
              return (
                <div key={gid} className="rounded-lg border border-border overflow-hidden">
                  <div className="bg-surface-2 px-4 py-2 text-xs font-bold flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-xs">{groupName}</span>
                    Хэсэг {groupName}
                    <span className="ml-auto text-muted font-normal">{gms.filter(m => m.status === 'completed').length}/{gms.length} дууссан</span>
                  </div>
                  <div className="divide-y divide-border">
                    {gms.map(m => (
                      <MatchRow key={m.id} match={m} onUpdate={updateMatch} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Knockout stage */}
      {knockoutMatches.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">⟁ Нугалааны шат</p>
          <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
            {knockoutMatches.map(m => (
              <MatchRow key={m.id} match={m} onUpdate={updateMatch} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MatchRow({ match, onUpdate }: { match: MatchWithTeams; onUpdate: (m: MatchWithTeams) => void }) {
  const [editing, setEditing] = useState(false)
  const [scores, setScores] = useState({ t1: match.team1_score ?? 0, t2: match.team2_score ?? 0 })
  const [saving, setSaving] = useState(false)

  const saveResult = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/matches/${match.id}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team1_score: scores.t1, team2_score: scores.t2, finalize: true }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onUpdate(data as MatchWithTeams)
      setEditing(false)
    } catch {
      alert('Алдаа гарлаа')
    } finally {
      setSaving(false)
    }
  }

  const resetMatch = async () => {
    if (!confirm('Үр дүнг устгаж хүлээгдэж буй болгох уу?')) return
    setSaving(true)
    try {
      const res = await fetch(`/api/matches/${match.id}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset: true }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onUpdate(data as MatchWithTeams)
      setScores({ t1: 0, t2: 0 })
      setEditing(false)
    } catch {
      alert('Алдаа гарлаа')
    } finally {
      setSaving(false)
    }
  }

  const isDone = match.status === 'completed'

  return (
    <div className="px-4 py-2.5 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted w-6 shrink-0">#{match.match_number}</span>
        <span className={`flex-1 text-right font-medium truncate text-xs ${match.winner_id === match.team1_id && isDone ? 'text-live font-bold' : ''}`}>
          {match.team1?.name ?? 'TBD'}
        </span>
        <span className={`shrink-0 w-16 text-center text-xs font-bold rounded px-1 py-0.5 ${isDone ? 'bg-surface-2' : 'text-muted'}`}>
          {isDone ? `${match.team1_score} : ${match.team2_score}` : 'vs'}
        </span>
        <span className={`flex-1 text-left font-medium truncate text-xs ${match.winner_id === match.team2_id && isDone ? 'text-live font-bold' : ''}`}>
          {match.team2?.name ?? 'TBD'}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {isDone ? (
            <>
              <span className="text-xs text-primary">✓</span>
              <button onClick={resetMatch} disabled={saving} className="rounded border border-border px-2 py-0.5 text-xs text-muted hover:bg-surface-2 hover:text-danger disabled:opacity-40">
                ↩
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(v => !v)} disabled={saving} className="rounded border border-border px-2 py-0.5 text-xs hover:bg-surface-2 disabled:opacity-40">
              {editing ? '✕' : '✏️ Оноо'}
            </button>
          )}
          <Link href={`/judge/${match.id}?code=${match.judge_code}`} target="_blank" className="rounded border border-border px-2 py-0.5 text-xs text-muted hover:bg-surface-2">
            ⚖️
          </Link>
        </div>
      </div>

      {editing && (
        <div className="mt-2 flex flex-wrap items-center gap-2 pt-2 border-t border-border">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted w-20 truncate text-right">{match.team1?.name}</span>
            <input type="number" min={0} className="input w-16 text-center text-sm py-1" value={scores.t1}
              onChange={e => setScores(s => ({ ...s, t1: Math.max(0, Number(e.target.value)) }))} />
          </div>
          <span className="text-muted text-sm">:</span>
          <div className="flex items-center gap-1.5">
            <input type="number" min={0} className="input w-16 text-center text-sm py-1" value={scores.t2}
              onChange={e => setScores(s => ({ ...s, t2: Math.max(0, Number(e.target.value)) }))} />
            <span className="text-xs text-muted w-20 truncate">{match.team2?.name}</span>
          </div>
          <button onClick={saveResult} disabled={saving} className="rounded-lg bg-live px-3 py-1 text-xs font-bold text-black disabled:opacity-40 hover:bg-live/80">
            {saving ? '...' : '✓ Хадгалах'}
          </button>
        </div>
      )}
    </div>
  )
}
