'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminBracket from '@/components/AdminBracket'

type Team = { id: string; name: string; seed: number | null }
type Group = { id: string; name: string; advance_count: number }
type Match = {
  id: string; match_number: number; round: number; stage: string; status: string
  group_id: string | null; judge_code: string
  court: number; schedule_order: number | null
  team1_source: string | null; team2_source: string | null
  set_scores: [number, number][] | null
  team1: { id: string; name: string } | null
  team2: { id: string; name: string } | null
  winner: { id: string; name: string } | null
  team1_score: number | null; team2_score: number | null
  group: { id: string; name: string } | null
}

export default function GroupConfigPage() {
  const { id, sportId } = useParams<{ id: string; sportId: string }>()
  const router = useRouter()

  const [sport, setSport] = useState<any>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [assignments, setAssignments] = useState<Map<string, string>>(new Map())
  const [matches, setMatches] = useState<Match[]>([])
  const [groupCount, setGroupCount] = useState(4)
  const [advanceCount, setAdvanceCount] = useState(2)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [msg, setMsg] = useState('')
  const [savedOk, setSavedOk] = useState(false)
  const [judgeCode, setJudgeCode] = useState('')
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null)
  const [editingTeamName, setEditingTeamName] = useState('')
  const [activeTab, setActiveTab] = useState<'config' | 'matches' | 'bracket'>('config')
  const [activeCourt, setActiveCourt] = useState<number>(1)
  const [orderDirty, setOrderDirty] = useState(false)
  const [savingOrder, setSavingOrder] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [addingTeam, setAddingTeam] = useState(false)
  const [useTwoCourts, setUseTwoCourts] = useState(true)
  const [directTeamCount, setDirectTeamCount] = useState(8)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkTab, setBulkTab] = useState<'text' | 'tournament'>('text')
  const [bulkText, setBulkText] = useState('')
  const [bulkPreview, setBulkPreview] = useState<string[]>([])
  const [bulkAdding, setBulkAdding] = useState(false)
  const [tournamentTeams, setTournamentTeams] = useState<{ id: string; name: string; sport_name?: string }[]>([])
  const [loadingTt, setLoadingTt] = useState(false)
  const [selectedTIds, setSelectedTIds] = useState<Set<string>>(new Set())

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [sportRes, teamsRes, groupsRes, gtRes, matchesRes] = await Promise.all([
        fetch(`/api/admin/sport/${sportId}`).then(r => r.json()),
        fetch(`/api/admin/sport/${sportId}/teams`).then(r => r.json()),
        fetch(`/api/admin/sport/${sportId}/groups`).then(r => r.json()),
        fetch(`/api/admin/sport/${sportId}/group-teams`).then(r => r.json()),
        fetch(`/api/admin/sport/${sportId}/matches`).then(r => r.json()),
      ])
      setSport(sportRes.sport)
      setTeams(teamsRes.teams ?? [])
      const gs: Group[] = groupsRes.groups ?? []
      setGroups(gs)
      if (gs.length) { setGroupCount(gs.length); setAdvanceCount(gs[0].advance_count) }
      const gts = gtRes.groupTeams ?? []
      if (gts.length > 0 && gs.length > 0) {
        const map = new Map<string, string>()
        for (const gt of gts) {
          const g = gs.find((g: Group) => g.id === gt.group_id)
          if (g) map.set(gt.team_id, g.name)
        }
        setAssignments(map)
      }
      setMatches(matchesRes.matches ?? [])
    } catch (e) { console.error('Load error:', e) }
    setLoading(false)
  }, [sportId])

  useEffect(() => { load() }, [load])

  // Compute group standings from current match results for knockout dropdowns
  const groupStandings = useMemo(() => {
    const standings = new Map<string, { teamId: string; name: string }[]>()
    for (const group of groups) {
      const groupTeamIds: string[] = []
      for (const [teamId, letter] of assignments) {
        if (letter === group.name) groupTeamIds.push(teamId)
      }
      const pts = new Map<string, number>()
      const gd = new Map<string, number>()
      const gf = new Map<string, number>()
      for (const tid of groupTeamIds) { pts.set(tid, 0); gd.set(tid, 0); gf.set(tid, 0) }
      const gms = matches.filter(m => m.group_id === group.id && m.stage === 'group')
      const allDone = gms.length > 0 && gms.every(m => m.status === 'completed')
      if (!allDone) { standings.set(group.name, []); continue }
      for (const m of gms) {
        const t1Id = m.team1?.id; const t2Id = m.team2?.id
        if (!t1Id || !t2Id || m.team1_score == null || m.team2_score == null) continue
        const s1 = m.team1_score; const s2 = m.team2_score
        pts.set(t1Id, (pts.get(t1Id) ?? 0) + (s1 > s2 ? 3 : s1 === s2 ? 1 : 0))
        pts.set(t2Id, (pts.get(t2Id) ?? 0) + (s2 > s1 ? 3 : s1 === s2 ? 1 : 0))
        gd.set(t1Id, (gd.get(t1Id) ?? 0) + s1 - s2)
        gd.set(t2Id, (gd.get(t2Id) ?? 0) + s2 - s1)
        gf.set(t1Id, (gf.get(t1Id) ?? 0) + s1)
        gf.set(t2Id, (gf.get(t2Id) ?? 0) + s2)
      }
      const ranked = [...groupTeamIds].sort((a, b) =>
        ((pts.get(b) ?? 0) - (pts.get(a) ?? 0)) ||
        ((gd.get(b) ?? 0) - (gd.get(a) ?? 0)) ||
        ((gf.get(b) ?? 0) - (gf.get(a) ?? 0))
      )
      standings.set(group.name, ranked.map(tid => ({ teamId: tid, name: teams.find(t => t.id === tid)?.name ?? '' })))
    }
    return standings
  }, [groups, matches, assignments, teams])

  const letters = Array.from({ length: groupCount }, (_, i) => String.fromCharCode(65 + i))
  const canGenerate = savedOk || groups.length > 0
  const sortByOrder = (a: Match, b: Match) =>
    ((a.schedule_order ?? a.match_number) - (b.schedule_order ?? b.match_number))

  const groupMatches = matches.filter(m => m.stage === 'group').sort(sortByOrder)
  const knockoutMatches = matches.filter(m => m.stage === 'knockout').sort(sortByOrder)
  const hasTwoCourts = matches.some(m => m.court === 2)
  const isVolleyball = !!sport?.name?.toLowerCase().includes('волейбол')
  const courtGroupMatches = groupMatches.filter(m => !hasTwoCourts || m.court === activeCourt)
  const courtKnockoutMatches = knockoutMatches.filter(m => !hasTwoCourts || m.court === activeCourt)

  async function addTeam() {
    if (!newTeamName.trim()) return
    setAddingTeam(true)
    try {
      const res = await fetch(`/api/admin/sport/${sportId}/teams`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: newTeamName.trim(), tournamentId: id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTeams(prev => [...prev, data.team])
      setNewTeamName('')
    } catch (e: any) { alert('Алдаа: ' + e.message) }
    setAddingTeam(false)
  }

  async function deleteTeam(teamId: string, teamName: string) {
    if (!confirm(`"${teamName}" багийг устгах уу?`)) return
    try {
      const res = await fetch(`/api/admin/sport/${sportId}/teams?teamId=${teamId}`, { method: 'DELETE' })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      setTeams(prev => prev.filter(t => t.id !== teamId))
      setAssignments(prev => { const next = new Map(prev); next.delete(teamId); return next })
    } catch (e: any) { alert('Алдаа: ' + e.message) }
  }

  async function saveTeamName(teamId: string, name: string) {
    if (!name.trim()) return
    try {
      const res = await fetch(`/api/admin/teams/${teamId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTeams(prev => prev.map(t => t.id === teamId ? { ...t, name: name.trim() } : t))
      // Update match team names too
      setMatches(prev => prev.map(m => ({
        ...m,
        team1: m.team1?.id === teamId ? { ...m.team1, name: name.trim() } : m.team1,
        team2: m.team2?.id === teamId ? { ...m.team2, name: name.trim() } : m.team2,
      })))
    } catch (e: any) { alert('Нэр хадгалахад алдаа: ' + e.message) }
    setEditingTeamId(null)
  }

  async function saveMatchScore(matchId: string, t1: number, t2: number, setScores?: [number, number][]) {
    const body: Record<string, any> = { team1_score: t1, team2_score: t2, finalize: true }
    if (setScores) body.set_scores = setScores
    const res = await fetch(`/api/matches/${matchId}/score`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, ...data, group: m.group } : m))
  }

  function changeMatchOrder(matchId: string, newOrder: number) {
    if (!newOrder || newOrder < 1) return
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, schedule_order: newOrder } : m))
    setOrderDirty(true)
  }

  async function saveOrder() {
    setSavingOrder(true)
    const orders = matches.map(m => ({ id: m.id, schedule_order: m.schedule_order ?? m.match_number }))
    const res = await fetch(`/api/admin/sport/${sportId}/matches/save-order`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ orders }),
    })
    if (res.ok) setOrderDirty(false)
    setSavingOrder(false)
  }

  async function resetMatch(matchId: string) {
    const res = await fetch(`/api/matches/${matchId}/score`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ reset: true }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, ...data, group: m.group } : m))
  }

  async function changeMatchCourt(matchId: string, court: number) {
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, court } : m))
    await fetch(`/api/admin/sport/${sportId}/matches/${matchId}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ court }),
    })
  }

  async function addKnockoutMatch(court: number) {
    try {
      const res = await fetch(`/api/admin/sport/${sportId}/matches`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tournamentId: id, court }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMatches(prev => [...prev, { ...data.match, team1_source: null, team2_source: null }])
    } catch (e: any) { alert('Алдаа: ' + e.message) }
  }

  async function deleteKnockoutMatch(matchId: string) {
    if (!confirm('Энэ тоглолтыг устгах уу?')) return
    try {
      const res = await fetch(`/api/admin/sport/${sportId}/matches/${matchId}`, { method: 'DELETE' })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      setMatches(prev => prev.filter(m => m.id !== matchId))
    } catch (e: any) { alert('Алдаа: ' + e.message) }
  }

  async function handleSourceChange(matchId: string, slot: 'team1' | 'team2', source: string) {
    const resolvedTeam = source ? (() => {
      const [gName, rankStr] = source.split(':')
      const rank = parseInt(rankStr) - 1
      const st = groupStandings.get(gName)
      return st?.[rank] ?? null
    })() : null

    setMatches(prev => prev.map(m => {
      if (m.id !== matchId) return m
      return slot === 'team1'
        ? { ...m, team1_source: source || null, team1: resolvedTeam ? { id: resolvedTeam.teamId, name: resolvedTeam.name } : null }
        : { ...m, team2_source: source || null, team2: resolvedTeam ? { id: resolvedTeam.teamId, name: resolvedTeam.name } : null }
    }))

    await fetch(`/api/admin/sport/${sportId}/matches/${matchId}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        [slot === 'team1' ? 'team1_source' : 'team2_source']: source || null,
        [slot === 'team1' ? 'team1_id' : 'team2_id']: resolvedTeam?.teamId ?? null,
      }),
    })
  }

  async function saveConfig() {
    setSaving(true); setMsg('')
    try {
      const res = await fetch(`/api/admin/sport/${sportId}/groups/config`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tournamentId: id, groupCount, advanceCount, assignments: Object.fromEntries(assignments) }),
      })
      const data = await res.json()
      if (data.ok) { setMsg('✅ Хадгалагдлаа'); setSavedOk(true); if (data.groups) setGroups(data.groups) }
      else setMsg('❌ ' + (data.error ?? 'Алдаа'))
    } catch (e: any) { setMsg('❌ ' + (e.message ?? 'Сүлжээний алдаа')) }
    setSaving(false)
  }

  async function generateGroupMatches() {
    setGenerating(true); setMsg('')
    try {
      const res = await fetch(`/api/admin/sport/${sportId}/groups/generate-matches`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tournamentId: id, judgeCode: judgeCode.trim() || undefined, useTwoCourts }),
      })
      const data = await res.json()
      if (data.ok) { await load(); setActiveTab('matches'); setOrderDirty(false) }
      else { setMsg('❌ ' + (data.error ?? 'Алдаа')); setGenerating(false) }
    } catch (e: any) { setMsg('❌ ' + e.message); setGenerating(false) }
  }

  async function generateDirectKnockout() {
    setGenerating(true); setMsg('')
    try {
      const res = await fetch(`/api/admin/sport/${sportId}/groups/generate-direct-knockout`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tournamentId: id, teamCount: directTeamCount }),
      })
      const data = await res.json()
      setMsg(data.ok ? `✅ ${data.count} тоглолт үүсгэлээ` : '❌ ' + (data.error ?? 'Алдаа'))
      if (data.ok) await load()
    } catch (e: any) { setMsg('❌ ' + e.message) }
    setGenerating(false)
  }

  async function generateKnockout() {
    setGenerating(true); setMsg('')
    try {
      const res = await fetch(`/api/admin/sport/${sportId}/groups/generate-knockout`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tournamentId: id }),
      })
      const data = await res.json()
      setMsg(data.ok ? `✅ Нугалааны ${data.count} тоглолт үүсгэлээ` : '❌ ' + (data.error ?? 'Алдаа'))
      if (data.ok) await load()
    } catch (e: any) { setMsg('❌ ' + e.message) }
    setGenerating(false)
  }

  function assignTeam(teamId: string, letter: string) {
    setAssignments(prev => { const next = new Map(prev); if (letter === '') next.delete(teamId); else next.set(teamId, letter); return next })
  }

  function autoSeed() {
    const sorted = [...teams].sort((a, b) => (a.seed ?? 99) - (b.seed ?? 99))
    const map = new Map<string, string>()
    sorted.forEach((t, i) => { map.set(t.id, letters[i % groupCount]) })
    setAssignments(map)
  }

  function randomDistribute() {
    const shuffled = [...teams].sort(() => Math.random() - 0.5)
    const map = new Map<string, string>()
    shuffled.forEach((t, i) => { map.set(t.id, letters[i % groupCount]) })
    setAssignments(map)
  }

  function closeBulk() {
    setBulkOpen(false); setBulkPreview([]); setBulkText(''); setSelectedTIds(new Set())
  }

  function parseBulkText() {
    const existing = new Set(teams.map(t => t.name.toLowerCase()))
    const names = bulkText.split(/[\n\r,،]/).map(s => s.trim()).filter(Boolean)
    const unique = [...new Set(names)].filter(n => !existing.has(n.toLowerCase()))
    setBulkPreview(unique)
  }

  function removeBulkItem(idx: number) {
    setBulkPreview(prev => prev.filter((_, i) => i !== idx))
  }

  async function loadTournamentTeams() {
    if (tournamentTeams.length || loadingTt) return
    setLoadingTt(true)
    try {
      const res = await fetch(`/api/admin/sport/${sportId}/teams?scope=tournament`)
      const data = await res.json()
      setTournamentTeams(data.teams ?? [])
    } catch {}
    setLoadingTt(false)
  }

  function addSelectedToPreview() {
    const existing = new Set(teams.map(t => t.name.toLowerCase()))
    const selected = tournamentTeams.filter(t => selectedTIds.has(t.id)).map(t => t.name)
    const merged = [...new Set([...bulkPreview, ...selected])].filter(n => !existing.has(n.toLowerCase()))
    setBulkPreview(merged)
    setSelectedTIds(new Set())
    setBulkTab('text')
  }

  async function addBulkTeams() {
    if (!bulkPreview.length) return
    setBulkAdding(true)
    const added: Team[] = []
    for (const name of bulkPreview) {
      try {
        const res = await fetch(`/api/admin/sport/${sportId}/teams`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ name, tournamentId: id }),
        })
        const data = await res.json()
        if (res.ok) added.push(data.team)
      } catch {}
    }
    setTeams(prev => [...prev, ...added])
    setBulkPreview([]); setBulkText(''); setBulkOpen(false)
    setBulkAdding(false)
  }

  if (loading) return <div className="p-8 text-muted">Ачаалж байна...</div>
  if (!sport) return <div className="p-8 text-muted">Спорт олдсонгүй</div>

  const letterTeamMap = new Map<string, Team[]>()
  for (const [teamId, letter] of assignments) {
    const team = teams.find(t => t.id === teamId)
    if (!team) continue
    if (!letterTeamMap.has(letter)) letterTeamMap.set(letter, [])
    letterTeamMap.get(letter)!.push(team)
  }
  const unassigned = teams.filter(t => !assignments.has(t.id))

  // Group IDs from matches
  const groupIds = [...new Map(groupMatches.map(m => [m.group_id, m.group])).entries()]

  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link href={`/admin/${id}`} className="text-muted hover:text-foreground text-sm shrink-0">← Буцах</Link>
        <div className="h-4 w-px bg-border shrink-0" />
        <h1 className="text-lg font-bold">⊞ {sport.name}</h1>
        <Link href={`/t/${id}/${sportId}`} target="_blank" className="ml-auto text-xs text-muted hover:text-foreground border border-border rounded px-2 py-1 shrink-0">
          Нийтийн →
        </Link>
      </div>

      {msg && (
        <div className={`rounded-lg px-4 py-2 text-sm ${msg.startsWith('✅') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {[
          { key: 'config', label: '⊞ Хэсгийн тохиргоо' },
          { key: 'matches', label: `🏅 Тоглолтуудын дүн${matches.length > 0 ? ` (${matches.length})` : ''}` },
        { key: 'bracket', label: `⟁ Нугалааны схем${knockoutMatches.length > 0 ? ` (${knockoutMatches.length})` : ''}` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? 'border-primary text-foreground' : 'border-transparent text-muted hover:text-foreground'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── CONFIG TAB ── */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          {/* Team management */}
          <div className="rounded-xl border border-border bg-surface p-5 space-y-3">
            <h2 className="font-semibold">Багуудын удирдлага</h2>

            {/* Add team */}
            <div className="flex gap-2">
              <input
                className="input flex-1 text-sm"
                placeholder="Шинэ багийн нэр..."
                value={newTeamName}
                onChange={e => setNewTeamName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTeam()}
              />
              <button
                onClick={addTeam}
                disabled={addingTeam || !newTeamName.trim()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-40 transition-colors shrink-0"
              >
                {addingTeam ? '...' : '+ Нэмэх'}
              </button>
              <button
                onClick={() => { setBulkOpen(v => !v); setBulkPreview([]); setBulkText('') }}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors shrink-0 ${bulkOpen ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted hover:text-foreground'}`}
              >
                📋 Бөөнөөр
              </button>
            </div>

            {/* Bulk import panel */}
            {bulkOpen && (
              <div className="rounded-lg border border-primary/30 bg-surface-2 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Бөөнөөр оруулах</p>
                  <button onClick={closeBulk} className="text-xs text-muted hover:text-foreground transition-colors">✕ Хаах</button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-border">
                  {[
                    { key: 'text', label: '📝 Нэр оруулах' },
                    { key: 'tournament', label: '🏆 Тэмцээний оролцогчид' },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => { setBulkTab(tab.key as any); if (tab.key === 'tournament') loadTournamentTeams() }}
                      className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${bulkTab === tab.key ? 'border-primary text-foreground' : 'border-transparent text-muted hover:text-foreground'}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Text tab */}
                {bulkTab === 'text' && (
                  <div className="space-y-2">
                    <textarea
                      className="input w-full text-sm resize-none font-mono"
                      rows={5}
                      placeholder={"Нэг мөрт нэг нэр:\nМонгол баг\nОрос баг\nХятад баг"}
                      value={bulkText}
                      onChange={e => { setBulkText(e.target.value); setBulkPreview([]) }}
                    />
                    <button
                      onClick={parseBulkText}
                      disabled={!bulkText.trim()}
                      className="rounded-lg border border-border px-4 py-1.5 text-sm font-medium hover:bg-surface disabled:opacity-40 transition-colors"
                    >
                      Задлах →
                    </button>
                  </div>
                )}

                {/* Tournament teams tab */}
                {bulkTab === 'tournament' && (
                  <div className="space-y-2">
                    {loadingTt ? (
                      <p className="text-xs text-muted py-2">Ачаалж байна...</p>
                    ) : tournamentTeams.length === 0 ? (
                      <p className="text-xs text-muted italic py-2">Бусад спортоос оролцогч олдсонгүй</p>
                    ) : (
                      <>
                        <div className="max-h-44 overflow-y-auto space-y-0.5 pr-1">
                          {tournamentTeams.map(t => {
                            const alreadyIn = teams.some(tt => tt.name.toLowerCase() === t.name.toLowerCase())
                            return (
                              <label key={t.id} className={`flex items-center gap-2 rounded px-2 py-1.5 cursor-pointer hover:bg-surface transition-colors ${alreadyIn ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                <input
                                  type="checkbox"
                                  className="shrink-0"
                                  disabled={alreadyIn}
                                  checked={selectedTIds.has(t.id)}
                                  onChange={() => {
                                    if (alreadyIn) return
                                    setSelectedTIds(prev => { const next = new Set(prev); next.has(t.id) ? next.delete(t.id) : next.add(t.id); return next })
                                  }}
                                />
                                <span className="flex-1 text-sm">{t.name}</span>
                                {t.sport_name && <span className="text-xs text-muted">{t.sport_name}</span>}
                                {alreadyIn && <span className="text-xs text-muted italic">нэмэгдсэн</span>}
                              </label>
                            )
                          })}
                        </div>
                        <button
                          onClick={addSelectedToPreview}
                          disabled={selectedTIds.size === 0}
                          className="rounded-lg border border-border px-4 py-1.5 text-sm font-medium hover:bg-surface disabled:opacity-40 transition-colors"
                        >
                          Сонгосноо жагсаалтад нэмэх ({selectedTIds.size})
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Preview list */}
                {bulkPreview.length > 0 && (
                  <div className="space-y-1.5 border-t border-border pt-3">
                    <p className="text-xs text-muted font-medium">{bulkPreview.length} баг нэмэгдэх:</p>
                    <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
                      {bulkPreview.map((name, i) => (
                        <div key={i} className="flex items-center gap-2 rounded border border-border bg-surface px-2 py-1.5">
                          <span className="flex-1 text-sm">{name}</span>
                          <button
                            onClick={() => removeBulkItem(i)}
                            className="text-xs text-muted hover:text-danger transition-colors shrink-0"
                            title="Хасах"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={addBulkTeams}
                      disabled={bulkAdding}
                      className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50 transition-colors"
                    >
                      {bulkAdding ? 'Нэмж байна...' : `+ ${bulkPreview.length} баг нэмэх`}
                    </button>
                  </div>
                )}
              </div>
            )}

            {teams.length === 0 && (
              <p className="text-xs text-muted italic">Баг байхгүй байна. Дээд талын оруулах хэсгээр баг нэмнэ үү.</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {teams.map(team => (
                <div key={team.id} className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2">
                  <span className="text-xs text-muted w-5 shrink-0">#{team.seed}</span>
                  {editingTeamId === team.id ? (
                    <>
                      <input
                        autoFocus
                        className="input flex-1 text-sm py-0.5"
                        value={editingTeamName}
                        onChange={e => setEditingTeamName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') saveTeamName(team.id, editingTeamName)
                          if (e.key === 'Escape') setEditingTeamId(null)
                        }}
                      />
                      <button onClick={() => saveTeamName(team.id, editingTeamName)} className="text-xs text-live hover:text-live/80 font-bold shrink-0">✓</button>
                      <button onClick={() => setEditingTeamId(null)} className="text-xs text-muted shrink-0">✕</button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm font-medium">{team.name}</span>
                      <button
                        onClick={() => { setEditingTeamId(team.id); setEditingTeamName(team.name) }}
                        className="text-xs text-muted hover:text-foreground shrink-0"
                        title="Нэр засах"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteTeam(team.id, team.name)}
                        className="text-xs text-muted hover:text-danger shrink-0"
                        title="Устгах"
                      >
                        🗑
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Config */}
          <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
            <h2 className="font-semibold">Хэсгийн тохиргоо</h2>
            <div className="grid grid-cols-2 gap-4">
              <label className="space-y-1">
                <span className="text-sm text-muted">Хэсгийн тоо</span>
                <input
                  type="number" min={2} max={20}
                  value={groupCount}
                  onChange={e => { const v = Math.max(2, Math.min(20, +e.target.value || 2)); setGroupCount(v); setSavedOk(false) }}
                  className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
                />
                {teams.length > 0 && <p className="text-xs text-muted">{Math.ceil(teams.length / groupCount)} баг/хэсэг</p>}
              </label>
              <label className="space-y-1">
                <span className="text-sm text-muted">Нугалааруу гарах баг</span>
                <input
                  type="number" min={1} max={10}
                  value={advanceCount}
                  onChange={e => setAdvanceCount(Math.max(1, Math.min(10, +e.target.value || 1)))}
                  className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
                />
              </label>
            </div>
            <p className="text-xs text-muted">Нийт {groupCount * advanceCount} баг нугалааны шатанд гарна</p>
            <label className="space-y-1 block">
              <span className="text-sm text-muted">Шүүгчийн код</span>
              <input type="text" className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm font-mono uppercase tracking-widest"
                placeholder="жишээ: BASKET-M" value={judgeCode} onChange={e => setJudgeCode(e.target.value.toUpperCase())} />
              <p className="text-xs text-muted">Энэ кодыг шүүгч нарт өгнө. /judge хуудасаар нэвтэрнэ.</p>
            </label>
          </div>

          {/* Team assignment */}
          <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Багуудыг хэсэгт оруулах</h2>
              <div className="flex gap-2">
                <button onClick={randomDistribute} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-surface-2 transition-colors">
                  🎲 Санамсаргүй
                </button>
                <button onClick={autoSeed} className="text-xs px-3 py-1.5 rounded-lg border border-primary/40 text-primary hover:bg-primary/10 transition-colors">
                  🌱 Seed-ээр
                </button>
              </div>
            </div>

            <div className={`grid gap-3 ${groupCount <= 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-4'}`}>
              {letters.map(letter => {
                const gTeams = letterTeamMap.get(letter) ?? []
                return (
                  <div key={letter} className="rounded-lg border border-border bg-surface-2 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{letter}</span>
                      <span className="text-sm font-semibold">Хэсэг {letter}</span>
                      <span className="ml-auto text-xs text-muted">{gTeams.length}</span>
                    </div>
                    <div className="space-y-1">
                      {gTeams.map(t => (
                        <div key={t.id} className="text-xs bg-surface rounded px-2 py-1">{t.name}</div>
                      ))}
                      {gTeams.length === 0 && <p className="text-xs text-muted italic">Хоосон</p>}
                    </div>
                  </div>
                )
              })}
            </div>

            <div>
              <p className="text-sm text-muted mb-3">Баг бүрийн хэсгийг сонгоно:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {teams.map(team => (
                  <div key={team.id} className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2">
                    <span className="text-xs text-muted w-5">#{team.seed}</span>
                    <span className="flex-1 text-sm font-medium">{team.name}</span>
                    <select value={assignments.get(team.id) ?? ''} onChange={e => assignTeam(team.id, e.target.value)}
                      className="rounded border border-border bg-surface px-2 py-1 text-sm">
                      <option value="">— хэсэггүй</option>
                      {letters.map(letter => <option key={letter} value={letter}>Хэсэг {letter}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              {unassigned.length > 0 && <p className="mt-2 text-xs text-yellow-400">⚠️ {unassigned.length} баг хэсэгт ороогүй байна</p>}
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer w-fit">
              <input
                type="checkbox"
                checked={useTwoCourts}
                onChange={e => setUseTwoCourts(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              <span className="text-sm text-muted">2 талбай ашиглах <span className="text-xs">(A,B,C → 1-р / D,E,F → 2-р)</span></span>
            </label>
            <div className="flex flex-wrap gap-3">
              <button onClick={saveConfig} disabled={saving}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50 transition-colors">
                {saving ? 'Хадгалж байна...' : '💾 Хадгалах'}
              </button>
              <button onClick={generateGroupMatches} disabled={generating || !canGenerate}
                className="rounded-lg border border-green-500/50 bg-green-500/10 px-5 py-2.5 text-sm font-semibold text-green-400 hover:bg-green-500/20 disabled:opacity-50 transition-colors">
                {generating ? 'Үүсгэж байна...' : '⊞ Хэсгийн тоглолт үүсгэх'}
              </button>
              <button onClick={generateKnockout} disabled={generating || !canGenerate}
                className="rounded-lg border border-accent/50 bg-accent/10 px-5 py-2.5 text-sm font-semibold text-accent hover:bg-accent/20 disabled:opacity-50 transition-colors">
                {generating ? 'Үүсгэж байна...' : '⟁ Нугалааны bracket үүсгэх'}
              </button>
            </div>
            {!canGenerate && <p className="text-xs text-muted">⚠️ Эхлээд тохиргоог хадгална уу</p>}
          </div>
        </div>
      )}

      {/* ── MATCHES TAB ── */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          {matches.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted">
              <p className="mb-2">Тоглолт үүсгэгдээгүй байна</p>
              <button onClick={() => setActiveTab('config')} className="text-sm text-primary hover:underline">
                ← Тохиргоо руу очих
              </button>
            </div>
          ) : (
            <>
              {/* Save order button */}
              {orderDirty && (
                <div className="flex items-center gap-3 rounded-lg border border-accent/40 bg-accent/10 px-4 py-2.5">
                  <span className="text-sm text-accent flex-1">Дараалал өөрчлөгдсөн</span>
                  <button
                    onClick={saveOrder}
                    disabled={savingOrder}
                    className="rounded-lg bg-accent px-5 py-1.5 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-50 transition-colors shrink-0"
                  >
                    {savingOrder ? 'Хадгалж байна...' : '💾 Хадгалах'}
                  </button>
                </div>
              )}

              {/* Court tabs — зөвхөн 2 талбайтай спортод */}
              {hasTwoCourts && (
                <div className="flex gap-1 p-1 rounded-lg bg-surface-2 border border-border w-fit">
                  {[1, 2].map(c => (
                    <button
                      key={c}
                      onClick={() => setActiveCourt(c)}
                      className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                        activeCourt === c
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-muted hover:text-foreground'
                      }`}
                    >
                      {c}-р талбай
                    </button>
                  ))}
                </div>
              )}

              {/* Хэсгийн шат — flat unified list */}
              {courtGroupMatches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-muted uppercase tracking-wide">⊞ Хэсгийн шат</h3>
                    <span className="text-xs text-muted">
                      {courtGroupMatches.filter(m => m.status === 'completed').length}/{courtGroupMatches.length} дууссан
                    </span>
                  </div>
                  <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
                    {courtGroupMatches.map((m) => (
                      <MatchScoreRow
                        key={m.id}
                        match={m}
                        onSave={saveMatchScore}
                        onReset={resetMatch}
                        onOrderChange={hasTwoCourts ? changeMatchOrder : undefined}
                        onCourtChange={hasTwoCourts ? changeMatchCourt : undefined}
                        isVolleyball={isVolleyball}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Нугалааны шат — гараар удирдах */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-muted uppercase tracking-wide">⟁ Нугалааны шат</h3>
                  <div className="flex items-center gap-2">
                    {knockoutMatches.length > 0 && (
                      <Link href={`/t/${id}/${sportId}#knockout`} target="_blank"
                        className="text-xs text-primary hover:underline">
                        Схем →
                      </Link>
                    )}
                    <button
                      onClick={() => addKnockoutMatch(activeCourt)}
                      className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted hover:text-foreground hover:border-primary/50 transition-colors"
                    >
                      + Нэмэх
                    </button>
                  </div>
                </div>
                {courtKnockoutMatches.length > 0 ? (
                  <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
                    {courtKnockoutMatches.map((m) => (
                      <KnockoutManageRow
                        key={m.id}
                        match={m}
                        groups={groups}
                        groupStandings={groupStandings}
                        advanceCount={advanceCount}
                        onSourceChange={handleSourceChange}
                        onDelete={deleteKnockoutMatch}
                        onSave={saveMatchScore}
                        onReset={resetMatch}
                        onOrderChange={changeMatchOrder}
                        onCourtChange={hasTwoCourts ? changeMatchCourt : undefined}
                        isVolleyball={isVolleyball}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border py-6 text-center text-sm text-muted">
                    Нугалааны тоглолт байхгүй байна — "+ Нэмэх" товч дарж нэмнэ үү
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── BRACKET TAB ── */}
      {activeTab === 'bracket' && (
        <div className="space-y-4">
          {knockoutMatches.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-muted space-y-5">
              <p className="font-medium">Нугалааны тоглолт үүсгэгдээгүй байна</p>

              {/* Шууд хоосон bracket */}
              <div className="rounded-lg border border-border bg-surface p-4 text-left space-y-3">
                <p className="text-sm font-semibold text-foreground">⟁ Хоосон bracket үүсгэх</p>
                <p className="text-xs text-muted">Хэдэн багийн нугалаа үүсгэх? Слотуудыг дараа dropdown-оос сонгоно.</p>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-muted shrink-0">Багийн тоо:</label>
                  <input
                    type="number" min={2} max={64} step={2}
                    value={directTeamCount}
                    onChange={e => setDirectTeamCount(Math.max(2, +e.target.value || 2))}
                    className="input w-24 text-center font-bold"
                  />
                  <span className="text-xs text-muted">({Math.ceil(Math.log2(directTeamCount))} шат)</span>
                </div>
                <button
                  onClick={generateDirectKnockout}
                  disabled={generating}
                  className="rounded-lg bg-accent px-5 py-2 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-50 transition-colors"
                >
                  {generating ? '...' : '⟁ Хоосон bracket үүсгэх'}
                </button>
              </div>

              {/* Хэсгийн үр дүнгээс */}
              {canGenerate && groupMatches.length > 0 && (
                <div className="border-t border-border pt-4">
                  <p className="text-xs text-muted mb-2">Эсвэл хэсгийн үр дүнгээс автоматаар:</p>
                  <button
                    onClick={generateKnockout}
                    disabled={generating}
                    className="rounded-lg border border-accent/50 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent hover:bg-accent/20 disabled:opacity-50 transition-colors"
                  >
                    {generating ? '...' : '⟁ Хэсгийн үр дүнгээс bracket үүсгэх'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-xs text-muted">
                  Хоосон нүдэнд доош унах цэснээс баг сонгоно уу. Оноо → <b>✏️ оноо</b> товч.
                </p>
                <Link href={`/t/${id}/${sportId}#knockout`} target="_blank"
                  className="text-xs text-primary hover:underline">
                  Нийтийн хуудас →
                </Link>
              </div>
              <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                <AdminBracket
                  initialMatches={knockoutMatches as any}
                  allTeams={teams.map(t => ({ id: t.id, name: t.name }))}
                  judgeCode={judgeCode}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function KnockoutManageRow({
  match, groups, groupStandings, advanceCount,
  onSourceChange, onDelete, onSave, onReset, onOrderChange, onCourtChange, isVolleyball,
}: {
  match: Match
  groups: Group[]
  groupStandings: Map<string, { teamId: string; name: string }[]>
  advanceCount: number
  onSourceChange: (matchId: string, slot: 'team1' | 'team2', source: string) => void
  onDelete: (matchId: string) => void
  onSave: (id: string, t1: number, t2: number, setScores?: [number, number][]) => Promise<void>
  onReset: (id: string) => Promise<void>
  onOrderChange?: (matchId: string, order: number) => void
  onCourtChange?: (matchId: string, court: number) => void
  isVolleyball?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [scoreMode, setScoreMode] = useState<'sets' | 'ratio'>('sets')
  const [sets, setSets] = useState<[number, number][]>(
    match.set_scores?.length ? match.set_scores : [[0, 0], [0, 0], [0, 0]]
  )
  const [t1, setT1] = useState(match.team1_score ?? 0)
  const [t2, setT2] = useState(match.team2_score ?? 0)
  const [saving, setSaving] = useState(false)
  const isDone = match.status === 'completed'
  const hasTeams = !!(match.team1 && match.team2)

  const autoRatio = sets.reduce<[number, number]>(([r1, r2], [s1, s2]) =>
    s1 > s2 ? [r1 + 1, r2] : s2 > s1 ? [r1, r2 + 1] : [r1, r2], [0, 0])
  const hasSetData = sets.some(([s1, s2]) => s1 > 0 || s2 > 0)

  const sourceOptions = useMemo(() => {
    const opts: { value: string; label: string; teamName: string | null }[] = [
      { value: '', label: '— Сонгоно уу —', teamName: null },
    ]
    for (const group of [...groups].sort((a, b) => a.name.localeCompare(b.name))) {
      const standing = groupStandings.get(group.name) ?? []
      for (let rank = 1; rank <= advanceCount; rank++) {
        const teamInfo = standing[rank - 1]
        opts.push({
          value: `${group.name}:${rank}`,
          label: `${group.name} хэсгийн ${rank}-р байр`,
          teamName: teamInfo?.name ?? null,
        })
      }
    }
    return opts
  }, [groups, groupStandings, advanceCount])

  async function save() {
    setSaving(true)
    try {
      if (isVolleyball && scoreMode === 'sets') {
        await onSave(match.id, autoRatio[0], autoRatio[1], hasSetData ? sets : undefined)
      } else {
        await onSave(match.id, t1, t2)
      }
      setEditing(false)
    }
    catch (e: any) { alert(e.message) }
    setSaving(false)
  }

  async function reset() {
    if (!confirm('Үр дүн устгах уу?')) return
    setSaving(true)
    try {
      await onReset(match.id)
      setSets([[0, 0], [0, 0], [0, 0]])
    }
    catch (e: any) { alert(e.message) }
    setSaving(false)
  }

  return (
    <div className="px-3 sm:px-4 py-2.5">
      <div className="flex items-center gap-1.5">
        {onOrderChange && (
          <input
            type="number" min={1}
            key={`${match.id}-${match.schedule_order ?? match.match_number}`}
            defaultValue={match.schedule_order ?? match.match_number}
            className="w-10 shrink-0 rounded border border-border/60 bg-surface-2 px-1 py-0.5 text-center text-xs text-muted focus:border-primary focus:text-foreground focus:outline-none"
            onKeyDown={e => { if (e.key === 'Enter') onOrderChange(match.id, parseInt((e.target as HTMLInputElement).value) || 1) }}
            onBlur={e => onOrderChange(match.id, parseInt(e.target.value) || 1)}
          />
        )}
        {onCourtChange && (
          <button
            onClick={() => onCourtChange(match.id, match.court === 1 ? 2 : 1)}
            className={`flex h-6 w-7 shrink-0 items-center justify-center rounded text-xs font-bold transition-colors ${
              match.court === 2 ? 'bg-accent/20 text-accent' : 'bg-surface-2 text-muted hover:text-foreground'
            }`}
            title="Талбай солих"
          >
            T{match.court}
          </button>
        )}

        {/* Team 1 */}
        <div className="flex-1 min-w-0">
          {isDone ? (
            <span className={`text-sm font-medium ${match.winner?.id === match.team1?.id ? 'text-live font-bold' : ''}`}>
              {match.team1?.name ?? 'TBD'}
            </span>
          ) : (
            <select
              value={match.team1_source ?? ''}
              onChange={e => onSourceChange(match.id, 'team1', e.target.value)}
              className="w-full rounded border border-border/60 bg-surface px-1.5 py-1 text-xs"
            >
              {sourceOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}{opt.teamName ? ` (${opt.teamName})` : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        <span className={`shrink-0 w-12 text-center text-xs font-bold rounded px-1 py-0.5 ${isDone ? 'bg-surface-2' : 'text-muted'}`}>
          {isDone ? `${match.team1_score}:${match.team2_score}` : 'vs'}
        </span>

        {/* Team 2 */}
        <div className="flex-1 min-w-0">
          {isDone ? (
            <span className={`text-sm font-medium ${match.winner?.id === match.team2?.id ? 'text-live font-bold' : ''}`}>
              {match.team2?.name ?? 'TBD'}
            </span>
          ) : (
            <select
              value={match.team2_source ?? ''}
              onChange={e => onSourceChange(match.id, 'team2', e.target.value)}
              className="w-full rounded border border-border/60 bg-surface px-1.5 py-1 text-xs"
            >
              {sourceOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}{opt.teamName ? ` (${opt.teamName})` : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {isDone ? (
            <button onClick={reset} disabled={saving}
              className="rounded border border-border px-1.5 py-0.5 text-xs text-muted hover:text-danger hover:border-danger/40 disabled:opacity-40 transition-colors">
              ↩
            </button>
          ) : hasTeams ? (
            <button onClick={() => setEditing(v => !v)} disabled={saving}
              className="rounded-lg border border-primary/50 bg-primary/10 px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/20 disabled:opacity-40 transition-colors">
              {editing ? '✕' : '✏️'}
            </button>
          ) : null}
          <button
            onClick={() => onDelete(match.id)}
            className="rounded border border-border px-1.5 py-0.5 text-xs text-muted hover:text-danger hover:border-danger/40 transition-colors"
            title="Тоглолт устгах"
          >
            🗑
          </button>
        </div>
      </div>

      {editing && hasTeams && (
        <div className="mt-3 pt-3 border-t border-border space-y-2">
          {isVolleyball ? (
            scoreMode === 'sets' ? (
              <div className="space-y-1.5">
                {sets.map(([s1, s2], i) => {
                  const winner = s1 > s2 ? match.team1?.name : s2 > s1 ? match.team2?.name : null
                  return (
                    <div key={i} className="flex items-center justify-center gap-2">
                      <span className="w-16 shrink-0 text-right text-xs text-muted whitespace-nowrap">{i + 1}-р ээлж</span>
                      <input type="number" min={0}
                        className="w-14 shrink-0 rounded border border-border bg-surface-2 px-1 py-1 text-center font-bold text-sm focus:border-primary focus:outline-none"
                        value={s1} onChange={e => setSets(prev => prev.map((s, j) => j === i ? [+e.target.value, s[1]] : s) as [number, number][])} />
                      <span className="shrink-0 font-bold text-muted">:</span>
                      <input type="number" min={0}
                        className="w-14 shrink-0 rounded border border-border bg-surface-2 px-1 py-1 text-center font-bold text-sm focus:border-primary focus:outline-none"
                        value={s2} onChange={e => setSets(prev => prev.map((s, j) => j === i ? [s[0], +e.target.value] : s) as [number, number][])} />
                      <span className="w-20 shrink-0 truncate text-xs text-muted">{winner ?? ''}</span>
                    </div>
                  )
                })}
                <div className="flex items-center justify-between pt-1.5 border-t border-border/50">
                  <span className="text-xs text-muted">Харьцаа:</span>
                  <span className="text-sm font-bold tabular-nums">{autoRatio[0]} : {autoRatio[1]}</span>
                  <button onClick={() => setScoreMode('ratio')} className="text-xs text-muted hover:text-foreground transition-colors">
                    Гараар →
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_4rem_1.25rem_4rem_1fr] items-center gap-2">
                  <span className="text-xs text-muted text-right truncate">{match.team1?.name}</span>
                  <input type="number" min={0} max={3} className="input text-center font-bold text-lg" value={t1}
                    onChange={e => setT1(Math.max(0, Number(e.target.value)))} />
                  <span className="text-muted font-bold text-center">:</span>
                  <input type="number" min={0} max={3} className="input text-center font-bold text-lg" value={t2}
                    onChange={e => setT2(Math.max(0, Number(e.target.value)))} />
                  <span className="text-xs text-muted truncate">{match.team2?.name}</span>
                </div>
                <button onClick={() => setScoreMode('sets')} className="text-xs text-muted hover:text-foreground transition-colors">
                  ← Ээлжээр
                </button>
              </div>
            )
          ) : (
            <div className="grid grid-cols-[1fr_4rem_1.25rem_4rem_1fr] items-center gap-2">
              <span className="text-xs text-muted text-right truncate">{match.team1?.name}</span>
              <input type="number" min={0} className="input text-center font-bold text-lg" value={t1}
                onChange={e => setT1(Math.max(0, Number(e.target.value)))} />
              <span className="text-muted font-bold text-center">:</span>
              <input type="number" min={0} className="input text-center font-bold text-lg" value={t2}
                onChange={e => setT2(Math.max(0, Number(e.target.value)))} />
              <span className="text-xs text-muted truncate">{match.team2?.name}</span>
            </div>
          )}
          <button onClick={save} disabled={saving}
            className="w-full rounded-lg bg-live px-4 py-2 text-sm font-bold text-black disabled:opacity-40 hover:bg-live/80">
            {saving ? '...' : '✓ Хадгалах'}
          </button>
        </div>
      )}
    </div>
  )
}

function MatchScoreRow({
  match, onSave, onReset, onOrderChange, onCourtChange, isVolleyball,
}: {
  match: Match
  onSave: (id: string, t1: number, t2: number, setScores?: [number, number][]) => Promise<void>
  onReset: (id: string) => Promise<void>
  onOrderChange?: (matchId: string, order: number) => void
  onCourtChange?: (matchId: string, court: number) => void
  isVolleyball?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [scoreMode, setScoreMode] = useState<'sets' | 'ratio'>('sets')
  const [sets, setSets] = useState<[number, number][]>(
    match.set_scores?.length ? match.set_scores : [[0, 0], [0, 0], [0, 0]]
  )
  const [t1, setT1] = useState(match.team1_score ?? 0)
  const [t2, setT2] = useState(match.team2_score ?? 0)
  const [saving, setSaving] = useState(false)
  const isDone = match.status === 'completed'

  const autoRatio = sets.reduce<[number, number]>(([r1, r2], [s1, s2]) =>
    s1 > s2 ? [r1 + 1, r2] : s2 > s1 ? [r1, r2 + 1] : [r1, r2], [0, 0])
  const hasSetData = sets.some(([s1, s2]) => s1 > 0 || s2 > 0)

  async function save() {
    setSaving(true)
    try {
      if (isVolleyball && scoreMode === 'sets') {
        await onSave(match.id, autoRatio[0], autoRatio[1], hasSetData ? sets : undefined)
      } else {
        await onSave(match.id, t1, t2)
      }
      setEditing(false)
    }
    catch (e: any) { alert(e.message) }
    setSaving(false)
  }

  async function reset() {
    if (!confirm('Үр дүн устгах уу?')) return
    setSaving(true)
    try {
      await onReset(match.id)
      setT1(0); setT2(0)
      setSets([[0, 0], [0, 0], [0, 0]])
    }
    catch (e: any) { alert(e.message) }
    setSaving(false)
  }

  return (
    <div className="px-3 sm:px-4 py-2.5">
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Order input */}
        {onOrderChange && (
          <input
            type="number"
            min={1}
            key={`${match.id}-${match.schedule_order ?? match.match_number}`}
            defaultValue={match.schedule_order ?? match.match_number}
            className="w-10 shrink-0 rounded border border-border/60 bg-surface-2 px-1 py-0.5 text-center text-xs text-muted focus:border-primary focus:text-foreground focus:outline-none"
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const val = parseInt((e.target as HTMLInputElement).value)
                onOrderChange(match.id, val)
              }
            }}
            onBlur={e => {
              const val = parseInt(e.target.value)
              onOrderChange(match.id, val)
            }}
          />
        )}
        <span className="text-xs text-muted shrink-0 w-5">#{match.match_number}</span>
        {/* Court toggle */}
        {onCourtChange && (
          <button
            onClick={() => onCourtChange(match.id, match.court === 1 ? 2 : 1)}
            className={`flex h-5 w-7 shrink-0 items-center justify-center rounded text-xs font-bold transition-colors ${
              match.court === 2 ? 'bg-accent/20 text-accent' : 'bg-surface-2 text-muted hover:text-foreground'
            }`}
            title="Талбай солих"
          >
            T{match.court}
          </button>
        )}
        {/* Group badge */}
        {match.group?.name && (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
            {match.group.name}
          </span>
        )}
        <span className={`flex-1 text-right text-xs sm:text-sm font-medium min-w-0 leading-tight ${isDone && match.winner?.id === match.team1?.id ? 'text-live font-bold' : ''}`}
          style={{ wordBreak: 'break-word' }}>
          {match.team1?.name ?? 'TBD'}
        </span>
        <span className={`shrink-0 w-16 sm:w-20 text-center text-xs sm:text-sm font-bold rounded px-1 py-0.5 ${isDone ? 'bg-surface-2' : 'text-muted'}`}>
          {isDone ? `${match.team1_score}:${match.team2_score}` : 'vs'}
        </span>
        <span className={`flex-1 text-left text-xs sm:text-sm font-medium min-w-0 leading-tight ${isDone && match.winner?.id === match.team2?.id ? 'text-live font-bold' : ''}`}
          style={{ wordBreak: 'break-word' }}>
          {match.team2?.name ?? 'TBD'}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {isDone ? (
            <>
              <span className="hidden sm:inline text-xs text-primary font-bold">✓</span>
              <button onClick={reset} disabled={saving}
                className="rounded border border-border px-1.5 py-0.5 text-xs text-muted hover:text-danger hover:border-danger/40 disabled:opacity-40 transition-colors">
                ↩
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(v => !v)} disabled={saving}
              className="rounded-lg border border-primary/50 bg-primary/10 px-2 sm:px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/20 disabled:opacity-40 transition-colors whitespace-nowrap">
              {editing ? '✕' : '✏️'}
            </button>
          )}
        </div>
      </div>

      {editing && (
        <div className="mt-3 pt-3 border-t border-border space-y-2">
          {isVolleyball ? (
            scoreMode === 'sets' ? (
              <div className="space-y-1.5">
                {sets.map(([s1, s2], i) => {
                  const winner = s1 > s2 ? match.team1?.name : s2 > s1 ? match.team2?.name : null
                  return (
                    <div key={i} className="flex items-center justify-center gap-2">
                      <span className="w-16 shrink-0 text-right text-xs text-muted whitespace-nowrap">{i + 1}-р ээлж</span>
                      <input type="number" min={0}
                        className="w-14 shrink-0 rounded border border-border bg-surface-2 px-1 py-1 text-center font-bold text-sm focus:border-primary focus:outline-none"
                        value={s1} onChange={e => setSets(prev => prev.map((s, j) => j === i ? [+e.target.value, s[1]] : s) as [number, number][])} />
                      <span className="shrink-0 font-bold text-muted">:</span>
                      <input type="number" min={0}
                        className="w-14 shrink-0 rounded border border-border bg-surface-2 px-1 py-1 text-center font-bold text-sm focus:border-primary focus:outline-none"
                        value={s2} onChange={e => setSets(prev => prev.map((s, j) => j === i ? [s[0], +e.target.value] : s) as [number, number][])} />
                      <span className="w-20 shrink-0 truncate text-xs text-muted">{winner ?? ''}</span>
                    </div>
                  )
                })}
                <div className="flex items-center justify-between pt-1.5 border-t border-border/50">
                  <span className="text-xs text-muted">Харьцаа:</span>
                  <span className="text-sm font-bold tabular-nums">{autoRatio[0]} : {autoRatio[1]}</span>
                  <button onClick={() => setScoreMode('ratio')} className="text-xs text-muted hover:text-foreground transition-colors">
                    Гараар →
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_4rem_1.25rem_4rem_1fr] items-center gap-2">
                  <span className="text-xs text-muted text-right truncate">{match.team1?.name}</span>
                  <input type="number" min={0} max={3} className="input text-center font-bold text-lg" value={t1}
                    onChange={e => setT1(Math.max(0, Number(e.target.value)))} />
                  <span className="text-muted font-bold text-center">:</span>
                  <input type="number" min={0} max={3} className="input text-center font-bold text-lg" value={t2}
                    onChange={e => setT2(Math.max(0, Number(e.target.value)))} />
                  <span className="text-xs text-muted truncate">{match.team2?.name}</span>
                </div>
                <button onClick={() => setScoreMode('sets')} className="text-xs text-muted hover:text-foreground transition-colors">
                  ← Ээлжээр
                </button>
              </div>
            )
          ) : (
            <div className="grid grid-cols-[1fr_4rem_1.25rem_4rem_1fr] items-center gap-2">
              <span className="text-xs text-muted text-right truncate">{match.team1?.name}</span>
              <input type="number" min={0} className="input text-center font-bold text-lg" value={t1}
                onChange={e => setT1(Math.max(0, Number(e.target.value)))} />
              <span className="text-muted font-bold text-center">:</span>
              <input type="number" min={0} className="input text-center font-bold text-lg" value={t2}
                onChange={e => setT2(Math.max(0, Number(e.target.value)))} />
              <span className="text-xs text-muted truncate">{match.team2?.name}</span>
            </div>
          )}
          <button onClick={save} disabled={saving}
            className="w-full rounded-lg bg-live px-4 py-2 text-sm font-bold text-black disabled:opacity-40 hover:bg-live/80">
            {saving ? '...' : '✓ Хадгалах'}
          </button>
        </div>
      )}
    </div>
  )
}
