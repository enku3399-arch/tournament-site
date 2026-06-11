/**
 * BracketDiagram — 12-багийн нугалааны схем (6 хэсэг × 2 ялагч)
 * SVG connector lines + absolutely positioned match cards
 *
 * Bracket structure:
 *   R4M1 (A1vF2) ──────────────────────────► SF1 team1
 *   R4M2 (B1vC2) ─┐                          │
 *                  ├─ QF1 ──────────────────► SF1 team2 ──► Final
 *   R4M3 (C1vD2) ─┘                          │
 *   R4M4 (D1vE2) ─┐                          │
 *                  ├─ QF2 ──────────────────► SF2 team1 ──► Final
 *   R4M5 (E1vB2) ─┘                          │
 *   R4M6 (F1vA2) ──────────────────────────► SF2 team2
 */

export type BMatch = {
  id: string
  round: number
  match_number: number
  stage: string
  team1?: { id?: string; name: string } | null
  team2?: { id?: string; name: string } | null
  winner?: { id?: string; name: string } | null
  team1_score?: number | null
  team2_score?: number | null
  status: string
  judge_code?: string | null
}

// ── Layout constants ──────────────────────────────────────────────────────────
const CW  = 180   // card width
const CH  = 76    // card height (2 × 36px rows + 4px separator)
const COL = 240   // column span (card + gap)
const LH  = 40    // label row height at top

// Y-top of each match (without LH offset) — based on 120px per R4 slot
const BASE_Y: Record<string, number> = {
  '4-1': 0,    '4-2': 120,  '4-3': 240,
  '4-4': 360,  '4-5': 480,  '4-6': 600,
  '3-1': 180,  '3-2': 420,
  '2-1': 90,   '2-2': 510,
  '1-1': 300,
}

// X position by round
const BASE_X: Record<number, number> = { 4: 0, 3: COL, 2: COL * 2, 1: COL * 3 }

const TOTAL_W = COL * 3 + CW               // 900
const TOTAL_H = 600 + CH + LH             // 716

// Connector SVG paths (y values include LH offset)
const c = (yBase: number) => yBase + CH / 2 + LH  // y-center helper
const CONNECTORS: string[] = [
  // M2 + M3 → QF1
  `M ${CW} ${c(120)} H 210 V ${c(180)} H ${COL}`,
  `M ${CW} ${c(240)} H 210 V ${c(180)} H ${COL}`,
  // M4 + M5 → QF2
  `M ${CW} ${c(360)} H 210 V ${c(420)} H ${COL}`,
  `M ${CW} ${c(480)} H 210 V ${c(420)} H ${COL}`,
  // M1 → SF1 (direct bypass QF column)
  `M ${CW} ${c(0)} H ${COL + CW / 2} V ${c(90)} H ${COL * 2}`,
  // QF1 → SF1
  `M ${COL + CW} ${c(180)} H ${COL + CW + 30} V ${c(90)} H ${COL * 2}`,
  // QF2 → SF2
  `M ${COL + CW} ${c(420)} H ${COL + CW + 30} V ${c(510)} H ${COL * 2}`,
  // M6 → SF2 (direct bypass QF column)
  `M ${CW} ${c(600)} H ${COL + CW / 2} V ${c(510)} H ${COL * 2}`,
  // SF1 + SF2 → Final
  `M ${COL * 2 + CW} ${c(90)} H ${COL * 2 + CW + 30} V ${c(300)} H ${COL * 3}`,
  `M ${COL * 2 + CW} ${c(510)} H ${COL * 2 + CW + 30} V ${c(300)} H ${COL * 3}`,
]

const ROUND_LABEL: Record<number, string> = {
  4: 'ЭХНИЙ ШАТ', 3: '¼ ФИНАЛ', 2: 'ХАГАС ФИНАЛ', 1: 'ФИНАЛ',
}

// Seeding hints for empty bracket slots
const SEED_HINT: Record<string, [string, string]> = {
  '4-1': ['A₁', 'F₂'], '4-2': ['B₁', 'C₂'], '4-3': ['C₁', 'D₂'],
  '4-4': ['D₁', 'E₂'], '4-5': ['E₁', 'B₂'], '4-6': ['F₁', 'A₂'],
}

