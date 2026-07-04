import type { SportStarGroup } from '@/lib/sport-stars-data'

export function SportStarsGrid({ groups }: { groups: SportStarGroup[] }) {
  return (
    <div className="sport-stars">
      {groups.map(group => (
        <section key={group.aimag} className="sport-stars-aimag">
          <div className="sport-stars-aimag-head">
            <h2 className="sport-stars-aimag-title">{group.aimag}</h2>
            {group.phone && (
              <a href={`tel:${group.phone}`} className="sport-stars-aimag-phone">
                {group.phone}
              </a>
            )}
          </div>

          <div className="structure-table-wrap sport-stars-table-wrap">
            <table className="structure-table sport-stars-table">
              <thead>
                <tr>
                  <th className="sport-stars-col-num">№</th>
                  <th>Тамирчдын овог нэр</th>
                  <th>Спортын зэрэг</th>
                </tr>
              </thead>
              <tbody>
                {group.athletes.map((athlete, i) => (
                  <tr key={`${group.aimag}-${athlete.name}-${i}`}>
                    <td className="structure-num sport-stars-col-num">{i + 1}</td>
                    <td className="sport-stars-name">{athlete.name}</td>
                    <td className="sport-stars-rank">{athlete.rank || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sport-stars-cards">
            {group.athletes.map((athlete, i) => (
              <article key={`${group.aimag}-card-${athlete.name}-${i}`} className="sport-stars-card">
                <div className="sport-stars-card-name">{i + 1}. {athlete.name}</div>
                {athlete.rank && <p className="sport-stars-card-rank">{athlete.rank}</p>}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
