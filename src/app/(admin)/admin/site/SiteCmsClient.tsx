'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { SiteSettings, NavLink, Sponsor, StatItem, HostAimag, SiteAbout, AboutFact, AboutValue, AboutEdition, HomeSections, NewsArticle, NewsTag, MedalRow, ScheduleDay, ScheduleEvent, FooterNav, ScoringLink } from '@/lib/site-settings'

type Tab = 'general' | 'hero' | 'nav' | 'sponsors' | 'stats' | 'media' | 'aimags' | 'about' | 'schedule' | 'footer' | 'sections' | 'news' | 'medals' | 'scoring' | 'history'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'general',  label: 'Ерөнхий',         icon: '⚙️' },
  { id: 'hero',     label: 'Hero',             icon: '🏔' },
  { id: 'nav',      label: 'Навигац',           icon: '📋' },
  { id: 'sponsors', label: 'Спонсор',           icon: '🤝' },
  { id: 'stats',    label: 'Тоо баримт',        icon: '📊' },
  { id: 'media',    label: 'Зураг / Лого',      icon: '🖼' },
  { id: 'aimags',   label: 'Зохион байгуулагч', icon: '🏛' },
  { id: 'about',    label: 'Наадмын тухай',     icon: '📖' },
  { id: 'schedule', label: 'Хуваарь',           icon: '📅' },
  { id: 'footer',   label: 'Footer цэс',        icon: '🔗' },
  { id: 'news',     label: 'Мэдээ',             icon: '📰' },
  { id: 'medals',   label: 'Медалийн хүснэгт',  icon: '🏅' },
  { id: 'scoring',  label: 'Оноо / Линк',       icon: '🔌' },
  { id: 'sections', label: 'Нүүр хуудас',       icon: '🔲' },
  { id: 'history',  label: 'Наадмын дүн',      icon: '🏆' },
]

const TIER_LABELS: Record<string, string> = {
  platinum: 'Алтан гишүүн',
  gold:     'Дэмжигч',
  silver:   'Хамтрагч',
}

function SaveBar({ saving, saved }: { saving: boolean; saved: boolean }) {
  return (
    <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border">
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-primary/20 text-primary border border-primary/40 px-5 py-2 text-sm font-semibold hover:bg-primary/30 transition-colors disabled:opacity-50"
      >
        {saving ? 'Хадгалж байна...' : '💾 Хадгалах'}
      </button>
      {saved && <span className="text-sm text-live font-medium">✓ Хадгалагдлаа</span>}
    </div>
  )
}

function Field({
  label, value, onChange, type = 'text', hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: 'text' | 'textarea' | 'url'
  hint?: string
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-muted uppercase tracking-wider">{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:border-primary/50"
        />
      ) : (
        <input
          type={type === 'url' ? 'url' : 'text'}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
        />
      )}
      {hint && <p className="text-[11px] text-muted/70">{hint}</p>}
    </div>
  )
}

