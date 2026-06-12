import { createServiceClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Дартсын тэмцээн · ГҮТББ 2026',
}

const TOURNAMENT_ID = '0b05625d-2f6d-48de-b69c-d5a23c2f0e3f'

type Team = { rank: number; name: string }
type Group = { num: number; teams: Team[] }
type Match = { h: string; a: string; hs: number | null; as: number | null }
type DartsData = {
  groups: Group[]
  r16: Match[]
  qf: Match[]
  sf: Match[]
  final: Match
  third: Match
}

const FALLBACK: DartsData = {
  groups: [
    { num: 1, teams: [{ rank: 1, name: 'Ажилчин' }, { rank: 2, name: 'Багануур' }, { rank: 3, name: 'Дундговь' }] },
    { num: 2, teams: [{ rank: 1, name: 'Тэв' }, { rank: 2, name: 'Сэлэнгэ' }, { rank: 3, name: 'Найрамдал' }] },
    { num: 3, teams: [{ rank: 1, name: 'Сүхбаатар дүүрэг' }, { rank: 2, name: 'Хэнтий' }, { rank: 3, name: 'Ховд' }] },
    { num: 4, teams: [{ rank: 1, name: 'Өмнөговь' }, { rank: 2, name: 'Говь-Алтай' }, { rank: 3, name: 'Дорноговь' }] },
    { num: 5, teams: [{ rank: 1, name: 'Өвэрхангай' }, { rank: 2, name: 'Сүхбаатар аймаг' }, { rank: 3, name: 'Завхан' }] },
    { num: 6, teams: [{ rank: 1, name: 'Булган' }, { rank: 2, name: 'Увс' }, { rank: 3, name: 'Архангай' }] },
    { num: 7, teams: [{ rank: 1, name: 'Дорнод' }, { rank: 2, name: 'Дархан' }, { rank: 3, name: 'Баян-Өлгий' }] },
    { num: 8, teams: [{ rank: 1, name: 'Хөвсгөл' }, { rank: 2, name: 'Баянхонгор' }, { rank: 3, name: 'Орхон' }] },
  ],
  r16: [
    { h: 'Ажилчин', a: 'Баянхонгор', hs: null, as: null },
    { h: 'Тэв', a: 'Дархан', hs: null, as: null },
    { h: 'Сүхбаатар дүүрэг', a: 'Увс', hs: null, as: null },
    { h: 'Өмнөговь', a: 'Сүхбаатар аймаг', hs: null, as: null },
    { h: 'Өвэрхангай', a: 'Говь-Алтай', hs: null, as: null },
    { h: 'Булган', a: 'Хэнтий', hs: null, as: null },
    { h: 'Дорнод', a: 'Сэлэнгэ', hs: null, as: null },
    { h: 'Хөвсгөл', a: 'Багануур', hs: null, as: null },
  ],
  qf: [
    { h: '', a: '', hs: null, as: null },
    { h: '', a: '', hs: null, as: null },
    { h: '', a: '', hs: null, as: null },
    { h: '', a: '', hs: null, as: null },
  ],
  sf: [
    { h: 'Өвэрхангай', a: 'Ажилчин', hs: null, as: null },
    { h: 'Дорнод', a: 'Булган', hs: null, as: null },
  ],
  final: { h: 'Өвэрхангай', a: 'Дорнод', hs: 3, as: 0 },
  third: { h: 'Ажилчин', a: 'Булган', hs: 3, as: 0 },
}

function scoreLabel(m: Match) {
  if (m.hs === null && m.as === null) return null
  return `${m.hs ?? '–'} : ${m.as ?? '–'}`
}

function winner(m: Match): 'h' | 'a' | null {
  if (m.hs === null || m.as === null) return null
  if (m.hs > m.as) return 'h'
  if (m.as > m.hs) return 'a'
  return null
}

