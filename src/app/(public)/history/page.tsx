import { AIMAG_LOGO } from '@/lib/aimag-logo'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Наадмын түүх · Монгол-87/89 ГҮТББ V Спорт Наадам',
}

async function fetchHistoryOverrides(): Promise<Record<string, any>> {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['history_data'])
    const out: Record<string, any> = {}
    for (const row of data ?? []) out[row.key] = row.value
    return out
  } catch { return {} }
}

// ── Historical tournament data ────────────────────────────────────────────────
const HISTORY = [
  {
    num: 'I',
    year: '2022',
    title: '«Алдар-2022»',
    city: 'Улаанбаатар',
    venue: 'Алдар спорт ордон',
    sports_count: 2,
    categories_count: 4,
    overall_champion: 'Дархан-Уул',
    note: 'Монгол-87/89 ГҮТББ-ийн анхны спорт наадам. Сагсан бөмбөг, Волейболын 4 ангилалаар явагдсан.',
    results: [
      {
        sport: 'Сагсан бөмбөг', gender: 'male',
        gold: 'Дархан-Уул', silver: 'Хөвсгөл', bronze: 'Сүхбаатар аймаг',
      },
      {
        sport: 'Сагсан бөмбөг', gender: 'female',
        gold: 'Дархан-Уул', silver: 'Өмнөговь', bronze: 'Говь-Алтай',
      },
      {
        sport: 'Волейбол', gender: 'male',
        gold: 'Говь-Алтай', silver: 'Хэнтий', bronze: 'Ховд',
      },
      {
        sport: 'Волейбол', gender: 'female',
        gold: 'Өмнөговь', silver: 'Дундговь', bronze: 'Баянхонгор',
      },
    ],
  },
  {
    num: 'II',
    year: '2023',
    title: '«Мөнхөд нэгэн зугт-2023»',
    city: 'Архангай аймаг',
    venue: 'Архангай аймгийн спорт цогцолбор',
    sports_count: 2,
    categories_count: 4,
    overall_champion: 'Увс',
    note: 'Хоёрдугаар наадам анх удаа нийслэлээс гадна — Архангай аймагт зохиогдов.',
    results: [
      {
        sport: 'Сагсан бөмбөг', gender: 'male',
        gold: 'Дархан-Уул', silver: 'Увс', bronze: 'Говь-Алтай',
      },
      {
        sport: 'Сагсан бөмбөг', gender: 'female',
        gold: 'Өмнөговь', silver: 'Увс', bronze: 'Говь-Алтай',
      },
      {
        sport: 'Волейбол', gender: 'male',
        gold: 'Хэнтий', silver: 'Өвөрхангай', bronze: 'Говь-Алтай',
      },
      {
        sport: 'Волейбол', gender: 'female',
        gold: 'Дундговь', silver: 'Өвөрхангай', bronze: 'Архангай',
      },
    ],
  },
  {
    num: 'III',
    year: '2024',
    title: '«III Наадам-2024»',
    city: 'Дархан-Уул аймаг',
    venue: 'Дархан-Уул аймгийн спорт цогцолбор',
    sports_count: 5,
    categories_count: 7,
    overall_champion: '',
    note: '3-р наадам Дархан-Уул аймагт зохиогдов. Эхний удаа 5 төрөл 7 ангилалаар явагдсан — Ширээний теннис, Дартс, Шатар нэмэгдсэн.',
    results: [
      { sport: 'Дартс',           gender: 'male',   gold: '', gold_name: '', silver: '', silver_name: '', bronze: '', bronze_name: '' },
      { sport: 'Дартс',           gender: 'female', gold: '', gold_name: '', silver: '', silver_name: '', bronze: '', bronze_name: '' },
      { sport: 'Ширээний теннис', gender: 'male',   gold: '', gold_name: '', silver: '', silver_name: '', bronze: '', bronze_name: '' },
      { sport: 'Ширээний теннис', gender: 'female', gold: '', gold_name: '', silver: '', silver_name: '', bronze: '', bronze_name: '' },
      { sport: 'Шатар',           gender: 'male',   gold: '', gold_name: '', silver: '', silver_name: '', bronze: '', bronze_name: '' },
      { sport: 'Шатар',           gender: 'female', gold: '', gold_name: '', silver: '', silver_name: '', bronze: '', bronze_name: '' },
      { sport: 'Сагсан бөмбөг',  gender: 'male',   gold: '', silver: '', bronze: '' },
      { sport: 'Сагсан бөмбөг',  gender: 'female', gold: '', silver: '', bronze: '' },
      { sport: 'Волейбол',        gender: 'male',   gold: '', silver: '', bronze: '' },
      { sport: 'Волейбол',        gender: 'female', gold: '', silver: '', bronze: '' },
    ],
  },
  {
    num: 'IV',
    year: '2025',
    title: '«IV Наадам-2025»',
    city: 'Орхон аймаг',
    venue: 'Орхон аймгийн спорт цогцолбор',
    sports_count: 5,
    categories_count: 10,
    overall_champion: 'Өвөрхангай',
    note: '4-р наадам Орхон аймагт (Эрдэнэт хотод) зохиогдов. Дартс, Ширээний теннис, Шатар, Сагсан бөмбөг, Волейбол зэрэг 5 төрлөөр явагдсан.',
    results: [
      { sport: 'Дартс',           gender: 'male',   gold: 'Өмнөговь',   gold_name: 'Б.Наян',        silver: 'Дорноговь',  silver_name: 'Ц.Эрхэмбат',    bronze: 'Говь-Алтай', bronze_name: 'Л.Нүрэвдорж'  },
      { sport: 'Дартс',           gender: 'female', gold: 'Дархан-Уул', gold_name: 'С.Оюунчимэг',  silver: 'Өмнөговь',   silver_name: 'С.Уртнасан',     bronze: 'Төв',         bronze_name: 'Ц.Дагиймаа'   },
      { sport: 'Ширээний теннис', gender: 'male',   gold: 'Хөвсгөл',    gold_name: 'Н.Баттулга',   silver: 'Булган',      silver_name: 'Д.Энхтүвшин',    bronze: 'Өвөрхангай', bronze_name: 'Ц.Энх-Амгалан' },
      { sport: 'Ширээний теннис', gender: 'female', gold: 'Булган',      gold_name: 'Д.Отгонбаяр',  silver: 'Говь-Алтай', silver_name: 'П.Даваацэрэн',   bronze: 'Дорнод',      bronze_name: 'Б.Анхзаяа'     },
      { sport: 'Шатар',           gender: 'male',   gold: 'Булган',      gold_name: 'Б.Үүрцайх',    silver: 'Дорноговь',  silver_name: 'О.Батзориг',     bronze: 'Төв',         bronze_name: 'Г.Отгонпүрэв'  },
      { sport: 'Шатар',           gender: 'female', gold: 'Өмнөговь',    gold_name: 'У.Цогтэрэл',   silver: 'Дундговь',   silver_name: 'А.Найгалмаа',    bronze: 'Завхан',      bronze_name: 'Л.Оюунцэцэг'   },
      { sport: 'Сагсан бөмбөг',  gender: 'male',   gold: 'Дархан-Уул', silver: 'Орхон',       bronze: 'Дорноговь'  },
      { sport: 'Сагсан бөмбөг',  gender: 'female', gold: 'Дархан-Уул', silver: 'Төв',          bronze: 'Говь-Алтай' },
      { sport: 'Волейбол',        gender: 'male',   gold: 'Говь-Алтай', silver: 'Өвөрхангай',  bronze: 'Хэнтий'     },
      { sport: 'Волейбол',        gender: 'female', gold: 'Дундговь',    silver: 'Өвөрхангай',  bronze: 'Завхан'      },
    ],
    awards: [
      { sport: 'Сагсан бөмбөг', gender: 'female', title: 'Довтлогч',        aimag: 'Дархан-Уул', name: 'С.Мөнхтуяа'     },
      { sport: 'Сагсан бөмбөг', gender: 'female', title: 'Холбогч',         aimag: 'Дархан-Уул', name: 'Н.Туяа'          },
      { sport: 'Сагсан бөмбөг', gender: 'female', title: 'Хамгаалагч',      aimag: 'Говь-Алтай', name: 'Ч.Энхцэцэг'     },
      { sport: 'Сагсан бөмбөг', gender: 'female', title: 'Тэвийн тоглогч',  aimag: 'Төв',         name: 'Н.Бямбаабаатар' },
      { sport: 'Сагсан бөмбөг', gender: 'male',   title: 'Тэвийн тоглогч',  aimag: 'Орхон',       name: 'Г.Ганхуяг'      },
      { sport: 'Сагсан бөмбөг', gender: 'male',   title: 'Холбогч',         aimag: 'Орхон',       name: 'Н.Батболд'      },
      { sport: 'Сагсан бөмбөг', gender: 'male',   title: 'Шилдэг довтлогч', aimag: 'Дархан-Уул', name: 'Д.Ганцогт'      },
      { sport: 'Сагсан бөмбөг', gender: 'male',   title: 'Хамгаалагч',      aimag: 'Дорноговь',  name: 'Н.Цэвэгдорж'    },
      { sport: 'Волейбол',       gender: 'female', title: 'Тэш тоглогч',     aimag: 'Дундговь',    name: 'С.Батжаргал'    },
      { sport: 'Волейбол',       gender: 'female', title: 'Холбогч',         aimag: 'Дундговь',    name: 'Ч.Оюунчимэг'    },
      { sport: 'Волейбол',       gender: 'female', title: 'Хамгаалагч',      aimag: 'Завхан',      name: 'И.Хишигжаргал'  },
      { sport: 'Волейбол',       gender: 'female', title: 'Шилдэг довтлогч', aimag: 'Өвөрхангай',  name: 'Н.Алимаа'       },
      { sport: 'Волейбол',       gender: 'male',   title: 'Шилдэг довтлогч', aimag: 'Говь-Алтай',  name: 'Г.Баярсайхан'   },
      { sport: 'Волейбол',       gender: 'male',   title: 'Тэш тоглогч',     aimag: 'Говь-Алтай',  name: 'Н.Болдбаатар'   },
      { sport: 'Волейбол',       gender: 'male',   title: 'Шилдэг холбогч',  aimag: 'Өвөрхангай',  name: 'Н.Нүрэвсүрэн'   },
      { sport: 'Волейбол',       gender: 'male',   title: 'Хамгаалагч',      aimag: 'Хэнтий',      name: 'Н.Ганболд'      },
    ],
  },
]

