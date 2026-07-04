import Image from 'next/image'
import type { StructureData } from '@/lib/structure-data'

export function OrgChartSection({ data }: { data: StructureData }) {
  return (
    <figure className="structure-org-chart">
      <div className="structure-org-frame">
        <Image
          src={data.orgChartPath}
          alt={data.orgChartAlt}
          width={1200}
          height={900}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          priority
        />
      </div>
      <figcaption>{data.orgChartAlt}</figcaption>
    </figure>
  )
}
