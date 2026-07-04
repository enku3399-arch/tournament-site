'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ALBADA_BASE, DEPARTMENTS, departmentHref } from '@/lib/departments-data'

export function AlbadaSubnav() {
  const pathname = usePathname()

  return (
    <nav className="butets-subnav" aria-label="Албадууд дэд цэс">
      <Link href={ALBADA_BASE} className={pathname === ALBADA_BASE ? 'active' : ''}>
        Бүгд
      </Link>
      {DEPARTMENTS.map(d => {
        const href = departmentHref(d.slug)
        return (
          <Link key={d.slug} href={href} className={pathname === href ? 'active' : ''}>
            {d.label}
          </Link>
        )
      })}
    </nav>
  )
}
