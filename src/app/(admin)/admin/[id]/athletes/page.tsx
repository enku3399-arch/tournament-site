import { notFound } from 'next/navigation'
import { createServiceClient as createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-server'
import Link from 'next/link'
import AthletesClient from './AthletesClient'
import type { Athlete } from './AthletesClient'

export const dynamic = 'force-dynamic'

const SQL_HINT = `create table if not exists athletes (
  id uuid default gen_random_uuid() primary key,
  team_id uuid references teams(id) on delete cascade,
  tournament_id uuid not null references tournaments(id) on delete cascade,
  sport_id uuid references tournament_sports(id) on delete set null,
  name text not null default '',
  register_number text,
  rank text,
  participation_type text,
  affiliation text,
  phone text,
  notes jsonb default null,
  created_at timestamptz default now()
);
alter table athletes enable row level security;
create policy "public_read" on athletes for select using (true);
create policy "public_insert" on athletes for insert with check (true);
create policy "service_all" on athletes for all using (true);`

export default async function AthletesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createClient()
  const service = createServiceClient()

  const { data: tournament } = await supabase
    .from('tournaments').select('name').eq('id', id).single()
  if (!tournament) notFound()

  const { data, error } = await service
    .from('athletes')
    .select(`*, team:teams(id, name, status, contact_name, contact_phone), sport:tournament_sports(id, name, sport_type, gender)`)
    .eq('tournament_id', id)
    .order('created_at', { ascending: false })

  const tableError = !!error
  const athletes: Athlete[] = (data ?? []) as any

  return (
    <div className="space-y-6">
      {/* Tournament sub-nav */}
      <div className="flex gap-1 border-b border-border -mx-3 sm:-mx-4 px-3 sm:px-4">
        <Link href={`/admin/${id}`}
          className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-muted hover:text-foreground transition-colors">
          ⊞ Тохиргоо
        </Link>
        <Link href={`/admin/${id}/athletes`}
          className="px-4 py-2 text-sm font-medium border-b-2 border-primary text-foreground">
          👤 Тамирчид
        </Link>
        <Link href={`/admin/${id}/guide`}
          className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-muted hover:text-foreground transition-colors">
          📄 Удирдамж
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-lg font-bold">👤 Тамирчид</h1>
        {!tableError && (
          <span className="text-sm text-muted">({athletes.length} бүртгэл)</span>
        )}
        <div className="ml-auto flex gap-2">
          <Link href={`/register/${id}/apply`} target="_blank"
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground hover:bg-surface-2 transition-colors">
            📄 Мэдүүлгийн хуудас →
          </Link>
        </div>
      </div>

      {tableError ? (
        <div className="rounded-xl border border-accent/40 bg-accent/5 p-6 space-y-4">
          <div>
            <p className="font-bold text-accent mb-1">⚠️ Athletes хүснэгт үүсгэгдээгүй байна</p>
            <p className="text-sm text-muted">Supabase → SQL Editor хэсэгт доорхи кодыг ажиллуулна уу:</p>
          </div>
          <pre className="text-xs bg-surface rounded-lg border border-border p-4 overflow-x-auto text-muted leading-relaxed whitespace-pre-wrap">
            {SQL_HINT}
          </pre>
          <p className="text-xs text-muted">SQL ажилласны дараа хуудсыг дахин ачааллана уу.</p>
        </div>
      ) : (
        <AthletesClient athletes={athletes} tournamentId={id} />
      )}
    </div>
  )
}
