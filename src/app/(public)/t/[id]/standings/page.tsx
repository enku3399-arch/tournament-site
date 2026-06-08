import { notFound } from 'next/navigation'
import { createServiceClient as createClient } from '@/lib/supabase-server'
import StandingsClient from './StandingsClient'

export const dynamic = 'force-dynamic'

export default async function StandingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createClient()

  const { data: tournament } = await supabase
    .from('tournaments')
    .select('id, name')
    .eq('id', id)
    .single()

  if (!tournament) notFound()

  return <StandingsClient id={id} tournamentName={tournament.name} />
}
