import Link from 'next/link'
import { ROUTES } from '@/lib/routes'

import { sitePageTitle } from '@/lib/site-settings'

export const metadata = { title: sitePageTitle('Нийгэмийн ажил') }

export default function CommunityPage() {
  return (
    <section className="section">
      <div className="wrap-wide" style={{ maxWidth: 720 }}>
        <span className="eyebrow">Нийгэмийн ажил</span>
        <h1 className="section-title" style={{ marginTop: 8, marginBottom: 16 }}>
          Нийгэмийн <span className="gold">ажил</span>
        </h1>
        <p style={{ color: 'var(--fog)', lineHeight: 1.75, marginBottom: 24 }}>
          Хандив, сайн дурын ажил, оюуны өмч, хамтын нөлөөллийн төслүүдийн мэдээлэл энд байрлана.
        </p>
        <Link href={ROUTES.home} className="section-action">← Нүүр хуудас</Link>
      </div>
    </section>
  )
}
