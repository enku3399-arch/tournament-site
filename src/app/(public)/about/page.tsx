import Link from 'next/link'
import { getSiteSettings } from '@/lib/site-settings'
import { createServiceClient } from '@/lib/supabase-server'
import { TOURNAMENT_ID } from '@/lib/medal-calc'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Наадмын тухай · Монгол 87/89 V Спорт Наадам 2026',
  description: 'Монгол 87/89 Төгсөгчдийн Холбоо ТββBB-ийн V Спорт Наадам 2026 — зорилго, түүх, зохион байгуулагчид',
}

const DUUREG_NAMES = new Set(['Ажилчин', 'Найрамдал', 'Сүхбаатар дүүрэг', 'Багануур'])

async function getParticipatingAimags(): Promise<string[]> {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('teams')
      .select('name')
      .eq('tournament_id', TOURNAMENT_ID)
    const unique = [...new Set((data ?? []).map(t => t.name as string))]
    return unique.sort((a, b) => a.localeCompare(b, 'mn'))
  } catch { return [] }
}

export default async function AboutPage() {
  const [settings, aimags] = await Promise.all([getSiteSettings(), getParticipatingAimags()])
  const { about } = settings

  return (
    <div className="wrap-wide py-10 space-y-16">

      {/* ── Hero header ──────────────────────────────────────────── */}
      <div className="max-w-3xl">
        <p className="text-xs text-muted uppercase tracking-widest font-semibold mb-2">Наадмын тухай</p>
        <h1 className="text-4xl font-extrabold leading-tight mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>
          Монгол-87/89 ГҮТББ-ийн<br />
          <span style={{ color: 'var(--gold)' }}>V Спорт Наадам · 2026</span>
        </h1>
        <p className="text-lg text-muted leading-relaxed">{about.subtitle}</p>
      </div>

      {/* ── Key facts ────────────────────────────────────────────── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {about.facts.map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-surface px-5 py-4">
            <div className="text-xs text-muted uppercase tracking-widest mb-1">{label}</div>
            <div className="font-bold text-lg">{value}</div>
          </div>
        ))}
      </div>

      {/* ── Mission & values ─────────────────────────────────────── */}
      <section>
        <h2 className="text-2xl font-extrabold mb-6" style={{ fontFamily: 'Oswald, sans-serif' }}>
          Зорилго ба үнэт зүйлс
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {about.values.map(({ icon, title, body }) => (
            <div key={title} className="rounded-xl border border-border bg-surface p-5 flex gap-4">
              <span className="text-3xl shrink-0">{icon}</span>
              <div>
                <div className="font-bold mb-1">{title}</div>
                <p className="text-sm text-muted leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── History ──────────────────────────────────────────────── */}
      <section>
        <h2 className="text-2xl font-extrabold mb-6" style={{ fontFamily: 'Oswald, sans-serif' }}>
          Наадмын түүх
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-xs text-muted border-b border-border">
                <th className="text-left py-3 pr-6 font-semibold">Удаа</th>
                <th className="text-left py-3 pr-6 font-semibold">Жил</th>
                <th className="text-left py-3 pr-6 font-semibold">Хот</th>
                <th className="text-left py-3 font-semibold">Спортын төрөл</th>
              </tr>
            </thead>
            <tbody>
              {about.editions.map(ed => (
                <tr
                  key={ed.num}
                  className={`border-b border-border/40 ${ed.current ? 'bg-accent/5' : ''}`}
                >
                  <td className="py-3 pr-6 font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>
                    {ed.current
                      ? <span style={{ color: 'var(--gold)' }}>{ed.num} наадам ★</span>
                      : `${ed.num} наадам`}
                  </td>
                  <td className="py-3 pr-6">{ed.year}</td>
                  <td className="py-3 pr-6">{ed.city}</td>
                  <td className="py-3 text-muted">{ed.sports} төрөл</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Host aimags ──────────────────────────────────────────── */}
      <section>
        <h2 className="text-2xl font-extrabold mb-2" style={{ fontFamily: 'Oswald, sans-serif' }}>
          Оролцогч аймгууд
        </h2>
        {(() => {
          const duureg = aimags.filter(a => DUUREG_NAMES.has(a))
          const aimag  = aimags.filter(a => !DUUREG_NAMES.has(a))
          return (
            <p className="text-muted text-sm mb-5">
              2026 оны наадамд <strong>{aimag.length} аймаг</strong>, <strong>{duureg.length} дүүрэг</strong> оролцоно
            </p>
          )
        })()}
        <div className="flex flex-wrap gap-2">
          {aimags.map(a => (
            <span
              key={a}
              className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm font-medium"
            >
              {a}
            </span>
          ))}
        </div>
      </section>

      {/* ── Organizer ────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-border bg-surface p-8">
        <h2 className="text-2xl font-extrabold mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>
          Зохион байгуулагч
        </h2>
        <div className="grid sm:grid-cols-2 gap-6 text-sm">
          <div className="space-y-3">
            <div>
              <div className="text-xs text-muted uppercase tracking-wide mb-0.5">Байгууллага</div>
              <div className="font-semibold">{about.orgName}</div>
            </div>
            <div>
              <div className="text-xs text-muted uppercase tracking-wide mb-0.5">Тамирчид</div>
              <div className="font-semibold">{about.orgAthletes}</div>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-xs text-muted uppercase tracking-wide mb-0.5">Уриа үг</div>
              <div className="font-semibold" style={{ color: 'var(--gold)' }}>
                {about.orgMotto}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted uppercase tracking-wide mb-0.5">Байршил</div>
              <div className="font-semibold">{about.orgLocation}</div>
            </div>
          </div>
        </div>
      </section>


    </div>
  )
}
