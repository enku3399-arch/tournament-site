import Image from 'next/image'
import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { PublicNav } from '@/components/PublicNav'
import { getSiteSettings } from '@/lib/site-settings'

export const dynamic = 'force-dynamic'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()

  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? '/'
  const isHidden = settings.nav_links.some(l => l.hidden && l.href === pathname)
  if (isHidden) notFound()
  const g = settings.general
  const logoWhite = settings.hero.logoWhitePath

  return (
    <>
      <PublicNav settings={settings} />

      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="footer">
        <div className="wrap-wide footer-top">
          <div className="footer-brand brand" style={{ alignItems: 'flex-start' }}>
            <div className="emblem">
              <Image src={logoWhite || '/logo-white.jpg'} alt="Лого" width={80} height={80} style={{ objectFit: 'contain' }} />
            </div>
            <div className="brand-text">
              <div className="brand-line-2" style={{ color: 'var(--paper)' }}>{g.siteName}</div>
              <p>{g.motto}</p>
            </div>
          </div>
          <div className="footer-col">
            <h4>{settings.footer_nav.col1.title}</h4>
            <ul>
              {settings.footer_nav.col1.links.map(l => (
                <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>{settings.footer_nav.col2.title}</h4>
            <ul>
              {settings.footer_nav.col2.links.map(l => (
                <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Холбоо барих</h4>
            <ul>
              <li><a href={`tel:${g.phone.replace(/\s/g, '')}`}>{g.phone}</a></li>
              <li><a href={`mailto:${g.email}`}>{g.email}</a></li>
              <li>{g.address}</li>
              {g.facebook && <li><a href={g.facebook} target="_blank" rel="noopener noreferrer">Facebook</a></li>}
              {g.youtube  && <li><a href={g.youtube}  target="_blank" rel="noopener noreferrer">YouTube</a></li>}
            </ul>
          </div>
        </div>
        <div className="wrap-wide footer-bottom">
          <span>© {g.year} {g.siteName}. Бүх эрх хуулиар хамгаалагдсан.</span>
          <span>{g.address.split(',')[0]}</span>
        </div>
      </footer>
    </>
  )
}
