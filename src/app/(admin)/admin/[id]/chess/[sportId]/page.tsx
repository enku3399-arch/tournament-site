import { createServiceClient } from '@/lib/supabase-server'
import ChessAdminClient from './ChessAdminClient'

export default async function ChessAdminPage({
  params,
}: {
  params: Promise<{ id: string; sportId: string }>
}) {
  const { id: tournamentId, sportId } = await params
  const sb = createServiceClient()

  const { data } = await sb
    .from('chess_standings')
    .select('gender, rank, name, club, pts')
    .eq('sport_id', sportId)
    .order('gender').order('rank')

  const rows = data ?? []
  const initialWomen = rows.filter((r: any) => r.gender === 'women').map(({ gender: _g, ...r }: any) => r)
  const initialMen   = rows.filter((r: any) => r.gender === 'men').map(({ gender: _g, ...r }: any) => r)

  return (
    <ChessAdminClient
      tournamentId={tournamentId}
      sportId={sportId}
      initialWomen={initialWomen}
      initialMen={initialMen}
    />
  )
}
