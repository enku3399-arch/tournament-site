import { createServiceClient } from '@/lib/supabase-server'
import { SPORT_ICONS } from '@/lib/types'
import RealtimeRefresher from '@/components/RealtimeRefresher'
import BracketDiagram from '@/components/BracketDiagram'
import ShareButton from '@/components/ShareButton'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Хэсгийн байдал · Монгол 87/89 V Спорт Наадам 2026',
}

const TOURNAMENT_ID = '0b05625d-2f6d-48de-b69c-d5a23c2f0e3f'

type StandingRow = {
  id: string; name: string
  played: number; wins: number; losses: number; draws: number
  gf: number; ga: number; pts: number
}

function computeStandings(teams: { id: string; name: string }[], matches: any[]): StandingRow[] {
  const rows = new Map<string, StandingRow>()
  for (const t of teams) {
    rows.set(t.id, { id: t.id, name: t.name, played: 0, wins: 0, losses: 0, draws: 0, gf: 0, ga: 0, pts: 0 })
  }
  for (const m of matches) {
    if (m.status !== 'completed') continue
    if (!m.team1_id || !m.team2_id || m.team1_score === null || m.team2_score === null) continue
    const r1 = rows.get(m.team1_id), r2 = rows.get(m.team2_id)
    if (!r1 || !r2) continue
    const s1 = m.team1_score as number, s2 = m.team2_score as number
    r1.played++; r2.played++
    r1.gf += s1; r1.ga += s2; r2.gf += s2; r2.ga += s1
    if (s1 > s2)       { r1.wins++;  r2.losses++; r1.pts += 2 }
    else if (s2 > s1)  { r2.wins++;  r1.losses++; r2.pts += 2 }
    else               { r1.draws++; r2.draws++;  r1.pts++;  r2.pts++ }
  }
  return [...rows.values()].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts
    const gdB = b.gf - b.ga, gdA = a.gf - a.ga
    if (gdB !== gdA) return gdB - gdA
    return b.gf - a.gf
  })
}

