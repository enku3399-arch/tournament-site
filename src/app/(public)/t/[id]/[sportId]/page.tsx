import { notFound } from 'next/navigation'
import { createServiceClient as createClient } from '@/lib/supabase-server'
import type { Team, Group } from '@/lib/types'
import { SPORT_ICONS, sportDisplayName } from '@/lib/types'
import Bracket from '@/components/Bracket'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function calcStandings(teams: Team[], matches: any[]) {
  const map = new Map<string, {
    team: Team; played: number; wins: number; draws: number; losses: number
    gf: number; ga: number; points: number; advanced: boolean
  }>()
  for (const t of teams) {
    map.set(t.id, { team: t, played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, points: 0, advanced: false })
  }
  for (const m of matches) {
    if (m.status !== 'completed' || m.team1_score == null || m.team2_score == null) continue
    const t1 = map.get(m.team1_id); const t2 = map.get(m.team2_id)
    if (!t1 || !t2) continue
    t1.played++; t2.played++
    t1.gf += m.team1_score; t1.ga += m.team2_score
    t2.gf += m.team2_score; t2.ga += m.team1_score
    if (m.team1_score > m.team2_score) { t1.wins++; t1.points += 3; t2.losses++ }
    else if (m.team2_score > m.team1_score) { t2.wins++; t2.points += 3; t1.losses++ }
    else { t1.draws++; t1.points++; t2.draws++; t2.points++ }
  }
  const rows = Array.from(map.values())
  rows.sort((a, b) => b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf)
  return rows
}

