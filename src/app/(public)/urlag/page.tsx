import Link from 'next/link'
import { ROUTES } from '@/lib/routes'

import { sitePageTitle } from '@/lib/site-settings'

export const metadata = { title: sitePageTitle('Урлаг') }

export default function ArtPage() {
  return (
    <section className="section">
      <div className="wrap-wide" style={{ maxWidth: 720 }}>
        <span className="eyebrow">Урлаг</span>
        <h1 className="section-title" style={{ marginTop: 8, marginBottom: 16 }}>
          Урлагын <span className="gold">чиглэл</span>
        </h1>
        <p style={{ color: 'var(--fog)', lineHeight: 1.75, marginBottom: 24 }}>
          Концерт, үзэсгэлэн, соёлын арга хэмжээний мэдээлэл энд нэмэгдэнэ. Админ самбараас агуулга оруулах боломжтой болно.
        </p>
        <Link href={ROUTES.home} className="section-action">← Нүүр хуудас</Link>
      </div>
    </section>
  )
}
