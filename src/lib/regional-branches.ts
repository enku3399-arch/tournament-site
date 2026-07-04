import { AIMAG_LOGO } from '@/lib/aimag-logo'

/** Орон нутгийн салбар нэгж — аймаг + дүүрэг (давхардлыг арилгасан) */
export const REGIONAL_BRANCH_NAMES = [
  'Архангай',
  'Багануур',
  'Баян-Өлгий',
  'Баянхонгор',
  'Булган',
  'Говь-Алтай',
  'Говьсүмбэр',
  'Дархан-Уул',
  'Дорноговь',
  'Дорнод',
  'Дундговь',
  'Завхан',
  'Орхон',
  'Өвөрхангай',
  'Өмнөговь',
  'Сэлэнгэ',
  'Сүхбаатар',
  'Төв',
  'Увс',
  'Ховд',
  'Хөвсгөл',
  'Хэнтий',
  'Сүхбаатар дүүрэг',
  'Ажилчин',
  'Найрамдал',
  'Улаанбаатар',
] as const

const LOGO_ALIASES: Record<string, string> = {
  'Сүхбаатар': 'Сүхбаатар аймаг',
}

export function regionalBranchLogo(name: string): string {
  return AIMAG_LOGO[name] || AIMAG_LOGO[LOGO_ALIASES[name] ?? ''] || ''
}

export interface RegionalBranch {
  name: string
  logoPath: string
}

export function getRegionalBranches(): RegionalBranch[] {
  return [...REGIONAL_BRANCH_NAMES]
    .sort((a, b) => a.localeCompare(b, 'mn'))
    .map(name => ({
      name,
      logoPath: regionalBranchLogo(name),
    }))
}
