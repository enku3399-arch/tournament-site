import Link from 'next/link'

export const metadata = {
  title: 'Спортын төрлүүд · Монгол 87/89 V Спорт Наадам 2026',
  description: '5 спортын төрөл · Сагсан бөмбөг, Волейбол, Шатар, Ширээний теннис, Дартс',
}

const BASKETBALL_SVG = `url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22><circle cx=%2212%22 cy=%2212%22 r=%2210%22 fill=%22none%22 stroke=%22black%22 stroke-width=%221.5%22/><path d=%22M2 12h20M12 2v20M5 5c4 4 10 4 14 0M5 19c4-4 10-4 14 0%22 fill=%22none%22 stroke=%22black%22 stroke-width=%221.5%22/></svg>')`
const VOLLEYBALL_SVG = `url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22><circle cx=%2212%22 cy=%2212%22 r=%2210%22 fill=%22none%22 stroke=%22black%22 stroke-width=%221.5%22/><path d=%22M12 2c-3 5-3 12 0 20M2 8c6-1 14 1 18 8M22 8c-6-1-14 1-18 8%22 fill=%22none%22 stroke=%22black%22 stroke-width=%221.5%22/></svg>')`
const CHESS_SVG     = `url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22><path d=%22M8 22h8M9 20l-1-3h8l-1 3M10 17V8m4 9V8M7 8h10l-1-3h-2l-1-2h-2l-1 2H8z%22 fill=%22none%22 stroke=%22black%22 stroke-width=%221.5%22 stroke-linejoin=%22round%22/></svg>')`
const TENNIS_SVG    = `url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22><circle cx=%228%22 cy=%2210%22 r=%225%22 fill=%22none%22 stroke=%22black%22 stroke-width=%221.5%22/><path d=%22M11 13l8 8M17 19l3 3%22 fill=%22none%22 stroke=%22black%22 stroke-width=%221.5%22 stroke-linecap=%22round%22/></svg>')`
const DARTS_SVG     = `url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22><circle cx=%2212%22 cy=%2212%22 r=%2210%22 fill=%22none%22 stroke=%22black%22 stroke-width=%221.5%22/><circle cx=%2212%22 cy=%2212%22 r=%226%22 fill=%22none%22 stroke=%22black%22 stroke-width=%221.5%22/><circle cx=%2212%22 cy=%2212%22 r=%222%22 fill=%22black%22/></svg>')`

