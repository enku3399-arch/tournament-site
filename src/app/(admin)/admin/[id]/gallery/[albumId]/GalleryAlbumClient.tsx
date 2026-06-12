'use client'
import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'

type Photo = { id: string; url: string; caption: string | null; sort_order: number }
type Album = { id: string; title: string; cover_url: string | null }

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

export default function GalleryAlbumClient({
  album,
  initialPhotos,
  tournamentId,
}: {
  album: Album
  initialPhotos: Photo[]
  tournamentId: string
}) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [coverUrl, setCoverUrl] = useState(album.cover_url ?? '')
  const inputRef = useRef<HTMLInputElement>(null)

  const notConfigured = !CLOUD_NAME || CLOUD_NAME === 'your_cloud_name'

  async function uploadToCloudinary(file: File): Promise<string> {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', UPLOAD_PRESET ?? 'ntv_gallery')
    fd.append('folder', 'ntv-gallery')
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: fd,
    })
    if (!res.ok) throw new Error('Cloudinary upload failed')
    const data = await res.json()
    return data.secure_url as string
  }

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return
    if (notConfigured) {
      alert('Cloudinary тохируулагдаагүй байна!\n\n.env.local болон Vercel-д NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME болон NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET нэмнэ үү.')
      return
    }
    const fileArr = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (!fileArr.length) return
    setUploading(true)
    setProgress({ done: 0, total: fileArr.length })

    const uploaded: { url: string }[] = []
    for (let i = 0; i < fileArr.length; i++) {
      try {
        const url = await uploadToCloudinary(fileArr[i])
        uploaded.push({ url })
        setProgress({ done: i + 1, total: fileArr.length })
      } catch {
        console.error('Upload failed for', fileArr[i].name)
      }
    }

    if (uploaded.length > 0) {
      const res = await fetch(`/api/admin/gallery/${album.id}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photos: uploaded }),
      })
      const data = await res.json()
      if (res.ok) {
        setPhotos(prev => [...prev, ...data])
        if (!coverUrl && data[0]?.url) setCoverUrl(data[0].url)
      } else {
        alert('Зураг хадгалах алдаа: ' + data.error)
      }
    }

    setUploading(false)
    setProgress(null)
    if (inputRef.current) inputRef.current.value = ''
  }, [album.id, coverUrl, notConfigured])

  async function deletePhoto(photoId: string) {
    if (!confirm('Энэ зургийг устгах уу?')) return
    setDeleting(photoId)
    const res = await fetch(`/api/admin/gallery/${album.id}/photos`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoId }),
    })
    if (res.ok) setPhotos(prev => prev.filter(p => p.id !== photoId))
    else alert('Устгаж чадсангүй')
    setDeleting(null)
  }

  async function setCover(url: string) {
    const res = await fetch(`/api/admin/gallery/${album.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cover_url: url }),
    })
    if (res.ok) setCoverUrl(url)
    else alert('Алдаа гарлаа')
  }

  return (
    <div className="space-y-6">
      {/* Cloudinary warning */}
      {notConfigured && (
        <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-4 text-sm">
          <p className="font-bold text-yellow-400 mb-1">⚠️ Cloudinary тохируулагдаагүй байна</p>
          <p className="text-muted text-xs">
            1. <a href="https://cloudinary.com" target="_blank" className="text-primary underline">cloudinary.com</a> дээр бүртгэл үүсгэнэ<br />
            2. Settings → Upload → Upload presets → Add upload preset → Unsigned → Preset name: <code className="bg-surface-2 px-1 rounded">ntv_gallery</code><br />
            3. .env.local болон Vercel-д <code className="bg-surface-2 px-1 rounded">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> тавина<br />
            4. Dev server дахин эхлүүлнэ
          </p>
        </div>
      )}

      {/* Upload zone */}
      <div
        className={`relative rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
          dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        }`}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
        <div className="py-12 text-center">
          {uploading ? (
            <div className="space-y-3">
              <div className="text-3xl animate-pulse">📤</div>
              <p className="text-sm font-medium">
                Зураг байршуулж байна... {progress?.done}/{progress?.total}
              </p>
              <div className="mx-auto w-48 h-2 bg-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${progress ? (progress.done / progress.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="text-4xl mb-3">📷</div>
              <p className="font-semibold text-foreground">Зургуудаа энд чирж тавь эсвэл дарж сонго</p>
              <p className="text-sm text-muted mt-1">JPG, PNG, WEBP · Олон зураг нэг дор</p>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted">
        <span>{photos.length} зураг</span>
        {coverUrl && (
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-primary" />
            Нүүр зураг тохируулсан
          </span>
        )}
      </div>

      {/* Photo grid */}
      {photos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted text-sm">
          Зураг байхгүй. Дээр дарж байршуулна уу.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {photos.map(photo => (
            <div
              key={photo.id}
              className={`relative aspect-square rounded-lg overflow-hidden group border-2 transition-all ${
                coverUrl === photo.url ? 'border-primary shadow-md shadow-primary/20' : 'border-transparent'
              }`}
            >
              <Image src={photo.url} alt={photo.caption ?? ''} fill className="object-cover" sizes="200px" />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                {coverUrl !== photo.url && (
                  <button
                    onClick={() => setCover(photo.url)}
                    className="rounded bg-white/20 hover:bg-white/30 px-2 py-1 text-white text-xs font-medium transition-colors"
                  >
                    🖼 Нүүр болгох
                  </button>
                )}
                <button
                  onClick={() => deletePhoto(photo.id)}
                  disabled={deleting === photo.id}
                  className="rounded bg-red-500/80 hover:bg-red-500 px-2 py-1 text-white text-xs font-medium transition-colors"
                >
                  {deleting === photo.id ? '...' : '🗑 Устгах'}
                </button>
              </div>

              {/* Cover badge */}
              {coverUrl === photo.url && (
                <div className="absolute top-1 left-1 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  НҮҮР
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Public link */}
      <div className="rounded-lg border border-border bg-surface-2 p-4 text-sm flex items-center gap-3 flex-wrap">
        <span className="text-muted">Нийтийн хуудас:</span>
        <a
          href={`/gallery/${album.id}`}
          target="_blank"
          className="text-primary hover:underline font-mono text-xs"
        >
          /gallery/{album.id.slice(0, 8)}...
        </a>
      </div>
    </div>
  )
}
