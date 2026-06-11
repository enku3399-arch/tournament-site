'use client'
import { useState } from 'react'

const MATCH_H = 68
const SLOT_GAP = 10
const ROUND_W = 220
const CONN_W = 30
const HEADER_H = 30

function roundLabel(r: number, total: number) {
  if (r === total) return 'Финал'
  if (r === total - 1) return 'Хагас финал'
  if (r === total - 2) return 'Улирал финал'
  return `${r}-р шат`
}

export interface BracketTeam { id: string; name: string }
export interface BracketMatch {
  id: string; round: number; match_number: number
  status: string; stage: string; judge_code: string
  team1_id: string | null; team2_id: string | null; winner_id: string | null
  team1_score: number | null; team2_score: number | null
  team1: BracketTeam | null; team2: BracketTeam | null; winner: BracketTeam | null
}

interface Props {
  initialMatches: BracketMatch[]
  allTeams: BracketTeam[]
  judgeCode?: string
}

export default function AdminBracket({ initialMatches, allTeams, judgeCode }: Props) {
  const [matches, setMatches] = useState<BracketMatch[]>(initialMatches)
  const [saving, setSaving] = useState<string | null>(null)

  const totalRounds = matches.length > 0 ? Math.max(...matches.map(m => m.round)) : 0
  const rounds = Array.from({ length: totalRounds }, (_, i) => i + 1)
  const slotH1 = MATCH_H + SLOT_GAP
  const r1Count = matches.filter(m => m.round === 1).length || 1
  const totalH = r1Count * slotH1

  async function assignTeam(matchId: string, slot: 1 | 2, teamId: string | null) {
    setSaving(matchId)
    try {
      const res = await fetch(`/api/matches/${matchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slot === 1 ? { team1_id: teamId } : { team2_id: teamId }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      const team = teamId ? allTeams.find(t => t.id === teamId) ?? null : null
      setMatches(prev => prev.map(m => m.id !== matchId ? m : {
        ...m,
        team1_id: slot === 1 ? teamId : m.team1_id,
        team2_id: slot === 2 ? teamId : m.team2_id,
        team1: slot === 1 ? team : m.team1,
        team2: slot === 2 ? team : m.team2,
      }))
    } catch (e: any) { alert('Алдаа: ' + e.message) }
    setSaving(null)
  }

  async function saveScore(matchId: string, t1: number, t2: number) {
    setSaving(matchId)
    try {
      const res = await fetch(`/api/matches/${matchId}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team1_score: t1, team2_score: t2, finalize: true }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMatches(prev => prev.map(m => m.id !== matchId ? m : {
        ...m, ...data, team1: m.team1, team2: m.team2,
      }))
    } catch (e: any) { alert(e.message) }
    setSaving(null)
  }

  async function resetScore(matchId: string) {
    if (!confirm('Үр дүн устгах уу?')) return
    setSaving(matchId)
    try {
      const res = await fetch(`/api/matches/${matchId}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset: true }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMatches(prev => prev.map(m => m.id !== matchId ? m : {
        ...m, ...data, team1: m.team1, team2: m.team2,
      }))
    } catch (e: any) { alert(e.message) }
    setSaving(null)
  }

  if (totalRounds === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
        Нугалааны тоглолт үүсгэгдээгүй байна
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <div className="relative flex" style={{ height: totalH + HEADER_H }}>
        {rounds.map((round, ri) => {
          const roundMatches = [...matches.filter(m => m.round === round)]
            .sort((a, b) => a.match_number - b.match_number)
          const slotH = roundMatches.length > 0 ? totalH / roundMatches.length : totalH
          const isLast = round === totalRounds
          const label = roundLabel(round, totalRounds)

          return (
            <div key={round} style={{ display: 'flex', flexShrink: 0 }}>
              {/* Round column */}
              <div className="relative flex-shrink-0" style={{ width: ROUND_W, height: totalH + HEADER_H }}>
                <div
                  className="flex items-center justify-center text-xs font-bold uppercase tracking-widest text-muted"
                  style={{ height: HEADER_H }}
                >
                  {label}
                </div>
                {roundMatches.map((match, mi) => {
                  const topPos = HEADER_H + mi * slotH + (slotH - MATCH_H) / 2
                  return (
                    <div key={match.id} className="absolute" style={{ top: topPos, left: 4, right: 4, height: MATCH_H }}>
                      <AdminMatchCard
                        match={match}
                        allTeams={allTeams}
                        isFinal={isLast}
                        disabled={saving === match.id}
                        onAssign={(slot, tid) => assignTeam(match.id, slot, tid)}
                        onScore={(t1, t2) => saveScore(match.id, t1, t2)}
                        onReset={() => resetScore(match.id)}
                        judgeCode={judgeCode}
                      />
                    </div>
                  )
                })}
              </div>

              {/* Connector lines */}
              {!isLast && (
                <div className="relative flex-shrink-0" style={{ width: CONN_W, height: totalH + HEADER_H }}>
                  {Array.from({ length: Math.ceil(roundMatches.length / 2) }, (_, j) => {
                    const topCY = HEADER_H + (2 * j) * slotH + slotH / 2
                    const botCY = HEADER_H + (2 * j + 1) * slotH + slotH / 2
                    const midY = (topCY + botCY) / 2
                    const half = CONN_W / 2
                    const col = 'rgba(38,51,84,0.9)'
                    return (
                      <div key={j}>
                        <div style={{ position: 'absolute', top: topCY, left: 0, width: half, borderTop: `1px solid ${col}` }} />
                        <div style={{ position: 'absolute', top: botCY, left: 0, width: half, borderTop: `1px solid ${col}` }} />
                        <div style={{ position: 'absolute', left: half - 1, top: topCY, height: botCY - topCY, borderRight: `1px solid ${col}` }} />
                        <div style={{ position: 'absolute', top: midY, left: half, right: 0, borderTop: `1px solid ${col}` }} />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AdminMatchCard({
  match, allTeams, isFinal, disabled, onAssign, onScore, onReset, judgeCode,
}: {
  match: BracketMatch; allTeams: BracketTeam[]; isFinal: boolean
  disabled: boolean
  onAssign: (slot: 1 | 2, teamId: string | null) => void
  onScore: (t1: number, t2: number) => void
  onReset: () => void
  judgeCode?: string
}) {
  const [scoring, setScoring] = useState(false)
  const [t1, setT1] = useState(match.team1_score ?? 0)
  const [t2, setT2] = useState(match.team2_score ?? 0)
  const isDone = match.status === 'completed'
  const isLive = match.status === 'live'
  const hasBoth = !!(match.team1_id && match.team2_id)
  const rowH = MATCH_H / 2

  return (
    <div className={`relative h-full rounded-lg border overflow-visible text-xs transition-opacity ${
      disabled ? 'opacity-50' : ''
    } ${isDone ? 'border-primary/40' : isLive ? 'border-live/50' : isFinal ? 'border-accent/40' : 'border-border'}`}>

      {/* Team 1 slot */}
      <SlotRow
        team={match.team1} slot={1} score={isDone ? match.team1_score : null}
        isWinner={isDone && match.winner_id === match.team1_id}
        isLoser={isDone && !!match.winner_id && match.winner_id !== match.team1_id}
        allTeams={allTeams} onAssign={onAssign} disabled={isDone || disabled}
        height={rowH} borderBottom
      />
      {/* Team 2 slot */}
      <SlotRow
        team={match.team2} slot={2} score={isDone ? match.team2_score : null}
        isWinner={isDone && match.winner_id === match.team2_id}
        isLoser={isDone && !!match.winner_id && match.winner_id !== match.team2_id}
        allTeams={allTeams} onAssign={onAssign} disabled={isDone || disabled}
        height={rowH}
      />

      {/* Score entry popup */}
      {scoring && (
        <div className="absolute left-0 right-0 bottom-full mb-1 z-50 rounded-lg border border-primary/50 bg-surface shadow-xl p-2 space-y-1.5 min-w-[160px]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted flex-1 truncate">{match.team1?.name}</span>
            <input type="number" min={0} value={t1} onChange={e => setT1(+e.target.value)}
              className="input w-14 text-center py-0.5 h-6 text-sm font-bold" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted flex-1 truncate">{match.team2?.name}</span>
            <input type="number" min={0} value={t2} onChange={e => setT2(+e.target.value)}
              className="input w-14 text-center py-0.5 h-6 text-sm font-bold" />
          </div>
          <div className="flex gap-1 pt-0.5">
            <button onClick={() => { onScore(t1, t2); setScoring(false) }}
              className="flex-1 rounded bg-live text-black text-[10px] font-bold py-1 hover:bg-live/80">
              ✓ Дуусгах
            </button>
            <button onClick={() => setScoring(false)}
              className="rounded border border-border px-2 text-[10px] text-muted hover:bg-surface-2">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Bottom action strip */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center px-1 gap-0.5" style={{ height: 14 }}>
        {isDone ? (
          <button onClick={onReset} className="text-[9px] text-muted hover:text-danger transition-colors" title="Үр дүн устгах">
            ↩ буцаах
          </button>
        ) : hasBoth && !disabled ? (
          <button onClick={() => { setT1(0); setT2(0); setScoring(v => !v) }}
            className="text-[9px] text-primary hover:text-primary/80 font-semibold">
            ✏️ оноо
          </button>
        ) : null}
        {judgeCode && (
          <a href={`/judge/${match.id}?code=${judgeCode}`} target="_blank"
            className="ml-auto text-[9px] text-muted hover:text-foreground">⚖️</a>
        )}
      </div>
    </div>
  )
}

function SlotRow({
  team, slot, score, isWinner, isLoser, allTeams, onAssign, disabled, height, borderBottom,
}: {
  team: BracketTeam | null; slot: 1 | 2
  score: number | null | undefined
  isWinner: boolean; isLoser: boolean
  allTeams: BracketTeam[]
  onAssign: (slot: 1 | 2, teamId: string | null) => void
  disabled: boolean; height: number; borderBottom?: boolean
}) {
  return (
    <div
      className={`flex items-center gap-1 px-2 ${isWinner ? 'bg-primary/10' : ''} ${borderBottom ? 'border-b border-border/60' : ''}`}
      style={{ height }}
    >
      {disabled ? (
        <>
          <span className={`flex-1 text-[11px] font-medium truncate ${
            isWinner ? 'text-live font-bold' : isLoser ? 'text-muted/50 line-through' : 'text-foreground/85'
          }`}>
            {team?.name ?? <span className="italic text-muted/40 text-[10px]">TBD</span>}
          </span>
          {score != null && (
            <span className={`shrink-0 font-bold tabular-nums text-xs ${isWinner ? 'text-live' : 'text-muted'}`}>
              {score}
            </span>
          )}
        </>
      ) : (
        <select
          className={`flex-1 text-[10px] border rounded px-1.5 py-0.5 cursor-pointer min-w-0 ${
            team ? 'bg-surface border-border/40 text-foreground/85' : 'bg-surface-2 border-border/50 text-muted'
          }`}
          style={{ colorScheme: 'dark' }}
          value={team?.id ?? ''}
          onChange={e => onAssign(slot, e.target.value || null)}
        >
          <option value="" style={{ background: '#0f1623' }}>— Баг сонгох —</option>
          {allTeams.map(t => <option key={t.id} value={t.id} style={{ background: '#0f1623' }}>{t.name}</option>)}
        </select>
      )}
    </div>
  )
}
