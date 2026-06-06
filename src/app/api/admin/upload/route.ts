import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { createServiceClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buf = Buffer.from(bytes)

    const webpBuf = await sharp(buf)
      .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer()

    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.webp`

    const supabase = createServiceClient()

    // Create bucket if it doesn't exist yet
    await supabase.storage.createBucket('news', { public: true })

    const { error: uploadError } = await supabase.storage
      .from('news')
      .upload(name, webpBuf, { contentType: 'image/webp', upsert: true })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data } = supabase.storage.from('news').getPublicUrl(name)

    return NextResponse.json({ url: data.publicUrl })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
