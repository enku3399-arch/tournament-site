'use client'
import { useEffect, useRef, useState } from 'react'
import type { TournamentSport } from '@/lib/types'
import { SPORT_ICONS, sportDisplayName, GENDER_LABELS } from '@/lib/types'

const MN_LETTERS = ['А','Б','В','Г','Д','Е','Ё','Ж','З','И','Й','К','Л','М','Н','О','Ө','П','Р','С','Т','У','Ү','Ф','Х','Ц','Ч','Ш','Щ','Ъ','Ы','Ь','Э','Ю','Я']
const RANKS = ['','Оюутан тамирчин','3-р зэрэг','2-р зэрэг','1-р зэрэг','Мастерийн нэр дэвшигч','Спортын мастер','Олон улсын мастер','ОУАТМ','Гавьяат тамирчин']
const HEALTH_OPTIONS = ['Эрүүл','Бэртсэн / гэмтсэн','Тэнцэхгүй']

/* Спортын төрөл тус бүрт зөвшөөрөгдөх тамирчны тоо */
const SPORT_MAX_ROWS: Record<string, number> = {
  volleyball:   12,
  basketball:   10,
  darts:         4,
  chess:         2,
  table_tennis:  4,
  tennis:        4,   // DB uses "tennis" for ширээний теннис
  wrestling:     1,
  custom:        5,
}
function getMaxRows(sport_type: string) { return SPORT_MAX_ROWS[sport_type] ?? 5 }

type AthleteRow = {
  _id: number
  photo: string
  name: string
  reg_l1: string
  reg_l2: string
  reg_num: string
  personal_num: string
  rank: string
  position: string
  school: string
  health: string
}

function emptyRow(id: number): AthleteRow {
  return { _id: id, photo: '', name: '', reg_l1: 'У', reg_l2: 'А', reg_num: '', personal_num: '', rank: '', position: '', school: '', health: 'Эрүүл' }
}

interface Props {
  tournamentId: string
  tournamentName: string
  sports: TournamentSport[]
  existingTeams: string[]
}

