import { StructurePageShell } from '@/components/structure/StructurePageShell'
import { CharterDocumentView } from '@/components/structure/CharterDocumentView'
import { getContentPage } from '@/lib/content-pages'
import { getSiteSettings, sitePageTitle } from '@/lib/site-settings'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const settings = await getSiteSettings()
  const page = getContentPage(settings.content_pages, 'butets/durmiin')
  return { title: sitePageTitle(page.title) }
}

export default async function DurmiinPage() {
  const settings = await getSiteSettings()
  const page = getContentPage(settings.content_pages, 'butets/durmiin')
  return (
    <StructurePageShell page={page} wide>
      <CharterDocumentView document={settings.charter_document} />
    </StructurePageShell>
  )
}
