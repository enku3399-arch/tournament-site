import Link from 'next/link'
import { naadam } from '@/lib/routes'

const SUB_LINKS = [
  { href: naadam.home, label: 'Нүүр' },
  { href: naadam.schedule, label: 'Хөтөлбөр' },
  { href: naadam.matches, label: 'Тоглолт' },
  { href: naadam.groups, label: 'Хэсэг' },
  { href: naadam.results, label: 'Үр дүн' },
  { href: naadam.medals, label: 'Медаль' },
  { href: naadam.live, label: 'Шууд' },
  { href: naadam.register, label: 'Бүртгэл' },
  { href: naadam.about, label: 'Тухай' },
  { href: naadam.history, label: 'Түүх' },
]

export default function NaadamLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div style={{
        background: '#060c1a',
        borderBottom: '1px solid var(--line)',
        overflowX: 'auto',
      }}>
        <div className="wrap-wide" style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '10px 0', minWidth: 'max-content',
        }}>
          <Link href="/sport" style={{
            fontFamily: 'var(--display)', fontSize: 10, fontWeight: 700,
            letterSpacing: '.14em', textTransform: 'uppercase',
            color: 'var(--gold)', padding: '6px 12px', whiteSpace: 'nowrap',
            textDecoration: 'none', marginRight: 8,
          }}>
            ← Спорт
          </Link>
          <span style={{
            fontFamily: 'var(--display)', fontSize: 10, fontWeight: 700,
            letterSpacing: '.14em', textTransform: 'uppercase',
            color: 'var(--paper)', padding: '6px 12px', whiteSpace: 'nowrap',
            borderRight: '1px solid var(--line)', marginRight: 4,
          }}>
            V Спорт наадам
          </span>
          {SUB_LINKS.map(l => (
            <Link key={l.href} href={l.href} style={{
              fontFamily: 'var(--display)', fontSize: 10, fontWeight: 600,
              letterSpacing: '.12em', textTransform: 'uppercase',
              color: 'var(--fog)', padding: '6px 10px', whiteSpace: 'nowrap',
              textDecoration: 'none',
            }}>
              {l.label}
            </Link>
          ))}
        </div>
      </div>
      {children}
    </>
  )
}
