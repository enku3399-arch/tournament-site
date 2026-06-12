import { createServiceClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminGalleryRoot() {
  const supabase = createServiceClient()
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('id, name, status')
    .order('created_at', { ascending: false })

  const all = tournaments ?? []

  // If only one tournament, redirect directly
  if (all.length === 1) {
    redirect(`/admin/${all[0].id}/gallery`)
  }

  // If there's an active tournament, redirect to it
  const active = all.find(t => t.status === 'active')
  if (active) {
    redirect(`/admin/${active.id}/gallery`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">📸 Зургийн цомог</h1>
        <p className="text-sm text-muted mt-1">Аль тэмцээний цомгийг удирдах вэ?</p>
      </div>
      <div className="space-y-3">
        {all.map(t => (
          <Link
            key={t.id}
            href={`/admin/${t.id}/gallery`}
            className="flex items-center justify-between rounded-xl border border-border bg-surface p-5 hover:border-primary/30 hover:bg-surface-2 transition-all"
          >
            <span className="font-semibold">{t.name}</span>
            <span className="text-sm text-primary">Цомог удирдах →</span>
          </Link>
        ))}
        {all.length === 0 && (
          <p className="text-muted text-sm text-center py-12">Тэмцээн байхгүй байна.</p>
        )}
      </div>
    </div>
  )
}
