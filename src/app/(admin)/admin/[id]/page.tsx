import { notFound } from 'next/navigation'
import { createServiceClient as createClient } from '@/lib/supabase-server'
import type { TournamentSport, Team } from '@/lib/types'
import { SPORT_ICONS, sportDisplayName } from '@/lib/types'
import { SportCard } from './SportCard'
import { AddSportButton } from './SportSettingsPanel'
import { PendingRegistrations } from './PendingRegistrations'
import Link from 'next/link'
import { getSiteSettings } from '@/lib/site-settings'

export const dynamic = 'force-dynamic'

export default async function AdminTournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createClient()

  const [{ data: tournament }, { data: sports }, { data: teams }, siteSettings] = await Promise.all([
    supabase.from('tournaments').select('*').eq('id', id).single(),
    supabase.from('tournament_sports').select('*').eq('tournament_id', id).order('created_at'),
    supabase.from('teams').select('*').eq('tournament_id', id).order('name'),
    getSiteSettings(),
  ])
  const scheduleSports = siteSettings.schedule_sports

  if (!tournament) notFound()

  const sportList: TournamentSport[] = sports ?? []
  const teamList: Team[] = teams ?? []

  // Separate confirmed vs pending
  const confirmedTeams = teamList.filter(t => t.status === 'confirmed')
  const pendingTeams = teamList.filter(t => t.status !== 'confirmed')

  // Cross-reference: confirmed teams only
  const teamSportMap = new Map<string, Map<string, Team>>()
  for (const team of confirmedTeams) {
    if (!teamSportMap.has(team.name)) teamSportMap.set(team.name, new Map())
    if (team.sport_id) teamSportMap.get(team.name)!.set(team.sport_id, team)
  }
  const uniqueTeamNames = [...teamSportMap.keys()].sort((a, b) => a.localeCompare(b))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">{tournament.name}</h1>
          <p className="text-sm text-muted mt-1">
            Нийтийн хуудас:{' '}
            <Link href={`/t/${id}`} className="text-primary hover:underline" target="_blank">
              /t/{id.slice(0, 8)}...
            </Link>
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <StatusToggle tournamentId={id} status={tournament.status} />
          <Link href={`/admin/${id}/guide`} className="rounded-lg border border-accent/50 px-4 py-2 text-sm text-accent hover:bg-accent/10 transition-colors">
            📄 Удирдамж хэвлэх
          </Link>
        </div>
      </div>

      {/* Tournament sub-nav */}
      <div className="flex gap-1 border-b border-border -mx-3 sm:-mx-4 px-3 sm:px-4">
        <Link href={`/admin/${id}`}
          className="px-4 py-2 text-sm font-medium border-b-2 border-primary text-foreground">
          ⊞ Тохиргоо
        </Link>
        <Link href={`/admin/${id}/athletes`}
          className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-muted hover:text-foreground transition-colors">
          👤 Тамирчид
        </Link>
        <Link href={`/admin/${id}/guide`}
          className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-muted hover:text-foreground transition-colors">
          📄 Удирдамж
        </Link>
        <Link href={`/admin/${id}/gallery`}
          className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-muted hover:text-foreground transition-colors">
          📸 Цомог
        </Link>
      </div>

      {/* Admin code */}
      <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 text-sm">
        <span className="font-bold text-accent">Admin код: </span>
        <span className="font-mono text-foreground">{tournament.admin_code}</span>
        <span className="ml-4 text-muted">— Энэ кодыг нууцлаарай</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat label="Спорт" value={sportList.length} icon="🏅" />
        <Stat label="Баталгаажсан баг" value={uniqueTeamNames.length} icon="✅" />
        <Stat label="Нийт бүртгэл" value={confirmedTeams.length} icon="📋" />
        <Stat label="Хүсэлтүүд" value={pendingTeams.length} icon="⏳" accent={pendingTeams.length > 0} />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href={`/admin/${id}/gallery`}
          className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 hover:bg-surface-2 hover:border-primary/30 transition-all group"
        >
          <span className="text-2xl">📸</span>
          <div>
            <div className="font-semibold text-sm group-hover:text-primary transition-colors">Зургийн цомог</div>
            <div className="text-xs text-muted">Зураг байршуулах, цомог удирдах</div>
          </div>
          <span className="ml-auto text-muted text-sm">→</span>
        </Link>
      </div>

      {/* Sports - collapsible cards */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">Спортын төрлүүд</h2>
        {sportList.map(sport => {
          const sportTeamCount = teamList.filter(t => t.sport_id === sport.id).length
          return (
            <SportCard
              key={sport.id}
              tournamentId={id}
              sport={sport}
              teamCount={sportTeamCount}
              scheduleVisible={scheduleSports.includes(sport.id)}
            />
          )
        })}
        <AddSportButton
          tournamentId={id}
          existingSportKeys={sportList.map(s => s.gender ? `${s.sport_type}_${s.gender}` : s.sport_type)}
        />
      </div>

      {/* Pending registrations — shown separately */}
      {pendingTeams.length > 0 && (
        <PendingRegistrations
          initialTeams={pendingTeams}
          sports={sportList}
          tournamentId={id}
        />
      )}

      {/* Teams cross-reference table — confirmed only */}
      <section className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-2 gap-3 flex-wrap">
          <h2 className="font-bold">✅ Баталгаажсан багууд{uniqueTeamNames.length > 0 && ` (${uniqueTeamNames.length})`}</h2>
          <div className="flex gap-2 flex-wrap">
            <Link
              href={`/register/${id}`}
              target="_blank"
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-colors"
            >
              📋 Энгийн бүртгэл →
            </Link>
            <Link
              href={`/register/${id}/apply`}
              target="_blank"
              className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
            >
              📄 Тамирчны мэдүүлэг →
            </Link>
          </div>
        </div>

        {uniqueTeamNames.length === 0 ? (
          <div className="p-10 text-center text-muted text-sm">
            <p className="mb-2">Бүртгэлтэй баг байхгүй байна.</p>
            <Link href={`/register/${id}`} target="_blank" className="text-primary hover:underline text-sm">
              Бүртгэлийн холбоосыг хуваалцаарай →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold text-muted text-xs sticky left-0 bg-surface min-w-40">
                    Багийн нэр
                  </th>
                  {sportList.map(s => (
                    <th key={s.id} className="px-3 py-3 text-center font-medium text-xs text-muted whitespace-nowrap min-w-24">
                      <span className="block text-base leading-none mb-0.5">{SPORT_ICONS[s.sport_type] ?? '🏅'}</span>
                      <span>{sportDisplayName(s)}</span>
                      {s.gender && (
                        <span className={`block text-[10px] ${s.gender === 'male' ? 'text-blue-400' : 'text-pink-400'}`}>
                          {s.gender === 'male' ? '♂' : '♀'}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {uniqueTeamNames.map(name => {
                  const sportMap = teamSportMap.get(name)!
                  return (
                    <tr key={name} className="hover:bg-surface-2 transition-colors">
                      <td className="px-4 py-2.5 font-medium sticky left-0 bg-surface">{name}</td>
                      {sportList.map(s => {
                        const rec = sportMap.get(s.id)
                        return (
                          <td key={s.id} className="px-3 py-2.5 text-center">
                            {rec ? (
                              <span className="text-sm font-bold text-live">✓</span>
                            ) : (
                              <span className="text-border text-xs">—</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Legend */}
        {uniqueTeamNames.length > 0 && (
          <div className="px-4 py-2.5 border-t border-border flex items-center gap-4 text-xs text-muted">
            <span><span className="text-live font-bold">✓</span> Бүртгэлтэй</span>
            <span><span className="text-border">—</span> Бүртгэлгүй</span>
          </div>
        )}
      </section>
    </div>
  )
}

function Stat({ label, value, icon, accent }: { label: string; value: number; icon: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 text-center ${accent ? 'border-accent/40 bg-accent/5' : 'border-border bg-surface'}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`text-2xl font-bold ${accent ? 'text-accent' : ''}`}>{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  )
}

function StatusToggle({ tournamentId, status }: { tournamentId: string; status: string }) {
  const next = status === 'draft' ? 'active' : status === 'active' ? 'completed' : 'active'
  const label = status === 'draft' ? '▶ Идэвхжүүлэх' : status === 'active' ? '⏹ Дуусгах' : '▶ Дахин нээх'
  return (
    <form action={`/api/tournaments/${tournamentId}/status`} method="POST">
      <input type="hidden" name="status" value={next} />
      <button type="submit" className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
        status === 'active' ? 'bg-danger/20 text-danger hover:bg-danger/30' : 'bg-live/20 text-live hover:bg-live/30'
      }`}>
        {label}
      </button>
    </form>
  )
}
