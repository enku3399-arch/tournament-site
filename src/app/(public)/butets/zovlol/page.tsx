import { StructurePageShell } from '@/components/structure/StructurePageShell'
import { BoardMembersGrid } from '@/components/structure/BoardMembersGrid'
import { getContentPage } from '@/lib/content-pages'
import { getSiteSettings, sitePageTitle } from '@/lib/site-settings'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const settings = await getSiteSettings()
  const page = getContentPage(settings.content_pages, 'butets/zovlol')
  return { title: sitePageTitle(page.title) }
}

export default async function ZovlolPage() {
  const settings = await getSiteSettings()
  const page = getContentPage(settings.content_pages, 'butets/zovlol')
  return (
    <StructurePageShell page={page} wide>
      <BoardMembersGrid data={settings.structure_data} />
    </StructurePageShell>
  )
}
