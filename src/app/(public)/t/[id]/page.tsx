import { notFound } from 'next/navigation'
import { createServiceClient as createClient } from '@/lib/supabase-server'
import { SPORT_ICONS, SPORT_LABELS, sportDisplayName } from '@/lib/types'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function TournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createClient()

  const [{ data: tournament }, { data: sports }, { data: matches }] = await Promise.all([
    supabase.from('tournaments').select('*').eq('id', id).single(),
    supabase.from('tournament_sports').select('*').eq('tournament_id', id).order('weight', { ascending: false }),
    supabase.from('matches').select('id,status,sport_id').eq('tournament_id', id),
  ])

  if (!tournament) notFound()

  const sportList = sports ?? []
  const matchList = matches ?? []

  const dateRange = [tournament.start_date, tournament.end_date]
    .filter(Boolean)
    .map((d: string) => new Date(d).toLocaleDateString('mn-MN'))
    .join(' — ')

  const liveCount = matchList.filter(m => m.status === 'live').length
  const doneCount = matchList.filter(m => m.status === 'completed').length

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-3">
            <h1 className="text-3xl font-extrabold">{tournament.name}</h1>
            {tournament.status === 'active' && (
              <span className="animate-pulse rounded-full bg-live/20 px-3 py-1 text-sm font-bold text-live">● LIVE</span>
            )}
          </div>
          {tournament.location && <p className="text-muted text-sm">📍 {tournament.location}</p>}
          {dateRange && <p className="text-muted text-sm">📅 {dateRange}</p>}
          {tournament.organizer_name && <p className="text-muted text-sm">🏢 {tournament.organizer_name}</p>}
        </div>
        <Link href={`/register/${id}`}
          className="rounded-lg border border-primary px-4 py-2 text-sm text-primary hover:bg-primary hover:text-white transition-colors">
          + Бүртгүүлэх
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-surface p-4 text-center">
          <div className="text-2xl font-bold text-accent">{sportList.length}</div>
          <div className="text-xs text-muted mt-1">Спортын төрөл</div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 text-center">
          <div className="text-2xl font-bold text-accent">{matchList.length}</div>
          <div className="text-xs text-muted mt-1">Нийт тоглолт</div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 text-center">
          <div className="text-2xl font-bold text-live">{liveCount > 0 ? liveCount : doneCount}</div>
          <div className="text-xs text-muted mt-1">{liveCount > 0 ? 'Одоо тоглож байна' : 'Дууссан тоглолт'}</div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 text-center">
          <div className="text-2xl font-bold text-accent">16</div>
          <div className="text-xs text-muted mt-1">Оролцогч аймаг</div>
        </div>
      </div>

      {/* Combined standings link */}
      <Link
        href={`/t/${id}/standings`}
        className="flex items-center justify-between rounded-xl border border-accent/40 bg-accent/5 px-5 py-4 hover:bg-accent/10 transition-colors group"
      >
        <div>
          <div className="font-bold text-accent text-lg">🏆 Нэгдсэн дүнгийн хүснэгт</div>
          <div className="text-sm text-muted mt-0.5">Бүх спортын нийлбэр оноогоор аймгуудын эрэмбэ</div>
        </div>
        <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
      </Link>

      {/* Sport cards */}
      <div>
        <h2 className="text-lg font-bold mb-4">Спортын төрлүүд</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sportList.map(sport => {
            const sm = matchList.filter(m => m.sport_id === sport.id)
            const done = sm.filter(m => m.status === 'completed').length
            const live = sm.filter(m => m.status === 'live').length
            const total = sm.length
            const pct = total ? Math.round((done / total) * 100) : 0

            return (
              <Link
                key={sport.id}
                href={`/t/${id}/${sport.id}`}
                className="rounded-xl border border-border bg-surface p-5 hover:border-primary/50 hover:bg-surface-2 transition-colors group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{SPORT_ICONS[sport.sport_type] ?? '🏅'}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-lg group-hover:text-primary transition-colors">
                        {sportDisplayName(sport)}
                      </div>
                      {sport.gender && (
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                          sport.gender === 'male' ? 'bg-blue-500/20 text-blue-400' : 'bg-pink-500/20 text-pink-400'
                        }`}>
                          {sport.gender === 'male' ? '♂' : '♀'}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted">
                      {sport.format === 'groups_knockout'
                        ? `${sport.groups_count} хэсэг · дээд ${sport.advance_per_group} нугалааруу`
                        : 'Шууд хасах'}
                    </div>
                  </div>
                  {live > 0 && (
                    <span className="ml-auto animate-pulse text-xs font-bold text-live">● LIVE</span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-muted mb-1">
                    <span>{done} / {total} тоглолт дууссан</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 text-xs text-primary font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Хэсэг болон нугалаа харах →
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Info */}
      {(tournament.prize_info || tournament.rules || tournament.description) && (
        <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
          {tournament.prize_info && (
            <div>
              <h3 className="font-bold mb-1 text-accent">🏅 Шагнал</h3>
              <p className="text-sm text-muted whitespace-pre-wrap">{tournament.prize_info}</p>
            </div>
          )}
          {tournament.rules && (
            <div>
              <h3 className="font-bold mb-1">📋 Дүрэм</h3>
              <p className="text-sm text-muted whitespace-pre-wrap">{tournament.rules}</p>
            </div>
          )}
          {tournament.description && (
            <div>
              <h3 className="font-bold mb-1">ℹ️ Тэмцээний тухай</h3>
              <p className="text-sm text-muted whitespace-pre-wrap">{tournament.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