const SPORTS = [
  {
    num: '01',
    name: 'Сагсан бөмбөг',
    cat: 'Эр · Эм',
    mask: BASKETBALL_SVG,
    categories: [
      { label: '♂ Эрэгтэй', format: '5 × 5', teams: '21 аймаг' },
      { label: '♀ Эмэгтэй', format: '5 × 5', teams: '21 аймаг' },
    ],
    format: 'Хэсгийн шат → Плей-офф → Финал',
    rules: 'ФИБА-ийн дүрмээр явагдана. Хэсгийн шатанд 4 минутын 4 хагас. Плей-офф болон финалд стандарт 10 минутын 4 хагас.',
    venue: '"Буянт Ухаа" спорт ордон · Гол заал',
    days: '06.11 — 06.12',
  },
  {
    num: '02',
    name: 'Волейбол',
    cat: 'Эр · Эм',
    mask: VOLLEYBALL_SVG,
    categories: [
      { label: '♂ Эрэгтэй', format: '6 × 6', teams: '21 аймаг' },
      { label: '♀ Эмэгтэй', format: '6 × 6', teams: '21 аймаг' },
    ],
    format: 'Хэсгийн шат → Плей-офф → Финал',
    rules: 'ФИВБ-ийн дүрмээр явагдана. Хэсгийн шатанд 1 сет тоглож ялагчийг тодруулна (25 оноо). Плей-офф болон финалд 3 сетийн 2 ялалт.',
    venue: '"Буянт Ухаа" спорт ордон · Гол заал',
    days: '06.11 — 06.12',
  },
  {
    num: '03',
    name: 'Шатар',
    cat: 'Баг',
    mask: CHESS_SVG,
    categories: [
      { label: 'Багаар', format: '6 самбар', teams: '21 аймаг' },
    ],
    format: 'Швейцарийн систем · 7 тур',
    rules: 'ФИДЕ-ийн дүрмийн дагуу. Баг тус бүр 6 самбарт (3 эр + 3 эм) тоглоно. 1 тур тутамд 25 минут + хожигдол тутамд 10 секундын нэмэлт цаг.',
    venue: '"Буянт Ухаа" спорт ордон · Бага заал',
    days: '06.11',
  },
  {
    num: '04',
    name: 'Ширээний теннис',
    cat: 'Баг',
    mask: TENNIS_SVG,
    categories: [
      { label: 'Багаар', format: '3 тоглогч', teams: '21 аймаг' },
    ],
    format: 'Хэсгийн шат → Плей-офф → Финал',
    rules: 'ИТТФ-ийн дүрмийн дагуу. Тус баг 3 тоглогчтойгоор ирнэ. Баг тус бүрийн хоорондын тулалдаанд 3 сетийн 2 ялалтаар тодруулна. 5 тоглолт тус бүр дэлхийн стандарт 11 оноон дуустал (3 ялалт).',
    venue: '"Буянт Ухаа" спорт ордон · Бага заал',
    days: '06.12',
  },
  {
    num: '05',
    name: 'Дартс',
    cat: 'Баг',
    mask: DARTS_SVG,
    categories: [
      { label: 'Багаар', format: '3 тоглогч', teams: '21 аймаг' },
    ],
    format: 'Хэсгийн шат → Хас шат → Финал',
    rules: '501 форматаар явагдана. Баг тус бүр 3 тоглогчтойгоор ирнэ. Баг хоорондын тулалдаанд 3 leg-ийн 2 ялалт. Финалд Best of 5 legs.',
    venue: '"Буянт Ухаа" спорт ордон · Бага заал',
    days: '06.11',
  },
]

