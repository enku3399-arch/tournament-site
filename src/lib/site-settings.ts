import { createServiceClient } from '@/lib/supabase-server'
import { AIMAG_LOGO } from '@/lib/aimag-logo'
import { mergeContentPages } from '@/lib/content-pages'
import { mergeDepartmentContentPages, ALBADA_NAV_CHILDREN } from '@/lib/departments-data'
import { mergeHomeNewsSectors, type HomeNewsSector, type HomeNewsSectorId } from '@/lib/home-news-sectors'
import { mergeStructureData, type StructureData } from '@/lib/structure-data'
import { mergeSportStarGroups, type SportStarGroup } from '@/lib/sport-stars-data'
import { mergeCharterDocument, type CharterDocument } from '@/lib/charter-data'

export const SITE_BRAND = 'Монгол 87/89 ГҮТББ'

export const CHARTER_CONTACT = {
  phone: '+976 9911 2376',
  email: 'mongol89tbb@gmail.com',
  address: 'Улаанбаатар, Сүхбаатар дүүрэг, 5-р хороолол, Нарны гудамж 20а-5',
} as const

export function sitePageTitle(page: string): string {
  return `${page} · ${SITE_BRAND}`
}

function normalizeSiteName(name: string | undefined): string {
  if (!name?.trim()) return SITE_BRAND
  const n = name.trim()
  if (n === SITE_BRAND) return n
  if (/v\s*спорт|төгсөгчдийн\s*холбоо|монгол-87\s*\/\s*89/i.test(n)) return SITE_BRAND
  return n
}

function normalizeGeneralContact(g: SiteGeneral): SiteGeneral {
  const out = { ...g }
  if (!g.phone?.trim() || g.phone === '+976 9911 0000') out.phone = CHARTER_CONTACT.phone
  if (!g.email?.trim() || g.email.toLowerCase() === 'info@m8789.mn') out.email = CHARTER_CONTACT.email
  if (!g.address?.trim() || g.address === 'Улаанбаатар, СБД') out.address = CHARTER_CONTACT.address
  return out
}

export interface SiteGeneral {
  siteName: string
  edition: string
  year: string
  motto: string
  dateDisplay: string
  venue: string
  venueAddress: string
  hostAimags: string
  teamCount: string
  athleteCount: string
  phone: string
  email: string
  address: string
  facebook: string
  youtube: string
}

export interface SiteHero {
  title1: string
  title2: string
  title3: string
  subtitle: string
  heroImagePath: string
  logoColorPath: string
  logoWhitePath: string
}

export interface NavLink {
  href: string
  label: string
  hidden?: boolean
  children?: NavLink[]
}

export interface ContentPage {
  title: string
  eyebrow: string
  body: string
}

export interface Sponsor {
  id: string
  tier: 'platinum' | 'gold' | 'silver'
  name: string
  logoPath: string
  website: string
}

export interface StatItem {
  num: string
  plus: boolean
  label: string
}

export interface AboutFact    { label: string; value: string }
export interface AboutValue   { icon: string; title: string; body: string }
export interface AboutEdition { num: string; year: string; city: string; sports: string; current: boolean }
export interface SiteAbout {
  subtitle: string
  facts: AboutFact[]
  values: AboutValue[]
  editions: AboutEdition[]
  aimags: string
  orgName: string
  orgAthletes: string
  orgMotto: string
  orgLocation: string
}

export interface HostAimag {
  id: string
  mark: string
  name: string
  role: string
  description: string
  logoPath: string
  website: string
  athleteCount: string
}

export interface ScheduleEvent {
  time: string       // e.g. "08:00\n22:00" or "13:00"
  name: string
  note?: string
  hilight?: boolean
}

export interface ScheduleDay {
  num: string        // "11"
  month: string      // "2026 · ЗУРГАА"
  weekday: string    // "Пүрэв гараг · Day 1"
  main: ScheduleEvent[]
  extra: ScheduleEvent[]
}

export interface FooterColumn {
  title: string
  links: NavLink[]
}

export interface FooterNav {
  col1: FooterColumn
  col2: FooterColumn
}

export interface NewsTag {
  id: string
  label: string
  color: 'red' | 'gold'
}

export interface NewsArticle {
  id: string
  date: string
  tag: string
  tagColor: 'red' | 'gold'
  author: string
  title: string
  excerpt: string   // товч — нүүр/жагсаалтанд харагдана
  content?: string  // дэлгэрэнгүй — дэлгэрэнгүй хуудсанд
  feature: boolean
  section?: HomeNewsSectorId  // нүүр болон секторын ангилал
  imagePath?: string
  imagePaths?: string[]
  facebookUrl?: string
  sourcePostId?: string  // FB постын ID — давхардуулахгүй
}

/** Facebook-оос ирсэн, зөвшөөрөл хүлээж буй мэдээ */
export interface PendingNewsItem {
  id: string
  source: 'facebook' | 'manual'
  sourcePostId?: string
  sourceUrl?: string
  fetchedAt: string
  date: string
  tag: string
  tagColor: 'red' | 'gold'
  author: string
  title: string
  excerpt: string
  content?: string
  imagePaths?: string[]
  facebookUrl?: string
}

export interface FacebookSyncSettings {
  enabled: boolean
  sourceType: 'group' | 'page'
  sourceId: string
  accessToken: string
  lastSyncAt?: string
  lastSyncError?: string
  lastNewCount?: number
}

export const DEFAULT_FACEBOOK_SYNC: FacebookSyncSettings = {
  enabled: false,
  sourceType: 'group',
  sourceId: '',
  accessToken: '',
}

export function parseNewsDate(date: string): number {
  const parts = date.trim().split(/[.\-/]/)
  if (parts.length >= 3) {
    const [y, m, d] = parts.map(p => parseInt(p, 10))
    if (!Number.isNaN(y) && !Number.isNaN(m) && !Number.isNaN(d)) {
      return new Date(y, m - 1, d).getTime()
    }
  }
  const t = Date.parse(date.replace(/\./g, '-'))
  return Number.isNaN(t) ? 0 : t
}

export function getArticleImages(a: NewsArticle): string[] {
  if (a.imagePaths?.length) return a.imagePaths
  if (a.imagePath) return [a.imagePath]
  return []
}

export function getArticleCover(a: NewsArticle): string | undefined {
  return getArticleImages(a)[0]
}

export function normalizeNewsArticle(a: NewsArticle): NewsArticle {
  const images = getArticleImages(a).filter(Boolean)
  return {
    ...a,
    excerpt: a.excerpt ?? '',
    content: a.content ?? '',
    section: a.section ?? inferLegacyNewsSection(a),
    imagePaths: images,
    imagePath: images[0],
  }
}

function inferLegacyNewsSection(a: NewsArticle): HomeNewsSectorId {
  const tag = a.tag ?? ''
  if (/сагсан|волей|спорт|хуваарь|бүртгэл|nice/i.test(tag)) return 'sport'
  if (tag === 'Зохион байгуулалт') return 'butets'
  return 'news'
}

