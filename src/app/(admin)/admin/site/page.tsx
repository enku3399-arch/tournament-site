import { getSiteSettings } from '@/lib/site-settings'
import { calculateMedalStandings } from '@/lib/medal-calc'
import { SiteCmsClient } from './SiteCmsClient'

export const dynamic = 'force-dynamic'

const SQL = `create table if not exists site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);
alter table site_settings enable row level security;
create policy "public_read"  on site_settings for select using (true);
create policy "service_all"  on site_settings for all    using (true);`

export default async function SiteAdminPage() {
  const [settings, liveData] = await Promise.all([
    getSiteSettings(),
    calculateMedalStandings([]).catch(() => null),
  ])
  const tableExists = settings._tableExists

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">🌐 Сайтын тохиргоо</h1>
        <p className="text-sm text-muted mt-1">
          Нийтийн сайтын бүх агуулгыг энд удирдана — навигац, лого, спонсор, текст, холбоо барих
        </p>
      </div>

      {!tableExists && (
        <div className="rounded-xl border border-accent/40 bg-accent/5 p-6 space-y-4">
          <div>
            <p className="font-bold text-accent mb-1">⚠️ site_settings хүснэгт үүсгэгдээгүй байна</p>
            <p className="text-sm text-muted">Supabase → SQL Editor хэсэгт доорхи кодыг ажиллуулна уу:</p>
          </div>
          <pre className="text-xs bg-surface rounded-lg border border-border p-4 overflow-x-auto text-muted leading-relaxed whitespace-pre-wrap">
            {SQL}
          </pre>
          <p className="text-xs text-muted">SQL ажилласны дараа хуудсыг дахин ачааллана уу.</p>
        </div>
      )}

      <SiteCmsClient initialSettings={settings} liveStandings={liveData?.standings ?? []} liveSportResults={liveData?.sportResults ?? []} />
    </div>
  )
}
