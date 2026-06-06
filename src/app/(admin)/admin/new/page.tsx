'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SPORT_LABELS, SPORT_ICONS, GENDER_LABELS } from '@/lib/types'

type Gender = 'male' | 'female' | null

interface SportEntry {
  key: string       // unique: 'basketball_male', 'volleyball_female', 'darts', etc.
  type: string
  label: string
  gender: Gender
  weight: number
}

const SPORT_OPTIONS: { type: string; gender: Gender }[] = [
  { type: 'volleyball', gender: 'male' },
  { type: 'volleyball', gender: 'female' },
  { type: 'basketball', gender: 'male' },
  { type: 'basketball', gender: 'female' },
  { type: 'darts', gender: null },
  { type: 'table_tennis', gender: null },
  { type: 'chess', gender: null },
]

function sportKey(type: string, gender: Gender) {
  return gender ? `${type}_${gender}` : type
}

function sportLabel(type: string, gender: Gender) {
  const base = SPORT_LABELS[type] ?? type
  return gender ? `${base} (${GENDER_LABELS[gender]})` : base
}

interface FormData {
  name: string
  location: string
  start_date: string
  end_date: string
  organizer_name: string
  organizer_phone: string
  prize_info: string
  description: string
  sports: SportEntry[]
  customSport: string
}

const STEPS = ['Үндсэн мэдээлэл', 'Спорт төрлүүд', 'Шагнал & дүрэм', 'Хянах & батлах']