export function sortNewsByDate(articles: NewsArticle[]): NewsArticle[] {
  return [...articles].sort((a, b) => parseNewsDate(b.date) - parseNewsDate(a.date))
}

export interface MedalRow {
  name: string
  g: number
  s: number
  b: number
}

export interface SportOverride {
  sport_id: string
  rank1?: string  // team name
  rank2?: string
  rank3?: string
}

export interface ManualPointTier {
  from: number   // rank_from (e.g. 1, 5)
  to: number     // rank_to inclusive (e.g. 1, 8)
  pts: number    // оноо
}

export interface ManualSportResult {
  sport_id: string
  tiers: ManualPointTier[]
  placements: { rank: number; team: string }[]
  scoreDir?: 'low' | 'high'  // 'low' = бага оноо = сайн байр (default 'high')
}

// Их оноо = сайн: 1-р байр=10, 2-р=8 ...
export const DEFAULT_POINT_TIERS: ManualPointTier[] = [
  { from: 1, to: 1, pts: 10 },
  { from: 2, to: 2, pts: 8 },
  { from: 3, to: 3, pts: 6 },
  { from: 4, to: 4, pts: 4 },
  { from: 5, to: 8, pts: 2 },
  { from: 9, to: 99, pts: 1 },
]

// Бага оноо = сайн: 1-р байр=1, 2-р=2 ...
export const DEFAULT_LOW_TIERS: ManualPointTier[] = [
  { from: 1, to: 1, pts: 1 },
  { from: 2, to: 2, pts: 2 },
  { from: 3, to: 3, pts: 3 },
  { from: 4, to: 4, pts: 4 },
  { from: 5, to: 8, pts: 6 },
  { from: 9, to: 99, pts: 10 },
]

export interface ScoringLink {
  id: string
  label: string
  url: string
  sport_icon: string
  embed: boolean
  clip_top: number
  iframe_height: number
}

export interface HistoryResult {
  sport: string
  gender: string    // 'male' | 'female' | 'mixed'
  gold: string
  silver: string
  bronze: string
  mvp_name?: string
  mvp_team?: string
  mvp_note?: string
}

export interface TournamentEditionHistory {
  num: string           // 'I' | 'II' ...
  year: string
  title: string
  city: string
  venue: string
  dates: string
  sports_count: number
  categories_count: number
  overall_champion: string
  host_aimags: string   // comma-separated
  note: string
  results: HistoryResult[]
}

export interface HostScheduleRow {
  year: string
  edition: string
  aimags: string        // comma-separated
}

export interface HomeSections {
  stats: boolean
  news: boolean
  sports: boolean
  schedule: boolean
  medals: boolean
  host_aimags: boolean
  about: boolean
  sponsors: boolean
}

/** Нүүр хуудсын бүх засварлах текст */
export interface HomeSportCard {
  id: string
  num: string
  cat: string
  name: string
  href: string
  desc: string
}

export interface HomeCopy {
  hero: {
    editionSuffix: string
    eventType: string
    city: string
    metaDateLabel: string
    metaCityLabel: string
    metaVenueLabel: string
    metaTeamsLabel: string
    teamsUnit: string
    ctaSchedule: string
    ctaLive: string
  }
  countdown: {
    eyebrow: string
    targetIso: string
    dayLabel: string
    hourLabel: string
    minLabel: string
    secLabel: string
  }
  ribbon: {
    tag: string
    emptyMsg: string
  }
  news: {
    eyebrow: string
    titlePrefix: string
    titleGold: string
    action: string
    readMore: string
  }
  sports: {
    eyebrow: string
    titlePrefix: string
    titleGold: string
    action: string
    cards: HomeSportCard[]
  }
  schedule: {
    eyebrow: string
    titlePrefix: string
    titleGold: string
    action: string
    mainLabel: string
    extraLabel: string
  }
  medals: {
    eyebrow: string
    titlePrefix: string
    titleGold: string
    action: string
    colRank: string
    colAimag: string
    colGold: string
    colSilver: string
    colBronze: string
    colTotal: string
  }
  hostAimags: {
    eyebrow: string
    titlePrefix: string
    titleGold: string
    action: string
  }
  about: {
    eyebrow: string
    titlePrefix: string
    titleGold: string
    action: string
    historyTitle: string
    historyLink: string
    sportsSuffix: string
    currentBadge: string
  }
  sponsors: {
    eyebrow: string
    titlePrefix: string
    titleGold: string
    tierPlatinum: string
    tierGold: string
    tierSilver: string
  }
}

