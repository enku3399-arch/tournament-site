'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { SPORT_ICONS } from '@/lib/types'

const JUDGE_CODES = [
  { code: 'BASKET-M', label: 'Сагсан бөмбөг (Эрэгтэй)', icon: '🏀', venue: 'Гол заал' },
  { code: 'BASKET-F', label: 'Сагсан бөмбөг (Эмэгтэй)', icon: '🏀', venue: 'Жижиг заал' },
  { code: 'VOLLEY-M', label: 'Волейбол (Эрэгтэй)',       icon: '🏐', venue: 'Гол заал' },
  { code: 'VOLLEY-F', label: 'Волейбол (Эмэгтэй)',       icon: '🏐', venue: 'Жижиг заал' },
  { code: 'TENNIS',   label: 'Ширээний теннис',          icon: '🏓', venue: '' },
  { code: 'DARTS',    label: 'Дартс',                    icon: '🎯', venue: '' },
  { code: 'CHESS',    label: 'Шатар',                    icon: '♟️', venue: '' },
]

const ROUND_LABELS: Record<number, string> = {
  1: 'Финал', 2: 'Хагас финал', 3: '¼ Финал', 4: 'Эхний шат',
}

function statusLabel(s: string) {
  if (s === 'live') return { text: '● LIVE', cls: 'text-live' }
  if (s === 'completed') return { text: '✓ Дууссан', cls: 'text-muted' }
  return { text: '⏰ Хүлээгдэж буй', cls: 'text-accent' }
}

function fmtTime(dt: string | null) {
  if (!dt) return ''
  return new Date(dt).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })
}

function MatchCard({ match, code }: { match: any; code: string }) {
  const sport = match.sport as any
  const group = match.group as any
  const team1 = match.team1 as any
  const team2 = match.team2 as any
  const winner = match.winner as any
  const st = statusLabel(match.status)

  return (
    <Link
      href={`/judge/${match.id}?code=${code}`}
      className={`block rounded-xl border p-4 transition-all hover:scale-[1.01] ${
        match.status === 'live'
          ? 'border-live/40 bg-live/5 hover:border-live/60'
          : match.status === 'completed'
          ? 'border-border bg-surface opacity-70 hover:opacity-100'
          : 'border-border bg-surface hover:border-primary/40 hover:bg-surface-2'
      }`}
    >
      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="flex items-center gap-2 text-xs text-muted flex-wrap min-w-0">
          {group && (
            <span className="rounded-full bg-surface-2 px-2 py-0.5 font-semibold shrink-0">
              Хэсэг {group.name}
            </span>
          )}
          {match.stage === 'knockout' && (
            <span className="rounded-full bg-surface-2 px-2 py-0.5 font-semibold text-accent shrink-0">
              {ROUND_LABELS[match.round] ?? `${match.round}-р шат`}
            </span>
          )}
          <span className="shrink-0">#{match.match_number}</span>
          {match.scheduled_at && (
            <span className="text-muted/70 shrink-0">🕐 {fmtTime(match.scheduled_at)}</span>
          )}
        </div>
        <span className={`text-xs font-bold ${st.cls} shrink-0`}>{st.text}</span>
      </div>

      <div className="flex items-center gap-3">
        <TeamBlock name={team1?.name ?? 'TBD'} score={match.team1_score} isWinner={winner?.id === team1?.id} />
        <span className="shrink-0 text-lg font-bold text-muted">—</span>
        <TeamBlock name={team2?.name ?? 'TBD'} score={match.team2_score} isWinner={winner?.id === team2?.id} />
      </div>
    </Link>
  )
}

function TeamBlock({ name, score, isWinner }: { name: string; score: number | null; isWinner: boolean }) {
  return (
    <div className={`flex-1 text-center ${isWinner ? 'text-live' : ''}`}>
      <div className={`text-2xl font-black tabular-nums ${score === null ? 'text-muted' : ''}`}>
        {score === null ? '–' : score}
      </div>
      <div className="text-xs leading-tight mt-1 line-clamp-2">{name}</div>
    </div>
  )
}

// ── GROUP STANDINGS ──────────────────────────────────────────────────

type StandingRow = {
  id: string; name: string
  played: number; wins: number; losses: number
  gf: number; ga: number; pts: number
}

