// scripts/seed.mjs
// Seeds the NTV 20th Anniversary Media Sports Championship 2026 tournament data
// Run with: node scripts/seed.mjs

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lrbcnlpqiqhxsycjihug.supabase.co'
const SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyYmNubHBxaXFoeHN5Y2ppaHVnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzgxNzU4OSwiZXhwIjoyMDkzMzkzNTg5fQ.2NSFDn_fp20F-iqXvZYLYto490e8y7rIIAfzbCTajAk'

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

// ─────────────────────────────────────────────────────────────────────────────
// TOURNAMENT DATA
// ─────────────────────────────────────────────────────────────────────────────

const TOURNAMENT_DATA = {
  name: 'МСНЭ-ийн гишүүн байгууллага, гишүүдийн дунд зохион байгуулагдаж буй 3 төрөлт спорт наадам',
  location: 'УБ, БГД, 20-р хороо, T-COURT ба V-COURT Спорт Танхим',
  start_date: '2026-05-09',
  end_date: '2026-05-10',
  organizer_name: 'МСНЭ, Эн Ти Ви Броадкастинг ХХК',
  organizer_phone: '91221944, 91118403',
  prize_info:
    'Нийт шагналын сан: 20,000,000₮\n' +
    '1-р байр: Алтан медаль + мөнгөн шагнал\n' +
    '2-р байр: Мөнгөн медаль + мөнгөн шагнал\n' +
    '3-р байр: Хүрэл медаль + мөнгөн шагнал\n' +
    'Төрөл тус бүр шилдэг эрэгтэй, эмэгтэй тоглогч тодорно.',
  description:
    'МСНЭ-ийн гишүүн байгууллага, гишүүдийн зохион байгуулдаг буй 3 төрлийн ' +
    'спорт наадмын аварга шалгаруулах тэмцээн. NTV телевизийн 20 жилийн ойг ' +
    'тохиолдуулан Монголын Сэтгүүлчдийн Нэгдсэн Эвлэлийн гишүүдийн чөлөөт ' +
    'цагийг зөв боловсон өнгөрүүлэх зорилгоор зохион байгуулав.',
  status: 'active',
  admin_code: 'NTV2026ADMIN',
}

// ─────────────────────────────────────────────────────────────────────────────
// SPORTS & GROUPS DATA
// ─────────────────────────────────────────────────────────────────────────────

