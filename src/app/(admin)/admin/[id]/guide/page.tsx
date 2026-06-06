import { notFound } from 'next/navigation'
import { createServiceClient as createClient } from '@/lib/supabase-server'
import { SPORT_ICONS, SPORT_LABELS } from '@/lib/types'
import PrintButton from './PrintButton'

export const dynamic = 'force-dynamic'

// Спорт → хаана болох (3 өдрийн хуваарь)
const SPORT_VENUE: Record<string, { day: string; venue: string; time: string }> = {
  volleyball:   { day: 'VI/11-12', venue: 'Буянт-Ухаа спорт цогцолборт', time: '08:00' },
  basketball:   { day: 'VI/11-12', venue: 'Буянт-Ухаа спорт цогцолборт', time: '08:00' },
  darts:        { day: 'VI/13', venue: 'Хандгайт "Олимп" цогцолборт', time: '09:00' },
  table_tennis: { day: 'VI/13', venue: 'Хандгайт "Олимп" цогцолборт', time: '09:00' },
  chess:        { day: 'VI/13', venue: 'Хандгайт "Олимп" цогцолборт', time: '09:00' },
}

const SPORT_RULES: Record<string, string[]> = {
  volleyball: [
    '12 эрэгтэй, 12 эмэгтэй тамирчин',
    'Монголын Волейболын холбооны дүрмийн дагуу',
    'Талд 21 оноогоор 2 үе тоглох. Тэнцвэл 15 оноогоор 3-р үе явагдаж 2 оноогоор гүйцэж хожлыг авна.',
  ],
  basketball: [
    '10 эрэгтэй, 10 эмэгтэй тамирчин',
    'Монголын Сагсан бөмбөгийн холбооны дүрмийн дагуу',
    'Баг 2 өлгийн жилд тоглолтын хувцастай байна (1 цайвар өнгө)',
  ],
  darts: [
    '2 эрэгтэй + 2 эмэгтэй = нийт 4 тамирчин (1 баг)',
    '501 онооноос буулгаж тоглох',
    '45 сүманд захын үржвэрээр дуусгана. Дуусаагүй бол буухын нүдэнд ойрхон шилсэн нь хожил авна.',
  ],
  table_tennis: [
    '2 эрэгтэй + 2 эмэгтэй тамирчин (1 баг)',
    'Эр-Эр, Эм-Эм, Холимог хос, Эр-Эр, Эм-Эм дараалаар тоглох',
    'Түрүүлж 3 хожил авсан баг хожлыг авна.',
  ],
  chess: [
    '1 эрэгтэй + 1 эмэгтэй тамирчин (1 баг)',
    'Монголын Шатрын холбооны дүрмийн дагуу',
    'Мэргэжлийн шүүгчдийн холбоотой хамтран зохион байгуулна.',
  ],
}

