export interface BoardMember {
  id: string
  aimag: string
  name: string
  phone: string
  facebook: string
}

export interface ExecutiveDepartment {
  id: string
  num: number
  name: string
  head: string
  phone: string
}

export interface StructureData {
  orgChartPath: string
  orgChartAlt: string
  boardPeriod: string
  boardMembers: BoardMember[]
  departmentsTitle: string
  departments: ExecutiveDepartment[]
}

export const DEFAULT_BOARD_MEMBERS: BoardMember[] = [
  { id: 'b1', aimag: 'Архангай', name: 'Ц.Эрдэнэбаатар', phone: '99112376', facebook: 'Tsogbadrakh Erdenebaatar' },
  { id: 'b2', aimag: 'Баянхонгор', name: 'Ж.Ерөөлтхуяг', phone: '95953133', facebook: 'Ерөөлтхуяг Жагварал' },
  { id: 'b3', aimag: 'Багануур', name: 'М.Батцэцэг', phone: '99820770', facebook: 'М.Батцэцэг' },
  { id: 'b4', aimag: 'Баян-Өлгий', name: 'Х.Жанибек', phone: '99422231', facebook: 'Janibek Khurmet' },
  { id: 'b5', aimag: 'Булган', name: 'Д.Цогоо', phone: '99009632', facebook: 'Tsogoo dagvadorj' },
  { id: 'b6', aimag: 'Говь-Алтай', name: 'Д.Батсүх', phone: '99197235', facebook: 'Батсүх Доржсүрэн' },
  { id: 'b7', aimag: 'Дархан-Уул', name: 'Н.Отгонбаяр', phone: '80061118', facebook: 'Namkhai Otgonbayar' },
  { id: 'b8', aimag: 'Дорнод', name: 'Б.Батхүү', phone: '', facebook: 'Birvaa Batkhuu' },
  { id: 'b9', aimag: 'Дорноговь', name: 'Мөнхгэрэл', phone: '99313914', facebook: 'Marbo Barom' },
  { id: 'b10', aimag: 'Дундговь', name: 'С.Батхүү', phone: '99993009', facebook: 'Batkhuu Suriye' },
  { id: 'b11', aimag: 'Завхан', name: 'Бямбацогт', phone: '88606565', facebook: 'Damdin Byambatsogt' },
  { id: 'b12', aimag: 'Орхон', name: 'Н.Бадамханд', phone: '99042699', facebook: 'Natsag Badmaa' },
  { id: 'b13', aimag: 'Өвөрхангай', name: 'Ц.Энх-Амгалан', phone: '99111605', facebook: 'Enkh Tsedev' },
  { id: 'b14', aimag: 'Өмнөговь', name: 'В.Мөнхбат', phone: '99116217', facebook: 'Ваанчиг Мөнхбат' },
  { id: 'b15', aimag: 'Сүхбаатар', name: 'Энхтүүл', phone: '99200068', facebook: 'Batsukh Enkhtuul' },
  { id: 'b16', aimag: 'Сэлэнгэ', name: 'Н.Мөнхтунгалаг', phone: '85122887', facebook: 'Нямцэрэн Мөнхтунгалаг' },
  { id: 'b17', aimag: 'Төв', name: 'Б.Уртнасан', phone: '88107218', facebook: 'Urtnasan Batsukh' },
  { id: 'b18', aimag: 'Увс', name: 'А.Энхтуяа', phone: '89115078', facebook: 'Algaa Enkhtuya' },
  { id: 'b19', aimag: 'Ховд', name: 'Н.Төрбат', phone: '89113485', facebook: 'Nyamaa Turbat' },
  { id: 'b20', aimag: 'Хөвсгөл', name: 'Х.Цэгмид', phone: '88117822', facebook: 'Tsegmid Kh' },
  { id: 'b21', aimag: 'Хэнтий', name: 'Д.Цэнд-Аюуш', phone: '99076525', facebook: 'Dashdorj Tseegii' },
]