// ── Match card ────────────────────────────────────────────────────────────────
function MatchCard({ m, seeds }: { m: BMatch; seeds?: [string, string] }) {
  const t1 = m.team1 ?? null
  const t2 = m.team2 ?? null
  const w  = m.winner ?? null
  const done = m.status === 'completed'
  const live = m.status === 'live'

  const win1 = done && w && t1 && w.name === t1.name
  const win2 = done && w && t2 && w.name === t2.name

  const rowStyle = (isWin: boolean, isLive: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center',
    padding: '0 8px', height: 36,
    background: isWin ? 'rgba(200,162,74,.18)' : 'transparent',
  })

  const nameStyle = (hasTeam: boolean, isWin: boolean): React.CSSProperties => ({
    flex: 1, fontSize: 11.5, lineHeight: 1.2,
    fontWeight: isWin ? 700 : 400,
    color: hasTeam ? (isWin ? '#7c5f14' : '#1a1a2e') : '#aaa',
    fontStyle: hasTeam ? 'normal' : 'italic',
    overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
  })

  const scoreStyle = (isWin: boolean): React.CSSProperties => ({
    fontSize: 13, fontWeight: 800,
    fontFamily: 'ui-monospace, monospace',
    color: isWin ? '#c8a24a' : '#888',
    minWidth: 18, textAlign: 'right',
  })

  const borderColor = live ? '#ef4444' : done ? '#c8a24a60' : '#dde'

  return (
    <div style={{
      width: CW, border: `1.5px solid ${borderColor}`,
      borderRadius: 6, background: 'white', overflow: 'hidden',
      boxShadow: live ? '0 0 0 3px rgba(239,68,68,.15)' : done ? '0 1px 4px rgba(0,0,0,.06)' : 'none',
    }}>
      {/* Team 1 */}
      <div style={rowStyle(!!win1, live)}>
        <span style={nameStyle(!!t1, !!win1)}>{t1?.name ?? (seeds ? seeds[0] : 'TBD')}</span>
        {(done || live) && <span style={scoreStyle(!!win1)}>{m.team1_score ?? 0}</span>}
      </div>
      <div style={{ height: 1, background: '#eee' }} />
      {/* Team 2 */}
      <div style={rowStyle(!!win2, live)}>
        <span style={nameStyle(!!t2, !!win2)}>{t2?.name ?? (seeds ? seeds[1] : 'TBD')}</span>
        {(done || live) && <span style={scoreStyle(!!win2)}>{m.team2_score ?? 0}</span>}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
type Props = {
  matches: BMatch[]
  getMatchHref?: (m: BMatch) => string
}

export default function BracketDiagram({ matches, getMatchHref }: Props) {
  const byKey = new Map<string, BMatch>()
  const thirdMatch = matches.find(m => m.stage === 'third')

  // Normalize round numbers and match_numbers to handle any generator convention
  const knockoutMatches = matches.filter(m => m.stage === 'knockout')
  if (knockoutMatches.length > 0) {
    // Count matches per round to identify first round (most matches)
    const roundCounts = new Map<number, number>()
    for (const m of knockoutMatches) roundCounts.set(m.round, (roundCounts.get(m.round) ?? 0) + 1)

    // Sort rounds: most matches → round 4, fewest → round 1
    const sortedRounds = [...roundCounts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0] - b[0])
    const roundMap = new Map(sortedRounds.map(([actual], idx) => [actual, 4 - idx]))

    // Group by normalized round, re-index match_numbers from 1
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

  const rounds = [4, 3, 2, 1]

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 12 }}>
      <div style={{ position: 'relative', width: TOTAL_W, height: TOTAL_H, minWidth: TOTAL_W }}>

        {/* ── SVG connector lines ─────────────────────────────────── */}
        <svg
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
          width={TOTAL_W} height={TOTAL_H}
        >
          {CONNECTORS.map((d, i) => (
            <path key={i} d={d} stroke="#c8cfe0" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          ))}
        </svg>

        {/* ── Round labels ────────────────────────────────────────── */}
        {rounds.map(r => (
          <div key={r} style={{
            position: 'absolute',
            left: BASE_X[r], top: 0,
            width: CW, textAlign: 'center',
            fontSize: 9, fontWeight: 700, letterSpacing: '.1em',
            color: r === 1 ? '#c8a24a' : '#666',
            textTransform: 'uppercase',
            lineHeight: `${LH}px`,
          }}>
            {ROUND_LABEL[r]}
          </div>
        ))}

        {/* ── Match cards ─────────────────────────────────────────── */}
        {rounds.map(r =>
          [1, 2, 3, 4, 5, 6].map(mn => {
            const key = `${r}-${mn}`
            const m = byKey.get(key)
            if (!m) return null
            const yTop = (BASE_Y[key] ?? 0) + LH
            const seeds = SEED_HINT[key]
            const card = <MatchCard m={m} seeds={seeds} />
            const href = getMatchHref?.(m)
            return (
              <div key={key} style={{
                position: 'absolute', left: BASE_X[r], top: yTop,
                cursor: href ? 'pointer' : 'default',
              }}>
                {href
                  ? <a href={href} style={{ display: 'block', textDecoration: 'none' }}>{card}</a>
                  : card}
              </div>
            )
          })
        )}

        {/* ── 3rd place match (bottom right) ──────────────────────── */}
        {thirdMatch && (() => {
          const thirdY = BASE_Y['1-1'] + LH + CH + 40
          return (
            <>
              <div style={{
                position: 'absolute',
                left: BASE_X[1], top: thirdY - 22,
                fontSize: 9, fontWeight: 700, color: '#cd7f32',
                letterSpacing: '.1em', textTransform: 'uppercase',
              }}>
                🥉 3-Р БАЙР
              </div>
              <div style={{ position: 'absolute', left: BASE_X[1], top: thirdY }}>
                <MatchCard m={thirdMatch} />
              </div>
            </>
          )
        })()}
      </div>
    </div>
  )
}
