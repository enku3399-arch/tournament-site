'use client'
import { useState, useMemo } from 'react'
import { SPORT_ICONS, GENDER_LABELS } from '@/lib/types'

export type Athlete = {
  id: string
  name: string
  register_number: string | null
  rank: string | null
  participation_type: string | null
  affiliation: string | null
  phone: string | null
  notes: Record<string, string> | null
  created_at: string
  team: { id: string; name: string; status: string; contact_name: string | null; contact_phone: string | null } | null
  sport: { id: string; name: string; sport_type: string; gender: string | null } | null
}

function sportLabel(sport: Athlete['sport']) {
  if (!sport) return '—'
  const icon = SPORT_ICONS[sport.sport_type] ?? '🏅'
  const gender = sport.gender ? ` (${GENDER_LABELS[sport.gender] ?? sport.gender})` : ''
  return `${icon} ${sport.name}${gender}`
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function Avatar({ name, size = 11, className = '' }: { name: string; size?: number; className?: string }) {
  const [err, setErr] = useState(false)
  const src = `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
  if (err) {
    return (
      <div className={`flex shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-sm ${className}`}
        style={{ width: `${size * 4}px`, height: `${size * 4}px` }}>
        {initials(name)}
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={initials(name)}
      onError={() => setErr(true)}
      className={`shrink-0 rounded-full object-cover bg-surface-2 ${className}`}
      style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
    />
  )
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-live/20 text-live border-live/30',
  pending: 'bg-accent/20 text-accent border-accent/30',
}

export default function AthletesClient({ athletes, tournamentId }: { athletes: Athlete[]; tournamentId: string }) {
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<Athlete | null>(null)
  const [seeding, setSeeding] = useState(false)
  const [seedMsg, setSeedMsg] = useState('')

  async function seedDemo() {
    setSeeding(true)
    setSeedMsg('')
    try {
      const res = await fetch(`/api/admin/tournament/${tournamentId}/seed-athletes`, { method: 'POST' })
      const json = await res.json()
      if (json.ok) {
        setSeedMsg(`✓ ${json.athletes} тамирчин, ${json.teams} баг (${json.sports} спортод) нэмэгдлээ — хуудсыг дахин ачааллана уу.`)
      } else {
        setSeedMsg(`⚠️ ${json.error}`)
      }
    } finally {
      setSeeding(false)
    }
  }

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim()
    if (!s) return athletes
    return athletes.filter(a =>
      a.name.toLowerCase().includes(s) ||
      (a.register_number ?? '').toLowerCase().includes(s) ||
      (a.affiliation ?? '').toLowerCase().includes(s) ||
      (a.team?.name ?? '').toLowerCase().includes(s) ||
      (a.participation_type ?? '').toLowerCase().includes(s)
    )
  }, [athletes, q])

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">🔍</span>
          <input
            className="input pl-8 w-full"
            placeholder="Нэр, РД, аймаг, баг хайх..."
            value={q}
            onChange={e => setQ(e.target.value)}
            autoFocus
          />
          {q && (
            <button onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground text-sm">✕</button>
          )}
        </div>
        <button
          onClick={seedDemo}
          disabled={seeding}
          className="shrink-0 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs text-muted hover:text-foreground hover:border-primary/50 transition-colors disabled:opacity-50"
        >
          {seeding ? '⏳' : '🌱'} Жишээ
        </button>
      </div>

      {seedMsg && <p className="text-xs text-muted">{seedMsg}</p>}

      <p className="text-xs text-muted">{filtered.length} тамирчин{q && ` · "${q}" хайлтын үр дүн`}</p>

      {/* Athlete grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-muted text-sm">
          {q ? `"${q}" хайлтад тохирох тамирчин олдсонгүй` : 'Тамирчин бүртгэгдээгүй байна'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(a => (
            <button
              key={a.id}
              onClick={() => setSelected(a)}
              className="text-left rounded-xl border border-border bg-surface hover:border-primary/50 hover:bg-surface-2 transition-all p-4 space-y-3 group"
            >
              <div className="flex items-center gap-3">
                <Avatar name={a.name} size={11} />
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{a.name}</p>
                  <p className="text-xs text-muted font-mono">{a.register_number ?? '—'}</p>
                </div>
              </div>
              <div className="space-y-1 text-xs text-muted">
                {a.sport && (
                  <p className="truncate">{sportLabel(a.sport)}</p>
                )}
                {a.participation_type && (
                  <p className="truncate">🎯 {a.participation_type}</p>
                )}
                {a.affiliation && (
                  <p className="truncate">📍 {a.affiliation}</p>
                )}
                {a.team && (
                  <p className="truncate">🏟 {a.team.name}</p>
                )}
              </div>
              {a.rank && (
                <span className="inline-block rounded-full border border-primary/30 bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5">
                  {a.rank}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Profile modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative z-10 w-full max-w-md">
            <AthleteCard athlete={selected} onClose={() => setSelected(null)} />
          </div>
        </div>
      )}
    </div>
  )
}

function AthleteCard({ athlete: a, onClose }: { athlete: Athlete; onClose: () => void }) {
  const status = a.team?.status ?? 'pending'
  const reg = a.register_number ?? null

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 px-6 pt-6 pb-5 border-b border-border">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-foreground text-lg leading-none">✕</button>
        <div className="flex items-center gap-4">
          <Avatar name={a.name} size={16} className="rounded-2xl shadow-lg" />
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">{a.name}</h2>
            {reg && (
              <p className="font-mono text-sm text-muted tracking-widest mt-0.5">{reg}</p>
            )}
            <span className={`inline-block mt-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[status] ?? STATUS_COLORS.pending}`}>
              {status === 'confirmed' ? '✓ Баталгаажсан' : '⏳ Хүлээгдэж буй'}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Спорт" value={sportLabel(a.sport)} />
          <Field label="Оролцох төрөл" value={a.participation_type} />
          <Field label="Тамирчны зэрэг" value={a.rank} />
          <Field label="Харьялал" value={a.affiliation} />
          <Field label="Холбогдох дугаар" value={a.phone} />
          <Field label="Бүртгэлийн огноо" value={new Date(a.created_at).toLocaleDateString('mn-MN')} />
        </div>

        {a.team && (
          <div className="rounded-xl border border-border bg-surface-2 p-3 space-y-1.5">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Баг / Байгууллага</p>
            <p className="font-semibold">{a.team.name}</p>
            {a.team.contact_name && (
              <p className="text-xs text-muted">👤 {a.team.contact_name}{a.team.contact_phone ? ` · ${a.team.contact_phone}` : ''}</p>
            )}
          </div>
        )}

        {a.notes && Object.keys(a.notes).length > 0 && (
          <div className="rounded-xl border border-border bg-surface-2 p-3 space-y-2">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Нэмэлт мэдээлэл</p>
            {Object.entries(a.notes).map(([k, v]) => v ? (
              <div key={k} className="flex justify-between text-sm gap-2">
                <span className="text-muted shrink-0">{k}</span>
                <span className="font-medium text-right">{v}</span>
              </div>
            ) : null)}
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-semibold text-muted uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium">{value || <span className="text-muted/50">—</span>}</p>
    </div>
  )
}
