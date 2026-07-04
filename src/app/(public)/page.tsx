import { getSiteSettings } from '@/lib/site-settings'
import { HomeNewsSectorBlock } from '@/components/home/HomeNewsSectorBlock'
import { HomeNaadamTimeline } from '@/components/home/HomeNaadamTimeline'
import { HomeDepartmentsSection } from '@/components/home/HomeDepartmentsSection'
import { HomePrideStats } from '@/components/home/HomePrideStats'
import { RegionalBranchesSidebar } from '@/components/home/RegionalBranchesSidebar'

export const dynamic = 'force-dynamic'

export default async function OrgHomePage() {
  const settings = await getSiteSettings()
  const sectors = settings.home_news_sectors.filter(s => s.enabled)
  const mainSector = sectors.find(s => s.id === 'news')

  return (
    <div className="home-page-layout">
      <div className="home-page-main">
        {mainSector && (
          <HomeNewsSectorBlock sector={mainSector} articles={settings.news} variant="main" />
        )}

        <HomeNaadamTimeline editions={settings.about.editions} />
        <HomeDepartmentsSection />
        <HomePrideStats />
      </div>

      <RegionalBranchesSidebar />
    </div>
  )
}