export const DEFAULT_HOME_COPY: HomeCopy = {
  hero: {
    editionSuffix: 'Edition',
    eventType: 'Спорт Наадам',
    city: 'Улаанбаатар',
    metaDateLabel: 'Огноо',
    metaCityLabel: 'Хот',
    metaVenueLabel: 'Заал',
    metaTeamsLabel: 'Багууд',
    teamsUnit: 'аймаг',
    ctaSchedule: 'Хуваарь үзэх',
    ctaLive: 'Шууд дамжуулалт',
  },
  countdown: {
    eyebrow: 'Дараагийн наадам эхлэхэд',
    targetIso: '2026-06-11T13:00:00+08:00',
    dayLabel: 'Хоног',
    hourLabel: 'Цаг',
    minLabel: 'Минут',
    secLabel: 'Сек',
  },
  ribbon: {
    tag: 'Шууд',
    emptyMsg: 'Тоглолт байхгүй байна',
  },
  news: {
    eyebrow: 'Сүүлийн мэдээ',
    titlePrefix: 'Онцлох',
    titleGold: 'мэдээ',
    action: 'Бүх мэдээ →',
    readMore: 'Дэлгэрэнгүй →',
  },
  sports: {
    eyebrow: '5 төрөл · 7 ангилал',
    titlePrefix: 'Спортын',
    titleGold: 'төрлүүд',
    action: 'Хэсгийн хуваарь →',
    cards: [
      { id: 's1', num: '01', cat: '♂ Эрэгтэй', name: 'Сагсан\nбөмбөг', href: '/sport/v-naadam/groups#771904c0-f0c9-4b53-a631-f82cecfde598', desc: 'Хэсгийн хуваарь болон нугалааны дүнг энд дарж шууд харна уу →' },
      { id: 's2', num: '02', cat: '♀ Эмэгтэй', name: 'Сагсан\nбөмбөг', href: '/sport/v-naadam/groups#875a61c1-6c97-4dca-96a0-dd0bcf9b2cc3', desc: 'Хэсгийн хуваарь болон нугалааны дүнг энд дарж шууд харна уу →' },
      { id: 's3', num: '03', cat: '♂ Эрэгтэй', name: 'Волейбол', href: '/sport/v-naadam/groups#11a8b935-744d-4032-8280-6ef97ad5a9db', desc: 'Хэсгийн хуваарь болон нугалааны дүнг энд дарж шууд харна уу →' },
      { id: 's4', num: '04', cat: '♀ Эмэгтэй', name: 'Волейбол', href: '/sport/v-naadam/groups#92dfbd70-204d-4293-985f-b2e49e35c526', desc: 'Хэсгийн хуваарь болон нугалааны дүнг энд дарж шууд харна уу →' },
      { id: 's5', num: '05', cat: 'Баг', name: 'Ширээний\nтеннис', href: '/sport/v-naadam/groups#094da6e9-660d-4646-b149-7a4cbd8f55a0', desc: 'Хэсгийн хуваарь болон нугалааны дүнг энд дарж шууд харна уу →' },
      { id: 's6', num: '06', cat: 'Баг', name: 'Дартс', href: '/sport/v-naadam/groups#b0b7ca49-82fb-440f-8e9a-19fdbf1f6d11', desc: 'Хэсгийн хуваарь болон нугалааны дүнг энд дарж шууд харна уу →' },
      { id: 's7', num: '07', cat: 'Баг', name: 'Шатар', href: '/sport/v-naadam/groups#4b254cc4-16e9-430d-9bf2-0257178db95c', desc: 'Хэсгийн хуваарь болон нугалааны дүнг энд дарж шууд харна уу →' },
    ],
  },
  schedule: {
    eyebrow: '2026.06.11 — 2026.06.13',
    titlePrefix: 'Наадмын',
    titleGold: 'хуваарь',
    action: 'Дэлгэрэнгүй →',
    mainLabel: 'Үндсэн тэмцээн',
    extraLabel: 'Хөгжөөн дэмжигчдэд',
  },
  medals: {
    eyebrow: 'Medal Standings · Live',
    titlePrefix: 'Медалийн',
    titleGold: 'хүснэгт',
    action: 'Бүх хүснэгт →',
    colRank: 'Эрэмбэ',
    colAimag: 'Аймаг',
    colGold: 'Алт',
    colSilver: 'Мөнгө',
    colBronze: 'Хүрэл',
    colTotal: 'Нийт',
  },
  hostAimags: {
    eyebrow: 'Organizer Provinces · 2026',
    titlePrefix: 'Зохион байгуулагч',
    titleGold: 'аймгууд',
    action: 'Наадмын түүх →',
  },
  about: {
    eyebrow: 'About the Games',
    titlePrefix: 'Наадмын',
    titleGold: 'тухай',
    action: 'Дэлгэрэнгүй →',
    historyTitle: 'Наадмын түүх',
    historyLink: 'Дэлгэрэнгүй →',
    sportsSuffix: 'төрөл',
    currentBadge: 'ОДООГИЙН',
  },
  sponsors: {
    eyebrow: 'Partners & Sponsors',
    titlePrefix: 'Ивээн',
    titleGold: 'тэтгэгчид',
    tierPlatinum: 'Алтан\nгишүүн',
    tierGold: 'Дэмжигч',
    tierSilver: 'Хамтрагч',
  },
}

export function mergeHomeCopy(raw?: Partial<HomeCopy> | null): HomeCopy {
  const d = DEFAULT_HOME_COPY
  if (!raw) return structuredClone(d)
  return {
    hero: { ...d.hero, ...raw.hero },
    countdown: { ...d.countdown, ...raw.countdown },
    ribbon: { ...d.ribbon, ...raw.ribbon },
    news: { ...d.news, ...raw.news },
    sports: {
      ...d.sports,
      ...raw.sports,
      cards: raw.sports?.cards?.length ? raw.sports.cards : d.sports.cards,
    },
    schedule: { ...d.schedule, ...raw.schedule },
    medals: { ...d.medals, ...raw.medals },
    hostAimags: { ...d.hostAimags, ...raw.hostAimags },
    about: { ...d.about, ...raw.about },
    sponsors: { ...d.sponsors, ...raw.sponsors },
  }
}

export interface SiteSettings {
  general: SiteGeneral
  hero: SiteHero
  nav_links: NavLink[]
  content_pages: Record<string, ContentPage>
  structure_data: StructureData
  sport_star_groups: SportStarGroup[]
  charter_document: CharterDocument
  sponsors: Sponsor[]
  stats: StatItem[]
  host_aimags: HostAimag[]
  about: SiteAbout
  home_sections: HomeSections
  home_news_sectors: HomeNewsSector[]
  home_copy: HomeCopy
  news_tags: NewsTag[]
  news: NewsArticle[]
  news_pending: PendingNewsItem[]
  facebook_sync: FacebookSyncSettings
  medal_standings: MedalRow[]
  schedule: ScheduleDay[]
  footer_nav: FooterNav
  scoring_links: ScoringLink[]
  sport_overrides: SportOverride[]
  manual_medal_results: ManualSportResult[]
  tournament_history: TournamentEditionHistory[]
  host_schedule: HostScheduleRow[]
  schedule_sports: string[]   // sport ID-ууд — нийтийн хуваарь хуудсанд харуулах
}

