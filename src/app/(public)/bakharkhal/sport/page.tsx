import { BakharkhalPageShell } from '@/components/pride/BakharkhalPageShell'
import { SportStarsGrid } from '@/components/pride/SportStarsGrid'
import { getContentPage } from '@/lib/content-pages'
import { getSiteSettings, sitePageTitle } from '@/lib/site-settings'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const settings = await getSiteSettings()
  const page = getContentPage(settings.content_pages, 'bakharkhal/sport')
  return { title: sitePageTitle(page.title) }
}

export default async function SportStarsPage() {
  const settings = await getSiteSettings()
  const page = getContentPage(settings.content_pages, 'bakharkhal/sport')
  return (
    <BakharkhalPageShell page={page} wide>
      <SportStarsGrid groups={settings.sport_star_groups} />
    </BakharkhalPageShell>
  )
}
