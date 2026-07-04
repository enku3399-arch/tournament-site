'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BUTETS_SUBNAV } from '@/lib/structure-data'

export function ButetsSubnav() {
  const pathname = usePathname()

  return (
    <nav className="butets-subnav" aria-label="Бүтцийн дэд цэс">
      {BUTETS_SUBNAV.map(item => {
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={active ? 'active' : ''}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
