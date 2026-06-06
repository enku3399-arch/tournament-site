'use client'

import { useState } from 'react'

type Podium = { place: number; team: string; score: string }

interface SportResult {
  sport: string
  status: string
  podium: Podium[]
}

const SPORT_RESULTS: SportResult[] = [
  { sport: 'Сагсан бөмбөг ♂', status: 'Дууссан',
    podium: [
      { place: 1, team: 'Төв аймаг',  score: '78 — 65' },
      { place: 2, team: 'Сэлэнгэ',    score: '65 — 78' },
      { place: 3, team: 'Дархан-Уул', score: '3-р байр' },
      { place: 4, team: 'Увс',         score: 'Хагас финал' },
      { place: 5, team: 'Орхон',       score: 'Хагас финал' },
    ]},
  { sport: 'Сагсан бөмбөг ♀',    status: 'Явагдаж байна', podium: [] },
  { sport: 'Волейбол ♂',          status: 'Явагдаж байна', podium: [] },
  { sport: 'Волейбол ♀',          status: 'Явагдаж байна', podium: [] },
  { sport: 'Шатар (баг)', status: 'Дууссан',
    podium: [
      { place: 1, team: 'Увс',       score: '7.0/7' },
      { place: 2, team: 'Өмнөговь',  score: '6.5/7' },
      { place: 3, team: 'Орхон',     score: '6.0/7' },
      { place: 4, team: 'Сэлэнгэ',   score: '5.5/7' },
      { place: 5, team: 'Төв аймаг', score: '5.0/7' },
    ]},
  { sport: 'Ширээний теннис (баг)', status: 'Тоглоогүй', podium: [] },
  { sport: 'Дартс (баг)', status: 'Дууссан',
    podium: [
      { place: 1, team: 'Увс',       score: '501 · 3 leg' },
      { place: 2, team: 'Сэлэнгэ',   score: '2-р байр' },
      { place: 3, team: 'Өмнөговь',  score: '3-р байр' },
      { place: 4, team: 'Архангай',   score: 'Хагас финал' },
      { place: 5, team: 'Дорнод',     score: 'Хагас финал' },
    ]},
]

const PREVIEW_COUNT = 3

function SportCard({ sr }: { sr: SportResult }) {
  const [expanded, setExpanded] = useState(false)
  const shown = expanded ? sr.podium : sr.podium.slice(0, PREVIEW_COUNT)
  const hasMore = sr.podium.length > PREVIEW_COUNT

  const statusBg = sr.status === 'Дууссан' ? 'rgba(34,197,94,.15)' : sr.status === 'Явагдаж байна' ? 'rgba(239,68,68,.15)' : 'rgba(11,20,38,.08)'
  const statusColor = sr.status === 'Дууссан' ? '#16a34a' : sr.status === 'Явагдаж байна' ? '#dc2626' : 'rgba(11,20,38,.4)'

  return (
    <div style={{ background: 'var(--bone)', border: '1px solid rgba(11,20,38,.12)', borderRadius: 16, padding: '20px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 16, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.2 }}>
          {sr.sport}
        </div>
        <span style={{ fontSize: 10, fontFamily: 'var(--display)', letterSpacing: '.1em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4, background: statusBg, color: statusColor }}>
          {sr.status}
        </span>
      </div>

      {shown.length > 0 ? (
        <div style={{ display: 'grid', gap: 8 }}>
          {shown.map(p => (
            <div key={p.place} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: p.place === 1 ? '#FFD700' : p.place === 2 ? '#C0C0C0' : p.place === 3 ? '#CD7F32' : 'rgba(11,20,38,.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
                color: p.place <= 3 ? (p.place === 1 ? '#7a5f00' : p.place === 2 ? '#3d3d3d' : '#5a3210') : 'rgba(11,20,38,.5)',
              }}>
                {p.place}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{p.team}</div>
                <div style={{ fontSize: 11, color: 'rgba(11,20,38,.45)', fontFamily: 'var(--mono)' }}>{p.score}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: 13, color: 'rgba(11,20,38,.4)', margin: 0 }}>
          {sr.status === 'Тоглоогүй' ? 'Тэмцээн эхлээгүй байна' : 'Тэмцээн явагдаж байна...'}
        </p>
      )}

      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            marginTop: 14, width: '100%', background: 'none', border: '1px solid rgba(11,20,38,.15)',
            borderRadius: 8, padding: '8px 12px', cursor: 'pointer',
            fontSize: 12, fontFamily: 'var(--display)', letterSpacing: '.08em', textTransform: 'uppercase',
            color: 'rgba(11,20,38,.55)',
          }}
        >
          {expanded ? '▲ Хураах' : `▼ Дэлгэрэнгүй (${sr.podium.length - PREVIEW_COUNT} дэлгэрэнгүй)`}
        </button>
      )}
    </div>
  )
}

export default function SportResultsSection() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
      {SPORT_RESULTS.map(sr => (
        <SportCard key={sr.sport} sr={sr} />
      ))}
    </div>
  )
}
