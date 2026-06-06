'use client'
import { useState, useEffect } from 'react'
import type { MatchWithTeams } from '@/lib/types'
import { SPORT_ICONS } from '@/lib/types'

interface Props {
  match: MatchWithTeams & { tournament: { name: string } }
  judgeCode?: string
}

export default function JudgePanel({ match: initialMatch, judgeCode }: Props) {
  const [match, setMatch] = useState(initialMatch)
  const [t1, setT1] = useState<number>(match.team1_score ?? 0)
  const [t2, setT2] = useState<number>(match.team2_score ?? 0)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmFinish, setConfirmFinish] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const sport = match.sport as any
  const tournament = match.tournament as any

  // Auto-save score 800ms after last change (only when live)
  useEffect(() => {
    if (match.status !== 'live') return
    const timer = setTimeout(() => { save() }, 800)
    return () => clearTimeout(timer)
  }, [t1, t2]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-go live when judge opens the page
  useEffect(() => {
    if (initialMatch.status !== 'scheduled') return
    fetch(`/api/matches/${initialMatch.id}/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        team1_score: initialMatch.team1_score ?? 0,
        team2_score: initialMatch.team2_score ?? 0,
        status: 'live',
        judge_code: (initialMatch as any).judge_code,
      }),
    })
      .then(r => r.json())
      .then(data => { if (data && !data.error) setMatch(data) })
      .catch(() => {/* silent — judge can still work */})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const save = async (markLive?: boolean) => {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const res = await fetch(`/api/matches/${match.id}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team1_score: t1,
          team2_score: t2,
          status: markLive ? 'live' : undefined,
          judge_code: (match as any).judge_code,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Алдаа гарлаа')
      setMatch(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const finish = async () => {
    setConfirmFinish(false)
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/matches/${match.id}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team1_score: t1,
          team2_score: t2,
          finalize: true,
          judge_code: (match as any).judge_code,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Алдаа гарлаа')
      setMatch(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const resetMatch = async () => {
    setConfirmReset(false)
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/matches/${match.id}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset: true }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMatch(data)
      setT1(0)
      setT2(0)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const isCompleted = match.status === 'completed'

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      {/* Header */}
      <div className="bg-surface-2 px-5 py-4 border-b border-border">
        <p className="text-xs text-muted mb-0.5">{tournament?.name}</p>
        <div className="flex items-center justify-between">
          <p className="font-bold text-sm">
            {sport ? `${SPORT_ICONS[sport.sport_type] ?? '🏅'} ${sport.name}` : 'Тоглолт'}
            {' '}— {match.round}-р үе
          </p>
          <StatusBadge status={match.status} />
        </div>
      </div>

      {/* Score entry */}
      <div className="p-5 space-y-4">
        <TeamScore
          name={match.team1?.name ?? 'Баг 1'}
          score={t1}
          isWinner={match.winner_id === match.team1?.id}
          onChange={setT1}
          disabled={isCompleted}
        />
        <div className="text-center text-xl font-bold text-muted">:</div>
        <TeamScore
          name={match.team2?.name ?? 'Баг 2'}
          score={t2}
          isWinner={match.winner_id === match.team2?.id}
          onChange={setT2}
          disabled={isCompleted}
        />
      </div>

      {/* Actions */}
      {!isCompleted && (
        <div className="px-5 pb-5 space-y-2">
          {match.status === 'scheduled' && (
            <button
              type="button"
              onClick={() => save(true)}
              disabled={saving}
              className="w-full rounded-xl bg-live py-3 text-base font-bold text-black disabled:opacity-40 hover:bg-live/80 transition-colors"
            >
              {saving ? 'Хадгалж байна...' : '▶ Тоглолт эхлүүлэх'}
            </button>
          )}
          {match.status === 'live' && (
            <>
              <button
                type="button"
                onClick={() => save()}
                disabled={saving}
                className="w-full rounded-xl bg-primary py-3 text-base font-bold text-white disabled:opacity-40 hover:bg-primary-hover transition-colors"
              >
                {saving ? '...' : saved ? '✓ Хадгалагдлаа' : '💾 Оноо хадгалах'}
              </button>

              {!confirmFinish ? (
                <button
                  type="button"
                  onClick={() => setConfirmFinish(true)}
                  disabled={saving}
                  className="w-full rounded-xl border border-accent py-3 text-base font-semibold text-accent hover:bg-accent/10 transition-colors"
                >
                  🏁 Тоглолт дуусгах
                </button>
              ) : (
                <div className="rounded-xl border border-accent bg-accent/10 p-4 space-y-3">
                  <p className="text-sm font-semibold text-center text-accent">
                    Тоглолтыг дуусгах уу?
                  </p>
                  <p className="text-xs text-center text-muted">
                    {match.team1?.name}: <b className="text-foreground">{t1}</b>
                    {' — '}
                    {match.team2?.name}: <b className="text-foreground">{t2}</b>
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmFinish(false)}
                      className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-muted hover:bg-surface-2 transition-colors"
                    >
                      Болих
                    </button>
                    <button
                      type="button"
                      onClick={finish}
                      disabled={saving}
                      className="flex-1 rounded-xl py-2.5 text-sm font-bold text-black disabled:opacity-40 transition-colors"
                      style={{ background: 'var(--gold)' }}
                    >
                      {saving ? '...' : '✓ Тийм, дуусгах'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {isCompleted && (
        <div className="px-5 pb-5 space-y-2">
          <div className="rounded-xl bg-live/10 border border-live/30 p-4 text-center">
            <p className="text-live font-bold">✅ Тоглолт дууслаа</p>
            <p className="text-sm text-muted mt-1">
              Ялагч: {match.winner_id === match.team1?.id ? match.team1?.name : match.team2?.name}
            </p>
          </div>

          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              disabled={saving}
              className="w-full rounded-xl border border-border py-2 text-xs text-muted hover:bg-surface-2 hover:text-foreground transition-colors"
            >
              ↩ Үр дүн устгаж хүлээгдэж буй болгох
            </button>
          ) : (
            <div className="rounded-xl border border-danger/40 bg-danger/10 p-4 space-y-3">
              <p className="text-sm font-semibold text-center text-danger">
                Үр дүнг устгах уу?
              </p>
              <p className="text-xs text-center text-muted">Тоглолт дахин хүлээгдэж буй болно</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-muted hover:bg-surface-2 transition-colors"
                >
                  Болих
                </button>
                <button
                  type="button"
                  onClick={resetMatch}
                  disabled={saving}
                  className="flex-1 rounded-xl bg-danger py-2.5 text-sm font-bold text-white disabled:opacity-40 transition-colors"
                >
                  {saving ? '...' : 'Устгах'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mx-5 mb-4 rounded-lg bg-danger/10 border border-danger/30 p-3 text-sm text-danger">
          {error}
        </div>
      )}
    </div>
  )
}

function TeamScore({
  name, score, isWinner, onChange, disabled,
}: {
  name: string
  score: number
  isWinner: boolean
  onChange: (v: number) => void
  disabled: boolean
}) {
  return (
    <div className={`rounded-xl border p-4 ${isWinner ? 'border-live bg-live/10' : 'border-border bg-surface-2'}`}>
      <p className={`text-sm font-semibold mb-3 ${isWinner ? 'text-live' : 'text-muted'}`}>{name}</p>
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => onChange(Math.max(0, score - 1))}
          disabled={disabled || score <= 0}
          className="h-12 w-12 rounded-xl border border-border text-2xl font-bold hover:bg-surface active:scale-95 transition-all disabled:opacity-30"
        >
          −
        </button>
        <input
          type="number"
          min={0}
          value={score}
          onChange={e => onChange(Math.max(0, Number(e.target.value)))}
          onFocus={e => e.target.select()}
          disabled={disabled}
          className="input text-center text-4xl font-bold h-16 w-full tabular-nums"
        />
        <button
          onClick={() => onChange(score + 1)}
          disabled={disabled}
          className="h-12 w-12 rounded-xl border border-border text-2xl font-bold hover:bg-surface active:scale-95 transition-all disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'live') return <span className="text-xs font-bold text-live">● LIVE</span>
  if (status === 'completed') return <span className="text-xs font-semibold text-primary">✓ Дууссан</span>
  return <span className="text-xs text-muted">⏰ Хүлээгдэж буй</span>
}
