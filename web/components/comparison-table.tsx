import type { Recommendation } from '@/lib/types'
import { PRODUCT_TYPE_LABEL, RISK_LABEL, pct, vnd } from '@/lib/format'

export default function ComparisonTable({ recs }: { recs: Recommendation[] }) {
  const top = recs.slice(0, 3)
  if (top.length < 2) return null

  const rows: { label: string; value: (r: Recommendation) => string }[] = [
    { label: 'Loại', value: (r) => PRODUCT_TYPE_LABEL[r.product.type] },
    { label: 'Nhà cung cấp', value: (r) => r.product.provider },
    { label: 'Rủi ro', value: (r) => RISK_LABEL[r.product.risk_level] },
    {
      label: 'Lãi / Kỳ vọng',
      value: (r) => pct(r.product.interest_rate_pct ?? r.product.expected_return_pct),
    },
    { label: 'Vốn tối thiểu', value: (r) => vnd(r.product.min_amount_vnd) },
    { label: 'Kỳ hạn', value: (r) => (r.product.term_months ? `${r.product.term_months} tháng` : '—') },
    { label: 'Phí thường niên', value: (r) => vnd(r.product.annual_fee_vnd) },
    { label: 'Điểm khớp', value: (r) => `${(r.reasoning.score * 100).toFixed(0)}/100` },
  ]

  return (
    <div className="card overflow-x-auto">
      <h3 className="mb-3 text-base font-semibold">So sánh nhanh top {top.length}</h3>
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="py-2 pr-3 font-medium">Thuộc tính</th>
            {top.map((r) => (
              <th key={r.product.id} className="py-2 pr-3 font-medium text-slate-700">
                {r.product.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-slate-100 last:border-0">
              <td className="py-2 pr-3 text-slate-500">{row.label}</td>
              {top.map((r) => (
                <td key={r.product.id} className="py-2 pr-3">
                  {row.value(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
