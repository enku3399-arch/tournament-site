'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const SPORT_ICONS: Record<string, string> = {
  basketball:   '🏀',
  volleyball:   '🏐',
  chess:        '♟️',
  table_tennis: '🏓',
  darts:        '🎯',
}
const GENDER: Record<string, string> = { male: '♂', female: '♀' }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type M = any

function sportLabel(sport: M): string {
  if (!sport) return '—'
  const icon = SPORT_ICONS[sport.sport_type] ?? '🏅'
  const g = sport.gender ? ` ${GENDER[sport.gender] ?? ''}` : ''
  return `${icon} ${sport.name}${g}`
}

function roundLabel(stage: string, round: number): string {
  if (stage === 'group') return 'Хэсгийн тэмцээн'
  const labels: Record<number, string> = { 1: 'Финал', 2: 'Хагас финал', 3: '¼ Финал', 4: '⅛ Финал' }
  return labels[round] ?? `${round}-р шат`
}

function MatchCard({ m, live }: { m: M; live: boolean }) {
  const s1 = m.team1_score ?? 0
  const s2 = m.team2_score ?? 0
  const t1w = s1 > s2, t2w = s2 > s1

  return (
    <div style={{
      background: live ? 'rgba(239,68,68,.06)' : 'var(--ink-2)',
      border: `1px solid ${live ? 'rgba(239,68,68,.3)' : 'var(--line)'}`,
      borderRadius: 12, padding: '18px 20px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontFamily: 'var(--display)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--fog)' }}>
          {sportLabel(m.sport)}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fog)' }}>
            {roundLabel(m.stage, m.round)}
          </span>
          {live && (
            <span className="live-dot" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontFamily: 'var(--display)', letterSpacing: '.1em', color: 'var(--red)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', display: 'inline-block' }} />
              LIVE
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'center' }}>
        <div style={{ textAlign: 'right', fontFamily: 'var(--display)', fontSize: 13, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: t1w ? 'var(--gold-light)' : 'var(--paper)' }}>
          {m.team1?.name ?? '—'}
        </div>
        <div style={{ textAlign: 'center', minWidth: 72 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 26, fontWeight: 700, lineHeight: 1 }}>
            <span style={{ color: t1w ? 'var(--gold-light)' : 'var(--paper)' }}>{s1}</span>
            <span style={{ color: 'var(--fog)', margin: '0 5px', fontSize: 18 }}>–</span>
            <span style={{ color: t2w ? 'var(--gold-light)' : 'var(--paper)' }}>{s2}</span>
          </div>
          {!live && (
            <div style={{ fontSize: 9, fontFamily: 'var(--display)', letterSpacing: '.1em', color: 'var(--fog)', marginTop: 3, textTransform: 'uppercase' }}>
              Эцсийн
            </div>
          )}
        </div>
        <div style={{ textAlign: 'left', fontFamily: 'var(--display)', fontSize: 13, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: t2w ? 'var(--gold-light)' : 'var(--paper)' }}>
          {m.team2?.name ?? '—'}
        </div>
      </div>
    </div>
  )
}

export default function LiveClient({ liveMatches, recentMatches }: { liveMatches: M[]; recentMatches: M[] }) {
  const router = useRouter()
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [countdown, setCountdown] = useState(30)

  useEffect(() => {
    setLastUpdate(new Date())
    const ri = setInterval(() => {
      router.refresh()
      setLastUpdate(new Date())
      setCountdown(30)
    }, 30000)
    const ci = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000)
    return () => { clearInterval(ri); clearInterval(ci) }
  }, [router])

  const t = lastUpdate ? lastUpdate.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'

  return (
    <div>
      {/* Status bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 32, fontSize: 11, fontFamily: 'var(--display)', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fog)' }}>
        <span>Шинэчлэгдсэн: {t}</span>
        <span>Автоматаар шинэчлэгдэнэ {countdown}с дараа</span>
      </div>

      {/* Live matches */}
      {liveMatches.length > 0 && (
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', display: 'inline-block' }} />
            <h2 className="section-title" style={{ fontSize: 22, margin: 0 }}>
              Явагдаж байна · <span style={{ color: 'var(--red)' }}>{liveMatches.length}</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {liveMatches.map((m: M) => <MatchCard key={m.id} m={m} live />)}
          </div>
        </div>
      )}

      {liveMatches.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', borderBottom: '1px solid var(--line)', marginBottom: 40 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🏟️</div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--fog)' }}>
            Одоогоор шууд тоглолт байхгүй байна
          </div>
        </div>
      )}

      {/* Recent results */}
      {recentMatches.length > 0 && (
        <div>
          <h2 className="section-title" style={{ fontSize: 22, marginBottom: 20 }}>
            Дуусагдсан <span className="gold">тоглолтууд</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {recentMatches.map((m: M) => <MatchCard key={m.id} m={m} live={false} />)}
          </div>
        </div>
      )}

      {liveMatches.length === 0 && recentMatches.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0', fontFamily: 'var(--display)', fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--fog)' }}>
          Тоглолтын мэдэгдэл байхгүй байна
        </div>
      )}
    </div>
  )
}
