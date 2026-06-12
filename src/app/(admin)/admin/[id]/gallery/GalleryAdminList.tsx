'use client'
import { useState, useRef, useCallback } from 'react'
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

type UploadJob = {
  albumId: string
  folderName: string
  done: number
  total: number
  coverUrl: string | null
}

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? 'gallery'

async function uploadToCloudinary(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', UPLOAD_PRESET)
  fd.append('folder', 'ntv-gallery')
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: fd,
  })
  if (!res.ok) throw new Error('Upload failed')
  const data = await res.json()
  return data.secure_url as string
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
  const [jobs, setJobs] = useState<UploadJob[]>([])

  const folderInputRef = useRef<HTMLInputElement>(null)

  async function createAlbum(albumTitle = title, albumDesc = desc) {
    if (!albumTitle.trim()) return null
    const res = await fetch('/api/admin/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tournamentId, title: albumTitle.trim(), description: albumDesc.trim() || null }),
    })
    const data = await res.json()
    if (!res.ok) { alert('Алдаа: ' + data.error); return null }
    return data
  }

  async function handleManualCreate() {
    if (!title.trim()) return
    setSaving(true)
    const album = await createAlbum()
    if (album) {
      setAlbums(prev => [...prev, { ...album, photos: [{ count: 0 }] }])
      setTitle(''); setDesc(''); setCreating(false)
    }
    setSaving(false)
  }

  const handleFolderSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Group by top-level folder name
    const folderMap = new Map<string, File[]>()
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      const parts = file.webkitRelativePath.split('/')
      const folder = parts[0] || 'Цомог'
      if (!folderMap.has(folder)) folderMap.set(folder, [])
      folderMap.get(folder)!.push(file)
    }

    if (folderMap.size === 0) { alert('Зураг олдсонгүй'); return }

    for (const [folderName, images] of folderMap) {
      const album = await createAlbum(folderName, '')
      if (!album) continue

      setAlbums(prev => [...prev, { ...album, photos: [{ count: 0 }] }])

      const jobId = album.id
      setJobs(prev => [...prev, { albumId: jobId, folderName, done: 0, total: images.length, coverUrl: null }])

      // Upload in batches of 5 concurrently, save to DB every 20
      const BATCH = 5
      const SAVE_EVERY = 20
      const uploaded: { url: string }[] = []
      let done = 0

      for (let i = 0; i < images.length; i += BATCH) {
        const chunk = images.slice(i, i + BATCH)
        const results = await Promise.allSettled(chunk.map(f => uploadToCloudinary(f)))
        for (const r of results) {
          if (r.status === 'fulfilled') uploaded.push({ url: r.value })
          done++
        }
        setJobs(prev => prev.map(j => j.albumId === jobId
          ? { ...j, done, coverUrl: j.coverUrl ?? uploaded[0]?.url ?? null }
          : j))

        // Save to DB in chunks so we don't lose everything if browser closes
        if (uploaded.length >= SAVE_EVERY || i + BATCH >= images.length) {
          const toSave = uploaded.splice(0, uploaded.length)
          if (toSave.length > 0) {
            await fetch(`/api/admin/gallery/${album.id}/photos`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ photos: toSave }),
            })
          }
        }
      }

      // Refresh album count from DB
      const res = await fetch(`/api/admin/gallery/${album.id}/photos`)
      if (res.ok) {
        const photos: { url: string }[] = await res.json()
        setAlbums(prev => prev.map(a => a.id === album.id
          ? { ...a, photos: [{ count: photos.length }], cover_url: photos[0]?.url ?? a.cover_url }
          : a))
      }

      setJobs(prev => prev.filter(j => j.albumId !== jobId))
    }

    if (folderInputRef.current) folderInputRef.current.value = ''
  }, [tournamentId])

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
      {/* Folder import input (hidden) */}
      <input
        ref={folderInputRef}
        type="file"
        // @ts-expect-error webkitdirectory is non-standard
        webkitdirectory=""
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFolderSelect}
      />

      {/* Action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => folderInputRef.current?.click()}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/60 px-5 py-4 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
        >
          <span className="text-xl">📁</span>
          <span>Фолдероос нэг дор оруулах<br /><span className="font-normal text-xs text-muted">Фолдер бүр тусдаа цомог болно</span></span>
        </button>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border px-5 py-4 text-sm font-medium text-muted hover:text-foreground hover:border-border/80 transition-colors"
        >
          <span className="text-xl">➕</span>
          <span>Хоосон цомог үүсгэх<br /><span className="text-xs">гараар нэр өгч, зураг нэмэх</span></span>
        </button>
      </div>

      {/* Upload jobs progress */}
      {jobs.length > 0 && (
        <div className="space-y-2">
          {jobs.map(job => (
            <div key={job.albumId} className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">📁 {job.folderName}</span>
                <span className="text-xs text-muted">{job.done}/{job.total} зураг</span>
              </div>
              <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${(job.done / job.total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manual create form */}
      {creating && (
        <div className="rounded-xl border border-primary/40 bg-surface p-5 space-y-3">
          <h3 className="font-bold text-sm">Шинэ цомог</h3>
          <input
            autoFocus
            className="input w-full"
            placeholder="Цомгийн нэр (жш: Нааадмын нээлт, Сагсан бөмбөг...)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleManualCreate()}
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
              onClick={handleManualCreate}
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
      {albums.length === 0 && jobs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted text-sm">
          <div className="text-4xl mb-3">📷</div>
          Цомог байхгүй байна. Дээрх товчоор нэмнэ үү.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {albums.map(album => {
            const count = album.photos?.[0]?.count ?? 0
            const isUploading = jobs.some(j => j.albumId === album.id)
            return (
              <div key={album.id} className={`rounded-xl border bg-surface overflow-hidden group transition-all ${
                isUploading ? 'border-primary/50 shadow-md shadow-primary/10' : 'border-border'
              }`}>
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
                    <div className="flex items-center justify-center h-full text-4xl text-muted/30">
                      {isUploading ? <span className="animate-pulse text-primary/50">⏳</span> : '📷'}
                    </div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary bg-surface/90 px-2 py-1 rounded">
                        Байршуулж байна...
                      </span>
                    </div>
                  )}
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
                      disabled={deleting === album.id || isUploading}
                      className="shrink-0 rounded p-1.5 text-muted hover:text-danger hover:bg-danger/10 transition-colors text-xs disabled:opacity-30"
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