function computeGroupStandings(matches: any[]): Array<{ name: string; rows: StandingRow[] }> {
  const groups: Record<string, Record<string, StandingRow>> = {}
  const order: string[] = []

  for (const m of matches.filter(m => m.stage === 'group')) {
    const gn = m.group?.name ?? '?'
    if (!groups[gn]) { groups[gn] = {}; order.push(gn) }
    const ensure = (t: any) => {
      if (t && !groups[gn][t.id])
        groups[gn][t.id] = { id: t.id, name: t.name, played: 0, wins: 0, losses: 0, gf: 0, ga: 0, pts: 0 }
    }
    ensure(m.team1); ensure(m.team2)

    if (m.status === 'completed' && m.team1 && m.team2) {
      const s1 = m.team1_score ?? 0, s2 = m.team2_score ?? 0
      const r1 = groups[gn][m.team1.id], r2 = groups[gn][m.team2.id]
      r1.played++; r2.played++
      r1.gf += s1; r1.ga += s2; r2.gf += s2; r2.ga += s1
      if (s1 > s2) { r1.wins++; r2.losses++; r1.pts += 2 }
      else if (s2 > s1) { r2.wins++; r1.losses++; r2.pts += 2 }
      else { r1.pts++; r2.pts++ }
    }
  }

  return order.map(gn => ({
    name: gn,
    rows: Object.values(groups[gn]).sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts
      const gdA = a.gf - a.ga, gdB = b.gf - b.ga
      if (gdB !== gdA) return gdB - gdA
      return b.gf - a.gf
    }),
  }))
}