export const DEFAULT_SETTINGS: SiteSettings = {
  general: {
    siteName: SITE_BRAND,
    edition: 'V',
    year: '2026',
    motto: 'Нэгдэл · Уламжлал · Хамтын ажиллагаа',
    dateDisplay: '06.11 — 06.13',
    venue: 'Буянт Ухаа',
    venueAddress: '"Буянт Ухаа" спорт ордон',
    hostAimags: 'Өмнөговь · Сэлэнгэ · Төв · Увс',
    teamCount: '21',
    athleteCount: '1,240+',
    phone: CHARTER_CONTACT.phone,
    email: CHARTER_CONTACT.email,
    address: CHARTER_CONTACT.address,
    facebook: 'https://facebook.com',
    youtube: 'https://youtube.com',
  },
  hero: {
    title1: 'МОНГОЛ',
    title2: '87 / 89',
    title3: 'СПОРТ НААДАМ',
    subtitle:
      '— Монгол 87/89 онд төгссөн нэгэн үеийнхний нөхөрлөл, тэмцэл, амжилтыг нэгтгэх V удаагийн наадам. 21 аймгийн оролцоотой, 5 төрөлд, 3 өдрийн турш.',
    heroImagePath: '/media/hero-bg.jpg',
    logoColorPath: '/logo-color.jpg',
    logoWhitePath: '/logo-white.jpg',
  },
  nav_links: [
    { href: '/', label: 'Нүүр' },
    {
      href: '/butets',
      label: 'Бүтэц зохион байгуулалт',
      children: [
        { href: '/butets/durmiin', label: 'ТББ-ын дүрэм' },
        { href: '/butets/belegdel', label: 'Бэлэгдэл' },
        { href: '/butets/alba', label: 'Гүйцэтгэх алба' },
        { href: '/butets/zovlol', label: 'Удирдах зөвлөл' },
        { href: '/butets/baga-khural', label: 'Бага хурал' },
      ],
    },
    {
      href: '/delkhin-89',
      label: 'Дэлхийн 89',
      children: [
        { href: '/delkhin-89/amerik', label: 'Америк дах 89 чүүд' },
        { href: '/delkhin-89/solongs', label: 'Солонгос дах 89 чүүд' },
        { href: '/delkhin-89/yapon', label: 'Япон дах 89 чүүд' },
      ],
    },
    {
      href: '/bakharkhal',
      label: 'Манай бахархал',
      children: [
        { href: '/bakharkhal/aldar', label: 'Алдар цолтнууд' },
        { href: '/bakharkhal/sport', label: 'Спортын алдартнууд' },
        { href: '/bakharkhal/urlag', label: 'Урлагын алдартнууд' },
      ],
    },
    { href: '/news', label: 'Мэдээ' },
    { href: '/sport/v-naadam/history', label: 'Спорт' },
    { href: '/urlag', label: 'Урлаг' },
    {
      href: '/albada',
      label: 'Албадууд',
      children: ALBADA_NAV_CHILDREN,
    },
    { href: '/gallery', label: 'Зургийн цомог' },
  ],
  content_pages: {
    ...mergeContentPages(),
    ...mergeDepartmentContentPages(),
  },
  structure_data: mergeStructureData(),
  sport_star_groups: mergeSportStarGroups(),
  charter_document: mergeCharterDocument(),
  sponsors: [
    { id: 's1', tier: 'platinum', name: 'Алтан гишүүн 1', logoPath: '', website: '' },
    { id: 's2', tier: 'platinum', name: 'Алтан гишүүн 2', logoPath: '', website: '' },
    { id: 's3', tier: 'platinum', name: 'Алтан гишүүн 3', logoPath: '', website: '' },
    { id: 's4', tier: 'gold', name: 'Дэмжигч 1', logoPath: '', website: '' },
    { id: 's5', tier: 'gold', name: 'Дэмжигч 2', logoPath: '', website: '' },
    { id: 's6', tier: 'silver', name: 'Хамтрагч 1', logoPath: '', website: '' },
    { id: 's7', tier: 'silver', name: 'Хамтрагч 2', logoPath: '', website: '' },
  ],
  stats: [
    { num: '21', plus: false, label: 'Оролцогч\nаймаг' },
    { num: '5', plus: false, label: 'Спортын\nтөрөл' },
    { num: '7', plus: false, label: 'Тэмцээний\nангилал' },
    { num: '1,240', plus: true, label: 'Бүртгэлтэй\nтамирчид' },
    { num: '3', plus: false, label: 'Өдөр\nүргэлжилнэ' },
  ],
  host_aimags: [
    { id: 'a1', mark: 'ӨМ',  name: 'Өмнөговь', role: 'Зохион байгуулагч аймаг', description: '', logoPath: '/logos/Өмнөговь.png', website: '', athleteCount: '76'  },
    { id: 'a2', mark: 'СЭЛ', name: 'Сэлэнгэ',  role: 'Зохион байгуулагч аймаг', description: '', logoPath: '/logos/Сэлэнгэ.png',  website: '', athleteCount: '98'  },
    { id: 'a3', mark: 'ТӨВ', name: 'Төв',       role: 'Зохион байгуулагч аймаг', description: '', logoPath: '/logos/Төв.png',       website: '', athleteCount: '142' },
    { id: 'a4', mark: 'УВС', name: 'Увс',        role: 'Зохион байгуулагч аймаг', description: '', logoPath: '/logos/Увс.png',       website: '', athleteCount: '64'  },
  ],
  news_tags: [
    { id: 'nt1', label: 'Онцлох',            color: 'red'  },
    { id: 'nt2', label: 'Сагсан бөмбөг ♂',  color: 'gold' },
    { id: 'nt3', label: 'Зохион байгуулалт', color: 'gold' },
    { id: 'nt4', label: 'NICE-чүүд',         color: 'gold' },
    { id: 'nt5', label: 'Уламжлал',          color: 'gold' },
    { id: 'nt6', label: 'Бүртгэл',           color: 'gold' },
    { id: 'nt7', label: 'Хуваарь',           color: 'gold' },
    { id: 'nt8', label: 'Спортын хороо',     color: 'gold' },
  ] as NewsTag[],
  news: [
    { id: 'n1', date: '2026.06.01', tag: 'Онцлох',            tagColor: 'red',  author: 'Зохион байгуулах хороо', feature: true,  title: 'V Спорт наадам нээгдэхэд 11 хоног үлдлээ — 21 аймгийн төлөөлөл "Буянт Ухаа"-д хүрэлцэн ирнэ',         excerpt: 'Нээлтийн ёслол 06.11-ний 13:00 цагт "Буянт Ухаа" спорт ордонд болж, "Өнгөлөг · Сүрлэг · Тэнгэрлэг · Ухаалаг" уриан дор 5 төрөлд эр, эмэгтэйчүүд хүч сорилцоно.' },
    { id: 'n2', date: '2026.05.28', tag: 'Сагсан бөмбөг ♂',  tagColor: 'gold', author: 'Спортын хороо',           feature: false, title: 'Эрэгтэй сагсны хэсэгт хуваарилалт хийгдлээ',                                                         excerpt: '21 аймгийн эрэгтэй баг 6 хэсэгт хуваагдан хэсгийн шатны тоглолтоо эхлүүлнэ.' },
    { id: 'n3', date: '2026.05.26', tag: 'Зохион байгуулалт', tagColor: 'gold', author: 'Зохион байгуулах хороо', feature: false, title: 'Өмнөговь · Сэлэнгэ · Төв · Увс — энэ жилийн зохион байгуулагч аймгууд',                              excerpt: 'V наадамд дөрвөн аймаг хамтран зохион байгуулагчаар ажиллана.' },
    { id: 'n4', date: '2026.05.22', tag: 'NICE-чүүд',         tagColor: 'gold', author: 'Редакц',                  feature: false, title: 'Хаалтын "Бид хамтдаа" үдэшлэгт NICE хамтлаг тоглоно',                                                  excerpt: '06.12-ны шагнал гардуулах ёслолын дараа "Бид хамтдаа" үдэшлэг болох бөгөөд NICE хамтлаг тусгай тоглолт бэлдэж байна.' },
    { id: 'n5', date: '2026.05.18', tag: 'Уламжлал',          tagColor: 'gold', author: 'Редакц',                  feature: false, title: 'IV наадмын аварга Дархан-Уулын багт V наадмын туг хүлээлгэнэ',                                          excerpt: '2024 оны IV наадамд эрэгтэй сагсан бөмбөгт аварга болсон Дархан-Уулын баг V наадмын тугийг нээлтийн ёслолд хүлээн авна.' },
    { id: 'n6', date: '2026.05.14', tag: 'Бүртгэл',           tagColor: 'gold', author: 'Зохион байгуулах хороо', feature: false, title: 'Тамирчдын бүртгэл 06.01 хүртэл үргэлжилнэ',                                                            excerpt: 'Спорт бүрийн ангилалаар тамирчдын бүртгэл хийгдэж байна. Бүртгэлийн хугацаа 2026 оны 06 дугаар сарын 01 хүртэл.' },
    { id: 'n7', date: '2026.05.08', tag: 'Хуваарь',           tagColor: 'gold', author: 'Спортын хороо',           feature: false, title: 'Ширээний теннис болон дартсын тэмцээний хуваарь батлагдлаа',                                           excerpt: 'Ширээний теннисний баг тэмцээн 06.12-нд, дартсын баг тэмцээн 06.11-нд болно.' },
    { id: 'n8', date: '2026.04.30', tag: 'Зохион байгуулалт', tagColor: 'gold', author: 'Зохион байгуулах хороо', feature: false, title: 'V наадмын зохион байгуулах хороо байгуулагдлаа',                                                        excerpt: '"Монгол 87/89" Төгсөгчдийн Холбоо ТББ V наадмын бэлтгэл ажлыг хариуцах зохион байгуулах хороог байгуулж баталлаа.' },
  ] as NewsArticle[],
  news_pending: [],
  facebook_sync: DEFAULT_FACEBOOK_SYNC,
  medal_standings: [
    { name: 'Төв аймаг',    g: 3, s: 1, b: 2 },
    { name: 'Сэлэнгэ',      g: 2, s: 2, b: 1 },
    { name: 'Өмнөговь',     g: 1, s: 2, b: 3 },
    { name: 'Увс',           g: 1, s: 1, b: 2 },
    { name: 'Дархан-Уул',   g: 0, s: 1, b: 2 },
    { name: 'Орхон',         g: 0, s: 0, b: 1 },
    { name: 'Архангай',      g: 0, s: 0, b: 0 },
    { name: 'Баян-Өлгий',   g: 0, s: 0, b: 0 },
    { name: 'Баянхонгор',   g: 0, s: 0, b: 0 },
    { name: 'Булган',        g: 0, s: 0, b: 0 },
    { name: 'Говь-Алтай',   g: 0, s: 0, b: 0 },
    { name: 'Говьсүмбэр',   g: 0, s: 0, b: 0 },
    { name: 'Дорноговь',     g: 0, s: 0, b: 0 },
    { name: 'Дорнод',        g: 0, s: 0, b: 0 },
    { name: 'Дундговь',      g: 0, s: 0, b: 0 },
    { name: 'Завхан',        g: 0, s: 0, b: 0 },
    { name: 'Захдамь',       g: 0, s: 0, b: 0 },
    { name: 'Өвөрхангай',   g: 0, s: 0, b: 0 },
    { name: 'Сүхбаатар',    g: 0, s: 0, b: 0 },
    { name: 'Хэнтий',        g: 0, s: 0, b: 0 },
    { name: 'Хөвсгөл',       g: 0, s: 0, b: 0 },
  ] as MedalRow[],
  schedule: [
    {
      num: '11', month: '2026 · ЗУРГАА', weekday: 'Пүрэв гараг · Day 1',
      main: [
        { time: '08:00\n22:00', name: 'Сагсан бөмбөгийн тэмцээн',       note: 'Эр + Эм · Гол заал' },
        { time: '08:00\n22:00', name: 'Волейболын тэмцээн',               note: 'Эр + Эм · Гол заал' },
        { time: '10:00\n16:00', name: 'Шатрын тэмцээн',                  note: 'Бага заал · Багаар'  },
        { time: '10:00\n16:00', name: 'Дартсын тэмцээн',                 note: 'Бага заал · Багаар'  },
        { time: '13:00\n14:00', name: '🎉 Спорт наадмын нээлтийн ёслол', note: 'Гол талбай', hilight: true },
      ],
      extra: [
        { time: '11:00\n13:00', name: '"Кофетой шүлэг" номын өдөрлөг' },
        { time: '14:00\n15:00', name: 'Вальс бүжгийн хосын тэмцээн'   },
        { time: '16:00\n18:00', name: 'Сонирхогчдын дартсын тэмцээн'  },
        { time: '10:00\n20:00', name: 'Бүтээлч 89-чүүд · Үзэсгэлэн худалдаа', note: '21 аймгийн үйлдвэрлэл' },
      ],
    },
    {
      num: '12', month: '2026 · ЗУРГАА', weekday: 'Баасан гараг · Final Day',
      main: [
        { time: '08:00\n17:00', name: 'Сагсан бөмбөгийн тэмцээн',          note: 'Эр + Эм · Финал хүртэл' },
        { time: '08:00\n17:00', name: 'Волейболын тэмцээн',                  note: 'Эр + Эм · Финал хүртэл' },
        { time: '10:00\n16:00', name: 'Ширээний теннисний тэмцээн',         note: 'Бага заал · Багаар'      },
        { time: '17:00\n18:00', name: 'Хөгжөөн дэмжигчдийн бүжиг, дээсний үзүүлбэр' },
        { time: '18:00\n20:00', name: '🏆 Шагнал гардуулах · Хаалтын ёслол', hilight: true },
        { time: '20:00\n23:00', name: '🎶 "Бид хамтдаа" үдшийн цэнгүүн',    note: 'NICE хамтлаг', hilight: true },
      ],
      extra: [
        { time: '11:00\n15:00', name: 'Хөзөр · "5 гар" · муушигны тэмцээн' },
        { time: '14:00\n15:00', name: 'Чөлөөт бүжгийн тэмцээн'             },
        { time: '10:00\n20:00', name: 'Бүтээлч 89-чүүд · Үзэсгэлэн худалдаа' },
      ],
    },
    {
      num: '13', month: '2026 · ЗУРГАА', weekday: 'Бямба гараг · Show Day',
      main: [
        { time: '09:00\n17:00', name: '🏓 Ширээний теннисний тоглолт',  note: 'Хандгайт Их Тамирт бх', hilight: true },
        { time: '09:00\n17:00', name: '🎯 Дартсын тоглолт',             note: 'Хандгайт Их Тамирт бх', hilight: true },
        { time: '09:00\n17:00', name: '♟️ Шатрын тоглолт',              note: 'Хандгайт Их Тамирт бх', hilight: true },
        { time: '17:00\n18:00', name: '🏆 Шагнал гардуулах ёслол',      note: 'Хандгайт Их Тамирт бх', hilight: true },
        { time: '18:00\n23:00', name: '🎉 NICE PARTY — Шоу үдэшлэг',   note: 'Хандгайт Их Тамирт бх', hilight: true },
      ],
      extra: [
        { time: '15:00\n17:00', name: 'Медаль гардуулах — Шигшээний шагнал' },
        { time: '17:00\n18:00', name: 'DJ шоу · Гоёл чимэглэлийн үзүүлбэр' },
        { time: '20:00\n23:00', name: 'Хамт олны үдшийн цэнгүүн'            },
      ],
    },
  ] as ScheduleDay[],
  scoring_links: [
    {
      id: 'sl-darts-1',
      label: 'Дартс · Шууд оноо',
      url: 'https://n01darts.com/n01/online/n01_score_view.php?tmid=t_Cpjd_7438_rr_0_Kmoa_yare',
      sport_icon: '🎯',
      embed: true,
      clip_top: 190,
      iframe_height: 700,
    },
  ],
  sport_overrides: [],
  manual_medal_results: [],
  tournament_history: [
    {
      num: 'I', year: '2022', title: '«Алдар-2022»',
      city: 'Улаанбаатар', venue: '"Буянт Ухаа" спорт ордон', dates: '2022',
      sports_count: 2, categories_count: 4, overall_champion: 'Дархан-Уул',
      host_aimags: 'Сүхбаатар аймаг',
      note: 'Монгол-87/89 ГҮТББ-ийн анхны спорт наадам. Сагсан бөмбөг, Волейболын 4 ангилалаар явагдсан.',
      results: [
        { sport: 'Сагсан бөмбөг', gender: 'male',   gold: 'Дархан-Уул',  silver: 'Хөвсгөл',    bronze: 'Сүхбаатар аймаг', mvp_name: '', mvp_team: '', mvp_note: '' },
        { sport: 'Сагсан бөмбөг', gender: 'female', gold: 'Дархан-Уул',  silver: 'Өмнөговь',   bronze: 'Говь-Алтай', mvp_name: '', mvp_team: '', mvp_note: '' },
        { sport: 'Волейбол',      gender: 'male',   gold: 'Говь-Алтай',  silver: 'Хэнтий',     bronze: 'Ховд', mvp_name: '', mvp_team: '', mvp_note: '' },
        { sport: 'Волейбол',      gender: 'female', gold: 'Өмнөговь',    silver: 'Дундговь',   bronze: 'Баянхонгор', mvp_name: '', mvp_team: '', mvp_note: '' },
      ],
    },
    {
      num: 'II', year: '2023', title: '«Мөнхөд нэгэн зугт-2023»',
      city: 'Архангай аймаг', venue: 'Архангай аймгийн спорт цогцолбор', dates: '2023',
      sports_count: 2, categories_count: 4, overall_champion: 'Увс',
      host_aimags: 'Архангай, Багануур, Баянхонгор, Булган',
      note: 'Хоёрдугаар наадам анх удаа нийслэлээс гадна — Архангай аймагт зохиогдов.',
      results: [
        { sport: 'Сагсан бөмбөг', gender: 'male',   gold: 'Дархан-Уул', silver: 'Увс',        bronze: 'Говь-Алтай', mvp_name: '', mvp_team: '', mvp_note: '' },
        { sport: 'Сагсан бөмбөг', gender: 'female', gold: 'Өмнөговь',   silver: 'Увс',        bronze: 'Говь-Алтай', mvp_name: '', mvp_team: '', mvp_note: '' },
        { sport: 'Волейбол',      gender: 'male',   gold: 'Хэнтий',     silver: 'Өвөрхангай', bronze: 'Говь-Алтай', mvp_name: '', mvp_team: '', mvp_note: '' },
        { sport: 'Волейбол',      gender: 'female', gold: 'Дундговь',   silver: 'Өвөрхангай', bronze: 'Архангай', mvp_name: '', mvp_team: '', mvp_note: '' },
      ],
    },
    {
      num: 'III', year: '2024', title: '«Найрамдал-2024»',
      city: 'Дархан хот (Дархан-Уул аймаг)', venue: 'Дархан хотын спорт цогцолбор', dates: '2024.08.16 — 08.18',
      sports_count: 5, categories_count: 7, overall_champion: '',
      host_aimags: 'Говь-Алтай, Дархан-Уул, Дорнод, Дорноговь',
      note: '3-р наадам Дархан хотод зохиогдов. 5 төрөл 7 ангилалаар явагдсан анхны наадам.',
      results: [
        { sport: 'Сагсан бөмбөг', gender: 'male',   gold: '',           silver: '',          bronze: '', mvp_name: 'Tuya Sundui', mvp_team: 'Төв89', mvp_note: '#14 · Шилдэг тоглогч' },
        { sport: 'Сагсан бөмбөг', gender: 'female', gold: '',           silver: '',          bronze: '', mvp_name: '', mvp_team: '', mvp_note: '' },
        { sport: 'Волейбол',      gender: 'male',   gold: '',           silver: '',          bronze: '', mvp_name: '', mvp_team: '', mvp_note: '' },
        { sport: 'Волейбол',      gender: 'female', gold: '',           silver: '',          bronze: '', mvp_name: '', mvp_team: '', mvp_note: '' },
        { sport: 'Ширээний теннис', gender: 'mixed', gold: '',          silver: '',          bronze: '', mvp_name: '', mvp_team: '', mvp_note: '' },
        { sport: 'Дартс',          gender: 'male',   gold: 'Дархан-Уул', silver: '',         bronze: '', mvp_name: '', mvp_team: '', mvp_note: '' },
        { sport: 'Дартс',          gender: 'female', gold: '',           silver: '',          bronze: '', mvp_name: '', mvp_team: '', mvp_note: '' },
      ],
    },
    {
      num: 'IV', year: '2025', title: '«Эв зэ-Эрч хүч-2025»',
      city: 'Орхон аймаг (Эрдэнэт хот)', venue: 'Орхон аймгийн спорт цогцолбор', dates: '2025',
      sports_count: 5, categories_count: 7, overall_champion: 'Дархан-Уул',
      host_aimags: 'Дундговь, Завхан, Орхон, Өвөрхангай',
      note: '4-р наадам Орхон аймгийн Эрдэнэт хотод зохиогдов. Дархан-87/89 баг 3 алтан медаль авсан.',
      results: [
        { sport: 'Сагсан бөмбөг', gender: 'male',   gold: 'Дархан-Уул', silver: '',          bronze: '', mvp_name: '', mvp_team: '', mvp_note: '' },
        { sport: 'Сагсан бөмбөг', gender: 'female', gold: 'Дархан-Уул', silver: '',          bronze: '', mvp_name: '', mvp_team: '', mvp_note: '' },
        { sport: 'Волейбол',      gender: 'male',   gold: '',           silver: '',          bronze: '', mvp_name: '', mvp_team: '', mvp_note: '' },
        { sport: 'Волейбол',      gender: 'female', gold: '',           silver: '',          bronze: '', mvp_name: '', mvp_team: '', mvp_note: '' },
        { sport: 'Ширээний теннис', gender: 'mixed', gold: '',          silver: '',          bronze: '', mvp_name: '', mvp_team: '', mvp_note: '' },
        { sport: 'Дартс',          gender: 'male',   gold: '',           silver: 'Орхон',     bronze: '', mvp_name: '', mvp_team: '', mvp_note: '' },
        { sport: 'Дартс',          gender: 'female', gold: 'Дархан-Уул', silver: '',          bronze: '', mvp_name: '', mvp_team: '', mvp_note: '' },
      ],
    },
  ] as TournamentEditionHistory[],
  host_schedule: [
    { year: '2022', edition: 'I',   aimags: 'Сүхбаатар аймаг' },
    { year: '2023', edition: 'II',  aimags: 'Архангай, Багануур, Баянхонгор, Булган' },
    { year: '2024', edition: 'III', aimags: 'Говь-Алтай, Дархан-Уул, Дорнод, Дорноговь' },
    { year: '2025', edition: 'IV',  aimags: 'Дундговь, Завхан, Орхон, Өвөрхангай' },
    { year: '2026', edition: 'V',   aimags: 'Өмнөговь, Сэлэнгэ, Төв, Увс' },
    { year: '2027', edition: 'VI',  aimags: 'Ховд, Хөвсгөл, Хэнтий' },
  ] as HostScheduleRow[],
  footer_nav: {
    col1: {
      title: 'Чиглэл',
      links: [
        { href: '/urlag', label: 'Урлаг' },
        { href: '/sport', label: 'Спорт' },
        { href: '/niigem', label: 'Нийгэмийн ажил' },
        { href: '/sport/v-naadam', label: 'V Спорт наадам' },
      ],
    },
    col2: {
      title: 'Мэдээлэл',
      links: [
        { href: '/news', label: 'Мэдээ' },
        { href: '/gallery', label: 'Зургийн цомог' },
        { href: '/sport/v-naadam/live', label: 'Шууд дамжуулалт' },
        { href: '/sport/v-naadam/about', label: 'Наадмын тухай' },
      ],
    },
  } as FooterNav,
  schedule_sports: [],
  home_sections: {
    stats: true,
    news: true,
    sports: true,
    schedule: true,
    medals: true,
    host_aimags: true,
    about: true,
    sponsors: true,
  },
  home_news_sectors: mergeHomeNewsSectors(),
  home_copy: DEFAULT_HOME_COPY,
  about: {
    subtitle: 'Монгол улсын ерөнхий боловсролын сургуулийг 1987, 1989 онд төгссөн нэгэн үеийнхний албан ёсны тавдугаар спорт наадам. 21 аймгийн оролцоотой, 5 спортын төрлөөр, 2 өдрийн турш Улаанбаатар хотын "Буянт Ухаа" спорт ордонд зохион байгуулагдана.',
    facts: [
      { label: 'Огноо',          value: '2026.06.11 — 06.12' },
      { label: 'Байршил',        value: '"Буянт Ухаа" спорт ордон' },
      { label: 'Спортын төрөл', value: '5 төрөл' },
      { label: 'Оролцогч',      value: '21 аймаг' },
    ],
    values: [
      { icon: '🤝', title: 'Нэгдэл',        body: 'Монгол оронд болон гадаадад амьдарч буй 87, 89 онд төгссөн нэгэн үеийнхнийг нэгтгэж, нөхөрлөлийг бэхжүүлнэ.' },
      { icon: '🏆', title: 'Тэмцэл',        body: 'Шударга, ил тод, спортын зарчимтай тэмцэл өрнүүлж, аймаг, байгууллага хоорондын эрүүл өрсөлдөөнийг дэмжинэ.' },
      { icon: '🌟', title: 'Амжилт',        body: 'Наадмаар дамжуулан тамирчид болон багийн гишүүд өөрсдийгөө нотолж, дараагийн үед үлдэх дурсамж бүтээнэ.' },
      { icon: '🇲🇳', title: 'Эх оронч үзэл', body: '"Өнгөлөг · Сүрлэг · Тэнгэрлэг · Ухаалаг" уриан дор монгол ёс заншил, эв нэгдлийг дээдэлнэ.' },
    ],
    editions: [
      { num: 'I',   year: '2022', city: 'Улаанбаатар', sports: '2', current: false },
      { num: 'II',  year: '2023', city: 'Архангай',    sports: '2', current: false },
      { num: 'III', year: '2024', city: 'Дархан-Уул',  sports: '5', current: false },
      { num: 'IV',  year: '2025', city: 'Орхон',       sports: '5', current: false },
      { num: 'V',   year: '2026', city: 'Улаанбаатар', sports: '5', current: true  },
    ],
    aimags: 'Өмнөговь,Сэлэнгэ,Төв,Увс,Архангай,Баян-Өлгий,Баянхонгор,Булган,Говь-Алтай,Говьсүмбэр,Дархан-Уул,Дорноговь,Дорнод,Дундговь,Завхан,Захдамь,Орхон,Өвөрхангай,Сүхбаатар,Хэнтий,Хөвсгөл',
    orgName:      'Монгол-87/89 Гүтбб',
    orgAthletes:  'Монгол улсын ЕБС-ийг 1987, 1989 онд төгссөн иргэд',
    orgMotto:     'Өнгөлөг · Сүрлэг · Тэнгэрлэг · Ухаалаг',
    orgLocation:  'Улаанбаатар, "Буянт Ухаа" спорт ордон',
  },
}