export default function SportsPage() {
  return (
    <>
      {/* Header */}
      <section className="section" style={{ padding: '48px 0 0' }}>
        <div className="wrap-wide">
          <span className="eyebrow" style={{ color: 'var(--fog)' }}>5 төрөл · 7 ангилал</span>
          <h1 className="section-title" style={{ fontFamily: 'Oswald, sans-serif', fontSize: 48, marginTop: 8, marginBottom: 0 }}>
            Спортын <span className="gold">төрлүүд</span>
          </h1>
        </div>
      </section>

      {/* Sports overview grid */}
      <section className="section sports-section" style={{ paddingTop: 0 }}>
        <div className="wrap-wide" style={{ paddingTop: 0 }}>
          <div className="sports-grid sports-grid-5" style={{ marginBottom: 48 }}>
            {SPORTS.map(s => (
              <a key={s.num} href={`#sport-${s.num}`} className="sport-card" style={{ textDecoration: 'none' }}>
                <div className="sport-head-row">
                  <span className="sport-num">{s.num}</span>
                  <span className="sport-cat">{s.cat}</span>
                </div>
                <div className="sport-icon-frame">
                  <div className="sport-pictogram" style={{ WebkitMaskImage: s.mask, maskImage: s.mask }} />
                </div>
                <div>
                  <div className="sport-name">{s.name}</div>
                  <div className="sport-cats">
                    {s.categories.map(c => (
                      <span key={c.label} className="cat-pill">{c.label}</span>
                    ))}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed sport sections */}
      {SPORTS.map((s, i) => (
        <section
          key={s.num}
          id={`sport-${s.num}`}
          className={i % 2 === 0 ? 'section' : 'section sports-section'}
          style={{ scrollMarginTop: 80 }}
        >
          <div className="wrap-wide">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 60, alignItems: 'start' }}>

              {/* Left: icon + meta */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                  <div
                    className="sport-icon-frame"
                    style={{
                      width: 72, height: 72,
                      background: i % 2 === 0 ? 'rgba(255,255,255,.08)' : 'rgba(11,20,38,.06)',
                      borderRadius: 16,
                    }}
                  >
                    <div
                      className="sport-pictogram"
                      style={{
                        WebkitMaskImage: s.mask,
                        maskImage: s.mask,
                        width: 40, height: 40,
                        background: i % 2 === 0 ? 'var(--paper)' : 'var(--ink)',
                      }}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: 'var(--display)', fontSize: 11, letterSpacing: '.2em',
                        color: 'var(--gold-dark)', textTransform: 'uppercase', marginBottom: 4,
                      }}
                    >
                      {s.num} · {s.cat}
                    </div>
                    <h2
                      style={{
                        fontFamily: 'Oswald, sans-serif', fontSize: 32, fontWeight: 700,
                        margin: 0, color: i % 2 === 0 ? 'var(--paper)' : 'var(--ink)',
                      }}
                    >
                      {s.name}
                    </h2>
                  </div>
                </div>

                {/* Categories */}
                <div style={{ display: 'grid', gap: 8, marginBottom: 24 }}>
                  {s.categories.map(c => (
                    <div
                      key={c.label}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: i % 2 === 0 ? 'rgba(255,255,255,.06)' : 'rgba(11,20,38,.05)',
                        border: `1px solid ${i % 2 === 0 ? 'rgba(255,255,255,.1)' : 'rgba(11,20,38,.1)'}`,
                        borderRadius: 10, padding: '12px 16px',
                      }}
                    >
                      <span style={{
                        fontFamily: 'var(--display)', textTransform: 'uppercase',
                        letterSpacing: '.08em', fontSize: 13, fontWeight: 600,
                        color: i % 2 === 0 ? 'var(--paper)' : 'var(--ink)',
                      }}>
                        {c.label}
                      </span>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, color: 'var(--gold-dark)', fontFamily: 'var(--mono)' }}>{c.format}</div>
                        <div style={{ fontSize: 11, color: i % 2 === 0 ? 'var(--fog)' : 'rgba(11,20,38,.45)', marginTop: 2 }}>{c.teams}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Meta */}
                {[
                  { label: 'Заал', val: s.venue },
                  { label: 'Өдрүүд', val: s.days },
                ].map(m => (
                  <div key={m.label} style={{
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                    paddingBottom: 12, marginBottom: 12,
                    borderBottom: `1px solid ${i % 2 === 0 ? 'rgba(255,255,255,.08)' : 'rgba(11,20,38,.1)'}`,
                  }}>
                    <span style={{
                      fontSize: 10, fontFamily: 'var(--display)', letterSpacing: '.12em',
                      textTransform: 'uppercase', color: 'var(--gold-dark)',
                      minWidth: 60, paddingTop: 2,
                    }}>{m.label}</span>
                    <span style={{ fontSize: 14, color: i % 2 === 0 ? 'var(--paper)' : 'var(--ink)' }}>{m.val}</span>
                  </div>
                ))}
              </div>

              {/* Right: rules */}
              <div>
                <div style={{
                  fontSize: 10, fontFamily: 'var(--display)', letterSpacing: '.16em',
                  textTransform: 'uppercase', color: 'var(--gold-dark)', marginBottom: 16,
                }}>
                  Тэмцээний формат
                </div>
                <div style={{
                  fontFamily: 'Oswald, sans-serif', fontSize: 22, fontWeight: 500,
                  color: i % 2 === 0 ? 'var(--paper)' : 'var(--ink)',
                  marginBottom: 20, letterSpacing: '.02em',
                }}>
                  {s.format}
                </div>
                <p style={{
                  fontSize: 15, lineHeight: 1.75,
                  color: i % 2 === 0 ? 'var(--fog)' : 'rgba(11,20,38,.65)',
                  margin: 0,
                }}>
                  {s.rules}
                </p>

                <Link
                  href="/schedule"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 32,
                    fontFamily: 'var(--display)', fontSize: 12, letterSpacing: '.14em',
                    textTransform: 'uppercase', color: 'var(--gold)',
                    textDecoration: 'none',
                  }}
                >
                  Хуваарь харах →
                </Link>
              </div>

            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="section" style={{ padding: '48px 0' }}>
        <div className="wrap-wide" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link href="/schedule" className="btn-primary">Хуваарь үзэх →</Link>
          <Link href="/register" className="btn-ghost">Бүртгүүлэх ▷</Link>
        </div>
      </section>
    </>
  )
}
