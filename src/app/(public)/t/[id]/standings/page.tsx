import { notFound } from 'next/navigation'
import { createServiceClient as createClient } from '@/lib/supabase-server'
import { SPORT_ICONS } from '@/lib/types'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

// Бага оноогийн систем: байр = оноо (1=1, 2=2, 3=3)
// Зөвхөн медаль авсан (1-3) тоологдоно
const MEDAL_PTS: Record<number, number> = { 1: 1, 2: 2, 3: 3 }

function medalEmoji(p: number) {
  if (p === 1) return '🥇'
  if (p === 2) return '🥈'
  if (p === 3) return '🥉'
  return '—'
}

export default async function StandingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createClient()

  const [{ data: tournament }, { data: sports }, { data: teams }, { data: allMatches }] =
    await Promise.all([
      supabase.from('tournaments').select('*').eq('id', id).single(),
      supabase.from('tournament_sports').select('*').eq('tournament_id', id).order('created_at'),
      supabase.from('teams').select('*').eq('tournament_id', id),
      supabase.from('matches')
        .select('id, stage, round, sport_id, team1_id, team2_id, winner_id, team1_score, team2_score, status')
        .eq('tournament_id', id)
        .eq('status', 'completed'),
    ])

  if (!tournament) notFound()

  const sportList = sports ?? []
  const teamList  = teams  ?? []
  const matchList = allMatches ?? []

  // ── Тус бүр спортод байр тодорхойлох ─────────────────────────────────
  // teamId → sportId → { placement: 1|2|3|null }
  const placements = new Map<string, Map<string, number | null>>()

  for (const sport of sportList) {
    const ko = matchList.filter((m: any) => m.sport_id === sport.id && m.stage === 'knockout')
    const koPlacements = new Map<string, number>()

    if (ko.length > 0) {
      const maxRound = Math.max(...ko.map((m: any) => m.round))
      for (const m of ko as any[]) {
        if (!m.winner_id) continue
        const loserId = m.winner_id === m.team1_id ? m.team2_id : m.team1_id
        if (m.round === maxRound) {
          koPlacements.set(m.winner_id, 1)
          if (loserId) koPlacements.set(loserId, 2)
        } else if (maxRound - m.round === 1) {
          // 3rd place or semi-final losers
          if (loserId && !koPlacements.has(loserId)) koPlacements.set(loserId, 3)
        }
      }
    }

    for (const team of teamList.filter((t: any) => t.sport_id === sport.id)) {
      if (!placements.has(team.id)) placements.set(team.id, new Map())
      placements.get(team.id)!.set(sport.id, koPlacements.get(team.id) ?? null)
    }
  }

  // ── Аймгаар нэгтгэх (нэг аймаг олон спортод) ─────────────────────────
  const orgMap = new Map<string, {
    name: string
    sports: Map<string, { placement: number; pts: number }>
    total: number
    gold: number; silver: number; bronze: number
  }>()

  for (const team of teamList) {
    const key = (team as any).name
    if (!orgMap.has(key)) orgMap.set(key, { name: key, sports: new Map(), total: 0, gold: 0, silver: 0, bronze: 0 })
    const row = orgMap.get(key)!
    const teamPl = placements.get(team.id)
    if (!teamPl || !(team as any).sport_id) continue
    const pl = teamPl.get((team as any).sport_id)
    if (pl && MEDAL_PTS[pl]) {
      const existing = row.sports.get((team as any).sport_id)
      // Хэрэв ижил спортод давхар орсон бол шилдгийг нь ав
      if (!existing || pl < existing.placement) {
        const pts = MEDAL_PTS[pl]
        row.total += pts - (existing?.pts ?? 0)
        if (pl === 1) { row.gold++; if (existing?.placement === 1) row.gold-- }
        if (pl === 2) { row.silver++; if (existing?.placement === 2) row.silver-- }
        if (pl === 3) { row.bronze++; if (existing?.placement === 3) row.bronze-- }
        row.sports.set((team as any).sport_id, { placement: pl, pts })
      }
    }
  }

  // Зөвхөн медаль авсан багуудыг харуулна (rule 7.2)
  // Бага оноо ялна; тэнцвэл алтны тоогоор, тэнцвэл мөнгөний тоогоор, тэнцвэл хүрлийн тоогоор
  const rows = Array.from(orgMap.values())
    .filter(r => r.total > 0)
    .sort((a, b) =>
      a.total - b.total ||
      b.gold - a.gold ||
      b.silver - a.silver ||
      b.bronze - a.bronze ||
      a.name.localeCompare(b.name)
    )

  const podiumRows = rows.length >= 3 ? [rows[1], rows[0], rows[2]] : null

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">

      <div className="flex items-center gap-3 flex-wrap">
        <Link href={`/t/${id}`} className="text-muted hover:text-foreground transition-colors text-sm">← Буцах</Link>
        <div className="h-4 w-px bg-border" />
        <div>
          <h1 className="text-2xl font-extrabold">🏆 Нэгдсэн дүнгийн хүснэгт</h1>
          <p className="text-sm text-muted">{tournament.name}</p>
        </div>
      </div>

      {/* Подиум */}
      {podiumRows && (
        <div className="grid grid-cols-3 gap-3">
          {podiumRows.map((r, i) => {
            const rank = i === 0 ? 2 : i === 1 ? 1 : 3
            const medals = ['🥈', '🥇', '🥉']
            return (
              <div key={r.name} className={`rounded-xl border text-center p-4 ${
                rank === 1 ? 'border-yellow-500/50 bg-yellow-500/10 scale-105' :
                rank === 2 ? 'border-gray-400/40 bg-gray-400/5' :
                'border-orange-400/40 bg-orange-400/5'
              }`}>
                <div className="text-3xl mb-1">{medals[i]}</div>
                <div className="font-bold text-sm">{r.name}</div>
                <div className="text-xl font-extrabold text-accent mt-1">{r.total} оноо</div>
                <div className="text-xs text-muted mt-1">
                  {r.gold > 0 && `🥇×${r.gold} `}{r.silver > 0 && `🥈×${r.silver} `}{r.bronze > 0 && `🥉×${r.bronze}`}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {rows.length === 0 && (
        <div className="rounded-xl border border-accent/20 bg-accent/5 px-5 py-4 text-sm text-center">
          <span className="text-accent font-semibold">⏳ Тоглолтууд эхлэх хүлээгдэж байна</span>
          <p className="mt-1 text-xs text-muted">Нугалааны шатны дүн оруулагдсаны дараа хүснэгт харагдана</p>
        </div>
      )}

      {/* Хүснэгт */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted border-b border-border bg-surface-2">
                <th className="text-left px-4 py-3 w-10">#</th>
                <th className="text-left px-4 py-3">Аймаг / Дүүрэг</th>
                {sportList.map(s => (
                  <th key={s.id} className="text-center px-3 py-3">
                    <div className="flex flex-col items-center gap-0.5">
                      <span>{SPORT_ICONS[(s as any).sport_type] ?? '🏅'}</span>
                      <span className="text-[10px] whitespace-nowrap">{s.name}</span>
                    </div>
                  </th>
                ))}
                <th className="text-center px-4 py-3 font-bold text-foreground">Нийт</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.name} className={`border-t border-border/30 ${
                  i === 0 ? 'bg-yellow-500/5' : i === 1 ? 'bg-gray-400/5' : i === 2 ? 'bg-orange-400/5' : 'hover:bg-surface-2/40'
                }`}>
                  <td className="px-4 py-3 font-bold text-muted">{i + 1}</td>
                  <td className="px-4 py-3 font-semibold">
                    {i < 3 && <span className="mr-1">{['🥇','🥈','🥉'][i]}</span>}
                    {row.name}
                  </td>
                  {sportList.map(s => {
                    const sd = row.sports.get(s.id)
                    return (
                      <td key={s.id} className="text-center px-3 py-3">
                        {sd ? (
                          <div className="flex flex-col items-center">
                            <span className="text-lg">{medalEmoji(sd.placement)}</span>
                            <span className="text-xs text-muted">{sd.pts}оноо</span>
                          </div>
                        ) : (
                          <span className="text-muted/30">—</span>
                        )}
                      </td>
                    )
                  })}
                  <td className="text-center px-4 py-3 font-extrabold text-lg text-accent">{row.total}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={sportList.length + 3} className="text-center text-muted py-12">
                    Медаль авсан багуудын дүн харагдана
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Тайлбар */}
      <div className="rounded-xl border border-border bg-surface p-4 text-xs text-muted space-y-1">
        <p className="font-semibold text-foreground/70">Оноо тооцох дүрэм (бага оноогийн систем):</p>
        <p>🥇 1-р байр = <b className="text-foreground">1 оноо</b> · 🥈 2-р байр = <b className="text-foreground">2 оноо</b> · 🥉 3-р байр = <b className="text-foreground">3 оноо</b></p>
        <p>Нийт оноо хамгийн <b className="text-foreground">бага</b> байгаа баг нэгдсэн дүнд тэргүүлнэ. Тэнцвэл медалийн чанараар шийдэгдэнэ.</p>
        <p>Зөвхөн медаль (1-3-р байр) авсан багууд нийт оноонд тооцогдоно.</p>
      </div>
    </div>
  )
}
