'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import type { SiteSettings, NavLink } from '@/lib/site-settings'

function isNavActive(pathname: string | null, link: NavLink): boolean {
  if (!pathname) return false
  if (link.href === '/') return pathname === '/'
  if (link.label === 'Спорт') return pathname.startsWith('/sport/v-naadam')
  if (link.href.startsWith('/#')) return false
  if (pathname === link.href || pathname.startsWith(`${link.href}/`)) return true
  return (link.children ?? []).some(child => isNavActive(pathname, child))
}

function NavDropdown({ link, pathname }: { link: NavLink; pathname: string | null }) {
  const active = isNavActive(pathname, link)
  const children = (link.children ?? []).filter(c => !c.hidden)

  return (
    <div className="nav-dropdown">
      <Link href={link.href} className={`nav-dropdown-trigger${active ? ' active' : ''}`}>
        {link.label}
        <svg className="nav-chevron" viewBox="0 0 12 12" width={10} height={10} aria-hidden>
          <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth={1.5} />
        </svg>
      </Link>
      <div className="nav-dropdown-menu">
        {children.map(child => (
          <Link
            key={child.href}
            href={child.href}
            className={isNavActive(pathname, child) ? 'active' : ''}
          >
            {child.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

function MobileNavGroup({
  link,
  pathname,
  onNavigate,
}: {
  link: NavLink
  pathname: string | null
  onNavigate: () => void
}) {
  const [open, setOpen] = useState(isNavActive(pathname, link))
  const children = (link.children ?? []).filter(c => !c.hidden)

  return (
    <div className={`mobile-nav-group${open ? ' open' : ''}`}>
      <div className="mobile-nav-group-head">
        <Link href={link.href} onClick={onNavigate} className={isNavActive(pathname, link) ? 'active' : ''}>
          {link.label}
        </Link>
        <button
          type="button"
          className="mobile-nav-toggle"
          aria-expanded={open}
          aria-label={`${link.label} дэд цэс`}
          onClick={() => setOpen(v => !v)}
        >
          <svg viewBox="0 0 12 12" width={14} height={14} aria-hidden>
            <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth={1.5} />
          </svg>
        </button>
      </div>
      <div className="mobile-nav-children">
        {children.map(child => (
          <Link
            key={child.href}
            href={child.href}
            onClick={onNavigate}
            className={isNavActive(pathname, child) ? 'active' : ''}
          >
            {child.label} <span className="arrow">→</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function PublicNav({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const g = settings.general
  const navLinks = settings.nav_links.filter(l => !l.hidden)
  const logoColor = settings.hero.logoColorPath
  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <div className="utility">
        <div className="wrap-wide utility-row">
          <div className="utility-right" style={{ marginLeft: 'auto' }}>
            <Link href="/contact">Холбоо барих</Link>
            <span className="utility-sep" />
            <Link href="/en">EN</Link>
            <Link href="/" style={{ color: '#0B1426', fontWeight: 700 }}>MN</Link>
          </div>
        </div>
      </div>

      <header className="masthead">
        <div className="wrap-wide mast-row">
          <Link href="/" className="brand">
            <div className="emblem">
              <Image
                src={logoColor || '/logo-color.jpg'}
                alt={g.siteName}
                width={160}
                height={160}
                style={{ objectFit: 'contain' }}
              />
            </div>
            <div className="brand-text">
              <div className="brand-line-2">{g.siteName}</div>
              <div className="brand-line-3">{g.motto}</div>
            </div>
          </Link>
          <div className="mast-meta">
            <div className="mast-meta-item">
              <div className="mast-meta-label">Холбоо барих</div>
              <div className="mast-meta-value">
                <a href={`tel:${g.phone.replace(/\s/g, '')}`}>{g.phone}</a>
              </div>
            </div>
            <div className="mast-meta-item">
              <div className="mast-meta-label">И-мэйл</div>
              <div className="mast-meta-value">
                <a href={`mailto:${g.email}`}>{g.email}</a>
              </div>
            </div>
            <div className="mast-meta-item mast-meta-item--address">
              <div className="mast-meta-label">Хаяг</div>
              <div className="mast-meta-value mast-meta-value--address">{g.address}</div>
            </div>
          </div>
        </div>
      </header>

      <nav className="mainnav">
        <div className="wrap-wide nav-row">
          <div className="nav-links">
            {navLinks.map(link => {
              const children = (link.children ?? []).filter(c => !c.hidden)
              if (children.length > 0) {
                return <NavDropdown key={link.href} link={link} pathname={pathname} />
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={isNavActive(pathname, link) ? 'active' : ''}
                >
                  {link.label}
                </Link>
              )
            })}
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
          </div>
        </div>
      </nav>

      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <div className="mobile-menu-head">
          <Link href="/" className="brand" onClick={closeMenu}>
            <div className="emblem">
              <Image src={logoColor || '/logo-color.jpg'} alt="Лого" width={58} height={58} style={{ objectFit: 'contain' }} />
            </div>
            <div className="brand-text">
              <div className="brand-line-2">{g.siteName}</div>
              <div className="brand-line-3">{g.motto}</div>
            </div>
          </Link>
          <button className="mobile-menu-close" aria-label="Хаах" onClick={closeMenu}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>
        <div className="mobile-menu-links">
          {navLinks.map(link => {
            const children = (link.children ?? []).filter(c => !c.hidden)
            if (children.length > 0) {
              return (
                <MobileNavGroup
                  key={link.href}
                  link={link}
                  pathname={pathname}
                  onNavigate={closeMenu}
                />
              )
            }
            return (
              <Link key={link.href} href={link.href} onClick={closeMenu}>
                {link.label} <span className="arrow">→</span>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="gold-ribbon" />
    </>
  )
}
