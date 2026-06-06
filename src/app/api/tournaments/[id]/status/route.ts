import { createServiceClient } from '@/lib/supabase-server'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest, ctx: RouteContext<'/api/tournaments/[id]/status'>) {
  const { id } = await ctx.params
  try {
    const body = await req.formData().catch(() => null)
    const json = body ? null : await req.json().catch(() => null)
    const status = body?.get('status') ?? json?.status

    if (!['draft', 'active', 'completed'].includes(status as string)) {
      return Response.json({ error: 'Invalid status' }, { status: 400 })
    }

    const supabase = await createServiceClient()
    const { data, error } = await supabase
      .from('tournaments')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })

    // Redirect back to admin page for form submissions
    if (body) {
      return Response.redirect(new URL(`/admin/${id}`, req.url))
    }
    return Response.json(data)
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
