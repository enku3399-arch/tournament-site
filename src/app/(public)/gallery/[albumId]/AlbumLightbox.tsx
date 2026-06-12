'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

type Photo = { id: string; url: string; caption: string | null }

export default function AlbumLightbox({ photos }: { photos: Photo[] }) {
  const [active, setActive] = useState<number | null>(null)

  const close = useCallback(() => setActive(null), [])
  const prev = useCallback(() => setActive(i => (i === null ? null : (i - 1 + photos.length) % photos.length)), [photos.length])
  const next = useCallback(() => setActive(i => (i === null ? null : (i + 1) % photos.length)), [photos.length])

  useEffect(() => {
    if (active === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [active, close, prev, next])

  if (photos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed py-24 text-center" style={{ borderColor: 'var(--line)', color: 'var(--fog)' }}>
        <div className="text-5xl mb-4">📷</div>
        <p>Зураг байхгүй байна</p>
      </div>
    )
  }

  return (
    <>
      {/* Photo grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {photos.map((photo, idx) => (
          <button
            key={photo.id}
            onClick={() => setActive(idx)}
            className="relative aspect-square rounded-xl overflow-hidden group focus:outline-none focus:ring-2 focus:ring-yellow-400"
            style={{ background: 'var(--ink-2)' }}
          >
            <Image
              src={photo.url}
              alt={photo.caption ?? `Зураг ${idx + 1}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              style={{ background: 'rgba(11,20,38,.5)' }}
            >
              <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}>
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
            </div>
            {photo.caption && (
              <div
                className="absolute bottom-0 left-0 right-0 p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,.8), transparent)', color: 'white' }}
              >
                {photo.caption}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {active !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,.95)' }}
          onClick={close}
        >
          {/* Close */}
          <button
            onClick={close}
            className="absolute top-4 right-4 z-10 rounded-full p-2 transition-colors"
            style={{ background: 'rgba(255,255,255,.1)', color: 'white' }}
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>

          {/* Counter */}
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 text-sm font-medium px-3 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.7)' }}
          >
            {active + 1} / {photos.length}
          </div>

          {/* Prev */}
          {photos.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); prev() }}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full p-3 transition-colors hover:scale-110"
              style={{ background: 'rgba(255,255,255,.1)', color: 'white' }}
            >
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-w-5xl max-h-[80vh] w-full h-full mx-16"
            onClick={e => e.stopPropagation()}
          >
            <Image
              src={photos[active].url}
              alt={photos[active].caption ?? `Зураг ${active + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {/* Next */}
          {photos.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); next() }}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-3 transition-colors hover:scale-110"
              style={{ background: 'rgba(255,255,255,.1)', color: 'white' }}
            >
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}

          {/* Caption */}
          {photos[active].caption && (
            <div
              className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm px-4 py-2 rounded-lg text-center max-w-lg"
              style={{ background: 'rgba(0,0,0,.6)', color: 'rgba(255,255,255,.85)', backdropFilter: 'blur(4px)' }}
            >
              {photos[active].caption}
            </div>
          )}
        </div>
      )}
    </>
  )
}
