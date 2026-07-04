import { StructurePageShell } from '@/components/structure/StructurePageShell'
import { getContentPage } from '@/lib/content-pages'
import { getSiteSettings, sitePageTitle } from '@/lib/site-settings'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const settings = await getSiteSettings()
  const page = getContentPage(settings.content_pages, 'butets/belegdel')
  return { title: sitePageTitle(page.title) }
}

export default async function Page() {
  const settings = await getSiteSettings()
  const page = getContentPage(settings.content_pages, 'butets/belegdel')
  return (
    <StructurePageShell page={page}>
      <div className="structure-placeholder">
        <p>Бэлэгдэл, лого, тэмдгийн мэдээллийг энд нэмнэ.</p>
      </div>
    </StructurePageShell>
  )
}