const LEGACY_NAV_HREFS = new Set([
  '/medals', '/matches', '/groups', '/schedule', '/results', '/history', '/about',
  '/sport', '/niigem', '/#ajillagaa',
])

function navLinksMatchDefaults(links: NavLink[]): boolean {
  const d = DEFAULT_SETTINGS.nav_links
  if (links.length !== d.length) return false
  return d.every((item, i) => {
    const cur = links[i]
    if (!cur || cur.href !== item.href || cur.label !== item.label) return false
    const dc = item.children ?? []
    const cc = cur.children ?? []
    if (dc.length !== cc.length) return false
    return dc.every((c, j) => cc[j]?.href === c.href && cc[j]?.label === c.label)
  })
}

function isPreviousDefaultNav(links: NavLink[]): boolean {
  if (links.some(l => l.children?.length)) return false
  const prevLabels = [
    ['Нүүр', 'Бүтэц', 'Мэдээ', 'Спорт', 'Урлаг', 'Бүлэгүүд', 'Зургийн цомог'],
    ['Нүүр', 'Бүтэц зохион байгуулалт', 'Мэдээ', 'Спорт', 'Урлаг', 'Бүлэгүүд', 'Зургийн цомог'],
  ]
  const labels = links.map(l => l.label)
  return prevLabels.some(prev => prev.length === labels.length && prev.every((l, i) => labels[i] === l))
}

