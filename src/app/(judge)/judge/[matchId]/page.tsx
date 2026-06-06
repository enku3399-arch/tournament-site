import { notFound } from 'next/navigation'
import { createServiceClient as createClient } from '@/lib/supabase-server'
import JudgePanel from './JudgePanel'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function JudgePage({
  params,
  searchParams,
}: {
  params: Promise<{ matchId: string }>
  searchParams: Promise<{ code?: string }>
}) {
  const { matchId } = await params
  const { code } = await searchParams

  const supabase = createClient()
  const { data: match } = await supabase
    .from('matches')
    .select(`*, team1:team1_id(*), team2:team2_id(*), winner:winner_id(*), sport:sport_id(*), tournament:tournament_id(name)`)
    .eq('id', matchId)
    .single()

  if (!match) notFound()

  const codeValid = code === match.judge_code

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-sm">
        <div className="mb-4">
          <Link
            href={code ? `/judge?code=${code}` : '/judge'}
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            ← Тоглолтын жагсаалт руу буцах
          </Link>
        </div>
        {!codeValid ? (
          <div className="rounded-2xl border border-danger/30 bg-danger/10 p-8 text-center">
            <p className="text-3xl mb-4">🔒</p>
            <h2 className="text-lg font-bold text-danger mb-2">Нэвтрэх эрхгүй</h2>
            <p className="text-sm text-muted">Зөв шүүгчийн код оруулна уу</p>
          </div>
        ) : (
          <JudgePanel match={match as any} judgeCode={code ?? ''} />
        )}
      </div>
    </div>
  )
}