/* ── GENERAL TAB ──────────────────────────────────────────────────────────── */
function GeneralTab({ data, onSave }: { data: SiteSettings['general']; onSave: (v: SiteSettings['general']) => Promise<void> }) {
  const [form, setForm] = useState(data)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function set(key: keyof typeof form) {
    return (v: string) => setForm(f => ({ ...f, [key]: v }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setSaved(false)
    try {
      await onSave(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch { /* error shown globally */ }
    setSaving(false)
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Сайтын нэр" value={form.siteName} onChange={set('siteName')} />
        <Field label="Уриа (motto)" value={form.motto} onChange={set('motto')} />
        <Field label="Гарчигт огноо" value={form.dateDisplay} onChange={set('dateDisplay')} hint='Жишээ: "06.11 — 06.13"' />
        <Field label="Заал (товч)" value={form.venue} onChange={set('venue')} hint='Жишээ: "Буянт Ухаа"' />
        <Field label="Заал (дэлгэрэнгүй)" value={form.venueAddress} onChange={set('venueAddress')} hint='"Буянт Ухаа" спорт ордон' />
        <Field label="Зохион байгуулагч аймгууд (текст)" value={form.hostAimags} onChange={set('hostAimags')} hint="Цэгтэй таслалаар тусгаарла" />
        <Field label="Аймгийн тоо" value={form.teamCount} onChange={set('teamCount')} hint='Жишээ: "21"' />
        <Field label="Тамирчдын тоо" value={form.athleteCount} onChange={set('athleteCount')} hint='Жишээ: "1,240+"' />
      </div>

      <hr className="border-border" />
      <p className="text-xs font-bold text-muted uppercase tracking-wider">Холбоо барих</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Утас" value={form.phone} onChange={set('phone')} />
        <Field label="Email" value={form.email} onChange={set('email')} />
        <Field label="Хаяг" value={form.address} onChange={set('address')} />
        <div />
        <Field label="Facebook URL" value={form.facebook} onChange={set('facebook')} type="url" />
        <Field label="YouTube URL" value={form.youtube} onChange={set('youtube')} type="url" />
      </div>

      <SaveBar saving={saving} saved={saved} />
    </form>
  )
}

/* ── HERO TAB ─────────────────────────────────────────────────────────────── */
function HeroTab({ data, onSave }: { data: SiteSettings['hero']; onSave: (v: SiteSettings['hero']) => Promise<void> }) {
  const [form, setForm] = useState(data)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function set(key: keyof typeof form) {
    return (v: string) => setForm(f => ({ ...f, [key]: v }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setSaved(false)
    try {
      await onSave(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch { /* error shown globally */ }
    setSaving(false)
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-xs text-muted">Hero гарчиг 3 мөрөнд хуваагдана</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Гарчиг 1-р мөр" value={form.title1} onChange={set('title1')} hint='Жишээ: "МОНГОЛ"' />
        <Field label="Гарчиг 2-р мөр" value={form.title2} onChange={set('title2')} hint='Жишээ: "87 / 89"' />
        <Field label="Гарчиг 3-р мөр" value={form.title3} onChange={set('title3')} hint='Жишээ: "СПОРТ НААДАМ"' />
      </div>
      <Field
        label="Дэд гарчиг (subtitle)"
        value={form.subtitle}
        onChange={set('subtitle')}
        type="textarea"
      />
      <SaveBar saving={saving} saved={saved} />
    </form>
  )
}

/* ── NAV TAB ──────────────────────────────────────────────────────────────── */
function NavTab({ data, onSave }: { data: NavLink[]; onSave: (v: NavLink[]) => Promise<void> }) {
  const [links, setLinks] = useState<NavLink[]>(data)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function update(i: number, field: keyof NavLink, val: string) {
    setLinks(prev => prev.map((l, idx) => idx === i ? { ...l, [field]: val } : l))
  }
  function remove(i: number) {
    setLinks(prev => prev.filter((_, idx) => idx !== i))
  }
  function add() {
    setLinks(prev => [...prev, { href: '/', label: 'Шинэ цэс' }])
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= links.length) return
    const next = [...links]
    ;[next[i], next[j]] = [next[j], next[i]]
    setLinks(next)
  }

  async function save() {
    setSaving(true); setSaved(false)
    try { await onSave(links); setSaved(true); setTimeout(() => setSaved(false), 3000) }
    catch { /* error shown globally */ }
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">Дарааллыг ↑↓ товчоор солих боломжтой</p>
      <div className="space-y-2">
        {links.map((link, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2">
            <div className="flex flex-col gap-0.5">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-muted hover:text-foreground disabled:opacity-20 text-xs leading-none">▲</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === links.length - 1} className="text-muted hover:text-foreground disabled:opacity-20 text-xs leading-none">▼</button>
            </div>
            <input
              value={link.label}
              onChange={e => update(i, 'label', e.target.value)}
              placeholder="Нэр"
              className="flex-1 rounded border border-border bg-surface px-2 py-1 text-sm text-foreground focus:outline-none focus:border-primary/50 min-w-0"
            />
            <input
              value={link.href}
              onChange={e => update(i, 'href', e.target.value)}
              placeholder="/path"
              className="w-40 rounded border border-border bg-surface px-2 py-1 text-sm font-mono text-muted focus:outline-none focus:border-primary/50"
            />
            <button type="button" onClick={() => remove(i)} className="text-danger/70 hover:text-danger text-sm px-1">✕</button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="text-sm text-primary hover:text-primary/80 border border-dashed border-primary/40 rounded-lg px-4 py-2 w-full transition-colors"
      >
        + Цэс нэмэх
      </button>
      <div className="flex items-center gap-3 pt-2 border-t border-border mt-4">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-primary/20 text-primary border border-primary/40 px-5 py-2 text-sm font-semibold hover:bg-primary/30 transition-colors disabled:opacity-50"
        >
          {saving ? 'Хадгалж байна...' : '💾 Хадгалах'}
        </button>
        {saved && <span className="text-sm text-live font-medium">✓ Хадгалагдлаа</span>}
      </div>
    </div>
  )
}

/* ── SPONSORS TAB ─────────────────────────────────────────────────────────── */
function SponsorsTab({ data, onSave }: { data: Sponsor[]; onSave: (v: Sponsor[]) => Promise<void> }) {
  const [sponsors, setSponsors] = useState<Sponsor[]>(data)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function update(id: string, field: keyof Sponsor, val: string) {
    setSponsors(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s))
  }
  function remove(id: string) {
    setSponsors(prev => prev.filter(s => s.id !== id))
  }
  function add(tier: Sponsor['tier']) {
    setSponsors(prev => [...prev, {
      id: crypto.randomUUID(),
      tier,
      name: 'Шинэ спонсор',
      logoPath: '',
      website: '',
    }])
  }

  async function save() {
    setSaving(true); setSaved(false)
    try { await onSave(sponsors); setSaved(true); setTimeout(() => setSaved(false), 3000) }
    catch { /* error shown globally */ }
    setSaving(false)
  }

  const tiers: Sponsor['tier'][] = ['platinum', 'gold', 'silver']

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-xs text-muted space-y-1">
        <p className="font-semibold text-foreground/70">📁 Спонсорын лого хадгалах байршил:</p>
        <p><code className="text-accent">/public/media/sponsors/sponsor-name.png</code></p>
        <p>Зөвлөмж хэмжээ: <b className="text-foreground">240×80px</b> PNG, цагаан ар дэвсгэртэй эсвэл transparent</p>
        <p>Logo Path талбарт: <code className="text-accent">/media/sponsors/sponsor-name.png</code> гэж бичнэ</p>
      </div>

      {tiers.map(tier => {
        const tierSponsors = sponsors.filter(s => s.tier === tier)
        const tierColor = tier === 'platinum' ? 'text-yellow-400' : tier === 'gold' ? 'text-orange-400' : 'text-slate-400'
        return (
          <div key={tier} className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-bold ${tierColor}`}>
                {tier === 'platinum' ? '⭐' : tier === 'gold' ? '🥇' : '🤝'} {TIER_LABELS[tier]}
              </h3>
              <button
                type="button"
                onClick={() => add(tier)}
                className="text-xs text-primary hover:text-primary/80 border border-dashed border-primary/40 rounded px-3 py-1 transition-colors"
              >
                + Нэмэх
              </button>
            </div>
            {tierSponsors.length === 0 && (
              <p className="text-xs text-muted/50 pl-2">Спонсор байхгүй</p>
            )}
            {tierSponsors.map(s => (
              <div key={s.id} className="rounded-lg border border-border bg-surface-2 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    value={s.name}
                    onChange={e => update(s.id, 'name', e.target.value)}
                    placeholder="Спонсорын нэр"
                    className="flex-1 rounded border border-border bg-surface px-2 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                  />
                  <button type="button" onClick={() => remove(s.id)} className="text-danger/70 hover:text-danger text-sm px-2">✕</button>
                </div>
                <div className="flex gap-2">
                  <input
                    value={s.logoPath}
                    onChange={e => update(s.id, 'logoPath', e.target.value)}
                    placeholder="/media/sponsors/logo.png"
                    className="flex-1 rounded border border-border bg-surface px-2 py-1 text-xs font-mono text-muted focus:outline-none focus:border-primary/50"
                  />
                  <input
                    value={s.website}
                    onChange={e => update(s.id, 'website', e.target.value)}
                    placeholder="https://website.mn"
                    className="flex-1 rounded border border-border bg-surface px-2 py-1 text-xs font-mono text-muted focus:outline-none focus:border-primary/50"
                  />
                </div>
                {s.logoPath && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.logoPath} alt={s.name} className="h-8 object-contain opacity-80 rounded" />
                )}
              </div>
            ))}
          </div>
        )
      })}

      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-primary/20 text-primary border border-primary/40 px-5 py-2 text-sm font-semibold hover:bg-primary/30 transition-colors disabled:opacity-50"
        >
          {saving ? 'Хадгалж байна...' : '💾 Хадгалах'}
        </button>
        {saved && <span className="text-sm text-live font-medium">✓ Хадгалагдлаа</span>}
      </div>
    </div>
  )
}

/* ── STATS TAB ────────────────────────────────────────────────────────────── */
function StatsTab({ data, onSave }: { data: StatItem[]; onSave: (v: StatItem[]) => Promise<void> }) {
  const [items, setItems] = useState<StatItem[]>(data)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function update(i: number, field: keyof StatItem, val: string | boolean) {
    setItems(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s))
  }
  function remove(i: number) {
    setItems(prev => prev.filter((_, idx) => idx !== i))
  }
  function add() {
    setItems(prev => [...prev, { num: '0', plus: false, label: 'Шинэ тоо' }])
  }

  async function save() {
    setSaving(true); setSaved(false)
    try { await onSave(items); setSaved(true); setTimeout(() => setSaved(false), 3000) }
    catch { /* error shown globally */ }
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">Stats хэсэгт харагдах тоо баримт. Label-д <code>\n</code> нэмбэл мөр шилжинэ.</p>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2">
            <input
              value={item.num}
              onChange={e => update(i, 'num', e.target.value)}
              placeholder="Тоо"
              className="w-24 rounded border border-border bg-surface px-2 py-1 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50"
            />
            <label className="flex items-center gap-1.5 text-xs text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={item.plus}
                onChange={e => update(i, 'plus', e.target.checked)}
                className="accent-primary"
              />
              + тэмдэг
            </label>
            <input
              value={item.label.replace(/\\n/g, '\n')}
              onChange={e => update(i, 'label', e.target.value.replace(/\n/g, '\\n'))}
              placeholder="Тайлбар"
              className="flex-1 rounded border border-border bg-surface px-2 py-1 text-sm text-foreground focus:outline-none focus:border-primary/50"
            />
            <button type="button" onClick={() => remove(i)} className="text-danger/70 hover:text-danger text-sm px-1">✕</button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="text-sm text-primary hover:text-primary/80 border border-dashed border-primary/40 rounded-lg px-4 py-2 w-full transition-colors"
      >
        + Тоо нэмэх
      </button>
      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-primary/20 text-primary border border-primary/40 px-5 py-2 text-sm font-semibold hover:bg-primary/30 transition-colors disabled:opacity-50"
        >
          {saving ? 'Хадгалж байна...' : '💾 Хадгалах'}
        </button>
        {saved && <span className="text-sm text-live font-medium">✓ Хадгалагдлаа</span>}
      </div>
    </div>
  )
}

/* ── MEDIA TAB ────────────────────────────────────────────────────────────── */
function MediaTab({ data, onSave }: { data: SiteSettings['hero']; onSave: (v: SiteSettings['hero']) => Promise<void> }) {
  const [form, setForm] = useState(data)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function set(key: keyof typeof form) {
    return (v: string) => setForm(f => ({ ...f, [key]: v }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setSaved(false)
    try {
      await onSave(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch { /* error shown globally */ }
    setSaving(false)
  }

  const mediaItems = [
    { key: 'logoColorPath' as const, label: 'Өнгөт лого (header)', hint: '512×512px PNG/SVG · Ар дэвсгэрт харагдана', current: form.logoColorPath },
    { key: 'logoWhitePath' as const, label: 'Цагаан лого (footer)', hint: '512×512px PNG/SVG · Харанхуй ар дэвсгэрт', current: form.logoWhitePath },
    { key: 'heroImagePath' as const, label: 'Hero арын зураг', hint: '1920×1080px JPG/WebP · Hero section-ийн арын зураг', current: form.heroImagePath },
  ]

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-xs text-muted space-y-1">
        <p className="font-semibold text-foreground/70">📁 Зураг хадгалах байршил:</p>
        <p><code className="text-accent">D:\AI\tournament-site\public\media\logos\</code> хавтас</p>
        <p>Public URL: <code className="text-accent">/media/logos/logo-color.png</code></p>
        <p>Спонсор лого: <code className="text-accent">D:\AI\tournament-site\public\media\sponsors\</code></p>
      </div>

      <div className="space-y-5">
        {mediaItems.map(item => (
          <div key={item.key} className="rounded-xl border border-border bg-surface-2 p-4 space-y-3">
            <div>
              <div className="text-sm font-semibold">{item.label}</div>
              <div className="text-xs text-muted mt-0.5">{item.hint}</div>
            </div>
            <div className="flex gap-3 items-start">
              <input
                value={form[item.key]}
                onChange={e => set(item.key)(e.target.value)}
                placeholder="/media/logos/logo.png"
                className="flex-1 rounded border border-border bg-surface px-3 py-1.5 text-sm font-mono text-muted focus:outline-none focus:border-primary/50"
              />
              {form[item.key] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form[item.key]}
                  alt={item.label}
                  className="h-10 w-auto object-contain rounded border border-border bg-surface p-1"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <SaveBar saving={saving} saved={saved} />
    </form>
  )
}

/* ── HOST AIMAGS TAB ─────────────────────────────────────────────────────── */
function HostAimagsTab({ data, onSave }: { data: HostAimag[]; onSave: (v: HostAimag[]) => Promise<void> }) {
  const [aimags, setAimags] = useState<HostAimag[]>(data)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [open, setOpen] = useState<string | null>(aimags[0]?.id ?? null)

  function update(id: string, field: keyof HostAimag, val: string) {
    setAimags(prev => prev.map(a => a.id === id ? { ...a, [field]: val } : a))
  }
  function remove(id: string) {
    setAimags(prev => prev.filter(a => a.id !== id))
    if (open === id) setOpen(null)
  }
  function add() {
    const newId = crypto.randomUUID()
    setAimags(prev => [...prev, {
      id: newId,
      mark: 'НЭМ',
      name: 'Шинэ аймаг',
      role: 'Зохион байгуулагч аймаг',
      description: '',
      logoPath: '',
      website: '',
      athleteCount: '0',
    }])
    setOpen(newId)
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= aimags.length) return
    const next = [...aimags];
    [next[i], next[j]] = [next[j], next[i]]
    setAimags(next)
  }

  async function save() {
    setSaving(true); setSaved(false)
    try { await onSave(aimags); setSaved(true); setTimeout(() => setSaved(false), 3000) }
    catch { /* error shown globally */ }
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">Нийтийн хуудсын "Зохион байгуулагч аймгууд" хэсэгт харагдана. Лого оруулаагүй бол товчилсон нэр (mark) харагдана.</p>

      <div className="space-y-2">
        {aimags.map((a, i) => (
          <div key={a.id} className="rounded-xl border border-border bg-surface-2 overflow-hidden">
            {/* Accordion header */}
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex flex-col gap-0.5">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-muted hover:text-foreground disabled:opacity-20 text-xs leading-none">▲</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === aimags.length - 1} className="text-muted hover:text-foreground disabled:opacity-20 text-xs leading-none">▼</button>
              </div>
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-xs font-bold text-accent cursor-pointer"
                onClick={() => setOpen(open === a.id ? null : a.id)}
              >
                {a.logoPath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.logoPath} alt={a.mark} className="h-8 w-8 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                ) : a.mark}
              </div>
              <button
                className="flex-1 text-left"
                onClick={() => setOpen(open === a.id ? null : a.id)}
              >
                <div className="font-semibold text-sm">{a.name}</div>
                <div className="text-xs text-muted">{a.role} · {a.athleteCount} тамирчин</div>
              </button>
              <button type="button" onClick={() => remove(a.id)} className="text-danger/60 hover:text-danger text-sm px-1">✕</button>
              <span className="text-muted text-xs">{open === a.id ? '▲' : '▼'}</span>
            </div>

            {/* Expanded fields */}
            {open === a.id && (
              <div className="border-t border-border px-4 pb-4 pt-3 space-y-3 bg-surface">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider">Товчилсон нэр (mark)</label>
                    <input value={a.mark} onChange={e => update(a.id, 'mark', e.target.value)}
                      placeholder="ӨМ"
                      className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                    />
                    <p className="text-[11px] text-muted/70">Лого байхгүй үед суут дотор харагдана</p>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider">Аймгийн нэр</label>
                    <input value={a.name} onChange={e => update(a.id, 'name', e.target.value)}
                      placeholder="Өмнөговь"
                      className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider">Үүрэг</label>
                    <input value={a.role} onChange={e => update(a.id, 'role', e.target.value)}
                      placeholder="Зохион байгуулагч аймаг"
                      className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider">Тамирчдын тоо</label>
                    <input value={a.athleteCount} onChange={e => update(a.id, 'athleteCount', e.target.value)}
                      placeholder="142"
                      className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider">Сайтын холбоос</label>
                    <input value={a.website} onChange={e => update(a.id, 'website', e.target.value)}
                      type="url" placeholder="https://umnugovi.gov.mn"
                      className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider">Лого зургийн зам</label>
                  <div className="flex gap-3 items-center">
                    <input value={a.logoPath} onChange={e => update(a.id, 'logoPath', e.target.value)}
                      placeholder="/media/aimags/umnugovi.png"
                      className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary/50"
                    />
                    {a.logoPath && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.logoPath} alt={a.name} className="h-10 w-10 object-contain rounded border border-border bg-surface p-1"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    )}
                  </div>
                  <p className="text-[11px] text-muted/70">Байршил: <code className="text-accent">public/media/aimags/</code></p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider">Аймгийн тайлбар</label>
                  <textarea value={a.description} onChange={e => update(a.id, 'description', e.target.value)}
                    rows={2} placeholder="Аймгийн товч мэдээлэл..."
                    className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm resize-none focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        className="text-sm text-primary hover:text-primary/80 border border-dashed border-primary/40 rounded-lg px-4 py-2 w-full transition-colors"
      >
        + Аймаг нэмэх
      </button>

      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-primary/20 text-primary border border-primary/40 px-5 py-2 text-sm font-semibold hover:bg-primary/30 transition-colors disabled:opacity-50"
        >
          {saving ? 'Хадгалж байна...' : '💾 Хадгалах'}
        </button>
        {saved && <span className="text-sm text-live font-medium">✓ Хадгалагдлаа</span>}
      </div>
    </div>
  )
}

/* ── ABOUT TAB ────────────────────────────────────────────────────────────── */
function AboutTab({ data, onSave }: { data: SiteAbout; onSave: (v: SiteAbout) => Promise<void> }) {
  const [form, setForm] = useState<SiteAbout>(data)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function setField<K extends keyof SiteAbout>(key: K, val: SiteAbout[K]) {
    setForm(f => ({ ...f, [key]: val }))
  }

  // Facts
  function updateFact(i: number, field: keyof AboutFact, val: string) {
    setForm(f => ({ ...f, facts: f.facts.map((x, idx) => idx === i ? { ...x, [field]: val } : x) }))
  }
  function removeFact(i: number) {
    setForm(f => ({ ...f, facts: f.facts.filter((_, idx) => idx !== i) }))
  }
  function addFact() {
    setForm(f => ({ ...f, facts: [...f.facts, { label: 'Шинэ', value: '' }] }))
  }

  // Values
  function updateValue(i: number, field: keyof AboutValue, val: string) {
    setForm(f => ({ ...f, values: f.values.map((x, idx) => idx === i ? { ...x, [field]: val } : x) }))
  }
  function removeValue(i: number) {
    setForm(f => ({ ...f, values: f.values.filter((_, idx) => idx !== i) }))
  }
  function addValue() {
    setForm(f => ({ ...f, values: [...f.values, { icon: '🏅', title: 'Шинэ', body: '' }] }))
  }

  // Editions
  function updateEdition(i: number, field: keyof AboutEdition, val: string | boolean) {
    setForm(f => ({ ...f, editions: f.editions.map((x, idx) => idx === i ? { ...x, [field]: val } : x) }))
  }
  function removeEdition(i: number) {
    setForm(f => ({ ...f, editions: f.editions.filter((_, idx) => idx !== i) }))
  }
  function addEdition() {
    setForm(f => ({ ...f, editions: [...f.editions, { num: 'VI', year: '2028', city: 'Улаанбаатар', sports: '5', current: false }] }))
  }

  async function save() {
    setSaving(true); setSaved(false)
    try { await onSave(form); setSaved(true); setTimeout(() => setSaved(false), 3000) }
    catch { /* error shown globally */ }
    setSaving(false)
  }

  return (
    <div className="space-y-8">

      {/* Subtitle */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-foreground/80">Товч тайлбар</h3>
        <textarea
          value={form.subtitle}
          onChange={e => setField('subtitle', e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:border-primary/50"
        />
      </div>

      {/* Facts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground/80">Гол мэдээлэл (facts)</h3>
          <button type="button" onClick={addFact} className="text-xs text-primary hover:text-primary/80 border border-dashed border-primary/40 rounded px-3 py-1">+ Нэмэх</button>
        </div>
        <div className="space-y-2">
          {form.facts.map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={f.label}
                onChange={e => updateFact(i, 'label', e.target.value)}
                placeholder="Шошго"
                className="w-36 rounded border border-border bg-surface-2 px-2 py-1.5 text-sm focus:outline-none focus:border-primary/50"
              />
              <input
                value={f.value}
                onChange={e => updateFact(i, 'value', e.target.value)}
                placeholder="Утга"
                className="flex-1 rounded border border-border bg-surface-2 px-2 py-1.5 text-sm focus:outline-none focus:border-primary/50"
              />
              <button type="button" onClick={() => removeFact(i)} className="text-danger/60 hover:text-danger text-sm px-1">✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground/80">Үнэт зүйлс</h3>
          <button type="button" onClick={addValue} className="text-xs text-primary hover:text-primary/80 border border-dashed border-primary/40 rounded px-3 py-1">+ Нэмэх</button>
        </div>
        <div className="space-y-3">
          {form.values.map((v, i) => (
            <div key={i} className="rounded-lg border border-border bg-surface-2 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  value={v.icon}
                  onChange={e => updateValue(i, 'icon', e.target.value)}
                  placeholder="🏅"
                  className="w-14 rounded border border-border bg-surface px-2 py-1 text-sm text-center focus:outline-none focus:border-primary/50"
                />
                <input
                  value={v.title}
                  onChange={e => updateValue(i, 'title', e.target.value)}
                  placeholder="Гарчиг"
                  className="flex-1 rounded border border-border bg-surface px-2 py-1 text-sm focus:outline-none focus:border-primary/50"
                />
                <button type="button" onClick={() => removeValue(i)} className="text-danger/60 hover:text-danger text-sm px-1">✕</button>
              </div>
              <textarea
                value={v.body}
                onChange={e => updateValue(i, 'body', e.target.value)}
                rows={2}
                placeholder="Тайлбар..."
                className="w-full rounded border border-border bg-surface px-2 py-1.5 text-sm resize-none focus:outline-none focus:border-primary/50"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Editions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground/80">Наадмын түүх</h3>
          <button type="button" onClick={addEdition} className="text-xs text-primary hover:text-primary/80 border border-dashed border-primary/40 rounded px-3 py-1">+ Нэмэх</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-xs text-muted border-b border-border">
                <th className="text-left py-2 pr-2 font-semibold">Удаа</th>
                <th className="text-left py-2 pr-2 font-semibold">Жил</th>
                <th className="text-left py-2 pr-2 font-semibold">Хот</th>
                <th className="text-left py-2 pr-2 font-semibold">Спортын тоо</th>
                <th className="text-left py-2 pr-2 font-semibold">Одоогийн</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {form.editions.map((ed, i) => (
                <tr key={i} className="border-b border-border/40">
                  <td className="py-1.5 pr-2">
                    <input value={ed.num} onChange={e => updateEdition(i, 'num', e.target.value)}
                      className="w-14 rounded border border-border bg-surface-2 px-2 py-1 text-sm font-mono focus:outline-none focus:border-primary/50" />
                  </td>
                  <td className="py-1.5 pr-2">
                    <input value={ed.year} onChange={e => updateEdition(i, 'year', e.target.value)}
                      className="w-20 rounded border border-border bg-surface-2 px-2 py-1 text-sm focus:outline-none focus:border-primary/50" />
                  </td>
                  <td className="py-1.5 pr-2">
                    <input value={ed.city} onChange={e => updateEdition(i, 'city', e.target.value)}
                      className="w-36 rounded border border-border bg-surface-2 px-2 py-1 text-sm focus:outline-none focus:border-primary/50" />
                  </td>
                  <td className="py-1.5 pr-2">
                    <input value={ed.sports} onChange={e => updateEdition(i, 'sports', e.target.value)}
                      className="w-16 rounded border border-border bg-surface-2 px-2 py-1 text-sm focus:outline-none focus:border-primary/50" />
                  </td>
                  <td className="py-1.5 pr-2">
                    <input type="checkbox" checked={ed.current} onChange={e => updateEdition(i, 'current', e.target.checked)}
                      className="accent-primary" />
                  </td>
                  <td className="py-1.5">
                    <button type="button" onClick={() => removeEdition(i)} className="text-danger/60 hover:text-danger text-sm px-1">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Aimags */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-foreground/80">Оролцогч аймгууд</h3>
        <textarea
          value={form.aimags}
          onChange={e => setField('aimags', e.target.value)}
          rows={3}
          placeholder="Аймгийн нэрсийг таслалаар тусгаарла"
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm font-mono text-foreground resize-none focus:outline-none focus:border-primary/50"
        />
        <p className="text-[11px] text-muted/70">Таслалаар тусгаарласан аймгийн нэрс. Жишээ: Өмнөговь,Сэлэнгэ,Төв</p>
      </div>

      {/* Organizer */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground/80">Зохион байгуулагчийн мэдээлэл</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Байгууллагын нэр" value={form.orgName} onChange={v => setField('orgName', v)} />
          <Field label="Тамирчдын тодорхойлолт" value={form.orgAthletes} onChange={v => setField('orgAthletes', v)} />
          <Field label="Уриа үг" value={form.orgMotto} onChange={v => setField('orgMotto', v)} />
          <Field label="Байршил" value={form.orgLocation} onChange={v => setField('orgLocation', v)} />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-primary/20 text-primary border border-primary/40 px-5 py-2 text-sm font-semibold hover:bg-primary/30 transition-colors disabled:opacity-50"
        >
          {saving ? 'Хадгалж байна...' : '💾 Хадгалах'}
        </button>
        {saved && <span className="text-sm text-live font-medium">✓ Хадгалагдлаа</span>}
      </div>
    </div>
  )
}

/* ── SCHEDULE TAB ────────────────────────────────────────────────────────── */
function ScheduleTab({ data, onSave }: { data: ScheduleDay[]; onSave: (v: ScheduleDay[]) => Promise<void> }) {
  const [days, setDays] = useState<ScheduleDay[]>(data)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [open, setOpen] = useState<string | null>(days[0]?.num ?? null)

  function updateDay(idx: number, field: keyof ScheduleDay, val: string) {
    setDays(prev => prev.map((d, i) => i === idx ? { ...d, [field]: val } : d))
  }
  function addEvent(dayIdx: number, section: 'main' | 'extra') {
    setDays(prev => prev.map((d, i) => i !== dayIdx ? d : {
      ...d,
      [section]: [...d[section], { time: '10:00', name: 'Шинэ арга хэмжээ', note: '', hilight: false }],
    }))
  }
  function updateEvent(dayIdx: number, section: 'main' | 'extra', evIdx: number, field: keyof ScheduleEvent, val: string | boolean) {
    setDays(prev => prev.map((d, i) => i !== dayIdx ? d : {
      ...d,
      [section]: d[section].map((ev, j) => j !== evIdx ? ev : { ...ev, [field]: val }),
    }))
  }
  function removeEvent(dayIdx: number, section: 'main' | 'extra', evIdx: number) {
    setDays(prev => prev.map((d, i) => i !== dayIdx ? d : {
      ...d,
      [section]: d[section].filter((_, j) => j !== evIdx),
    }))
  }
  function moveEvent(dayIdx: number, section: 'main' | 'extra', evIdx: number, dir: -1 | 1) {
    setDays(prev => prev.map((d, i) => {
      if (i !== dayIdx) return d
      const arr = [...d[section]]
      const to = evIdx + dir
      if (to < 0 || to >= arr.length) return d
      ;[arr[evIdx], arr[to]] = [arr[to], arr[evIdx]]
      return { ...d, [section]: arr }
    }))
  }
  function addDay() {
    setDays(prev => [...prev, { num: String(parseInt(prev[prev.length-1]?.num || '10') + 1), month: '2026 · ЗУРГАА', weekday: 'Шинэ өдөр', main: [], extra: [] }])
  }
  function removeDay(idx: number) {
    const num = days[idx]?.num
    setDays(prev => prev.filter((_, i) => i !== idx))
    if (open === num) setOpen(null)
  }

  async function save() {
    setSaving(true); setSaved(false)
    try { await onSave(days); setSaved(true); setTimeout(() => setSaved(false), 3000) }
    catch { /* error shown globally */ }
    setSaving(false)
  }

  function EventRow({ dayIdx, section, ev, evIdx, total }: { dayIdx: number; section: 'main' | 'extra'; ev: ScheduleEvent; evIdx: number; total: number }) {
    return (
      <div className={`flex items-start gap-2 rounded-lg px-3 py-2 ${ev.hilight ? 'bg-accent/10 border border-accent/20' : 'border border-border bg-surface'}`}>
        {/* Up / Down reorder buttons */}
        <div className="flex flex-col gap-0.5 shrink-0 pt-0.5">
          <button
            type="button"
            onClick={() => moveEvent(dayIdx, section, evIdx, -1)}
            disabled={evIdx === 0}
            className="w-5 h-5 flex items-center justify-center rounded text-xs text-muted hover:text-foreground hover:bg-surface-2 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            title="Дээш зөөх"
          >▲</button>
          <button
            type="button"
            onClick={() => moveEvent(dayIdx, section, evIdx, 1)}
            disabled={evIdx === total - 1}
            className="w-5 h-5 flex items-center justify-center rounded text-xs text-muted hover:text-foreground hover:bg-surface-2 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            title="Доош зөөх"
          >▼</button>
        </div>
        <textarea
          value={ev.time}
          onChange={e => updateEvent(dayIdx, section, evIdx, 'time', e.target.value)}
          rows={2}
          placeholder="08:00&#10;22:00"
          className="w-20 rounded border border-border bg-surface-2 px-2 py-1 text-xs font-mono resize-none focus:outline-none focus:border-primary/50 shrink-0"
        />
        <div className="flex-1 space-y-1 min-w-0">
          <input value={ev.name} onChange={e => updateEvent(dayIdx, section, evIdx, 'name', e.target.value)}
            placeholder="Арга хэмжээний нэр"
            className="w-full rounded border border-border bg-surface-2 px-2 py-1 text-sm focus:outline-none focus:border-primary/50" />
          <input value={ev.note ?? ''} onChange={e => updateEvent(dayIdx, section, evIdx, 'note', e.target.value)}
            placeholder="Нэмэлт тэмдэглэл (заал, ангилал...)"
            className="w-full rounded border border-border bg-surface-2 px-2 py-1 text-xs text-muted focus:outline-none focus:border-primary/50" />
        </div>
        <label className="flex items-center gap-1 cursor-pointer shrink-0 pt-1">
          <input type="checkbox" checked={!!ev.hilight}
            onChange={e => updateEvent(dayIdx, section, evIdx, 'hilight', e.target.checked)}
            className="accent-primary" />
          <span className="text-xs text-muted">★</span>
        </label>
        <button type="button" onClick={() => removeEvent(dayIdx, section, evIdx)}
          className="text-danger/60 hover:text-danger text-sm px-1 shrink-0 pt-1">✕</button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">Нүүр хуудас болон /schedule хуудсанд харагдах гурван өдрийн хуваарь. ★ тэмдэглэснийг онцлон харуулна.</p>
      <div className="space-y-2">
        {days.map((day, dayIdx) => (
          <div key={dayIdx} className="rounded-xl border border-border bg-surface-2 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => setOpen(open === day.num ? null : day.num)}>
              <div className="font-bold text-2xl text-accent font-mono w-8 shrink-0">{day.num}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{day.weekday}</div>
                <div className="text-xs text-muted">{day.month} · {day.main.length} үндсэн + {day.extra.length} нэмэлт</div>
              </div>
              <button type="button" onClick={e => { e.stopPropagation(); removeDay(dayIdx) }}
                className="text-danger/60 hover:text-danger text-sm px-1 shrink-0">✕</button>
              <span className="text-muted text-xs shrink-0">{open === day.num ? '▲' : '▼'}</span>
            </div>

            {open === day.num && (
              <div className="border-t border-border px-4 pb-4 pt-3 space-y-4 bg-surface">
                {/* Day metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider">Өдрийн тоо</label>
                    <input value={day.num} onChange={e => updateDay(dayIdx, 'num', e.target.value)}
                      className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:border-primary/50" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider">Сар / Он</label>
                    <input value={day.month} onChange={e => updateDay(dayIdx, 'month', e.target.value)}
                      className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:border-primary/50" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider">Гараг / Тэмдэглэгээ</label>
                    <input value={day.weekday} onChange={e => updateDay(dayIdx, 'weekday', e.target.value)}
                      className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:border-primary/50" />
                  </div>
                </div>

                {/* Main events */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-foreground/70 uppercase tracking-wider">Үндсэн тэмцээн</p>
                    <button type="button" onClick={() => addEvent(dayIdx, 'main')}
                      className="text-xs text-primary hover:text-primary/80 border border-dashed border-primary/40 rounded px-2 py-0.5">+ Нэмэх</button>
                  </div>
                  <div className="space-y-2">
                    {day.main.map((ev, evIdx) => (
                      <EventRow key={evIdx} dayIdx={dayIdx} section="main" ev={ev} evIdx={evIdx} total={day.main.length} />
                    ))}
                  </div>
                </div>

                {/* Extra events */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-foreground/70 uppercase tracking-wider">Хөгжөөн дэмжигчдэд</p>
                    <button type="button" onClick={() => addEvent(dayIdx, 'extra')}
                      className="text-xs text-primary hover:text-primary/80 border border-dashed border-primary/40 rounded px-2 py-0.5">+ Нэмэх</button>
                  </div>
                  <div className="space-y-2">
                    {day.extra.map((ev, evIdx) => (
                      <EventRow key={evIdx} dayIdx={dayIdx} section="extra" ev={ev} evIdx={evIdx} total={day.extra.length} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <button type="button" onClick={addDay}
        className="text-sm text-primary hover:text-primary/80 border border-dashed border-primary/40 rounded-lg px-4 py-2 w-full transition-colors">
        + Өдөр нэмэх
      </button>
      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <button type="button" onClick={save} disabled={saving}
          className="rounded-lg bg-primary/20 text-primary border border-primary/40 px-5 py-2 text-sm font-semibold hover:bg-primary/30 transition-colors disabled:opacity-50">
          {saving ? 'Хадгалж байна...' : '💾 Хадгалах'}
        </button>
        {saved && <span className="text-sm text-live font-medium">✓ Хадгалагдлаа</span>}
      </div>
    </div>
  )
}

/* ── FOOTER TAB ──────────────────────────────────────────────────────────── */
function FooterTab({ data, onSave }: { data: FooterNav; onSave: (v: FooterNav) => Promise<void> }) {
  const [form, setForm] = useState<FooterNav>(data)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function updateCol(col: 'col1' | 'col2', field: 'title', val: string) {
    setForm(f => ({ ...f, [col]: { ...f[col], [field]: val } }))
  }
  function updateLink(col: 'col1' | 'col2', i: number, field: keyof NavLink, val: string) {
    setForm(f => ({ ...f, [col]: { ...f[col], links: f[col].links.map((l, idx) => idx === i ? { ...l, [field]: val } : l) } }))
  }
  function removeLink(col: 'col1' | 'col2', i: number) {
    setForm(f => ({ ...f, [col]: { ...f[col], links: f[col].links.filter((_, idx) => idx !== i) } }))
  }
  function addLink(col: 'col1' | 'col2') {
    setForm(f => ({ ...f, [col]: { ...f[col], links: [...f[col].links, { href: '/', label: 'Шинэ холбоос' }] } }))
  }

  async function save() {
    setSaving(true); setSaved(false)
    try { await onSave(form); setSaved(true); setTimeout(() => setSaved(false), 3000) }
    catch { /* error shown globally */ }
    setSaving(false)
  }

  function ColEditor({ col }: { col: 'col1' | 'col2' }) {
    const c = form[col]
    return (
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider">Баганы гарчиг</label>
          <input value={c.title} onChange={e => updateCol(col, 'title', e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:border-primary/50" />
        </div>
        <div className="space-y-2">
          {c.links.map((link, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2">
              <input value={link.label} onChange={e => updateLink(col, i, 'label', e.target.value)}
                placeholder="Нэр" className="flex-1 rounded border border-border bg-surface px-2 py-1 text-sm focus:outline-none focus:border-primary/50 min-w-0" />
              <input value={link.href} onChange={e => updateLink(col, i, 'href', e.target.value)}
                placeholder="/path" className="w-36 rounded border border-border bg-surface px-2 py-1 text-sm font-mono text-muted focus:outline-none focus:border-primary/50" />
              <button type="button" onClick={() => removeLink(col, i)} className="text-danger/70 hover:text-danger text-sm px-1">✕</button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => addLink(col)}
          className="text-xs text-primary hover:text-primary/80 border border-dashed border-primary/40 rounded px-3 py-1.5 w-full">
          + Холбоос нэмэх
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted">Нийтийн хуудасны footer-д харагдах навигацийн холбоосууд. Баганын гарчиг болон холбоосуудыг засах боломжтой.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-surface-2 p-4 space-y-3">
          <h3 className="text-sm font-bold">1-р багана</h3>
          <ColEditor col="col1" />
        </div>
        <div className="rounded-xl border border-border bg-surface-2 p-4 space-y-3">
          <h3 className="text-sm font-bold">2-р багана</h3>
          <ColEditor col="col2" />
        </div>
      </div>
      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <button type="button" onClick={save} disabled={saving}
          className="rounded-lg bg-primary/20 text-primary border border-primary/40 px-5 py-2 text-sm font-semibold hover:bg-primary/30 transition-colors disabled:opacity-50">
          {saving ? 'Хадгалж байна...' : '💾 Хадгалах'}
        </button>
        {saved && <span className="text-sm text-live font-medium">✓ Хадгалагдлаа</span>}
      </div>
    </div>
  )
}

/* ── NEWS TAB ────────────────────────────────────────────────────────────── */
function NewsTab({
  data, tags: initialTags, onSave, onSaveTags,
}: {
  data: NewsArticle[]
  tags: NewsTag[]
  onSave: (v: NewsArticle[]) => Promise<void>
  onSaveTags: (v: NewsTag[]) => Promise<void>
}) {
  const [articles, setArticles] = useState<NewsArticle[]>(data)
  const [tags, setTags] = useState<NewsTag[]>(initialTags)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [tagSaving, setTagSaving] = useState(false)
  const [tagSaved, setTagSaved] = useState(false)
  const [open, setOpen] = useState<string | null>(null)
  const [tagsOpen, setTagsOpen] = useState(false)
  const [uploadingId, setUploadingId] = useState<string | null>(null)

  function addTag() {
    const id = crypto.randomUUID()
    setTags(prev => [...prev, { id, label: 'Шинэ таг', color: 'gold' }])
  }
  function updateTag(id: string, field: keyof NewsTag, val: string) {
    setTags(prev => prev.map(t => t.id === id ? { ...t, [field]: val } : t))
  }
  function removeTag(id: string) {
    setTags(prev => prev.filter(t => t.id !== id))
  }
  async function saveTags() {
    setTagSaving(true); setTagSaved(false)
    try { await onSaveTags(tags); setTagSaved(true); setTimeout(() => setTagSaved(false), 3000) }
    catch { /* error shown globally */ }
    setTagSaving(false)
  }

  function update(id: string, field: keyof NewsArticle, val: string | boolean) {
    setArticles(prev => prev.map(a => {
      if (a.id !== id) return a
      if (field === 'feature' && val === true) {
        // only one feature at a time — handled below
      }
      return { ...a, [field]: val }
    }))
    if (field === 'feature' && val === true) {
      setArticles(prev => prev.map(a => ({ ...a, feature: a.id === id })))
    }
  }
  function selectTag(id: string, label: string) {
    const found = tags.find(t => t.label === label)
    setArticles(prev => prev.map(a => a.id !== id ? a : {
      ...a, tag: label, tagColor: found?.color ?? 'gold',
    }))
  }
  function remove(id: string) {
    setArticles(prev => prev.filter(a => a.id !== id))
    if (open === id) setOpen(null)
  }
  function add() {
    const id = crypto.randomUUID()
    setArticles(prev => [...prev, {
      id, date: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
      tag: 'Мэдээ', tagColor: 'gold', author: 'Редакц',
      title: 'Шинэ мэдээний гарчиг', excerpt: '', feature: false,
    }])
    setOpen(id)
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= articles.length) return
    const next = [...articles];
    [next[i], next[j]] = [next[j], next[i]]
    setArticles(next)
  }

  async function save() {
    setSaving(true); setSaved(false)
    try { await onSave(articles); setSaved(true); setTimeout(() => setSaved(false), 3000) }
    catch { /* error shown globally */ }
    setSaving(false)
  }

  return (
    <div className="space-y-3">
      {/* Tag manager */}
      <div className="rounded-xl border border-border bg-surface-2 overflow-hidden">
        <button
          onClick={() => setTagsOpen(o => !o)}
          className="flex w-full items-center gap-2 px-4 py-3 text-sm"
        >
          <span className="flex-1 font-semibold text-left text-foreground">🏷️ Тагийн жагсаалт · {tags.length} таг</span>
          <span className="text-[10px] text-muted">{tagsOpen ? '▲' : '▼'}</span>
        </button>
        {tagsOpen && (
          <div className="border-t border-border px-4 pb-4 pt-3 space-y-2 bg-surface">
            {tags.map(t => (
              <div key={t.id} className="flex items-center gap-2">
                <input
                  value={t.label}
                  onChange={e => updateTag(t.id, 'label', e.target.value)}
                  className="flex-1 rounded border border-border bg-surface-2 px-2 py-1.5 text-sm focus:outline-none focus:border-primary/50"
                />
                <select
                  value={t.color}
                  onChange={e => updateTag(t.id, 'color', e.target.value)}
                  className="rounded border border-border bg-surface-2 px-2 py-1.5 text-sm focus:outline-none"
                >
                  <option value="gold">Шар</option>
                  <option value="red">Улаан</option>
                </select>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${t.color === 'red' ? 'bg-danger/20 text-danger' : 'bg-accent/20 text-accent'}`}>
                  {t.label}
                </span>
                <button type="button" onClick={() => removeTag(t.id)} className="text-danger/60 hover:text-danger text-sm px-1 shrink-0">✕</button>
              </div>
            ))}
            <button type="button" onClick={addTag}
              className="text-xs text-primary hover:text-primary/80 border border-dashed border-primary/40 rounded px-3 py-1.5 w-full mt-1">
              + Таг нэмэх
            </button>
            <div className="flex items-center gap-3 pt-2 border-t border-border">
              <button type="button" onClick={saveTags} disabled={tagSaving}
                className="rounded-lg bg-primary/20 text-primary border border-primary/40 px-4 py-1.5 text-xs font-semibold hover:bg-primary/30 disabled:opacity-50">
                {tagSaving ? 'Хадгалж байна...' : '💾 Тагуудыг хадгалах'}
              </button>
              {tagSaved && <span className="text-xs text-live font-medium">✓ Хадгалагдлаа</span>}
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-muted">Мэдээний хуудас болон нүүр хуудасны мэдээ секторт гарна. "Онцлох" тэмдэглэсэн нэг нийтлэл том карт болон харагдана.</p>

      <div className="space-y-2">
        {articles.map((a, i) => (
          <div key={a.id} className="rounded-xl border border-border bg-surface-2 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 px-3 py-2.5">
              <div className="flex flex-col gap-0.5">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-muted hover:text-foreground disabled:opacity-20 text-xs leading-none">▲</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === articles.length - 1} className="text-muted hover:text-foreground disabled:opacity-20 text-xs leading-none">▼</button>
              </div>
              <div className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer" onClick={() => setOpen(open === a.id ? null : a.id)}>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                  a.tagColor === 'red'
                    ? 'bg-danger/20 text-danger'
                    : 'bg-accent/20 text-accent'
                }`}>{a.tag}</span>
                {a.feature && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-live/20 text-live shrink-0">★ Онцлох</span>}
                <span className="text-sm font-medium truncate">{a.title}</span>
                <span className="text-xs text-muted shrink-0 ml-auto">{a.date}</span>
              </div>
              <button type="button" onClick={() => remove(a.id)} className="text-danger/60 hover:text-danger text-sm px-1 shrink-0">✕</button>
              <span className="text-muted text-xs shrink-0">{open === a.id ? '▲' : '▼'}</span>
            </div>

            {/* Expanded */}
            {open === a.id && (
              <div className="border-t border-border px-4 pb-4 pt-3 space-y-3 bg-surface">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider">Огноо</label>
                    <input value={a.date} onChange={e => update(a.id, 'date', e.target.value)}
                      placeholder="2026.06.01"
                      className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:border-primary/50" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider">Зохиогч / Эх сурвалж</label>
                    <input value={a.author} onChange={e => update(a.id, 'author', e.target.value)}
                      placeholder="Редакц"
                      className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:border-primary/50" />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider">Таг (ангилал)</label>
                    <div className="flex items-center gap-2">
                      <select
                        value={a.tag}
                        onChange={e => selectTag(a.id, e.target.value)}
                        className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                      >
                        <option value="">— Таг сонгох —</option>
                        {tags.map(t => (
                          <option key={t.id} value={t.label}>{t.label}</option>
                        ))}
                      </select>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded shrink-0 ${a.tagColor === 'red' ? 'bg-danger/20 text-danger' : 'bg-accent/20 text-accent'}`}>
                        {a.tag || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider">Гарчиг</label>
                  <input value={a.title} onChange={e => update(a.id, 'title', e.target.value)}
                    placeholder="Мэдээний гарчиг"
                    className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:border-primary/50" />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider">Хураангуй</label>
                  <textarea value={a.excerpt} onChange={e => update(a.id, 'excerpt', e.target.value)}
                    rows={3} placeholder="Мэдээний богино хураангуй..."
                    className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm resize-none focus:outline-none focus:border-primary/50" />
                </div>

                {/* Image upload */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider">Зураг (WebP болгон хадгална)</label>
                  <div className="flex flex-wrap gap-3 items-start">
                    <label className="cursor-pointer rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-2 text-xs text-primary hover:bg-primary/10 transition-colors">
                      {uploadingId === a.id ? '⏳ Байршуулж байна...' : '📁 Зураг сонгох'}
                      <input type="file" accept="image/*" className="hidden" disabled={uploadingId === a.id}
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          setUploadingId(a.id)
                          const fd = new FormData()
                          fd.append('file', file)
                          try {
                            const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
                            const json = await res.json()
                            if (json.url) {
                              update(a.id, 'imagePath', json.url)
                            } else {
                              alert('Зураг байршуулахад алдаа гарлаа: ' + (json.error ?? 'Unknown error'))
                            }
                          } catch {
                            alert('Сервертэй холбогдоход алдаа гарлаа')
                          }
                          setUploadingId(null)
                          e.target.value = ''
                        }}
                      />
                    </label>
                    {a.imagePath && (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={a.imagePath} alt="" className="h-16 w-auto object-cover rounded border border-border" />
                        <button type="button" onClick={() => update(a.id, 'imagePath', '')}
                          className="text-danger/60 hover:text-danger text-xs px-2 py-1 border border-border rounded">
                          ✕ Устгах
                        </button>
                      </>
                    )}
                    {!a.imagePath && (
                      <span className="text-xs text-muted/60 self-center">Зураг сонгоогүй</span>
                    )}
                  </div>
                  {a.imagePath && (
                    <p className="text-[11px] text-muted/70 font-mono">{a.imagePath}</p>
                  )}
                </div>

                {/* Facebook post URL */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider">
                    🔵 Facebook пост URL (заавал биш)
                  </label>
                  <input
                    value={a.facebookUrl ?? ''}
                    onChange={e => update(a.id, 'facebookUrl', e.target.value)}
                    placeholder="https://www.facebook.com/permalink.php?story_fbid=...&id=..."
                    className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary/50"
                  />
                  <p className="text-[11px] text-muted/70">Public Facebook постын URL оруулна уу — мэдээ дотор embed болно</p>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={a.feature}
                    onChange={e => update(a.id, 'feature', e.target.checked)}
                    className="accent-primary w-4 h-4" />
                  <span className="text-sm font-semibold">★ Онцлох мэдээ (нүүрт том карт болж харагдана)</span>
                </label>
              </div>
            )}
          </div>
        ))}
      </div>

      <button type="button" onClick={add}
        className="text-sm text-primary hover:text-primary/80 border border-dashed border-primary/40 rounded-lg px-4 py-2 w-full transition-colors">
        + Мэдээ нэмэх
      </button>

      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <button type="button" onClick={save} disabled={saving}
          className="rounded-lg bg-primary/20 text-primary border border-primary/40 px-5 py-2 text-sm font-semibold hover:bg-primary/30 transition-colors disabled:opacity-50">
          {saving ? 'Хадгалж байна...' : '💾 Хадгалах'}
        </button>
        {saved && <span className="text-sm text-live font-medium">✓ Хадгалагдлаа</span>}
      </div>
    </div>
  )
}

/* ── MEDALS TAB ──────────────────────────────────────────────────────────── */
function MedalsTab({ data, onSave }: { data: MedalRow[]; onSave: (v: MedalRow[]) => Promise<void> }) {
  const [rows, setRows] = useState<MedalRow[]>(data)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function update(i: number, field: keyof MedalRow, val: string | number) {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r))
  }
  function remove(i: number) {
    setRows(prev => prev.filter((_, idx) => idx !== i))
  }
  function add() {
    setRows(prev => [...prev, { name: 'Шинэ аймаг', g: 0, s: 0, b: 0 }])
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= rows.length) return
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]]
    setRows(next)
  }

  async function save() {
    setSaving(true); setSaved(false)
    try { await onSave(rows); setSaved(true); setTimeout(() => setSaved(false), 3000) }
    catch { /* error shown globally */ }
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">Медалийн хүснэгт нүүр хуудас болон /medals хуудсанд гарна. Эрэмбэ нь жагсаалтын дарааллаар тодорхойлогдоно (1-р байранд байгаа нь 1-р байр).</p>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-2">
              <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted uppercase tracking-wider w-10">№</th>
              <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted uppercase tracking-wider">Аймаг</th>
              <th className="px-3 py-2.5 text-xs font-semibold text-muted uppercase tracking-wider w-16 text-center">🥇 Алт</th>
              <th className="px-3 py-2.5 text-xs font-semibold text-muted uppercase tracking-wider w-16 text-center">🥈 Мөнгө</th>
              <th className="px-3 py-2.5 text-xs font-semibold text-muted uppercase tracking-wider w-16 text-center">🥉 Хүрэл</th>
              <th className="px-3 py-2.5 text-xs font-semibold text-muted uppercase tracking-wider w-16 text-center">Нийт</th>
              <th className="w-20" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-surface-2 transition-colors">
                <td className="px-3 py-2 text-xs text-muted font-mono">
                  <div className="flex flex-col gap-0.5">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-muted hover:text-foreground disabled:opacity-20 text-[10px] leading-none">▲</button>
                    <span className="text-center">{i + 1}</span>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} className="text-muted hover:text-foreground disabled:opacity-20 text-[10px] leading-none">▼</button>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <input value={r.name} onChange={e => update(i, 'name', e.target.value)}
                    className="w-full rounded border border-border bg-surface px-2 py-1 text-sm focus:outline-none focus:border-primary/50" />
                </td>
                {(['g', 's', 'b'] as const).map(field => (
                  <td key={field} className="px-2 py-2 text-center">
                    <input type="number" min={0} value={r[field]}
                      onChange={e => update(i, field, parseInt(e.target.value) || 0)}
                      className="w-12 rounded border border-border bg-surface px-1 py-1 text-sm text-center focus:outline-none focus:border-primary/50" />
                  </td>
                ))}
                <td className="px-3 py-2 text-center">
                  <span className={`text-sm font-bold ${r.g + r.s + r.b > 0 ? 'text-foreground' : 'text-muted/30'}`}>
                    {r.g + r.s + r.b || '—'}
                  </span>
                </td>
                <td className="px-2 py-2 text-center">
                  <button type="button" onClick={() => remove(i)} className="text-danger/60 hover:text-danger text-sm">✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button type="button" onClick={add}
        className="text-sm text-primary hover:text-primary/80 border border-dashed border-primary/40 rounded-lg px-4 py-2 w-full transition-colors">
        + Аймаг нэмэх
      </button>

      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <button type="button" onClick={save} disabled={saving}
          className="rounded-lg bg-primary/20 text-primary border border-primary/40 px-5 py-2 text-sm font-semibold hover:bg-primary/30 transition-colors disabled:opacity-50">
          {saving ? 'Хадгалж байна...' : '💾 Хадгалах'}
        </button>
        {saved && <span className="text-sm text-live font-medium">✓ Хадгалагдлаа</span>}
      </div>
    </div>
  )
}

