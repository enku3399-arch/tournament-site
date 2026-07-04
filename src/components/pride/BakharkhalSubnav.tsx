'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BAKHARKHAL_SUBNAV } from '@/lib/pride-nav'

export function BakharkhalSubnav() {
  const pathname = usePathname()

  return (
    <nav className="butets-subnav" aria-label="Манай бахархал дэд цэс">
      {BAKHARKHAL_SUBNAV.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={pathname === item.href ? 'active' : ''}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
