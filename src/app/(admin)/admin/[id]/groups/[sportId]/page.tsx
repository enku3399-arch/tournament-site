'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminBracket from '@/components/AdminBracket'

type Team = { id: string; name: string; seed: number | null }
type Group = { id: string; name: string; advance_count: number }
type Match = {
  id: string; match_number: number; round: number; stage: string; status: string
  group_id: string | null; judge_code: string
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
  const [newTeamName, setNewTeamName] = useState('')
  const [addingTeam, setAddingTeam] = useState(false)
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
      const ms = matchesRes.matches ?? []
      if (ms.some((m: any) => m.stage === 'knockout')) setActiveTab('bracket')
      else if (ms.length > 0) setActiveTab('matches')
    } catch (e) { console.error('Load error:', e) }
    setLoading(false)
  }, [sportId])

  useEffect(() => { load() }, [load])

  const letters = Array.from({ length: groupCount }, (_, i) => String.fromCharCode(65 + i))
  const canGenerate = savedOk || groups.length > 0
  const groupMatches = matches.filter(m => m.stage === 'group')
  const knockoutMatches = matches.filter(m => m.stage === 'knockout')

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

  async function saveMatchScore(matchId: string, t1: number, t2: number) {
    const res = await fetch(`/api/matches/${matchId}/score`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ team1_score: t1, team2_score: t2, finalize: true }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, ...data, group: m.group } : m))
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
        body: JSON.stringify({ tournamentId: id, judgeCode: judgeCode.trim() || undefined }),
      })
      const data = await res.json()
      if (data.ok) { await load(); setActiveTab('matches') }
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
        <div className="space-y-6">
          {matches.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted">
              <p className="mb-2">Тоглолт үүсгэгдээгүй байна</p>
              <button onClick={() => setActiveTab('config')} className="text-sm text-primary hover:underline">
                ← Тохиргоо руу очих
              </button>
            </div>
          ) : (
            <>
              {/* Group matches */}
              {groupMatches.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-muted uppercase tracking-wide mb-3">⊞ Хэсгийн шат</h3>
                  <div className="space-y-4">
                    {groupIds.map(([gid, group]) => {
                      const gms = groupMatches.filter(m => m.group_id === gid)
                      const doneCount = gms.filter(m => m.status === 'completed').length
                      return (
                        <div key={gid} className="rounded-xl border border-border overflow-hidden">
                          <div className="bg-surface-2 px-4 py-2.5 flex items-center gap-2 border-b border-border">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                              {group?.name ?? '?'}
                            </span>
                            <span className="font-semibold text-sm">Хэсэг {group?.name}</span>
                            <span className="ml-auto text-xs text-muted">{doneCount}/{gms.length} дууссан</span>
                          </div>
                          <div className="divide-y divide-border">
                            {gms.map(m => <MatchScoreRow key={m.id} match={m} onSave={saveMatchScore} onReset={resetMatch} />)}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Knockout matches */}
              {knockoutMatches.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-muted uppercase tracking-wide mb-3">⟁ Нугалааны шат</h3>
                  <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
                    {knockoutMatches.map(m => <MatchScoreRow key={m.id} match={m} onSave={saveMatchScore} onReset={resetMatch} />)}
                  </div>
                </div>
              )}

              {/* Generate knockout button */}
              {groupMatches.length > 0 && knockoutMatches.length === 0 && (
                <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-accent">Хэсгийн шат дуусвал нугалааны bracket үүсгэнэ үү</p>
                    <p className="text-xs text-muted mt-1">
                      Дууссан: {groupMatches.filter(m => m.status === 'completed').length}/{groupMatches.length}
                    </p>
                  </div>
                  <button onClick={generateKnockout} disabled={generating}
                    className="rounded-lg border border-accent/50 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent hover:bg-accent/20 disabled:opacity-50 transition-colors shrink-0">
                    {generating ? '...' : '⟁ Bracket үүсгэх'}
                  </button>
                </div>
              )}

              {knockoutMatches.length > 0 && (
                <div className="text-center">
                  <Link href={`/t/${id}/${sportId}#knockout`} target="_blank"
                    className="text-sm text-primary hover:underline">
                    Нугалааны схем харах → /t/{id.slice(0, 6)}.../{sportId.slice(0, 6)}... #knockout
                  </Link>
                </div>
              )}
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

function MatchScoreRow({
  match, onSave, onReset,
}: {
  match: Match
  onSave: (id: string, t1: number, t2: number) => Promise<void>
  onReset: (id: string) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [t1, setT1] = useState(match.team1_score ?? 0)
  const [t2, setT2] = useState(match.team2_score ?? 0)
  const [saving, setSaving] = useState(false)
  const isDone = match.status === 'completed'

  async function save() {
    setSaving(true)
    try { await onSave(match.id, t1, t2); setEditing(false) }
    catch (e: any) { alert(e.message) }
    setSaving(false)
  }

  async function reset() {
    if (!confirm('Үр дүн устгах уу?')) return
    setSaving(true)
    try { await onReset(match.id); setT1(0); setT2(0) }
    catch (e: any) { alert(e.message) }
    setSaving(false)
  }

  return (
    <div className="px-3 sm:px-4 py-3">
      <div className="flex items-center gap-1 sm:gap-2">
        <span className="text-xs text-muted shrink-0 w-5">#{match.match_number}</span>
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
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted flex-1 text-right min-w-0" style={{ wordBreak: 'break-word' }}>{match.team1?.name}</span>
            <input type="number" min={0} className="input w-16 text-center font-bold text-lg shrink-0" value={t1}
              onChange={e => setT1(Math.max(0, Number(e.target.value)))} />
            <span className="text-muted font-bold shrink-0">:</span>
            <input type="number" min={0} className="input w-16 text-center font-bold text-lg shrink-0" value={t2}
              onChange={e => setT2(Math.max(0, Number(e.target.value)))} />
            <span className="text-xs text-muted flex-1 min-w-0" style={{ wordBreak: 'break-word' }}>{match.team2?.name}</span>
          </div>
          <button onClick={save} disabled={saving}
            className="w-full rounded-lg bg-live px-4 py-2 text-sm font-bold text-black disabled:opacity-40 hover:bg-live/80">
            {saving ? '...' : '✓ Хадгалах'}
          </button>
        </div>
      )}
    </div>
  )
}
