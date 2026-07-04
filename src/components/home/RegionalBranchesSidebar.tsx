import Image from 'next/image'
import { getRegionalBranches } from '@/lib/regional-branches'

export function RegionalBranchesSidebar() {
  const branches = getRegionalBranches()

  return (
    <aside className="regional-sidebar" aria-label="Орон нутгийн салбар нэгжүүд">
      <div className="regional-sidebar-inner">
        <h2 className="regional-sidebar-title">Орон нутгийн салбар нэгжүүд</h2>
        <ul className="regional-sidebar-list">
          {branches.map(branch => (
            <li key={branch.name} className="regional-sidebar-item">
              <div className="regional-sidebar-logo">
                {branch.logoPath ? (
                  <Image
                    src={branch.logoPath}
                    alt=""
                    width={36}
                    height={36}
                    style={{ objectFit: 'contain' }}
                  />
                ) : (
                  <span className="regional-sidebar-logo-fallback" aria-hidden>
                    {branch.name.charAt(0)}
                  </span>
                )}
              </div>
              <span className="regional-sidebar-name">{branch.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
