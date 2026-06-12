import { createServiceClient } from '@/lib/supabase-server'
import { TOURNAMENT_ID } from '@/lib/medal-calc'
import Link from 'next/link'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default async function GalleryPage() {
  const supabase = createServiceClient()

  const { data: albums } = await supabase
    .from('gallery_albums')
    .select('*, photos:gallery_photos(count)')
    .eq('tournament_id', TOURNAMENT_ID)
    .order('sort_order').order('created_at')

  const list = albums ?? []

  return (
    <div className="wrap-wide py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--gold)' }}>
          📸 Зургийн цомог
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--fog)' }}>
          Наадмын дурсгалын зурагнууд
        </p>
      </div>

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed py-24 text-center" style={{ borderColor: 'var(--line)', color: 'var(--fog)' }}>
          <div className="text-5xl mb-4">📷</div>
          <p className="text-lg font-medium">Цомог байхгүй байна</p>
          <p className="text-sm mt-1">Удахгүй нэмэгдэнэ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map(album => {
            const count = album.photos?.[0]?.count ?? 0
            return (
              <Link
                key={album.id}
                href={`/gallery/${album.id}`}
                className="group block rounded-2xl overflow-hidden"
                style={{ border: '1px solid var(--line)', background: 'var(--ink-2)' }}
              >
                {/* Cover */}
                <div className="relative aspect-video overflow-hidden" style={{ background: 'var(--ink)' }}>
                  {album.cover_url ? (
                    <Image
                      src={album.cover_url}
                      alt={album.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-5xl opacity-20">📷</div>
                  )}
                  {/* overlay */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'linear-gradient(to top, rgba(11,20,38,.7), transparent)' }}
                  />
                  {/* count badge */}
                  <div
                    className="absolute bottom-2 right-2 rounded-full px-2.5 py-0.5 text-xs font-bold"
                    style={{ background: 'rgba(11,20,38,.7)', color: 'var(--fog)', backdropFilter: 'blur(4px)' }}
                  >
                    {count} зураг
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h2
                    className="font-bold text-base leading-tight group-hover:text-yellow-400 transition-colors"
                    style={{ color: 'var(--paper)' }}
                  >
                    {album.title}
                  </h2>
                  {album.description && (
                    <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--fog)' }}>
                      {album.description}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
