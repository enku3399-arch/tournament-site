'use client'
import { useState } from 'react'
import type { TournamentSport } from '@/lib/types'
import { SPORT_ICONS, sportDisplayName } from '@/lib/types'

interface Props {
  tournamentId: string
  sports: TournamentSport[]
}

export default function RegisterForm({ tournamentId, sports }: Props) {
  const [name, setName] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [selectedSports, setSelectedSports] = useState<string[]>(
    sports.length === 1 ? [sports[0].id] : []
  )
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleSport(id: string) {
    setSelectedSports(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const reset = () => {
    setDone(false)
    setName('')
    setContactName('')
    setContactPhone('')
    setSelectedSports(sports.length === 1 ? [sports[0].id] : [])
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || selectedSports.length === 0) return
    setSubmitting(true)
    setError(null)
    try {
      for (const sport_id of selectedSports) {
        const res = await fetch('/api/teams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tournament_id: tournamentId,
            sport_id,
            name: name.trim(),
            contact_name: contactName.trim() || null,
            contact_phone: contactPhone.trim() || null,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Алдаа гарлаа')
      }
      setDone(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-live/40 bg-live/10 p-8 text-center">
        <p className="text-4xl mb-3">🎉</p>
        <h3 className="text-lg font-bold text-live mb-1">Бүртгэл амжилттай!</h3>
        <p className="text-sm text-muted mb-1">
          {selectedSports.length > 1
            ? `${selectedSports.length} спортын төрөлд бүртгэгдлээ`
            : 'Бүртгэл хүлээн авлаа'}
        </p>
        <p className="text-sm text-muted">Зохион байгуулагч баталгаажуулсны дараа идэвхжинэ</p>
        <button onClick={reset} className="mt-4 text-sm text-primary hover:underline">
          Дахин бүртгүүлэх
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-surface p-6 space-y-4">
      <h2 className="font-bold text-lg">Бүртгэлийн маягт</h2>

      {/* Sport selection */}
      {sports.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-muted">
            Спортын төрөл {sports.length > 1 && <span className="text-xs">(олон сонгож болно)</span>} *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {sports.map(s => {
              const selected = selectedSports.includes(s.id)
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSport(s.id)}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-sm transition-all ${
                    selected
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:bg-surface-2 text-foreground'
                  }`}
                >
                  <span className="text-xl">{SPORT_ICONS[s.sport_type] ?? '🏅'}</span>
                  <span className="text-xs font-medium leading-tight text-center">{sportDisplayName(s)}</span>
                  {selected && <span className="text-xs font-bold text-primary">✓</span>}
                </button>
              )
            })}
          </div>
          {selectedSports.length === 0 && (
            <p className="text-xs text-danger mt-1">Дор хаяж нэг спорт сонгоно уу</p>
          )}
        </div>
      )}

      {/* Team name */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-muted">Багийн нэр / Тамирчны нэр *</label>
        <input
          required
          className="input"
          placeholder="жишээ: Архангай аймаг"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      {/* Contact name */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-muted">Холбоо барих хүний нэр</label>
        <input
          className="input"
          placeholder="Овог нэр"
          value={contactName}
          onChange={e => setContactName(e.target.value)}
        />
      </div>

      {/* Phone */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-muted">Утасны дугаар</label>
        <input
          type="tel"
          className="input"
          placeholder="99xxxxxx"
          value={contactPhone}
          onChange={e => setContactPhone(e.target.value)}
        />
      </div>

      {error && (
        <div className="rounded-lg bg-danger/10 border border-danger/30 p-3 text-sm text-danger">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !name.trim() || selectedSports.length === 0}
        className="w-full rounded-xl bg-primary py-3 text-base font-semibold text-white disabled:opacity-40 hover:bg-primary-hover transition-colors"
      >
        {submitting
          ? 'Бүртгэж байна...'
          : selectedSports.length > 1
            ? `📋 ${selectedSports.length} спортод бүртгүүлэх`
            : '📋 Бүртгүүлэх'}
      </button>
    </form>
  )
}
