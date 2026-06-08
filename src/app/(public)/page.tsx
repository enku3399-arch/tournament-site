import Link from 'next/link'
import { getSiteSettings } from '@/lib/site-settings'
import { createServiceClient } from '@/lib/supabase-server'
import { calculateMedalStandings } from '@/lib/medal-calc'
import { AIMAG_LOGO } from '@/lib/aimag-logo'
import Countdown from './Countdown'
import RibbonRefresher from './RibbonRefresher'

export const dynamic = 'force-dynamic'

/* ─── SVG pictograms (inline mask, matches design-reference) ──── */
const BASKETBALL_SVG = `url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22><circle cx=%2212%22 cy=%2212%22 r=%2210%22 fill=%22none%22 stroke=%22black%22 stroke-width=%221.5%22/><path d=%22M2 12h20M12 2v20M5 5c4 4 10 4 14 0M5 19c4-4 10-4 14 0%22 fill=%22none%22 stroke=%22black%22 stroke-width=%221.5%22/></svg>')`
const VOLLEYBALL_SVG = `url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22><circle cx=%2212%22 cy=%2212%22 r=%2210%22 fill=%22none%22 stroke=%22black%22 stroke-width=%221.5%22/><path d=%22M12 2c-3 5-3 12 0 20M2 8c6-1 14 1 18 8M22 8c-6-1-14 1-18 8%22 fill=%22none%22 stroke=%22black%22 stroke-width=%221.5%22/></svg>')`
const CHESS_SVG     = `url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22><path d=%22M8 22h8M9 20l-1-3h8l-1 3M10 17V8m4 9V8M7 8h10l-1-3h-2l-1-2h-2l-1 2H8z%22 fill=%22none%22 stroke=%22black%22 stroke-width=%221.5%22 stroke-linejoin=%22round%22/></svg>')`
const TENNIS_SVG    = `url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22><circle cx=%228%22 cy=%2210%22 r=%225%22 fill=%22none%22 stroke=%22black%22 stroke-width=%221.5%22/><path d=%22M11 13l8 8M17 19l3 3%22 fill=%22none%22 stroke=%22black%22 stroke-width=%221.5%22 stroke-linecap=%22round%22/></svg>')`
const DARTS_SVG     = `url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22><circle cx=%2212%22 cy=%2212%22 r=%2210%22 fill=%22none%22 stroke=%22black%22 stroke-width=%221.5%22/><circle cx=%2212%22 cy=%2212%22 r=%226%22 fill=%22none%22 stroke=%22black%22 stroke-width=%221.5%22/><circle cx=%2212%22 cy=%2212%22 r=%222%22 fill=%22black%22/></svg>')`

const SPORTS = [
  { num: '01', cat: '♂ Эрэгтэй', name: 'Сагсан\nбөмбөг',    mask: BASKETBALL_SVG, href: '/groups#771904c0-f0c9-4b53-a631-f82cecfde598' },
  { num: '02', cat: '♀ Эмэгтэй', name: 'Сагсан\nбөмбөг',    mask: BASKETBALL_SVG, href: '/groups#875a61c1-6c97-4dca-96a0-dd0bcf9b2cc3' },
  { num: '03', cat: '♂ Эрэгтэй', name: 'Волейбол',           mask: VOLLEYBALL_SVG, href: '/groups#11a8b935-744d-4032-8280-6ef97ad5a9db' },
  { num: '04', cat: '♀ Эмэгтэй', name: 'Волейбол',           mask: VOLLEYBALL_SVG, href: '/groups#92dfbd70-204d-4293-985f-b2e49e35c526' },
  { num: '05', cat: 'Баг',        name: 'Ширээний\nтеннис',   mask: TENNIS_SVG,     href: '/groups#094da6e9-660d-4646-b149-7a4cbd8f55a0' },
  { num: '06', cat: 'Баг',        name: 'Дартс',              mask: DARTS_SVG,      href: '/groups#b0b7ca49-82fb-440f-8e9a-19fdbf1f6d11' },
  { num: '07', cat: 'Баг',        name: 'Шатар',              mask: CHESS_SVG,      href: '/groups#4b254cc4-16e9-430d-9bf2-0257178db95c' },
]


function sportShortLabel(name: string): string {
  const gender = name.includes('Эрэгтэй') ? ' Эр' : name.includes('Эмэгтэй') ? ' Эм' : ''
  const base = name.replace(/\s*\(?Эрэгтэй\)?|\s*\(?Эмэгтэй\)?/g, '').trim()
  return base.split(' ')[0] + gender
}

