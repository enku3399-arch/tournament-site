import { createServiceClient } from '@/lib/supabase-server'
import DartsAdminClient from './DartsAdminClient'

export default async function DartsAdminPage({
  params,
}: {
  params: Promise<{ id: string; sportId: string }>
}) {
  const { id: tournamentId, sportId } = await params
  const sb = createServiceClient()

  const { data } = await sb
    .from('darts_results')
    .select('data')
    .eq('sport_id', sportId)
    .single()

  return (
    <DartsAdminClient
      tournamentId={tournamentId}
      sportId={sportId}
      initialData={data?.data ?? null}
    />
  )
}
