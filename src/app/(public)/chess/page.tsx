import { createServiceClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Шатрын тэмцээн · ГҮТББ 2026',
}

const TOURNAMENT_ID = '0b05625d-2f6d-48de-b69c-d5a23c2f0e3f'

type Player = { rank: number; name: string; club: string; pts: number }

function fmt(n: number): string {
  return n % 1 === 0.5 ? `${Math.floor(n)}½` : String(n)
}

// Fallback hardcoded data (used if DB has no data yet)
const FALLBACK_WOMEN: Player[] = [
  { rank: 1,  name: 'Цогэрэл У',      club: 'Өмнөговь аймаг',    pts: 7   },
  { rank: 2,  name: 'Найгаль А',       club: 'Дундговь аймаг',    pts: 6   },
  { rank: 3,  name: 'Жаргал Л',        club: 'Сүхбаатар район',   pts: 5   },
  { rank: 4,  name: 'Оюунцэцэг Л',     club: 'Завхан аймаг',      pts: 5   },
  { rank: 5,  name: 'Хандмаа Л',       club: 'Сүхбаатар аймаг',  pts: 4   },
  { rank: 6,  name: 'Амарбаяр Д',      club: 'Баянхонгор аймаг', pts: 4   },
  { rank: 6,  name: 'Бямбасүрэн А',    club: 'Дорноговь аймаг',  pts: 4   },
  { rank: 8,  name: 'Эрдэнэцэцэг Ш',   club: 'Хөвсгөл аймаг',   pts: 4   },
  { rank: 9,  name: 'Энхзэ Л',         club: 'Булган аймаг',      pts: 4   },
  { rank: 10, name: 'Баясгалан О',      club: 'Увс аймаг',         pts: 4   },
  { rank: 11, name: 'Алимаа Ц',        club: 'Говь-Алтай аймаг', pts: 4   },
  { rank: 12, name: 'Тунгалаг Д',      club: 'Ажилчны район',     pts: 3.5 },
  { rank: 13, name: 'Оюунчимэг Ө',     club: 'Өвэрхангай аймаг', pts: 3.5 },
  { rank: 14, name: 'Оюунцэцэг П',     club: 'Дархан-Уул аймаг', pts: 3   },
  { rank: 15, name: 'Энхцэцэг Б',      club: 'Архангай аймаг',   pts: 3   },
  { rank: 16, name: 'Алтанзул Т',      club: 'Хэнтий аймаг',     pts: 3   },
  { rank: 17, name: 'Оюун Б',          club: 'Төв аймаг',         pts: 2   },
  { rank: 17, name: 'Сарангэрэл Д',    club: 'Багануур дүүрэг',  pts: 2   },
  { rank: 19, name: 'Болдтуяа',        club: 'Ховд аймаг',        pts: 2   },
  { rank: 20, name: 'Булган З',        club: 'Сэлэнгэ аймаг',    pts: 1   },
  { rank: 21, name: 'Багай Х',         club: 'Баян-Өлгий аймаг', pts: 0   },
  { rank: 21, name: 'Гэрэлмаа Ж',     club: 'Орхон аймаг',      pts: 0   },
  { rank: 21, name: 'Уугантуу Г',      club: 'Найрамдлын район', pts: 0   },
  { rank: 21, name: 'Энхзул Ц',        club: 'Дорнод аймаг',     pts: 0   },
]

