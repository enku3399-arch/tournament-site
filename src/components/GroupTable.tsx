import type { Group, Team, Match, GroupStanding } from '@/lib/types'

function calcStandings(teams: Team[], matches: Match[], advanceCount: number): GroupStanding[] {
  const map = new Map<string, GroupStanding>()
  for (const t of teams) {
    map.set(t.id, { team: t, played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0, advanced: false })
  }
  for (const m of matches) {
    if (m.status !== 'completed' || m.team1_score == null || m.team2_score == null) continue
    const t1 = map.get(m.team1_id ?? '')
    const t2 = map.get(m.team2_id ?? '')
    if (!t1 || !t2) continue
    t1.played++; t2.played++
    t1.gf += m.team1_score; t1.ga += m.team2_score
    t2.gf += m.team2_score; t2.ga += m.team1_score
    if (m.team1_score > m.team2_score) {
      t1.wins++; t1.points += 3; t2.losses++
    } else if (m.team2_score > m.team1_score) {
      t2.wins++; t2.points += 3; t1.losses++
    } else {
      t1.draws++; t1.points++; t2.draws++; t2.points++
    }
  }
  const rows = Array.from(map.values())
  rows.sort((a, b) => b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf)
  rows.forEach((r, i) => { r.gd = r.gf - r.ga; r.advanced = i < advanceCount })
  return rows
}

export default function GroupTable({
  group, teams, matches, advanceCount, sportUnit
}: {
  group: Group
  teams: Team[]
  matches: Match[]
  advanceCount: number
  sportUnit?: string
}) {
  const standings = calcStandings(teams, matches, advanceCount)
  const hasScores = matches.some(m => m.status === 'completed')

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-surface-2 border-b border-border">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
          {group.name}
        </span>
        <span className="text-sm font-semibold">Хэсэг {group.name}</span>
        <span className="ml-auto text-xs text-muted">Дээд {advanceCount} нугалааруу</span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-muted border-b border-border/40">
            <th className="text-left px-3 py-2 w-6">#</th>
            <th className="text-left px-3 py-2">Баг</th>
            <th className="text-center px-2 py-2" title="Тоглолт">Т</th>
            <th className="text-center px-2 py-2 text-green-400" title="Ялалт">Я</th>
            <th className="text-center px-2 py-2 text-yellow-400" title="Тэнцэл">Тэ</th>
            <th className="text-center px-2 py-2 text-red-400" title="Хожигдол">Х</th>
            {hasScores && <th className="text-center px-2 py-2" title="Оноо харьцаа">+/-</th>}
            <th className="text-center px-2 py-2 font-bold text-foreground" title="Оноо">О</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => (
            <tr
              key={s.team.id}
              className={`border-t border-border/30 transition-colors ${
                s.advanced
                  ? 'bg-primary/5 hover:bg-primary/10'
                  : 'hover:bg-surface-2/50'
              }`}
            >
              <td className="px-3 py-2.5 text-muted text-xs">{i + 1}</td>
              <td className="px-3 py-2.5 font-medium">
                <div className="flex items-center gap-1.5">
                  {s.advanced && (
                    <span className="text-xs font-bold text-primary" title="Нугалааны шатанд гарна">→</span>
                  )}
                  <span className={s.advanced ? 'text-foreground' : 'text-muted'}>
                    {s.team.name.replace(' аймаг', '')}
                  </span>
                </div>
              </td>
              <td className="text-center px-2 py-2.5 tabular-nums">{s.played}</td>
              <td className="text-center px-2 py-2.5 tabular-nums text-green-400 font-medium">{s.wins}</td>
              <td className="text-center px-2 py-2.5 tabular-nums text-yellow-400">{s.draws}</td>
              <td className="text-center px-2 py-2.5 tabular-nums text-red-400">{s.losses}</td>
              {hasScores && (
                <td className="text-center px-2 py-2.5 tabular-nums text-xs text-muted">
                  {s.gf > 0 ? `${s.gf}:${s.ga}` : '—'}
                </td>
              )}
              <td className="text-center px-2 py-2.5 tabular-nums font-bold text-accent">{s.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {advanceCount > 0 && (
        <div className="px-3 py-1.5 text-xs text-muted border-t border-border/30 flex items-center gap-1">
          <span className="text-primary font-bold">→</span>
          <span>Нугалааны шатанд гарах</span>
          {sportUnit && <span className="ml-auto">{sportUnit}</span>}
        </div>
      )}
    </div>
  )
}