export const DEFAULT_EXECUTIVE_DEPARTMENTS: ExecutiveDepartment[] = [
  { id: 'd1', num: 1, name: 'Гүйцэтгэх захирал', head: 'В.Мөнхбат', phone: '99116217' },
  { id: 'd2', num: 2, name: 'Эрүүл мэнд', head: 'Н.Энхтуяа', phone: '80812727' },
  { id: 'd3', num: 3, name: 'Боловсрол', head: 'Б.Цэрэндолгор', phone: '88198272' },
  { id: 'd4', num: 4, name: 'Нийгмийн харилцаа', head: 'Б.Уртнасан', phone: '88107218' },
  { id: 'd5', num: 5, name: 'Соёл урлаг', head: 'Х.Ариунаа', phone: '99193383' },
  { id: 'd6', num: 6, name: 'Спорт', head: 'С.Саранцэцэг', phone: '91915546' },
  { id: 'd7', num: 7, name: 'Аялал жуулчлал', head: 'Б.Янжмаа', phone: '99119054' },
  { id: 'd8', num: 8, name: 'Бизнес хөгжил', head: 'Ц.Энх-Амгалан', phone: '99111605' },
  { id: 'd9', num: 9, name: 'Админ, хэвлэл', head: 'П.Наранбат', phone: '99249400' },
]

export const DEFAULT_STRUCTURE_DATA: StructureData = {
  orgChartPath: '/media/structure/org-chart.png',
  orgChartAlt: 'Монгол 87, 89 төгсөгчдийн Үеийн нөхөрлөлийн үйлс нэг ГҮТББ-ын үйл ажиллагааны схем',
  boardPeriod: '2025–2026',
  boardMembers: DEFAULT_BOARD_MEMBERS,
  departmentsTitle: 'Гүйцэтгэх захирлын албадын мэдээлэл',
  departments: DEFAULT_EXECUTIVE_DEPARTMENTS,
}

function mergeBoardMembers(raw?: Partial<BoardMember>[]): BoardMember[] {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_BOARD_MEMBERS.map(m => ({ ...m }))
  return raw.map((m, i) => ({
    id: m.id || `b${i + 1}`,
    aimag: m.aimag?.trim() || '',
    name: m.name?.trim() || '',
    phone: m.phone?.trim() || '',
    facebook: m.facebook?.trim() || '',
  }))
}

function mergeDepartments(raw?: Partial<ExecutiveDepartment>[]): ExecutiveDepartment[] {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_EXECUTIVE_DEPARTMENTS.map(d => ({ ...d }))
  return raw.map((d, i) => ({
    id: d.id || `d${i + 1}`,
    num: d.num ?? i + 1,
    name: d.name?.trim() || '',
    head: d.head?.trim() || '',
    phone: d.phone?.trim() || '',
  }))
}

export function mergeStructureData(raw?: Partial<StructureData> | null): StructureData {
  const d = DEFAULT_STRUCTURE_DATA
  return {
    orgChartPath: raw?.orgChartPath?.trim() || d.orgChartPath,
    orgChartAlt: raw?.orgChartAlt?.trim() || d.orgChartAlt,
    boardPeriod: raw?.boardPeriod?.trim() || d.boardPeriod,
    boardMembers: mergeBoardMembers(raw?.boardMembers),
    departmentsTitle: raw?.departmentsTitle?.trim() || d.departmentsTitle,
    departments: mergeDepartments(raw?.departments),
  }
}

export const BUTETS_SUBNAV = [
  { href: '/butets', label: 'Бүтцийн схем' },
  { href: '/butets/alba', label: 'Гүйцэтгэх алба' },
  { href: '/butets/zovlol', label: 'Удирдах зөвлөл' },
  { href: '/butets/durmiin', label: 'ТББ-ын дүрэм' },
  { href: '/butets/belegdel', label: 'Бэлэгдэл' },
  { href: '/butets/baga-khural', label: 'Бага хурал' },
] as const
