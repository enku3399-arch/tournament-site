import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSiteSettings } from '@/lib/site-settings'
import ShareButton from '@/components/ShareButton'

export const dynamic = 'force-dynamic'

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const settings = await getSiteSettings()
  const article = settings.news.find(a => a.id === id)

  if (!article) notFound()

  const others = settings.news.filter(a => a.id !== id).slice(0, 3)

  return (
    <>
      {/* back nav */}
      <div className="section" style={{ padding: '28px 0 0' }}>
        <div className="wrap-wide">
          <Link href="/news" className="section-action" style={{ fontSize: 13 }}>← Мэдээнд буцах</Link>
        </div>
      </div>

      {/* hero image */}
      {article.imagePath && (
        <div style={{ width: '100%', maxHeight: 480, overflow: 'hidden', marginTop: 24 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.imagePath}
            alt={article.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', maxHeight: 480 }}
          />
        </div>
      )}

      {/* article content */}
      <section className="section" style={{ paddingTop: article.imagePath ? 32 : 24 }}>
        <div className="wrap-wide" style={{ maxWidth: 800 }}>
          {/* tag */}
          <span style={{
            display: 'inline-block',
            fontFamily: 'var(--display)', textTransform: 'uppercase', letterSpacing: '.14em',
            fontSize: 10, fontWeight: 600, padding: '5px 12px',
            background: article.tagColor === 'red' ? 'var(--red)' : 'var(--gold)',
            color: article.tagColor === 'red' ? 'var(--paper)' : 'var(--ink)',
            marginBottom: 16,
          }}>
            {article.tag}
          </span>

          <h1 style={{
            fontFamily: 'var(--display)', fontSize: 'clamp(24px, 4vw, 40px)',
            fontWeight: 700, textTransform: 'uppercase', lineHeight: 1.1,
            letterSpacing: '.005em', color: 'var(--paper)', margin: '0 0 20px',
          }}>
            {article.title}
          </h1>

          <div className="news-meta" style={{ marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid var(--line)' }}>
            <span>{article.date}</span>
            <span className="dot" />
            <span>{article.author}</span>
          </div>

          {article.excerpt && (
            <p style={{
              fontSize: 17, color: 'var(--fog)', lineHeight: 1.75, marginBottom: 32,
              borderLeft: '3px solid var(--gold)', paddingLeft: 20,
            }}>
              {article.excerpt}
            </p>
          )}

          {article.facebookUrl && (
            <div style={{ marginBottom: 32, borderRadius: 8, overflow: 'hidden' }}>
              <iframe
                src={`https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(article.facebookUrl)}&show_text=true&width=680`}
                width="100%"
                height="560"
                style={{ border: 'none', overflow: 'hidden', borderRadius: 8 }}
                scrolling="no"
                frameBorder="0"
                allowTransparency={true}
                allow="encrypted-media"
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: 16, alignItems: 'center', paddingTop: 24, borderTop: '1px solid var(--line)' }}>
            <ShareButton label="Хуваалцах" />
            <Link href="/news" className="section-action" style={{ fontSize: 14 }}>← Бусад мэдээ</Link>
          </div>
        </div>
      </section>

      {/* related articles */}
      {others.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap-wide">
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 40, marginTop: 8 }}>
              <h2 className="section-title" style={{ fontSize: 20, marginBottom: 24 }}>
                Бусад <span className="gold">мэдээ</span>
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                {others.map(n => (
                  <Link key={n.id} href={`/news/${n.id}`} className="news-card compact" style={{ display: 'block', textDecoration: 'none' }}>
                    <div
                      className="news-image"
                      style={{
                        aspectRatio: '16/9',
                        ...(n.imagePath ? { backgroundImage: `url(${n.imagePath})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}),
                      }}
                    >
                      <span className={`news-tag${n.tagColor === 'red' ? ' red' : ''}`}>{n.tag}</span>
                    </div>
                    <div className="news-body" style={{ padding: '14px 18px 18px' }}>
                      <div className="news-meta"><span>{n.date}</span><span className="dot" /><span>{n.author}</span></div>
                      <h3 className="news-title" style={{ fontSize: 15, lineHeight: 1.35, marginTop: 6 }}>{n.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