/* ── SCORING LINKS TAB ───────────────────────────────────────────────────── */
const SPORT_ICONS_LIST = ['🎯','🏀','🏐','♟️','🏓','⚽','🏈','🎾','🏋️','🏊','🚴','🥊','🏑','🎱','🎳']

function ScoringLinksTab({ data, onSave }: { data: ScoringLink[]; onSave: (v: ScoringLink[]) => Promise<void> }) {
  const [links, setLinks] = useState<ScoringLink[]>(data)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [modal, setModal] = useState<ScoringLink | null>(null)
  const [isNew, setIsNew] = useState(false)

  function openNew() {
    setModal({ id: crypto.randomUUID(), label: '', url: '', sport_icon: '🎯', embed: true, clip_top: 0, iframe_height: 600 })
    setIsNew(true)
  }
  function openEdit(link: ScoringLink) {
    setModal({ ...link })
    setIsNew(false)
  }
  function closeModal() { setModal(null) }

  function submitModal() {
    if (!modal) return
    if (!modal.label.trim() || !modal.url.trim()) return
    if (isNew) {
      setLinks(prev => [...prev, modal])
    } else {
      setLinks(prev => prev.map(l => l.id === modal.id ? modal : l))
    }
    setModal(null)
  }

  function remove(id: string) {
    setLinks(prev => prev.filter(l => l.id !== id))
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= links.length) return
    const next = [...links];
    [next[i], next[j]] = [next[j], next[i]]
    setLinks(next)
  }

  async function save() {
    setSaving(true); setSaved(false)
    try { await onSave(links); setSaved(true); setTimeout(() => setSaved(false), 3000) }
    catch { /* error shown globally */ }
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">
        Үр дүн хуудасны доод хэсэгт харагдах гадаад оноо болон шууд дамжуулалтын линкүүд.
        Embed сонгосон тохиолдолд iframe болж харагдана, эсвэл шинэ цонхонд нээх товч гарна.
      </p>

      {/* Link list */}
      <div className="space-y-2">
        {links.length === 0 && (
          <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-xs text-muted">
            Линк байхгүй. Доорх товчоор нэмнэ үү.
          </div>
        )}
        {links.map((link, i) => (
          <div key={link.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3">
            <div className="flex flex-col gap-0.5">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-muted hover:text-foreground disabled:opacity-20 text-xs leading-none">▲</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === links.length - 1} className="text-muted hover:text-foreground disabled:opacity-20 text-xs leading-none">▼</button>
            </div>
            <span className="text-2xl shrink-0">{link.sport_icon}</span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{link.label}</div>
              <div className="text-xs text-muted font-mono truncate">{link.url}</div>
            </div>
            <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${link.embed ? 'bg-primary/20 text-primary' : 'bg-surface text-muted border border-border'}`}>
              {link.embed ? 'iframe' : 'Линк'}
            </span>
            <button type="button" onClick={() => openEdit(link)}
              className="shrink-0 text-xs text-muted hover:text-foreground border border-border rounded px-2 py-1 hover:bg-surface transition-colors">
              Засах
            </button>
            <button type="button" onClick={() => remove(link.id)}
              className="shrink-0 text-danger/60 hover:text-danger text-sm px-1">✕</button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={openNew}
        className="text-sm text-primary hover:text-primary/80 border border-dashed border-primary/40 rounded-lg px-4 py-2 w-full transition-colors"
      >
        + Шинэ линк нэмэх
      </button>

      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <button type="button" onClick={save} disabled={saving}
          className="rounded-lg bg-primary/20 text-primary border border-primary/40 px-5 py-2 text-sm font-semibold hover:bg-primary/30 transition-colors disabled:opacity-50">
          {saving ? 'Хадгалж байна...' : '💾 Хадгалах'}
        </button>
        {saved && <span className="text-sm text-live font-medium">✓ Хадгалагдлаа</span>}
      </div>

      {/* ── MODAL ─────────────────────────────────────────────── */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(11,20,38,.85)' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-bold text-base">{isNew ? '+ Шинэ линк нэмэх' : 'Линк засах'}</h3>
              <button type="button" onClick={closeModal} className="text-muted hover:text-foreground text-lg px-1">✕</button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4">
              {/* Icon picker */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider">Спортын дүрс</label>
                <div className="flex flex-wrap gap-2">
                  {SPORT_ICONS_LIST.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setModal(m => m ? { ...m, sport_icon: icon } : m)}
                      className={`text-2xl rounded-lg w-10 h-10 flex items-center justify-center border transition-colors ${
                        modal.sport_icon === icon
                          ? 'border-primary bg-primary/20'
                          : 'border-border bg-surface-2 hover:border-primary/50'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Label */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider">Нэр / Гарчиг</label>
                <input
                  value={modal.label}
                  onChange={e => setModal(m => m ? { ...m, label: e.target.value } : m)}
                  placeholder="Дартс · Шууд оноо"
                  className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                />
              </div>

              {/* URL */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider">URL холбоос</label>
                <input
                  value={modal.url}
                  onChange={e => setModal(m => m ? { ...m, url: e.target.value } : m)}
                  placeholder="https://..."
                  type="url"
                  className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary/50"
                />
              </div>

              {/* Clip + height */}
              {modal.embed && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider">
                      Дээрээс хасах (px)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={modal.clip_top}
                      onChange={e => setModal(m => m ? { ...m, clip_top: parseInt(e.target.value) || 0 } : m)}
                      className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary/50"
                    />
                    <p className="text-[10px] text-muted/70">Дээд навигац нуухад 130–200px</p>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider">
                      Харагдах өндөр (px)
                    </label>
                    <input
                      type="number"
                      min={200}
                      value={modal.iframe_height}
                      onChange={e => setModal(m => m ? { ...m, iframe_height: parseInt(e.target.value) || 600 } : m)}
                      className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary/50"
                    />
                    <p className="text-[10px] text-muted/70">Хэрэглэгчид харагдах өндөр</p>
                  </div>
                </div>
              )}

              {/* Embed toggle */}
              <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-border bg-surface-2 px-4 py-3 hover:border-primary/40 transition-colors">
                <input
                  type="checkbox"
                  checked={modal.embed}
                  onChange={e => setModal(m => m ? { ...m, embed: e.target.checked } : m)}
                  className="accent-primary w-4 h-4"
                />
                <div>
                  <div className="text-sm font-semibold">Iframe болгон дэлгэцэд харуулах</div>
                  <div className="text-xs text-muted mt-0.5">
                    {modal.embed
                      ? 'Үр дүн хуудсанд шуурхай харагдана (зарим сайт зөвшөөрдөггүй)'
                      : 'Шинэ цонхонд нээх товч гарна'}
                  </div>
                </div>
              </label>

              {/* Preview */}
              {modal.label && modal.url && (
                <div className="rounded-lg border border-line bg-ink-2 p-3">
                  <div className="text-[10px] text-muted uppercase tracking-wider mb-2">Урьдчилан харах</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{modal.sport_icon}</span>
                    <div>
                      <div className="text-sm font-semibold">{modal.label}</div>
                      <div className="text-xs text-muted font-mono truncate">{modal.url.slice(0, 50)}{modal.url.length > 50 ? '…' : ''}</div>
                    </div>
                    <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${modal.embed ? 'bg-primary/20 text-primary' : 'bg-muted/20 text-muted'}`}>
                      {modal.embed ? 'iframe' : 'Линк'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-surface-2">
              <button type="button" onClick={closeModal}
                className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:text-foreground transition-colors">
                Болих
              </button>
              <button
                type="button"
                onClick={submitModal}
                disabled={!modal.label.trim() || !modal.url.trim()}
                className="rounded-lg bg-primary/20 text-primary border border-primary/40 px-5 py-2 text-sm font-semibold hover:bg-primary/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isNew ? '+ Нэмэх' : '💾 Хадгалах'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── HOME SECTIONS TAB ───────────────────────────────────────────────────── */
const SECTION_META: { key: keyof HomeSections; label: string; desc: string }[] = [
  { key: 'stats',       label: 'Тоо баримт',                desc: '21 аймаг, 5 төрөл, 1,240+ тамирчин гэх мэт тоонууд' },
  { key: 'news',        label: 'Онцлох мэдээ',              desc: 'Сүүлийн мэдээний хэсэг' },
  { key: 'sports',      label: 'Спортын төрлүүд',            desc: '5 спортын картны хэсэг' },
  { key: 'schedule',    label: 'Хуваарь',                   desc: '3 өдрийн хөтөлбөрийн хэсэг' },
  { key: 'medals',      label: 'Медалийн хүснэгт',          desc: 'Аймгуудын медалийн байдал' },
  { key: 'host_aimags', label: 'Зохион байгуулагч аймгууд', desc: '4 зохион байгуулагч аймгийн хэсэг' },
  { key: 'about',       label: 'Наадмын тухай',              desc: 'Товч тайлбар, наадмын түүхийн хэсэг' },
  { key: 'sponsors',    label: 'Спонсор / Ивээн тэтгэгчид',  desc: 'Спонсор, дэмжигч байгууллагуудын хэсэг' },
]

function HomeSectionsTab({ data, onSave }: { data: HomeSections; onSave: (v: HomeSections) => Promise<void> }) {
  const [form, setForm] = useState<HomeSections>(data)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function toggle(key: keyof HomeSections) {
    setForm(f => ({ ...f, [key]: !f[key] }))
  }

  async function save() {
    setSaving(true); setSaved(false)
    try { await onSave(form); setSaved(true); setTimeout(() => setSaved(false), 3000) }
    catch { /* error shown globally */ }
    setSaving(false)
  }

  const visibleCount = Object.values(form).filter(Boolean).length

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-xs text-muted">
        <p className="font-semibold text-foreground/70 mb-1">🔲 Нүүр хуудасны секторууд</p>
        <p>Нүүрт харагдуулах хэсгийг сонгоно. Одоо <b className="text-foreground">{visibleCount}/{SECTION_META.length}</b> хэсэг харагдаж байна.</p>
      </div>

      <div className="space-y-2">
        {SECTION_META.map(({ key, label, desc }) => (
          <label
            key={key}
            className={`flex items-center gap-4 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
              form[key]
                ? 'border-primary/30 bg-primary/5'
                : 'border-border bg-surface-2 opacity-60'
            }`}
          >
            <input
              type="checkbox"
              checked={form[key]}
              onChange={() => toggle(key)}
              className="accent-primary w-4 h-4 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold">{label}</div>
              <div className="text-xs text-muted mt-0.5">{desc}</div>
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              form[key] ? 'bg-live/20 text-live' : 'bg-muted/20 text-muted'
            }`}>
              {form[key] ? 'Харагдана' : 'Нуугдсан'}
            </span>
          </label>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-primary/20 text-primary border border-primary/40 px-5 py-2 text-sm font-semibold hover:bg-primary/30 transition-colors disabled:opacity-50"
        >
          {saving ? 'Хадгалж байна...' : '💾 Хадгалах'}
        </button>
        {saved && <span className="text-sm text-live font-medium">✓ Хадгалагдлаа</span>}
      </div>
    </div>
  )
}

/* ── HISTORY TAB ─────────────────────────────────────────────────────────── */
const AIMAG_LIST = [
  '', 'Архангай', 'Багануур', 'Баян-Өлгий', 'Баянхонгор', 'Булган',
  'Говь-Алтай', 'Дархан-Уул', 'Дорноговь', 'Дорнод', 'Дундговь',
  'Завхан', 'Орхон', 'Өвөрхангай', 'Өмнөговь', 'Сүхбаатар',
  'Сэлэнгэ', 'Төв', 'Увс', 'Ховд', 'Хөвсгөл', 'Хэнтий',
]
const H_SPORTS = ['Сагсан бөмбөг','Волейбол','Дартс','Ширээний теннис','Шатар','Бөх']
const H_ICON: Record<string,string> = {'Сагсан бөмбөг':'🏀','Волейбол':'🏐','Дартс':'🎯','Ширээний теннис':'🏓','Шатар':'♟️','Бөх':'🤼'}

type HResult = {id:string;sport:string;gender:string;gold:string;gold_name:string;silver:string;silver_name:string;bronze:string;bronze_name:string}
type HAward  = {id:string;sport:string;gender:string;title:string;aimag:string;name:string}
type HTData  = {overall_champion:string;results:HResult[];awards:HAward[]}

const mkR=(sport:string,gender:string,g='',gn='',s='',sn='',b='',bn=''):HResult=>
  ({id:`${sport}${gender}`,sport,gender,gold:g,gold_name:gn,silver:s,silver_name:sn,bronze:b,bronze_name:bn})
const mkA=(sport:string,gender:string,title:string,aimag='',name=''):HAward=>
  ({id:`${sport}${gender}${title}`,sport,gender,title,aimag,name})

const H_DEFAULTS:Record<string,HTData> = {
  I:{
    overall_champion:'Дархан-Уул',
    results:[
      mkR('Сагсан бөмбөг','male','Дархан-Уул','','Хөвсгөл','','Сүхбаатар',''),
      mkR('Сагсан бөмбөг','female','Дархан-Уул','','Өмнөговь','','Говь-Алтай',''),
      mkR('Волейбол','male','Говь-Алтай','','Хэнтий','','Ховд',''),
      mkR('Волейбол','female','Өмнөговь','','Дундговь','','Баянхонгор',''),
    ],awards:[],
  },
  II:{
    overall_champion:'Увс',
    results:[
      mkR('Сагсан бөмбөг','male','Дархан-Уул','','Увс','','Говь-Алтай',''),
      mkR('Сагсан бөмбөг','female','Өмнөговь','','Увс','','Говь-Алтай',''),
      mkR('Волейбол','male','Хэнтий','','Өвөрхангай','','Говь-Алтай',''),
      mkR('Волейбол','female','Дундговь','','Өвөрхангай','','Архангай',''),
    ],awards:[],
  },
  III:{
    overall_champion:'',
    results:[
      mkR('Дартс','male'),mkR('Дартс','female'),
      mkR('Ширээний теннис','male'),mkR('Ширээний теннис','female'),
      mkR('Шатар','male'),mkR('Шатар','female'),
      mkR('Сагсан бөмбөг','male'),mkR('Сагсан бөмбөг','female'),
      mkR('Волейбол','male'),mkR('Волейбол','female'),
    ],awards:[],
  },
  IV:{
    overall_champion:'Өвөрхангай',
    results:[
      mkR('Дартс','male','Өмнөговь','Б.Наян','Дорноговь','Ц.Эрхэмбат','Говь-Алтай','Л.Нүрэвдорж'),
      mkR('Дартс','female','Дархан-Уул','С.Оюунчимэг','Өмнөговь','С.Уртнасан','Төв','Ц.Дагиймаа'),
      mkR('Ширээний теннис','male','Хөвсгөл','Н.Баттулга','Булган','Д.Энхтүвшин','Өвөрхангай','Ц.Энх-Амгалан'),
      mkR('Ширээний теннис','female','Булган','Д.Отгонбаяр','Говь-Алтай','П.Даваацэрэн','Дорнод','Б.Анхзаяа'),
      mkR('Шатар','male','Булган','Б.Үүрцайх','Дорноговь','О.Батзориг','Төв','Г.Отгонпүрэв'),
      mkR('Шатар','female','Өмнөговь','У.Цогтэрэл','Дундговь','А.Найгалмаа','Завхан','Л.Оюунцэцэг'),
      mkR('Сагсан бөмбөг','male','Дархан-Уул','','Орхон','','Дорноговь',''),
      mkR('Сагсан бөмбөг','female','Дархан-Уул','','Төв','','Говь-Алтай',''),
      mkR('Волейбол','male','Говь-Алтай','','Өвөрхангай','','Хэнтий',''),
      mkR('Волейбол','female','Дундговь','','Өвөрхангай','','Завхан',''),
    ],
    awards:[
      mkA('Сагсан бөмбөг','female','Довтлогч','Дархан-Уул','С.Мөнхтуяа'),
      mkA('Сагсан бөмбөг','female','Холбогч','Дархан-Уул','Н.Туяа'),
      mkA('Сагсан бөмбөг','female','Хамгаалагч','Говь-Алтай','Ч.Энхцэцэг'),
      mkA('Сагсан бөмбөг','female','Тэвийн тоглогч','Төв','Н.Бямбаабаатар'),
      mkA('Сагсан бөмбөг','male','Тэвийн тоглогч','Орхон','Г.Ганхуяг'),
      mkA('Сагсан бөмбөг','male','Холбогч','Орхон','Н.Батболд'),
      mkA('Сагсан бөмбөг','male','Шилдэг довтлогч','Дархан-Уул','Д.Ганцогт'),
      mkA('Сагсан бөмбөг','male','Хамгаалагч','Дорноговь','Н.Цэвэгдорж'),
      mkA('Волейбол','female','Тэш тоглогч','Дундговь','С.Батжаргал'),
      mkA('Волейбол','female','Холбогч','Дундговь','Ч.Оюунчимэг'),
      mkA('Волейбол','female','Хамгаалагч','Завхан','И.Хишигжаргал'),
      mkA('Волейбол','female','Шилдэг довтлогч','Өвөрхангай','Н.Алимаа'),
      mkA('Волейбол','male','Шилдэг довтлогч','Говь-Алтай','Г.Баярсайхан'),
      mkA('Волейбол','male','Тэш тоглогч','Говь-Алтай','Н.Болдбаатар'),
      mkA('Волейбол','male','Шилдэг холбогч','Өвөрхангай','Н.Нүрэвсүрэн'),
      mkA('Волейбол','male','Хамгаалагч','Хэнтий','Н.Ганболд'),
    ],
  },
}

function HistoryTab({ saveToApi }: { saveToApi: (key: string, value: unknown) => Promise<void> }) {
  const [active, setActive] = useState<'I'|'II'|'III'|'IV'>('III')
  const [allData, setAllData] = useState<Record<string,HTData>>(H_DEFAULTS)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/admin/site-settings')
      .then(r => r.json())
      .then(d => {
        if (d.history_data) setAllData(prev => ({ ...prev, ...d.history_data }))
        setLoaded(true)
      })
  }, [])

  const cur = allData[active]
  const setF = (field: keyof HTData, val: any) => {
    setAllData(p => ({ ...p, [active]: { ...p[active], [field]: val } }))
    setSaved(false)
  }

  const updR = (id: string, key: string, val: string) =>
    setF('results', cur.results.map(r => r.id === id ? { ...r, [key]: val } : r))
  const addR = () => { const r = mkR('Сагсан бөмбөг','male'); r.id = Date.now().toString(); setF('results', [...cur.results, r]) }
  const delR = (id: string) => setF('results', cur.results.filter(r => r.id !== id))

  const updA = (id: string, key: string, val: string) =>
    setF('awards', cur.awards.map(a => a.id === id ? { ...a, [key]: val } : a))
  const addA = () => { const a = mkA('Сагсан бөмбөг','female',''); a.id = Date.now().toString(); setF('awards', [...cur.awards, a]) }
  const delA = (id: string) => setF('awards', cur.awards.filter(a => a.id !== id))

  async function save() {
    setSaving(true); setSaved(false)
    await saveToApi('history_data', allData)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (!loaded) return <div className="py-8 text-center text-sm text-muted">Уншиж байна...</div>

  return (
    <div className="space-y-5">
      {/* Наадам selector */}
      <div className="flex gap-2 flex-wrap">
        {(['I','II','III','IV'] as const).map(n => (
          <button key={n} type="button" onClick={() => setActive(n)}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold border transition-colors ${
              active===n ? 'bg-primary/20 text-primary border-primary/40' : 'border-border text-muted hover:text-foreground hover:bg-surface-2'
            }`}>{n} Наадам</button>
        ))}
      </div>

      {/* Цомын эзэн */}
      <div className="rounded-xl border border-border bg-surface-2 p-4 flex items-center gap-4">
        <span className="text-xl">🏆</span>
        <div>
          <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Шилжин явах цомын эзэн</div>
          <select value={cur.overall_champion} onChange={e => setF('overall_champion', e.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50">
            {AIMAG_LIST.map(a => <option key={a} value={a}>{a || '— Сонгох —'}</option>)}
          </select>
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Спортын дүн</div>
        <div className="space-y-3">
          {cur.results.map(r => (
            <div key={r.id} className="rounded-xl border border-border overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-surface-2 border-b border-border">
                <select value={r.sport} onChange={e => updR(r.id,'sport',e.target.value)}
                  className="rounded border border-border bg-surface px-2 py-1 text-xs font-bold text-foreground focus:outline-none">
                  {H_SPORTS.map(s => <option key={s} value={s}>{H_ICON[s]} {s}</option>)}
                </select>
                <select value={r.gender} onChange={e => updR(r.id,'gender',e.target.value)}
                  className={`rounded px-2 py-1 text-[10px] font-bold border-0 focus:outline-none ${r.gender==='male'?'bg-blue-500/20 text-blue-400':r.gender==='female'?'bg-pink-500/20 text-pink-400':'bg-muted/20 text-muted'}`}>
                  <option value="male">Эрэгтэй</option><option value="female">Эмэгтэй</option><option value="mixed">Холимог</option>
                </select>
                <button type="button" onClick={() => delR(r.id)} className="ml-auto text-danger/50 hover:text-danger text-sm">✕</button>
              </div>
              <div className="p-3 space-y-2">
                {(['gold','silver','bronze'] as const).map((rank,ri) => (
                  <div key={rank} className="grid grid-cols-[20px_1fr_1fr] gap-2 items-center">
                    <span className="text-base">{['🥇','🥈','🥉'][ri]}</span>
                    <select value={r[rank]} onChange={e => updR(r.id,rank,e.target.value)}
                      className="rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/50">
                      {AIMAG_LIST.map(a => <option key={a} value={a}>{a||'— Аймаг —'}</option>)}
                    </select>
                    <input value={r[`${rank}_name`]??''} onChange={e => updR(r.id,`${rank}_name`,e.target.value)}
                      placeholder="Тамирчны нэр"
                      className="rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-xs text-foreground placeholder:text-muted/40 focus:outline-none focus:border-primary/50"/>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addR}
          className="mt-2 w-full rounded-lg border border-dashed border-primary/40 py-2 text-xs text-primary hover:bg-primary/5 transition-colors">
          + Спорт нэмэх
        </button>
      </div>

      {/* Awards */}
      <div>
        <div className="text-xs font-bold text-muted uppercase tracking-wider mb-3">⭐ Шилдэг тоглогчид</div>
        <div className="rounded-xl border border-border overflow-hidden">
          {cur.awards.length === 0 && <div className="py-5 text-center text-xs text-muted">Шилдэг тоглогч байхгүй</div>}
          {cur.awards.map((a,ai) => (
            <div key={a.id} className={`grid grid-cols-[1fr_70px_1fr_1fr_1fr_20px] gap-1.5 items-center px-3 py-2 ${ai%2===0?'':'bg-surface-2'} border-b border-border last:border-0`}>
              <select value={a.sport} onChange={e => updA(a.id,'sport',e.target.value)}
                className="rounded border border-border bg-surface px-1.5 py-1 text-xs text-foreground focus:outline-none">
                {H_SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={a.gender} onChange={e => updA(a.id,'gender',e.target.value)}
                className="rounded border border-border bg-surface px-1 py-1 text-xs text-foreground focus:outline-none">
                <option value="male">Эр</option><option value="female">Эм</option>
              </select>
              <input value={a.title} onChange={e => updA(a.id,'title',e.target.value)} placeholder="Байрлал"
                className="rounded border border-border bg-surface-2 px-1.5 py-1 text-xs text-foreground placeholder:text-muted/40 focus:outline-none"/>
              <select value={a.aimag} onChange={e => updA(a.id,'aimag',e.target.value)}
                className="rounded border border-border bg-surface px-1.5 py-1 text-xs text-foreground focus:outline-none">
                {AIMAG_LIST.map(am => <option key={am} value={am}>{am||'— Аймаг —'}</option>)}
              </select>
              <input value={a.name} onChange={e => updA(a.id,'name',e.target.value)} placeholder="Нэр"
                className="rounded border border-border bg-surface-2 px-1.5 py-1 text-xs text-foreground placeholder:text-muted/40 focus:outline-none"/>
              <button type="button" onClick={() => delA(a.id)} className="text-danger/50 hover:text-danger text-sm text-center">✕</button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addA}
          className="mt-2 w-full rounded-lg border border-dashed border-primary/40 py-2 text-xs text-primary hover:bg-primary/5 transition-colors">
          + Шилдэг тоглогч нэмэх
        </button>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <button type="button" onClick={save} disabled={saving}
          className="rounded-lg bg-primary/20 text-primary border border-primary/40 px-5 py-2 text-sm font-semibold hover:bg-primary/30 transition-colors disabled:opacity-50">
          {saving ? 'Хадгалж байна...' : '💾 Хадгалах'}
        </button>
        {saved && <span className="text-sm text-live font-medium">✓ Хадгалагдлаа</span>}
      </div>
    </div>
  )
}

const SECTION_KEYS: Partial<Record<Tab, keyof HomeSections>> = {
  sponsors: 'sponsors',
  stats:    'stats',
  aimags:   'host_aimags',
  about:    'about',
  schedule: 'schedule',
  news:     'news',
  medals:   'medals',
}

/* ── MAIN CLIENT COMPONENT ────────────────────────────────────────────────── */
export function SiteCmsClient({ initialSettings }: { initialSettings: SiteSettings }) {
  const [tab, setTab] = useState<Tab | ''>('general')
  const [settings, setSettings] = useState(initialSettings)
  const [globalErr, setGlobalErr] = useState('')
  const errTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const save = useCallback(async (key: string, value: unknown): Promise<void> => {
    setGlobalErr('')
    const res = await fetch('/api/admin/site-settings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ key, value }),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok || json.error) {
      const msg = json.error ?? `HTTP ${res.status}`
      setGlobalErr(`⚠️ Хадгалахад алдаа гарлаа: ${msg}`)
      if (errTimer.current) clearTimeout(errTimer.current)
      errTimer.current = setTimeout(() => setGlobalErr(''), 8000)
      throw new Error(msg)
    }
    setSettings(prev => ({ ...prev, [key]: value }))
  }, [])

  function tabContent() {
    if (tab === 'general')  return <GeneralTab      data={settings.general}         onSave={v => save('general', v)}        />
    if (tab === 'hero')     return <HeroTab         data={settings.hero}            onSave={v => save('hero', v)}           />
    if (tab === 'nav')      return <NavTab          data={settings.nav_links}       onSave={v => save('nav_links', v)}      />
    if (tab === 'sponsors') return <SponsorsTab     data={settings.sponsors}        onSave={v => save('sponsors', v)}       />
    if (tab === 'stats')    return <StatsTab        data={settings.stats}           onSave={v => save('stats', v)}          />
    if (tab === 'media')    return <MediaTab        data={settings.hero}            onSave={v => save('hero', v)}           />
    if (tab === 'aimags')   return <HostAimagsTab   data={settings.host_aimags}     onSave={v => save('host_aimags', v)}    />
    if (tab === 'about')    return <AboutTab        data={settings.about}           onSave={v => save('about', v)}          />
    if (tab === 'schedule') return <ScheduleTab     data={settings.schedule}        onSave={v => save('schedule', v)}       />
    if (tab === 'footer')   return <FooterTab       data={settings.footer_nav}      onSave={v => save('footer_nav', v)}     />
    if (tab === 'news')     return <NewsTab         data={settings.news} tags={settings.news_tags} onSave={v => save('news', v)} onSaveTags={v => save('news_tags', v)} />
    if (tab === 'medals')   return <MedalsTab        data={settings.medal_standings} onSave={v => save('medal_standings', v)} />
    if (tab === 'scoring')  return <ScoringLinksTab data={settings.scoring_links}   onSave={v => save('scoring_links', v)}  />
    if (tab === 'sections') return <HomeSectionsTab data={settings.home_sections}   onSave={v => save('home_sections', v)}  />
    if (tab === 'history')  return <HistoryTab saveToApi={save} />
    return null
  }

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      {/* Global error */}
      {globalErr && (
        <div className="mx-4 mt-4 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {globalErr}
        </div>
      )}

      {/* Accordion */}
      <div className="divide-y divide-border">
        {TABS.map(t => {
          const isOpen = tab === t.id
          const sectionKey = SECTION_KEYS[t.id]
          const isVisible = sectionKey !== undefined ? settings.home_sections[sectionKey] : undefined

          return (
            <div key={t.id}>
              <div className={`flex items-center transition-colors ${
                isOpen ? 'bg-primary/10' : 'hover:bg-surface-2'
              }`}>
                {/* Accordion toggle */}
                <button
                  onClick={() => setTab(isOpen ? '' : t.id)}
                  className={`flex flex-1 items-center gap-3 px-4 py-3.5 text-sm text-left ${
                    isOpen ? 'text-primary' : 'text-muted hover:text-foreground'
                  }`}
                >
                  <span className="text-base">{t.icon}</span>
                  <span className="flex-1 font-semibold">{t.label}</span>
                  <span className="text-[10px] opacity-40">{isOpen ? '▲' : '▼'}</span>
                </button>

                {/* Section visibility toggle */}
                {sectionKey !== undefined && (
                  <button
                    onClick={async e => {
                      e.stopPropagation()
                      const next = { ...settings.home_sections, [sectionKey]: !isVisible }
                      await save('home_sections', next)
                    }}
                    title={isVisible ? 'Нүүр хуудаснаас нуух' : 'Нүүр хуудсанд харуулах'}
                    className={`mr-3 flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors ${
                      isVisible
                        ? 'bg-live/15 text-live border-live/30 hover:bg-live/25'
                        : 'bg-surface text-muted border-border hover:border-primary/50 hover:text-primary'
                    }`}
                  >
                    {isVisible ? '🟢 Нийтийн' : '⚪ Нуугдсан'}
                  </button>
                )}
              </div>
              {isOpen && (
                <div className="border-t border-border px-6 py-6">
                  {tabContent()}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
