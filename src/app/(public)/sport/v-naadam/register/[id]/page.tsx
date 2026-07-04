import { notFound } from 'next/navigation'
import { createServiceClient as createClient } from '@/lib/supabase-server'
import RegisterForm from './RegisterForm'
import { SPORT_ICONS } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function RegisterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createClient()

  const [{ data: tournament }, { data: sports }, { data: teams }] = await Promise.all([
    supabase.from('tournaments').select('*').eq('id', id).single(),
    supabase.from('tournament_sports').select('*').eq('tournament_id', id).order('created_at'),
    supabase.from('teams').select('*').eq('tournament_id', id).order('name'),
  ])

  if (!tournament) notFound()

  const sportList = sports ?? []
  const teamList = teams ?? []

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold mb-1">{tournament.name}</h1>
        <p className="text-muted text-sm">Баг / Тамирчин бүртгэл</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {sportList.map((s: any) => (
            <span key={s.id} className="rounded-full border border-border bg-surface px-3 py-0.5 text-xs">
              {SPORT_ICONS[s.sport_type] ?? '🏅'} {s.name}
            </span>
          ))}
        </div>
      </div>

      {/* Athlete declaration link */}
      <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm font-semibold">📄 Тамирчны мэдүүлэг бөглөх</p>
          <p className="text-xs text-muted mt-0.5">Баг бүрийн тамирчдын дэлгэрэнгүй мэдээлэл — регистер, зэрэг цол, байгууллага</p>
        </div>
        <a href={`/register/${id}/apply`}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors whitespace-nowrap shrink-0">
          Мэдүүлэг бөглөх →
        </a>
      </div>

      <RegisterForm tournamentId={id} sports={sportList as any} />

      {teamList.length > 0 && (
        <div className="mt-10">
          <h3 className="font-bold mb-3 text-muted text-sm">Бүртгэлтэй багууд ({teamList.length})</h3>
          <div className="space-y-2">
            {teamList.map((t: any) => {
              const sport = sportList.find((s: any) => s.id === t.sport_id)
              return (
                <div key={t.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-2.5 text-sm">
                  <span className="font-medium">{t.name}</span>
                  <div className="flex items-center gap-2">
                    {sport && <span className="text-xs text-muted">{SPORT_ICONS[(sport as any).sport_type] ?? '🏅'} {(sport as any).name}</span>}
                    <span className={`text-xs rounded-full px-2 py-0.5 ${t.status === 'confirmed' ? 'bg-live/20 text-live' : 'bg-accent/20 text-accent'}`}>
                      {t.status === 'confirmed' ? '✓' : '⏳'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
