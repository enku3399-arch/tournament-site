'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { SPORT_ICONS } from '@/lib/types'

type SportInfo = { id: string; name: string; sport_type: string; weight: number }

type ScoreEntry = {
  sportId: string
  score: number
  base: number
  participated: boolean
}

type StandingRow = {
  name: string
  scores: ScoreEntry[]
  total: number
}

type StandingsData = {
  standings: StandingRow[]
  sports: SportInfo[]
}

function getPlacementLabel(score: number, base: number, participated: boolean) {
  if (!participated) return { text: '—', colorClass: 'text-muted/30' }
  const offset = score - base
  if (offset === 0) return { text: '🥇', colorClass: 'text-yellow-500' }
  if (offset === 1) return { text: '🥈', colorClass: 'text-gray-400' }
  if (offset === 2) return { text: '🥉', colorClass: 'text-orange-400' }
  if (offset === 3) return { text: '4-р', colorClass: 'text-muted' }
  if (offset === 4) return { text: 'QF', colorClass: 'text-muted' }
  if (offset === 5) return { text: 'R16', colorClass: 'text-muted/70' }
  return { text: 'Хэс', colorClass: 'text-muted/50' }
}

function getMedalColor(rank: number) {
  if (rank === 1) return 'bg-yellow-500/8 border-yellow-500/20'
  if (rank === 2) return 'bg-gray-400/5 border-gray-400/10'
  if (rank === 3) return 'bg-orange-400/5 border-orange-400/10'
  return ''
}

