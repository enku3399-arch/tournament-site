import sharp from 'sharp'
import { createServiceClient } from '@/lib/supabase-server'

/** Гадаад URL-аас зураг татаж Supabase news bucket-д хадгална */
export async function importImageFromUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!res.ok) return null

    const buf = Buffer.from(await res.arrayBuffer())
    const webpBuf = await sharp(buf)
      .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer()

    const name = `fb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.webp`
    const supabase = createServiceClient()
    await supabase.storage.createBucket('news', { public: true })

    const { error } = await supabase.storage
      .from('news')
      .upload(name, webpBuf, { contentType: 'image/webp', upsert: true })

    if (error) return null
    const { data } = supabase.storage.from('news').getPublicUrl(name)
    return data.publicUrl
  } catch {
    return null
  }
}

export async function importImagesFromUrls(urls: string[]): Promise<string[]> {
  const out: string[] = []
  for (const url of urls) {
    const saved = await importImageFromUrl(url)
    if (saved) out.push(saved)
    else if (url.startsWith('http')) out.push(url) // fallback: keep original URL
  }
  return out
}
