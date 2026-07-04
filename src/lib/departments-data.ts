import type { ContentPage } from '@/lib/site-settings'

export type DepartmentSlug =
  | 'eruul-mend'
  | 'niigmiin-khariltsaa'
  | 'bolovsrol'
  | 'biznes'
  | 'gadaad-aylal'
  | 'biyin-tamir'
  | 'soyol-urlag'
  | 'medee-surtalchilgaa'

export interface DepartmentDef {
  slug: DepartmentSlug
  icon: string
  label: string
  title: string
  body: string
}

export const DEPARTMENTS: DepartmentDef[] = [
  {
    slug: 'eruul-mend',
    icon: '🏥',
    label: 'Эрүүл мэндийн ажлын алба',
    title: 'Эрүүл мэндийн ажлын алба',
    body: 'Гишүүн төгсөгчдийн эрүүл мэндийн салбарын судалгаа хийж, хамтын ажиллагааг ханган, үзлэг оношилгоо, сургалт семинар болон төсөл хөтөлбөрүүдийг зохион байгуулна.',
  },
  {
    slug: 'niigmiin-khariltsaa',
    icon: '🤝',
    label: 'Нийгмийн харилцааны ажлын алба',
    title: 'Нийгмийн харилцааны ажлын алба',
    body: 'Нийгмийн хариуцлагын төсөл хөтөлбөрүүдийг хэрэгжүүлж, сурталчилгаа явуулж, гишүүд байгалийн давтагдашгүй хүчин зүйлд өртсөн үед тусламж дэмжлэгийн аян зохион байгуулна.',
  },
  {
    slug: 'bolovsrol',
    icon: '📚',
    label: 'Боловсрол, сургалтын ажлын алба',
    title: 'Боловсрол, сургалтын ажлын алба',
    body: 'Боловсролын салбарын судалгаа гаргаж, соён гэгээрүүлэх үйл ажиллагаанд хамтран ажиллаж, гишүүдэд шаардлагатай сургалт хөтөлбөр хэрэгжүүлж, хүүхдүүдийг тэтгэлэгтэй сургуулиудад зуучлах зөвлөгөө өгнө.',
  },
  {
    slug: 'biznes',
    icon: '💼',
    label: 'Бизнес хөгжүүлэлтийн ажлын алба',
    title: 'Бизнес хөгжүүлэлтийн ажлын алба',
    body: 'Гишүүдийг бизнес уулзалт, үзэсгэлэн худалдаанд оролцуулах ажлыг зохион байгуулж, ЖДҮ-ийн холбоод болон төрийн байгууллагуудтай хамтран ажиллахад зөвлөж дэмжинэ.',
  },
  {
    slug: 'gadaad-aylal',
    icon: '✈️',
    label: 'Гадаад харилцаа, аялал жуулчлалын ажлын алба',
    title: 'Гадаад харилцаа, аялал жуулчлалын ажлын алба',
    body: 'Гишүүдийг гадаадын ижил төстэй холбоо, байгууллагуудтай холбож хамтын ажиллагаанд дэмжлэг үзүүлж, гадаад болон дотоод аяллыг зохион байгуулж гишүүдээ хамруулна.',
  },
  {
    slug: 'biyin-tamir',
    icon: '🏆',
    label: 'Биеийн тамир спортын ажлын алба',
    title: 'Биеийн тамир спортын ажлын алба',
    body: 'Олон улсын болон нийслэл, аймаг сумдаас зохион байгуулж буй тэмцээн уралдаанд гишүүдийг хамруулж бэлтгэн дасгалжуулж, нийтийн биеийн тамирын арга хэмжээнүүд зохион байгуулна.',
  },
  {
    slug: 'soyol-urlag',
    icon: '🎭',
    label: 'Соёл урлагийн ажлын алба',
    title: 'Соёл урлагийн ажлын алба',
    body: 'Нийслэл, аймаг сумдаас зохион байгуулж буй арга хэмжээ, тэмцээн уралдаан болон ТББ-ын хэмжээний соёл урлагийн арга хэмжээг зохион байгуулж гишүүдийг өргөнөөр оролцуулна.',
  },
  {
    slug: 'medee-surtalchilgaa',
    icon: '📢',
    label: 'Мэдээлэл, сурталчилгаа идэвхжүүлэлтийн алба',
    title: 'Мэдээлэл, сурталчилгаа идэвхжүүлэлтийн алба',
    body: 'ТББ-ын талаарх мэдээллийг гишүүдэд хүргэж түгээж, зохион байгуулж болон хамтран хэрэгжүүлж буй төсөл хөтөлбөрүүдийг сурталчлан оролцоог нэмэгдүүлэхэд дэмжлэг үзүүлнэ.',
  },
]

export const ALBADA_BASE = '/albada'

export const ALBADA_NAV_CHILDREN = DEPARTMENTS.map(d => ({
  href: `${ALBADA_BASE}/${d.slug}`,
  label: d.label,
}))

export function departmentHref(slug: DepartmentSlug): string {
  return `${ALBADA_BASE}/${slug}`
}

export function getDepartment(slug: string): DepartmentDef | undefined {
  return DEPARTMENTS.find(d => d.slug === slug)
}

export function departmentContentPage(def: DepartmentDef): ContentPage {
  return {
    title: def.title,
    eyebrow: 'Албадууд',
    body: def.body,
  }
}

export const ALBADA_INDEX_PAGE: ContentPage = {
  title: 'Албадууд',
  eyebrow: 'ТББ-ын дүрэм · 16.3',
  body: 'Гүйцэтгэх захирлын албадын үйл ажиллагааны чиглэл, үүрэг — Төрийн бус байгууллагын дүрмийн 16.3-д заасан ажлын албуд.',
}

export function mergeDepartmentContentPages(
  raw?: Partial<Record<string, Partial<ContentPage>>> | null,
): Record<string, ContentPage> {
  const out: Record<string, ContentPage> = {
    albada: { ...ALBADA_INDEX_PAGE, ...raw?.albada },
  }
  for (const d of DEPARTMENTS) {
    const key = `albada/${d.slug}`
    const patch = raw?.[key]
    const base = departmentContentPage(d)
    out[key] = {
      title: patch?.title?.trim() || base.title,
      eyebrow: patch?.eyebrow?.trim() || base.eyebrow,
      body: patch?.body?.trim() || base.body,
    }
  }
  return out
}
