import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase-server'
import LiveClient from './LiveClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Шууд дамжуулалт · Монгол 87/89 V Спорт Наадам 2026',
  description: 'Шууд явагдаж байгаа тоглолтуудын оноо болон дуусагдсан тоглолтуудын үр дүн',
}

const SELECT = `
  id, status, team1_score, team2_score, scheduled_at, round, stage, match_number, judge_code,
  team1:teams!team1_id(id, name),
  team2:teams!team2_id(id, name),
  sport:tournament_sports(id, name, sport_type, gender)
`

export default async function LivePage() {
  const supabase = createServiceClient()

  const [{ data: liveMatches }, { data: recentMatches }] = await Promise.all([
    supabase.from('matches').select(SELECT).eq('status', 'live'),
    supabase.from('matches').select(SELECT).eq('status', 'completed')
      .order('scheduled_at', { ascending: false }).limit(20),
  ])

  return (
    <>
      <div className="section" style={{ padding: '48px 0 40px' }}>
        <div className="wrap-wide">
          <span className="eyebrow" style={{ color: 'var(--fog)' }}>Live · Шууд</span>
          <h1 className="section-title" style={{ fontFamily: 'Oswald, sans-serif', fontSize: 48, marginTop: 8 }}>
            Шууд <span className="gold">дамжуулалт</span>
          </h1>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap-wide">
          <LiveClient
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            liveMatches={(liveMatches ?? []) as any[]}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recentMatches={(recentMatches ?? []) as any[]}
          />
          <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid var(--line)', textAlign: 'center' }}>
            <Link href="/" className="section-action" style={{ fontSize: 14 }}>← Нүүр хуудас руу буцах</Link>
          </div>
        </div>
      </section>
    </>
  )
}