const SPORT_ICON: Record<string, string> = {
  'Сагсан бөмбөг': '🏀',
  'Волейбол': '🏐',
  'Ширээний теннис': '🏓',
  'Дартс': '🎯',
  'Шатар': '♟️',
}
// kept for reference only
const GENDER_LABEL: Record<string, string> = { male: 'Эрэгтэй', female: 'Эмэгтэй', mixed: 'Холимог' }

const GENDER_LABEL_MAP: Record<string, string> = { male: 'Эрэгтэй', female: 'Эмэгтэй', mixed: 'Холимог / Баг' }

function AimagBadge({ name, rank }: { name: string; rank: 1 | 2 | 3 }) {
  const logo = AIMAG_LOGO[name]
  const colors = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' }
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 16 }}>{medals[rank]}</span>
      {logo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt={name} style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 4 }} />
      )}
      <span style={{ fontSize: 13, fontWeight: rank === 1 ? 700 : 400, color: rank === 1 ? colors[rank] : '#444' }}>
        {name}
      </span>
    </div>
  )
}

export default async function HistoryPage() {
  const overrides = await fetchHistoryOverrides()

  const hd = overrides.history_data ?? {}
  const history = HISTORY.map(ed => {
    const ov = hd[ed.num]
    if (!ov) return ed
    return {
      ...ed,
      ...(ov.overall_champion !== undefined ? { overall_champion: ov.overall_champion } : {}),
      ...(ov.results ? { results: ov.results } : {}),
      ...(ov.awards  ? { awards:  ov.awards  } : {}),
    }
  })

  return (
    <>
      {/* ── Header ──────────────────────────────────────────────────── */}
      <section style={{ padding: '52px 0 36px', background: 'var(--ink)' }}>
        <div className="wrap-wide">
          <span className="eyebrow" style={{ color: 'var(--fog)', fontSize: 11, letterSpacing: '.12em' }}>
            TOURNAMENT HISTORY · НААДМЫН ТҮҮХ
          </span>
          <h1 className="section-title" style={{ fontFamily: 'Oswald, sans-serif', fontSize: 44, marginTop: 8, color: 'var(--paper)' }}>
            Наадмын <span className="gold">түүх</span>
          </h1>
          <p style={{ color: 'var(--fog)', fontSize: 13, marginTop: 10, maxWidth: 560 }}>
            Монгол-87/89 Гүтбб-ийн спорт наадмуудын цогц дүн болон аваргуудын жагсаалт.
            Эхний 2 наадам 2 төрөл (4 ангилал), 3-р наадмаас эхлэн 5 төрөл (7 ангилал) болсон.
          </p>
        </div>
      </section>

      {/* ── Timeline ────────────────────────────────────────────────── */}
      <div style={{ background: 'var(--bg)', paddingBottom: 80 }}>
        <div className="wrap-wide" style={{ paddingTop: 52 }}>

          {history.map((ed, idx) => (
            <div key={ed.num} style={{
              marginBottom: 60,
              display: 'grid',
              gridTemplateColumns: '80px 1fr',
              gap: '0 32px',
            }}>
              {/* Roman numeral */}
              <div style={{ textAlign: 'center', paddingTop: 4 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 12,
                  background: idx === HISTORY.length - 1 ? 'var(--gold)' : 'var(--ink)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Oswald, sans-serif', fontSize: 22, fontWeight: 900,
                  color: idx === HISTORY.length - 1 ? 'var(--ink)' : 'var(--paper)',
                  margin: '0 auto',
                }}>
                  {ed.num}
                </div>
                <div style={{ width: 2, height: idx < HISTORY.length - 1 ? 60 : 0, background: 'var(--line)', margin: '12px auto 0' }} />
              </div>

              {/* Content */}
              <div>
                {/* Header */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                    <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
                      {ed.title}
                    </h2>
                    <span style={{ fontSize: 13, color: 'var(--fog)', fontWeight: 500 }}>
                      {ed.year} · {ed.city}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--fog)', marginTop: 4 }}>
                    📍 {ed.venue} &nbsp;·&nbsp;
                    🏅 {ed.sports_count} спортын төрөл, {ed.categories_count} ангилал
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--fog-2)', marginTop: 6, lineHeight: 1.6 }}>{ed.note}</p>
                </div>

                {/* Results grid */}
                {ed.results.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, marginBottom: 16 }}>
                    {ed.results.map((r, ri) => (
                      <div key={ri} style={{
                        borderRadius: 10, border: '1px solid var(--line)',
                        background: 'var(--paper)', overflow: 'hidden',
                      }}>
                        {/* Sport header */}
                        <div style={{
                          background: 'var(--ink)', padding: '8px 14px',
                          display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                          <span style={{ fontSize: 16 }}>{SPORT_ICON[r.sport] ?? '🏅'}</span>
                          <span style={{ color: 'var(--paper)', fontWeight: 700, fontSize: 12, fontFamily: 'Oswald, sans-serif', letterSpacing: '.06em' }}>
                            {r.sport.toUpperCase()}
                          </span>
                          <span style={{
                            marginLeft: 'auto', fontSize: 10, fontWeight: 600,
                            color: r.gender === 'male' ? '#60a5fa' : '#f9a8d4',
                            background: r.gender === 'male' ? 'rgba(96,165,250,.15)' : 'rgba(249,168,212,.15)',
                            padding: '2px 8px', borderRadius: 20,
                          }}>
                            {GENDER_LABEL[r.gender]}
                          </span>
                        </div>
                        {/* Medals */}
                        <div style={{ padding: '12px 14px' }}>
                          {r.gold ? (() => {
                            const gn = (r as any).gold_name, sn = (r as any).silver_name, bn = (r as any).bronze_name
                            const hasNames = !!(gn || sn || bn)
                            return (
                              <div style={{ display: 'grid', gridTemplateColumns: hasNames ? '1fr auto' : '1fr', gap: '8px 14px', alignItems: 'center' }}>
                                <AimagBadge name={r.gold}   rank={1} />{hasNames && <span style={{ fontSize: 13, color: 'var(--fog)', whiteSpace: 'nowrap' }}>{gn ?? ''}</span>}
                                <AimagBadge name={r.silver} rank={2} />{hasNames && <span style={{ fontSize: 13, color: 'var(--fog)', whiteSpace: 'nowrap' }}>{sn ?? ''}</span>}
                                <AimagBadge name={r.bronze} rank={3} />{hasNames && <span style={{ fontSize: 13, color: 'var(--fog)', whiteSpace: 'nowrap' }}>{bn ?? ''}</span>}
                              </div>
                            )
                          })() : (
                            <span style={{ fontSize: 11, color: '#aaa', fontStyle: 'italic' }}>Мэдээлэл тодорхойгүй</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Awards tables */}
                {'awards' in ed && (ed as any).awards?.length > 0 && (() => {
                  const awards: { sport: string; gender: string; title: string; aimag: string; name: string }[] = (ed as any).awards
                  const sports = [...new Set(awards.map(a => a.sport))]
                  return (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--fog)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 10 }}>
                        ⭐ Шилдэг тоглогчид
                      </div>
                      {sports.map(sport => {
                        const female = awards.filter(a => a.sport === sport && a.gender === 'female')
                        const male   = awards.filter(a => a.sport === sport && a.gender === 'male')
                        return (
                          <div key={sport} style={{ marginBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                              <span style={{ fontSize: 14 }}>{SPORT_ICON[sport] ?? '🏅'}</span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--paper)', fontFamily: 'Oswald, sans-serif', letterSpacing: '.06em' }}>
                                {sport.toUpperCase()}
                              </span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                              {[{ list: female, label: 'Эмэгтэй', color: '#f9a8d4', bg: 'rgba(249,168,212,.15)' }, { list: male, label: 'Эрэгтэй', color: '#60a5fa', bg: 'rgba(96,165,250,.15)' }].map(({ list, label, color, bg }) => (
                                <div key={label} style={{ borderRadius: 8, border: '1px solid var(--line)', overflow: 'hidden', background: 'var(--ink-2)' }}>
                                  <div style={{ padding: '5px 10px', background: bg, borderBottom: '1px solid var(--line)' }}>
                                    <span style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: '.06em' }}>{label.toUpperCase()}</span>
                                  </div>
                                  {list.map((a, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderBottom: i < list.length - 1 ? '1px solid var(--line)' : 'none' }}>
                                      <span style={{ fontSize: 10, color: 'var(--fog)', minWidth: 95, flexShrink: 0 }}>{a.title}</span>
                                      {AIMAG_LOGO[a.aimag] && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={AIMAG_LOGO[a.aimag]} alt={a.aimag} style={{ width: 18, height: 18, objectFit: 'contain', flexShrink: 0 }} />
                                      )}
                                      <span style={{ fontSize: 11, color: 'var(--fog)', flexShrink: 0 }}>{a.aimag}</span>
                                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--paper)', marginLeft: 'auto' }}>{a.name}</span>
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}

                {/* Overall champion */}
                {ed.overall_champion && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 10,
                    background: 'rgba(200,162,74,.1)', border: '1px solid rgba(200,162,74,.3)',
                    borderRadius: 8, padding: '8px 16px',
                  }}>
                    <span style={{ fontSize: 20 }}>🏆</span>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--gold)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                        Шилжин явах цомын эзэн
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--paper)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {AIMAG_LOGO[ed.overall_champion] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={AIMAG_LOGO[ed.overall_champion]} alt={ed.overall_champion} style={{ width: 20, height: 20, objectFit: 'contain' }} />
                        )}
                        {ed.overall_champion}
                      </div>
                    </div>
                  </div>
                )}

                {ed.results.length === 0 && (
                  <div style={{ padding: '16px', borderRadius: 8, border: '1px dashed var(--line)', color: 'var(--fog)', fontSize: 13 }}>
                    Дэлгэрэнгүй мэдээлэл тодорхойлогдоогүй байна
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Current edition promo */}
          <div style={{
            borderRadius: 16, background: 'var(--ink)',
            padding: '32px', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: 12, background: 'var(--gold)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Oswald, sans-serif', fontSize: 28, fontWeight: 900, color: 'var(--ink)', flexShrink: 0,
            }}>V</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'var(--gold)', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                Одоо явагдаж байна
              </div>
              <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 22, color: 'var(--paper)', margin: 0, fontWeight: 800 }}>
                V Спорт Наадам · 2026
              </h3>
              <p style={{ color: 'var(--fog)', fontSize: 13, margin: '6px 0 0' }}>
                "Буянт Ухаа" спорт ордон · 5 спортын төрөл, 7 ангилал · 06.11 — 06.13
              </p>
            </div>
            <Link href="/groups" style={{
              padding: '10px 20px', borderRadius: 8,
              background: 'var(--gold)', color: 'var(--ink)',
              fontWeight: 700, fontSize: 13, textDecoration: 'none',
              fontFamily: 'Oswald, sans-serif', letterSpacing: '.06em',
            }}>
              Хэсгийн хуваарь →
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
