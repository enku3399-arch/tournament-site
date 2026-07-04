import type { NewsArticle } from '@/lib/site-settings'
import { sortNewsByDate } from '@/lib/site-settings'

export type HomeNewsSectorId =
  | 'news'
  | 'butets'
  | 'delkhin-89'
  | 'bakharkhal'
  | 'sport'
  | 'urlag'
  | 'buleg'
  | 'gallery'

export interface HomeNewsSector {
  id: HomeNewsSectorId
  label: string
  href: string
  enabled: boolean
  limit: number
  eyebrow: string
}

export const DEFAULT_HOME_NEWS_SECTORS: HomeNewsSector[] = [
  { id: 'news', label: 'Мэдээ', href: '/news', enabled: true, limit: 5, eyebrow: 'Мэдээ · Мэдэгдэл' },
  { id: 'butets', label: 'Бүтэц зохион байгуулалт', href: '/butets', enabled: true, limit: 5, eyebrow: 'Бүтэц' },
  { id: 'delkhin-89', label: 'Дэлхийн 89', href: '/delkhin-89', enabled: true, limit: 5, eyebrow: 'Олон улс' },
  { id: 'bakharkhal', label: 'Манай бахархал', href: '/bakharkhal', enabled: true, limit: 5, eyebrow: 'Бахархал' },
  { id: 'sport', label: 'Спорт', href: '/sport/v-naadam/history', enabled: false, limit: 5, eyebrow: 'V Спорт наадам' },
  { id: 'urlag', label: 'Урлаг', href: '/urlag', enabled: true, limit: 5, eyebrow: 'Урлаг' },
  { id: 'buleg', label: 'Албадууд', href: '/albada', enabled: true, limit: 5, eyebrow: 'Ажлын алба' },
  { id: 'gallery', label: 'Зургийн цомог', href: '/gallery', enabled: false, limit: 5, eyebrow: 'Зураг' },
]

export const HOME_NEWS_SECTOR_OPTIONS: { id: HomeNewsSectorId; label: string }[] =
  DEFAULT_HOME_NEWS_SECTORS.map(s => ({ id: s.id, label: s.label }))

export function getArticleSection(a: NewsArticle): HomeNewsSectorId {
  const s = a.section as HomeNewsSectorId | undefined
  if (s && DEFAULT_HOME_NEWS_SECTORS.some(d => d.id === s)) return s
  return 'news'
}

export function filterNewsBySection(articles: NewsArticle[], sectionId: HomeNewsSectorId): NewsArticle[] {
  return sortNewsByDate(articles.filter(a => getArticleSection(a) === sectionId))
}

export function mergeHomeNewsSectors(raw?: Partial<HomeNewsSector>[] | null): HomeNewsSector[] {
  const byId = new Map(DEFAULT_HOME_NEWS_SECTORS.map(s => [s.id, { ...s }]))
  for (const patch of raw ?? []) {
    if (!patch?.id || !byId.has(patch.id)) continue
    const cur = byId.get(patch.id)!
    byId.set(patch.id, {
      id: cur.id,
      label: patch.label?.trim() || cur.label,
      href: patch.href?.trim() || cur.href,
      enabled: patch.enabled ?? cur.enabled,
      limit: Math.min(12, Math.max(1, patch.limit ?? cur.limit)),
      eyebrow: patch.eyebrow?.trim() || cur.eyebrow,
    })
  }
  return DEFAULT_HOME_NEWS_SECTORS.map(s => byId.get(s.id)!)
}

export interface SectorNewsPick {
  feature: NewsArticle | undefined
  items: NewsArticle[]
  total: number
}

export interface SectorNewsList {
  items: NewsArticle[]
  total: number
}

/** Нэг секторын сүүлийн N мэдээ — жигд жагсаалт */
export function pickSectorNewsList(articles: NewsArticle[], sector: HomeNewsSector): SectorNewsList {
  const pool = sector.id === 'news'
    ? sortNewsByDate(articles)
    : filterNewsBySection(articles, sector.id)
  const limit = sector.limit ?? 5
  return {
    items: pool.slice(0, limit),
    total: pool.length,
  }
}

/** @deprecated pickSectorNewsList ашиглана */
export function pickSectorNews(articles: NewsArticle[], sector: HomeNewsSector): SectorNewsPick {
  const { items, total } = pickSectorNewsList(articles, sector)
  const [feature, ...rest] = items
  return { feature, items: rest, total }
}
