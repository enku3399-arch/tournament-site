import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase-server'
import { getSiteSettings } from '@/lib/site-settings'
import RealtimeRefresher from '@/components/RealtimeRefresher'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Үр дүн · Монгол 87/89 V Спорт Наадам 2026',
  description: 'Тоглолтуудын дүн · V Спорт Наадам 2026',
}

const TOURNAMENT_ID = '0b05625d-2f6d-48de-b69c-d5a23c2f0e3f'

const SELECT = `
  id, status, team1_score, team2_score, round, stage, match_number, scheduled_at,
  team1:teams!team1_id(id, name),
  team2:teams!team2_id(id, name),
  sport:tournament_sports(id, name, sport_type)
`

const STAGE_LABELS: Record<string, string> = {
  group:    'Хэсгийн шат',
  knockout: 'Нугалаа',
  final:    'Финал',
  semifinal:'Хагас финал',
  third:    '3-р байр',
}

const SPORT_ICON: Record<string, string> = {
  basketball:   '🏀',
  volleyball:   '🏐',
  chess:        '♟️',
  table_tennis: '🏓',
  darts:        '🎯',
}

function roundLabel(stage: string | null, round: number | null, matchNum: number | null) {
  const s = stage ? (STAGE_LABELS[stage] ?? stage) : 'Тоглолт'
  if (stage === 'group') return `${s} · ${round ?? matchNum ?? ''}-р тур`
  if (round) return `${s} · ${round}-р`
  return s
}

type Match = {
  id: string
  status: string
  team1_score: number | null
  team2_score: number | null
  round: number | null
  stage: string | null
  match_number: number | null
  scheduled_at: string | null
  team1: { id: string; name: string } | null
  team2: { id: string; name: string } | null
  sport: { id: string; name: string; sport_type: string } | null
}

type SportGroup = {
  id: string
  name: string
  sport_type: string
  live: Match[]
  completed: Match[]
  scheduled: Match[]
}