export default function AthleteForm({ tournamentId, tournamentName, sports, existingTeams }: Props) {
  const idRef = useRef(0)
  function newId() { return ++idRef.current }

  const [teamName, setTeamName] = useState('')
  const [captainName, setCaptainName] = useState('')
  const [coachName, setCoachName] = useState('')
  const [contactPhone, setContactPhone] = useState('')

  // Per-sport rows keyed by sport.id
  const [sportRows, setSportRows] = useState<Record<string, AthleteRow[]>>(() => {
    const init: Record<string, AthleteRow[]> = {}
    sports.forEach(s => {
      init[s.id] = Array.from({ length: getMaxRows(s.sport_type) }, () => emptyRow(++idRef.current))
    })
    return init
  })

  const [uploadingId, setUploadingId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showPrint, setShowPrint] = useState(false)
  const [done, setDone] = useState<{ teamName: string; total: number; sports: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null)
  const [showDraftBanner, setShowDraftBanner] = useState(false)
  const [draftMsg, setDraftMsg] = useState('')

  const DRAFT_KEY = `reg-draft-${tournamentId}`

  // Load draft indicator on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) {
        const d = JSON.parse(raw)
        if (d.savedAt) { setDraftSavedAt(d.savedAt); setShowDraftBanner(true) }
      }
    } catch { /* ignore */ }
  }, [DRAFT_KEY])

  function saveDraft() {
    try {
      const ts = Date.now()
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ teamName, captainName, coachName, contactPhone, sportRows, savedAt: ts }))
      setDraftSavedAt(ts)
      setDraftMsg('Хадгалагдлаа ✓')
      setTimeout(() => setDraftMsg(''), 2000)
    } catch { /* ignore */ }
  }

  function restoreDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) return
      const d = JSON.parse(raw)
      if (d.teamName !== undefined) setTeamName(d.teamName)
      if (d.captainName !== undefined) setCaptainName(d.captainName)
      if (d.coachName !== undefined) setCoachName(d.coachName)
      if (d.contactPhone !== undefined) setContactPhone(d.contactPhone)
      if (d.sportRows) setSportRows(prev => {
        const next = { ...prev }
        Object.keys(d.sportRows).forEach(sid => { if (next[sid]) next[sid] = d.sportRows[sid] })
        return next
      })
      setShowDraftBanner(false)
    } catch { /* ignore */ }
  }

  function handlePrint() {
    const el = document.getElementById('print-pages')
    if (!el) { window.print(); return }
    const iframe = document.createElement('iframe')
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:none;'
    document.body.appendChild(iframe)
    const doc = iframe.contentDocument ?? iframe.contentWindow?.document
    if (!doc) { document.body.removeChild(iframe); window.print(); return }
    doc.open()
    doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      *{box-sizing:border-box;margin:0;padding:0;}
      body{font-family:'Times New Roman',Times,serif;background:white;color:#000;}
      .print-page{width:210mm;padding:10mm 12mm;margin:0 auto;page-break-after:always;}
      .print-page:last-child{page-break-after:auto;}
      p.title{text-align:center;font-size:10pt;font-weight:700;text-transform:uppercase;line-height:1.5;margin-bottom:6px;}
      table{width:100%;border-collapse:collapse;table-layout:fixed;}
      th{background:#d9e1f2;border:1.5px solid #000;padding:3px 4px;text-align:center;font-weight:700;font-size:8pt;line-height:1.3;vertical-align:middle;}
      td{border:1px solid #000;vertical-align:middle;font-size:9pt;}
      .tc{text-align:center;padding:2px;}
      .tl{padding:0 4px;}
      .ts{font-size:8pt;}
      .tf{font-family:monospace;font-size:8pt;text-align:center;}
      img{display:block;object-fit:cover;max-width:100%;height:100%;}
      .footer{display:flex;gap:32px;margin-top:10px;font-size:10pt;flex-wrap:wrap;}
      .foot-date{text-align:center;margin-top:8px;font-size:10pt;}
      .uline{border-bottom:1px solid #000;display:inline-block;min-width:80px;padding-bottom:1px;}
      @page{size:A4 portrait;margin:0;}
    </style></head><body>${el.innerHTML}</body></html>`)
    doc.close()
    setTimeout(() => {
      iframe.contentWindow?.print()
      setTimeout(() => { try { document.body.removeChild(iframe) } catch { /* */ } }, 2000)
    }, 500)
  }

  function updRow(sportId: string, rowId: number, field: keyof Omit<AthleteRow, '_id'>, val: string) {
    setSportRows(prev => ({
      ...prev,
      [sportId]: prev[sportId].map(r => r._id === rowId ? { ...r, [field]: val } : r),
    }))
  }
  function addRow(sportId: string) {
    setSportRows(prev => ({ ...prev, [sportId]: [...prev[sportId], emptyRow(newId())] }))
  }
  function removeRow(sportId: string, rowId: number) {
    setSportRows(prev => {
      const next = prev[sportId].filter(r => r._id !== rowId)
      return { ...prev, [sportId]: next.length ? next : prev[sportId] }
    })
  }

  async function uploadPhoto(sportId: string, rowId: number, file: File) {
    setUploadingId(rowId)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (json.url) updRow(sportId, rowId, 'photo', json.url)
    } catch { /* silent */ }
    setUploadingId(null)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!teamName.trim()) { setError('Байгууллага / аймгийн нэрийг сонгоно уу'); return }

    const activeSports = sports.filter(s => (sportRows[s.id] ?? []).some(r => r.name.trim()))
    if (!activeSports.length) { setError('Дор хаяж нэг тамирчны нэр оруулна уу'); return }

    setSubmitting(true); setError(null)
    try {
      let totalAthletes = 0
      for (const sport of activeSports) {
        const filled = (sportRows[sport.id] ?? []).filter(r => r.name.trim())
        totalAthletes += filled.length
        const athletes = filled.map(r => {
          const reg = r.reg_num ? `${r.reg_l1}${r.reg_l2}${r.reg_num}` : null
          const notes: Record<string, string> = {}
          if (r.personal_num) notes['Хувийн дугаар'] = r.personal_num
          if (r.position)     notes['Тоглолтын байрлал'] = r.position
          if (r.school)       notes['Төгссөн сургууль'] = r.school
          if (r.health)       notes['Эрүүл мэндийн байдал'] = r.health
          if (r.photo)        notes['Зураг'] = r.photo
          return {
            name: r.name.trim(), register_number: reg, rank: r.rank || null,
            participation_type: sportDisplayName(sport),
            affiliation: null, phone: null,
            notes: Object.keys(notes).length ? notes : null,
          }
        })
        const res = await fetch('/api/registrations', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tournament_id: tournamentId, sport_id: sport.id,
            team_name: teamName.trim(),
            contact_name: coachName.trim() || captainName.trim() || null,
            contact_phone: contactPhone.trim() || null, athletes,
            notes: { captain: captainName.trim() || null, coach: coachName.trim() || null },
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(`${sportDisplayName(sport)}: ${data.error ?? 'Алдаа гарлаа'}`)
      }
      try { localStorage.removeItem(DRAFT_KEY) } catch { /* */ }
      setDone({ teamName: teamName.trim(), total: totalAthletes, sports: activeSports.length })
    } catch (e: unknown) { setError((e as Error).message) }
    setSubmitting(false)
  }

  function reset() {
    setDone(null); setTeamName(''); setCaptainName(''); setCoachName(''); setContactPhone(''); setError(null)
    setSportRows(() => {
      const init: Record<string, AthleteRow[]> = {}
      sports.forEach(s => { init[s.id] = Array.from({ length: getMaxRows(s.sport_type) }, () => emptyRow(newId())) })
      return init
    })
  }

  /* ── Done ── */
  if (done) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4 max-w-sm">
        <div className="text-6xl">🎉</div>
        <h2 className="text-2xl font-bold">Мэдүүлэг амжилттай илгээгдлээ!</h2>
        <div className="rounded-xl border border-live/30 bg-live/10 p-4 text-sm space-y-1">
          <p className="font-semibold text-live">{done.teamName}</p>
          <p className="text-muted">{done.sports} спортын төрөлд {done.total} тамирчин бүртгэгдлээ</p>
        </div>
        <p className="text-sm text-muted">Зохион байгуулагч хянаж баталгаажуулна</p>
        <button onClick={reset} className="text-sm text-primary hover:underline">← Дахин бөглөх</button>
      </div>
    </div>
  )

  const today = new Date()
  const filledSports = sports.filter(s => (sportRows[s.id] ?? []).some(r => r.name.trim()))

  /* shared print table styles */
  const th: React.CSSProperties = { border: '1.5px solid #000', padding: '3px 4px', textAlign: 'center', fontWeight: 700, fontSize: 8, lineHeight: 1.3, verticalAlign: 'middle', background: '#d9e1f2' }
  const td0: React.CSSProperties = { border: '1px solid #000', verticalAlign: 'middle', textAlign: 'center', fontSize: 9 }
  const tdL: React.CSSProperties = { border: '1px solid #000', verticalAlign: 'middle', padding: '0 4px', fontSize: 9 }
  const ROW_H = '18mm'
  const PHOTO_H = 'calc(18mm - 2px)'

  /* ── Print Preview ── */
  if (showPrint) return (
    <div id="print-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 12px' }}>
      {/* Controls — hidden when printing */}
      <div className="no-print" style={{ display: 'flex', gap: 12, marginBottom: 20, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={handlePrint} style={{ background: '#1a56db', color: '#fff', padding: '10px 28px', borderRadius: 8, fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          🖨️ Хэвлэх
        </button>
        <button onClick={() => setShowPrint(false)} style={{ background: '#374151', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
          ← Буцах
        </button>
      </div>

      {/* All sport pages in one wrapper for iframe print */}
      <div id="print-pages">
        {sports.map(sport => {
          const rows = sportRows[sport.id] ?? []
          const maxRows = getMaxRows(sport.sport_type)
          const printRows = rows.length < maxRows
            ? [...rows, ...Array.from({ length: maxRows - rows.length }, () => ({ _id: -1 } as AthleteRow))]
            : rows

          const sportName = sportDisplayName(sport).toUpperCase()
          const hasGender = /ЭРЭГТЭЙ|ЭМЭГТЭЙ/.test(sportName)
          const genderSuffix = !hasGender && sport.gender
            ? (sport.gender === 'male' ? ' ЭРЭГТЭЙ' : ' ЭМЭГТЭЙ')
            : ''

          return (
            <div key={sport.id} className="print-page" style={{
              background: '#fff', width: '210mm', marginBottom: 24,
              padding: '10mm 12mm', boxSizing: 'border-box',
              boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
              fontFamily: '"Times New Roman", Times, serif', color: '#000',
            }}>
              <p className="title" style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', lineHeight: 1.5, margin: '0 0 6px' }}>
                &ldquo;МОНГОЛ 87/89&rdquo; V СПОРТ НААДАМ-2026 ТЭМЦЭЭНД ОРОЛЦОХ{' '}
                {teamName ? teamName.toUpperCase() : '.............................'}{' '}
                АЙМГИЙН {sportName}{genderSuffix} БАГ ТАМИРЧДЫН МЭДҮҮЛЭГ
              </p>

              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '4.5%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '19%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '5.5%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '11%' }} />
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '11.5%' }} />
                </colgroup>
                <thead>
                  <tr>
                    {['д/д','Зураг','Багийн гишүүдийн овог нэр','Регистрийн дугаар','Хувийн дугаар','Спортын цол зэрэг','Тоглолтын байрлал','Төгссөн сургууль','Эрүүл мэндийн байдал']
                      .map((h, i) => <th key={i} style={th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {printRows.map((row, i) => {
                    const alive = row._id > 0
                    return (
                      <tr key={i} style={{ height: ROW_H }}>
                        <td className="tc" style={td0}>{i + 1}</td>
                        <td style={{ ...td0, padding: 1 }}>
                          {alive && row.photo
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={row.photo} alt="" style={{ height: PHOTO_H, width: '100%', objectFit: 'cover', display: 'block' }} />
                            : null}
                        </td>
                        <td className="tl" style={tdL}>{alive ? row.name : ''}</td>
                        <td className="tf" style={{ ...td0, fontFamily: 'monospace', fontSize: 8 }}>
                          {alive ? `${row.reg_l1 ?? ''}${row.reg_l2 ?? ''}${row.reg_num ?? ''}` : ''}
                        </td>
                        <td className="tc" style={td0}>{alive ? row.personal_num : ''}</td>
                        <td className="tl ts" style={{ ...tdL, fontSize: 8 }}>{alive ? row.rank : ''}</td>
                        <td className="tl" style={tdL}>{alive ? row.position : ''}</td>
                        <td className="tl ts" style={{ ...tdL, fontSize: 8 }}>{alive ? row.school : ''}</td>
                        <td className="tl" style={tdL}>{alive ? row.health : ''}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              <div className="footer" style={{ display: 'flex', gap: 32, marginTop: 10, fontSize: 10, flexWrap: 'wrap' }}>
                <span><b>Багийн ахлагч:</b>{' '}<span className="uline" style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: 100, paddingBottom: 1 }}>{captainName}</span></span>
                <span><b>Дасгалжуулагч:</b>{' '}<span className="uline" style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: 100, paddingBottom: 1 }}>{coachName}</span></span>
                <span><b>Утас:</b>{' '}<span className="uline" style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: 72 }}>{contactPhone}</span></span>
              </div>
              <p className="foot-date" style={{ textAlign: 'center', marginTop: 8, fontSize: 10 }}>
                2026 оны 06 дугаар сарын{' '}
                <span className="uline" style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: 20 }}>{today.getDate()}</span>
                -ний өдөр
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )

  /* ── Main Form ── */
  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Draft restore banner */}
      {showDraftBanner && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-primary">🗂️ Хадгалсан ноорог байна</p>
            <p className="text-xs text-muted mt-0.5">
              {draftSavedAt ? new Date(draftSavedAt).toLocaleString('mn-MN') : ''} үед хадгалсан
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={restoreDraft}
              className="text-sm font-semibold text-primary border border-primary/40 rounded-lg px-4 py-1.5 hover:bg-primary/10 transition-colors">
              Сэргээх
            </button>
            <button type="button" onClick={() => setShowDraftBanner(false)}
              className="text-sm text-muted hover:text-foreground px-2">✕</button>
          </div>
        </div>
      )}

      <div className="text-center space-y-1 py-2">
        <p className="text-sm text-muted">{tournamentName}</p>
        <h1 className="text-2xl font-extrabold tracking-tight">БАГ ТАМИРЧДЫН МЭДҮҮЛЭГ</h1>
      </div>

      {/* Team info */}
      <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider">Байгууллага / Багийн мэдээлэл</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-sm text-muted mb-1 font-medium">Байгууллага / Аймаг / Баг *</label>
            {existingTeams.length > 0 ? (
              <>
                <input required list="team-datalist" className="input" placeholder="— сонгох эсвэл бичих"
                  value={teamName} onChange={e => setTeamName(e.target.value)} />
                <datalist id="team-datalist">
                  {existingTeams.map(t => <option key={t} value={t} />)}
                </datalist>
              </>
            ) : (
              <input required className="input" placeholder="жишээ: Архангай аймаг" value={teamName} onChange={e => setTeamName(e.target.value)} />
            )}
          </div>
          <div>
            <label className="block text-sm text-muted mb-1 font-medium">Багийн ахлагч</label>
            <input className="input" placeholder="Овог нэр" value={captainName} onChange={e => setCaptainName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1 font-medium">Дасгалжуулагч</label>
            <input className="input" placeholder="Овог нэр" value={coachName} onChange={e => setCoachName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1 font-medium">Холбогдох утас</label>
            <input type="tel" className="input" placeholder="99xxxxxx" value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Per-sport tables */}
      {sports.map(sport => {
        const rows = sportRows[sport.id] ?? []
        const filled = rows.filter(r => r.name.trim()).length
        const genderLabel = sport.gender ? ` · ${GENDER_LABELS[sport.gender]}` : ''
        const icon = SPORT_ICONS[sport.sport_type] ?? '🏅'

        return (
          <div key={sport.id} className="rounded-xl border border-border bg-surface overflow-hidden">
            {/* Sport header */}
            <div className="flex items-center justify-between px-5 py-3 bg-surface-2 border-b border-border gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-lg">{icon}</span>
                <div>
                  <p className="font-bold text-sm">
                    {sport.name || ''}{genderLabel}
                    <span className="ml-2 text-xs font-normal text-muted">
                      (хамгийн ихдээ {getMaxRows(sport.sport_type)} тамирчин)
                    </span>
                  </p>
                  {filled > 0 && <p className="text-xs text-primary">{filled} тамирчин бөглөгдсөн</p>}
                </div>
              </div>
              <button type="button" onClick={() => addRow(sport.id)}
                className="text-xs text-primary hover:underline font-medium">+ Мөр нэмэх</button>
            </div>

            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-surface-2/50 text-muted">
                    <th className="px-2 py-2 text-center w-8">Д/д</th>
                    <th className="px-2 py-2 text-center w-12">Зураг</th>
                    <th className="px-2 py-2 text-left min-w-36">Овог нэр</th>
                    <th className="px-2 py-2 text-left min-w-44">Регистрийн дугаар</th>
                    <th className="px-2 py-2 text-center w-14">Хувийн №</th>
                    <th className="px-2 py-2 text-left min-w-32">Спортын цол зэрэг</th>
                    <th className="px-2 py-2 text-left min-w-24">Тоглолтын байрлал</th>
                    <th className="px-2 py-2 text-left min-w-28">Төгссөн сургууль</th>
                    <th className="px-2 py-2 text-left min-w-28">Эрүүл мэндийн байдал</th>
                    <th className="w-7"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((row, i) => (
                    <tr key={row._id} className="hover:bg-surface-2/40">
                      <td className="px-2 py-1 text-muted font-mono text-center">{i + 1}</td>

                      {/* Photo */}
                      <td className="px-1 py-1 text-center">
                        <label className="cursor-pointer inline-block">
                          {uploadingId === row._id
                            ? <div className="w-9 h-9 rounded border border-border flex items-center justify-center text-[9px] text-muted">⏳</div>
                            : row.photo
                              // eslint-disable-next-line @next/next/no-img-element
                              ? <img src={row.photo} alt="" className="w-9 h-9 object-cover rounded border border-border" />
                              : <div className="w-9 h-9 rounded border border-dashed border-border flex items-center justify-center text-sm text-muted hover:border-primary hover:text-primary transition-colors">📷</div>
                          }
                          <input type="file" accept="image/*" className="hidden" disabled={uploadingId !== null}
                            onChange={e => { const f = e.target.files?.[0]; if (f) uploadPhoto(sport.id, row._id, f); e.target.value = '' }} />
                        </label>
                      </td>

                      <td className="px-1 py-1">
                        <input className="input text-xs py-1 px-2 w-full" placeholder="Батбаяр Дорж"
                          value={row.name} onChange={e => updRow(sport.id, row._id, 'name', e.target.value)} />
                      </td>

                      <td className="px-1 py-1">
                        <div className="flex items-center gap-0.5">
                          <select className="input text-xs py-1 px-1 w-10 font-mono text-center appearance-none cursor-pointer"
                            value={row.reg_l1} onChange={e => updRow(sport.id, row._id, 'reg_l1', e.target.value)}>
                            {MN_LETTERS.map(l => <option key={l} value={l}>{l}</option>)}
                          </select>
                          <select className="input text-xs py-1 px-1 w-10 font-mono text-center appearance-none cursor-pointer"
                            value={row.reg_l2} onChange={e => updRow(sport.id, row._id, 'reg_l2', e.target.value)}>
                            {MN_LETTERS.map(l => <option key={l} value={l}>{l}</option>)}
                          </select>
                          <input className="input text-xs py-1 px-2 w-20 font-mono tracking-widest" placeholder="00000000" maxLength={8}
                            value={row.reg_num} onChange={e => updRow(sport.id, row._id, 'reg_num', e.target.value.replace(/\D/g, '').slice(0, 8))} />
                        </div>
                      </td>

                      <td className="px-1 py-1">
                        <input className="input text-xs py-1 px-1 w-14 font-mono text-center" placeholder="00" maxLength={2}
                          value={row.personal_num} onChange={e => updRow(sport.id, row._id, 'personal_num', e.target.value.replace(/\D/g, '').slice(0, 2))} />
                      </td>

                      <td className="px-1 py-1">
                        <select className="input text-xs py-1 px-2 w-full"
                          value={row.rank} onChange={e => updRow(sport.id, row._id, 'rank', e.target.value)}>
                          {RANKS.map(r => <option key={r} value={r}>{r || '— сонгох'}</option>)}
                        </select>
                      </td>

                      <td className="px-1 py-1">
                        <input className="input text-xs py-1 px-2 w-full" placeholder="Байрлал"
                          value={row.position} onChange={e => updRow(sport.id, row._id, 'position', e.target.value)} />
                      </td>

                      <td className="px-1 py-1">
                        <input className="input text-xs py-1 px-2 w-full" placeholder="Сургуулийн нэр"
                          value={row.school} onChange={e => updRow(sport.id, row._id, 'school', e.target.value)} />
                      </td>

                      <td className="px-1 py-1">
                        <select className="input text-xs py-1 px-2 w-full"
                          value={row.health} onChange={e => updRow(sport.id, row._id, 'health', e.target.value)}>
                          <option value="">— сонгох</option>
                          {HEALTH_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </td>

                      <td className="px-1 py-1 text-center">
                        <button type="button" onClick={() => removeRow(sport.id, row._id)}
                          className="text-muted hover:text-danger transition-colors text-sm">✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden divide-y divide-border">
              {rows.map((row, i) => (
                <div key={row._id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted bg-surface-2 rounded-full px-2 py-0.5">#{i + 1}</span>
                    <button type="button" onClick={() => removeRow(sport.id, row._id)}
                      className="text-xs text-muted hover:text-danger">✕</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2 flex items-center gap-3">
                      <label className="cursor-pointer">
                        {uploadingId === row._id
                          ? <div className="w-12 h-12 rounded border border-border flex items-center justify-center text-xs text-muted">⏳</div>
                          : row.photo
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={row.photo} alt="" className="w-12 h-12 object-cover rounded border border-border" />
                            : <div className="w-12 h-12 rounded border-2 border-dashed border-border flex items-center justify-center text-xl text-muted hover:border-primary transition-colors">📷</div>
                        }
                        <input type="file" accept="image/*" className="hidden" disabled={uploadingId !== null}
                          onChange={e => { const f = e.target.files?.[0]; if (f) uploadPhoto(sport.id, row._id, f); e.target.value = '' }} />
                      </label>
                      <div className="flex-1">
                        <label className="text-xs text-muted font-medium">Зураг</label>
                        <p className="text-[11px] text-muted/60">{row.photo ? '✓ Байршуулсан' : 'Дарж оруулах'}</p>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-muted font-medium">Овог нэр</label>
                      <input className="input mt-1" value={row.name} placeholder="Батбаяр Дорж"
                        onChange={e => updRow(sport.id, row._id, 'name', e.target.value)} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-muted font-medium">Регистрийн дугаар</label>
                      <div className="flex gap-1 mt-1">
                        <select className="input py-2 px-2 w-14 font-mono text-center text-sm" value={row.reg_l1} onChange={e => updRow(sport.id, row._id, 'reg_l1', e.target.value)}>
                          {MN_LETTERS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                        <select className="input py-2 px-2 w-14 font-mono text-center text-sm" value={row.reg_l2} onChange={e => updRow(sport.id, row._id, 'reg_l2', e.target.value)}>
                          {MN_LETTERS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                        <input className="input flex-1 font-mono tracking-widest" placeholder="00000000" maxLength={8}
                          value={row.reg_num} onChange={e => updRow(sport.id, row._id, 'reg_num', e.target.value.replace(/\D/g, '').slice(0, 8))} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted font-medium">Хувийн №</label>
                      <input className="input mt-1 font-mono text-center w-16" placeholder="00" maxLength={2}
                        value={row.personal_num} onChange={e => updRow(sport.id, row._id, 'personal_num', e.target.value.replace(/\D/g, '').slice(0, 2))} />
                    </div>
                    <div>
                      <label className="text-xs text-muted font-medium">Цол зэрэг</label>
                      <select className="input mt-1 text-sm" value={row.rank} onChange={e => updRow(sport.id, row._id, 'rank', e.target.value)}>
                        {RANKS.map(r => <option key={r} value={r}>{r || '— сонгох'}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted font-medium">Тоглолтын байрлал</label>
                      <input className="input mt-1" placeholder="Байрлал" value={row.position}
                        onChange={e => updRow(sport.id, row._id, 'position', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-muted font-medium">Төгссөн сургууль</label>
                      <input className="input mt-1" placeholder="Сургуулийн нэр" value={row.school}
                        onChange={e => updRow(sport.id, row._id, 'school', e.target.value)} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-muted font-medium">Эрүүл мэндийн байдал</label>
                      <select className="input mt-1 text-sm" value={row.health} onChange={e => updRow(sport.id, row._id, 'health', e.target.value)}>
                        <option value="">— сонгох</option>
                        {HEALTH_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 py-2.5 border-t border-border bg-surface-2/30 text-xs text-muted text-right">
              {filled > 0 ? `✓ ${filled} тамирчин бөглөгдсөн` : 'Хоосон — энэ спортын мэдүүлэг илгээгдэхгүй'}
            </div>
          </div>
        )
      })}

      {error && <div className="rounded-lg bg-danger/10 border border-danger/30 p-3 text-sm text-danger">{error}</div>}

      {filledSports.length > 0 && (
        <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-2.5 text-sm text-primary">
          Илгээх: {filledSports.map(s => `${s.name}${s.gender ? ` (${GENDER_LABELS[s.gender]})` : ''}`).join(' · ')}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button type="button" onClick={saveDraft}
          className="rounded-xl border border-border bg-surface px-5 py-4 text-sm font-semibold hover:bg-surface-2 transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
          🗂️ {draftMsg || (draftSavedAt ? 'Ноорог шинэчлэх' : 'Ноорог хадгалах')}
        </button>
        <button type="button" onClick={() => setShowPrint(true)}
          className="flex-1 rounded-xl border border-border bg-surface py-4 text-base font-semibold hover:bg-surface-2 transition-colors flex items-center justify-center gap-2">
          🖨️ Хэвлэх урьдчилж харах
        </button>
        <button type="submit" disabled={submitting}
          className="flex-1 rounded-xl bg-primary py-4 text-base font-bold text-white hover:bg-primary-hover disabled:opacity-40 transition-colors">
          {submitting ? 'Илгээж байна...' : `📋 Мэдүүлэг илгээх${filledSports.length > 0 ? ` (${filledSports.length} спорт)` : ''}`}
        </button>
      </div>
    </form>
  )
}
