'use client'

import { useState } from 'react'
import Link from 'next/link'

type Row = { rank: number; name: string; club: string; pts: number }

function fmtPts(n: number): string {
  if (n % 1 === 0.5) return `${Math.floor(n)}½`
  return String(n)
}

function parsePts(v: string): number {
  const t = v.trim()
  if (t.endsWith('½')) return (parseFloat(t.slice(0, -1)) || 0) + 0.5
  return parseFloat(t) || 0
}

const INIT_WOMEN: Row[] = [
  { rank: 1,  name: 'Цогэрэл У',      club: 'Өмнөговь аймаг',    pts: 7   },
  { rank: 2,  name: 'Найгаль А',       club: 'Дундговь аймаг',    pts: 6   },
  { rank: 3,  name: 'Жаргал Л',        club: 'Сүхбаатар район',   pts: 5   },
  { rank: 4,  name: 'Оюунцэцэг Л',     club: 'Завхан аймаг',      pts: 5   },
  { rank: 5,  name: 'Хандмаа Л',       club: 'Сүхбаатар аймаг',  pts: 4   },
  { rank: 6,  name: 'Амарбаяр Д',      club: 'Баянхонгор аймаг', pts: 4   },
  { rank: 6,  name: 'Бямбасүрэн А',    club: 'Дорноговь аймаг',  pts: 4   },
  { rank: 8,  name: 'Эрдэнэцэцэг Ш',   club: 'Хөвсгөл аймаг',   pts: 4   },
  { rank: 9,  name: 'Энхзэ Л',         club: 'Булган аймаг',      pts: 4   },
  { rank: 10, name: 'Баясгалан О',      club: 'Увс аймаг',         pts: 4   },
  { rank: 11, name: 'Алимаа Ц',        club: 'Говь-Алтай аймаг', pts: 4   },
  { rank: 12, name: 'Тунгалаг Д',      club: 'Ажилчны район',     pts: 3.5 },
  { rank: 13, name: 'Оюунчимэг Ө',     club: 'Өвэрхангай аймаг', pts: 3.5 },
  { rank: 14, name: 'Оюунцэцэг П',     club: 'Дархан-Уул аймаг', pts: 3   },
  { rank: 15, name: 'Энхцэцэг Б',      club: 'Архангай аймаг',   pts: 3   },
  { rank: 16, name: 'Алтанзул Т',      club: 'Хэнтий аймаг',     pts: 3   },
  { rank: 17, name: 'Оюун Б',          club: 'Төв аймаг',         pts: 2   },
  { rank: 17, name: 'Сарангэрэл Д',    club: 'Багануур дүүрэг',  pts: 2   },
  { rank: 19, name: 'Болдтуяа',        club: 'Ховд аймаг',        pts: 2   },
  { rank: 20, name: 'Булган З',        club: 'Сэлэнгэ аймаг',    pts: 1   },
  { rank: 21, name: 'Багай Х',         club: 'Баян-Өлгий аймаг', pts: 0   },
  { rank: 21, name: 'Гэрэлмаа Ж',     club: 'Орхон аймаг',      pts: 0   },
  { rank: 21, name: 'Уугантуу Г',      club: 'Найрамдлын район', pts: 0   },
  { rank: 21, name: 'Энхзул Ц',        club: 'Дорнод аймаг',     pts: 0   },
]

const INIT_MEN: Row[] = [
  { rank: 1,  name: 'Оттонлүрзэв Г',  club: 'Төв аймаг',         pts: 6.5 },
  { rank: 2,  name: 'Батзориг О',      club: 'Дорноговь аймаг',  pts: 5.5 },
  { rank: 3,  name: 'Насанжаргал Б',   club: 'Сүхбаатар район',  pts: 5   },
  { rank: 4,  name: 'Галцог Н',        club: 'Завхан аймаг',      pts: 5   },
  { rank: 5,  name: 'Уурцайх',         club: 'Булган аймаг',      pts: 5   },
  { rank: 6,  name: 'Эрдэнэбилэг Ц',  club: 'Дархан-Уул аймаг', pts: 5   },
  { rank: 7,  name: 'Борхуу Б',        club: 'Хэнтий аймаг',     pts: 4   },
  { rank: 8,  name: 'Отгонбаяр А',     club: 'Өмнөговь аймаг',   pts: 4   },
  { rank: 9,  name: 'Алмасбек Х',      club: 'Баян-Өлгий аймаг', pts: 4   },
  { rank: 10, name: 'Төмэрбаатар Г',   club: 'Говь-Алтай аймаг', pts: 4   },
  { rank: 11, name: 'Энхтайван Г',     club: 'Өвэрхангай аймаг', pts: 4   },
  { rank: 12, name: 'Баярмагнай Ш',    club: 'Сүхбаатар аймаг',  pts: 3.5 },
  { rank: 13, name: 'Галбадрах Д',     club: 'Архангай аймаг',   pts: 3.5 },
  { rank: 14, name: 'Баярхуу Б',       club: 'Дорнод аймаг',     pts: 3   },
  { rank: 15, name: 'Батболд С',       club: 'Баянхонгор аймаг', pts: 3   },
  { rank: 16, name: 'Пурэвдорж С',     club: 'Хөвсгөл аймаг',   pts: 3   },
  { rank: 17, name: 'Энх-Оргил А',     club: 'Сэлэнгэ аймаг',   pts: 3   },
  { rank: 18, name: 'Эрдэнэ Ш',        club: 'Орхон аймаг',      pts: 3   },
  { rank: 19, name: 'Төмэрболд Б',     club: 'Ховд аймаг',        pts: 3   },
  { rank: 20, name: 'Батбаяр Х',       club: 'Ажилчны район',    pts: 2   },
  { rank: 21, name: 'Үйтүмэн Р',       club: 'Баянгол дүүрэг',  pts: 2   },
  { rank: 22, name: 'Даваадорж Б',     club: 'Дундговь аймаг',   pts: 2   },
  { rank: 23, name: 'Мэнх-Эрдэнэ Г',  club: 'Увс аймаг',         pts: 1   },
  { rank: 24, name: 'Чулуундорж С',    club: 'Найрамдлын район',  pts: 0   },
]

