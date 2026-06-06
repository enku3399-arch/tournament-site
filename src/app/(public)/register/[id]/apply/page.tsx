import { notFound } from 'next/navigation'
import { createServiceClient as createClient } from '@/lib/supabase-server'
import AthleteForm from './AthleteForm'

export const dynamic = 'force-dynamic'

export default async function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createClient()

  const [{ data: tournament }, { data: sports }, { data: teams }] = await Promise.all([
    supabase.from('tournaments').select('*').eq('id', id).single(),
    supabase.from('tournament_sports').select('*').eq('tournament_id', id).order('created_at'),
    supabase.from('teams').select('name').eq('tournament_id', id),
  ])

  if (!tournament) notFound()

  const uniqueTeamNames = [...new Set((teams ?? []).map(t => t.name as string))].sort()

  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-4 py-8">
      <AthleteForm
        tournamentId={id}
        tournamentName={tournament.name}
        sports={(sports ?? []) as any}
        existingTeams={uniqueTeamNames}
      />
    </div>
  )
}