export default async function GuidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createClient()

  const [{ data: t }, { data: sports }, { data: teams }] = await Promise.all([
    supabase.from('tournaments').select('*').eq('id', id).single(),
    supabase.from('tournament_sports').select('*').eq('tournament_id', id).order('created_at'),
    supabase.from('teams').select('*').eq('tournament_id', id).order('sport_id').order('seed').order('name'),
  ])

  if (!t) notFound()

  const sportList = sports ?? []
  const teamList  = teams  ?? []

  return (
    <div>
      <div className="mb-6 flex gap-3 print:hidden">
        <PrintButton />
        <a href={`/t/${id}`} target="_blank" className="rounded-lg border border-border px-5 py-2 text-sm hover:bg-surface-2">
          Нийтийн хуудас харах
        </a>
      </div>

      <div className="bg-white text-black rounded-xl shadow-lg max-w-3xl mx-auto p-10 print:shadow-none print:rounded-none print:p-8">

        {/* Гарчиг */}
        <div className="text-center border-b-2 border-black pb-6 mb-8">
          <div className="text-sm font-bold mb-1">МОНГОЛ 87/89 "ҮЕИЙН НӨХДИЙН ҮЙЛС НЭГ" ХОЛБОО ГУТГӨ-БЫН</div>
          <div className="text-sm mb-2">ТӨЛӨӨЛӨН УДИРДАХ ЗӨВЛӨЛ</div>
          <h1 className="text-2xl font-extrabold uppercase tracking-wide mb-1">{t.name}</h1>
          <p className="font-bold text-base">ТЭМЦЭЭНИЙ УДИРДАМЖ</p>
          <p className="text-sm mt-1">Улаанбаатар хот · 2026 он 05 сарын 14</p>
        </div>

        {/* Нэг. Зорилго */}
        <section className="mb-5">
          <h2 className="font-bold text-base mb-2 uppercase border-b border-gray-300 pb-1">Нэг. Зорилго</h2>
          <p className="text-sm leading-relaxed">Үе тэнгийн төгсөгчдийн эв нэгдлийг бэхжүүлэх, чөлөөт цагийг зөв өнгөрүүлэх, спортын арга хэмжээнд өргөнөөр хамруулан бие чийрэг хамт олныг нэгтгэхэд спорт наадмын гол зорилго оршино.</p>
        </section>

        {/* Хоёр. Ерөнхий зүйл */}
        <section className="mb-5">
          <h2 className="font-bold text-base mb-2 uppercase border-b border-gray-300 pb-1">Хоёр. Ерөнхий зүйл</h2>
          <ul className="text-sm space-y-1 list-none">
            <li><b>2.1.</b> Монгол улсад 1987 онд 8-р анги, 1989 онд 10-р анги төгссөн төгсөгчид оролцно.</li>
            <li><b>2.2.</b> 1 аймгаас нэг баг, Улаанбаатарын хувьд 1989 оны захиргааны нэгжийн дагуу дүүрэг тус бүрээс нэг баг оролцно.</li>
            <li><b>2.3.</b> Спортын 5 төрлөөр тэмцээн явагдаж, багийн дүнгээр шилжин явах цом гардуулна.</li>
          </ul>
        </section>

        {/* Гурав. 3 өдрийн хуваарь */}
        <section className="mb-5">
          <h2 className="font-bold text-base mb-2 uppercase border-b border-gray-300 pb-1">Гурав. Хугацаа ба байршил</h2>
          <table className="w-full text-sm border-collapse mb-3">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 py-1.5 px-2 text-left">Өдөр</th>
                <th className="border border-gray-300 py-1.5 px-2 text-left">Байршил</th>
                <th className="border border-gray-300 py-1.5 px-2 text-left">Эхлэх цаг</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 py-1.5 px-2 font-bold">2026.06.11-12</td>
                <td className="border border-gray-300 py-1.5 px-2">Буянт-Ухаа спорт цогцолборт</td>
                <td className="border border-gray-300 py-1.5 px-2 font-bold">08:00</td>
              </tr>
              <tr>
                <td className="border border-gray-300 py-1.5 px-2 font-bold">2026.06.13</td>
                <td className="border border-gray-300 py-1.5 px-2">Хандгайт "Олимп" цогцолборт</td>
                <td className="border border-gray-300 py-1.5 px-2 font-bold">09:00</td>
              </tr>
              <tr>
                <td className="border border-gray-300 py-1.5 px-2 font-bold">2026.06.13</td>
                <td className="border border-gray-300 py-1.5 px-2">Хандгайт Их тамир амралт "Чингис Хаан" их танхимд — <b>NICE PARTY</b></td>
                <td className="border border-gray-300 py-1.5 px-2 font-bold">18:00</td>
              </tr>
            </tbody>
          </table>
          <p className="text-sm"><b>Нээлтийн үйл ажиллагаа:</b> 2026.06.11 · 13:00 цагт. Багууд бүрэн бүрэлдэхүүнээр, жилд хувцаслалттай аймаг/дүүргийнхээ тугийг барьсан оролцоно.</p>
        </section>

        {/* Дөрөв. Тэмцээний төрлүүд */}
        <section className="mb-5">
          <h2 className="font-bold text-base mb-2 uppercase border-b border-gray-300 pb-1">Дөрөв. Тэмцээний төрлүүд</h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 py-1 px-2">#</th>
                <th className="border border-gray-300 py-1 px-2 text-left">Спортын төрөл</th>
                <th className="border border-gray-300 py-1 px-2 text-left">Оролцогчид</th>
                <th className="border border-gray-300 py-1 px-2 text-left">Өдөр</th>
                <th className="border border-gray-300 py-1 px-2 text-left">Байршил</th>
              </tr>
            </thead>
            <tbody>
              {sportList.map((s: any, i: number) => {
                const v = SPORT_VENUE[s.sport_type] ?? { day: '—', venue: s.name, time: '' }
                const ruleKey = s.sport_type as string
                const firstRule = SPORT_RULES[ruleKey]?.[0] ?? ''
                return (
                  <tr key={s.id}>
                    <td className="border border-gray-300 py-1 px-2 text-center">{i + 1}</td>
                    <td className="border border-gray-300 py-1 px-2 font-semibold">
                      {SPORT_ICONS[s.sport_type] ?? '🏅'} {s.name}
                    </td>
                    <td className="border border-gray-300 py-1 px-2 text-xs">{firstRule}</td>
                    <td className="border border-gray-300 py-1 px-2 text-xs whitespace-nowrap">{v.day}</td>
                    <td className="border border-gray-300 py-1 px-2 text-xs">{v.venue}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>

        {/* Тав. Спортын дүрэм */}
        <section className="mb-5">
          <h2 className="font-bold text-base mb-2 uppercase border-b border-gray-300 pb-1">Тав. Тэмцээний дүрэм</h2>
          {sportList.map((s: any) => {
            const rules = SPORT_RULES[s.sport_type]
            if (!rules) return null
            return (
              <div key={s.id} className="mb-3">
                <p className="font-semibold text-sm mb-1">{SPORT_ICONS[s.sport_type]} {s.name}</p>
                <ul className="text-sm space-y-0.5 pl-4">
                  {rules.map((r, i) => <li key={i} className="list-disc">{r}</li>)}
                </ul>
              </div>
            )
          })}
        </section>

        {/* Зургаа. Шагнал ба дүгнэх журам */}
        <section className="mb-5">
          <h2 className="font-bold text-base mb-2 uppercase border-b border-gray-300 pb-1">Зургаа. Дүгнэх журам, шагнал</h2>
          <ul className="text-sm space-y-1">
            <li><b>7.1.</b> Тэмцээний нийлбэр оноог <b>бага оноогийн системээр</b> тооцно (1-р байр = 1 оноо, 2-р байр = 2 оноо, 3-р байр = 3 оноо).</li>
            <li><b>7.2.</b> Зөвхөн медаль авсан багуудыг нийлбэр оноогоор эрэмбэлж, цомын эзнийг тодруулна. Оноо тэнцвэл медалийн чанараар эрэмбэлнэ.</li>
            <li><b>7.3.</b> Спортын төрөл тус бүрт эхний 3 байр эзэлсэн баг тамирчдыг медаль, мөнгөн шагналаар шагнана.</li>
            <li><b>7.4.</b> Сагсан бөмбөг, волейболын эрэгтэй, эмэгтэй тус бүрт нэг шилдэг тоглогч (нийт 4) — мөнгөн шагнал, дурсгалын зүйлээр шагнана.</li>
            <li><b>7.5.</b> Нэгдсэн дүнгийн 1-р байрт шилжин явах цом, өргөмжлөл, мөнгөн шагнал гардуулна.</li>
          </ul>
          {t.prize_info && <p className="text-sm mt-2 whitespace-pre-wrap">{t.prize_info}</p>}
        </section>

        {/* Долоо. Мэдүүлэг */}
        <section className="mb-5">
          <h2 className="font-bold text-base mb-2 uppercase border-b border-gray-300 pb-1">Долоо. Мэдүүлэг</h2>
          <ul className="text-sm space-y-1">
            <li>Хугацаа: <b>2026 оны 05 сарын 30-ны өдрийн дотор</b></li>
            <li>Цахим: <b>m.oyunchimeg@gmail.com</b></li>
            <li>Хураамж: 2,000,000₮ — Н.МОНХТУНГАЛАГ · IBAN: 13000500 · Дансны №: 5167485137</li>
            <li>Техникийн зөвлөгөөн: 2026.05.31 · 14:00 цагт Монгол 89 оффист</li>
          </ul>
          <div className="mt-2">
            <p className="text-sm font-semibold mb-1">Мэдүүлэгт бүрдүүлэх:</p>
            <ul className="text-sm pl-4 space-y-0.5">
              {['Овог нэр (бүтэн)', 'Регистрийн дугаар', 'Цээж зураг', 'Багийн ахлагч, дасгалжуулагч',
                'Эмчийн гарын үсэг, тамгаар батлагдсан', 'Иргэний үнэмлэхний хуулбар', 'Төгсөлтийн гэрчилгээний хуулбар'].map(item => (
                <li key={item} className="list-disc">{item}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Найм. Холбоо барих */}
        <section className="mb-5">
          <h2 className="font-bold text-base mb-2 uppercase border-b border-gray-300 pb-1">Найм. Холбоо барих</h2>
          <div className="text-sm space-y-1">
            {t.organizer_name && <p><b>Зохион байгуулагч:</b> {t.organizer_name}</p>}
            {t.organizer_phone && <p><b>Утас:</b> {t.organizer_phone}</p>}
            <p><b>Нэмэлт утас:</b> 91915546, 86681758</p>
          </div>
        </section>

        {/* Оролцогч багуудын жагсаалт */}
        {sportList.map((s: any) => {
          const sportTeams = teamList.filter((tm: any) => tm.sport_id === s.id)
          if (sportTeams.length === 0) return null
          return (
            <section key={s.id} className="mb-6">
              <h2 className="font-bold text-base mb-2 uppercase border-b border-gray-300 pb-1">
                {SPORT_ICONS[s.sport_type] ?? '🏅'} {s.name} — Оролцогч багууд ({sportTeams.length})
              </h2>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 py-1 px-2 text-left w-8">#</th>
                    <th className="border border-gray-300 py-1 px-2 text-left">Аймаг / Дүүрэг</th>
                    <th className="border border-gray-300 py-1 px-2 text-left">Холбоо барих</th>
                  </tr>
                </thead>
                <tbody>
                  {sportTeams.map((team: any, idx: number) => (
                    <tr key={team.id} className={idx % 2 === 0 ? '' : 'bg-gray-50'}>
                      <td className="border border-gray-300 py-1 px-2">{idx + 1}</td>
                      <td className="border border-gray-300 py-1 px-2 font-medium">{team.name}</td>
                      <td className="border border-gray-300 py-1 px-2 text-gray-600 text-xs">
                        {[team.contact_name, team.contact_phone].filter(Boolean).join(' — ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )
        })}

        <div className="mt-8 border-t border-gray-300 pt-4 text-center text-xs text-gray-400">
          <p>Шууд дүн харах: {typeof window !== 'undefined' ? window.location.host : ''}/t/{id.slice(0, 8)}</p>
        </div>
      </div>
    </div>
  )
}