const FALLBACK_MEN: Player[] = [
  { rank: 1,  name: 'Оттонлүрзэв Г',  club: 'Төв аймаг',         pts: 6.5 },
  { rank: 2,  name: 'Батзориг О',      club: 'Дорноговь аймаг',  pts: 5.5 },
  { rank: 3,  name: 'Насанжаргал Б',   club: 'Сүхбаатар район',  pts: 5   },
  { rank: 4,  name: 'Галцог Н',        club: 'Завхан аймаг',      pts: 5   },
  { rank: 5,  name: 'Уурцайх',         club: 'Булган аймаг',      pts: 5   },
  { rank: 6,  name: 'Эрдэнэбилэг Ц',  club: 'Дархан-Уул аймаг', pts: 5   },
  { rank: 7,  name: 'Борхуу Б',        club: 'Хэнтий аймаг',     pts: 4   },
  { rank: 8,  name: 'Отгонбаяр А',     club: 'Өмнөговь аймаг',   pts: 4   },
  { rank: 9,  name: 'Алмасбек Х',      club: 'Баян-Өлгий аймаг', pts: 4   },
  { rank: 10, name: 'Төмэрбаатар Г',   club: 'Говь-Алтай аймаг', pts: 4   },
  { rank: 11, name: 'Энхтайван Г',     club: 'Өвэрхангай аймаг', pts: 4   },
  { rank: 12, name: 'Баярмагнай Ш',    club: 'Сүхбаатар аймаг',  pts: 3.5 },
  { rank: 13, name: 'Галбадрах Д',     club: 'Архангай аймаг',   pts: 3.5 },
  { rank: 14, name: 'Баярхуу Б',       club: 'Дорнод аймаг',     pts: 3   },
  { rank: 15, name: 'Батболд С',       club: 'Баянхонгор аймаг', pts: 3   },
  { rank: 16, name: 'Пурэвдорж С',     club: 'Хөвсгөл аймаг',   pts: 3   },
  { rank: 17, name: 'Энх-Оргил А',     club: 'Сэлэнгэ аймаг',   pts: 3   },
  { rank: 18, name: 'Эрдэнэ Ш',        club: 'Орхон аймаг',      pts: 3   },
  { rank: 19, name: 'Төмэрболд Б',     club: 'Ховд аймаг',        pts: 3   },
  { rank: 20, name: 'Батбаяр Х',       club: 'Ажилчны район',    pts: 2   },
  { rank: 21, name: 'Үйтүмэн Р',       club: 'Баянгол дүүрэг',  pts: 2   },
  { rank: 22, name: 'Даваадорж Б',     club: 'Дундговь аймаг',   pts: 2   },
  { rank: 23, name: 'Мэнх-Эрдэнэ Г',  club: 'Увс аймаг',         pts: 1   },
  { rank: 24, name: 'Чулуундорж С',    club: 'Найрамдлын район',  pts: 0   },
]

const MEDALS = ['🥇', '🥈', '🥉']
const MEDAL_BG: Record<number, string> = {
  1: 'rgba(200,162,74,.09)',
  2: 'rgba(192,192,192,.07)',
  3: 'rgba(205,127,50,.07)',
}
const MEDAL_COLOR: Record<number, string> = {
  1: '#c8a24a', 2: '#a0a8b8', 3: '#b87333',
}