const SPORTS_DATA = [
  {
    sport_type: 'basketball',
    name: 'Сагс 5х5 эр',
    gender: 'male',
    weight: 3,
    format: 'groups_knockout',
    groups_count: 8,
    advance_per_group: 2,
    judge_code: 'BASKET-M',
    venue: 'V-COURT',
    groups: {
      A: ['Зегий.мн Граф.мн 24цаг.мн', 'Эгүүр.мн', 'Орхон аймаг'],
      B: ['NTV', 'Монгол масс медиа', 'Шүүд.мн'],
      C: ['Тэнгэр тв', 'Монгол HD', 'Цахиур.мн Туг.мн Шүүд.мн'],
      D: ['Хэнтий аймаг СНЭ', 'SBN', 'PSN'],
      E: ['Ivoice.mn HumanZ.mn Sonin.mn', 'Рекорд.мн Гэрэл.мн Занги.мн', 'Хэвлэлийн төлөөлөгч'],
      F: ['МОНЦАМЭ', 'Тев аймаг СНЭ', 'Булган аймаг СНЭ'],
      G: ['25-р суваг телевиз', 'Дархан хот СНЭ'],
      H: ['MNB', 'Малчин тв'],
    },
  },
  {
    sport_type: 'basketball',
    name: 'Сагс 3х3 эм',
    gender: 'female',
    weight: 3,
    format: 'groups_knockout',
    groups_count: 4,
    advance_per_group: 2,
    judge_code: 'BASKET-F',
    venue: 'T-COURT',
    groups: {
      A: [
        'Дархан хот СНЭ',
        'Хэвлэлийн төлөөлөгч-2',
        'Цахиур.мн Туг.мн Шүүд.мн',
        'Ivoice.mn HumanZ.mn Sonin.mn',
      ],
      B: ['Зегий.мн Граф.мн 24цаг.мн', 'Орхон аймаг', 'MNB', 'Тев аймаг СНЭ'],
      C: ['Хэнтий аймаг СНЭ', 'Монгол HD', 'NTV'],
      D: ['Хэвлэлийн төлөөлөгч-1', 'PSN', 'TB9', 'Булган аймаг СНЭ'],
    },
  },
  {
    sport_type: 'volleyball',
    name: 'Холимог волейбол',
    gender: 'male',
    weight: 2,
    format: 'groups_knockout',
    groups_count: 4,
    advance_per_group: 2,
    judge_code: 'VOLLEY-M',
    venue: 'V-COURT (A,D) / T-COURT (B,C)',
    groups: {
      A: ['Ivoice.mn HumanZ.mn Sonin.mn', 'Монгол HD', 'Зегий.мн Граф.мн 24цаг.мн', 'TB9'],
      B: ['SBN', 'Дархан хот СНЭ', 'МОНЦАМЭ', 'MNB', 'Цахиур.мн Туг.мн Шүүд.мн'],
      C: [
        'Рекорд.мн Гэрэл.мн Занги.мн',
        'Орхон аймаг',
        'Хэвлэлийн төлөөлөгч',
        'Тев аймаг СНЭ',
        'Булган аймаг СНЭ',
      ],
      D: ['NTV', 'Малчин тв', 'Эгүүр.мн', 'Хэнтий аймаг СНЭ'],
    },
  },
  {
    sport_type: 'darts',
    name: 'Дартс баг',
    gender: null,
    weight: 1,
    format: 'knockout',
    groups_count: 0,
    advance_per_group: 0,
    judge_code: 'DARTS',
    venue: '',
    groups: {},
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// ROUND-ROBIN ALGORITHM
// ─────────────────────────────────────────────────────────────────────────────

function roundRobin(teamIds) {
  const teams = [...teamIds]
  if (teams.length % 2 !== 0) teams.push('BYE')
  const n = teams.length
  const rounds = []
  for (let r = 0; r < n - 1; r++) {
    const pairs = []
    for (let i = 0; i < n / 2; i++) {
      const a = teams[i]
      const b = teams[n - 1 - i]
      if (a !== 'BYE' && b !== 'BYE') pairs.push([a, b])
    }
    rounds.push(pairs)
    teams.splice(1, 0, teams.pop())
  }
  return rounds
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🚀 NTV 2026 Tournament Seed Script')
  console.log('='.repeat(60))

  // Check for existing tournament
  const { data: existing } = await supabase
    .from('tournaments')
    .select('id, name')
    .eq('name', TOURNAMENT_DATA.name)
    .maybeSingle()

  if (existing) {
    console.log(`⚠️  Аль хэдийн байна: ${existing.id}`)
    console.log('   Устгаж дахин үүсгэж байна...')

    const { data: existingGroups } = await supabase
      .from('groups')
      .select('id')
      .eq('tournament_id', existing.id)
    const groupIds = (existingGroups ?? []).map(g => g.id)

    await supabase.from('matches').delete().eq('tournament_id', existing.id)
    if (groupIds.length > 0) {
      await supabase.from('group_teams').delete().in('group_id', groupIds)
    }
    await supabase.from('groups').delete().eq('tournament_id', existing.id)
    await supabase.from('teams').delete().eq('tournament_id', existing.id)
    await supabase.from('tournament_sports').delete().eq('tournament_id', existing.id)
    await supabase.from('tournaments').delete().eq('id', existing.id)
    console.log('   ✅ Цэвэрлэлээ')
  }

  // Create tournament
  const { data: tournament, error: tErr } = await supabase
    .from('tournaments')
    .insert(TOURNAMENT_DATA)
    .select()
    .single()

  if (tErr || !tournament) {
    console.error('❌ Тэмцээн үүсгэж чадсангүй:', tErr?.message)
    process.exit(1)
  }
  console.log(`\n✅ Тэмцээн үүслээ: ${tournament.id}`)

  // Create each sport
  for (const sportData of SPORTS_DATA) {
    const { groups, judge_code, venue, ...sportFields } = sportData

    const { data: sport, error: sErr } = await supabase
      .from('tournament_sports')
      .insert({ tournament_id: tournament.id, ...sportFields })
      .select()
      .single()

    if (sErr || !sport) {
      console.error(`❌ Спорт үүсгэж чадсангүй (${sportFields.name}):`, sErr?.message)
      continue
    }
    console.log(`\n  🏅 ${sport.name}${venue ? ` — ${venue}` : ''}`)

    const groupEntries = Object.entries(groups)
    if (groupEntries.length === 0) {
      console.log(`     (Хэсэггүй — шууд нугалаа)`)
      continue
    }

    let totalMatches = 0
    let matchNumber = 1

    for (const [groupLetter, teamNames] of groupEntries) {
      // Create group
      const { data: group, error: gErr } = await supabase
        .from('groups')
        .insert({
          tournament_id: tournament.id,
          sport_id: sport.id,
          name: groupLetter,
          advance_count: sportData.advance_per_group,
        })
        .select()
        .single()

      if (gErr || !group) {
        console.error(`     ❌ Хэсэг ${groupLetter} үүсгэж чадсангүй:`, gErr?.message)
        continue
      }

      // Create teams
      const teamInserts = teamNames.map((name, idx) => ({
        tournament_id: tournament.id,
        sport_id: sport.id,
        name,
        seed: idx + 1,
        status: 'confirmed',
      }))

      const { data: createdTeams, error: teamsErr } = await supabase
        .from('teams')
        .insert(teamInserts)
        .select()

      if (teamsErr || !createdTeams?.length) {
        console.error(`     ❌ Хэсэг ${groupLetter} багууд:`, teamsErr?.message)
        continue
      }

      // Link teams to group
      await supabase.from('group_teams').insert(
        createdTeams.map(t => ({ group_id: group.id, team_id: t.id }))
      )

      // Generate round-robin matches with the sport-level judge code
      const teamIds = createdTeams.map(t => t.id)
      const rounds = roundRobin(teamIds)
      const matchRows = []

      rounds.forEach((pairs, roundIdx) => {
        pairs.forEach(([t1, t2]) => {
          matchRows.push({
            tournament_id: tournament.id,
            sport_id: sport.id,
            stage: 'group',
            group_id: group.id,
            round: roundIdx + 1,
            match_number: matchNumber++,
            team1_id: t1,
            team2_id: t2,
            status: 'scheduled',
            judge_code,
          })
        })
      })

      if (matchRows.length > 0) {
        const { error: mErr } = await supabase.from('matches').insert(matchRows)
        if (mErr) console.error(`     ❌ Тоглолт оруулах алдаа:`, mErr.message)
        else totalMatches += matchRows.length
      }

      console.log(`     Хэсэг ${groupLetter}: ${teamNames.length} баг → ${matchRows.length} тоглолт`)
    }

    console.log(`     Нийт: ${totalMatches} тоглолт | Шүүгч код: ${judge_code}`)
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('🎉 Seed амжилттай дууслаа!\n')
  console.log('📌 Чухал мэдээлэл:')
  console.log(`   Tournament ID : ${tournament.id}`)
  console.log(`   Admin код     : NTV2026ADMIN`)
  console.log(`   Admin URL     : /admin/${tournament.id}`)
  console.log(`   Нийтийн URL  : /t/${tournament.id}`)
  console.log('\n🔑 Шүүгчийн кодууд:')
  console.log(`   Эрэгтэй сагсан (V-COURT) : BASKET-M`)
  console.log(`   Эмэгтэй сагсан (T-COURT) : BASKET-F`)
  console.log(`   Эрэгтэй волейбол          : VOLLEY-M`)
  console.log(`   Дартс                     : DARTS`)
  console.log('\n🌐 Шүүгчийн портал: /judge')
}

seed().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
