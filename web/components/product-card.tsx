import type { Recommendation } from '@/lib/types'
import { PRODUCT_TYPE_LABEL, RISK_COLOR, RISK_LABEL, pct, vnd } from '@/lib/format'

const SCORE_KEYS: Record<string, string> = {
  risk_alignment: 'Rủi ro',
  goal_alignment: 'Mục tiêu',
  income_compat: 'Thu nhập',
  amount_feasibility: 'Vốn',
  horizon_match: 'Kỳ hạn',
}

const RANK_GRADIENT = [
  'from-amber-400 to-orange-500',
  'from-slate-400 to-slate-500',
  'from-orange-300 to-amber-400',
]

function ScoreRing({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  const r = 22
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#f43f5e'
  return (
    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
      <svg width="56" height="56" className="-rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#e2e8f0" strokeWidth="4" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray .6s cubic-bezier(.4,0,.2,1)' }} />
      </svg>
      <span className="absolute text-sm font-bold text-slate-800">{pct}</span>
    </div>
  )
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const p = Math.round(value * 100)
  const bg = p >= 80 ? 'bg-emerald-500' : p >= 50 ? 'bg-amber-400' : 'bg-rose-400'
  return (
    <div className="flex items-center gap-2.5 text-xs">
      <span className="w-16 shrink-0 text-slate-500">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${bg} transition-all duration-500`} style={{ width: `${p}%` }} />
      </div>
      <span className="w-6 text-right font-semibold text-slate-700">{p}</span>
    </div>
  )
}

export default function ProductCard({ rec }: { rec: Recommendation }) {
  const p = rec.product
  const rankGrad = RANK_GRADIENT[(rec.rank - 1)] ?? 'from-brand-500 to-brand-700'

  return (
    <div className="card-hover overflow-hidden">
      {/* rank accent bar */}
      {rec.rank <= 3 && (
        <div className={`-mx-5 -mt-5 mb-4 h-1 bg-gradient-to-r ${rankGrad}`} />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className={`rounded-lg bg-gradient-to-br ${rankGrad} px-2 py-0.5 text-[11px] font-bold text-white shadow-sm`}>
              #{rec.rank}
            </span>
            <span className="font-medium text-slate-600">{PRODUCT_TYPE_LABEL[p.type]}</span>
            <span className="text-slate-300">·</span>
            <span>{p.provider}</span>
          </div>
          <h3 className="mt-1.5 text-base font-bold text-slate-900 leading-snug">{p.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">{p.description}</p>
        </div>
        <ScoreRing score={rec.reasoning.score} />
      </div>

      {/* Pills */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className={`pill ${RISK_COLOR[p.risk_level]}`}>
          {RISK_LABEL[p.risk_level]}
        </span>
        {p.interest_rate_pct != null && (
          <span className="pill bg-brand-50 text-brand-700">Lãi {pct(p.interest_rate_pct)}</span>
        )}
        {p.expected_return_pct != null && (
          <span className="pill bg-brand-50 text-brand-700">Kỳ vọng {pct(p.expected_return_pct)}/năm</span>
        )}
        {p.term_months != null && (
          <span className="pill bg-slate-100 text-slate-600">{p.term_months} tháng</span>
        )}
        {p.min_amount_vnd != null && (
          <span className="pill bg-slate-100 text-slate-600">Vốn tối thiểu {vnd(p.min_amount_vnd)}</span>
        )}
        {p.annual_fee_vnd != null && (
          <span className="pill bg-slate-100 text-slate-600">Phí TN {vnd(p.annual_fee_vnd)}</span>
        )}
      </div>

      {/* Score bars */}
      <div className="mt-4 space-y-1.5 rounded-xl bg-slate-50 p-3">
        {Object.entries(rec.reasoning.score_breakdown).map(([k, v]) => (
          <ScoreBar key={k} label={SCORE_KEYS[k] ?? k} value={v} />
        ))}
      </div>

      {/* Pros / Cons */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <div className="section-label mb-2 text-emerald-600">Vì sao phù hợp</div>
          <ul className="space-y-1">
            {rec.reasoning.pros.map((pro, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700">
                <span className="mt-0.5 text-emerald-500 shrink-0">✓</span>
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="section-label mb-2 text-rose-500">Cần cân nhắc</div>
          <ul className="space-y-1">
            {rec.reasoning.cons.length === 0
              ? <li className="text-sm text-slate-400">—</li>
              : rec.reasoning.cons.map((con, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-700">
                  <span className="mt-0.5 text-rose-400 shrink-0">!</span>
                  <span>{con}</span>
                </li>
              ))}
          </ul>
        </div>
      </div>

      {/* LLM rationale */}
      {rec.reasoning.llm_rationale && (
        <div className="mt-4 flex gap-2.5 rounded-xl border border-brand-100 bg-gradient-to-r from-brand-50 to-white p-3">
          <span className="mt-0.5 text-base shrink-0">🤖</span>
          <p className="text-sm text-brand-900">{rec.reasoning.llm_rationale}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
        <span>Cập nhật: {p.updated_at}</span>
        <a href={p.source_url} target="_blank" rel="noreferrer noopener"
          className="font-medium text-brand-600 hover:text-brand-800 hover:underline">
          Nguồn chính thức →
        </a>
      </div>
    </div>
  )
}
