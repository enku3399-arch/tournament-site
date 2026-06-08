import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase-server'
import { getSiteSettings } from '@/lib/site-settings'
import RealtimeRefresher from '@/components/RealtimeRefresher'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Тоглолтын хуваарь · Монгол 87/89 V Спорт Наадам 2026',
}

const TOURNAMENT_ID = '0b05625d-2f6d-48de-b69c-d5a23c2f0e3f'

const SPORT_ICON: Record<string, string> = {
  basketball: '🏀', volleyball: '🏐', chess: '♟️', table_tennis: '🏓', darts: '🎯',
}
const SPORT_COLOR: Record<string, string> = {
  basketball: '#e07b39', volleyball: '#4a9edd', chess: '#8e6bbf',
  table_tennis: '#4caf8d', darts: '#e04a6b',
}

type DbMatch = {
  id: string; sport_id: string; stage: string; round: number | null
  group_id: string | null; court: number; schedule_order: number | null
  team1_id: string | null; team2_id: string | null
  team1_source: string | null; team2_source: string | null
  team1_score: number | null; team2_score: number | null
  status: string; winner_id: string | null; match_number: number
}
type DbTeam   = { id: string; name: string; sport_id: string }
type DbGroup  = { id: string; name: string; sport_id: string }
type DbSport  = { id: string; name: string; sport_type: string; gender: string | null }

const SPORT_ORDER = [
  'basketball_male','basketball_female',
  'volleyball_male','volleyball_female',
  'table_tennis_','darts_','chess_',
]

export default async function MatchesPage() {
  const settings = await getSiteSettings()
  const visibleSportIds = settings.schedule_sports ?? []

  if (visibleSportIds.length === 0) {
    return (
      <>
        <section className="section" style={{ padding: '48px 0 40px' }}>
          <div className="wrap-wide">
            <span className="eyebrow" style={{ color: 'var(--fog)' }}>Match Schedule</span>
            <h1 className="section-title" style={{ fontFamily: 'Oswald, sans-serif', fontSize: 48, marginTop: 8 }}>
              Тоглолтын <span className="gold">хуваарь</span>
            </h1>
            <p style={{ marginTop: 24, color: 'var(--fog)', fontSize: 15 }}>
              Тоглолтын хуваарь бэлдэгдэж байна. Удахгүй нийтлэгдэнэ.
            </p>
          </div>
        </section>
      </>
    )
  }

  const supabase = createServiceClient()
  const [{ data: allSports }, { data: allTeams }, { data: allGroups }, { data: allMatches }] =
    await Promise.all([
      supabase.from('tournament_sports').select('id, name, sport_type, gender')
        .eq('tournament_id', TOURNAMENT_ID).in('id', visibleSportIds),
      supabase.from('teams').select('id, name, sport_id').eq('tournament_id', TOURNAMENT_ID),
      supabase.from('groups').select('id, name, sport_id').eq('tournament_id', TOURNAMENT_ID),
      supabase.from('matches')
        .select('id, sport_id, stage, round, group_id, court, schedule_order, match_number, team1_id, team2_id, team1_source, team2_source, team1_score, team2_score, status, winner_id')
        .eq('tournament_id', TOURNAMENT_ID)
        .in('sport_id', visibleSportIds)
        .order('schedule_order').order('match_number'),
    ])

  const sports  = ((allSports  ?? []) as DbSport[]).sort((a, b) => {
    const ka = `${a.sport_type}_${a.gender ?? ''}`, kb = `${b.sport_type}_${b.gender ?? ''}`
    const ia = SPORT_ORDER.findIndex(k => ka.startsWith(k.replace('_','')||k))
    const ib = SPORT_ORDER.findIndex(k => kb.startsWith(k.replace('_','')||k))
    return ia - ib
  })
  const teams   = (allTeams   ?? []) as DbTeam[]
  const groups  = (allGroups  ?? []) as DbGroup[]
  const matches = (allMatches ?? []) as DbMatch[]

  const teamMap  = new Map(teams.map(t => [t.id, t]))
  const groupMap = new Map(groups.map(g => [g.id, g]))

  return (
    <>
      <RealtimeRefresher />

      {/* Header */}
      <section className="section" style={{ padding: '48px 0 32px' }}>
        <div className="wrap-wide">
          <span className="eyebrow" style={{ color: 'var(--fog)' }}>Match Schedule · 2026.06.11—06.12</span>
          <h1 className="section-title" style={{ fontFamily: 'Oswald, sans-serif', fontSize: 48, marginTop: 8 }}>
            Тоглолтын <span className="gold">хуваарь</span>
          </h1>
        </div>
      </section>

      {/* Sport sections */}
      {sports.map(sport => {
        const color    = SPORT_COLOR[sport.sport_type] ?? 'var(--gold)'
        const icon     = SPORT_ICON[sport.sport_type] ?? '🏅'
        const sportMs  = matches.filter(m => m.sport_id === sport.id && m.stage === 'group')
          .sort((a, b) => (a.schedule_order ?? a.match_number) - (b.schedule_order ?? b.match_number))

        const hasTwoCourts = sportMs.some(m => m.court === 2)
        const court1 = sportMs.filter(m => m.court === 1 || !hasTwoCourts)
        const court2 = hasTwoCourts ? sportMs.filter(m => m.court === 2) : []

        const koMatches = matches.filter(m => m.sport_id === sport.id && (m.stage === 'knockout' || m.stage === 'third'))
        const ko1 = hasTwoCourts ? koMatches.filter(m => m.court === 1) : koMatches
        const ko2 = hasTwoCourts ? koMatches.filter(m => m.court === 2) : []
        const doneGroup = sportMs.filter(m => m.status === 'completed').length

        return (
          <section key={sport.id} style={{ paddingBottom: 48 }}>
            <div className="wrap-wide">
              {/* Sport header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 16, flexWrap: 'wrap', gap: 12,
                borderBottom: `2px solid ${color}30`, paddingBottom: 14,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 24 }}>{icon}</span>
                  <div>
                    <h2 style={{
                      fontFamily: 'Oswald, sans-serif', fontSize: 20, fontWeight: 700,
                      color: 'var(--paper)', margin: 0, letterSpacing: '.04em',
                    }}>
                      {sport.name}
                    </h2>
                    <p style={{ fontSize: 12, color: 'var(--fog)', margin: 0 }}>
                      Хэсгийн шат — {doneGroup}/{sportMs.length} тоглолт дуусгавар
                    </p>
                  </div>
                </div>
              </div>

              {/* Courts + knockouts inline */}
              <div className={hasTwoCourts ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'grid grid-cols-1 gap-4'}>
                <CourtTable
                  matches={hasTwoCourts ? court1 : sportMs}
                  knockouts={ko1}
                  label={hasTwoCourts ? '1-р талбай' : undefined}
                  teamMap={teamMap}
                  groupMap={groupMap}
                  color={color}
                />
                {hasTwoCourts && (
                  <CourtTable
                    matches={court2}
                    knockouts={ko2}
                    label="2-р талбай"
                    teamMap={teamMap}
                    groupMap={groupMap}
                    color={color}
                  />
                )}
              </div>
            </div>
          </section>
        )
      })}

      <section className="section" style={{ padding: '0 0 64px' }}>
        <div className="wrap-wide" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link href="/medals" className="btn-primary">Медалийн хүснэгт →</Link>
          <Link href="/" className="section-action" style={{ alignSelf: 'center', fontSize: 14 }}>← Нүүр хуудас</Link>
        </div>
      </section>
    </>
  )
}

