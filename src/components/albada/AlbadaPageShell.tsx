import Link from 'next/link'
import type { ContentPage } from '@/lib/site-settings'
import { AlbadaSubnav } from '@/components/albada/AlbadaSubnav'
import { ALBADA_BASE } from '@/lib/departments-data'

export function AlbadaPageShell({
  page,
  backHref = ALBADA_BASE,
  backLabel = '← Албадууд',
  children,
}: {
  page: ContentPage
  backHref?: string
  backLabel?: string
  children?: React.ReactNode
}) {
  return (
    <section className="section structure-page">
      <div className="wrap-wide" style={{ maxWidth: 900 }}>
        <span className="eyebrow">{page.eyebrow}</span>
        <h1 className="section-title" style={{ marginTop: 8, marginBottom: 12 }}>
          {page.title}
        </h1>
        {page.body && (
          <p className="structure-intro">{page.body}</p>
        )}
        <AlbadaSubnav />
        {children && <div className="structure-content">{children}</div>}
        <Link href={backHref} className="section-action" style={{ marginTop: 32, display: 'inline-block' }}>
          {backLabel}
        </Link>
      </div>
    </section>
  )
}