export default async function GroupsPage() {
  const sb = createServiceClient()

  const [{ data: rawSports }, { data: rawGroups }, { data: rawGT }, { data: rawMatches }, { data: rawChess }, { data: rawDarts }] =
    await Promise.all([
      sb.from('tournament_sports')
        .select('id, name, sport_type, gender')
        .eq('tournament_id', TOURNAMENT_ID),
      sb.from('groups')
        .select('id, name, sport_id, advance_count')
        .eq('tournament_id', TOURNAMENT_ID)
        .order('name'),
      sb.from('group_teams')
        .select('group_id, team:team_id(id, name)'),
      sb.from('matches')
        .select('id, group_id, sport_id, match_number, round, status, stage, team1_id, team2_id, team1_score, team2_score, winner_id, team1:team1_id(id,name), team2:team2_id(id,name), winner:winner_id(id,name)')
        .eq('tournament_id', TOURNAMENT_ID)
        .in('stage', ['group', 'knockout', 'third'])
        .order('round', { ascending: false })
        .order('match_number'),
      sb.from('chess_standings')
        .select('sport_id, gender, rank, name, club, pts')
        .order('gender').order('rank'),
      sb.from('darts_results')
        .select('sport_id, data'),
    ])

  const SPORT_ORDER: Record<string, number> = {
    basketball: 1, volleyball: 2, table_tennis: 3, darts: 4, wrestling: 5, chess: 6,
  }
  const sports = (rawSports ?? []).sort((a: any, b: any) => {
    const so = (SPORT_ORDER[a.sport_type] ?? 9) - (SPORT_ORDER[b.sport_type] ?? 9)
    if (so !== 0) return so
    // male before female within same sport type
    if (a.gender !== b.gender) {
      if (a.gender === 'male') return -1
      if (b.gender === 'male') return 1
    }
    return 0
  })
  const groups = rawGroups ?? []
  const chessRows = rawChess ?? []
  const dartsRows = rawDarts ?? []
  const gtRows = rawGT ?? []
  const allMatches = rawMatches ?? []
  const matches = allMatches.filter((m: any) => m.stage === 'group')

  function bracketMatchesForSport(sportId: string) {
    return allMatches.filter((m: any) => m.sport_id === sportId && (m.stage === 'knockout' || m.stage === 'third'))
  }

  return (
    <>
      <RealtimeRefresher />

      {/* ── Header ──────────────────────────────────────────────── */}
      <section style={{ padding: '48px 0 28px', background: 'var(--ink)' }}>
        <div className="wrap-wide">
          <span className="eyebrow" style={{ color: 'var(--fog)', fontSize: 11, letterSpacing: '.12em' }}>
            GROUP STAGE · ХЭСГИЙН ШАТ
          </span>
          <h1 className="section-title" style={{ fontFamily: 'Oswald, sans-serif', fontSize: 44, marginTop: 8, color: 'var(--paper)' }}>
            Хэсгийн <span className="gold">байдал</span>
          </h1>
          <p style={{ color: 'var(--fog)', fontSize: 13, marginTop: 8 }}>
            Хэсэг тус бүрийн оноо, байдал шууд шинэчлэгдэнэ
          </p>
          <div style={{ marginTop: 16 }}>
            <ShareButton label="Хуваарийг хуваалцах" url="https://tournament-site-ten.vercel.app/groups" />
          </div>
        </div>
      </section>

      {/* ── Sport nav ───────────────────────────────────────────── */}
      <div style={{ background: 'var(--ink-2)', borderBottom: '1px solid var(--line)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="wrap-wide" style={{ display: 'flex', gap: 4, overflowX: 'auto', padding: '10px 0', scrollbarWidth: 'none' }}>
          {sports.filter(s => s.sport_type === 'chess' || s.sport_type === 'darts' || groups.some(g => g.sport_id === s.id)).map(s => (
            <a key={s.id} href={`#${s.id}`} style={{
              padding: '7px 16px', borderRadius: 6, fontSize: 12, fontWeight: 700,
              color: 'var(--fog)', background: 'var(--ink-3)',
              border: '1px solid var(--line-2)', whiteSpace: 'nowrap', textDecoration: 'none',
              letterSpacing: '.06em', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ fontSize: 16 }}>{SPORT_ICONS[s.sport_type] ?? '🏅'}</span>
              <span>{s.name}</span>
            </a>
          ))}
        </div>
      </div>

      {/* ── Sports ─────────────────────────────────────────────── */}
      <div style={{ background: 'var(--bg)', paddingBottom: 80 }}>
        {sports.map(sport => {
          // ── Chess: Swiss-system final rankings ───────────────────────────
          if (sport.sport_type === 'chess') {
            const sportChess = chessRows.filter((r: any) => r.sport_id === sport.id)
            const women: any[] = sportChess.filter((r: any) => r.gender === 'women')
            const men:   any[] = sportChess.filter((r: any) => r.gender === 'men')
            if (women.length === 0 && men.length === 0) return null
            const chfmt = (n: number) => n % 1 === 0.5 ? `${Math.floor(n)}½` : String(n)
            const MC: Record<number, string> = { 1: '#c8a24a', 2: '#a0a8b8', 3: '#b87333' }
            const MB: Record<number, string> = { 1: 'rgba(200,162,74,.07)', 2: 'rgba(192,192,192,.05)', 3: 'rgba(205,127,50,.05)' }
            const medals = ['🥇','🥈','🥉']

            const ChessRankBlock = ({ rows, label }: { rows: any[], label: string }) => (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--gold)', letterSpacing: '.06em', textTransform: 'uppercase' as const }}>{label}</span>
                  <span style={{ fontSize: 11, color: 'var(--fog)' }}>· {rows.length} тоглогч</span>
                </div>
                <div style={{ borderRadius: 10, border: '1px solid var(--line)', overflow: 'hidden', background: 'var(--paper)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: 'var(--ink)' }}>
                        <th style={{ width: 36, padding: '7px 8px', textAlign: 'center', color: 'var(--fog)', fontWeight: 600, fontSize: 10 }}>#</th>
                        <th style={{ padding: '7px 10px', textAlign: 'left', color: 'var(--fog)', fontWeight: 600, fontSize: 10 }}>ТОГЛОГЧ</th>
                        <th style={{ padding: '7px 10px', textAlign: 'left', color: 'var(--fog)', fontWeight: 600, fontSize: 10 }}>АЙМАГ / ДҮҮРЭГ</th>
                        <th style={{ width: 56, padding: '7px 10px', textAlign: 'center', color: 'var(--gold)', fontWeight: 700, fontSize: 10 }}>ОНОО</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((p: any, i: number) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--line-2)', background: MB[p.rank] ?? (i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,.012)'), ...(p.rank <= 3 ? { borderLeft: `3px solid ${MC[p.rank]}` } : {}) }}>
                          <td style={{ padding: '8px', textAlign: 'center' }}>
                            {p.rank <= 3
                              ? <span style={{ fontSize: 16 }}>{medals[p.rank - 1]}</span>
                              : <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 4, background: 'var(--line)', color: 'var(--fog-2)', fontSize: 10, fontWeight: 700, fontFamily: 'var(--mono)' }}>{p.rank}</span>
                            }
                          </td>
                          <td style={{ padding: '8px 10px', fontWeight: p.rank <= 3 ? 700 : 500, color: MC[p.rank] ?? 'var(--ink-2)', fontSize: p.rank <= 3 ? 13 : 12 }}>{p.name}</td>
                          <td style={{ padding: '8px 10px', color: 'var(--fog-2)', fontSize: 11 }}>{p.club}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'center', fontFamily: 'var(--mono)', fontWeight: 800, fontSize: 15, color: MC[p.rank] ?? (p.pts >= 4 ? 'var(--gold-dark)' : 'var(--fog-2)') }}>{chfmt(p.pts)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )

            return (
              <section key={sport.id} id={sport.id} style={{ padding: '52px 0 0' }}>
                <div className="wrap-wide">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, paddingBottom: 14, borderBottom: '2px solid var(--gold)' }}>
                    <span style={{ fontSize: 36, lineHeight: 1 }}>♟️</span>
                    <h2 style={{ fontSize: 30, fontWeight: 900, color: 'white', mixBlendMode: 'difference' as any, margin: 0, letterSpacing: '.06em', textTransform: 'uppercase' as const }}>
                      {sport.name}
                    </h2>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(460px, 1fr))', gap: 28 }}>
                    {women.length > 0 && <ChessRankBlock rows={women} label="Эмэгтэй" />}
                    {men.length   > 0 && <ChessRankBlock rows={men}   label="Эрэгтэй" />}
                  </div>
                </div>
              </section>
            )
          }

          // ── Darts: groups + full knockout inline ─────────────────────────
          if (sport.sport_type === 'darts') {
            const dartRow = dartsRows.find((r: any) => r.sport_id === sport.id)
            const dd = dartRow?.data as any
            if (!dd) return null
            type DM = { h: string; a: string; hs: number | null; as: number | null }
            const dWinner = (m: DM) => m.hs !== null && m.as !== null ? (m.hs > m.as ? 'h' : m.as > m.hs ? 'a' : null) : null

            const DMatchCard = ({ m, label, gold = false }: { m: DM; label?: string; gold?: boolean }) => {
              const w = dWinner(m)
              const hasScore = m.hs !== null
              return (
                <div style={{ borderRadius: 12, overflow: 'hidden', border: gold ? '1.5px solid rgba(200,162,74,.6)' : '1px solid var(--line)', background: 'var(--ink-2)' }}>
                  <div style={{ background: gold ? 'rgba(200,162,74,.12)' : 'var(--ink)', padding: '7px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: gold ? 'var(--gold)' : 'var(--fog)', letterSpacing: '.1em', textTransform: 'uppercase' as const }}>{label}</span>
                    {hasScore && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--fog)', fontFamily: 'var(--mono)' }}>ДУУССАН</span>}
                  </div>
                  {([{ name: m.h, side: 'h' as const, score: m.hs }, { name: m.a, side: 'a' as const, score: m.as }]).map(({ name, side, score }, si) => {
                    const isW = w === side
                    return (
                      <div key={si} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '9px 14px', borderTop: '1px solid var(--line-2)',
                        borderLeft: isW ? '3px solid var(--gold)' : '3px solid transparent',
                      }}>
                        <span style={{ fontSize: 13, fontWeight: isW ? 700 : 400, color: isW ? 'var(--paper)' : 'var(--fog-2)' }}>
                          {name || <span style={{ color: 'var(--fog)', fontStyle: 'italic', fontSize: 11 }}>нэр байхгүй</span>}
                        </span>
                        <span style={{ fontFamily: 'var(--mono)', fontWeight: 800, fontSize: 16, color: isW ? 'var(--gold)' : (hasScore ? 'var(--fog)' : 'var(--fog-2)'), minWidth: 20, textAlign: 'right' }}>
                          {score ?? '–'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )
            }

            const DRound = ({ title, matches, minW = 240 }: { title: string; matches: DM[]; minW?: number }) => {
              const visible = matches.filter(m => m.h)
              if (visible.length === 0) return null
              return (
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, paddingTop: 28, borderTop: '1px solid var(--line)' }}>
                    <span style={{ fontSize: 16 }}>⟁</span>
                    <h3 style={{ fontSize: 14, fontWeight: 800, margin: 0, textTransform: 'uppercase' as const, letterSpacing: '.08em', color: 'white' }}>{title}</h3>
                    <span style={{ fontSize: 11, color: 'var(--fog)', fontFamily: 'var(--mono)' }}>{visible.length} тоглолт</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${minW}px, 1fr))`, gap: 10 }}>
                    {visible.map((m, i) => <DMatchCard key={i} m={m} label={`M${i + 1}`} />)}
                  </div>
                </div>
              )
            }

            const fin: DM = dd.final
            const thr: DM = dd.third
            const finalWinner = dWinner(fin)

            return (
              <section key={sport.id} id={sport.id} style={{ padding: '52px 0 0' }}>
                <div className="wrap-wide">
                  {/* Title */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, paddingBottom: 14, borderBottom: '2px solid var(--gold)' }}>
                    <span style={{ fontSize: 36, lineHeight: 1 }}>🎯</span>
                    <h2 style={{ fontSize: 30, fontWeight: 900, color: 'white', mixBlendMode: 'difference' as any, margin: 0, letterSpacing: '.06em', textTransform: 'uppercase' as const }}>{sport.name}</h2>
                  </div>

                  {/* Groups grid — same card style as basketball */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                    {(dd.groups as any[]).map((g: any) => (
                      <div key={g.num} style={{ borderRadius: 12, border: '1px solid var(--line)', background: 'var(--paper)', overflow: 'hidden' }}>
                        {/* Group header */}
                        <div style={{ background: 'var(--ink)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: 'var(--ink)', fontFamily: 'Oswald, sans-serif' }}>{g.num}</span>
                            <span style={{ color: 'var(--paper)', fontWeight: 700, fontSize: 13, fontFamily: 'Oswald, sans-serif', letterSpacing: '.06em' }}>ХЭСЭГ {g.num}</span>
                          </div>
                          <span style={{ fontSize: 10, color: 'var(--fog)', fontFamily: 'var(--mono)' }}>Round Robin</span>
                        </div>
                        {/* Standings table */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                          <thead>
                            <tr style={{ background: 'var(--line-2)' }}>
                              <th style={{ width: 28, padding: '6px 8px', textAlign: 'center', color: 'var(--fog)', fontWeight: 600 }}>#</th>
                              <th style={{ padding: '6px 8px', textAlign: 'left', color: 'var(--fog)', fontWeight: 600 }}>Баг</th>
                              <th style={{ padding: '6px 12px', textAlign: 'right', color: 'var(--fog)', fontWeight: 600, fontSize: 10 }}>Байр</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(g.teams as any[]).map((t: any, ti: number) => {
                              const advances = t.rank <= 2
                              return (
                                <tr key={ti} style={{ borderBottom: '1px solid var(--line-2)', background: advances ? 'rgba(200,162,74,.05)' : 'transparent' }}>
                                  <td style={{ padding: '8px', textAlign: 'center' }}>
                                    <span style={{ width: 20, height: 20, borderRadius: 4, background: advances ? 'var(--gold)' : 'var(--line)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: advances ? 'var(--ink)' : 'var(--fog-2)', fontFamily: 'var(--mono)' }}>{ti + 1}</span>
                                  </td>
                                  <td style={{ padding: '8px', fontWeight: 600, color: 'var(--ink-2)' }}>{t.name}</td>
                                  <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: t.rank === 1 ? 'var(--gold)' : t.rank === 2 ? 'var(--fog)' : 'var(--fog-2)' }}>
                                    {t.rank === 1 ? '🥇 1-р' : t.rank === 2 ? '🥈 2-р' : `${t.rank}-р`}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                        <div style={{ padding: '5px 12px 8px', borderTop: '1px solid var(--line-2)' }}>
                          <span style={{ fontSize: 9, color: 'var(--gold)' }}>🔼 Дээрх 2 баг нугалаанд</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Knockout rounds */}
                  <DRound title="Шилдэг 16" matches={dd.r16 as DM[]} minW={240} />
                  <DRound title="Улирал финал · QF" matches={(dd.qf as DM[]).filter((m: DM) => m.h)} minW={260} />
                  <DRound title="Хагас финал · SF" matches={dd.sf as DM[]} minW={280} />

                  {/* Final + 3rd place */}
                  {fin.h && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, paddingTop: 28, borderTop: '1px solid var(--line)' }}>
                        <span style={{ fontSize: 16 }}>🏆</span>
                        <h3 style={{ fontSize: 14, fontWeight: 800, margin: 0, textTransform: 'uppercase' as const, letterSpacing: '.08em', color: 'var(--gold)' }}>Финал болон 3-р байрын тэмцээн</h3>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                        <DMatchCard m={fin} label="🏆 Финал" gold />
                        {thr.h && <DMatchCard m={thr} label="🥉 3-р байрын тэмцээн" />}
                      </div>
                    </div>
                  )}

                  {/* Podium */}
                  {fin.hs !== null && finalWinner && (
                    <div style={{ marginTop: 32, padding: '28px 32px', background: 'var(--ink)', borderRadius: 14, border: '1px solid var(--line)', textAlign: 'center' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--fog)', letterSpacing: '.14em', textTransform: 'uppercase' as const, marginBottom: 22 }}>Эцсийн байрлал · Final Standings</div>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
                        {[
                          { medal: '🥇', name: finalWinner === 'h' ? fin.h : fin.a, label: '1-р байр' },
                          { medal: '🥈', name: finalWinner === 'h' ? fin.a : fin.h, label: '2-р байр' },
                          ...(thr.hs !== null && dWinner(thr) ? [{ medal: '🥉', name: dWinner(thr) === 'h' ? thr.h : thr.a, label: '3-р байр' }] : []),
                        ].map((p, pi) => (
                          <div key={pi} style={{ minWidth: 100 }}>
                            <div style={{ fontSize: 42, marginBottom: 8, lineHeight: 1 }}>{p.medal}</div>
                            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, fontWeight: 700, color: 'white', letterSpacing: '.04em' }}>{p.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--fog)', marginTop: 4 }}>{p.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )
          }

          // ── Regular group sports ─────────────────────────────────────────
          const sGroups = groups
            .filter(g => g.sport_id === sport.id)
            .sort((a, b) => a.name.localeCompare(b.name))
          if (sGroups.length === 0) return null

          return (
            <section key={sport.id} id={sport.id} style={{ padding: '52px 0 0' }}>
              <div className="wrap-wide">
                {/* Sport title */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28,
                  paddingBottom: 14, borderBottom: '2px solid var(--gold)',
                }}>
                  <span style={{ fontSize: 36, lineHeight: 1 }}>{SPORT_ICONS[sport.sport_type] ?? '🏅'}</span>
                  <h2 style={{
                    fontSize: 30, fontWeight: 900,
                    color: 'white', mixBlendMode: 'difference',
                    margin: 0, letterSpacing: '.06em',
                    textTransform: 'uppercase',
                  }}>
                    {sport.name}
                  </h2>
                </div>

                {/* Groups grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: 16,
                }}>
                  {sGroups.map(group => {
                    const teamObjs = gtRows
                      .filter(gt => gt.group_id === group.id)
                      .map(gt => gt.team as { id: string; name: string })
                      .filter(Boolean)

                    const gMatches = matches.filter(m => m.group_id === group.id)
                    const doneCnt = gMatches.filter(m => m.status === 'completed').length
                    const isLive = gMatches.some(m => m.status === 'live')
                    const standings = computeStandings(teamObjs, gMatches)

                    return (
                      <div key={group.id} style={{
                        borderRadius: 12,
                        border: isLive ? '1.5px solid rgba(239,68,68,.5)' : '1px solid var(--line)',
                        background: 'var(--paper)',
                        overflow: 'hidden',
                      }}>
                        {/* Group header */}
                        <div style={{
                          background: 'var(--ink)',
                          padding: '10px 16px',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{
                              width: 28, height: 28, borderRadius: 6, background: 'var(--gold)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 800, fontSize: 15, color: 'var(--ink)',
                              fontFamily: 'Oswald, sans-serif',
                            }}>
                              {group.name}
                            </span>
                            <span style={{
                              color: 'var(--paper)', fontWeight: 700, fontSize: 13,
                              fontFamily: 'Oswald, sans-serif', letterSpacing: '.06em',
                            }}>
                              ХЭСЭГ {group.name}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {isLive && (
                              <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444' }}>● LIVE</span>
                            )}
                            <span style={{ fontSize: 11, color: 'var(--fog)', fontFamily: 'var(--mono)' }}>
                              {doneCnt}/{gMatches.length} тоглолт
                            </span>
                          </div>
                        </div>

                        {/* Standings table */}
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                            <thead>
                              <tr style={{ background: 'var(--line-2)' }}>
                                <th style={{ width: 28, padding: '6px 8px', textAlign: 'center', color: 'var(--fog)', fontWeight: 600 }}>#</th>
                                <th style={{ padding: '6px 8px', textAlign: 'left', color: 'var(--fog)', fontWeight: 600 }}>Баг</th>
                                {(['Т','Я','Х','ОО','ОА','Оноо'] as const).map(h => (
                                  <th key={h} style={{ padding: '6px 8px', textAlign: 'center', color: 'var(--fog)', fontWeight: 600, minWidth: 32 }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {standings.map((row, i) => {
                                const advances = i < group.advance_count
                                return (
                                  <tr key={row.id} style={{
                                    borderBottom: '1px solid var(--line-2)',
                                    background: advances ? 'rgba(200,162,74,.05)' : 'transparent',
                                  }}>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>
                                      <span style={{
                                        width: 20, height: 20, borderRadius: 4,
                                        background: advances ? 'var(--gold)' : 'var(--line)',
                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 10, fontWeight: 800,
                                        color: advances ? 'var(--ink)' : 'var(--fog-2)',
                                        fontFamily: 'var(--mono)',
                                      }}>
                                        {i + 1}
                                      </span>
                                    </td>
                                    <td style={{ padding: '8px', fontWeight: 600, color: 'var(--ink-2)' }}>
                                      {row.name}
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'center', color: 'var(--fog-2)', fontFamily: 'var(--mono)' }}>{row.played}</td>
                                    <td style={{ padding: '8px', textAlign: 'center', color: row.wins > 0 ? '#22c55e' : 'var(--fog-2)', fontFamily: 'var(--mono)', fontWeight: row.wins > 0 ? 700 : 400 }}>{row.wins}</td>
                                    <td style={{ padding: '8px', textAlign: 'center', color: row.losses > 0 ? '#ef4444' : 'var(--fog-2)', fontFamily: 'var(--mono)' }}>{row.losses}</td>
                                    <td style={{ padding: '8px', textAlign: 'center', color: 'var(--fog-2)', fontFamily: 'var(--mono)' }}>{row.gf}</td>
                                    <td style={{ padding: '8px', textAlign: 'center', color: 'var(--fog-2)', fontFamily: 'var(--mono)' }}>{row.ga}</td>
                                    <td style={{ padding: '8px', textAlign: 'center', fontWeight: 800, fontFamily: 'var(--mono)', color: row.pts > 0 ? 'var(--gold-dark)' : 'var(--fog-2)' }}>{row.pts}</td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Legend */}
                        <div style={{ padding: '5px 12px 8px', display: 'flex', gap: 10, flexWrap: 'wrap', borderTop: '1px solid var(--line-2)' }}>
                          {['Т=Тоглосон','Я=Ялалт','Х=Хожигдол','ОО=Оруулсан','ОА=Авсан'].map(l => (
                            <span key={l} style={{ fontSize: 9, color: 'var(--fog)', letterSpacing: '.02em' }}>{l}</span>
                          ))}
                          <span style={{ fontSize: 9, color: 'var(--gold)', marginLeft: 'auto' }}>
                            🔼 Дээрх {group.advance_count} баг нугалаанд
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* ── Knockout bracket ──────────────────────────────── */}
                {(() => {
                  const kMatches = bracketMatchesForSport(sport.id)
                  if (kMatches.length === 0) return null
                  return (
                    <div style={{ marginTop: 36 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingTop: 24, borderTop: '1px solid var(--line)' }}>
                        <span style={{ fontSize: 20 }}>⟁</span>
                        <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '.08em', color: 'white', mixBlendMode: 'difference' as any }}>
                          Нугалааны схем
                        </h3>
                      </div>
                      <BracketDiagram matches={kMatches as any} />
                    </div>
                  )
                })()}
              </div>
            </section>
          )
        })}
      </div>
    </>
  )
}