export default function NewTournamentPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>({
    name: '', location: '', start_date: '', end_date: '',
    organizer_name: '', organizer_phone: '',
    prize_info: '', description: '',
    sports: [], customSport: '',
  })

  const set = (k: keyof FormData, v: any) => setForm(f => ({ ...f, [k]: v }))

  const toggleSport = (type: string, gender: Gender) => {
    const key = sportKey(type, gender)
    setForm(f => {
      const exists = f.sports.find(s => s.key === key)
      return {
        ...f,
        sports: exists
          ? f.sports.filter(s => s.key !== key)
          : [...f.sports, { key, type, label: sportLabel(type, gender), gender, weight: 1 }],
      }
    })
  }

  const addCustomSport = () => {
    const name = form.customSport.trim()
    if (!name) return
    const key = `custom_${Date.now()}`
    setForm(f => ({
      ...f,
      sports: [...f.sports, { key, type: 'custom', label: name, gender: null, weight: 1 }],
      customSport: '',
    }))
  }

  const updateWeight = (key: string, weight: number) => {
    setForm(f => ({ ...f, sports: f.sports.map(s => s.key === key ? { ...s, weight } : s) }))
  }

  const removeSport = (key: string) => {
    setForm(f => ({ ...f, sports: f.sports.filter(s => s.key !== key) }))
  }

  const canNext = () => {
    if (step === 0) return form.name.trim() !== ''
    if (step === 1) return form.sports.length > 0
    return true
  }

  const submit = async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Алдаа гарлаа')
      router.push(`/admin/${data.id}`)
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold mb-1">Шинэ тэмцээн үүсгэх</h1>
        <p className="text-muted text-sm">Доорх асуултуудыг бөглөхөд тэмцээний хуудас болон удирдамж автоматаар үүснэ</p>
      </div>

      {/* Step progress */}
      <div className="mb-8 flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={i} className="flex-1 flex items-center">
            <div className="flex flex-col items-center flex-1">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                i < step ? 'bg-live text-black' : i === step ? 'bg-primary text-white' : 'bg-surface-2 text-muted'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`mt-1 text-xs hidden sm:block ${i === step ? 'text-foreground font-medium' : 'text-muted'}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-full ${i < step ? 'bg-live' : 'bg-border'} transition-colors`} />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 space-y-5">
        {/* Step 0: Basic info */}
        {step === 0 && (
          <>
            <Field label="Тэмцээний нэр *" required>
              <input className="input" placeholder="жишээ: 2026 Хаврын Спортын Наадам"
                value={form.name} onChange={e => set('name', e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Эхлэх огноо">
                <input type="date" className="input" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
              </Field>
              <Field label="Дуусах огноо">
                <input type="date" className="input" value={form.end_date} onChange={e => set('end_date', e.target.value)} />
              </Field>
            </div>
            <Field label="Хаана болох">
              <input className="input" placeholder="жишээ: Нийслэлийн тамирын ордон"
                value={form.location} onChange={e => set('location', e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Зохион байгуулагчийн нэр">
                <input className="input" placeholder="Овог нэр"
                  value={form.organizer_name} onChange={e => set('organizer_name', e.target.value)} />
              </Field>
              <Field label="Утас">
                <input className="input" type="tel" placeholder="99xxxxxx"
                  value={form.organizer_phone} onChange={e => set('organizer_phone', e.target.value)} />
              </Field>
            </div>
          </>
        )}

        {/* Step 1: Sports */}
        {step === 1 && (
          <>
            <p className="text-sm text-muted">Спортуудыг сонгоно уу. Эр/Эм тус тусад нь тоглолт болж, нийт оноонд тусад нь тооцогдоно.</p>

            {/* Sport grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SPORT_OPTIONS.map(opt => {
                const key = sportKey(opt.type, opt.gender)
                const selected = form.sports.some(s => s.key === key)
                const icon = SPORT_ICONS[opt.type] ?? '🏅'
                const label = SPORT_LABELS[opt.type] ?? opt.type
                return (
                  <button
                    key={key}
                    onClick={() => toggleSport(opt.type, opt.gender)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-4 transition-all text-left ${
                      selected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-border/60 hover:bg-surface-2'
                    }`}
                  >
                    <span className="text-3xl">{icon}</span>
                    <span className="text-sm font-semibold text-center leading-tight">{label}</span>
                    {opt.gender && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        opt.gender === 'male'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-pink-500/20 text-pink-400'
                      }`}>
                        {opt.gender === 'male' ? '♂ Эрэгтэй' : '♀ Эмэгтэй'}
                      </span>
                    )}
                    {selected && <span className="text-xs text-live mt-0.5">✓ Сонгосон</span>}
                  </button>
                )
              })}
            </div>

            {/* Custom sport */}
            <div className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="Өөр спорт нэмэх..."
                value={form.customSport}
                onChange={e => set('customSport', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomSport()}
              />
              <button onClick={addCustomSport} className="rounded-lg border border-border px-3 py-2 hover:bg-surface-2 text-sm">
                + Нэмэх
              </button>
            </div>

            {/* Selected sports list with weights */}
            {form.sports.length > 0 && (
              <div className="rounded-lg border border-border p-4 space-y-2">
                <p className="text-sm font-medium text-muted mb-3">
                  Сонгосон спортууд ({form.sports.length}) · жингийн тохиргоо
                </p>
                {form.sports.map(s => (
                  <div key={s.key} className="flex items-center gap-3">
                    <span className="text-base">{SPORT_ICONS[s.type] ?? '🏅'}</span>
                    <span className="flex-1 text-sm">{s.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted">Жин:</span>
                      <input
                        type="number" min={1} max={5}
                        className="input w-16 text-center text-sm"
                        value={s.weight}
                        onChange={e => updateWeight(s.key, Number(e.target.value))}
                      />
                    </div>
                    <button onClick={() => removeSport(s.key)} className="text-muted hover:text-danger text-sm px-1">✕</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Step 2: Prize & rules */}
        {step === 2 && (
          <>
            <Field label="Шагнал, мөнгөн шагнал">
              <textarea className="input min-h-24 resize-y"
                placeholder="жишээ:&#10;1-р байр: 500,000₮&#10;2-р байр: 300,000₮&#10;3-р байр: 100,000₮"
                value={form.prize_info} onChange={e => set('prize_info', e.target.value)} />
            </Field>
            <Field label="Тэмцээний дүрэм, тайлбар">
              <textarea className="input min-h-32 resize-y"
                placeholder="Тэмцээний дүрэм, оролцогчдод өгөх мэдээлэл..."
                value={form.description} onChange={e => set('description', e.target.value)} />
            </Field>
          </>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Хянах</h3>
            <Row label="Нэр" value={form.name} />
            <Row label="Огноо" value={[form.start_date, form.end_date].filter(Boolean).join(' — ')} />
            <Row label="Байршил" value={form.location} />
            <Row label="Зохион байгуулагч" value={[form.organizer_name, form.organizer_phone].filter(Boolean).join(' / ')} />
            <div className="flex gap-4 text-sm">
              <span className="w-32 shrink-0 text-muted">Спортууд</span>
              <div className="space-y-1">
                {form.sports.map(s => (
                  <div key={s.key} className="flex items-center gap-2">
                    <span>{SPORT_ICONS[s.type] ?? '🏅'}</span>
                    <span className="font-medium">{s.label}</span>
                    {form.sports.length > 1 && <span className="text-xs text-muted">(жин: {s.weight})</span>}
                  </div>
                ))}
              </div>
            </div>
            {form.prize_info && <Row label="Шагнал" value={form.prize_info} />}

            <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 text-sm space-y-1">
              <p className="font-bold text-accent">Автоматаар үүсэх зүйлс:</p>
              <p>✅ Тэмцээний нийтийн хуудас</p>
              {form.sports.map(s => (
                <p key={s.key}>✅ {s.label} — хэсэг болон нугалааны хуудас</p>
              ))}
              {form.sports.length > 1 && <p>✅ Нэгдсэн дүнгийн хүснэгт ({form.sports.length} спортын оноогоор)</p>}
              <p>✅ Удирдамжийн хэвлэх хуудас</p>
              <p>✅ Баг бүртгүүлэх форм</p>
            </div>

            {error && (
              <div className="rounded-lg bg-danger/10 border border-danger/30 p-3 text-sm text-danger">{error}</div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-6 flex justify-between">
        <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
          className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-30 hover:bg-surface-2 transition-colors">
          ← Өмнөх
        </button>
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-40 hover:bg-primary-hover transition-colors">
            Дараах →
          </button>
        ) : (
          <button onClick={submit} disabled={loading}
            className="rounded-lg bg-live px-6 py-2 text-sm font-bold text-black disabled:opacity-40 hover:bg-live/80 transition-colors">
            {loading ? 'Үүсгэж байна...' : '🚀 Тэмцээн үүсгэх'}
          </button>
        )}
      </div>
    </div>
  )
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-muted">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div className="flex gap-4 text-sm">
      <span className="w-32 shrink-0 text-muted">{label}</span>
      <span className="font-medium whitespace-pre-wrap">{value}</span>
    </div>
  )
}
