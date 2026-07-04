import Link from 'next/link'
import type { AboutEdition } from '@/lib/site-settings'
import { naadam } from '@/lib/routes'

export function HomeNaadamTimeline({ editions }: { editions: AboutEdition[] }) {
  if (!editions.length) return null

  return (
    <section className="home-stats-panel home-timeline-section">
      <div className="wrap-wide">
        <div className="home-stats-panel-head">
          <div>
            <span className="home-stats-panel-eyebrow">V Спорт наадам</span>
            <h2 className="home-stats-panel-title">
              Спорт наадмын <span>түүх</span>
            </h2>
          </div>
          <Link href={naadam.history} className="home-stats-panel-link">
            Бүгдийг үзэх →
          </Link>
        </div>

        <div className="home-stats-strip">
          {editions.map(ed => (
            <Link
              key={ed.num}
              href={ed.current ? naadam.home : naadam.history}
              className={`home-stats-strip-cell home-timeline-cell${ed.current ? ' current' : ''}`}
            >
              <div className="home-stats-strip-num">{ed.num}</div>
              <div className="home-stats-strip-label">{ed.year}</div>
              <div className="home-stats-strip-sub">{ed.city}</div>
              {ed.current && <span className="home-timeline-current">Одоогийн</span>}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
