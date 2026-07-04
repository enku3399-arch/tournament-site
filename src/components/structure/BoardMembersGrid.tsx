import type { StructureData } from '@/lib/structure-data'

function PhoneLink({ phone }: { phone: string }) {
  if (!phone) return <span className="structure-muted">—</span>
  return <a href={`tel:${phone}`} className="structure-phone">{phone}</a>
}

export function BoardMembersGrid({ data }: { data: StructureData }) {
  return (
    <div className="structure-block">
      <div className="structure-block-head">
        <h2 className="structure-block-title">{data.boardPeriod} Удирдах зөвлөл</h2>
        <p className="structure-block-desc">Аймаг бүрийн төлөөлөгчид</p>
      </div>

      <div className="structure-board-grid">
        {data.boardMembers.map(m => (
          <article key={m.id} className="structure-board-card">
            <div className="structure-board-aimag">{m.aimag}</div>
            <h3 className="structure-board-name">{m.name}</h3>
            <dl className="structure-board-meta">
              <div>
                <dt>Утас</dt>
                <dd><PhoneLink phone={m.phone} /></dd>
              </div>
              {m.facebook && (
                <div>
                  <dt>Facebook</dt>
                  <dd className="structure-fb">{m.facebook}</dd>
                </div>
              )}
            </dl>
          </article>
        ))}
      </div>
    </div>
  )
}
