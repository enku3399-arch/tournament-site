'use client'
import type { MatchWithTeams } from '@/lib/types'

// Layout constants
const MATCH_H = 68
const SLOT_GAP = 10
const ROUND_W = 200
const CONN_W = 30
const HEADER_H = 30

function roundLabel(r: number, total: number) {
  if (r === total) return 'Финал'
  if (r === total - 1) return 'Хагас финал'
  if (r === total - 2) return 'Шилдэг 8'
  return `${r}-р шат`
}

interface Props {
  matches: MatchWithTeams[]
  totalRounds: number
}

export default function Bracket({ matches, totalRounds }: Props) {
  if (matches.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
        Нугалааны тоглолт үүсгэгдээгүй байна
      </div>
    )
  }

  const rounds = Array.from({ length: totalRounds }, (_, i) => i + 1)
  const slotH1 = MATCH_H + SLOT_GAP
  const r1Count = matches.filter(m => m.round === 1).length || 1
  const totalH = r1Count * slotH1

  const finalMatch = matches.find(m => m.round === totalRounds && m.stage !== 'third')
  const champion = finalMatch?.status === 'completed' ? finalMatch.winner : null

  return (
    <div className="overflow-x-auto">
      <div className="relative flex" style={{ height: totalH + HEADER_H }}>
        {rounds.map((round, ri) => {
          const roundMatches = [...matches.filter(m => m.round === round)]
            .sort((a, b) => a.match_number - b.match_number)
          const slotH = slotH1 * Math.pow(2, ri)
          const isLast = round === totalRounds

          return (
            <div key={round} style={{ display: 'flex', flexShrink: 0 }}>
              {/* Round column */}
              <div className="relative flex-shrink-0" style={{ width: ROUND_W, height: totalH + HEADER_H }}>
                {/* Header */}
                <div
                  className="flex items-center justify-center text-xs font-bold uppercase tracking-widest text-muted"
                  style={{ height: HEADER_H }}
                >
                  {roundLabel(round, totalRounds)}
                </div>

                {/* Match cards */}
                {roundMatches.map((match, mi) => {
                  const topPos = HEADER_H + mi * slotH + (slotH - MATCH_H) / 2
                  return (
                    <div
                      key={match.id}
                      className="absolute"
                      style={{ top: topPos, left: 4, right: 4, height: MATCH_H }}
                    >
                      <PublicMatchCard match={match} isFinal={isLast} />
                    </div>
                  )
                })}
              </div>

              {/* Connector column */}
              {!isLast && (
                <div className="relative flex-shrink-0" style={{ width: CONN_W, height: totalH + HEADER_H }}>
                  {Array.from({ length: Math.ceil(roundMatches.length / 2) }, (_, j) => {
                    const topCY = HEADER_H + (2 * j) * slotH + slotH / 2
                    const botCY = HEADER_H + (2 * j + 1) * slotH + slotH / 2
                    const midY = (topCY + botCY) / 2
                    const half = CONN_W / 2
                    const col = 'rgba(38,51,84,0.8)'
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

        {/* Champion box */}
        <div style={{ display: 'flex', flexShrink: 0, alignItems: 'center', paddingLeft: 16 }}>
          {champion ? (
            <div style={{ width: 160 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#c8a24a', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 6 }}>
                🥇 Аварга
              </div>
              <div style={{
                borderRadius: 8, border: '2px solid #c8a24a',
                background: '#ffffff', padding: '10px 14px',
                boxShadow: '0 2px 12px rgba(0,0,0,.18)',
              }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#2a3a5c' }}>
                  {champion.name}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ width: 160, opacity: 0.35 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#c8a24a', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 6 }}>
                🥇 Аварга
              </div>
              <div style={{ borderRadius: 8, border: '1px dashed #3a4f7a', padding: '10px 14px' }}>
                <div style={{ fontSize: 11, color: '#8c9bbf', fontStyle: 'italic' }}>Хүлээгдэж байна</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PublicMatchCard({ match, isFinal }: { match: MatchWithTeams; isFinal?: boolean }) {
  const isLive = match.status === 'live'
  const isDone = match.status === 'completed'
  const rowH = MATCH_H / 2

  const win1 = isDone && match.winner_id === match.team1_id
  const win2 = isDone && match.winner_id === match.team2_id

  const borderColor = isLive ? '#ef4444' : isDone ? '#c8a24a80' : '#2f3e6e'

  const rows = [
    { name: match.team1?.name ?? null, isWin: win1, score: isDone ? match.team1_score : null },
    { name: match.team2?.name ?? null, isWin: win2, score: isDone ? match.team2_score : null },
  ]

  return (
    <div style={{
      width: '100%', height: '100%',
      border: `1px solid ${borderColor}`,
      borderRadius: 8,
      background: '#ffffff',
      overflow: 'hidden',
      boxShadow: isLive ? '0 0 0 3px rgba(239,68,68,.15)' : isDone ? '0 2px 8px rgba(0,0,0,.12)' : '0 1px 4px rgba(0,0,0,.06)',
    }}>
      {isLive && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(239,68,68,.15)', padding: '0 8px', height: 14, fontSize: 10, fontWeight: 700, color: '#ef4444' }}>
          ● LIVE
        </div>
      )}
      {rows.map(({ name, isWin, score }, idx) => (
        <div key={idx} style={{
          display: 'flex', alignItems: 'center',
          padding: '0 12px', height: isLive ? rowH - 7 : rowH,
          borderTop: idx === 1 ? '1px solid #e8ecf5' : undefined,
          borderLeft: isWin ? '4px solid #c8a24a' : '4px solid transparent',
          background: isWin ? 'rgba(200,162,74,.22)' : 'transparent',
        }}>
          <span style={{
            flex: 1, fontSize: 12, lineHeight: 1.2,
            fontWeight: isWin ? 800 : 400,
            color: isWin ? '#5a3a00' : (name ? '#2a3a5c' : '#aabbcc'),
            fontStyle: name ? 'normal' : 'italic',
            overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
          }}>
            {name ?? 'TBD'}
          </span>
          {score != null && (
            <span style={{
              fontSize: 14, fontWeight: 800,
              fontFamily: 'ui-monospace, monospace',
              color: isWin ? '#b8860b' : '#7a8aaa',
              minWidth: 18, textAlign: 'right',
            }}>
              {score}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
