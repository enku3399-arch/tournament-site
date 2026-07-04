import type { CharterDocument, CharterBlock } from '@/lib/charter-data'

function Block({ block }: { block: CharterBlock }) {
  if (block.type === 'subtitle') {
    return <h3 className="charter-subtitle">{block.text}</h3>
  }
  if (block.type === 'list') {
    return (
      <ul className="charter-list">
        {block.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    )
  }
  if (block.type === 'table') {
    return (
      <div className="structure-table-wrap charter-table-wrap">
        <table className="structure-table">
          <thead>
            <tr>
              {block.headers.map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map(row => (
              <tr key={row.join('-')}>
                {row.map((cell, i) => (
                  <td key={i}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  return <p className="charter-paragraph">{block.text}</p>
}

export function CharterDocumentView({ document }: { document: CharterDocument }) {
  return (
    <article className="charter-doc">
      <header className="charter-doc-head">
        <h2 className="charter-doc-title">{document.title}</h2>
      </header>

      <nav className="charter-toc" aria-label="Дүрмийн агуулга">
        <div className="charter-toc-label">Агуулга</div>
        <ol>
          {document.sections.map(section => (
            <li key={section.id}>
              <a href={`#${section.id}`}>{section.title}</a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="charter-sections">
        {document.sections.map(section => (
          <section key={section.id} id={section.id} className="charter-section">
            <h2 className="charter-section-title">{section.title}</h2>
            <div className="charter-section-body">
              {section.blocks.map((block, i) => (
                <Block key={`${section.id}-${i}`} block={block} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  )
}
