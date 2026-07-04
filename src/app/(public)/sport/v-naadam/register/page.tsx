import { createServiceClient as createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { SPORT_ICONS } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function RegisterSelectPage() {
  const supabase = createClient()
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*, tournament_sports(*)')
    .eq('status', 'active')
    .order('start_date')

  const list = tournaments ?? []

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-extrabold mb-2">Баг / Тамирчин бүртгэл</h1>
      <p className="text-muted mb-8">Бүртгүүлэх тэмцээнээ сонгоно уу</p>

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted">
          Одоогоор нээлттэй бүртгэл байхгүй байна
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((t: any) => (
            <Link key={t.id} href={`/register/${t.id}`}
              className="flex items-center justify-between rounded-xl border border-border bg-surface p-5 hover:border-primary/50 hover:bg-surface-2 transition-all group">
              <div>
                <h3 className="font-bold group-hover:text-primary transition-colors">{t.name}</h3>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(t.tournament_sports ?? []).map((s: any) => (
                    <span key={s.id} className="text-xs text-muted">
                      {SPORT_ICONS[s.sport_type] ?? '🏅'} {s.name}
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-primary">→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
