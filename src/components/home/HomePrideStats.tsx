import Link from 'next/link'
import { DEFAULT_HOME_PRIDE_STATS } from '@/lib/home-pride-stats'
import { ROUTES } from '@/lib/routes'

export function HomePrideStats() {
  return (
    <section className="home-stats-panel home-pride-section">
      <div className="wrap-wide">
        <div className="home-stats-panel-head">
          <div>
            <span className="home-stats-panel-eyebrow">Бахархал</span>
            <h2 className="home-stats-panel-title">
              Манай <span>бахархал</span>
            </h2>
          </div>
          <Link href={ROUTES.pride} className="home-stats-panel-link">
            Дэлгэрэнгүй →
          </Link>
        </div>

        <div className="home-stats-strip">
          {DEFAULT_HOME_PRIDE_STATS.map(({ num, plus, label }) => (
            <div key={label} className="home-stats-strip-cell">
              <div className="home-stats-strip-num">
                {num}{plus && <span className="plus">+</span>}
              </div>
              <div className="home-stats-strip-label" style={{ whiteSpace: 'pre-line' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
