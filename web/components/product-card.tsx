import type { Recommendation } from '@/lib/types'
import { PRODUCT_TYPE_LABEL, RISK_COLOR, RISK_LABEL, pct, vnd } from '@/lib/format'

export default function ProductCard({ rec }: { rec: Recommendation }) {
  const p = rec.product
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="rounded bg-brand-100 px-2 py-0.5 font-semibold text-brand-700">
              #{rec.rank}
            </span>
            <span>{PRODUCT_TYPE_LABEL[p.type]}</span>
            <span>·</span>
            <span>{p.provider}</span>
          </div>
          <h3 className="mt-1 truncate text-base font-semibold">{p.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-600">{p.description}</p>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-2xl font-bold text-brand-700">
            {(rec.reasoning.score * 100).toFixed(0)}
          </div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">điểm khớp</div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className={`pill ${RISK_COLOR[p.risk_level]}`}>
          Rủi ro: {RISK_LABEL[p.risk_level]}
        </span>
        {p.interest_rate_pct != null && (
          <span className="pill bg-slate-100 text-slate-700">
            Lãi suất {pct(p.interest_rate_pct)}
          </span>
        )}
        {p.expected_return_pct != null && (
          <span className="pill bg-slate-100 text-slate-700">
            Kỳ vọng {pct(p.expected_return_pct)}/năm
          </span>
        )}
        {p.term_months != null && (
          <span className="pill bg-slate-100 text-slate-700">{p.term_months} tháng</span>
        )}
        {p.min_amount_vnd != null && (
          <span className="pill bg-slate-100 text-slate-700">Vốn tối thiểu {vnd(p.min_amount_vnd)}</span>
        )}
        {p.annual_fee_vnd != null && (
          <span className="pill bg-slate-100 text-slate-700">Phí TN {vnd(p.annual_fee_vnd)}</span>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <div className="mb-1 text-xs font-medium uppercase tracking-wide text-emerald-700">
            Vì sao phù hợp
          </div>
          <ul className="space-y-1 text-sm">
            {rec.reasoning.pros.map((p, i) => (
              <li key={i} className="flex gap-2 text-slate-700">
                <span className="text-emerald-500">✓</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="mb-1 text-xs font-medium uppercase tracking-wide text-rose-700">
            Cần cân nhắc
          </div>
          <ul className="space-y-1 text-sm">
            {rec.reasoning.cons.length === 0 && (
              <li className="text-sm text-slate-400">—</li>
            )}
            {rec.reasoning.cons.map((c, i) => (
              <li key={i} className="flex gap-2 text-slate-700">
                <span className="text-rose-500">!</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span>
          Cập nhật: {p.updated_at} ·{' '}
          <a
            href={p.source_url}
            target="_blank"
            rel="noreferrer noopener"
            className="text-brand-700 hover:underline"
          >
            Nguồn
          </a>
        </span>
        <details className="cursor-pointer">
          <summary className="text-slate-600 hover:text-slate-900">Điểm thành phần</summary>
          <div className="absolute mt-2 rounded-md border border-slate-200 bg-white p-3 shadow-md">
            <table className="text-xs">
              <tbody>
                {Object.entries(rec.reasoning.score_breakdown).map(([k, v]) => (
                  <tr key={k}>
                    <td className="pr-3 text-slate-500">{k}</td>
                    <td className="font-medium">{(v * 100).toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </div>
  )
}