function migrateAlbadaNav(links: NavLink[]): NavLink[] {
  return links.map(l => {
    if (l.label !== 'Бүлэгүүд' && l.href !== '/buleg' && l.href !== '/albada') return l
    if (l.label === 'Албадууд' && l.children?.length) return l
    return {
      href: '/albada',
      label: 'Албадууд',
      children: ALBADA_NAV_CHILDREN,
    }
  })
}

function migrateDelkhin89NavChildren(links: NavLink[]): NavLink[] {
  const renames: Record<string, string> = {
    '/delkhin-89/amerik': 'Америк дах 89 чүүд',
    '/delkhin-89/solongs': 'Солонгос дах 89 чүүд',
    '/delkhin-89/yapon': 'Япон дах 89 чүүд',
  }
  return links.map(l => {
    if (l.href !== '/delkhin-89' || !l.children?.length) return l
    return {
      ...l,
      children: l.children.map(c => {
        const label = renames[c.href]
        return label ? { ...c, label } : c
      }),
    }
  })
}

function migrateButetsNavChildren(links: NavLink[]): NavLink[] {
  return links.map(l => {
    if (l.href !== '/butets' || !l.children?.length) return l
    if (l.children.some(c => c.href === '/butets/alba')) return l
    const children = [...l.children]
    const zovIdx = children.findIndex(c => c.href === '/butets/zovlol')
    const alba = { href: '/butets/alba', label: 'Гүйцэтгэх алба' }
    if (zovIdx >= 0) children.splice(zovIdx, 0, alba)
    else children.push(alba)
    return { ...l, children }
  })
}

