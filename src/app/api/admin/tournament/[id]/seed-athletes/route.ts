import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

// UB districts as submitting organizations
const DISTRICTS = [
  { name: 'Сүхбаатар дүүрэг', contact: 'Батбаяр Гантулга', phone: '99001122' },
  { name: 'Баянзүрх дүүрэг', contact: 'Мөнхбат Нямдорж', phone: '88223344' },
  { name: 'Чингэлтэй дүүрэг', contact: 'Гантулга Болд', phone: '77334455' },
  { name: 'Хан-Уул дүүрэг', contact: 'Энхбаяр Цэрэн', phone: '99445566' },
  { name: 'Баянгол дүүрэг', contact: 'Баатар Дорж', phone: '88556677' },
  { name: 'Сонгинохайрхан дүүрэг', contact: 'Тэмүүжин Жамц', phone: '77667788' },
]

// Athlete pool per district (name, reg, rank)
const ATHLETE_POOL: Record<string, { name: string; reg: string; rank: string }[]> = {
  'Сүхбаатар дүүрэг': [
    { name: 'Батбаяр Дорж', reg: 'УА900515', rank: 'Спортын мастер' },
    { name: 'Нарантуяа Ганбат', reg: 'УА950822', rank: '1-р зэрэг' },
    { name: 'Мөнхбат Цэрэн', reg: 'УА880310', rank: 'Мастерийн нэр дэвшигч' },
    { name: 'Энхтуул Болд', reg: 'УА001205', rank: '2-р зэрэг' },
  ],
  'Баянзүрх дүүрэг': [
    { name: 'Тэмүүжин Нямдорж', reg: 'АА910718', rank: 'Спортын мастер' },
    { name: 'Алтанцэцэг Дорж', reg: 'АА970303', rank: '1-р зэрэг' },
    { name: 'Гантулга Баатар', reg: 'АА860925', rank: '1-р зэрэг' },
    { name: 'Солонго Мөнх', reg: 'АА030614', rank: '3-р зэрэг' },
  ],
  'Чингэлтэй дүүрэг': [
    { name: 'Энхбаяр Жамц', reg: 'ДА920112', rank: 'Мастерийн нэр дэвшигч' },
    { name: 'Оюунцэцэг Цэрэн', reg: 'ДА991107', rank: '2-р зэрэг' },
    { name: 'Баярмаа Болд', reg: 'ДА040820', rank: '3-р зэрэг' },
  ],
  'Хан-Уул дүүрэг': [
    { name: 'Сүхбаатар Ганбат', reg: 'БА890430', rank: 'Спортын мастер' },
    { name: 'Уянга Нямдорж', reg: 'БА960214', rank: '1-р зэрэг' },
    { name: 'Мөнгөнцэцэг Дорж', reg: 'БА020908', rank: '2-р зэрэг' },
    { name: 'Болд Баатар', reg: 'БА930625', rank: '1-р зэрэг' },
  ],
  'Баянгол дүүрэг': [
    { name: 'Нямдорж Мөнх', reg: 'ГА870816', rank: 'Мастерийн нэр дэвшигч' },
    { name: 'Дэлгэрмаа Цэрэн', reg: 'ГА010519', rank: '2-р зэрэг' },
    { name: 'Цэрэн-Очир Болд', reg: 'ГА941130', rank: '1-р зэрэг' },
  ],
  'Сонгинохайрхан дүүрэг': [
    { name: 'Жамц Баатар', reg: 'СА910327', rank: 'Спортын мастер' },
    { name: 'Энхжаргал Ганбат', reg: 'СА980711', rank: '1-р зэрэг' },
    { name: 'Батсүрэн Дорж', reg: 'СА850204', rank: 'Мастерийн нэр дэвшигч' },
    { name: 'Номин Мөнх', reg: 'СА050916', rank: '3-р зэрэг' },
  ],
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: tournamentId } = await params
  const supabase = createServiceClient()

  // Verify tournament
  const { data: tournament } = await supabase
    .from('tournaments').select('id').eq('id', tournamentId).single()
  if (!tournament)
    return NextResponse.json({ error: 'Тэмцээн олдсонгүй' }, { status: 404 })

  // Get all sports in this tournament
  const { data: sports } = await supabase
    .from('tournament_sports')
    .select('id, name, sport_type, gender')
    .eq('tournament_id', tournamentId)
    .order('created_at')

  if (!sports || sports.length === 0)
    return NextResponse.json({ error: 'Тэмцээнд спорт нэмэгдээгүй байна. Эхлээд спорт нэмнэ үү.' }, { status: 400 })

  let totalTeams = 0
  let totalAthletes = 0

  // Each district submits a declaration (мэдүүлэг) for each sport
  for (const district of DISTRICTS) {
    const athletes = ATHLETE_POOL[district.name] ?? []

    for (const sport of sports) {
      // Create team record (one per district per sport)
      const { data: team, error: teamErr } = await supabase
        .from('teams')
        .insert({
          tournament_id: tournamentId,
          sport_id: sport.id,
          name: district.name,
          contact_name: district.contact,
          contact_phone: district.phone,
          status: 'pending',
        })
        .select('id').single()

      if (teamErr) {
        console.error('Team insert error:', teamErr.message)
        continue
      }
      totalTeams++

      // Create athlete records for this team + sport
      const sportLabel = sport.name
      const athleteRecords = athletes.map(a => ({
        team_id: team.id,
        tournament_id: tournamentId,
        sport_id: sport.id,
        name: a.name,
        register_number: a.reg,
        rank: a.rank,
        participation_type: sportLabel,
        affiliation: 'Улаанбаатар',
        phone: null,
        notes: null,
      }))

      const { error: athErr } = await supabase.from('athletes').insert(athleteRecords)
      if (athErr) {
        console.error('Athletes insert error:', athErr.message)
      } else {
        totalAthletes += athleteRecords.length
      }
    }
  }

  return NextResponse.json({ ok: true, teams: totalTeams, athletes: totalAthletes, sports: sports.length })
}