const ROUND_LABELS: Record<number, string> = {
  4: '1/8 ФИНАЛ', 3: 'УЛИРАЛ ФИНАЛ', 2: 'ХАГАС ФИНАЛ', 1: 'ФИНАЛ',
}

function slotLabel(source: string | null): string {
  if (!source) return '?'
  const [grp, rank] = source.split(':')
  return `${grp}${rank}`
}

function CourtTable({
  matches, knockouts, label, teamMap, groupMap, color,
}: {
  matches: DbMatch[]
  knockouts: DbMatch[]
  label?: string
  teamMap: Map<string, DbTeam>
  groupMap: Map<string, DbGroup>
  color: string
}) {
  if (matches.length === 0 && knockouts.length === 0) return null

  const doneGroup = matches.filter(m => m.status === 'completed').length

  // Group knockouts by round
  const byRound = new Map<number, DbMatch[]>()
  const thirdPlace: DbMatch[] = []
  for (const m of knockouts) {
    if (m.stage === 'third') thirdPlace.push(m)
    else {
      const r = m.round ?? 0
      if (!byRound.has(r)) byRound.set(r, [])
      byRound.get(r)!.push(m)
    }
  }
  const roundEntries = [...byRound.entries()].sort((a, b) => b[0] - a[0])
  if (thirdPlace.length > 0) roundEntries.push([-1, thirdPlace])

  return (
    <div style={{
      background: 'var(--bone)',
      border: '1px solid rgba(11,20,38,.1)',
      borderRadius: 14,
      overflow: 'hidden',
    }}>
      {/* Court header */}
      {label && (
        <div style={{
          background: `${color}10`,
          borderBottom: `1px solid ${color}20`,
          padding: '9px 16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{
            fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 14,
            color: color, letterSpacing: '.07em',
          }}>
            {label}
          </span>
          <span style={{ fontSize: 11, color: 'var(--fog)', fontFamily: 'var(--mono)' }}>
            {doneGroup}/{matches.length}
          </span>
        </div>
      )}

      {/* Group stage matches */}
      <div style={{ padding: '2px 0' }}>
        {matches.map((m, idx) => {
          const t1   = m.team1_id ? teamMap.get(m.team1_id) : null
          const t2   = m.team2_id ? teamMap.get(m.team2_id) : null
          const grp  = m.group_id ? groupMap.get(m.group_id) : null
          const done = m.status === 'completed'
          const win1 = done && m.winner_id === m.team1_id
          const win2 = done && m.winner_id === m.team2_id

          return (
            <div key={m.id} style={{
              display: 'grid',
              gridTemplateColumns: '20px 28px 1fr 48px 1fr',
              alignItems: 'center',
              gap: '0 6px',
              padding: '7px 12px',
              borderTop: idx === 0 ? 'none' : '1px solid rgba(11,20,38,.06)',
            }}>
              <span style={{ fontSize: 10, color: 'rgba(11,20,38,.2)', fontFamily: 'var(--mono)', textAlign: 'right' }}>
                {m.schedule_order ?? m.match_number}
              </span>
              {grp ? (
                <span style={{
                  fontSize: 10, fontWeight: 700, fontFamily: 'var(--display)',
                  color: color, background: `${color}18`,
                  borderRadius: 4, padding: '1px 5px', letterSpacing: '.04em',
                  textAlign: 'center', whiteSpace: 'nowrap',
                }}>
                  {grp.name}
                </span>
              ) : (
                <span style={{ fontSize: 10, color: 'var(--fog)', textAlign: 'center' }}>—</span>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5, minWidth: 0 }}>
                <span style={{
                  fontSize: 12, fontWeight: win1 ? 700 : 400,
                  color: win1 ? 'var(--paper)' : done ? 'rgba(11,20,38,.4)' : 'var(--ink)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right',
                }}>
                  {t1?.name ?? '—'}
                </span>
              </div>
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                {done ? (
                  <span style={{
                    fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 13, color: 'var(--paper)',
                    background: `${color}20`, borderRadius: 5, padding: '2px 7px', display: 'inline-block',
                  }}>
                    {m.team1_score}:{m.team2_score}
                  </span>
                ) : (
                  <span style={{ fontSize: 10, color: 'rgba(11,20,38,.25)', fontWeight: 600, letterSpacing: '.04em' }}>VS</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 5, minWidth: 0 }}>
                <span style={{
                  fontSize: 12, fontWeight: win2 ? 700 : 400,
                  color: win2 ? 'var(--paper)' : done ? 'rgba(11,20,38,.4)' : 'var(--ink)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {t2?.name ?? '—'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Knockout section — appended inside same card */}
      {knockouts.length > 0 && (
        <>
          <div style={{
            borderTop: `2px solid ${color}25`,
            padding: '8px 16px',
            background: `${color}08`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13 }}>🏆</span>
              <span style={{
                fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700,
                color: color, letterSpacing: '.07em',
              }}>
                НУГАЛААНЫ ШАТ
              </span>
              <span style={{ fontSize: 10, color: 'var(--fog)', fontFamily: 'var(--mono)' }}>
                {knockouts.filter(m => m.status === 'completed').length}/{knockouts.length}
              </span>
            </div>
          </div>

          {roundEntries.map(([round, rMatches]) => (
            <div key={round}>
              {rMatches.map((m) => {
                const t1   = m.team1_id ? teamMap.get(m.team1_id) : null
                const t2   = m.team2_id ? teamMap.get(m.team2_id) : null
                const done = m.status === 'completed'
                const win1 = done && m.winner_id === m.team1_id
                const win2 = done && m.winner_id === m.team2_id
                const name1 = t1?.name ?? slotLabel(m.team1_source)
                const name2 = t2?.name ?? slotLabel(m.team2_source)

                return (
                  <div key={m.id} style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 48px 1fr',
                    alignItems: 'center',
                    gap: '0 6px',
                    padding: '7px 16px',
                    borderTop: '1px solid rgba(11,20,38,.06)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5, minWidth: 0 }}>
                      <span style={{
                        fontSize: 12, fontWeight: win1 ? 700 : 400,
                        color: win1 ? 'var(--paper)' : done ? 'rgba(11,20,38,.4)' : (!t1 ? 'var(--fog)' : 'var(--ink)'),
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right',
                        fontStyle: !t1 ? 'italic' : 'normal',
                      }}>
                        {name1}
                      </span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      {done ? (
                        <span style={{
                          fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 13, color: 'var(--paper)',
                          background: `${color}20`, borderRadius: 5, padding: '2px 7px', display: 'inline-block',
                        }}>
                          {m.team1_score}:{m.team2_score}
                        </span>
                      ) : (
                        <span style={{ fontSize: 10, color: 'rgba(11,20,38,.22)', fontWeight: 600, letterSpacing: '.04em' }}>VS</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 5, minWidth: 0 }}>
                      <span style={{
                        fontSize: 12, fontWeight: win2 ? 700 : 400,
                        color: win2 ? 'var(--paper)' : done ? 'rgba(11,20,38,.4)' : (!t2 ? 'var(--fog)' : 'var(--ink)'),
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        fontStyle: !t2 ? 'italic' : 'normal',
                      }}>
                        {name2}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </>
      )}
    </div>
  )
}
