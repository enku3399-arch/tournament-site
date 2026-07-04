import Link from 'next/link'
import type { NewsArticle } from '@/lib/site-settings'
import { getArticleCover } from '@/lib/site-settings'
import type { HomeNewsSector } from '@/lib/home-news-sectors'
import { pickSectorNewsList } from '@/lib/home-news-sectors'
import { ROUTES } from '@/lib/routes'

export function HomeNewsSectorBlock({
  sector,
  articles,
  variant = 'sector',
}: {
  sector: HomeNewsSector
  articles: NewsArticle[]
  variant?: 'main' | 'sector'
}) {
  const { items, total } = pickSectorNewsList(articles, sector)
  if (items.length === 0) return null

  const isMain = variant === 'main'

  return (
    <section className={`section home-news-sector${isMain ? ' home-news-main' : ''}`} style={isMain ? undefined : { background: 'var(--bone)' }}>
      <div className="wrap-wide">
        <div className="section-header">
          <div>
            <span className="eyebrow" style={isMain ? undefined : { color: 'var(--fog)' }}>{sector.eyebrow}</span>
            <h2 className="section-title" style={isMain ? undefined : { color: 'var(--ink)' }}>
              {isMain ? (
                <>Сүүлийн <span className="gold">мэдээ</span></>
              ) : (
                sector.label
              )}
            </h2>
          </div>
          <Link href={sector.href} className="section-action">
            Бүгдийг үзэх →
          </Link>
        </div>

        <div className="home-sector-grid">
          {items.map(n => (
            <Link
              key={n.id}
              href={`${ROUTES.news}/${n.id}`}
              className="home-sector-card"
            >
              <div
                className="home-sector-image"
                style={getArticleCover(n) ? {
                  backgroundImage: `url(${getArticleCover(n)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                } : undefined}
              >
                <span className={`news-tag${n.tagColor === 'red' ? ' red' : ''}`}>{n.tag}</span>
              </div>
              <div className="home-sector-body">
                <div className="news-meta">
                  <span>{n.date}</span>
                  <span className="dot" />
                  <span>{n.author}</span>
                </div>
                <h3 className="home-sector-title">{n.title}</h3>
              </div>
            </Link>
          ))}
        </div>

        {total > items.length && (
          <p className="home-sector-more">
            <Link href={sector.href}>+ {total - items.length} мэдээ илүү</Link>
          </p>
        )}
      </div>
    </section>
  )
}
