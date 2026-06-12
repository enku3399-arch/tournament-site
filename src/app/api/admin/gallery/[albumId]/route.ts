import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, { params }: { params: Promise<{ albumId: string }> }) {
  const { albumId } = await params
  const body = await req.json()
  const allowed = ['title', 'description', 'cover_url', 'sort_order']
  const update: Record<string, unknown> = {}
  for (const k of allowed) if (k in body) update[k] = body[k]

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('gallery_albums')
    .update(update)
    .eq('id', albumId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ albumId: string }> }) {
  const { albumId } = await params
  const supabase = createServiceClient()
  const { error } = await supabase.from('gallery_albums').delete().eq('id', albumId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
