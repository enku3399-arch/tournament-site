'use client'
import { useState } from 'react'
import type { BMatch } from './BracketDiagram'

// ── Layout constants (same as BracketDiagram) ─────────────────────────────────
const CW  = 180
const CH  = 76
const COL = 240
const LH  = 40

const BASE_Y: Record<string, number> = {
  '4-1': 0,   '4-2': 120, '4-3': 240,
  '4-4': 360, '4-5': 480, '4-6': 600,
  '3-1': 180, '3-2': 420,
  '2-1': 90,  '2-2': 510,
  '1-1': 300,
}
const BASE_X: Record<number, number> = { 4: 0, 3: COL, 2: COL * 2, 1: COL * 3 }
const TOTAL_W = COL * 3 + CW
const TOTAL_H = 600 + CH + LH

const c = (yBase: number) => yBase + CH / 2 + LH
const CONNECTORS: string[] = [
  `M ${CW} ${c(120)} H 210 V ${c(180)} H ${COL}`,
  `M ${CW} ${c(240)} H 210 V ${c(180)} H ${COL}`,
  `M ${CW} ${c(360)} H 210 V ${c(420)} H ${COL}`,
  `M ${CW} ${c(480)} H 210 V ${c(420)} H ${COL}`,
  `M ${CW} ${c(0)} H ${COL + CW / 2} V ${c(90)} H ${COL * 2}`,
  `M ${COL + CW} ${c(180)} H ${COL + CW + 30} V ${c(90)} H ${COL * 2}`,
  `M ${COL + CW} ${c(420)} H ${COL + CW + 30} V ${c(510)} H ${COL * 2}`,
  `M ${CW} ${c(600)} H ${COL + CW / 2} V ${c(510)} H ${COL * 2}`,
  `M ${COL * 2 + CW} ${c(90)} H ${COL * 2 + CW + 30} V ${c(300)} H ${COL * 3}`,
  `M ${COL * 2 + CW} ${c(510)} H ${COL * 2 + CW + 30} V ${c(300)} H ${COL * 3}`,
]
const ROUND_LABEL: Record<number, string> = {
  4: 'ЭХНИЙ ШАТ', 3: '¼ ФИНАЛ', 2: 'ХАГАС ФИНАЛ', 1: 'ФИНАЛ',
}
const SEED_HINT: Record<string, [string, string]> = {
  '4-1': ['A₁', 'F₂'], '4-2': ['B₁', 'C₂'], '4-3': ['C₁', 'D₂'],
  '4-4': ['D₁', 'E₂'], '4-5': ['E₁', 'B₂'], '4-6': ['F₁', 'A₂'],
}

export type SimpleTeam = { id: string; name: string }

type AdminCardProps = {
  m: BMatch
  seeds?: [string, string]
  allTeams: SimpleTeam[]
  saving: boolean
  onAssign: (slot: 1 | 2, teamId: string | null) => void
  onScore: (t1: number, t2: number) => void
  onReset: () => void
}

