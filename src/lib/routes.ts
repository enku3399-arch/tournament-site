/** ТББ сайтын үндсэн замууд */
export const ROUTES = {
  home: '/',
  structure: '/butets',
  world89: '/delkhin-89',
  pride: '/bakharkhal',
  art: '/urlag',
  sport: '/sport',
  groups: '/albada',
  departments: '/albada',
  community: '/niigem',
  news: '/news',
  gallery: '/gallery',
  contact: '/contact',
} as const

/** V (5-р) спорт наадмын хуудсууд */
export const NAADAM = '/sport/v-naadam' as const

export const naadam = {
  home: NAADAM,
  news: `${NAADAM}/news`,
  groups: `${NAADAM}/groups`,
  matches: `${NAADAM}/matches`,
  schedule: `${NAADAM}/schedule`,
  results: `${NAADAM}/results`,
  live: `${NAADAM}/live`,
  medals: `${NAADAM}/medals`,
  about: `${NAADAM}/about`,
  history: `${NAADAM}/history`,
  register: `${NAADAM}/register`,
  gallery: `${NAADAM}/gallery`,
  teams: `${NAADAM}/teams`,
  sports: `${NAADAM}/sports`,
  chess: `${NAADAM}/chess`,
  darts: `${NAADAM}/darts`,
} as const
