import { NextResponse, NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

const AIMAGS = [
  'Архангай', 'Баян-Өлгий', 'Баянхонгор', 'Булган', 'Говь-Алтай',
  'Говьсүмбэр', 'Дархан-Уул', 'Дорноговь', 'Дорнод', 'Дундговь',
  'Завхан', 'Орхон', 'Өвөрхангай', 'Өмнөговь', 'Сүхбаатар',
  'Сэлэнгэ', 'Төв', 'Увс', 'Ховд', 'Хөвсгөл', 'Хэнтий',
]

export async function POST(req: NextRequest, { params }: { params: Promise<{ sportId: string }> }) {
  const { sportId } = await params
  const { tournamentId } = await req.json()
  if (!tournamentId) return NextResponse.json({ error: 'tournamentId хэрэгтэй' }, { status: 400 })

  const supabase = createServiceClient()

  // Аль хэдийн бүртгэлтэй багуудыг авч давталт гаргахгүй байх
  const { data: existing } = await supabase
    .from('teams').select('name').eq('sport_id', sportId)
  const existingNames = new Set((existing ?? []).map((t: any) => t.name))

  const toInsert = AIMAGS
    .filter(name => !existingNames.has(name))
    .map((name, i) => ({
      name,
      sport_id: sportId,
      tournament_id: tournamentId,
      seed: (existing?.length ?? 0) + i + 1,
      status: 'confirmed' as const,
    }))

  if (toInsert.length === 0) {
    return NextResponse.json({ added: 0, message: '21 аймаг аль хэдийн бүртгэлтэй байна' })
  }

  const { error } = await supabase.from('teams').insert(toInsert)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ added: toInsert.length })
}