export default function StandingsClient({ id, tournamentName }: { id: string; tournamentName: string }) {
  const [data, setData] = useState<StandingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchStandings = useCallback(async () => {
    try {
      const res = await fetch(`/api/tournaments/${id}/standings`, { cache: 'no-store' })
      if (!res.ok) return
      const json = await res.json()
      setData(json)
      setLastUpdated(new Date())
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchStandings()
    const interval = setInterval(fetchStandings, 30_000)
    return () => clearInterval(interval)
  }, [fetchStandings])

  const sports = data?.sports ?? []
  const standings = data?.standings ?? []
  const top3 = standings.slice(0, 3)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Link href={`/t/${id}`} className="text-muted hover:text-foreground transition-colors text-sm">
            ← Буцах
          </Link>
          <div className="h-4 w-px bg-border" />
          <div>
            <h1 className="text-2xl font-extrabold">🏆 Нэгдсэн дүнгийн хүснэгт</h1>
            <p className="text-sm text-muted">{tournamentName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-muted/60">
              {lastUpdated.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })} шинэчлэгдсэн
            </span>
          )}
          <button
            onClick={fetchStandings}
            className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
          >
            ↻ Шинэчлэх
          </button>
        </div>
      </div>

      {loading && (
        <div className="rounded-xl border border-border bg-surface px-5 py-8 text-center text-muted animate-pulse">
          Дүн тооцож байна…
        </div>
      )}

      {/* Подиум */}
      {!loading && top3.length >= 3 && (() => {
        const podium = [top3[1], top3[0], top3[2]] // silver | gold | bronze
        const heights = ['h-20', 'h-28', 'h-16']
        const medals = ['🥈', '🥇', '🥉']
        const ranks = [2, 1, 3]
        const borders = [
          'border-gray-400/40 bg-gray-400/5',
          'border-yellow-500/50 bg-yellow-500/10 scale-105 shadow-lg',
          'border-orange-400/40 bg-orange-400/5',
        ]
        return (
          <div className="grid grid-cols-3 gap-3">
            {podium.map((row, i) => (
              <div key={row.name} className={`rounded-xl border text-center p-4 ${borders[i]} transition-transform`}>
                <div className="text-3xl mb-1">{medals[i]}</div>
                <div className="font-bold">{row.name}</div>
                <div className="text-2xl font-extrabold text-accent mt-1">{row.total}</div>
                <div className="text-xs text-muted mt-0.5">{ranks[i]}-р байр · {row.total} оноо</div>
              </div>
            ))}
          </div>
        )
      })()}

      {/* Empty state */}
      {!loading && standings.length === 0 && (
        <div className="rounded-xl border border-accent/20 bg-accent/5 px-5 py-6 text-center text-sm">
          <span className="text-accent font-semibold">⏳ Тоглолтууд эхлэх хүлээгдэж байна</span>
          <p className="mt-1 text-xs text-muted">Дүн оруулагдсаны дараа хүснэгт харагдана</p>
        </div>
      )}

      {/* Хүснэгт */}
      {!loading && standings.length > 0 && (
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-max">
              <thead>
                <tr className="text-xs text-muted border-b border-border bg-surface-2">
                  <th className="text-left px-3 py-3 w-10 sticky left-0 bg-surface-2 z-10">#</th>
                  <th className="text-left px-3 py-3 sticky left-10 bg-surface-2 z-10 min-w-[120px]">Аймаг / Дүүрэг</th>
                  {sports.map(s => (
                    <th key={s.id} className="text-center px-2 py-3 min-w-[64px]">
                      <div className="flex flex-col items-center gap-0.5">
                        <span>{SPORT_ICONS[s.sport_type] ?? '🏅'}</span>
                        <span className="text-[10px] leading-tight whitespace-nowrap max-w-[60px] truncate" title={s.name}>
                          {s.name}
                        </span>
                      </div>
                    </th>
                  ))}
                  <th className="text-center px-3 py-3 font-bold text-foreground sticky right-0 bg-surface-2 z-10 min-w-[56px]">
                    Нийт
                  </th>
                </tr>
              </thead>
              <tbody>
                {standings.map((row, i) => {
                  const rank = i + 1
                  return (
                    <tr
                      key={row.name}
                      className={`border-t border-border/30 transition-colors ${getMedalColor(rank)} ${rank > 3 ? 'hover:bg-surface-2/40' : ''}`}
                    >
                      <td className="px-3 py-3 font-bold text-muted sticky left-0 bg-inherit z-10">{rank}</td>
                      <td className="px-3 py-3 font-semibold sticky left-10 bg-inherit z-10">
                        {rank <= 3 && <span className="mr-1">{['🥇', '🥈', '🥉'][rank - 1]}</span>}
                        {row.name}
                      </td>
                      {sports.map(sport => {
                        const entry = row.scores.find(s => s.sportId === sport.id)
                        if (!entry) return <td key={sport.id} className="text-center px-2 py-3"><span className="text-muted/30">—</span></td>
                        const { text, colorClass } = getPlacementLabel(entry.score, entry.base, entry.participated)
                        const isTop3 = entry.participated && entry.score - entry.base <= 2
                        return (
                          <td key={sport.id} className="text-center px-2 py-3">
                            <div className="flex flex-col items-center gap-0.5">
                              <span className={`font-bold text-sm ${isTop3 ? 'text-foreground' : 'text-muted/70'}`}>
                                {entry.participated ? entry.score : '—'}
                              </span>
                              <span className={`text-[10px] leading-tight ${colorClass}`}>{text}</span>
                            </div>
                          </td>
                        )
                      })}
                      <td className="text-center px-3 py-3 font-extrabold text-lg text-accent sticky right-0 bg-inherit z-10">
                        {row.total}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Тайлбар */}
      <div className="rounded-xl border border-border bg-surface p-4 text-xs text-muted space-y-2">
        <p className="font-semibold text-foreground/70 text-sm">📋 Оноо тооцох дүрэм — бага оноогийн систем</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="space-y-1">
            <p className="font-medium text-foreground/60">⚽ Сагс, Волейбол (суурь 1)</p>
            <p>🥇 1-р байр = <b className="text-foreground">1</b> · 🥈 2-р = <b className="text-foreground">2</b> · 🥉 3-р = <b className="text-foreground">3</b></p>
            <p>4-р байр = 4 · QF = 5 · Хэсэг = 7</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground/60">🏓 Теннис, Дартс (суурь 3)</p>
            <p>🥇 1-р байр = <b className="text-foreground">3</b> · 🥈 2-р = <b className="text-foreground">4</b> · 🥉 3-р = <b className="text-foreground">5</b></p>
            <p>4-р байр = 6 · QF = 7 · Хэсэг = 9</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground/60">♟️ Шатар (суурь 5)</p>
            <p>🥇 1-р байр = <b className="text-foreground">5</b> · 🥈 2-р = <b className="text-foreground">6</b> · 🥉 3-р = <b className="text-foreground">7</b></p>
            <p>4-р байр = 8 · QF = 9 · Хэсэг = 11</p>
          </div>
        </div>
        <p className="pt-1 border-t border-border/50">
          Оролцоогүй спорт бүрт <b className="text-foreground">+10 оноо</b> шийтгэл ·
          Нийт оноо хамгийн <b className="text-foreground">бага</b> аймаг тэргүүлнэ ·
          30 секунд тутам автомат шинэчлэгдэнэ
        </p>
      </div>
    </div>
  )
}
