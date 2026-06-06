'use client'

import { useEffect, useState } from 'react'

const AIMAGS = [
  '', 'Архангай', 'Багануур', 'Баян-Өлгий', 'Баянхонгор', 'Булган',
  'Говь-Алтай', 'Дархан-Уул', 'Дорноговь', 'Дорнод', 'Дундговь',
  'Завхан', 'Орхон', 'Өвөрхангай', 'Өмнөговь', 'Сүхбаатар',
  'Сэлэнгэ', 'Төв', 'Увс', 'Ховд', 'Хөвсгөл', 'Хэнтий',
]

const TEMPLATE = [
  { sport: 'Дартс',           gender: 'male',   gold: '', gold_name: '', silver: '', silver_name: '', bronze: '', bronze_name: '' },
  { sport: 'Дартс',           gender: 'female', gold: '', gold_name: '', silver: '', silver_name: '', bronze: '', bronze_name: '' },
  { sport: 'Ширээний теннис', gender: 'male',   gold: '', gold_name: '', silver: '', silver_name: '', bronze: '', bronze_name: '' },
  { sport: 'Ширээний теннис', gender: 'female', gold: '', gold_name: '', silver: '', silver_name: '', bronze: '', bronze_name: '' },
  { sport: 'Шатар',           gender: 'male',   gold: '', gold_name: '', silver: '', silver_name: '', bronze: '', bronze_name: '' },
  { sport: 'Шатар',           gender: 'female', gold: '', gold_name: '', silver: '', silver_name: '', bronze: '', bronze_name: '' },
  { sport: 'Сагсан бөмбөг',  gender: 'male',   gold: '', silver: '', bronze: '' },
  { sport: 'Сагсан бөмбөг',  gender: 'female', gold: '', silver: '', bronze: '' },
  { sport: 'Волейбол',        gender: 'male',   gold: '', silver: '', bronze: '' },
  { sport: 'Волейбол',        gender: 'female', gold: '', silver: '', bronze: '' },
]

const GENDER_LABEL: Record<string, string> = { male: 'Эрэгтэй', female: 'Эмэгтэй' }
const SPORT_ICON: Record<string, string> = {
  'Дартс': '🎯', 'Ширээний теннис': '🏓', 'Шатар': '♟️',
  'Сагсан бөмбөг': '🏀', 'Волейбол': '🏐',
}
const HAS_NAMES = ['Дартс', 'Ширээний теннис', 'Шатар']

export default function HistoryAdminPage() {
  const [rows, setRows] = useState(TEMPLATE.map(r => ({ ...r })))
  const [overall, setOverall] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/admin/site-settings')
      .then(r => r.json())
      .then(d => {
        if (d.history_results_III) setRows(d.history_results_III)
        if (d.history_overall_III) setOverall(d.history_overall_III)
      })
  }, [])

  function update(i: number, field: string, val: string) {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r))
    setSaved(false)
  }

  async function save() {
    setSaving(true)
    await fetch('/api/admin/site-settings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'history_results_III', value: rows }),
    })
    await fetch('/api/admin/site-settings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'history_overall_III', value: overall }),
    })
    setSaving(false)
    setSaved(true)
  }

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>III Наадам (2024) — Шагналын дүн</h1>
        <p style={{ fontSize: 13, color: '#666' }}>Дархан-Уул аймаг · Аймаг сонгоод тамирчны нэр бичнэ үү</p>
      </div>

      {/* Шилжин явах цомын эзэн */}
      <div style={{ marginBottom: 24, padding: '16px 20px', border: '1px solid #e5e7eb', borderRadius: 10, background: '#fffbeb' }}>
        <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 8 }}>🏆 Шилжин явах цомын эзэн</label>
        <select value={overall} onChange={e => { setOverall(e.target.value); setSaved(false) }}
          style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, minWidth: 200 }}>
          {AIMAGS.map(a => <option key={a} value={a}>{a || '— Сонгох —'}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rows.map((r, i) => {
          const hasNames = HAS_NAMES.includes(r.sport)
          return (
            <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ background: '#1e293b', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{SPORT_ICON[r.sport] ?? '🏅'}</span>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{r.sport.toUpperCase()}</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: r.gender === 'male' ? '#93c5fd' : '#f9a8d4',
                  background: r.gender === 'male' ? 'rgba(147,197,253,.15)' : 'rgba(249,168,212,.15)',
                  padding: '2px 8px', borderRadius: 12 }}>{GENDER_LABEL[r.gender]}</span>
              </div>

              {/* Fields */}
              <div style={{ padding: 16, display: 'grid', gap: 10 }}>
                {([
                  { medal: '🥇', rank: '1-р байр', aimag: 'gold', name: 'gold_name' },
                  { medal: '🥈', rank: '2-р байр', aimag: 'silver', name: 'silver_name' },
                  { medal: '🥉', rank: '3-р байр', aimag: 'bronze', name: 'bronze_name' },
                ] as const).map(({ medal, rank, aimag, name }) => (
                  <div key={aimag} style={{ display: 'grid', gridTemplateColumns: hasNames ? '28px 160px 1fr' : '28px 1fr', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 18 }}>{medal}</span>
                    <select value={(r as any)[aimag]} onChange={e => update(i, aimag, e.target.value)}
                      style={{ padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }}>
                      {AIMAGS.map(a => <option key={a} value={a}>{a || '— Аймаг —'}</option>)}
                    </select>
                    {hasNames && (
                      <input value={(r as any)[name] ?? ''} onChange={e => update(i, name, e.target.value)}
                        placeholder="Тамирчны нэр (жш: Б.Наян)"
                        style={{ padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={save} disabled={saving}
          style={{ padding: '10px 28px', background: '#1e293b', color: '#fff', border: 'none',
            borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
          {saving ? 'Хадгалж байна...' : 'Хадгалах'}
        </button>
        {saved && <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>✓ Амжилттай хадгалагдлаа</span>}
      </div>
    </div>
  )
}