function RankTable({ players }: { players: Player[] }) {
  return (
    <div style={{ borderRadius: 12, border: '1px solid var(--line)', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: 'var(--ink)' }}>
            <th style={{ width: 48, padding: '9px 10px', textAlign: 'center', color: 'var(--fog)', fontWeight: 600, fontSize: 10, letterSpacing: '.08em' }}>#</th>
            <th style={{ padding: '9px 12px', textAlign: 'left', color: 'var(--fog)', fontWeight: 600, fontSize: 10, letterSpacing: '.08em' }}>ТОГЛОГЧ</th>
            <th style={{ padding: '9px 12px', textAlign: 'left', color: 'var(--fog)', fontWeight: 600, fontSize: 10, letterSpacing: '.08em' }}>АЙМАГ / ДҮҮРЭГ</th>
            <th style={{ width: 72, padding: '9px 14px', textAlign: 'center', color: 'var(--gold)', fontWeight: 700, fontSize: 10, letterSpacing: '.08em' }}>ОНОО</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => {
            const mc = MEDAL_COLOR[p.rank]
            return (
              <tr
                key={i}
                style={{
                  borderBottom: '1px solid var(--line-2)',
                  background: MEDAL_BG[p.rank] ?? (i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,.015)'),
                  ...(p.rank <= 3 ? { borderLeft: `3px solid ${mc}` } : {}),
                }}
              >
                <td style={{ padding: '10px 10px', textAlign: 'center' }}>
                  {p.rank <= 3
                    ? <span style={{ fontSize: 18, lineHeight: 1 }}>{MEDALS[p.rank - 1]}</span>
                    : <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 5, background: 'var(--line)', color: 'var(--fog-2)', fontSize: 10, fontWeight: 700, fontFamily: 'var(--mono)' }}>{p.rank}</span>
                  }
                </td>
                <td style={{ padding: '10px 12px', fontWeight: p.rank <= 3 ? 700 : 500, fontSize: p.rank <= 3 ? 14 : 13, color: mc ?? 'var(--ink-2)' }}>
                  {p.name}
                </td>
                <td style={{ padding: '10px 12px', color: 'var(--fog-2)', fontSize: 12 }}>
                  {p.club}
                </td>
                <td style={{ padding: '10px 14px', textAlign: 'center', fontFamily: 'var(--mono)', fontWeight: 800, fontSize: 17, color: mc ?? (p.pts >= 4 ? 'var(--gold-dark)' : 'var(--fog-2)') }}>
                  {fmt(p.pts)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default async function ChessPage() {
  const sb = createServiceClient()

  // Find chess sport in this tournament
  const { data: sportRow } = await sb
    .from('tournament_sports')
    .select('id')
    .eq('tournament_id', TOURNAMENT_ID)
    .eq('sport_type', 'chess')
    .single()

  let women: Player[] = FALLBACK_WOMEN
  let men: Player[] = FALLBACK_MEN

  if (sportRow?.id) {
    const { data } = await sb
      .from('chess_standings')
      .select('gender, rank, name, club, pts')
      .eq('sport_id', sportRow.id)
      .order('gender').order('rank')

    if (data && data.length > 0) {
      women = data.filter((r: any) => r.gender === 'women').map(({ gender: _g, ...r }: any) => r)
      men   = data.filter((r: any) => r.gender === 'men').map(({ gender: _g, ...r }: any) => r)
    }
  }

  return (
    <>
      <section style={{ padding: '48px 0 28px', background: 'var(--ink)' }}>
        <div className="wrap-wide">
          <span style={{ color: 'var(--fog)', fontSize: 11, letterSpacing: '.12em', fontWeight: 700, textTransform: 'uppercase' as const }}>
            Final Ranking · Эцсийн дүн
          </span>
          <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 44, marginTop: 8, marginBottom: 0, color: 'var(--paper)', fontWeight: 900 }}>
            Шатрын <span style={{ color: 'var(--gold)' }}>тэмцээн</span>
          </h1>
          <p style={{ color: 'var(--fog)', fontSize: 13, marginTop: 8, marginBottom: 0 }}>
            ГҮТББ 2026 оны Спортын V наадам · 2026/06/11 · Буянт Ухаа Спорт Цогцолбор
          </p>
        </div>
      </section>

      <div style={{ background: 'var(--ink-2)', borderBottom: '1px solid var(--line)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="wrap-wide" style={{ display: 'flex', gap: 6, padding: '10px 0' }}>
          {[{ id: 'эмэгтэй', label: 'Эмэгтэй', icon: '♛' }, { id: 'эрэгтэй', label: 'Эрэгтэй', icon: '♚' }].map(s => (
            <a key={s.id} href={`#${s.id}`} style={{
              padding: '7px 16px', borderRadius: 6, fontSize: 12, fontWeight: 700,
              color: 'var(--fog)', background: 'var(--ink-3)',
              border: '1px solid var(--line-2)', whiteSpace: 'nowrap', textDecoration: 'none',
              letterSpacing: '.06em', textTransform: 'uppercase' as const,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ fontSize: 16 }}>{s.icon}</span>
              <span>{s.label}</span>
            </a>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--bg)', paddingBottom: 80 }}>
        <div className="wrap-wide">
          <section id="эмэгтэй" style={{ paddingTop: 52 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, paddingBottom: 14, borderBottom: '2px solid var(--gold)' }}>
              <span style={{ fontSize: 34, lineHeight: 1 }}>♛</span>
              <div>
                <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 28, fontWeight: 900, margin: 0, color: 'white', letterSpacing: '.06em', textTransform: 'uppercase' as const }}>
                  Шатар · Эмэгтэй
                </h2>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--fog)', letterSpacing: '.06em' }}>
                  Swiss System · {women.length} тоглогч
                </p>
              </div>
            </div>
            <RankTable players={women} />
          </section>

          <section id="эрэгтэй" style={{ paddingTop: 60 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, paddingBottom: 14, borderBottom: '2px solid var(--gold)' }}>
              <span style={{ fontSize: 34, lineHeight: 1 }}>♚</span>
              <div>
                <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 28, fontWeight: 900, margin: 0, color: 'white', letterSpacing: '.06em', textTransform: 'uppercase' as const }}>
                  Шатар · Эрэгтэй
                </h2>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--fog)', letterSpacing: '.06em' }}>
                  Swiss System · {men.length} тоглогч
                </p>
              </div>
            </div>
            <RankTable players={men} />
          </section>
        </div>
      </div>
    </>
  )
}
