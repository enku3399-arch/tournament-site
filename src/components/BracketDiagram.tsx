/**
 * BracketDiagram — 12-багийн нугалааны схем (6 хэсэг × 2 ялагч)
 * Bracket structure:
 *   R4M1 (A1vF2) ──────────────────────────► SF1 team1
 *   R4M2 (B1vC2) ─┐                          │
 *                  ├─ QF1 ──────────────────► SF1 team2 ──► Final ──► 🥇
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
const CW   = 190   // card width
const CH   = 72    // card height (2 rows)
const COL  = 250   // column span
const LH   = 40    // label row height
const WB   = 150   // winner box width

// Y-top of each match (without LH offset)
const BASE_Y: Record<string, number> = {
  '4-1': 0,    '4-2': 120,  '4-3': 240,
  '4-4': 360,  '4-5': 480,  '4-6': 600,
  '3-1': 180,  '3-2': 420,
  '2-1': 90,   '2-2': 510,
  '1-1': 300,
}

const BASE_X: Record<number, number> = { 4: 0, 3: COL, 2: COL * 2, 1: COL * 3 }

const TOTAL_W = COL * 3 + CW + 30 + WB + 20
const TOTAL_H = 600 + CH + LH

const c = (yBase: number) => yBase + CH / 2 + LH

const CONNECTORS: string[] = [
  `M ${CW} ${c(120)} H 220 V ${c(180)} H ${COL}`,
  `M ${CW} ${c(240)} H 220 V ${c(180)} H ${COL}`,
  `M ${CW} ${c(360)} H 220 V ${c(420)} H ${COL}`,
  `M ${CW} ${c(480)} H 220 V ${c(420)} H ${COL}`,
  `M ${CW} ${c(0)} H ${COL + CW / 2} V ${c(90)} H ${COL * 2}`,
  `M ${COL + CW} ${c(180)} H ${COL + CW + 30} V ${c(90)} H ${COL * 2}`,
  `M ${COL + CW} ${c(420)} H ${COL + CW + 30} V ${c(510)} H ${COL * 2}`,
  `M ${CW} ${c(600)} H ${COL + CW / 2} V ${c(510)} H ${COL * 2}`,
  `M ${COL * 2 + CW} ${c(90)} H ${COL * 2 + CW + 30} V ${c(300)} H ${COL * 3}`,
  `M ${COL * 2 + CW} ${c(510)} H ${COL * 2 + CW + 30} V ${c(300)} H ${COL * 3}`,
  // Final → champion box
  `M ${COL * 3 + CW} ${c(300)} H ${COL * 3 + CW + 30}`,
]

const ROUND_LABEL: Record<number, string> = {
  4: 'ЭХНИЙ ШАТ', 3: 'ШИЛДЭГ 8', 2: 'ХАГАС ФИНАЛ', 1: 'ФИНАЛ',
}

const SEED_HINT: Record<string, [string, string]> = {
  '4-1': ['A₁', 'F₂'], '4-2': ['B₁', 'C₂'], '4-3': ['C₁', 'D₂'],
  '4-4': ['D₁', 'E₂'], '4-5': ['E₁', 'B₂'], '4-6': ['F₁', 'A₂'],
}

// ── Match card — darts design ─────────────────────────────────────────────────
function MatchCard({ m, seeds }: { m: BMatch; seeds?: [string, string] }) {
  const t1   = m.team1 ?? null
  const t2   = m.team2 ?? null
  const w    = m.winner ?? null
  const done = m.status === 'completed'
  const live = m.status === 'live'

  const win1 = done && w && t1 && w.name === t1.name
  const win2 = done && w && t2 && w.name === t2.name

  const borderColor = live ? '#ef4444' : done ? '#c8a24a80' : '#2f3e6e'

  const rows = [
    { team: t1, isWin: !!win1, score: m.team1_score, seed: seeds?.[0] },
    { team: t2, isWin: !!win2, score: m.team2_score, seed: seeds?.[1] },
  ]

  return (
    <div style={{
      width: CW,
      border: `1px solid ${borderColor}`,
      borderRadius: 8,
      background: '#ffffff',
      overflow: 'hidden',
      boxShadow: live ? '0 0 0 3px rgba(239,68,68,.15)' : done ? '0 2px 8px rgba(0,0,0,.12)' : '0 1px 4px rgba(0,0,0,.06)',
    }}>
      {rows.map(({ team, isWin, score, seed }, idx) => (
        <div key={idx} style={{
          display: 'flex', alignItems: 'center',
          padding: '0 12px', height: CH / 2,
          borderTop: idx === 1 ? '1px solid #e8ecf5' : undefined,
          borderLeft: isWin ? '3px solid #c8a24a' : '3px solid transparent',
          background: isWin ? 'rgba(200,162,74,.09)' : 'transparent',
        }}>
          <span style={{
            flex: 1, fontSize: 12, lineHeight: 1.2,
            fontWeight: isWin ? 700 : 400,
            color: isWin ? '#7c5200' : (team ? '#2a3a5c' : '#aab'),
            fontStyle: team ? 'normal' : 'italic',
            overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
          }}>
            {team?.name ?? (seed ?? 'TBD')}
          </span>
          {(done || live) && (
            <span style={{
              fontSize: 14, fontWeight: 800,
              fontFamily: 'ui-monospace, monospace',
              color: isWin ? '#c8a24a' : '#7a8aaa',
              minWidth: 18, textAlign: 'right',
            }}>
              {score ?? 0}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Winner box ────────────────────────────────────────────────────────────────
function WinnerBox({ name, label, color, borderColor, bgColor }: {
  name: string; label: string; color: string; borderColor: string; bgColor: string
}) {
  return (
    <div style={{ width: WB }}>
      <div style={{
        fontSize: 9, fontWeight: 700, color, letterSpacing: '.12em',
        textTransform: 'uppercase', marginBottom: 6,
      }}>{label}</div>
      <div style={{
        borderRadius: 8,
        border: `1.5px solid ${borderColor}`,
        background: bgColor,
        padding: '10px 14px',
      }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#111d36', lineHeight: 1.3 }}>
          {name}
        </div>
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
  const byKey     = new Map<string, BMatch>()
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

  const finalMatch = byKey.get('1-1')
  const finalWinner   = finalMatch?.status === 'completed' ? finalMatch.winner : null
  const thirdWinner   = thirdMatch?.status === 'completed' ? thirdMatch.winner : null

  const finalY  = (BASE_Y['1-1'] ?? 0) + LH
  const thirdY  = (BASE_Y['1-1'] ?? 0) + LH + CH + 44
  const wboxX   = BASE_X[1] + CW + 30

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 12 }}>
      <div style={{ position: 'relative', width: TOTAL_W, height: TOTAL_H, minWidth: TOTAL_W }}>

        {/* ── SVG connectors ──────────────────────────────────────── */}
        <svg
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
          width={TOTAL_W} height={TOTAL_H}
        >
          {CONNECTORS.map((d, i) => (
            <path key={i} d={d} stroke="#3a4f7a" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          ))}
        </svg>

        {/* ── Round labels ─────────────────────────────────────────── */}
        {([4, 3, 2, 1] as const).map(r => (
          <div key={r} style={{
            position: 'absolute', left: BASE_X[r], top: 0,
            width: CW, textAlign: 'center',
            fontSize: 9, fontWeight: 700, letterSpacing: '.1em',
            color: r === 1 ? '#c8a24a' : '#8c9bbf',
            textTransform: 'uppercase', lineHeight: `${LH}px`,
          }}>
            {ROUND_LABEL[r]}
          </div>
        ))}

        {/* ── Match cards ──────────────────────────────────────────── */}
        {([4, 3, 2, 1] as const).map(r =>
          [1, 2, 3, 4, 5, 6].map(mn => {
            const key = `${r}-${mn}`
            const m   = byKey.get(key)
            if (!m) return null
            const yTop = (BASE_Y[key] ?? 0) + LH
            const seeds = SEED_HINT[key]
            const card  = <MatchCard m={m} seeds={seeds} />
            const href  = getMatchHref?.(m)
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

        {/* ── Champion box (right of Final) ────────────────────────── */}
        <div style={{
          position: 'absolute', left: wboxX,
          top: finalY + CH / 2 - (finalWinner ? 52 : 44),
        }}>
          {finalWinner ? (
            <WinnerBox
              name={finalWinner.name}
              label="🥇 Чемпион"
              color="#c8a24a"
              borderColor="rgba(200,162,74,.55)"
              bgColor="rgba(200,162,74,.08)"
            />
          ) : (
            <div style={{
              width: WB, borderRadius: 8, border: '1px dashed #3a4f7a',
              padding: '10px 14px', opacity: 0.4,
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#c8a24a', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>🥇 Чемпион</div>
              <div style={{ fontSize: 11, color: '#8c9bbf', fontStyle: 'italic' }}>Тодрохгүй байна</div>
            </div>
          )}
        </div>

        {/* ── 3rd place match ──────────────────────────────────────── */}
        {thirdMatch && (
          <>
            <div style={{
              position: 'absolute', left: BASE_X[1], top: thirdY - 20,
              fontSize: 9, fontWeight: 700, color: '#cd7f32',
              letterSpacing: '.1em', textTransform: 'uppercase',
            }}>
              🥉 3-Р БАЙР
            </div>
            <div style={{ position: 'absolute', left: BASE_X[1], top: thirdY }}>
              <MatchCard m={thirdMatch} />
            </div>

            {/* 3rd place winner box */}
            <div style={{
              position: 'absolute', left: wboxX,
              top: thirdY + CH / 2 - (thirdWinner ? 52 : 44),
            }}>
              {thirdWinner ? (
                <WinnerBox
                  name={thirdWinner.name}
                  label="🥉 3-р байр"
                  color="#cd7f32"
                  borderColor="rgba(205,127,50,.45)"
                  bgColor="rgba(205,127,50,.07)"
                />
              ) : (
                <div style={{
                  width: WB, borderRadius: 8, border: '1px dashed #3a4f7a',
                  padding: '10px 14px', opacity: 0.4,
                }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#cd7f32', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>🥉 3-р байр</div>
                  <div style={{ fontSize: 11, color: '#8c9bbf', fontStyle: 'italic' }}>Тодрохгүй байна</div>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  )
}
