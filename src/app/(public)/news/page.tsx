import Link from 'next/link'
import { getSiteSettings } from '@/lib/site-settings'
import NewsClient from './NewsClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Мэдээ · Монгол 87/89 V Спорт Наадам 2026',
  description: 'Монгол 87/89 V Спорт Наадам 2026-ийн сүүлийн мэдээ, мэдэгдэл',
}

export default async function NewsPage() {
  const settings = await getSiteSettings()

  return (
    <>
      {/* Page header */}
      <div className="section" style={{ padding: '48px 0 40px' }}>
        <div className="wrap-wide">
          <span className="eyebrow" style={{ color: 'var(--fog)' }}>Мэдээ · Мэдэгдэл</span>
          <h1 className="section-title" style={{ fontFamily: 'Oswald, sans-serif', fontSize: 48, marginTop: 8 }}>
            Онцлох <span className="gold">мэдээ</span>
          </h1>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap-wide">
          <NewsClient articles={settings.news} tags={settings.news_tags} />

          <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid var(--line)', textAlign: 'center' }}>
            <Link href="/" className="section-action" style={{ fontSize: 14 }}>← Нүүр хуудас руу буцах</Link>
          </div>
        </div>
      </section>
    </>
  )
}
