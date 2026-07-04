export interface HomePrideStat {
  num: string
  plus: boolean
  label: string
}

export const DEFAULT_HOME_PRIDE_STATS: HomePrideStat[] = [
  { num: '24', plus: false, label: 'Хөдөлмөрийн\nбаатар' },
  { num: '5', plus: false, label: 'Ажлын\nбаатар' },
  { num: '7', plus: false, label: 'Мастер' },
  { num: '1,200', plus: true, label: 'Алдартнууд' },
  { num: '3', plus: false, label: 'Цолтнууд' },
]
