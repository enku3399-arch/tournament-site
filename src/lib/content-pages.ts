import type { ContentPage } from '@/lib/site-settings'

export type ContentPageSlug =
  | 'butets'
  | 'butets/durmiin'
  | 'butets/belegdel'
  | 'butets/alba'
  | 'butets/zovlol'
  | 'butets/baga-khural'
  | 'delkhin-89'
  | 'delkhin-89/amerik'
  | 'delkhin-89/solongs'
  | 'delkhin-89/yapon'
  | 'bakharkhal'
  | 'bakharkhal/aldar'
  | 'bakharkhal/sport'
  | 'bakharkhal/urlag'

export const CONTENT_PAGE_DEFS: Record<ContentPageSlug, ContentPage> = {
  butets: {
    title: 'Бүтэц зохион байгуулалт',
    eyebrow: 'Бүтэц',
    body: 'Төгсөгчдийн холбооны үйл ажиллагааны схем, зохион байгуулалтын бүтэц.',
  },
  'butets/durmiin': {
    title: 'ТББ-ын дүрэм',
    eyebrow: 'Бүтэц зохион байгуулалт',
    body: '2025 оны Төрийн бус байгууллагын дүрэм — 21 бүлэг, агуулга, хүснэгт.',
  },
  'butets/belegdel': {
    title: 'Бэлэгдэл',
    eyebrow: 'Бүтэц зохион байгуулалт',
    body: 'Бэлэгдэл, гишүүнчлэлийн мэдээлэл энд нэмэгдэнэ.',
  },
  'butets/alba': {
    title: 'Гүйцэтгэх алба',
    eyebrow: 'Бүтэц зохион байгуулалт',
    body: 'Гүйцэтгэх захирлын албадын бүрэлдэхүүн, холбоо барих мэдээлэл.',
  },
  'butets/zovlol': {
    title: 'Удирдах зөвлөл',
    eyebrow: 'Бүтэц зохион байгуулалт',
    body: '2025–2026 оны удирдах зөвлөлийн аймаг тус бүрийн төлөөлөгчид.',
  },
  'butets/baga-khural': {
    title: 'Бага хурал',
    eyebrow: 'Бүтэц зохион байгуулалт',
    body: 'Бага хурлын мэдээлэл, шийдвэр энд нэмэгдэнэ.',
  },
  'delkhin-89': {
    title: 'Дэлхийн 89',
    eyebrow: 'Олон улс',
    body: 'Дэлхийн 87/89 төгсөгчдийн холбоо, олон улсын салбаруудын танилцуулга.',
  },
  'delkhin-89/amerik': {
    title: 'Америк дах 89 чүүд',
    eyebrow: 'Дэлхийн 89',
    body: 'Америкид амьдарч буй 87/89 төгсөгчдийн мэдээлэл, үйл ажиллагаа энд нэмэгдэнэ.',
  },
  'delkhin-89/solongs': {
    title: 'Солонгос дах 89 чүүд',
    eyebrow: 'Дэлхийн 89',
    body: 'Солонгост амьдарч буй 87/89 төгсөгчдийн мэдээлэл, үйл ажиллагаа энд нэмэгдэнэ.',
  },
  'delkhin-89/yapon': {
    title: 'Япон дах 89 чүүд',
    eyebrow: 'Дэлхийн 89',
    body: 'Японд амьдарч буй 87/89 төгсөгчдийн мэдээлэл, үйл ажиллагаа энд нэмэгдэнэ.',
  },
  bakharkhal: {
    title: 'Манай бахархал',
    eyebrow: 'Бахархал',
    body: 'Монгол 87/89 төгсөгчдийн холбооны алдар цолтнууд, алдартнуудын танилцуулга.',
  },
  'bakharkhal/aldar': {
    title: 'Алдар цолтнууд',
    eyebrow: 'Манай бахархал',
    body: 'Алдар цолтнуудын жагсаалт, танилцуулга энд нэмэгдэнэ.',
  },
  'bakharkhal/sport': {
    title: 'Спортын алдартнууд',
    eyebrow: 'Манай бахархал',
    body: 'Олон улсын, улсын мастер, олимпийн зэрэглэлтэй тамирчид — аймаг бүрийн жагсаалт.',
  },
  'bakharkhal/urlag': {
    title: 'Урлагын алдартнууд',
    eyebrow: 'Манай бахархал',
    body: 'Урлагын алдартнуудын жагсаалт, амжилт энд нэмэгдэнэ.',
  },
}

export function mergeContentPages(
  raw?: Partial<Record<string, Partial<ContentPage>>> | null,
): Record<string, ContentPage> {
  const out: Record<string, ContentPage> = {}
  for (const [slug, def] of Object.entries(CONTENT_PAGE_DEFS)) {
    const patch = raw?.[slug]
    out[slug] = {
      title: patch?.title?.trim() || def.title,
      eyebrow: patch?.eyebrow?.trim() || def.eyebrow,
      body: patch?.body?.trim() || def.body,
    }
  }
  return out
}

export function getContentPage(
  pages: Record<string, ContentPage>,
  slug: ContentPageSlug,
): ContentPage {
  return pages[slug] ?? CONTENT_PAGE_DEFS[slug]
}

export function contentPath(slug: ContentPageSlug): string {
  return `/${slug}`
}
