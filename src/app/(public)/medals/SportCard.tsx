'use client'
import { useState } from 'react'
import { AIMAG_LOGO } from '@/lib/aimag-logo'

const SPORT_ICON: Record<string, string> = {
  basketball: '🏀', volleyball: '🏐', chess: '♟️', table_tennis: '🏓', darts: '🎯',
}

type Props = {
  sr: {
    id: string
    name: string
    sport_type: string
    podium: { rank: number; name: string }[]
    hasResults: boolean
  }
}

export default function SportCard({ sr }: Props) {
  const [expanded, setExpanded] = useState(false)

  const top3 = sr.podium.slice(0, 3)
  const rest = sr.podium.slice(3)
  const shown = expanded ? sr.podium : top3

  return (
    <div style={{
      background: 'var(--bone)',
      border: '1px solid rgba(11,20,38,.12)',
      borderRadius: 16,
      padding: '20px 24px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{
          fontFamily: 'Oswald, sans-serif', fontSize: 16, fontWeight: 600,
          color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>{SPORT_ICON[sr.sport_type] ?? '🏅'}</span>
          {sr.name}
        </div>
        <span style={{
          fontSize: 10, fontFamily: 'var(--display)', letterSpacing: '.1em',
          textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4,
          background: sr.hasResults ? 'rgba(34,197,94,.15)' : 'rgba(11,20,38,.08)',
          color: sr.hasResults ? '#16a34a' : 'rgba(11,20,38,.4)',
        }}>
          {sr.hasResults ? 'Дуусгавар' : 'Эхлээгүй'}
        </span>
      </div>

      {/* Rows */}
      {!sr.hasResults ? (
        <p style={{ fontSize: 13, color: 'rgba(11,20,38,.4)', margin: 0 }}>
          Тэмцээн эхлээгүй байна
        </p>
      ) : shown.length > 0 ? (
        <div style={{ display: 'grid', gap: 6 }}>
          {shown.map(p => (
            <div key={p.name} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '4px 0',
              borderBottom: p.rank === 3 && !expanded ? 'none' : undefined,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: p.rank === 1 ? '#FFD700' : p.rank === 2 ? '#C0C0C0' : p.rank === 3 ? '#CD7F32' : 'rgba(11,20,38,.07)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
                color: p.rank <= 3
                  ? (p.rank === 1 ? '#7a5f00' : p.rank === 2 ? '#3d3d3d' : '#5a3210')
                  : 'rgba(11,20,38,.4)',
              }}>
                {p.rank}
              </div>
              {AIMAG_LOGO[p.name] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={AIMAG_LOGO[p.name]}
                  alt={p.name}
                  style={{ width: 22, height: 22, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }}
                />
              )}
              <div style={{
                fontSize: 13,
                fontWeight: p.rank <= 3 ? 600 : 400,
                color: p.rank <= 3 ? 'var(--ink)' : 'rgba(11,20,38,.55)',
              }}>
                {p.name}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Expand/collapse — зөвхөн дүн байгаа үед */}
      {sr.hasResults && rest.length > 0 && (
        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            marginTop: 10, width: '100%',
            padding: '7px 0',
            background: 'none',
            border: '1px solid rgba(11,20,38,.12)',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 12,
            color: 'rgba(11,20,38,.45)',
            fontFamily: 'var(--display)',
            letterSpacing: '.05em',
            transition: 'background .15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(11,20,38,.05)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          {expanded ? '▲ Хураах' : `▼ Бүгдийг харах · ${sr.podium.length} аймаг`}
        </button>
      )}
    </div>
  )
}