export default async function HomePage() {
  const supabase = createServiceClient()
  const RIBBON_SELECT = `id, status, team1_score, team2_score, stage, round,
    team1:teams!team1_id(name),
    team2:teams!team2_id(name),
    sport:tournament_sports(name, sport_type, gender)`
  const [settings, { data: liveRibbon }, { data: doneRibbon }, medalData, { data: teamRows }] = await Promise.all([
    getSiteSettings(),
    supabase.from('matches').select(RIBBON_SELECT).eq('status', 'live'),
    supabase.from('matches').select(RIBBON_SELECT).eq('status', 'completed')
      .order('created_at', { ascending: false }).limit(6),
    calculateMedalStandings(),
    supabase.from('teams').select('sport_id, tournament_sports!inner(sport_type)'),
  ])

  /* Estimate registered athletes: teams × avg athletes per sport type */
  const SPORT_AVG_ATHLETES: Record<string, number> = {
    basketball: 10, volleyball: 12, tennis: 4, table_tennis: 4, darts: 4, chess: 2,
  }
  const estimatedAthletes = (teamRows ?? []).reduce((sum, t: any) => {
    const st: string = t.tournament_sports?.sport_type ?? ''
    return sum + (SPORT_AVG_ATHLETES[st] ?? 6)
  }, 0)
  // Round down to nearest 100 — shows conservative "X,X00+" figure
  const athleteDisplay = estimatedAthletes > 0
    ? (Math.floor(estimatedAthletes / 100) * 100).toLocaleString('en-US')
    : null

  const medalStandings = medalData.standings
  const medalSportList = medalData.sportResults
  const SPORT_ICONS_R: Record<string, string> = { basketball: '🏀', volleyball: '🏐', chess: '♟️', table_tennis: '🏓', darts: '🎯' }
  const GENDER_R: Record<string, string> = { male: '♂', female: '♀' }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ribbonItems: any[] = [...(liveRibbon ?? []), ...(doneRibbon ?? [])]
  const g = settings.general
  const h = settings.hero
  const sec = settings.home_sections
  const newsArticles = settings.news
  const featureArticle = newsArticles.find(a => a.feature) ?? newsArticles[0]
  const restArticles = newsArticles.filter(a => a.id !== featureArticle?.id)

  return (
    <>
      {/* ════════════════════════════════════════════════════════════
          HERO — DARK
          ════════════════════════════════════════════════════════════ */}
      <section className="hero">
        <div className="hero-image" />
        <div className="wrap-wide hero-content">
          <div className="hero-grid">

            <div className="hero-left">
              <div className="hero-edition">
                <span className="roman">{g.edition}</span>
                <div className="hero-edition-text">
                  <div className="l1">{g.edition} Edition · {g.year}</div>
                  <div className="l2">Спорт Наадам</div>
                </div>
              </div>

              <h1 className="hero-title">
                {h.title1}<br />
                <span className="stroke">{h.title2}</span><br />
                {h.title3}
              </h1>

              <p className="hero-subtitle">
                <strong style={{ color: 'var(--gold-light)', fontWeight: 600 }}>
                  {g.motto}
                </strong>{' '}
                {h.subtitle}
              </p>

              <div className="hero-meta-row">
                {[
                  { label: 'Огноо',  value: g.dateDisplay   },
                  { label: 'Хот',    value: 'Улаанбаатар'   },
                  { label: 'Заал',   value: g.venue          },
                  { label: 'Багууд', value: g.teamCount + ' аймаг' },
                ].map(({ label, value }) => (
                  <div key={label} className="hero-meta-cell">
                    <div className="hero-meta-label">{label}</div>
                    <div className="hero-meta-value">{value}</div>
                  </div>
                ))}
              </div>

              <div className="hero-cta-row">
                <Link href="/schedule" className="btn-primary">
                  Хуваарь үзэх <span className="btn-arrow">→</span>
                </Link>
                <Link href="/live" className="btn-ghost">
                  Шууд дамжуулалт <span className="btn-arrow">▷</span>
                </Link>
              </div>
            </div>

            <div className="hero-right">
              <div className="countdown-card">
                <div className="countdown-eyebrow">
                  <span className="eyebrow">Нээлтэд үлдсэн</span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--fog)' }}>06.11 · 13:00</span>
                </div>
                <Countdown />
                <div className="next-event">
                  <div className="next-event-row">
                    <span className="next-event-l">Нээлтийн үйл ажиллагаа</span>
                    <span className="next-event-v">13:00 — 14:00</span>
                  </div>
                  <div className="next-event-detail">
                    2026.06.11 Пүрэв · "Буянт Ухаа" спорт ордон
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          LIVE RIBBON
          ════════════════════════════════════════════════════════════ */}
      <RibbonRefresher />
      <div className="ribbon">
        <div className="wrap-wide ribbon-row">
          <Link href="/live" className="ribbon-tag" style={{ textDecoration: 'none' }}>Шууд</Link>
          <div className="ribbon-feed">
            {ribbonItems.length === 0 && (
              <div className="ribbon-item">
                <span className="ribbon-sport" style={{ color: 'var(--fog)' }}>Тоглолт байхгүй байна</span>
              </div>
            )}
            {ribbonItems.map((m: any) => {
              const icon = SPORT_ICONS_R[m.sport?.sport_type] ?? '🏅'
              const g = m.sport?.gender ? ` ${GENDER_R[m.sport.gender] ?? ''}` : ''
              const s1 = m.team1_score ?? 0
              const s2 = m.team2_score ?? 0
              const isLive = m.status === 'live'
              return (
                <div key={m.id} className="ribbon-item">
                  {isLive && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', display: 'inline-block', marginRight: 6, flexShrink: 0 }} />}
                  <span className="ribbon-sport">{icon} {m.sport?.name}{g}</span>
                  <span className="ribbon-match">{m.team1?.name ?? '—'} vs {m.team2?.name ?? '—'}</span>
                  <span className="ribbon-score">
                    {isLive
                      ? <><span className="win">{s1}</span> – {s2}</>
                      : s1 > s2
                        ? <><span className="win">{s1}</span> – {s2}</>
                        : <>{s1} – <span className="win">{s2}</span></>}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          STATS — CREAM
          ════════════════════════════════════════════════════════════ */}
      {sec.stats !== false && <section className="stats">
        <div className="wrap-wide stats-grid">
          {settings.stats.map(({ num, plus, label }) => {
            const isAthletes = label.includes('тамирч')
            const displayNum = isAthletes && athleteDisplay ? athleteDisplay : num
            return (
              <div key={label} className="stat-cell">
                <div className="stat-num">
                  {displayNum}{plus && <span className="plus">+</span>}
                </div>
                <div className="stat-label" style={{ whiteSpace: 'pre-line' }}>{label}</div>
              </div>
            )
          })}
        </div>
      </section>}

      {/* ════════════════════════════════════════════════════════════
          FEATURED NEWS — DARK
          ════════════════════════════════════════════════════════════ */}
      {sec.news !== false && <section className="section">
        <div className="wrap-wide">
          <div className="section-header">
            <div>
              <span className="eyebrow">Сүүлийн мэдээ</span>
              <h2 className="section-title">
                Онцлох <span className="gold">мэдээ</span>
              </h2>
            </div>
            <Link href="/news" className="section-action">Бүх мэдээ →</Link>
          </div>

          {featureArticle && (
            <div className="news-grid">
              <Link href={`/news/${featureArticle.id}`} className="news-card feature">
                <div
                  className="news-image"
                  style={featureArticle.imagePath ? { backgroundImage: `url(${featureArticle.imagePath})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                >
                  <span className={`news-tag${featureArticle.tagColor === 'red' ? ' red' : ''}`}>{featureArticle.tag}</span>
                </div>
                <div className="news-body">
                  <div className="news-meta">
                    <span>{featureArticle.date}</span>
                    <span className="dot" />
                    <span>{featureArticle.author}</span>
                  </div>
                  <h3 className="news-title">{featureArticle.title}</h3>
                  {featureArticle.excerpt && <p className="news-excerpt">{featureArticle.excerpt}</p>}
                </div>
              </Link>

              <div className="news-stack">
                {restArticles.slice(0, 4).map(n => (
                  <Link key={n.id} href={`/news/${n.id}`} className="news-card compact">
                    <div className="news-compact">
                      <div
                        className="news-image"
                        style={n.imagePath ? { backgroundImage: `url(${n.imagePath})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                      >
                        <span className={`news-tag${n.tagColor === 'red' ? ' red' : ''}`}>{n.tag}</span>
                      </div>
                      <div className="news-body">
                        <div className="news-meta">
                          <span>{n.date}</span>
                          <span className="dot" />
                          <span>{n.author}</span>
                        </div>
                        <h3 className="news-title">{n.title}</h3>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>}

      {/* ════════════════════════════════════════════════════════════
          SPORTS GRID — CREAM
          ════════════════════════════════════════════════════════════ */}
      {sec.sports !== false && <section className="section sports-section">
        <div className="wrap-wide">
          <div className="section-header">
            <div>
              <span className="eyebrow">5 төрөл · 7 ангилал</span>
              <h2 className="section-title">
                Спортын <span className="gold">төрлүүд</span>
              </h2>
            </div>
            <Link href="/groups" className="section-action">Хэсгийн хуваарь →</Link>
          </div>

          <div className="sports-grid sports-grid-7">
            {SPORTS.map((s) => (
              <Link key={s.num} href={s.href} className="sport-card">
                <div className="sport-head-row">
                  <span className="sport-num">{s.num}</span>
                  <span className="sport-cat">{s.cat}</span>
                </div>
                <div className="sport-icon-frame">
                  <div className="sport-pictogram" style={{ WebkitMaskImage: s.mask, maskImage: s.mask }} />
                </div>
                <div className="sport-name" style={{ whiteSpace: 'pre-line' }}>{s.name}</div>
                <div className="sport-desc">
                  Хэсгийн хуваарь болон нугалааны дүнг энд дарж шууд харна уу →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>}

      {/* ════════════════════════════════════════════════════════════
          SCHEDULE — DARK
          ════════════════════════════════════════════════════════════ */}
      {sec.schedule !== false && <section className="section">
        <div className="wrap-wide">
          <div className="section-header">
            <div>
              <span className="eyebrow">2026.06.11 — 2026.06.13</span>
              <h2 className="section-title">
                Наадмын <span className="gold">хуваарь</span>
              </h2>
            </div>
            <Link href="/schedule" className="section-action">Дэлгэрэнгүй →</Link>
          </div>

          <div className="schedule-grid">
            {settings.schedule.map((day) => (
              <div key={day.num} className="day-card">
                <div className="day-head">
                  <div className="day-num">{day.num}</div>
                  <div className="day-meta">
                    <div className="day-month">{day.month}</div>
                    <div className="day-weekday">{day.weekday}</div>
                  </div>
                </div>
                <div className="day-events-section">
                  <div className="day-section-title">Үндсэн тэмцээн</div>
                  <div className="day-events">
                    {day.main.map((ev, i) => (
                      <div key={i} className={`day-event${ev.hilight ? ' hilight' : ''}`}>
                        <div className="event-time" style={{ whiteSpace: 'pre-line' }}>{ev.time}</div>
                        <div className="event-name">
                          {ev.name}
                          {ev.note && <span className="note">{ev.note}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="day-section-title">Хөгжөөн дэмжигчдэд</div>
                  <div className="day-events">
                    {day.extra.map((ev, i) => (
                      <div key={i} className="day-event">
                        <div className="event-time" style={{ whiteSpace: 'pre-line' }}>{ev.time}</div>
                        <div className="event-name">
                          {ev.name}
                          {ev.note && <span className="note">{ev.note}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>}

      {/* ════════════════════════════════════════════════════════════
          MEDAL TABLE — CREAM
          ════════════════════════════════════════════════════════════ */}
      {sec.medals !== false && <section className="section medal-section">
        <div className="wrap-wide">
          <div className="section-header">
            <div>
              <span className="eyebrow">Medal Standings · Live</span>
              <h2 className="section-title">
                Медалийн <span className="gold">хүснэгт</span>
              </h2>
            </div>
            <Link href="/medals" className="section-action">Бүх хүснэгт →</Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="medal-table" style={{ width: '100%', minWidth: 640 }}>
              <thead>
                <tr>
                  <th style={{ width: 44 }}>Эрэмбэ</th>
                  <th className="left">Аймаг</th>
                  {medalSportList.map(s => (
                    <th key={s.id} title={s.name} style={{
                      width: 38, padding: '4px 2px', fontSize: 10,
                      writingMode: 'vertical-rl', textOrientation: 'mixed',
                      whiteSpace: 'nowrap', height: 72, verticalAlign: 'bottom',
                      fontFamily: 'var(--display)', letterSpacing: '.04em',
                      color: 'var(--fog)', fontWeight: 600,
                    }}>
                      {sportShortLabel(s.name)}
                    </th>
                  ))}
                  <th>Алт</th>
                  <th>Мөнгө</th>
                  <th>Хүрэл</th>
                  <th>Нийт</th>
                </tr>
              </thead>
              <tbody>
                {medalStandings.slice(0, 10).map(row => (
                  <tr key={row.name} style={row.rank <= 3 ? { background: 'rgba(166,127,52,.06)' } : undefined}>
                    <td className="rank-cell">
                      {row.rank <= 3
                        ? <span style={{ color: row.rank === 1 ? '#FFD700' : row.rank === 2 ? '#C0C0C0' : '#CD7F32', fontWeight: 700 }}>{row.rank}</span>
                        : <span style={{ color: 'var(--fog)' }}>{row.rank}</span>}
                    </td>
                    <td className="left">
                      <div className="team-cell" style={{ gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 7, flexShrink: 0,
                          background: 'var(--ink-3)',
                          border: `1px solid ${row.rank === 1 ? '#FFD700' : row.rank === 2 ? '#C0C0C0' : row.rank === 3 ? '#CD7F32' : 'var(--line)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          overflow: 'hidden',
                          fontSize: 10, fontWeight: 700, color: row.rank <= 3 ? (row.rank === 1 ? '#FFD700' : row.rank === 2 ? '#C0C0C0' : '#CD7F32') : 'var(--fog)',
                          fontFamily: 'var(--display)', letterSpacing: '.03em',
                        }}>
                          {AIMAG_LOGO[row.name] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={AIMAG_LOGO[row.name]} alt={row.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            row.abbr
                          )}
                        </div>
                        <span className="team-name">{row.name}</span>
                      </div>
                    </td>
                    {medalSportList.map(s => {
                      const p = row.sportPlacements.find(sp => sp.sportId === s.id)
                      const rank = p?.rank
                      const score = p?.score
                      return (
                        <td key={s.id} style={{
                          textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 12, padding: '0 4px',
                          color: rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : 'var(--fog)',
                          fontWeight: rank && rank <= 3 ? 700 : 400,
                        }}>
                          {score != null ? score : <span style={{ opacity: 0.15 }}>—</span>}
                        </td>
                      )
                    })}
                    <td className="medal-cell g">{row.gold > 0 ? row.gold : <span style={{ opacity: 0.2 }}>—</span>}</td>
                    <td className="medal-cell s">{row.silver > 0 ? row.silver : <span style={{ opacity: 0.2 }}>—</span>}</td>
                    <td className="medal-cell b">{row.bronze > 0 ? row.bronze : <span style={{ opacity: 0.2 }}>—</span>}</td>
                    <td className="medal-total">{row.medals > 0 ? row.medals : <span style={{ opacity: 0.2 }}>—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>}

      {/* ════════════════════════════════════════════════════════════
          ORGANIZER AIMAGS — DARK
          ════════════════════════════════════════════════════════════ */}
      {sec.host_aimags !== false && <section className="host-section section">
        <div className="wrap-wide">
          <div className="section-header">
            <div>
              <span className="eyebrow">Organizer Provinces · 2026</span>
              <h2 className="section-title">
                Зохион байгуулагч <span className="gold">аймгууд</span>
              </h2>
            </div>
            <Link href="/about" className="section-action">Наадмын түүх →</Link>
          </div>

          <div className="host-grid">
            {settings.host_aimags.map((h) => {
              const inner = (
                <div className="host-card">
                  {(AIMAG_LOGO[h.name] || h.logoPath) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={AIMAG_LOGO[h.name] || h.logoPath} alt={h.name} style={{ height: 64, width: 'auto', maxWidth: 120, objectFit: 'contain', marginBottom: 12 }} />
                  ) : (
                    <div className="host-crest">
                      <span className="host-crest-mark">{h.mark}</span>
                    </div>
                  )}
                  <div>
                    <div className="host-name">{h.name}</div>
                    <div className="host-role">{h.role}</div>
                    {h.description && (
                      <div style={{ fontSize: 12, color: 'var(--fog)', marginTop: 4, lineHeight: 1.4 }}>{h.description}</div>
                    )}
                  </div>
                </div>
              )
              return h.website ? (
                <a key={h.id} href={h.website} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                  {inner}
                </a>
              ) : (
                <div key={h.id}>{inner}</div>
              )
            })}
          </div>
        </div>
      </section>}

      {/* ════════════════════════════════════════════════════════════
          ABOUT / FACTS — CREAM
          ════════════════════════════════════════════════════════════ */}
      {sec.about !== false && <section className="section facts-section">
        <div className="wrap-wide">
          <div className="section-header">
            <div>
              <span className="eyebrow">About the Games</span>
              <h2 className="section-title">
                Наадмын <span className="gold">тухай</span>
              </h2>
            </div>
            <Link href="/about" className="section-action" style={{ color: 'var(--gold-dark)' }}>Дэлгэрэнгүй →</Link>
          </div>

          <div className="facts-grid">
            <div className="facts-text">
              {settings.about.subtitle.split('\n').filter(Boolean).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <div className="facts-list">
              {settings.about.facts.map((f, i) => (
                <div key={i} className="fact-row">
                  <span className="fact-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="fact-label">{f.label}</span>
                  <span className="fact-val">{f.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Edition history — /history хуудастай холбоотой */}
          <div style={{ marginTop: 56, borderTop: '1px solid rgba(11,20,38,.12)', paddingTop: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <p className="fact-num" style={{ margin: 0 }}>Наадмын түүх</p>
              <Link href="/history" style={{ fontSize: 12, color: 'var(--gold-dark)', fontWeight: 600, textDecoration: 'none' }}>
                Дэлгэрэнгүй →
              </Link>
            </div>
            <div style={{ display: 'flex', gap: 0, position: 'relative' }}>
              {/* Connector line */}
              <div style={{
                position: 'absolute', top: 20, left: 20, right: 20, height: 1,
                background: 'rgba(11,20,38,.15)', zIndex: 0,
              }} />
              {settings.about.editions.map((ed) => (
                <Link
                  key={ed.num}
                  href={ed.current ? '/groups' : '/history'}
                  style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 10, position: 'relative',
                    zIndex: 1, textDecoration: 'none',
                  }}
                >
                  {/* Dot */}
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    border: ed.current ? '2px solid var(--gold-dark)' : '1px solid rgba(11,20,38,.2)',
                    background: ed.current ? 'var(--gold-dark)' : 'var(--bone)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--display)', fontWeight: 600, fontSize: 12,
                    color: ed.current ? 'var(--bone)' : 'rgba(11,20,38,.5)',
                    letterSpacing: '.06em', transition: 'transform .15s',
                  }}>
                    {ed.num}
                  </div>
                  {/* Info */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontFamily: 'var(--display)', fontSize: 13, fontWeight: 600,
                      color: ed.current ? 'var(--gold-dark)' : 'rgba(11,20,38,.8)',
                      letterSpacing: '.04em',
                    }}>
                      {ed.year}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(11,20,38,.45)', marginTop: 2 }}>{ed.city}</div>
                    <div style={{ fontSize: 10, color: 'rgba(11,20,38,.4)', fontFamily: 'var(--mono)', marginTop: 3 }}>
                      {ed.sports} төрөл
                    </div>
                    {ed.current && (
                      <div style={{
                        marginTop: 6, fontSize: 9, fontFamily: 'var(--display)',
                        letterSpacing: '.1em', color: 'var(--gold-dark)',
                        background: 'rgba(166,127,52,.1)', border: '1px solid rgba(166,127,52,.3)',
                        padding: '2px 8px', borderRadius: 2,
                      }}>
                        ОДООГИЙН
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>}

      {/* ════════════════════════════════════════════════════════════
          SPONSORS — DARK
          ════════════════════════════════════════════════════════════ */}
      {sec.sponsors !== false && <section className="sponsors">
        <div className="wrap-wide">
          <div className="sponsors-head">
            <span className="eyebrow">Partners &amp; Sponsors</span>
            <h2 className="section-title" style={{ fontSize: 32, marginTop: 8 }}>
              Ивээн <span className="gold">тэтгэгчид</span>
            </h2>
          </div>
          <div className="sponsors-tiers">
            {(['platinum', 'gold', 'silver'] as const).map(tier => {
              const tierSponsors = settings.sponsors.filter(s => s.tier === tier)
              if (tierSponsors.length === 0) return null
              const label = tier === 'platinum' ? 'Алтан\nгишүүн' : tier === 'gold' ? 'Дэмжигч' : 'Хамтрагч'
              return (
                <div key={tier} className={`tier-row ${tier}`}>
                  <span className="tier-label" style={{ whiteSpace: 'pre-line' }}>{label}</span>
                  <div className="tier-logos">
                    {tierSponsors.map(s => (
                      s.logoPath ? (
                        <a key={s.id} href={s.website || '#'} target="_blank" rel="noopener noreferrer" className="logo-placeholder" title={s.name}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={s.logoPath} alt={s.name} style={{ maxHeight: 40, maxWidth: 160, objectFit: 'contain' }} />
                        </a>
                      ) : (
                        <div key={s.id} className="logo-placeholder">{s.name}</div>
                      )
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>}
    </>
  )
}