function StandingsView({ matches }: { matches: any[] }) {
  const standings = computeGroupStandings(matches)

  if (standings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted">
        <p className="text-2xl mb-2">⊞</p>
        <p>Хэсгийн тоглолт байхгүй байна</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {standings.map(group => (
        <div key={group.name} className="rounded-xl border border-border overflow-hidden">
          <div className="bg-surface-2 px-4 py-2.5 flex items-center gap-2 border-b border-border">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              {group.name}
            </span>
            <span className="font-semibold text-sm">Хэсэг {group.name}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-2/50 text-muted">
                  <th className="text-left px-3 py-2 font-medium">#</th>
                  <th className="text-left px-3 py-2 font-medium">Баг</th>
                  <th className="text-center px-2 py-2 font-medium">Т</th>
                  <th className="text-center px-2 py-2 font-medium">Я</th>
                  <th className="text-center px-2 py-2 font-medium">Х</th>
                  <th className="text-center px-2 py-2 font-medium">ОО</th>
                  <th className="text-center px-2 py-2 font-medium">ОА</th>
                  <th className="text-center px-2 py-2 font-bold text-foreground">Оноо</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {group.rows.map((row, i) => (
                  <tr key={row.id} className={i === 0 && row.played > 0 ? 'bg-live/5' : ''}>
                    <td className="px-3 py-2.5 text-muted">{i + 1}</td>
                    <td className="px-3 py-2.5 font-medium">{row.name}</td>
                    <td className="text-center px-2 py-2.5 text-muted">{row.played}</td>
                    <td className="text-center px-2 py-2.5 text-live font-semibold">{row.wins}</td>
                    <td className="text-center px-2 py-2.5 text-muted">{row.losses}</td>
                    <td className="text-center px-2 py-2.5">{row.gf}</td>
                    <td className="text-center px-2 py-2.5">{row.ga}</td>
                    <td className="text-center px-2 py-2.5 font-bold text-accent">{row.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 border-t border-border bg-surface-2/30 flex gap-3 text-xs text-muted flex-wrap">
            <span>Т=Тоглосон</span>
            <span>Я=Ялалт</span>
            <span>Х=Хожигдол</span>
            <span>ОО=Оруулсан оноо</span>
            <span>ОА=Авсан оноо</span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── KNOCKOUT BRACKET ─────────────────────────────────────────────────

function BracketView({ matches }: { matches: any[] }) {
  const knockout = matches.filter(m => m.stage === 'knockout' || m.stage === 'third')

  if (knockout.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted">
        <p className="text-2xl mb-2">⟁</p>
        <p>Нугалааны тоглолт байхгүй байна</p>
      </div>
    )
  }

  const byRound = knockout.filter(m => m.stage === 'knockout').reduce<Record<number, any[]>>((acc, m) => {
    if (!acc[m.round]) acc[m.round] = []
    acc[m.round].push(m)
    return acc
  }, {})
  const thirdMatch = knockout.find(m => m.stage === 'third')
  const rounds = Object.keys(byRound).map(Number).sort((a, b) => b - a)

  return (
    <div className="space-y-4">
      {rounds.map(round => {
        const roundMatches = byRound[round].sort((a: any, b: any) => a.match_number - b.match_number)
        const label = ROUND_LABELS[round] ?? `${round}-р шат`
        return (
          <div key={round} className="rounded-xl border border-border overflow-hidden">
            <div className="bg-surface-2 px-4 py-2.5 border-b border-border flex items-center gap-2">
              <span className="font-semibold text-sm">⟁ {label}</span>
              <span className="text-xs text-muted">({roundMatches.length} тоглолт)</span>
            </div>
            <div className="divide-y divide-border">
              {roundMatches.map((m: any) => {
                const isDone = m.status === 'completed'
                const isLive = m.status === 'live'
                const t1Win = isDone && m.winner?.id === m.team1?.id
                const t2Win = isDone && m.winner?.id === m.team2?.id
                const s1 = m.team1_score
                const s2 = m.team2_score

                return (
                  <Link key={m.id} href={`/judge/${m.id}?code=${m.judge_code}`}
                    className="block px-4 py-3 hover:bg-surface-2 transition-colors">
                    <div className="flex items-center gap-2 mb-1.5 text-xs text-muted">
                      <span className="shrink-0">#{m.match_number}</span>
                      {m.scheduled_at && <span className="shrink-0">🕐 {fmtTime(m.scheduled_at)}</span>}
                      {isLive && <span className="text-live font-bold shrink-0">● LIVE</span>}
                      {isDone && <span className="text-primary shrink-0">✓ Дууссан</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`flex-1 text-right text-sm font-medium leading-tight ${t1Win ? 'text-live font-bold' : ''}`}
                        style={{ wordBreak: 'break-word' }}>
                        {m.team1?.name ?? 'TBD'}
                      </span>
                      <span className="shrink-0 w-20 text-center text-sm font-bold bg-surface-2 rounded px-2 py-1 tabular-nums">
                        {isDone ? `${s1} : ${s2}` : isLive ? `${s1 ?? 0} : ${s2 ?? 0}` : 'vs'}
                      </span>
                      <span className={`flex-1 text-left text-sm font-medium leading-tight ${t2Win ? 'text-live font-bold' : ''}`}
                        style={{ wordBreak: 'break-word' }}>
                        {m.team2?.name ?? 'TBD'}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* 3-р байр */}
      {thirdMatch && (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="bg-surface-2 px-4 py-2.5 border-b border-border flex items-center gap-2">
            <span className="font-semibold text-sm">🥉 3-р байр</span>
          </div>
          {(() => {
            const m = thirdMatch
            const isDone = m.status === 'completed'
            const isLive = m.status === 'live'
            const t1Win = isDone && m.winner?.id === m.team1?.id
            const t2Win = isDone && m.winner?.id === m.team2?.id
            return (
              <Link href={`/judge/${m.id}?code=${m.judge_code}`} className="block px-4 py-3 hover:bg-surface-2 transition-colors">
                <div className="flex items-center gap-2">
                  <span className={`flex-1 text-right text-sm font-medium ${t1Win ? 'text-live font-bold' : ''}`}>{m.team1?.name ?? 'TBD'}</span>
                  <span className="shrink-0 w-20 text-center text-sm font-bold bg-surface-2 rounded px-2 py-1 tabular-nums">
                    {isDone ? `${m.team1_score} : ${m.team2_score}` : isLive ? `${m.team1_score ?? 0} : ${m.team2_score ?? 0}` : 'vs'}
                  </span>
                  <span className={`flex-1 text-left text-sm font-medium ${t2Win ? 'text-live font-bold' : ''}`}>{m.team2?.name ?? 'TBD'}</span>
                </div>
              </Link>
            )
          })()}
        </div>
      )}
    </div>
  )
}

// ── TAB BUTTON ───────────────────────────────────────────────────────

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors shrink-0 ${
        active ? 'border-primary text-foreground' : 'border-transparent text-muted hover:text-foreground'
      }`}
    >
      {children}
    </button>
  )
}

// ── STAT BOX ─────────────────────────────────────────────────────────

function StatBox({ value, label, color, active, onClick }: {
  value: number; label: string; color: string; active: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border p-3 text-center transition-all cursor-pointer ${
        active ? 'border-primary bg-primary/10' : 'border-border bg-surface hover:border-border/60'
      }`}
    >
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-muted mt-0.5">{label}</div>
    </button>
  )
}

// ── SPORT CONFIG VIEW ─────────────────────────────────────────────────

function SportConfigView({ sportId, tournamentId, judgeCode, onGenerated }: { sportId: string; tournamentId: string; judgeCode: string; onGenerated?: () => void }) {
  const [teams, setTeams] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [assignments, setAssignments] = useState<Map<string, string>>(new Map())
  const [groupCount, setGroupCount] = useState(4)
  const [advanceCount, setAdvanceCount] = useState(2)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [msg, setMsg] = useState('')
  const [subTab, setSubTab] = useState<'teams' | 'config'>('teams')

  const loadData = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const [teamsRes, groupsRes, gtRes] = await Promise.all([
        fetch(`/api/admin/sport/${sportId}/teams`).then(r => r.json()),
        fetch(`/api/admin/sport/${sportId}/groups`).then(r => r.json()),
        fetch(`/api/admin/sport/${sportId}/group-teams`).then(r => r.json()),
      ])
      if (teamsRes.error) throw new Error('Teams: ' + teamsRes.error)
      if (groupsRes.error) throw new Error('Groups: ' + groupsRes.error)
      setTeams(teamsRes.teams ?? [])
      const gs: any[] = groupsRes.groups ?? []
      setGroups(gs)
      if (gs.length) { setGroupCount(gs.length); setAdvanceCount(gs[0].advance_count ?? 2) }
      const gts: any[] = gtRes.groupTeams ?? []
      if (gts.length && gs.length) {
        const map = new Map<string, string>()
        for (const gt of gts) {
          const g = gs.find((g: any) => g.id === gt.group_id)
          if (g) map.set(gt.team_id, g.name)
        }
        setAssignments(map)
      }
    } catch (e: any) {
      setLoadError(e.message ?? 'Өгөгдөл ачаалахад алдаа гарлаа')
    }
    setLoading(false)
  }, [sportId])

  useEffect(() => { loadData() }, [loadData])

  const letters = Array.from({ length: groupCount }, (_, i) => String.fromCharCode(65 + i))

  function assignTeam(teamId: string, letter: string) {
    setAssignments(prev => { const next = new Map(prev); if (letter === '') next.delete(teamId); else next.set(teamId, letter); return next })
  }

  function randomDistribute() {
    const shuffled = [...teams].sort(() => Math.random() - 0.5)
    const map = new Map<string, string>()
    shuffled.forEach((t, i) => { map.set(t.id, letters[i % groupCount]) })
    setAssignments(map)
  }

  async function saveConfig() {
    setSaving(true); setMsg('')
    try {
      const res = await fetch(`/api/admin/sport/${sportId}/groups/config`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tournamentId, groupCount, advanceCount, assignments: Object.fromEntries(assignments) }),
      })
      const data = await res.json()
      if (data.ok) { setMsg('✅ Хадгалагдлаа'); if (data.groups) setGroups(data.groups) }
      else setMsg('❌ ' + (data.error ?? 'Алдаа'))
    } catch (e: any) { setMsg('❌ ' + e.message) }
    setSaving(false)
  }

  async function generateGroupMatches() {
    setGenerating(true); setMsg('')
    try {
      const res = await fetch(`/api/admin/sport/${sportId}/groups/generate-matches`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tournamentId, judgeCode }),
      })
      const data = await res.json()
      setMsg(data.ok ? `✅ ${data.count} тоглолт үүсгэлээ` : '❌ ' + (data.error ?? 'Алдаа'))
      if (data.ok) onGenerated?.()
    } catch (e: any) { setMsg('❌ ' + e.message) }
    setGenerating(false)
  }

  async function generateKnockout() {
    setGenerating(true); setMsg('')
    try {
      // 6 хэсгийн тусгай bracket (A1vF2, B1vC2, C1vD2, D1vE2, E1vB2, F1vA2)
      const res = await fetch(`/api/admin/sport/${sportId}/groups/generate-bracket-12`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tournamentId, judgeCode }),
      })
      const data = await res.json()
      setMsg(data.ok ? `✅ Нугалааны ${data.count} тоглолт үүсгэлээ` : '❌ ' + (data.error ?? 'Алдаа'))
      if (data.ok) onGenerated?.()
    } catch (e: any) { setMsg('❌ ' + e.message) }
    setGenerating(false)
  }

  if (loading) return <div className="rounded-xl border border-border p-10 text-center text-muted">⏳ Ачаалж байна...</div>
  if (loadError) return (
    <div className="rounded-xl border border-danger/30 bg-danger/10 p-6 space-y-3">
      <p className="text-sm text-danger font-semibold">Өгөгдөл ачаалахад алдаа гарлаа</p>
      <p className="text-xs text-muted font-mono">{loadError}</p>
      <button type="button" onClick={loadData} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface-2 transition-colors">
        ↩ Дахин оролдох
      </button>
    </div>
  )

  const unassigned = teams.filter(t => !assignments.has(t.id))
  const letterTeamMap = new Map<string, any[]>()
  for (const [teamId, letter] of assignments) {
    const team = teams.find(t => t.id === teamId)
    if (!team) continue
    if (!letterTeamMap.has(letter)) letterTeamMap.set(letter, [])
    letterTeamMap.get(letter)!.push(team)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1 border-b border-border overflow-x-auto -mx-1 px-1">
        <TabButton active={subTab === 'teams'} onClick={() => setSubTab('teams')}>
          👥 Багийн жагсаалт ({teams.length})
        </TabButton>
        <TabButton active={subTab === 'config'} onClick={() => setSubTab('config')}>
          ⚙️ Хэсэг тохируулах
        </TabButton>
      </div>

      {msg && (
        <div className={`rounded-lg px-4 py-2 text-sm border ${msg.startsWith('✅') ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
          {msg}
        </div>
      )}

      {/* ── TEAMS LIST ── */}
      {subTab === 'teams' && (
        <div className="space-y-2">
          <p className="text-xs text-muted">Энэ спортод бүртгэгдсэн {teams.length} баг</p>
          {teams.length === 0
            ? <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted">Баг бүртгэгдээгүй байна</div>
            : <div className="space-y-1">
                {teams.map((team, i) => (
                  <div key={team.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5">
                    <span className="text-xs text-muted w-6 shrink-0 tabular-nums">{i + 1}</span>
                    <span className="flex-1 text-sm font-medium">{team.name}</span>
                    {assignments.has(team.id)
                      ? <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 font-semibold shrink-0">Хэсэг {assignments.get(team.id)}</span>
                      : <span className="text-xs text-muted/50 italic shrink-0">хуваарилагдаагүй</span>
                    }
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {/* ── CONFIG ── */}
      {subTab === 'config' && (
        <div className="space-y-4">
          {/* Group settings */}
          <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
            <h3 className="font-semibold text-sm">Хэсгийн тохиргоо</h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1">
                <span className="text-xs text-muted">Хэсгийн тоо</span>
                <input type="number" min={2} max={20} value={groupCount}
                  onChange={e => setGroupCount(Math.max(2, Math.min(20, +e.target.value || 2)))}
                  className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm" />
                {teams.length > 0 && <p className="text-xs text-muted">{Math.ceil(teams.length / groupCount)} баг/хэсэг</p>}
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted">Нугалааруу гарах</span>
                <input type="number" min={1} max={10} value={advanceCount}
                  onChange={e => setAdvanceCount(Math.max(1, Math.min(10, +e.target.value || 1)))}
                  className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm" />
                <p className="text-xs text-muted">Нийт {groupCount * advanceCount} баг</p>
              </label>
            </div>
          </div>

          {/* Team assignment */}
          <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Хэсгийн хуваарилалт</h3>
              <button type="button" onClick={randomDistribute}
                className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-surface-2 transition-colors">
                🎲 Санамсаргүй
              </button>
            </div>

            {/* Group preview columns */}
            <div className={`grid gap-2 ${groupCount <= 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3'}`}>
              {letters.map(letter => {
                const gTeams = letterTeamMap.get(letter) ?? []
                return (
                  <div key={letter} className="rounded-lg border border-border bg-surface-2 p-2.5">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{letter}</span>
                      <span className="text-xs font-semibold">Хэсэг {letter}</span>
                      <span className="ml-auto text-xs text-muted">{gTeams.length}</span>
                    </div>
                    <div className="space-y-0.5">
                      {gTeams.map(t => <div key={t.id} className="text-xs text-muted bg-surface rounded px-1.5 py-0.5 leading-tight truncate">{t.name}</div>)}
                      {gTeams.length === 0 && <p className="text-xs text-muted/40 italic">Хоосон</p>}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Per-team dropdowns */}
            <div className="space-y-1.5">
              {teams.map(team => (
                <div key={team.id} className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2">
                  <span className="flex-1 text-sm font-medium min-w-0 truncate">{team.name}</span>
                  <select value={assignments.get(team.id) ?? ''} onChange={e => assignTeam(team.id, e.target.value)}
                    className="rounded border border-border bg-surface px-2 py-1 text-xs shrink-0">
                    <option value="">— хэсэг</option>
                    {letters.map(l => <option key={l} value={l}>Хэсэг {l}</option>)}
                  </select>
                </div>
              ))}
            </div>
            {unassigned.length > 0 && <p className="text-xs text-yellow-400">⚠️ {unassigned.length} баг хэсэгт ороогүй байна</p>}
          </div>

          {/* Action buttons */}
          <div className="space-y-2">
            <button type="button" onClick={saveConfig} disabled={saving}
              className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white disabled:opacity-40 hover:bg-primary-hover transition-colors">
              {saving ? 'Хадгалж байна...' : '💾 Тохиргоо хадгалах'}
            </button>
            <button type="button" onClick={generateGroupMatches} disabled={generating || groups.length === 0}
              className="w-full rounded-xl border border-green-500/50 bg-green-500/10 py-3 text-sm font-semibold text-green-400 disabled:opacity-40 hover:bg-green-500/20 transition-colors">
              {generating ? 'Үүсгэж байна...' : '⊞ Хэсгийн тоглолт үүсгэх'}
            </button>
            <button type="button" onClick={generateKnockout} disabled={generating || groups.length === 0}
              className="w-full rounded-xl border border-accent/50 bg-accent/10 py-3 text-sm font-semibold text-accent disabled:opacity-40 hover:bg-accent/20 transition-colors">
              {generating ? 'Үүсгэж байна...' : '⟁ Нугалааны bracket үүсгэх'}
            </button>
            {groups.length === 0 && <p className="text-xs text-muted text-center">⚠️ Эхлээд тохиргоог хадгална уу</p>}
          </div>
        </div>
      )}
    </div>
  )
}

// ── JUDGE CODE → SPORT MAPPING (тоглолт үүсэхээс өмнө ч ажиллана) ──────────
const JUDGE_CODE_MAP: Record<string, { sportId: string; tournamentId: string }> = {
  'BASKET-M': { sportId: '771904c0-f0c9-4b53-a631-f82cecfde598', tournamentId: '0b05625d-2f6d-48de-b69c-d5a23c2f0e3f' },
  'BASKET-F': { sportId: '875a61c1-6c97-4dca-96a0-dd0bcf9b2cc3', tournamentId: '0b05625d-2f6d-48de-b69c-d5a23c2f0e3f' },
  'VOLLEY-M': { sportId: '11a8b935-744d-4032-8280-6ef97ad5a9db', tournamentId: '0b05625d-2f6d-48de-b69c-d5a23c2f0e3f' },
  'VOLLEY-F': { sportId: '92dfbd70-204d-4293-985f-b2e49e35c526', tournamentId: '0b05625d-2f6d-48de-b69c-d5a23c2f0e3f' },
  'TENNIS':   { sportId: '094da6e9-660d-4646-b149-7a4cbd8f55a0', tournamentId: '0b05625d-2f6d-48de-b69c-d5a23c2f0e3f' },
  'DARTS':    { sportId: 'b0b7ca49-82fb-440f-8e9a-19fdbf1f6d11', tournamentId: '0b05625d-2f6d-48de-b69c-d5a23c2f0e3f' },
  'CHESS':    { sportId: '4b254cc4-16e9-430d-9bf2-0257178db95c', tournamentId: '0b05625d-2f6d-48de-b69c-d5a23c2f0e3f' },
}

// ── MAIN ─────────────────────────────────────────────────────────────

function JudgePortalInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlCode = searchParams?.get('code') ?? ''

  const [code, setCode] = useState(urlCode)
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const [filter, setFilter] = useState<'all' | 'live' | 'scheduled' | 'completed'>('all')
  const [viewTab, setViewTab] = useState<'matches' | 'standings' | 'bracket' | 'config'>('config')
  const [sportId, setSportId] = useState<string | null>(null)
  const [tournamentId, setTournamentId] = useState<string | null>(null)

  const fetchMatches = useCallback(async (c: string) => {
    if (!c.trim()) return
    setLoading(true)
    setError(null)
    setSearched(true)
    try {
      const res = await fetch(`/api/judge?code=${encodeURIComponent(c.trim())}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Алдаа гарлаа')
      const ms: any[] = data.matches ?? []
      setMatches(ms)
      const first = ms[0]
      if (first) {
        setSportId(first.sport?.id ?? null)
        setTournamentId(first.tournament_id ?? null)
        setViewTab('matches')
      } else {
        // Тоглолт үүсэхээс өмнө — hardcoded mapping ашиглана
        const mapped = JUDGE_CODE_MAP[c.trim().toUpperCase()]
        if (mapped) {
          setSportId(mapped.sportId)
          setTournamentId(mapped.tournamentId)
          setViewTab('config')
        }
      }
    } catch (e: any) {
      setError(e.message)
      setMatches([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (urlCode) { setCode(urlCode); fetchMatches(urlCode) }
  }, [urlCode, fetchMatches])

  // Auto-refresh every 30s while there are live matches
  useEffect(() => {
    if (!searched || !matches.some(m => m.status === 'live')) return
    const id = setInterval(() => fetchMatches(code), 30000)
    return () => clearInterval(id)
  }, [searched, matches, code, fetchMatches])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    router.replace(`/judge?code=${encodeURIComponent(code.trim())}`)
    fetchMatches(code.trim())
  }

  const filtered = matches.filter(m => filter === 'all' ? true : m.status === filter)
  const liveCnt = matches.filter(m => m.status === 'live').length
  const doneCnt = matches.filter(m => m.status === 'completed').length
  const pendCnt = matches.filter(m => m.status === 'scheduled').length
  const groupMatchCount = matches.filter(m => m.stage === 'group').length
  const knockoutMatchCount = matches.filter(m => m.stage === 'knockout' || m.stage === 'third').length

  const bySport = filtered.reduce<Record<string, any[]>>((acc, m) => {
    const key = m.sport?.id ?? 'unknown'
    if (!acc[key]) acc[key] = []
    acc[key].push(m)
    return acc
  }, {})

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="text-4xl mb-3">⚖️</div>
          <h1 className="text-2xl font-extrabold mb-1">Шүүгчийн портал</h1>
          <p className="text-sm" style={{ color: 'var(--fog)' }}>
            Монгол 87/89 ТББ-ийн V Спорт Наадам · 2026
          </p>
        </div>

        {/* Instruction box */}
        <div className="rounded-2xl border mb-5 p-5" style={{ borderColor: 'var(--line)', background: 'var(--ink-3)' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--gold)' }}>
            Шүүгчийн кодыг хэрхэн авах вэ?
          </p>
          <ol className="space-y-2 text-sm" style={{ color: 'var(--fog)' }}>
            <li className="flex gap-2">
              <span className="font-bold shrink-0" style={{ color: 'var(--gold)' }}>1.</span>
              <span>Та шүүгч хийх спортын товчийг доорх <b style={{ color: 'var(--paper)' }}>«Хурдан сонголт»</b>-оос дарна уу</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold shrink-0" style={{ color: 'var(--gold)' }}>2.</span>
              <span>Эсвэл зохион байгуулагчийн өгсөн кодыг гараар бичиж <b style={{ color: 'var(--paper)' }}>«Нэвтрэх»</b> дарна уу</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold shrink-0" style={{ color: 'var(--gold)' }}>3.</span>
              <span>Тоглолтоо сонгоод дүнг оруулна уу — хадгалагдахад автоматаар шинэчлэгдэнэ</span>
            </li>
          </ol>
          <div className="mt-3 pt-3 flex flex-wrap gap-3 text-xs" style={{ borderTop: '1px solid var(--line)', color: 'var(--fog-2)' }}>
            <span>📞 Асуулт байвал: <b style={{ color: 'var(--paper)' }}>+976 9911 0000</b></span>
            <span>🏟️ Заал: <b style={{ color: 'var(--paper)' }}>"Буянт Ухаа" спорт ордон</b></span>
          </div>
        </div>

        {/* Code input */}
        <div className="rounded-2xl border mb-6 p-6" style={{ borderColor: 'var(--line)', background: 'var(--ink-2)' }}>
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              className="input font-mono uppercase tracking-widest text-lg flex-1"
              placeholder="Код оруулах… (BASKET-M)"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="rounded-xl px-5 py-2 font-bold disabled:opacity-40 transition-colors"
              style={{ background: 'var(--gold)', color: 'var(--ink)' }}
            >
              {loading ? '...' : 'Нэвтрэх'}
            </button>
          </form>

          <div className="mt-4">
            <p className="text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: 'var(--fog)' }}>
              Хурдан сонголт:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {JUDGE_CODES.map(j => (
                <button
                  key={j.code}
                  onClick={() => {
                    setCode(j.code)
                    router.replace(`/judge?code=${j.code}`)
                    fetchMatches(j.code)
                  }}
                  className="rounded-xl border text-left px-3 py-2.5 transition-all hover:scale-[1.02]"
                  style={code === j.code
                    ? { borderColor: 'var(--gold)', background: 'rgba(200,162,74,0.15)' }
                    : { borderColor: 'var(--line-2)', background: 'var(--ink-3)' }
                  }
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-base">{j.icon}</span>
                    <span className="font-mono font-bold text-xs" style={{ color: code === j.code ? 'var(--gold)' : 'var(--paper)' }}>
                      {j.code}
                    </span>
                  </div>
                  <div className="text-xs leading-tight" style={{ color: 'var(--fog)' }}>
                    {j.label}{j.venue && <span className="ml-1">· {j.venue}</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        {/* Results */}
        {searched && (
          <>
            {/* Initial loading — only before we have any data */}
            {loading && matches.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted">
                <p className="text-3xl mb-3">⏳</p>
                <p className="text-sm">Ачаалж байна...</p>
              </div>
            )}

            {/* Empty result — no matches yet but sport is known → show config */}
            {!loading && matches.length === 0 && !error && sportId && tournamentId && (
              <div className="space-y-3">
                <div className="rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-accent">
                  ⚠️ Тоглолт үүсгэгдээгүй байна — хэсгийн тохиргооноос эхэлнэ үү
                </div>
                <SportConfigView
                  sportId={sportId}
                  tournamentId={tournamentId}
                  judgeCode={code}
                  onGenerated={() => fetchMatches(code)}
                />
              </div>
            )}

            {/* Empty result — unknown code */}
            {!loading && matches.length === 0 && !error && !sportId && (
              <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted">
                <p className="text-3xl mb-3">🔍</p>
                <p>«{code}» кодтой тоглолт олдсонгүй</p>
                <p className="text-xs mt-1">Кодоо дахин шалгана уу</p>
              </div>
            )}

            {/* Main content — keeps mounted during background refresh */}
            {matches.length > 0 && (
              <>
                {/* View tabs */}
                <div className="flex gap-1 border-b border-border mb-4 overflow-x-auto -mx-1 px-1">
                  <TabButton active={viewTab === 'matches'} onClick={() => setViewTab('matches')}>
                    🏅 Тоглолтууд ({matches.length})
                  </TabButton>
                  {groupMatchCount > 0 && (
                    <TabButton active={viewTab === 'standings'} onClick={() => setViewTab('standings')}>
                      ⊞ Хэсгийн хүснэгт
                    </TabButton>
                  )}
                  {knockoutMatchCount > 0 && (
                    <TabButton active={viewTab === 'bracket'} onClick={() => setViewTab('bracket')}>
                      ⟁ Нугалааны схем
                    </TabButton>
                  )}
                  {sportId && tournamentId && (
                    <TabButton active={viewTab === 'config'} onClick={() => setViewTab('config')}>
                      ⚙️ Тохиргоо
                    </TabButton>
                  )}
                </div>

                {viewTab === 'matches' && (
                  <>
                    <div className="mb-4 grid grid-cols-3 gap-3">
                      <StatBox value={pendCnt} label="Хүлээгдэж буй" color="text-accent"
                        active={filter === 'scheduled'} onClick={() => setFilter(f => f === 'scheduled' ? 'all' : 'scheduled')} />
                      <StatBox value={liveCnt} label="LIVE" color="text-live"
                        active={filter === 'live'} onClick={() => setFilter(f => f === 'live' ? 'all' : 'live')} />
                      <StatBox value={doneCnt} label="Дууссан" color="text-muted"
                        active={filter === 'completed'} onClick={() => setFilter(f => f === 'completed' ? 'all' : 'completed')} />
                    </div>

                    {Object.entries(bySport).map(([sid, sportMatches]) => {
                      const sport = (sportMatches[0] as any).sport
                      return (
                        <div key={sid} className="mb-6">
                          <h3 className="mb-3 flex items-center gap-2 font-bold text-sm text-muted">
                            <span>{SPORT_ICONS[sport?.sport_type] ?? '🏅'}</span>
                            <span>{sport?.name ?? 'Тоглолт'}</span>
                            <span className="text-xs font-normal">({sportMatches.length})</span>
                          </h3>
                          <div className="space-y-2">
                            {sportMatches.map(m => <MatchCard key={m.id} match={m} code={code} />)}
                          </div>
                        </div>
                      )
                    })}
                  </>
                )}

                {viewTab === 'standings' && <StandingsView matches={matches} />}
                {viewTab === 'bracket' && <BracketView matches={matches} />}
                {viewTab === 'config' && sportId && tournamentId && (
                  <SportConfigView sportId={sportId} tournamentId={tournamentId} judgeCode={code}
                    onGenerated={() => fetchMatches(code)} />
                )}
              </>
            )}
          </>
        )}

        {!searched && (
          <div className="rounded-2xl border-2 border-dashed p-10 text-center" style={{ borderColor: 'var(--line-2)' }}>
            <p className="text-4xl mb-3">⚖️</p>
            <p className="font-semibold mb-1">Дээрх кодыг сонгоно уу</p>
            <p className="text-xs" style={{ color: 'var(--fog)' }}>
              Шүүгчлэх спортоо «Хурдан сонголт»-оос дарж нэвтэрнэ
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function JudgePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted">Ачаалж байна...</div>}>
      <JudgePortalInner />
    </Suspense>
  )
}