function normalizeNavLinks(links: NavLink[]): NavLink[] {
  if (!Array.isArray(links) || links.length === 0) return DEFAULT_SETTINGS.nav_links
  const migrated = migrateAlbadaNav(migrateDelkhin89NavChildren(migrateButetsNavChildren(links.map(l =>
    l.label === 'Бүлэгүүд' && l.href === '/sport/v-naadam/groups'
      ? { ...l, href: '/albada', label: 'Албадууд', children: ALBADA_NAV_CHILDREN }
      : l,
  ))))
  if (navLinksMatchDefaults(migrated)) return migrated
  const hasLegacy = migrated.some(l => LEGACY_NAV_HREFS.has(l.href))
  const hasTournamentLabels = migrated.some(l =>
    ['Тоглолтын хуваарь', 'Хэсэг', 'Хөтөлбөр', 'Медалийн хүснэгт', 'Наадмын тухай', 'Түүх', 'Үр дүн', 'Манай ажиллагаа'].includes(l.label),
  )
  const hasOldOrgNav = migrated.some(l => l.href === '/#ajillagaa' || l.label === 'Манай ажиллагаа')
  if (hasLegacy || hasTournamentLabels || hasOldOrgNav || isPreviousDefaultNav(migrated)) return DEFAULT_SETTINGS.nav_links
  return migrated
}

