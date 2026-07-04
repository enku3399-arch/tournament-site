import Link from 'next/link'
import type { ContentPage } from '@/lib/site-settings'
import { ButetsSubnav } from '@/components/structure/ButetsSubnav'

export function StructurePageShell({
  page,
  backHref = '/butets',
  backLabel = '← Бүтэц зохион байгуулалт',
  children,
  wide = false,
}: {
  page: ContentPage
  backHref?: string
  backLabel?: string
  children: React.ReactNode
  wide?: boolean
}) {
  return (
    <section className="section structure-page">
      <div className="wrap-wide" style={{ maxWidth: wide ? 1100 : 900 }}>
        <span className="eyebrow">{page.eyebrow}</span>
        <h1 className="section-title" style={{ marginTop: 8, marginBottom: 12 }}>
          {page.title}
        </h1>
        {page.body && (
          <p className="structure-intro">{page.body}</p>
        )}
        <ButetsSubnav />
        <div className="structure-content">{children}</div>
        <Link href={backHref} className="section-action" style={{ marginTop: 32, display: 'inline-block' }}>
          {backLabel}
        </Link>
      </div>
    </section>
  )
}
