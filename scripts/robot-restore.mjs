/**
 * scripts/robot-restore.mjs
 * Симуляцийн өмнөх байдалд оруулах
 *
 * Ажиллуулах: node scripts/robot-restore.mjs scripts/backup-matches-TIMESTAMP.json
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const SUPABASE_URL = 'https://lrbcnlpqiqhxsycjihug.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyYmNubHBxaXFoeHN5Y2ppaHVnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzgxNzU4OSwiZXhwIjoyMDkzMzkzNTg5fQ.2NSFDn_fp20F-iqXvZYLYto490e8y7rIIAfzbCTajAk'
const TOURNAMENT_ID = '0b05625d-2f6d-48de-b69c-d5a23c2f0e3f'

const backupFile = process.argv[2]
if (!backupFile) {
  console.error('❌ Backup файлын замыг заана уу:')
  console.error('   node scripts/robot-restore.mjs scripts/backup-matches-XXXXXXX.json')
  process.exit(1)
}

async function restore() {
  console.log(`♻️  Сэргээж байна: ${backupFile}`)
  const matches = JSON.parse(readFileSync(backupFile, 'utf8'))
  console.log(`   ${matches.length} тоглолт олдлоо`)

  const sb = createClient(SUPABASE_URL, SERVICE_KEY)

  // Одоогийн knockout + third тоглолтуудыг устгана
  // (simulation дараа нэмэгдсэн байж болно)
  const backupIds = new Set(matches.map(m => m.id))
  const { data: current } = await sb
    .from('matches')
    .select('id')
    .eq('tournament_id', TOURNAMENT_ID)

  const toDelete = (current ?? []).filter(m => !backupIds.has(m.id)).map(m => m.id)
  if (toDelete.length > 0) {
    await sb.from('matches').delete().in('id', toDelete)
    console.log(`   🗑  Simulation-д нэмэгдсэн ${toDelete.length} тоглолт устгагдлаа`)
  }

  // Backup-аас байдлыг сэргээх
  let restored = 0, failed = 0
  const CHUNK = 20

  for (let i = 0; i < matches.length; i += CHUNK) {
    const chunk = matches.slice(i, i + CHUNK)
    // upsert ашиглана
    const { error } = await sb.from('matches').upsert(chunk, { onConflict: 'id' })
    if (error) {
      console.error(`   ❌ Chunk ${i}-${i + CHUNK}: ${error.message}`)
      failed += chunk.length
    } else {
      restored += chunk.length
    }
  }

  console.log(`\n✅ Сэргэлт дууслаа: ${restored} тоглолт сэргэлээ, ${failed} алдаа`)
  console.log(`   Standings шалгах: http://localhost:3002/t/${TOURNAMENT_ID}/standings`)
}

restore().catch(err => {
  console.error('💥 Алдаа:', err)
  process.exit(1)
})
