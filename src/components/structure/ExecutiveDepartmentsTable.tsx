import type { StructureData } from '@/lib/structure-data'

export function ExecutiveDepartmentsTable({ data }: { data: StructureData }) {
  return (
    <div className="structure-block">
      <div className="structure-block-head">
        <h2 className="structure-block-title">{data.departmentsTitle}</h2>
      </div>

      <div className="structure-table-wrap">
        <table className="structure-table">
          <thead>
            <tr>
              <th>№</th>
              <th>Албадын нэрс</th>
              <th>Дарга</th>
              <th>Утас</th>
            </tr>
          </thead>
          <tbody>
            {data.departments.map(d => (
              <tr key={d.id}>
                <td className="structure-num">{d.num}</td>
                <td className="structure-dept-name">{d.name}</td>
                <td className="structure-dept-head">{d.head}</td>
                <td>
                  {d.phone ? (
                    <a href={`tel:${d.phone}`} className="structure-phone">{d.phone}</a>
                  ) : (
                    <span className="structure-muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="structure-dept-cards">
        {data.departments.map(d => (
          <article key={d.id} className="structure-dept-card">
            <div className="structure-dept-card-num">{d.num}</div>
            <div>
              <h3 className="structure-dept-card-name">{d.name}</h3>
              <p className="structure-dept-card-head">{d.head}</p>
              {d.phone && (
                <a href={`tel:${d.phone}`} className="structure-phone">{d.phone}</a>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