interface Props {
  tournamentId: string
  sportId: string
  initialWomen: Row[]
  initialMen: Row[]
}

function EditTable({
  rows, onChange,
}: {
  rows: Row[]
  onChange: (rows: Row[]) => void
}) {
  function set(i: number, field: keyof Row, val: any) {
    const next = rows.map((r, idx) => idx === i ? { ...r, [field]: val } : r)
    onChange(next)
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-surface-2 text-xs text-muted uppercase tracking-wide">
            <th className="p-2 text-center w-14">#</th>
            <th className="p-2 text-left">Тоглогч</th>
            <th className="p-2 text-left">Аймаг / Дүүрэг</th>
            <th className="p-2 text-center w-20">Оноо</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-border hover:bg-surface-2/40">
              <td className="p-1 text-center">
                <input
                  type="number" min={1}
                  value={row.rank}
                  onChange={e => set(i, 'rank', parseInt(e.target.value) || 1)}
                  className="input w-12 text-center py-1 text-xs"
                />
              </td>
              <td className="p-1">
                <input
                  value={row.name}
                  onChange={e => set(i, 'name', e.target.value)}
                  className="input w-full py-1"
                />
              </td>
              <td className="p-1">
                <input
                  value={row.club}
                  onChange={e => set(i, 'club', e.target.value)}
                  className="input w-full py-1"
                />
              </td>
              <td className="p-1 text-center">
                <input
                  value={fmtPts(row.pts)}
                  onChange={e => set(i, 'pts', parsePts(e.target.value))}
                  onBlur={e => {
                    const v = parsePts(e.target.value)
                    e.target.value = fmtPts(v)
                    set(i, 'pts', v)
                  }}
                  className="input w-16 text-center py-1 font-mono"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function ChessAdminClient({ tournamentId, sportId, initialWomen, initialMen }: Props) {
  const [women, setWomen] = useState<Row[]>(initialWomen.length > 0 ? initialWomen : INIT_WOMEN)
  const [men, setMen]     = useState<Row[]>(initialMen.length   > 0 ? initialMen   : INIT_MEN)
  const [tab, setTab]     = useState<'women' | 'men'>('women')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  async function save() {
    setSaving(true)
    try {
      const standings = [
        ...women.map(r => ({ ...r, gender: 'women' })),
        ...men.map(r => ({ ...r, gender: 'men' })),
      ]
      const res = await fetch(`/api/admin/chess/${sportId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId, standings }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 2500)
    } catch (e: any) {
      alert('Алдаа: ' + e.message)
      setStatus('error')
    }
    setSaving(false)
  }

  const saveBtnClass =
    status === 'saved' ? 'bg-live/90 text-black'
    : status === 'error' ? 'bg-danger text-white'
    : 'bg-primary text-primary-foreground hover:bg-primary/90'

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href={`/admin/${tournamentId}`} className="text-xs text-muted hover:text-foreground transition-colors">
            ← Удирдах самбар
          </Link>
          <h1 className="text-2xl font-bold mt-1 flex items-center gap-2">
            <span>♟️</span> Шатрын тэмцээний дүн
          </h1>
          <p className="text-xs text-muted mt-0.5">ГҮТББ 2026 · Swiss System</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className={`rounded-lg px-5 py-2.5 text-sm font-bold transition-colors shrink-0 ${saveBtnClass} ${saving ? 'opacity-60' : ''}`}
        >
          {saving ? 'Хадгалж байна…' : status === 'saved' ? '✓ Хадгалагдсан' : '💾 Хадгалах'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['women', 'men'] as const).map(g => (
          <button
            key={g}
            onClick={() => setTab(g)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors border ${
              tab === g
                ? 'bg-primary/20 border-primary/50 text-primary'
                : 'bg-surface border-border text-muted hover:text-foreground'
            }`}
          >
            {g === 'women' ? '♛ Эмэгтэй' : '♚ Эрэгтэй'}
            <span className="ml-1.5 text-xs opacity-60">
              ({g === 'women' ? women.length : men.length})
            </span>
          </button>
        ))}
      </div>

      {/* Info */}
      <p className="text-xs text-muted bg-surface rounded-lg border border-border px-3 py-2">
        Оноог <strong>3½</strong> эсвэл <strong>3.5</strong> хэлбэрээр оруулна. Байрлал хадгалсны дараа нийтийн <strong>/chess</strong> хуудсанд шинэчлэгдэнэ.
      </p>

      {/* Table */}
      {tab === 'women'
        ? <EditTable rows={women} onChange={setWomen} />
        : <EditTable rows={men} onChange={setMen} />
      }

      {/* Bottom save */}
      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className={`rounded-lg px-6 py-2.5 text-sm font-bold transition-colors ${saveBtnClass} ${saving ? 'opacity-60' : ''}`}
        >
          {saving ? 'Хадгалж байна…' : '💾 Хадгалах'}
        </button>
      </div>
    </div>
  )
}
