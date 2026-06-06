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
  if (r === total - 2) return 'Улирал финал'
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
      </div>
    </div>
  )
}

function PublicMatchCard({ match, isFinal }: { match: MatchWithTeams; isFinal?: boolean }) {
  const isLive = match.status === 'live'
  const isDone = match.status === 'completed'
  const rowH = MATCH_H / 2

  return (
    <div className={`relative h-full rounded-lg border overflow-hidden text-xs ${
      isLive ? 'border-live/50 shadow-sm shadow-live/20' :
      isFinal ? 'border-accent/40' : 'border-border'
    }`}>
      {isLive && (
        <div className="flex items-center gap-1 bg-live/20 px-2 text-[10px] font-bold text-live" style={{ height: 14 }}>
          <span className="h-1.5 w-1.5 rounded-full bg-live animate-pulse-live" />LIVE
        </div>
      )}
      <TeamRow
        name={match.team1?.name ?? null}
        score={isDone ? match.team1_score : null}
        isWinner={isDone && match.winner_id === match.team1_id}
        isLoser={isDone && !!match.winner_id && match.winner_id !== match.team1_id}
        height={isLive ? rowH - 7 : rowH}
        withBorderB
      />
      <TeamRow
        name={match.team2?.name ?? null}
        score={isDone ? match.team2_score : null}
        isWinner={isDone && match.winner_id === match.team2_id}
        isLoser={isDone && !!match.winner_id && match.winner_id !== match.team2_id}
        height={isLive ? rowH - 7 : rowH}
      />
    </div>
  )
}

function TeamRow({
  name, score, isWinner, isLoser, height, withBorderB,
}: {
  name: string | null; score: number | null | undefined
  isWinner: boolean; isLoser: boolean
  height: number; withBorderB?: boolean
}) {
  return (
    <div
      className={`flex items-center gap-1 px-2 ${isWinner ? 'bg-primary/10' : ''} ${withBorderB ? 'border-b border-border/60' : ''}`}
      style={{ height }}
    >
      <span className={`flex-1 truncate font-medium ${
        isWinner ? 'text-live font-bold' : isLoser ? 'text-muted/50 line-through' : 'text-foreground/80'
      }`}>
        {name ?? <span className="italic text-muted/40 text-[10px]">TBD</span>}
      </span>
      {score != null && (
        <span className={`shrink-0 font-bold tabular-nums ${isWinner ? 'text-live' : 'text-muted'}`}>
          {score}
        </span>
      )}
    </div>
  )
}