function AdminMatchCard({ m, seeds, allTeams, saving, onAssign, onScore, onReset }: AdminCardProps) {
  const [editing, setEditing] = useState(false)
  const [t1, setT1] = useState(m.team1_score ?? 0)
  const [t2, setT2] = useState(m.team2_score ?? 0)

  const done = m.status === 'completed'
  const live = m.status === 'live'
  const hasBoth = !!(m.team1 && m.team2)
  const win1 = done && m.winner && m.team1 && m.winner.name === m.team1.name
  const win2 = done && m.winner && m.team2 && m.winner.name === m.team2.name
  const borderColor = live ? '#ef4444' : done ? '#c8a24a80' : '#c8cfe0'

  const rowBg = (isWin: boolean) => isWin ? 'rgba(200,162,74,.15)' : 'transparent'

  return (
    <div style={{ position: 'relative', width: CW, opacity: saving ? 0.5 : 1 }}>
      <div style={{ border: `1.5px solid ${borderColor}`, borderRadius: 6, background: 'white', overflow: 'hidden' }}>
        {/* Team 1 */}
        <div style={{ display: 'flex', alignItems: 'center', height: 36, padding: '0 6px', background: rowBg(!!win1) }}>
          {done ? (
            <>
              <span style={{ flex: 1, fontSize: 11, fontWeight: win1 ? 700 : 400, color: win1 ? '#7c5f14' : '#1a1a2e', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {m.team1?.name ?? (seeds?.[0] ?? 'TBD')}
              </span>
              <span style={{ fontSize: 13, fontWeight: 800, fontFamily: 'monospace', color: win1 ? '#c8a24a' : '#888', minWidth: 18, textAlign: 'right' }}>{m.team1_score ?? 0}</span>
            </>
          ) : (
            <select
              value={m.team1?.id ?? ''}
              onChange={e => onAssign(1, e.target.value || null)}
              style={{ flex: 1, fontSize: 10, border: '1px solid #dde', borderRadius: 3, padding: '2px 4px', background: m.team1 ? '#f8f9ff' : '#f3f4f6', color: m.team1 ? '#1a1a2e' : '#999', cursor: 'pointer' }}
            >
              <option value="">{seeds ? `${seeds[0]} — сонгох` : '— Баг сонгох —'}</option>
              {allTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          )}
        </div>
        <div style={{ height: 1, background: '#eee' }} />
        {/* Team 2 */}
        <div style={{ display: 'flex', alignItems: 'center', height: 36, padding: '0 6px', background: rowBg(!!win2) }}>
          {done ? (
            <>
              <span style={{ flex: 1, fontSize: 11, fontWeight: win2 ? 700 : 400, color: win2 ? '#7c5f14' : '#1a1a2e', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {m.team2?.name ?? (seeds?.[1] ?? 'TBD')}
              </span>
              <span style={{ fontSize: 13, fontWeight: 800, fontFamily: 'monospace', color: win2 ? '#c8a24a' : '#888', minWidth: 18, textAlign: 'right' }}>{m.team2_score ?? 0}</span>
            </>
          ) : (
            <select
              value={m.team2?.id ?? ''}
              onChange={e => onAssign(2, e.target.value || null)}
              style={{ flex: 1, fontSize: 10, border: '1px solid #dde', borderRadius: 3, padding: '2px 4px', background: m.team2 ? '#f8f9ff' : '#f3f4f6', color: m.team2 ? '#1a1a2e' : '#999', cursor: 'pointer' }}
            >
              <option value="">{seeds ? `${seeds[1]} — сонгох` : '— Баг сонгох —'}</option>
              {allTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          )}
        </div>
        {/* Action strip */}
        <div style={{ height: 18, display: 'flex', alignItems: 'center', padding: '0 6px', borderTop: '1px solid #f0f0f0', background: '#fafafa', gap: 6 }}>
          {done ? (
            <button onClick={onReset} style={{ fontSize: 9, color: '#ef4444', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>↩ буцаах</button>
          ) : hasBoth ? (
            <button onClick={() => { setT1(0); setT2(0); setEditing(v => !v) }}
              style={{ fontSize: 9, color: '#6366f1', cursor: 'pointer', background: 'none', border: 'none', padding: 0, fontWeight: 600 }}>
              ✏️ оноо оруулах
            </button>
          ) : null}
        </div>
      </div>

      {/* Score popup */}
      {editing && (
        <div style={{ position: 'absolute', left: 0, bottom: CH + 6, zIndex: 50, background: 'white', border: '1.5px solid #c8a24a', borderRadius: 8, padding: '10px 12px', width: CW, boxShadow: '0 4px 20px rgba(0,0,0,.15)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#333', marginBottom: 8 }}>Оноо оруулах</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span style={{ flex: 1, fontSize: 10, color: '#666', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{m.team1?.name}</span>
            <input type="number" min={0} value={t1} onChange={e => setT1(Math.max(0, +e.target.value))}
              style={{ width: 44, textAlign: 'center', fontWeight: 700, border: '1px solid #dde', borderRadius: 4, padding: '3px 4px', fontSize: 14 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <span style={{ flex: 1, fontSize: 10, color: '#666', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{m.team2?.name}</span>
            <input type="number" min={0} value={t2} onChange={e => setT2(Math.max(0, +e.target.value))}
              style={{ width: 44, textAlign: 'center', fontWeight: 700, border: '1px solid #dde', borderRadius: 4, padding: '3px 4px', fontSize: 14 }} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => { onScore(t1, t2); setEditing(false) }}
              style={{ flex: 1, background: '#c8a24a', color: 'white', border: 'none', borderRadius: 5, padding: '5px 0', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
              ✓ Хадгалах
            </button>
            <button onClick={() => setEditing(false)}
              style={{ background: '#f3f4f6', color: '#666', border: 'none', borderRadius: 5, padding: '5px 8px', fontSize: 11, cursor: 'pointer' }}>
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
type Props = {
  initialMatches: BMatch[]
  allTeams: SimpleTeam[]
  judgeCode?: string
  onMatchUpdate?: (m: BMatch) => void
}

export default function AdminBracketDiagram({ initialMatches, allTeams, judgeCode, onMatchUpdate }: Props) {
  const [matches, setMatches] = useState<BMatch[]>(initialMatches)
  const [saving, setSaving] = useState<string | null>(null)

  // Normalize rounds/match_numbers (same logic as BracketDiagram)
  const byKey = new Map<string, BMatch>()
  const thirdMatch = matches.find(m => m.stage === 'third')
  const knockoutMatches = matches.filter(m => m.stage === 'knockout')
  if (knockoutMatches.length > 0) {
    const roundCounts = new Map<number, number>()
    for (const m of knockoutMatches) roundCounts.set(m.round, (roundCounts.get(m.round) ?? 0) + 1)
    const sortedRounds = [...roundCounts.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])
    const roundMap = new Map(sortedRounds.map(([actual], idx) => [actual, 4 - idx]))
    const byNormRound = new Map<number, BMatch[]>()
    for (const m of knockoutMatches) {
      const nr = roundMap.get(m.round) ?? m.round
      if (!byNormRound.has(nr)) byNormRound.set(nr, [])
      byNormRound.get(nr)!.push(m)
    }
    for (const [nr, rMatches] of byNormRound) {
      rMatches.sort((a, b) => a.match_number - b.match_number)
      rMatches.forEach((m, i) => byKey.set(`${nr}-${i + 1}`, m))
    }
  }

  async function assignTeam(matchId: string, slot: 1 | 2, teamId: string | null) {
    setSaving(matchId)
    try {
      const res = await fetch(`/api/matches/${matchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slot === 1 ? { team1_id: teamId } : { team2_id: teamId }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const team = teamId ? allTeams.find(t => t.id === teamId) ?? null : null
      setMatches(prev => prev.map(m => m.id !== matchId ? m : {
        ...m,
        team1: slot === 1 ? (team ? { id: team.id, name: team.name } : null) : m.team1,
        team2: slot === 2 ? (team ? { id: team.id, name: team.name } : null) : m.team2,
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
      setMatches(prev => prev.map(m => m.id !== matchId ? m : { ...m, ...data }))
      onMatchUpdate?.(data)
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
      setMatches(prev => prev.map(m => m.id !== matchId ? m : { ...m, ...data }))
    } catch (e: any) { alert(e.message) }
    setSaving(null)
  }

  const rounds = [4, 3, 2, 1]

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 16 }}>
      <div style={{ position: 'relative', width: TOTAL_W, height: TOTAL_H + 120, minWidth: TOTAL_W }}>

        {/* SVG connectors */}
        <svg style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} width={TOTAL_W} height={TOTAL_H + 120}>
          {CONNECTORS.map((d, i) => (
            <path key={i} d={d} stroke="#3b4d72" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          ))}
        </svg>

        {/* Round labels */}
        {rounds.map(r => (
          <div key={r} style={{
            position: 'absolute', left: BASE_X[r], top: 0, width: CW, textAlign: 'center',
            fontSize: 9, fontWeight: 700, letterSpacing: '.1em',
            color: r === 1 ? '#c8a24a' : '#8899bb', textTransform: 'uppercase', lineHeight: `${LH}px`,
          }}>
            {ROUND_LABEL[r]}
          </div>
        ))}

        {/* Match cards */}
        {rounds.map(r =>
          [1, 2, 3, 4, 5, 6].map(mn => {
            const key = `${r}-${mn}`
            const m = byKey.get(key)
            if (!m) return null
            const yTop = (BASE_Y[key] ?? 0) + LH
            return (
              <div key={key} style={{ position: 'absolute', left: BASE_X[r], top: yTop }}>
                <AdminMatchCard
                  m={m}
                  seeds={SEED_HINT[key]}
                  allTeams={allTeams}
                  saving={saving === m.id}
                  onAssign={(slot, tid) => assignTeam(m.id, slot, tid)}
                  onScore={(t1, t2) => saveScore(m.id, t1, t2)}
                  onReset={() => resetScore(m.id)}
                />
                {judgeCode && (
                  <div style={{ textAlign: 'right', marginTop: 2 }}>
                    <a href={`/judge/${m.id}?code=${judgeCode}`} target="_blank"
                      style={{ fontSize: 9, color: '#6b7280', textDecoration: 'none' }}>⚖️ шүүгч</a>
                  </div>
                )}
              </div>
            )
          })
        )}

        {/* 3rd place */}
        {thirdMatch && (() => {
          const thirdY = BASE_Y['1-1'] + LH + CH + 40
          return (
            <>
              <div style={{ position: 'absolute', left: BASE_X[1], top: thirdY - 20, fontSize: 9, fontWeight: 700, color: '#cd7f32', letterSpacing: '.1em', textTransform: 'uppercase' }}>
                🥉 3-Р БАЙР
              </div>
              <div style={{ position: 'absolute', left: BASE_X[1], top: thirdY }}>
                <AdminMatchCard
                  m={thirdMatch}
                  allTeams={allTeams}
                  saving={saving === thirdMatch.id}
                  onAssign={(slot, tid) => assignTeam(thirdMatch.id, slot, tid)}
                  onScore={(t1, t2) => saveScore(thirdMatch.id, t1, t2)}
                  onReset={() => resetScore(thirdMatch.id)}
                />
              </div>
            </>
          )
        })()}
      </div>
    </div>
  )
}
