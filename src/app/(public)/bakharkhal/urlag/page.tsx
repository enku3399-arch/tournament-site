import { ContentPageSection } from '@/components/ContentPageSection'
import { getContentPage } from '@/lib/content-pages'
import { getSiteSettings, sitePageTitle } from '@/lib/site-settings'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const settings = await getSiteSettings()
  const page = getContentPage(settings.content_pages, 'bakharkhal/urlag')
  return { title: sitePageTitle(page.title) }
}

export default async function Page() {
  const settings = await getSiteSettings()
  const page = getContentPage(settings.content_pages, 'bakharkhal/urlag')
  return <ContentPageSection page={page} backHref="/bakharkhal" backLabel="← Манай бахархал" />
}
