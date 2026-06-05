import type { RecommendResponse } from '@/lib/types'
import ProductCard from './product-card'
import ComparisonTable from './comparison-table'
import TracePanel from './trace-panel'

export default function Recommendations({ data }: { data: RecommendResponse }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-4">
        <ComparisonTable recs={data.recommendations} />
        {data.recommendations.map((r) => (
          <ProductCard key={r.product.id} rec={r} />
        ))}
        {data.recommendations.length === 0 && (
          <div className="card text-center text-sm text-slate-500">
            Không có sản phẩm phù hợp với hồ sơ này. Thử nới khẩu vị rủi ro hoặc mục tiêu khác.
          </div>
        )}
      </div>
      <TracePanel trace={data.trace} warnings={data.compliance.warnings} />
    </div>
  )
}
