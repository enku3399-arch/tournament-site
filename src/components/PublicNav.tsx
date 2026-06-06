'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import type { SiteSettings } from '@/lib/site-settings'

export function PublicNav({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const g = settings.general
  const navLinks = settings.nav_links
  const logoColor = settings.hero.logoColorPath
  const logoWhite = settings.hero.logoWhitePath

  return (
    <>
      {/* ── UTILITY BAR ─────────────────────────────────────────── */}
      <div className="utility">
        <div className="wrap-wide utility-row">
          <div className="utility-left">
            <span className="live-dot">Шууд дамжуулалт</span>
            <span className="utility-sep" />
            <span>{g.dateDisplay} · "Буянт Ухаа"</span>
          </div>
          <div className="utility-right">
            <Link href="/press">Хэвлэлийн өрөө</Link>
            <span className="utility-sep" />
            <Link href="/contact">Холбоо барих</Link>
            <span className="utility-sep" />
            <Link href="/en">EN</Link>
            <Link href="/" style={{ color: '#0B1426', fontWeight: 700 }}>MN</Link>
          </div>
        </div>
      </div>

      {/* ── MASTHEAD ─────────────────────────────────────────────── */}
      <header className="masthead">
        <div className="wrap-wide mast-row">
          <Link href="/" className="brand">
            <div className="emblem">
              <Image
                src={logoColor || '/logo-color.png'}
                alt={g.siteName}
                width={64}
                height={64}
                style={{ objectFit: 'contain' }}
              />
            </div>
            <div className="brand-text">
              <div className="brand-line-1">Монгол 87/89 Төгсөгчдийн Холбоо ГҮТББ</div>
              <div className="brand-line-2">{g.edition} Спорт Наадам · {g.year}</div>
              <div className="brand-line-3">{g.motto}</div>
            </div>
          </Link>
          <div className="mast-meta">
            <div className="mast-meta-item">
              <div className="mast-meta-label">Огноо</div>
              <div className="mast-meta-value">{g.dateDisplay}</div>
            </div>
            <div className="mast-meta-item">
              <div className="mast-meta-label">Байршил</div>
              <div className="mast-meta-value">{g.venueAddress}</div>
            </div>
            <div className="mast-meta-item">
              <div className="mast-meta-label">Зохион байгуулагч аймгууд</div>
              <div className="mast-meta-value" style={{ whiteSpace: 'pre-line' }}>
                {g.hostAimags.replace(' · ', ' ·\n')}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN NAV ─────────────────────────────────────────────── */}
      <nav className="mainnav">
        <div className="wrap-wide nav-row">
          <div className="nav-links">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={pathname === href ? 'active' : ''}
              >
                {label}
              </Link>
            ))}
          </div>
          <div className="nav-cta">
            <button
              className="menu-toggle"
              aria-label="Цэс"
              onClick={() => setMenuOpen(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={20} height={20}>
                <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="square" />
              </svg>
            </button>
            <Link href="/register" className="nav-btn primary">Бүртгүүлэх →</Link>
          </div>
        </div>
      </nav>

      {/* ── MOBILE MENU ──────────────────────────────────────────── */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <div className="mobile-menu-head">
          <Link href="/" className="brand" onClick={() => setMenuOpen(false)}>
            <div className="emblem">
              <Image src={logoColor || '/logo-color.png'} alt="Лого" width={50} height={50} style={{ objectFit: 'contain' }} />
            </div>
            <div className="brand-text">
              <div className="brand-line-1">Монгол 87/89 ГҮТББ</div>
              <div className="brand-line-2">{g.edition} Спорт Наадам</div>
            </div>
          </Link>
          <button className="mobile-menu-close" aria-label="Хаах" onClick={() => setMenuOpen(false)}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>
        <div className="mobile-menu-links">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)}>
              {label} <span className="arrow">→</span>
            </Link>
          ))}
        </div>
        <div className="mobile-menu-foot">
          <Link href="/register" className="btn-primary" onClick={() => setMenuOpen(false)}>
            Бүртгүүлэх →
          </Link>
          <Link href="/results" className="btn-ghost" onClick={() => setMenuOpen(false)}>
            Шууд дамжуулалт ▷
          </Link>
        </div>
      </div>

      {/* ── GOLD RIBBON ──────────────────────────────────────────── */}
      <div className="gold-ribbon" />
    </>
  )
}