export default async function ResultsPage() {
  const supabase = createServiceClient()

  const [{ data: raw }, settings] = await Promise.all([
    supabase
      .from('matches')
      .select(SELECT)
      .eq('tournament_id', TOURNAMENT_ID)
      .order('scheduled_at', { ascending: true }),
    getSiteSettings(),
  ])

  const scoringLinks = settings.scoring_links ?? []

  const matches = (raw ?? []) as unknown as Match[]

  // Group by sport
  const sportMap = new Map<string, SportGroup>()
  for (const m of matches) {
    if (!m.sport) continue
    const sid = m.sport.id
    if (!sportMap.has(sid)) {
      sportMap.set(sid, {
        id: sid,
        name: m.sport.name,
        sport_type: m.sport.sport_type,
        live: [],
        completed: [],
        scheduled: [],
      })
    }
    const g = sportMap.get(sid)!
    if (m.status === 'live')      g.live.push(m)
    else if (m.status === 'completed') g.completed.push(m)
    else                          g.scheduled.push(m)
  }

  const sports = Array.from(sportMap.values())
  const totalLive = sports.reduce((n, s) => n + s.live.length, 0)
  const totalDone = sports.reduce((n, s) => n + s.completed.length, 0)
  const totalAll  = matches.length

  return (
    <>
      <RealtimeRefresher />
      {/* ── Header ─────────────────────────────────────────────── */}
      <section className="section" style={{ padding: '48px 0 40px' }}>
        <div className="wrap-wide">
          <span className="eyebrow" style={{ color: 'var(--fog)' }}>
            Results · Үр дүн
          </span>
          <h1 className="section-title" style={{ fontFamily: 'Oswald, sans-serif', fontSize: 48, marginTop: 8 }}>
            Тоглолтын <span className="gold">үр дүн</span>
          </h1>
          <div style={{ display: 'flex', gap: 24, marginTop: 20, flexWrap: 'wrap' }}>
            <Stat val={String(totalAll)}  label="Нийт тоглолт" />
            <Stat val={String(totalDone)} label="Дуусгавар болсон" gold />
            {totalLive > 0 && <Stat val={String(totalLive)} label="Шууд явагдаж байна" live />}
          </div>
        </div>
      </section>

      {/* ── No matches yet ──────────────────────────────────────── */}
      {totalAll === 0 && (
        <section className="section" style={{ paddingTop: 0, paddingBottom: 80, textAlign: 'center' }}>
          <div className="wrap-wide">
            <div style={{
              padding: '64px 32px',
              border: '1px solid var(--line)',
              borderRadius: 16,
              background: 'var(--ink-2)',
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
              <p style={{ color: 'var(--fog)', fontSize: 16 }}>
                Тоглолтууд эхлээгүй байна. Хуваарийг доороос үзнэ үү.
              </p>
              <Link href="/schedule" className="btn-ghost" style={{ marginTop: 24, display: 'inline-block' }}>
                Хуваарь харах →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Sport sections ──────────────────────────────────────── */}
      {sports.map((sport, si) => {
        const icon = SPORT_ICON[sport.sport_type] ?? '🏅'
        const hasAny = sport.live.length + sport.completed.length + sport.scheduled.length > 0
        if (!hasAny) return null

        return (
          <section
            key={sport.id}
            className="section"
            style={{
              paddingTop: si === 0 ? 0 : undefined,
              paddingBottom: 48,
            }}
          >
            <div className="wrap-wide">
              {/* Sport header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                marginBottom: 24, paddingBottom: 16,
                borderBottom: '1px solid var(--line)',
              }}>
                <span style={{ fontSize: 28 }}>{icon}</span>
                <div>
                  <h2 style={{
                    fontFamily: 'Oswald, sans-serif', fontSize: 24, fontWeight: 700,
                    margin: 0, color: 'var(--paper)',
                  }}>
                    {sport.name}
                  </h2>
                  <div style={{ fontSize: 12, color: 'var(--fog)', marginTop: 2 }}>
                    {sport.completed.length} дууссан
                    {sport.live.length > 0 && <span style={{ color: 'var(--red)', marginLeft: 10 }}>● {sport.live.length} шууд</span>}
                    {sport.scheduled.length > 0 && <span style={{ marginLeft: 10 }}> · {sport.scheduled.length} хүлээгдэж байна</span>}
                  </div>
                </div>
              </div>

              {/* Live matches */}
              {sport.live.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div className="eyebrow" style={{ color: 'var(--red)', marginBottom: 12 }}>● Шууд явагдаж байна</div>
                  <div className="results-grid">
                    {sport.live.map(m => <MatchCard key={m.id} m={m} live />)}
                  </div>
                </div>
              )}

              {/* Completed matches */}
              {sport.completed.length > 0 && (
                <div style={{ marginBottom: sport.scheduled.length > 0 ? 24 : 0 }}>
                  {sport.live.length > 0 && (
                    <div className="eyebrow" style={{ color: 'var(--fog)', marginBottom: 12 }}>Дуусгавар болсон</div>
                  )}
                  <div className="results-grid">
                    {sport.completed.map(m => <MatchCard key={m.id} m={m} />)}
                  </div>
                </div>
              )}

              {/* Scheduled matches — collapsed summary */}
              {sport.scheduled.length > 0 && sport.completed.length === 0 && sport.live.length === 0 && (
                <div style={{
                  padding: '20px 24px',
                  border: '1px solid var(--line)',
                  borderRadius: 12,
                  background: 'var(--ink-2)',
                  color: 'var(--fog)',
                  fontSize: 14,
                }}>
                  {sport.scheduled.length} тоглолт товлогдсон — тоглолт эхлээгүй байна
                </div>
              )}
            </div>
          </section>
        )
      })}

      {/* ── Scoring / live links ───────────────────────────────── */}
      {scoringLinks.length > 0 && (
        <section className="section" style={{ paddingTop: 0, paddingBottom: 48 }}>
          <div className="wrap-wide" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {scoringLinks.map(link => (
              <div
                key={link.id}
                style={{
                  border: '1px solid var(--line)',
                  borderRadius: 16,
                  overflow: 'hidden',
                  background: 'var(--ink-2)',
                }}
              >
                {/* Header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 24px',
                  borderBottom: '1px solid var(--line)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{link.sport_icon}</span>
                    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, fontWeight: 700 }}>
                      {link.label}
                    </div>
                  </div>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 12, color: 'var(--gold)', fontFamily: 'var(--display)',
                      letterSpacing: '.1em', textTransform: 'uppercase',
                    }}
                  >
                    Шинэ цонхонд нээх ↗
                  </a>
                </div>

                {/* Embed or link button */}
                {link.embed ? (
                  <div style={{
                    overflow: 'hidden',
                    height: (link.iframe_height || 600),
                    position: 'relative',
                  }}>
                    <iframe
                      src={link.url}
                      style={{
                        width: '100%',
                        height: (link.iframe_height || 600) + (link.clip_top || 0),
                        border: 'none',
                        display: 'block',
                        marginTop: -(link.clip_top || 0),
                      }}
                      title={link.label}
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                      style={{ display: 'inline-block' }}
                    >
                      {link.sport_icon} {link.label} — Нээх ↗
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Footer links ────────────────────────────────────────── */}
      <section className="section" style={{ padding: '32px 0 64px' }}>
        <div className="wrap-wide" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link href="/medals" className="btn-primary">Медалийн хүснэгт →</Link>
          <Link href="/live" className="btn-ghost">Шууд дамжуулалт ▷</Link>
          <Link href="/" className="section-action" style={{ alignSelf: 'center', fontSize: 14 }}>← Нүүр хуудас</Link>
        </div>
      </section>

      <style>{`
        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 12px;
        }
        .match-card {
          background: var(--ink-2);
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 16px 20px;
          transition: border-color .15s;
        }
        .match-card:hover { border-color: var(--line-2); }
        .match-card.live-card {
          border-color: rgba(200, 16, 46, .4);
          background: rgba(200, 16, 46, .05);
        }
        .match-teams {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .match-team {
          flex: 1;
          font-size: 14px;
          font-weight: 600;
          color: var(--paper);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .match-team.right { text-align: right; }
        .match-score {
          font-family: var(--mono);
          font-size: 22px;
          font-weight: 700;
          color: var(--gold);
          white-space: nowrap;
          min-width: 80px;
          text-align: center;
        }
        .match-score.live { color: var(--red); }
        .match-meta {
          font-size: 11px;
          color: var(--fog);
          margin-top: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        @media (max-width: 600px) {
          .results-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  )
}

function Stat({ val, label, gold, live }: { val: string; label: string; gold?: boolean; live?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
      <span style={{
        fontFamily: 'Oswald, sans-serif', fontSize: 32, fontWeight: 700,
        color: live ? 'var(--red)' : gold ? 'var(--gold)' : 'var(--paper)',
      }}>
        {live && '● '}{val}
      </span>
      <span style={{ fontSize: 13, color: 'var(--fog)' }}>{label}</span>
    </div>
  )
}

function MatchCard({ m, live }: { m: Match; live?: boolean }) {
  const t1 = m.team1?.name ?? 'ТБА'
  const t2 = m.team2?.name ?? 'ТБА'
  const s1 = m.team1_score ?? '-'
  const s2 = m.team2_score ?? '-'
  const label = roundLabel(m.stage, m.round, m.match_number)

  const winner1 = m.status === 'completed' && m.team1_score != null && m.team2_score != null && m.team1_score > m.team2_score
  const winner2 = m.status === 'completed' && m.team1_score != null && m.team2_score != null && m.team2_score > m.team1_score

  return (
    <div className={`match-card${live ? ' live-card' : ''}`}>
      <div className="match-teams">
        <span className="match-team" style={{ fontWeight: winner1 ? 700 : 500, color: winner1 ? 'var(--paper)' : 'var(--fog-2)' }}>
          {t1}
        </span>
        <span className={`match-score${live ? ' live' : ''}`}>
          {s1} — {s2}
        </span>
        <span className="match-team right" style={{ fontWeight: winner2 ? 700 : 500, color: winner2 ? 'var(--paper)' : 'var(--fog-2)' }}>
          {t2}
        </span>
      </div>
      <div className="match-meta">
        <span>{label}</span>
        {live && <span style={{ color: 'var(--red)', fontWeight: 600, letterSpacing: '.08em' }}>● LIVE</span>}
        {m.scheduled_at && !live && (
          <span>{new Date(m.scheduled_at).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })}</span>
        )}
      </div>
    </div>
  )
}
