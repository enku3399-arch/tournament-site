import { StructurePageShell } from '@/components/structure/StructurePageShell'
import { ExecutiveDepartmentsTable } from '@/components/structure/ExecutiveDepartmentsTable'
import { getContentPage } from '@/lib/content-pages'
import { getSiteSettings, sitePageTitle } from '@/lib/site-settings'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const settings = await getSiteSettings()
  const page = getContentPage(settings.content_pages, 'butets/alba')
  return { title: sitePageTitle(page.title) }
}

export default async function AlbaPage() {
  const settings = await getSiteSettings()
  const page = getContentPage(settings.content_pages, 'butets/alba')
  return (
    <StructurePageShell page={page} wide>
      <ExecutiveDepartmentsTable data={settings.structure_data} />
    </StructurePageShell>
  )
}
