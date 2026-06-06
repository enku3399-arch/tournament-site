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

  const [{ data: rawSports }, { data: rawGroups }, { data: rawGT }, { data: rawMatches }] =
    await Promise.all([
      sb.from('tournament_sports')
        .select('id, name, sport_type')
        .eq('tournament_id', TOURNAMENT_ID)
        .order('name'),
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
    ])

  const sports = rawSports ?? []
  const groups = rawGroups ?? []
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
          {sports.filter(s => groups.some(g => g.sport_id === s.id)).map(s => (
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
