import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ albumId: string }> }) {
  const { albumId } = await params
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('gallery_photos')
    .select('*')
    .eq('album_id', albumId)
    .order('sort_order')
    .order('created_at')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request, { params }: { params: Promise<{ albumId: string }> }) {
  const { albumId } = await params
  const { photos } = await req.json() // [{ url, caption? }]
  if (!photos?.length) return NextResponse.json({ error: 'photos array required' }, { status: 400 })

  const supabase = createServiceClient()

  const rows = photos.map((p: { url: string; caption?: string }, i: number) => ({
    album_id: albumId,
    url: p.url,
    caption: p.caption ?? null,
    sort_order: i,
  }))

  const { data, error } = await supabase.from('gallery_photos').insert(rows).select()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // If album has no cover yet, set first photo as cover
  const { data: album } = await supabase
    .from('gallery_albums').select('cover_url').eq('id', albumId).single()
  if (!album?.cover_url && data?.[0]?.url) {
    await supabase.from('gallery_albums').update({ cover_url: data[0].url }).eq('id', albumId)
  }

  return NextResponse.json(data)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ albumId: string }> }) {
  const { albumId } = await params
  const { photoId } = await req.json()
  if (!photoId) return NextResponse.json({ error: 'photoId required' }, { status: 400 })

  const supabase = createServiceClient()
  const { error } = await supabase.from('gallery_photos').delete().eq('id', photoId).eq('album_id', albumId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
