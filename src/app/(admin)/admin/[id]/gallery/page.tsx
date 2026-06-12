import { createServiceClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import GalleryAdminList from './GalleryAdminList'

export const dynamic = 'force-dynamic'

export default async function AdminGalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServiceClient()

  const { data: tournament } = await supabase.from('tournaments').select('id,name').eq('id', id).single()
  if (!tournament) notFound()

  const { data: albums } = await supabase
    .from('gallery_albums')
    .select('*, photos:gallery_photos(count)')
    .eq('tournament_id', id)
    .order('sort_order').order('created_at')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Link href={`/admin/${id}`} className="text-sm text-muted hover:text-foreground">← Буцах</Link>
        <div className="h-4 w-px bg-border" />
        <h1 className="text-xl font-extrabold">📸 Зургийн цомог</h1>
        <span className="text-sm text-muted">{tournament.name}</span>
      </div>
      <GalleryAdminList tournamentId={id} initialAlbums={albums ?? []} />
    </div>
  )
}