function MatchCard({ m, label, highlight = false }: { m: Match; label?: string; highlight?: boolean }) {
  const w = winner(m)
  const score = scoreLabel(m)
  return (
    <div style={{
      borderRadius: 10, overflow: 'hidden',
      border: highlight ? '1px solid var(--gold)' : '1px solid var(--line)',
      background: highlight ? 'rgba(200,162,74,.05)' : 'var(--ink-2)',
    }}>
      {label && (
        <div style={{ padding: '5px 12px', background: highlight ? 'rgba(200,162,74,.12)' : 'var(--ink)', fontSize: 10, fontWeight: 700, color: highlight ? 'var(--gold)' : 'var(--fog)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
          {label}
        </div>
      )}
      <div style={{ padding: '10px 12px' }}>
        {[{ name: m.h, side: 'h' as const }, { name: m.a, side: 'a' as const }].map(({ name, side }, idx) => {
          const isWinner = w === side
          return (
            <div key={idx} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: idx === 0 ? '0 0 6px' : '6px 0 0',
              borderTop: idx === 1 && score ? '1px solid var(--line-2)' : undefined,
            }}>
              <span style={{
                fontSize: 13, fontWeight: isWinner ? 800 : 500,
                color: isWinner ? 'white' : 'var(--fog-2)',
              }}>
                {isWinner && <span style={{ color: 'var(--gold)', marginRight: 6 }}>▸</span>}
                {name || '–'}
              </span>
              {score && (
                <span style={{
                  fontFamily: 'var(--mono)', fontWeight: 800, fontSize: 15,
                  color: isWinner ? 'var(--gold)' : 'var(--fog)',
                  minWidth: 18, textAlign: 'right',
                }}>
                  {side === 'h' ? (m.hs ?? '–') : (m.as ?? '–')}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function GroupCard({ g }: { g: Group }) {
  const RANK_COLOR: Record<number, string> = { 1: '#c8a24a', 2: '#a0a8b8' }
  return (
    <div style={{ borderRadius: 10, border: '1px solid var(--line)', overflow: 'hidden' }}>
      <div style={{ padding: '7px 14px', background: 'var(--ink)', borderBottom: '1px solid var(--line)', fontSize: 11, fontWeight: 700, color: 'var(--fog)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
        {g.num}-р хэсэг
      </div>
      {g.teams.map((t, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px',
          borderBottom: i < g.teams.length - 1 ? '1px solid var(--line-2)' : undefined,
          background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,.015)',
        }}>
          <span style={{
            width: 20, height: 20, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 800, fontFamily: 'var(--mono)',
            background: RANK_COLOR[t.rank] ? RANK_COLOR[t.rank] + '22' : 'var(--line)',
            color: RANK_COLOR[t.rank] ?? 'var(--fog-2)',
            border: RANK_COLOR[t.rank] ? `1px solid ${RANK_COLOR[t.rank]}44` : undefined,
          }}>
            {t.rank}
          </span>
          <span style={{
            fontSize: 13, fontWeight: t.rank <= 2 ? 700 : 400,
            color: t.rank === 1 ? 'white' : t.rank === 2 ? 'var(--fog-2)' : 'var(--fog)',
          }}>
            {t.name}
          </span>
          {t.rank <= 2 && (
            <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, color: t.rank === 1 ? 'var(--gold)' : 'var(--fog)', letterSpacing: '.06em' }}>
              {t.rank === 1 ? 'ШИЛДЭГ' : '2-Р'}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

export default async function DartsPage() {
  const sb = createServiceClient()

  const { data: sportRow } = await sb
    .from('tournament_sports')
    .select('id')
    .eq('tournament_id', TOURNAMENT_ID)
    .eq('sport_type', 'darts')
    .single()

  let d: DartsData = FALLBACK

  if (sportRow?.id) {
    const { data } = await sb
      .from('darts_results')
      .select('data')
      .eq('sport_id', sportRow.id)
      .single()
    if (data?.data) d = data.data as DartsData
  }

  const hasR16Scores = d.r16.some(m => m.hs !== null)
  const hasQFScores = d.qf.some(m => m.hs !== null && m.h)
  const hasSFScores = d.sf.some(m => m.hs !== null)

  return (
    <>
      <section style={{ padding: '48px 0 28px', background: 'var(--ink)' }}>
        <div className="wrap-wide">
          <span style={{ color: 'var(--fog)', fontSize: 11, letterSpacing: '.12em', fontWeight: 700, textTransform: 'uppercase' as const }}>
            Tournament Results · Тэмцээний дүн
          </span>
          <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 44, marginTop: 8, marginBottom: 0, color: 'var(--paper)', fontWeight: 900 }}>
            Дартс <span style={{ color: 'var(--gold)' }}>тэмцээн</span>
          </h1>
          <p style={{ color: 'var(--fog)', fontSize: 13, marginTop: 8, marginBottom: 0 }}>
            ГҮТББ 2026 оны Спортын V наадам · 8 хэсэг + Нугалаа
          </p>
        </div>
      </section>

      <div style={{ background: 'var(--ink-2)', borderBottom: '1px solid var(--line)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="wrap-wide" style={{ display: 'flex', gap: 6, padding: '10px 0' }}>
          {[
            { id: 'groups', label: 'Хэсэг', icon: '⊞' },
            { id: 'knockout', label: 'Нугалаа', icon: '🏆' },
          ].map(s => (
            <a key={s.id} href={`#${s.id}`} style={{
              padding: '7px 16px', borderRadius: 6, fontSize: 12, fontWeight: 700,
              color: 'var(--fog)', background: 'var(--ink-3)',
              border: '1px solid var(--line-2)', whiteSpace: 'nowrap', textDecoration: 'none',
              letterSpacing: '.06em', textTransform: 'uppercase' as const,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </a>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--bg)', paddingBottom: 80 }}>
        <div className="wrap-wide">

          {/* Groups */}
          <section id="groups" style={{ paddingTop: 52 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, paddingBottom: 14, borderBottom: '2px solid var(--gold)' }}>
              <span style={{ fontSize: 28 }}>⊞</span>
              <div>
                <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 28, fontWeight: 900, margin: 0, color: 'white', letterSpacing: '.06em', textTransform: 'uppercase' as const }}>
                  Хэсгийн шат
                </h2>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--fog)', letterSpacing: '.06em' }}>
                  Round Robin · 8 хэсэг · Шилдэг 2 дэвших
                </p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {d.groups.map((g, i) => <GroupCard key={i} g={g} />)}
            </div>
          </section>

          {/* Knockout */}
          <section id="knockout" style={{ paddingTop: 60 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, paddingBottom: 14, borderBottom: '2px solid var(--gold)' }}>
              <span style={{ fontSize: 28 }}>🏆</span>
              <div>
                <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 28, fontWeight: 900, margin: 0, color: 'white', letterSpacing: '.06em', textTransform: 'uppercase' as const }}>
                  Нугалааны шат
                </h2>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--fog)', letterSpacing: '.06em' }}>
                  Top 16 → QF → SF → Финал
                </p>
              </div>
            </div>

            {/* R16 */}
            {(hasR16Scores || true) && (
              <div style={{ marginBottom: 40 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--fog)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>
                  Шилдэг 16
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 8 }}>
                  {d.r16.map((m, i) => (
                    <MatchCard key={i} m={m} label={`M${i + 1}`} />
                  ))}
                </div>
              </div>
            )}

            {/* QF */}
            {(hasQFScores || d.qf.some(m => m.h)) && (
              <div style={{ marginBottom: 40 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--fog)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>
                  Улирал финал · QF
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 8 }}>
                  {d.qf.filter(m => m.h).map((m, i) => (
                    <MatchCard key={i} m={m} label={`QF${i + 1}`} />
                  ))}
                </div>
              </div>
            )}

            {/* SF */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--fog)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>
                Хагас финал · SF
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 8 }}>
                {d.sf.map((m, i) => (
                  <MatchCard key={i} m={m} label={`SF${i + 1}`} />
                ))}
              </div>
            </div>

            {/* Final + 3rd */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--fog)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>
                Финал болон 3-р байр
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                <MatchCard m={d.final} label="🏆 Финал" highlight />
                <MatchCard m={d.third} label="🥉 3-р байрын тэмцээн" />
              </div>
            </div>

            {/* Podium */}
            {d.final.hs !== null && (
              <div style={{ marginTop: 48, padding: 28, background: 'var(--ink-2)', borderRadius: 16, border: '1px solid var(--line)', textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--fog)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 20 }}>Эцсийн байрлал</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
                  {[
                    { medal: '🥇', name: winner(d.final) === 'h' ? d.final.h : d.final.a, label: '1-р байр' },
                    { medal: '🥈', name: winner(d.final) === 'h' ? d.final.a : d.final.h, label: '2-р байр' },
                    { medal: '🥉', name: winner(d.third) === 'h' ? d.third.h : d.third.a, label: '3-р байр' },
                  ].map((p, i) => (
                    <div key={i} style={{ minWidth: 120 }}>
                      <div style={{ fontSize: 40, marginBottom: 8 }}>{p.medal}</div>
                      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, fontWeight: 700, color: 'white', letterSpacing: '.04em' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--fog)', marginTop: 4 }}>{p.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

        </div>
      </div>
    </>
  )
}
