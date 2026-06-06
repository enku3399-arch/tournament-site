'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SPORT_ICONS, SPORT_LABELS } from '@/lib/types'

const GENDER_LABELS_MAP = { male: 'Эрэгтэй', female: 'Эмэгтэй' }

export function SportGenderBadge({ sport }: { sport: any }) {
  const [gender, setGender] = useState<string>(sport.gender ?? '')
  const [saving, setSaving] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  async function save(val: string) {
    setSaving(true)
    await fetch(`/api/admin/sport/${sport.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ gender: val || null }),
    })
    setGender(val)
    setSaving(false)
    setOpen(false)
    router.refresh()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`text-xs font-bold px-2 py-0.5 rounded border transition-colors ${
          gender === 'male'
            ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            : gender === 'female'
            ? 'bg-pink-500/20 text-pink-400 border-pink-500/30'
            : 'bg-surface-2 text-muted border-border'
        }`}
      >
        {gender === 'male' ? '♂ Эрэгтэй' : gender === 'female' ? '♀ Эмэгтэй' : '⚲ Хүйс тохируулах'}
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-10 rounded-lg border border-border bg-surface shadow-lg py-1 min-w-36">
          {[
            { val: '', label: '— Байхгүй' },
            { val: 'male', label: '♂ Эрэгтэй' },
            { val: 'female', label: '♀ Эмэгтэй' },
          ].map(opt => (
            <button
              key={opt.val}
              onClick={() => save(opt.val)}
              disabled={saving}
              className={`w-full text-left px-3 py-1.5 text-sm hover:bg-surface-2 transition-colors ${
                gender === opt.val ? 'text-primary font-semibold' : 'text-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const SPORT_OPTIONS = [
  { type: 'volleyball', gender: 'male' as const },
  { type: 'volleyball', gender: 'female' as const },
  { type: 'basketball', gender: 'male' as const },
  { type: 'basketball', gender: 'female' as const },
  { type: 'darts', gender: null as null },
  { type: 'table_tennis', gender: null as null },
  { type: 'chess', gender: null as null },
]

function sportLabel(type: string, gender: string | null) {
  const base = SPORT_LABELS[type] ?? type
  return gender ? `${base} (${GENDER_LABELS_MAP[gender as keyof typeof GENDER_LABELS_MAP] ?? gender})` : base
}

export function SeedAimagsButton({ sportId, tournamentId }: { sportId: string; tournamentId: string }) {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const router = useRouter()

  async function seed() {
    setLoading(true); setMsg(null)
    const res = await fetch(`/api/admin/sport/${sportId}/seed-aimags`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ tournamentId }),
    })
    const data = await res.json()
    setMsg(data.added > 0 ? `✓ ${data.added} аймаг нэмэгдлээ` : data.message ?? 'Аль хэдийн бүтэн')
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={seed}
        disabled={loading}
        className="rounded-lg border border-dashed border-primary/40 px-3 py-1.5 text-xs text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
      >
        {loading ? 'Нэмж байна...' : '🗺 21 аймгийн баг нэмэх'}
      </button>
      {msg && <span className="text-xs text-muted">{msg}</span>}
    </div>
  )
}

export function AddSportButton({ tournamentId, existingSportKeys }: {
  tournamentId: string
  existingSportKeys: string[]
}) {
  const [open, setOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const router = useRouter()

  const available = SPORT_OPTIONS.filter(opt => {
    const key = opt.gender ? `${opt.type}_${opt.gender}` : opt.type
    return !existingSportKeys.includes(key)
  })

  async function add(type: string, gender: string | null) {
    setAdding(true)
    const label = sportLabel(type, gender)
    await fetch(`/api/admin/tournament/${tournamentId}/add-sport`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type, label, gender, weight: 1 }),
    })
    setAdding(false)
    setOpen(false)
    router.refresh()
  }

  if (available.length === 0) return null

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="rounded-lg border border-dashed border-border px-4 py-2 text-sm text-muted hover:border-primary hover:text-primary transition-colors"
      >
        + Спорт нэмэх
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-10 rounded-lg border border-border bg-surface shadow-lg py-1 min-w-52">
          {available.map(opt => {
            const key = opt.gender ? `${opt.type}_${opt.gender}` : opt.type
            return (
              <button
                key={key}
                onClick={() => add(opt.type, opt.gender)}
                disabled={adding}
                className="w-full text-left px-3 py-2 text-sm hover:bg-surface-2 flex items-center gap-2 transition-colors"
              >
                <span>{SPORT_ICONS[opt.type] ?? '🏅'}</span>
                <span>{sportLabel(opt.type, opt.gender)}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
