import { createServiceClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { SPORT_ICONS } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = createServiceClient()
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*, tournament_sports(*)')
    .order('created_at', { ascending: false })

  const all = tournaments ?? []

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Тэмцээн удирдах самбар</h1>
          <p className="text-sm text-muted mt-1">Тэмцээн үүсгэх, удирдах, оноо оруулах</p>
        </div>
        <Link href="/admin/new" className="rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:bg-primary-hover transition-colors">
          + Шинэ тэмцээн
        </Link>
      </div>

      {all.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-16 text-center">
          <p className="text-4xl mb-4">🏟️</p>
          <p className="text-muted mb-4">Тэмцээн байхгүй байна</p>
          <Link href="/admin/new" className="rounded-lg bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary-hover transition-colors">
            Анхны тэмцээнээ үүсгэх
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {all.map((t: any) => (
            <div key={t.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-surface p-5 hover:border-primary/30 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg truncate">{t.name}</h3>
                  <StatusBadge status={t.status} />
                </div>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {(t.tournament_sports ?? []).map((s: any) => (
                    <span key={s.id} className="rounded-full bg-surface-2 border border-border px-2 py-0.5">
                      {SPORT_ICONS[s.sport_type] ?? '🏅'} {s.name}
                    </span>
                  ))}
                  {t.location && <span className="text-muted">📍 {t.location}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted font-mono bg-surface-2 border border-border rounded px-2 py-1">
                  Admin: {t.admin_code}
                </span>
                <Link href={`/t/${t.id}`} className="rounded px-3 py-1.5 text-sm text-muted border border-border hover:bg-surface-2 transition-colors">
                  Харах
                </Link>
                <Link href={`/admin/${t.id}`} className="rounded bg-primary px-3 py-1.5 text-sm text-white hover:bg-primary-hover transition-colors">
                  Удирдах
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'active') return <span className="rounded-full bg-live/20 px-2 py-0.5 text-xs font-bold text-live">● LIVE</span>
  if (status === 'completed') return <span className="rounded-full bg-muted/20 px-2 py-0.5 text-xs font-semibold text-muted">Дууссан</span>
  return <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-semibold text-accent">Ноорог</span>
}