export default async function SportPage({
  params,
}: {
  params: Promise<{ id: string; sportId: string }>
}) {
  const { id, sportId } = await params
  const supabase = createClient()

  const [{ data: tournament }, { data: sport }, { data: groups }, { data: matches }] =
    await Promise.all([
      supabase.from('tournaments').select('id,name').eq('id', id).single(),
      supabase.from('tournament_sports').select('*').eq('id', sportId).single(),
      supabase.from('groups').select('*').eq('sport_id', sportId).order('name'),
      supabase.from('matches')
        .select('*, team1:team1_id(*), team2:team2_id(*), winner:winner_id(*)')
        .eq('sport_id', sportId)
        .order('stage').order('round').order('match_number'),
    ])

  if (!tournament || !sport) notFound()

  const groupList: Group[] = groups ?? []
  const allMatches: any[] = matches ?? []

  const groupTeamMap = new Map<string, Team[]>()
  if (groupList.length > 0) {
    const { data: groupTeams } = await supabase
      .from('group_teams')
      .select('*, team:team_id(*)')
      .in('group_id', groupList.map(g => g.id))
    for (const gt of groupTeams ?? []) {
      if (!groupTeamMap.has(gt.group_id)) groupTeamMap.set(gt.group_id, [])
      groupTeamMap.get(gt.group_id)!.push(gt.team as Team)
    }
  }

  const groupMatches = allMatches.filter(m => m.stage === 'group')
  const knockoutMatches = allMatches.filter(m => m.stage === 'knockout')
  const totalKnockoutRounds = knockoutMatches.length ? Math.max(...knockoutMatches.map(m => m.round)) : 0

  const roundLabel = (r: number) => {
    if (r === totalKnockoutRounds) return 'Финал'
    if (r === totalKnockoutRounds - 1) return 'Хагас финал'
    if (r === totalKnockoutRounds - 2) return 'Улирал финал'
    return `${r}-р шат`
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-10">

      {/* Header */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link href={`/t/${id}`} className="text-muted hover:text-foreground transition-colors text-sm shrink-0">
          ← {tournament.name}
        </Link>
        <div className="h-4 w-px bg-border shrink-0" />
        <span className="text-xl shrink-0">{SPORT_ICONS[sport.sport_type] ?? '🏅'}</span>
        <h1 className="text-xl font-extrabold">{sportDisplayName(sport)}</h1>
        {sport.gender && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
            sport.gender === 'male' ? 'bg-blue-500/20 text-blue-400' : 'bg-pink-500/20 text-pink-400'
          }`}>
            {sport.gender === 'male' ? '♂' : '♀'}
          </span>
        )}
        {sport.format === 'groups_knockout' && groupList.length > 0 && (
          <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-xs text-muted">
            {groupList.length} хэсэг
          </span>
        )}
        {knockoutMatches.length > 0 && (
          <a href="#knockout" className="ml-auto text-xs text-muted hover:text-foreground border border-border rounded px-2 py-1 shrink-0">
            Нугалаа ↓
          </a>
        )}
      </div>

      {/* ── GROUP STAGE ── */}
      {groupList.length > 0 && (
        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-muted uppercase tracking-wide text-sm">
            ⊞ Хэсгийн шат
          </h2>

          <div className="space-y-8">
            {groupList.map(group => {
              const teams = groupTeamMap.get(group.id) ?? []
              const gm = groupMatches.filter(m => m.group_id === group.id)
              const standings = calcStandings(teams, gm)
              const advanceCount = group.advance_count ?? 2
              const completedCount = gm.filter(m => m.status === 'completed').length

              return (
                <div key={group.id} className="rounded-xl border border-border bg-surface overflow-hidden">
                  {/* Group header */}
                  <div className="flex items-center gap-3 px-5 py-3 bg-surface-2 border-b border-border">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                      {group.name}
                    </span>
                    <span className="font-bold text-base">Хэсэг {group.name}</span>
                    <span className="ml-auto text-xs text-muted">
                      {completedCount}/{gm.length} тоглолт · дээд {advanceCount} нугалааруу
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">

                    {/* Standings table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm min-w-[360px]">
                        <thead>
                          <tr className="text-xs text-muted border-b border-border/40 bg-surface-2/50">
                            <th className="text-left px-4 py-2 w-6 border-r border-border/30">#</th>
                            <th className="text-left px-4 py-2 border-r border-border/30">Баг</th>
                            <th className="text-center px-2 py-2 border-r border-border/30" title="Тоглолт">Т</th>
                            <th className="text-center px-2 py-2 text-green-400 border-r border-border/30" title="Ялалт">Я</th>
                            <th className="text-center px-2 py-2 text-yellow-400 border-r border-border/30" title="Тэнцэл">Тэ</th>
                            <th className="text-center px-2 py-2 text-red-400 border-r border-border/30" title="Хожигдол">Х</th>
                            <th className="text-center px-2 py-2 text-muted text-xs border-r border-border/30" title="Гол зөрүү">±</th>
                            <th className="text-center px-3 py-2 font-bold text-foreground" title="Оноо">О</th>
                          </tr>
                        </thead>
                        <tbody>
                          {standings.map((s, i) => (
                            <tr
                              key={s.team.id}
                              className={`border-t border-border/30 ${
                                i < advanceCount ? 'bg-primary/5' : 'hover:bg-surface-2/50'
                              }`}
                            >
                              <td className="px-4 py-2.5 text-muted text-xs border-r border-border/20">{i + 1}</td>
                              <td className="px-4 py-2.5 font-medium border-r border-border/20">
                                <div className="flex items-center gap-1.5">
                                  {i < advanceCount && (
                                    <span className="text-xs font-bold text-primary">→</span>
                                  )}
                                  <span className={i < advanceCount ? 'text-foreground' : 'text-muted'}>
                                    {s.team.name}
                                  </span>
                                </div>
                              </td>
                              <td className="text-center px-2 py-2.5 tabular-nums text-muted border-r border-border/20">{s.played}</td>
                              <td className="text-center px-2 py-2.5 tabular-nums text-green-400 font-medium border-r border-border/20">{s.wins}</td>
                              <td className="text-center px-2 py-2.5 tabular-nums text-yellow-400 border-r border-border/20">{s.draws}</td>
                              <td className="text-center px-2 py-2.5 tabular-nums text-red-400 border-r border-border/20">{s.losses}</td>
                              <td className="text-center px-2 py-2.5 tabular-nums text-xs text-muted border-r border-border/20">
                                {s.played > 0 ? `${s.gf}:${s.ga}` : '—'}
                              </td>
                              <td className="text-center px-3 py-2.5 tabular-nums font-bold text-accent text-base">{s.points}</td>
                            </tr>
                          ))}
                          {standings.length === 0 && (
                            <tr><td colSpan={8} className="text-center text-muted text-xs py-6">Баг хуваарилагдаагүй байна</td></tr>
                          )}
                        </tbody>
                      </table>
                      {advanceCount > 0 && standings.length > 0 && (
                        <div className="px-4 py-1.5 text-xs text-muted border-t border-border/30 flex items-center gap-1">
                          <span className="text-primary font-bold">→</span>
                          <span>Нугалааны шатанд гарах</span>
                        </div>
                      )}
                    </div>

                    {/* Match results */}
                    <div className="p-4 space-y-3">
                      <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Тоглолтууд</p>
                      {gm.length === 0 && (
                        <p className="text-xs text-muted italic">Тоглолт байхгүй</p>
                      )}
                      {[...new Set(gm.map(m => m.round))].sort((a, b) => a - b).map(rnd => (
                        <div key={rnd}>
                          <div className="text-xs text-muted mb-1.5">{rnd}-р тойрог</div>
                          <div className="space-y-1.5">
                            {gm.filter(m => m.round === rnd).map((m: any) => {
                              const done = m.status === 'completed'
                              const live = m.status === 'live'
                              return (
                                <div
                                  key={m.id}
                                  className={`rounded-lg px-2 py-2 text-sm border ${
                                    done ? 'border-border/30 bg-surface/30' :
                                    live ? 'border-live/40 bg-live/5' :
                                    'border-border/50 bg-surface-2'
                                  }`}
                                >
                                  <div className="flex items-center gap-1 min-w-0">
                                    <span className={`flex-1 text-right text-xs font-medium min-w-0 leading-tight ${
                                      done && m.winner_id === m.team1_id ? 'text-foreground font-bold' :
                                      done ? 'text-muted' : ''
                                    }`} style={{ wordBreak: 'break-word' }}>
                                      {m.team1?.name ?? 'TBD'}
                                    </span>
                                    <span className={`shrink-0 w-14 text-center text-xs font-bold rounded px-1 py-0.5 ${
                                      done ? 'bg-surface text-foreground' :
                                      live ? 'text-live' : 'text-muted'
                                    }`}>
                                      {done ? `${m.team1_score}–${m.team2_score}` :
                                       live ? '● LIVE' : 'vs'}
                                    </span>
                                    <span className={`flex-1 text-xs font-medium min-w-0 leading-tight ${
                                      done && m.winner_id === m.team2_id ? 'text-foreground font-bold' :
                                      done ? 'text-muted' : ''
                                    }`} style={{ wordBreak: 'break-word' }}>
                                      {m.team2?.name ?? 'TBD'}
                                    </span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── KNOCKOUT STAGE ── */}
      {knockoutMatches.length > 0 && (
        <section id="knockout">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-muted uppercase tracking-wide text-sm">
            ⟁ Нугалааны шат
            {groupList.length > 0 && (
              <span className="text-xs font-normal normal-case text-muted/70 ml-1">
                (хэсэг бүрийн дээд {sport.advance_per_group} баг)
              </span>
            )}
          </h2>

          {/* Round labels */}
          <div className="mb-5 flex flex-wrap gap-2">
            {[...new Set(knockoutMatches.map((m: any) => m.round))].sort((a, b) => a - b).map(r => (
              <span key={r} className="rounded-lg border border-border px-3 py-1 text-xs bg-surface font-medium">
                {roundLabel(r)}
              </span>
            ))}
          </div>

          <Bracket matches={knockoutMatches} totalRounds={totalKnockoutRounds} />
        </section>
      )}

      {groupList.length === 0 && knockoutMatches.length === 0 && (
        <div className="text-center py-24 text-muted">
          <div className="text-5xl mb-4">⏳</div>
          <p className="text-lg font-medium">Тоглолтууд тохируулагдаагүй байна</p>
          <p className="text-sm mt-1">Админ хэсгийн тохиргоог хийнэ үү</p>
        </div>
      )}
    </div>
  )
}
