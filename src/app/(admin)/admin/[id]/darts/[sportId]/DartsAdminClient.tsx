'use client'

import { useState } from 'react'
import Link from 'next/link'

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

const INIT: DartsData = {
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

interface Props {
  tournamentId: string
  sportId: string
  initialData: DartsData | null
}

function inp(val: string, onChange: (v: string) => void, cls = '') {
  return (
    <input
      value={val}
      onChange={e => onChange(e.target.value)}
      className={`input py-1 ${cls}`}
    />
  )
}

function scoreInp(val: number | null, onChange: (v: number | null) => void) {
  return (
    <input
      type="number" min={0} max={9}
      value={val ?? ''}
      placeholder="–"
      onChange={e => onChange(e.target.value === '' ? null : parseInt(e.target.value))}
      className="input w-12 text-center py-1 font-mono text-base"
    />
  )
}

function MatchRow({ m, onChange }: { m: Match; onChange: (m: Match) => void }) {
  return (
    <div className="flex items-center gap-2">
      {inp(m.h, v => onChange({ ...m, h: v }), 'flex-1')}
      <div className="flex items-center gap-1 shrink-0">
        {scoreInp(m.hs, v => onChange({ ...m, hs: v }))}
        <span className="text-muted text-xs font-mono">:</span>
        {scoreInp(m.as, v => onChange({ ...m, as: v }))}
      </div>
      {inp(m.a, v => onChange({ ...m, a: v }), 'flex-1')}
    </div>
  )
}

export default function DartsAdminClient({ tournamentId, sportId, initialData }: Props) {
  const [data, setData] = useState<DartsData>(initialData ?? INIT)
  const [tab, setTab] = useState<'groups' | 'bracket'>('groups')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  function setGroup(gi: number, teams: Team[]) {
    setData(d => ({ ...d, groups: d.groups.map((g, i) => i === gi ? { ...g, teams } : g) }))
  }

  function setMatch(round: 'r16' | 'qf' | 'sf', idx: number, m: Match) {
    setData(d => ({ ...d, [round]: (d[round] as Match[]).map((x, i) => i === idx ? m : x) }))
  }

  async function save() {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/darts/${sportId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId, data }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error)
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 2500)
    } catch (e: any) {
      alert('Алдаа: ' + e.message)
      setStatus('error')
    }
    setSaving(false)
  }

  const btnCls =
    status === 'saved' ? 'bg-live/90 text-black'
    : status === 'error' ? 'bg-danger text-white'
    : 'bg-primary text-primary-foreground hover:bg-primary/90'

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href={`/admin/${tournamentId}`} className="text-xs text-muted hover:text-foreground transition-colors">
            ← Удирдах самбар
          </Link>
          <h1 className="text-2xl font-bold mt-1 flex items-center gap-2">
            <span>🎯</span> Дартсын тэмцээний дүн
          </h1>
          <p className="text-xs text-muted mt-0.5">ГҮТББ 2026 · 8 хэсэг + Нугалаа</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className={`rounded-lg px-5 py-2.5 text-sm font-bold transition-colors shrink-0 ${btnCls} ${saving ? 'opacity-60' : ''}`}
        >
          {saving ? 'Хадгалж байна…' : status === 'saved' ? '✓ Хадгалагдсан' : '💾 Хадгалах'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['groups', 'bracket'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors border ${
              tab === t
                ? 'bg-primary/20 border-primary/50 text-primary'
                : 'bg-surface border-border text-muted hover:text-foreground'
            }`}
          >
            {t === 'groups' ? '⊞ Хэсгийн үр дүн' : '🏆 Нугалаа'}
          </button>
        ))}
      </div>

      {tab === 'groups' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.groups.map((g, gi) => (
            <div key={gi} className="rounded-xl border border-border overflow-hidden">
              <div className="bg-surface-2 px-3 py-2 text-xs font-bold text-muted uppercase tracking-wide">
                {gi + 1}-р хэсэг
              </div>
              <div className="divide-y divide-border">
                {g.teams.map((t, ti) => (
                  <div key={ti} className="flex items-center gap-2 px-3 py-1.5">
                    <span className="text-xs font-mono text-muted w-4 shrink-0">{t.rank}</span>
                    <input
                      value={t.name}
                      onChange={e => {
                        const teams = g.teams.map((x, i) => i === ti ? { ...x, name: e.target.value } : x)
                        setGroup(gi, teams)
                      }}
                      className="input flex-1 py-1 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'bracket' && (
        <div className="space-y-6">
          {/* R16 */}
          <section>
            <h3 className="text-sm font-bold text-muted uppercase tracking-wide mb-3">Шилдэг 16</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {data.r16.map((m, i) => (
                <div key={i} className="bg-surface rounded-lg border border-border px-3 py-2">
                  <div className="text-xs text-muted mb-1.5 font-mono">M{i + 1}</div>
                  <MatchRow m={m} onChange={nm => setMatch('r16', i, nm)} />
                </div>
              ))}
            </div>
          </section>

          {/* QF */}
          <section>
            <h3 className="text-sm font-bold text-muted uppercase tracking-wide mb-3">Шилдэг 8 · QF</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {data.qf.map((m, i) => (
                <div key={i} className="bg-surface rounded-lg border border-border px-3 py-2">
                  <div className="text-xs text-muted mb-1.5 font-mono">QF{i + 1}</div>
                  <MatchRow m={m} onChange={nm => setMatch('qf', i, nm)} />
                </div>
              ))}
            </div>
          </section>

          {/* SF */}
          <section>
            <h3 className="text-sm font-bold text-muted uppercase tracking-wide mb-3">Хагас финал · SF</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {data.sf.map((m, i) => (
                <div key={i} className="bg-surface rounded-lg border border-border px-3 py-2">
                  <div className="text-xs text-muted mb-1.5 font-mono">SF{i + 1}</div>
                  <MatchRow m={m} onChange={nm => setMatch('sf', i, nm)} />
                </div>
              ))}
            </div>
          </section>

          {/* Final + 3rd */}
          <section>
            <h3 className="text-sm font-bold text-muted uppercase tracking-wide mb-3">Финал болон 3-р байр</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="bg-gold/10 rounded-lg border border-gold/40 px-3 py-2">
                <div className="text-xs text-gold mb-1.5 font-bold uppercase tracking-wide">🏆 Финал</div>
                <MatchRow
                  m={data.final}
                  onChange={nm => setData(d => ({ ...d, final: nm }))}
                />
              </div>
              <div className="bg-surface rounded-lg border border-border px-3 py-2">
                <div className="text-xs text-muted mb-1.5 font-bold uppercase tracking-wide">🥉 3-р байр</div>
                <MatchRow
                  m={data.third}
                  onChange={nm => setData(d => ({ ...d, third: nm }))}
                />
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Bottom save */}
      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className={`rounded-lg px-6 py-2.5 text-sm font-bold transition-colors ${btnCls} ${saving ? 'opacity-60' : ''}`}
        >
          {saving ? 'Хадгалж байна…' : '💾 Хадгалах'}
        </button>
      </div>
    </div>
  )
}
