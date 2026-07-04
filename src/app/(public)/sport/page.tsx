import Link from 'next/link'
import { naadam } from '@/lib/routes'

import { SITE_BRAND, sitePageTitle } from '@/lib/site-settings'

export const metadata = { title: sitePageTitle('Спорт') }

export default function SportPage() {
  return (
    <section className="section">
      <div className="wrap-wide" style={{ maxWidth: 800 }}>
        <span className="eyebrow">Спорт</span>
        <h1 className="section-title" style={{ marginTop: 8, marginBottom: 16 }}>
          Спортын <span className="gold">наадам</span>
        </h1>
        <p style={{ color: 'var(--fog)', lineHeight: 1.7, marginBottom: 32 }}>
          {SITE_BRAND}-ийн спортын чиглэл. 21 аймаг хамрагддаг уламжлалт спорт наадам болон бусад тэмцээнүүд.
        </p>

        <Link href={naadam.home} className="news-card" style={{
          display: 'block', textDecoration: 'none', padding: '28px 32px',
          border: '1px solid var(--gold)', background: 'rgba(166,127,52,.08)',
        }}>
          <span style={{
            fontFamily: 'var(--display)', fontSize: 10, letterSpacing: '.14em',
            textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700,
          }}>
            Одоогийн наадам
          </span>
          <h2 style={{
            fontFamily: 'var(--display)', fontSize: 28, color: 'var(--paper)',
            margin: '12px 0 8px', textTransform: 'uppercase',
          }}>
            V Спорт наадам 2026
          </h2>
          <p style={{ color: 'var(--fog)', fontSize: 14, margin: 0 }}>
            5 спортын төрөл · 21 аймаг · Улаанбаатар · Буянт Ухаа
          </p>
          <span style={{
            display: 'inline-block', marginTop: 20,
            fontFamily: 'var(--display)', fontSize: 11, letterSpacing: '.1em',
            textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600,
          }}>
            Наадмын сайт руу орох →
          </span>
        </Link>

        <div style={{ marginTop: 24 }}>
          <Link href={naadam.history} style={{ fontSize: 14, color: 'var(--fog)', textDecoration: 'none' }}>
            Өмнөх наадмуудын түүх →
          </Link>
        </div>
      </div>
    </section>
  )
}
