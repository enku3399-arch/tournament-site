import { getSiteSettings } from '@/lib/site-settings'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Хуваарь · Монгол 87/89 V Спорт Наадам 2026',
}

export default async function SchedulePage() {
  const settings = await getSiteSettings()
  const days = settings.schedule

  return (
    <>
      <section className="section" style={{ padding: '48px 0 40px' }}>
        <div className="wrap-wide">
          <span className="eyebrow" style={{ color: 'var(--fog)' }}>2026.06.11 — 2026.06.13</span>
          <h1 className="section-title" style={{ fontFamily: 'Oswald, sans-serif', fontSize: 48, marginTop: 8 }}>
            Наадмын <span className="gold">хуваарь</span>
          </h1>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0, paddingBottom: 64 }}>
        <div className="wrap-wide">
          <div className="schedule-grid">
            {days.map((day) => (
              <div key={day.num} className="day-card">
                <div className="day-head">
                  <div className="day-num">{day.num}</div>
                  <div className="day-meta">
                    <div className="day-month">{day.month}</div>
                    <div className="day-weekday">{day.weekday}</div>
                  </div>
                </div>
                <div className="day-events-section">
                  <div className="day-section-title">Үндсэн тэмцээн</div>
                  <div className="day-events">
                    {day.main.map((ev, i) => (
                      <div key={i} className={`day-event${ev.hilight ? ' hilight' : ''}`}>
                        <div className="event-time" style={{ whiteSpace: 'pre-line' }}>{ev.time}</div>
                        <div className="event-name">
                          {ev.name}
                          {ev.note && <span className="note">{ev.note}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                  {day.extra.length > 0 && (
                    <>
                      <div className="day-section-title">Хөгжөөн дэмжигчдэд</div>
                      <div className="day-events">
                        {day.extra.map((ev, i) => (
                          <div key={i} className="day-event">
                            <div className="event-time" style={{ whiteSpace: 'pre-line' }}>{ev.time}</div>
                            <div className="event-name">
                              {ev.name}
                              {ev.note && <span className="note">{ev.note}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
