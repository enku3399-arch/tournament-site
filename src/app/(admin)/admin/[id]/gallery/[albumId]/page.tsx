import { createServiceClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import GalleryAlbumClient from './GalleryAlbumClient'

export const dynamic = 'force-dynamic'

export default async function AdminAlbumPage({
  params,
}: {
  params: Promise<{ id: string; albumId: string }>
}) {
  const { id, albumId } = await params
  const supabase = createServiceClient()

  const [{ data: album }, { data: photos }] = await Promise.all([
    supabase.from('gallery_albums').select('*').eq('id', albumId).single(),
    supabase.from('gallery_photos').select('*').eq('album_id', albumId).order('sort_order').order('created_at'),
  ])

  if (!album) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Link href={`/admin/${id}/gallery`} className="text-sm text-muted hover:text-foreground">← Цомгууд</Link>
        <div className="h-4 w-px bg-border" />
        <h1 className="text-xl font-extrabold">📸 {album.title}</h1>
        {album.description && <span className="text-sm text-muted">{album.description}</span>}
      </div>
      <GalleryAlbumClient album={album} initialPhotos={photos ?? []} tournamentId={id} />
    </div>
  )
}
