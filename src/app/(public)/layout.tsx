import Image from 'next/image'
import Link from 'next/link'
import { PublicNav } from '@/components/PublicNav'
import { getSiteSettings } from '@/lib/site-settings'

export const dynamic = 'force-dynamic'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()
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
              <Image src={logoWhite || '/logo-white.png'} alt="Лого" width={64} height={64} style={{ objectFit: 'contain' }} />
            </div>
            <div className="brand-text">
              <div className="brand-line-1" style={{ color: 'var(--gold)' }}>Монгол-87/89 ГҮТББ</div>
              <div className="brand-line-2" style={{ color: 'var(--paper)' }}>{g.edition} Спорт Наадам</div>
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
              <li>{g.phone}</li>
              <li>{g.email}</li>
              <li>{g.address}</li>
              {g.facebook && <li><a href={g.facebook} target="_blank" rel="noopener noreferrer">Facebook</a></li>}
              {g.youtube  && <li><a href={g.youtube}  target="_blank" rel="noopener noreferrer">YouTube</a></li>}
            </ul>
          </div>
        </div>
        <div className="wrap-wide footer-bottom">
          <span>© {g.year} Монгол-87/89 ГҮТББ. Бүх эрх хуулиар хамгаалагдсан.</span>
          <span>Улаанбаатар хот</span>
        </div>
      </footer>
    </>
  )
}
