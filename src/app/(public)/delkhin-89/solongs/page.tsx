import { ContentPageSection } from '@/components/ContentPageSection'
import { getContentPage } from '@/lib/content-pages'
import { getSiteSettings, sitePageTitle } from '@/lib/site-settings'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const settings = await getSiteSettings()
  const page = getContentPage(settings.content_pages, 'delkhin-89/solongs')
  return { title: sitePageTitle(page.title) }
}

export default async function Page() {
  const settings = await getSiteSettings()
  const page = getContentPage(settings.content_pages, 'delkhin-89/solongs')
  return <ContentPageSection page={page} backHref="/delkhin-89" backLabel="← Дэлхийн 89" />
}
