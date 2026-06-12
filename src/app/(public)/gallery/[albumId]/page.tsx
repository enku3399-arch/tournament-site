import { createServiceClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import AlbumLightbox from './AlbumLightbox'

export const dynamic = 'force-dynamic'

export default async function AlbumPage({ params }: { params: Promise<{ albumId: string }> }) {
  const { albumId } = await params
  const supabase = createServiceClient()

  const [{ data: album }, { data: photos }] = await Promise.all([
    supabase.from('gallery_albums').select('*').eq('id', albumId).single(),
    supabase.from('gallery_photos').select('*').eq('album_id', albumId).order('sort_order').order('created_at'),
  ])

  if (!album) notFound()

  return (
    <div className="wrap-wide py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link
          href="/gallery"
          className="text-sm transition-colors"
          style={{ color: 'var(--fog)' }}
        >
          ← Цомгууд
        </Link>
        <div style={{ width: 1, height: 14, background: 'var(--line)' }} />
        <h1 className="text-2xl font-extrabold" style={{ color: 'var(--paper)' }}>{album.title}</h1>
        {album.description && (
          <span className="text-sm" style={{ color: 'var(--fog)' }}>{album.description}</span>
        )}
        <span className="text-sm ml-auto" style={{ color: 'var(--fog-2)' }}>
          {photos?.length ?? 0} зураг
        </span>
      </div>

      <AlbumLightbox photos={photos ?? []} />
    </div>
  )
}
