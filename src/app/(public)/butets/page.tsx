import { StructurePageShell } from '@/components/structure/StructurePageShell'
import { OrgChartSection } from '@/components/structure/OrgChartSection'
import { getContentPage } from '@/lib/content-pages'
import { getSiteSettings, sitePageTitle } from '@/lib/site-settings'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const settings = await getSiteSettings()
  const page = getContentPage(settings.content_pages, 'butets')
  return { title: sitePageTitle(page.title) }
}

export default async function StructurePage() {
  const settings = await getSiteSettings()
  const page = getContentPage(settings.content_pages, 'butets')
  return (
    <StructurePageShell page={page} backHref="/" backLabel="← Нүүр хуудас" wide>
      <OrgChartSection data={settings.structure_data} />
    </StructurePageShell>
  )
}
