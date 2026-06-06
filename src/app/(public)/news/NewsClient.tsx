'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { NewsArticle, NewsTag } from '@/lib/site-settings'
import ShareButton from '@/components/ShareButton'

export default function NewsClient({ articles, tags }: { articles: NewsArticle[]; tags: NewsTag[] }) {
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const filtered = activeTag ? articles.filter(a => a.tag === activeTag) : articles
  const feature = filtered.find(a => a.feature) ?? filtered[0]
  const rest = filtered.filter(a => a.id !== feature?.id)

  const usedTags = tags.filter(t => articles.some(a => a.tag === t.label))

  return (
    <>
      {/* Tag filter pills */}
      {usedTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
          <button
            onClick={() => setActiveTag(null)}
            style={{
              fontFamily: 'var(--display)', textTransform: 'uppercase', letterSpacing: '.1em',
              fontSize: 10, fontWeight: 600, padding: '6px 14px',
              border: '1px solid',
              borderColor: !activeTag ? 'var(--gold)' : 'var(--line)',
              background: !activeTag ? 'var(--gold)' : 'transparent',
              color: !activeTag ? 'var(--ink)' : 'var(--fog)',
              cursor: 'pointer', transition: 'all .15s',
            }}
          >
            Бүгд · {articles.length}
          </button>
          {usedTags.map(t => {
            const count = articles.filter(a => a.tag === t.label).length
            const isActive = activeTag === t.label
            return (
              <button
                key={t.id}
                onClick={() => setActiveTag(isActive ? null : t.label)}
                style={{
                  fontFamily: 'var(--display)', textTransform: 'uppercase', letterSpacing: '.1em',
                  fontSize: 10, fontWeight: 600, padding: '6px 14px',
                  border: '1px solid',
                  borderColor: isActive ? (t.color === 'red' ? 'var(--red)' : 'var(--gold)') : 'var(--line)',
                  background: isActive ? (t.color === 'red' ? 'var(--red)' : 'var(--gold)') : 'transparent',
                  color: isActive ? (t.color === 'red' ? 'var(--paper)' : 'var(--ink)') : 'var(--fog)',
                  cursor: 'pointer', transition: 'all .15s',
                }}
              >
                {t.label} · {count}
              </button>
            )
          })}
        </div>
      )}

      {/* Feature + sidebar */}
      {feature && (
        <div className="news-grid" style={{ marginBottom: 48 }}>
          {/* Feature card */}
          <Link href={`/news/${feature.id}`} className="news-card feature" style={{ textDecoration: 'none' }}>
            <div className="news-image" style={feature.imagePath ? { backgroundImage: `url(${feature.imagePath})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
              <span className={`news-tag${feature.tagColor === 'red' ? ' red' : ''}`}>{feature.tag}</span>
            </div>
            <div className="news-body">
              <div className="news-meta">
                <span>{feature.date}</span>
                <span className="dot" />
                <span>{feature.author}</span>
              </div>
              <h2 className="news-title">{feature.title}</h2>
              {feature.excerpt && <p className="news-excerpt">{feature.excerpt}</p>}
              <div style={{ marginTop: 20 }}>
                <span style={{
                  display: 'inline-block',
                  fontFamily: 'var(--display)', textTransform: 'uppercase', letterSpacing: '.1em',
                  fontSize: 11, fontWeight: 600, padding: '8px 20px',
                  background: 'var(--gold)', color: 'var(--ink)', cursor: 'pointer',
                }}>
                  Дэлгэрэнгүй →
                </span>
              </div>
            </div>
          </Link>

          {/* Side stack */}
          <div className="news-stack">
            {rest.slice(0, 4).map(n => (
              <Link key={n.id} href={`/news/${n.id}`} className="news-card compact" style={{ textDecoration: 'none', display: 'block' }}>
                <div className="news-compact">
                  <div className="news-image" style={n.imagePath ? { backgroundImage: `url(${n.imagePath})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
                    <span className={`news-tag${n.tagColor === 'red' ? ' red' : ''}`}>{n.tag}</span>
                  </div>
                  <div className="news-body">
                    <div className="news-meta">
                      <span>{n.date}</span>
                      <span className="dot" />
                      <span>{n.author}</span>
                    </div>
                    <h3 className="news-title">{n.title}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Remaining articles */}
      {rest.slice(4).length > 0 && (
        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 40 }}>
          <h2 className="section-title" style={{ fontSize: 22, marginBottom: 28 }}>
            Бусад <span className="gold">мэдээ</span>
          </h2>
          <div style={{ display: 'grid', gap: 16 }}>
            {rest.slice(4).map(n => (
              <Link key={n.id} href={`/news/${n.id}`} className="news-card"
                style={{ display: 'grid', gridTemplateColumns: '180px 1fr', overflow: 'hidden', textDecoration: 'none' }}>
                <div className="news-image" style={{ aspectRatio: '16/9', ...(n.imagePath ? { backgroundImage: `url(${n.imagePath})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}) }}>
                  <span className={`news-tag${n.tagColor === 'red' ? ' red' : ''}`}>{n.tag}</span>
                </div>
                <div className="news-body" style={{ padding: '16px 24px' }}>
                  <div className="news-meta">
                    <span>{n.date}</span>
                    <span className="dot" />
                    <span>{n.author}</span>
                  </div>
                  <h3 className="news-title" style={{ fontSize: 18 }}>{n.title}</h3>
                  {n.excerpt && <p className="news-excerpt" style={{ fontSize: 13, marginTop: 8 }}>{n.excerpt}</p>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--fog)', fontFamily: 'var(--display)', letterSpacing: '.08em', textTransform: 'uppercase', fontSize: 13 }}>
          Энэ тагтай мэдээ байхгүй байна
        </div>
      )}
    </>
  )
}