export async function getSiteSettings(): Promise<SiteSettings & { _tableExists: boolean }> {
  const supabase = createServiceClient()
  const { data, error } = await supabase.from('site_settings').select('key, value')
  const result = structuredClone(DEFAULT_SETTINGS) as SiteSettings
  const tableExists = !error

  for (const row of data ?? []) {
    if (row.key in result) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(result as any)[row.key] = row.value
    }
  }
  if (!result.general || typeof result.general !== 'object') result.general = DEFAULT_SETTINGS.general
  const OLD_MOTTO = 'Өнгөлөг · Сүрлэг · Тэнгэрлэг · Ухаалаг'
  if (result.general.motto === OLD_MOTTO) result.general.motto = DEFAULT_SETTINGS.general.motto
  result.general.siteName = normalizeSiteName(result.general.siteName)
  result.general = normalizeGeneralContact(result.general)
  if (result.hero?.logoColorPath === '/logo-color.png') result.hero.logoColorPath = '/logo-color.jpg'
  if (result.hero?.logoWhitePath === '/logo-white.png') result.hero.logoWhitePath = '/logo-white.jpg'
  if (!Array.isArray(result.host_aimags)) result.host_aimags = DEFAULT_SETTINGS.host_aimags
  result.host_aimags = result.host_aimags.map(h => ({
    ...h,
    logoPath: h.logoPath || AIMAG_LOGO[h.name] || '',
  }))
  if (!result.about || typeof result.about !== 'object') result.about = DEFAULT_SETTINGS.about
  if (!Array.isArray(result.about.facts))    result.about.facts    = DEFAULT_SETTINGS.about.facts
  if (!Array.isArray(result.about.values))   result.about.values   = DEFAULT_SETTINGS.about.values
  if (!Array.isArray(result.about.editions)) result.about.editions = DEFAULT_SETTINGS.about.editions
  if (!result.home_sections || typeof result.home_sections !== 'object') result.home_sections = DEFAULT_SETTINGS.home_sections
  result.home_news_sectors = mergeHomeNewsSectors(result.home_news_sectors)
  result.home_copy = mergeHomeCopy(result.home_copy as Partial<HomeCopy> | undefined)
  if (!Array.isArray(result.news_tags)) result.news_tags = DEFAULT_SETTINGS.news_tags
  if (!Array.isArray(result.news)) result.news = DEFAULT_SETTINGS.news
  result.news = sortNewsByDate(result.news.map(normalizeNewsArticle))
  if (!Array.isArray(result.news_pending)) result.news_pending = DEFAULT_SETTINGS.news_pending
  if (!result.facebook_sync || typeof result.facebook_sync !== 'object') {
    result.facebook_sync = { ...DEFAULT_FACEBOOK_SYNC }
  }
  if (!Array.isArray(result.medal_standings)) result.medal_standings = DEFAULT_SETTINGS.medal_standings
  if (!Array.isArray(result.schedule)) result.schedule = DEFAULT_SETTINGS.schedule
  for (const day of result.schedule) {
    if (!Array.isArray(day.main))  day.main  = []
    if (!Array.isArray(day.extra)) day.extra = []
  }
  if (!result.footer_nav?.col1?.links || !result.footer_nav?.col2?.links) {
    result.footer_nav = DEFAULT_SETTINGS.footer_nav
  }
  if (!Array.isArray(result.scoring_links)) result.scoring_links = DEFAULT_SETTINGS.scoring_links
  if (!Array.isArray(result.tournament_history)) result.tournament_history = DEFAULT_SETTINGS.tournament_history
  if (!Array.isArray(result.host_schedule)) result.host_schedule = DEFAULT_SETTINGS.host_schedule
  if (!Array.isArray(result.schedule_sports)) result.schedule_sports = DEFAULT_SETTINGS.schedule_sports
  if (!Array.isArray(result.sport_overrides)) result.sport_overrides = []
  if (!Array.isArray(result.manual_medal_results)) result.manual_medal_results = []
  if (!Array.isArray(result.nav_links)) result.nav_links = DEFAULT_SETTINGS.nav_links
  else result.nav_links = normalizeNavLinks(result.nav_links)
  result.content_pages = {
    ...mergeContentPages(result.content_pages as Record<string, Partial<ContentPage>> | undefined),
    ...mergeDepartmentContentPages(result.content_pages as Record<string, Partial<ContentPage>> | undefined),
  }
  result.structure_data = mergeStructureData(result.structure_data as Partial<StructureData> | undefined)
  result.sport_star_groups = mergeSportStarGroups(result.sport_star_groups)
  result.charter_document = mergeCharterDocument(result.charter_document as Partial<CharterDocument> | undefined)
  return { ...result, _tableExists: tableExists }
}
