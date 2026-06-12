import Link from 'next/link'
import { calculateMedalStandings } from '@/lib/medal-calc'
import type { AimagStanding } from '@/lib/medal-calc'
import { getSiteSettings } from '@/lib/site-settings'
import { AIMAG_LOGO } from '@/lib/aimag-logo'
import RealtimeRefresher from '@/components/RealtimeRefresher'
import SportCard from './SportCard'

export const dynamic = 'force-dynamic'

function sportShortLabel(name: string): string {
  const gender = name.includes('Эрэгтэй') ? ' Эр' : name.includes('Эмэгтэй') ? ' Эм' : ''
  const base = name.replace(/\s*\(?Эрэгтэй\)?|\s*\(?Эмэгтэй\)?/g, '').trim()
  return base + gender
}

const SPORT_ICON: Record<string, string> = {
  basketball: '🏀', volleyball: '🏐', chess: '♟️', table_tennis: '🏓', darts: '🎯',
}

export const metadata = {
  title: 'Медалийн хүснэгт · Монгол 87/89 V Спорт Наадам 2026',
  description: 'Аймгуудын медалийн ерөнхий байдал · V Спорт Наадам 2026',
}


function AimagBadge({ abbr, rank, name }: { abbr: string; rank: number; name: string }) {
  const color = rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32'
    : rank <= 5 ? 'var(--gold)' : 'var(--fog-2)'
  const logo = AIMAG_LOGO[name]
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
      background: 'var(--ink-3)',
      border: `1px solid ${rank <= 3 ? color : 'var(--line)'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '.04em',
          color: rank <= 3 ? color : 'var(--fog)',
          fontFamily: 'var(--display)',
        }}>{abbr}</span>
      )}
    </div>
  )
}

export default async function MedalsPage() {
  const settings = await getSiteSettings()
  const { standings, sportResults, lastUpdated } = await calculateMedalStandings(settings.sport_overrides)

  const topThree = standings.slice(0, 3)
  const rest = standings.slice(3)
  const hasAnyMedal = standings.some(s => s.medals > 0)

  return (
    <>
      <RealtimeRefresher />
      {/* ── Header ─────────────────────────────────────────────── */}
      <section className="section" style={{ padding: '48px 0 40px' }}>
        <div className="wrap-wide">
          <span className="eyebrow" style={{ color: 'var(--fog)' }}>
            Medal Standings · Бага онооны систем
          </span>
          <h1 className="section-title" style={{ fontFamily: 'Oswald, sans-serif', fontSize: 48, marginTop: 8 }}>
            Медалийн <span className="gold">хүснэгт</span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--fog)', marginTop: 8 }}>
            Шинэчлэгдсэн: {new Date(lastUpdated).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })}
            {' · '}Бага оноо = илүү байр (7 төрлийн байрлалын нийлбэр)
          </p>
        </div>
      </section>

      {/* ── Podium top 3 ───────────────────────────────────────── */}
      {hasAnyMedal && topThree.length >= 2 && (
        <section className="section" style={{ paddingTop: 0, paddingBottom: 48 }}>
          <div className="wrap-wide">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 12, marginBottom: 48 }}>
              {/* 2nd */}
              {topThree[1] && <PodiumBlock s={topThree[1]} height={130} rank={2} />}
              {/* 1st */}
              {topThree[0] && <PodiumBlock s={topThree[0]} height={170} rank={1} />}
              {/* 3rd */}
              {topThree[2] && <PodiumBlock s={topThree[2]} height={100} rank={3} />}
            </div>
          </div>
        </section>
      )}

      {/* ── Full standings table ────────────────────────────────── */}
      <section className="section medal-section" style={{ paddingTop: 0 }}>
        <div className="wrap-wide">
          <div style={{ overflowX: 'auto' }}>
            <table className="medal-table" style={{ width: '100%', minWidth: 700 }}>
              <thead>
                <tr>
                  <th style={{ width: 44 }}>Эрэмбэ</th>
                  <th className="left">Аймаг</th>
                  {sportResults.map(sr => (
                    <th key={sr.id} title={sr.name} style={{
                      width: 38, padding: '4px 2px', fontSize: 10,
                      writingMode: 'vertical-lr', textOrientation: 'mixed', transform: 'rotate(180deg)',
                      whiteSpace: 'nowrap', height: 160, verticalAlign: 'bottom',
                      fontFamily: 'var(--display)', letterSpacing: '.04em',
                      color: 'var(--fog)', fontWeight: 600,
                    }}>
                      {sportShortLabel(sr.name)}
                    </th>
                  ))}
                  <th>Алт</th>
                  <th>Мөнгө</th>
                  <th>Хүрэл</th>
                  <th>Медаль</th>
                  <th title="Бага онооны нийлбэр">Оноо ↓</th>
                </tr>
              </thead>
              <tbody>
                {standings.map(s => {
                  const rank = s.rank
                  const isTop = rank <= 3
                  return (
                    <tr key={s.name} style={isTop ? { background: 'rgba(166,127,52,.06)' } : undefined}>
                      <td className="rank-cell">
                        {rank <= 3
                          ? <span style={{ color: rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : '#CD7F32', fontWeight: 700 }}>{rank}</span>
                          : <span style={{ color: 'var(--fog)' }}>{rank}</span>}
                      </td>
                      <td className="left">
                        <div className="team-cell" style={{ gap: 10 }}>
                          <AimagBadge abbr={s.abbr} rank={rank} name={s.name} />
                          <span className="team-name">{s.name}</span>
                        </div>
                      </td>
                      {sportResults.map(sr => {
                        const p = s.sportPlacements.find(sp => sp.sportId === sr.id)
                        const rank = p?.rank
                        const score = p?.score
                        return (
                          <td key={sr.id} style={{
                            textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 12, padding: '0 4px',
                            color: rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : 'var(--fog)',
                            fontWeight: rank && rank <= 3 ? 700 : 400,
                          }}>
                            {score != null ? score : <span style={{ opacity: 0.15 }}>—</span>}
                          </td>
                        )
                      })}
                      <td className="medal-cell g">{s.gold > 0 ? s.gold : <span style={{ opacity: 0.2 }}>—</span>}</td>
                      <td className="medal-cell s">{s.silver > 0 ? s.silver : <span style={{ opacity: 0.2 }}>—</span>}</td>
                      <td className="medal-cell b">{s.bronze > 0 ? s.bronze : <span style={{ opacity: 0.2 }}>—</span>}</td>
                      <td className="medal-total">{s.medals > 0 ? s.medals : <span style={{ opacity: 0.2 }}>—</span>}</td>
                      <td style={{ textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 13, color: isTop ? 'var(--gold)' : 'var(--fog)' }}>
                        {s.pts > 0 ? s.pts : <span style={{ opacity: 0.2 }}>—</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Sport detail results ────────────────────────────────── */}
      <section className="section sports-section">
        <div className="wrap-wide">
          <div className="section-header" style={{ marginBottom: 32 }}>
            <div>
              <span className="eyebrow" style={{ color: 'var(--gold-dark)' }}>Спорт бүрийн дүн</span>
              <h2 className="section-title" style={{ color: 'var(--ink)', marginTop: 4 }}>
                Төрлийн <span style={{ color: 'var(--gold-dark)' }}>байрлал</span>
              </h2>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {sportResults.map(sr => (
              <SportCard key={sr.id} sr={sr} />
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ padding: '32px 0 64px' }}>
        <div className="wrap-wide" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link href="/results" className="btn-primary">Үр дүн →</Link>
          <Link href="/" className="section-action" style={{ alignSelf: 'center', fontSize: 14 }}>← Нүүр хуудас</Link>
        </div>
      </section>
    </>
  )
}

function PodiumBlock({ s, height, rank }: { s: AimagStanding; height: number; rank: number }) {
  const borderColor = rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : '#CD7F32'
  const label = rank === 1 ? '🥇 1-р байр' : rank === 2 ? '🥈 2-р байр' : '🥉 3-р байр'
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 120,
    }}>
      <div style={{ fontSize: 12, color: 'var(--fog)', fontFamily: 'var(--display)', letterSpacing: '.08em' }}>
        {s.gold}🥇 {s.silver}🥈 {s.bronze}🥉
      </div>
      <div style={{
        width: 56, height: 56, borderRadius: 12,
        background: 'var(--ink-3)',
        border: `2px solid ${borderColor}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 800, color: borderColor,
        fontFamily: 'var(--display)', letterSpacing: '.04em',
        overflow: 'hidden',
      }}>
        {AIMAG_LOGO[s.name] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={AIMAG_LOGO[s.name]} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          s.abbr
        )}
      </div>
      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--paper)', textAlign: 'center' }}>
        {s.name}
      </div>
      <div style={{
        width: '100%', height, borderRadius: '8px 8px 0 0',
        background: rank === 1
          ? 'linear-gradient(to top, rgba(200,162,74,.15), rgba(200,162,74,.08))'
          : 'var(--ink-3)',
        border: `1px solid ${borderColor}`,
        borderBottom: 'none',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 12,
      }}>
        <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, color: borderColor, letterSpacing: '.1em' }}>
          {label}
        </span>
      </div>
    </div>
  )
}
