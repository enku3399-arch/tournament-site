export type TournamentStatus = 'draft' | 'active' | 'completed'
export type MatchStatus = 'scheduled' | 'live' | 'completed' | 'cancelled'
export type TeamStatus = 'pending' | 'confirmed'
export type SportType = 'basketball' | 'volleyball' | 'darts' | 'table_tennis' | 'chess' | 'wrestling' | 'custom'
export type Gender = 'male' | 'female' | null
export type MatchStage = 'group' | 'knockout'

export interface Tournament {
  id: string
  name: string
  description: string | null
  location: string | null
  start_date: string | null
  end_date: string | null
  organizer_name: string | null
  organizer_phone: string | null
  prize_info: string | null
  rules: string | null
  status: TournamentStatus
  admin_code: string
  created_at: string
}

export interface TournamentSport {
  id: string
  tournament_id: string
  sport_type: SportType
  name: string
  gender: Gender
  weight: number
  format: string           // 'groups_knockout' | 'knockout'
  groups_count: number
  advance_per_group: number
  created_at: string
}

export interface Team {
  id: string
  tournament_id: string
  sport_id: string | null
  name: string
  contact_name: string | null
  contact_phone: string | null
  seed: number | null
  status: TeamStatus
  created_at: string
}

export interface Match {
  id: string
  tournament_id: string
  sport_id: string
  team1_id: string | null
  team2_id: string | null
  round: number
  match_number: number
  scheduled_at: string | null
  status: MatchStatus
  team1_score: number | null
  team2_score: number | null
  winner_id: string | null
  judge_code: string
  notes: string | null
  stage: MatchStage
  group_id: string | null
  created_at: string
}

export interface Group {
  id: string
  tournament_id: string
  sport_id: string
  name: string             // 'A', 'B', 'C', 'D'
  advance_count: number
  created_at: string
}

export interface GroupTeam {
  id: string
  group_id: string
  team_id: string
}

// Joined types
export interface MatchWithTeams extends Match {
  team1: Team | null
  team2: Team | null
  winner: Team | null
  sport: TournamentSport
}

export interface GroupWithTeams extends Group {
  teams: Team[]
}

export interface TournamentWithSports extends Tournament {
  tournament_sports: TournamentSport[]
}

// Group standings row (calculated)
export interface GroupStanding {
  team: Team
  played: number
  wins: number
  draws: number
  losses: number
  gf: number
  ga: number
  gd: number
  points: number
  advanced: boolean
}

// Combined standings
export interface StandingsRow {
  teamName: string
  sports: Record<string, { placement: number; points: number }>
  total: number
}

export const SPORT_LABELS: Record<string, string> = {
  basketball:   'Сагсан бөмбөг',
  volleyball:   'Волейбол',
  darts:        'Дартс',
  table_tennis: 'Ширээний теннис',
  chess:        'Шатар',
  wrestling:    'Бөх',
  custom:       'Бусад',
}

export const SPORT_ICONS: Record<string, string> = {
  basketball:   '🏀',
  volleyball:   '🏐',
  darts:        '🎯',
  table_tennis: '🏓',
  chess:        '♟️',
  wrestling:    '🤼',
  custom:       '🏅',
}

export const GENDER_LABELS: Record<string, string> = {
  male:   'Эрэгтэй',
  female: 'Эмэгтэй',
}

export function sportDisplayName(sport: { sport_type: string; name: string; gender?: Gender }): string {
  return sport.name || SPORT_LABELS[sport.sport_type] || sport.sport_type
}

export function genderIcon(gender: Gender): string {
  if (gender === 'male') return '♂'
  if (gender === 'female') return '♀'
  return ''
}

// Бага оноогийн систем: байр = оноо (1-р байр = 1 оноо, доод тоо ялна)
// Зөвхөн медаль авсан (1-3) тоологдоно
export const PLACEMENT_POINTS: Record<number, number> = {
  1: 1,
  2: 2,
  3: 3,
}
