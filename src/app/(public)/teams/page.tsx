import { createServiceClient as createClient } from '@/lib/supabase-server'
import { SPORT_ICONS, SPORT_LABELS } from '@/lib/types'
import type { Team, TournamentSport } from '@/lib/types'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Багууд · Монгол 87/89 V Спорт Наадам 2026',
  description: 'V Спорт Наадам 2026-д оролцогч бүх баг, тамирчдын жагсаалт',
}

export default async function TeamsPage() {
  const supabase = createClient()

  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('id, name, status')
    .neq('status', 'draft')
    .order('start_date', { ascending: false })
    .limit(1)

  const tournament = tournaments?.[0] ?? null

  let sports: TournamentSport[] = []
  let teams: Team[] = []

  if (tournament) {
    const [{ data: sportsData }, { data: teamsData }] = await Promise.all([
      supabase
        .from('tournament_sports')
        .select('*')
        .eq('tournament_id', tournament.id)
        .order('weight', { ascending: false }),
      supabase
        .from('teams')
        .select('*')
        .eq('tournament_id', tournament.id)
        .eq('status', 'confirmed')
        .order('name'),
    ])
    sports = sportsData ?? []
    teams = teamsData ?? []
  }

  const confirmed = teams.filter(t => t.status === 'confirmed')
  const sportMap = new Map(sports.map(s => [s.id, s]))

  const bySport = sports.map(sport => ({
    sport,
    teams: confirmed.filter(t => t.sport_id === sport.id),
  }))

  const noSport = confirmed.filter(t => !t.sport_id)

  return (
    <div className="wrap-wide py-10 space-y-10">

      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs text-muted uppercase tracking-widest mb-1 font-semibold">
            {tournament?.name ?? 'V Спорт Наадам 2026'}
          </p>
          <h1 className="text-3xl font-extrabold" style={{ fontFamily: 'Oswald, sans-serif' }}>
            Оролцогч багууд
          </h1>
          <p className="text-muted text-sm mt-1">
            Нийт {confirmed.length} баг · {sports.length} спортын төрөл
          </p>
        </div>
        {tournament && (
          <Link
            href={`/register/${tournament.id}`}
            className="nav-btn primary"
            style={{ alignSelf: 'flex-end' }}
          >
            Бүртгүүлэх →
          </Link>
        )}
      </div>

      {/* ── No tournament ────────────────────────────────────────── */}
      {!tournament && (
        <div className="rounded-xl border border-border bg-surface p-10 text-center text-muted">
          <p className="text-4xl mb-3">🏟️</p>
          <p className="font-semibold">Тэмцээн олдсонгүй</p>
          <p className="text-sm mt-1">Удахгүй нийтлэгдэнэ</p>
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────── */}
      {tournament && confirmed.length === 0 && (
        <div className="rounded-xl border border-border bg-surface p-10 text-center text-muted">
          <p className="text-4xl mb-3">⏳</p>
          <p className="font-semibold">Бүртгэл хүлээгдэж байна</p>
          <p className="text-sm mt-1">Баг бүртгүүлэхэд энд харагдана</p>
          {tournament && (
            <Link href={`/register/${tournament.id}`} className="nav-btn primary mt-4 inline-block">
              Бүртгүүлэх →
            </Link>
          )}
        </div>
      )}

      {/* ── Sports sections ──────────────────────────────────────── */}
      {bySport.map(({ sport, teams: sportTeams }) => (
        <section key={sport.id}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{SPORT_ICONS[sport.sport_type] ?? '🏅'}</span>
            <div>
              <h2 className="text-xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>
                {sport.name}
              </h2>
              <p className="text-xs text-muted">
                {sport.gender === 'male' ? '♂ Эрэгтэй' : sport.gender === 'female' ? '♀ Эмэгтэй' : 'Баг'} ·{' '}
                {sportTeams.length} баг
              </p>
            </div>
            {tournament && (
              <Link
                href={`/t/${tournament.id}/${sport.id}`}
                className="ml-auto text-xs text-accent hover:underline"
              >
                Хаалтын хүснэгт →
              </Link>
            )}
          </div>

          {sportTeams.length === 0 ? (
            <div className="rounded-xl border border-border/50 bg-surface px-5 py-4 text-sm text-muted">
              Энэ спортод баг бүртгүүлээгүй байна
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {sportTeams.map((team, i) => (
                <div
                  key={team.id}
                  className="rounded-xl border border-border bg-surface px-4 py-3 flex items-center gap-3"
                >
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: 'var(--accent)', color: 'white' }}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{team.name}</div>
                    {team.contact_name && (
                      <div className="text-xs text-muted truncate">{team.contact_name}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}

      {/* ── Teams without sport ──────────────────────────────────── */}
      {noSport.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🏅</span>
            <div>
              <h2 className="text-xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>
                Спорт тодорхойгүй
              </h2>
              <p className="text-xs text-muted">{noSport.length} баг</p>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {noSport.map((team, i) => (
              <div
                key={team.id}
                className="rounded-xl border border-border bg-surface px-4 py-3 flex items-center gap-3"
              >
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: 'var(--muted)', color: 'white' }}
                >
                  {i + 1}
                </span>
                <div className="font-semibold text-sm truncate">{team.name}</div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  )
}
