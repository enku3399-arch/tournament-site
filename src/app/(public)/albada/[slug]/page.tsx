import { notFound } from 'next/navigation'
import { AlbadaPageShell } from '@/components/albada/AlbadaPageShell'
import { DEPARTMENTS, departmentContentPage, getDepartment } from '@/lib/departments-data'
import { getSiteSettings, sitePageTitle } from '@/lib/site-settings'

export const dynamic = 'force-dynamic'

export function generateStaticParams() {
  return DEPARTMENTS.map(d => ({ slug: d.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const dept = getDepartment(slug)
  if (!dept) return { title: sitePageTitle('Албадууд') }
  const settings = await getSiteSettings()
  const page = settings.content_pages[`albada/${slug}`] ?? departmentContentPage(dept)
  return { title: sitePageTitle(page.title) }
}

export default async function DepartmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const dept = getDepartment(slug)
  if (!dept) notFound()

  const settings = await getSiteSettings()
  const page = settings.content_pages[`albada/${slug}`] ?? departmentContentPage(dept)

  return <AlbadaPageShell page={page} />
}
