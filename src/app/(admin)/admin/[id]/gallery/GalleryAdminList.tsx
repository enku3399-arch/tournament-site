'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

type Album = {
  id: string
  title: string
  description: string | null
  cover_url: string | null
  sort_order: number
  created_at: string
  photos: { count: number }[]
}

export default function GalleryAdminList({
  tournamentId,
  initialAlbums,
}: {
  tournamentId: string
  initialAlbums: Album[]
}) {
  const [albums, setAlbums] = useState<Album[]>(initialAlbums)
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function createAlbum() {
    if (!title.trim()) return
    setSaving(true)
    const res = await fetch('/api/admin/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tournamentId, title: title.trim(), description: desc.trim() || null }),
    })
    const data = await res.json()
    if (res.ok) {
      setAlbums(prev => [...prev, { ...data, photos: [{ count: 0 }] }])
      setTitle('')
      setDesc('')
      setCreating(false)
    } else {
      alert('Алдаа: ' + data.error)
    }
    setSaving(false)
  }

  async function deleteAlbum(albumId: string) {
    if (!confirm('Энэ цомгийг устгах уу? Дотрах бүх зураг устана.')) return
    setDeleting(albumId)
    const res = await fetch(`/api/admin/gallery/${albumId}`, { method: 'DELETE' })
    if (res.ok) setAlbums(prev => prev.filter(a => a.id !== albumId))
    else alert('Устгаж чадсангүй')
    setDeleting(null)
  }

  return (
    <div className="space-y-4">
      {/* Create album button */}
      {!creating ? (
        <button
          onClick={() => setCreating(true)}
          className="rounded-lg border border-dashed border-primary/50 px-5 py-3 text-sm font-medium text-primary hover:bg-primary/5 transition-colors w-full"
        >
          + Шинэ цомог үүсгэх
        </button>
      ) : (
        <div className="rounded-xl border border-primary/40 bg-surface p-5 space-y-3">
          <h3 className="font-bold text-sm">Шинэ цомог</h3>
          <input
            autoFocus
            className="input w-full"
            placeholder="Цомгийн нэр (жш: Нааадмын нээлт, Сагсан бөмбөг...)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createAlbum()}
          />
          <textarea
            className="input w-full text-sm resize-none"
            rows={2}
            placeholder="Тайлбар (заавал биш)"
            value={desc}
            onChange={e => setDesc(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={createAlbum}
              disabled={!title.trim() || saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50 transition-colors"
            >
              {saving ? 'Хадгалж байна...' : '✓ Үүсгэх'}
            </button>
            <button
              onClick={() => { setCreating(false); setTitle(''); setDesc('') }}
              className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:text-foreground transition-colors"
            >
              Болих
            </button>
          </div>
        </div>
      )}

      {/* Album grid */}
      {albums.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted text-sm">
          <div className="text-4xl mb-3">📷</div>
          Цомог байхгүй байна. Шинэ цомог үүсгэнэ үү.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {albums.map(album => {
            const count = album.photos?.[0]?.count ?? 0
            return (
              <div key={album.id} className="rounded-xl border border-border bg-surface overflow-hidden group">
                {/* Cover */}
                <div className="relative aspect-video bg-surface-2 overflow-hidden">
                  {album.cover_url ? (
                    <Image
                      src={album.cover_url}
                      alt={album.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-4xl text-muted/30">📷</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold truncate">{album.title}</h3>
                      {album.description && (
                        <p className="text-xs text-muted mt-0.5 line-clamp-1">{album.description}</p>
                      )}
                      <p className="text-xs text-muted mt-1">{count} зураг</p>
                    </div>
                    <button
                      onClick={() => deleteAlbum(album.id)}
                      disabled={deleting === album.id}
                      className="shrink-0 rounded p-1.5 text-muted hover:text-danger hover:bg-danger/10 transition-colors text-xs"
                      title="Устгах"
                    >
                      {deleting === album.id ? '...' : '🗑'}
                    </button>
                  </div>
                  <Link
                    href={`/admin/${tournamentId}/gallery/${album.id}`}
                    className="mt-3 flex items-center justify-center gap-1 rounded-lg border border-border py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
                  >
                    📸 Зураг удирдах →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
