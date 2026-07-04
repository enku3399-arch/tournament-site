import Link from 'next/link'
import { DEPARTMENTS, departmentHref } from '@/lib/departments-data'
import { ROUTES } from '@/lib/routes'
import { SITE_BRAND } from '@/lib/site-settings'

export function HomeDepartmentsSection() {
  return (
    <section className="section home-departments-section">
      <div className="wrap-wide">
        <div className="section-header">
          <div>
            <span className="eyebrow">ТББ-ын дүрэм · 16.3</span>
            <h2 className="section-title">
              {SITE_BRAND} <span className="gold">албадууд</span>
            </h2>
          </div>
          <Link href={ROUTES.departments} className="section-action">
            Бүгдийг үзэх →
          </Link>
        </div>

        <div className="home-dept-grid">
          {DEPARTMENTS.map(d => (
            <Link key={d.slug} href={departmentHref(d.slug)} className="home-dept-square">
              <span className="home-dept-icon" aria-hidden>{d.icon}</span>
              <span className="home-dept-square-title">{d.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
