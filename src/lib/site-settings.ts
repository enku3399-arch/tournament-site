import { createServiceClient } from '@/lib/supabase-server'
import { AIMAG_LOGO } from '@/lib/aimag-logo'

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
  excerpt: string
  feature: boolean
  imagePath?: string
  facebookUrl?: string
}

export interface MedalRow {
  name: string
  g: number
  s: number
  b: number
}

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

export interface SiteSettings {
  general: SiteGeneral
  hero: SiteHero
  nav_links: NavLink[]
  sponsors: Sponsor[]
  stats: StatItem[]
  host_aimags: HostAimag[]
  about: SiteAbout
  home_sections: HomeSections
  news_tags: NewsTag[]
  news: NewsArticle[]
  medal_standings: MedalRow[]
  schedule: ScheduleDay[]
  footer_nav: FooterNav
  scoring_links: ScoringLink[]
  tournament_history: TournamentEditionHistory[]
  host_schedule: HostScheduleRow[]
  schedule_sports: string[]   // sport ID-ууд — нийтийн хуваарь хуудсанд харуулах
}

export const DEFAULT_SETTINGS: SiteSettings = {
  general: {
    siteName: 'Монгол 87/89 · V Спорт Наадам',
    edition: 'V',
    year: '2026',
    motto: 'Өнгөлөг · Сүрлэг · Тэнгэрлэг · Ухаалаг',
    dateDisplay: '06.11 — 06.13',
    venue: 'Буянт Ухаа',
    venueAddress: '"Буянт Ухаа" спорт ордон',
    hostAimags: 'Өмнөговь · Сэлэнгэ · Төв · Увс',
    teamCount: '21',
    athleteCount: '1,240+',
    phone: '+976 9911 0000',
    email: 'info@m8789.mn',
    address: 'Улаанбаатар, СБД',
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
    logoColorPath: '/logo-color.png',
    logoWhitePath: '/logo-white.png',
  },
  nav_links: [
    { href: '/', label: 'Нүүр' },
    { href: '/news', label: 'Мэдээ' },
    { href: '/medals', label: 'Медалийн хүснэгт' },
    { href: '/matches', label: 'Тоглолтын хуваарь' },
    { href: '/groups', label: 'Хэсэг' },
    { href: '/schedule', label: 'Хөтөлбөр' },
    { href: '/results', label: 'Үр дүн' },
    { href: '/gallery', label: 'Цомог' },
    { href: '/history', label: 'Түүх' },
    { href: '/about', label: 'Наадмын тухай' },
  ],
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
      title: 'Наадам',
      links: [
        { href: '/schedule', label: 'Хөтөлбөр' },
        { href: '/results',  label: 'Үр дүн' },
        { href: '/medals',   label: 'Медалийн хүснэгт' },
        { href: '/teams',    label: 'Багууд' },
      ],
    },
    col2: {
      title: 'Мэдээлэл',
      links: [
        { href: '/news',    label: 'Сүүлийн мэдээ' },
        { href: '/press',   label: 'Хэвлэлийн өрөө' },
        { href: '/gallery', label: 'Цомог' },
        { href: '/live',    label: 'Шууд дамжуулалт' },
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
  if (!Array.isArray(result.news_tags)) result.news_tags = DEFAULT_SETTINGS.news_tags
  if (!Array.isArray(result.news)) result.news = DEFAULT_SETTINGS.news
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
  return { ...result, _tableExists: tableExists }
}
