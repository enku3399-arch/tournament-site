import Link from 'next/link'
import { AlbadaPageShell } from '@/components/albada/AlbadaPageShell'
import { ALBADA_INDEX_PAGE, DEPARTMENTS, departmentHref } from '@/lib/departments-data'
import { getSiteSettings, sitePageTitle } from '@/lib/site-settings'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const settings = await getSiteSettings()
  const page = settings.content_pages.albada ?? ALBADA_INDEX_PAGE
  return { title: sitePageTitle(page.title) }
}

export default async function AlbadaIndexPage() {
  const settings = await getSiteSettings()
  const page = settings.content_pages.albada ?? ALBADA_INDEX_PAGE

  return (
    <AlbadaPageShell page={page} backHref="/" backLabel="← Нүүр хуудас">
      <div className="albada-dept-grid">
        {DEPARTMENTS.map(d => {
          const content = settings.content_pages[`albada/${d.slug}`]
          return (
            <Link key={d.slug} href={departmentHref(d.slug)} className="albada-dept-card">
              <h2 className="albada-dept-card-title">{d.label}</h2>
              <p className="albada-dept-card-body">{content?.body ?? d.body}</p>
              <span className="albada-dept-card-link">Дэлгэрэнгүй →</span>
            </Link>
          )
        })}
      </div>
    </AlbadaPageShell>
  )
}
