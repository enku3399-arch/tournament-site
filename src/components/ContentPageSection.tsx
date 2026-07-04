import Link from 'next/link'
import type { ContentPage } from '@/lib/site-settings'
import { ROUTES } from '@/lib/routes'

export function ContentPageSection({
  page,
  backHref = ROUTES.home,
  backLabel = '← Нүүр хуудас',
}: {
  page: ContentPage
  backHref?: string
  backLabel?: string
}) {
  return (
    <section className="section">
      <div className="wrap-wide" style={{ maxWidth: 720 }}>
        <span className="eyebrow">{page.eyebrow}</span>
        <h1 className="section-title" style={{ marginTop: 8, marginBottom: 16 }}>
          {page.title}
        </h1>
        <div
          className="content-page-body"
          style={{ color: 'var(--fog)', lineHeight: 1.75, marginBottom: 24, whiteSpace: 'pre-wrap' }}
        >
          {page.body}
        </div>
        <Link href={backHref} className="section-action">
          {backLabel}
        </Link>
      </div>
    </section>
  )
}
