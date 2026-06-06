'use client'

import type { RecommendResponse, UserProfile } from '@/lib/types'
import { GOAL_LABEL, PRODUCT_TYPE_LABEL, RISK_COLOR, RISK_LABEL, pct, vnd } from '@/lib/format'

const SCORE_KEYS: Record<string, string> = {
  risk_alignment:    'Rủi ro',
  goal_alignment:    'Mục tiêu',
  income_compat:     'Thu nhập',
  amount_feasibility:'Vốn',
  horizon_match:     'Kỳ hạn',
}

/* ── Radar chart (SVG pentagon) ─────────────────────────────────── */
function RadarChart({ breakdown }: { breakdown: Record<string, number> }) {
  const keys = Object.keys(breakdown)
  const n = keys.length
  if (n < 3) return null
  const cx = 80, cy = 80, maxR = 60
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2

  const point = (r: number, i: number) => ({
    x: cx + r * Math.cos(angle(i)),
    y: cy + r * Math.sin(angle(i)),
  })

  const gridLevels = [0.25, 0.5, 0.75, 1]
  const dataPoints = keys.map((k, i) => point(breakdown[k] * maxR, i))
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z'

  return (
    <svg viewBox="0 0 160 160" width="160" height="160">
      {/* Grid levels */}
      {gridLevels.map((lvl) => {
        const pts = keys.map((_, i) => point(lvl * maxR, i))
        const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z'
        return <path key={lvl} d={path} fill="none" stroke="#e2e8f0" strokeWidth="1" />
      })}
      {/* Axes */}
      {keys.map((_, i) => {
        const end = point(maxR, i)
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#e2e8f0" strokeWidth="1" />
      })}
      {/* Data polygon */}
      <path d={dataPath} fill="rgb(59,130,246)" fillOpacity="0.18" stroke="rgb(37,99,235)" strokeWidth="2" />
      {/* Data dots */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="rgb(37,99,235)" />
      ))}
      {/* Labels */}
      {keys.map((k, i) => {
        const lp = point(maxR + 14, i)
        return (
          <text key={k} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle"
            fontSize="9" fill="#64748b" fontFamily="Inter,system-ui,sans-serif">
            {SCORE_KEYS[k] ?? k}
          </text>
        )
      })}
    </svg>
  )
}

/* ── Horizontal score bar ───────────────────────────────────────── */
function HBar({ label, value }: { label: string; value: number }) {
  const p = Math.round(value * 100)
  const bg = p >= 80 ? 'bg-emerald-500' : p >= 50 ? 'bg-amber-400' : 'bg-rose-400'
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-20 shrink-0 text-slate-500">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${bg} transition-all duration-500`} style={{ width: `${p}%` }} />
      </div>
      <span className="w-7 text-right font-semibold">{p}</span>
    </div>
  )
}

/* ── Provider distribution bar chart ───────────────────────────── */
function ProviderChart({ recs }: { recs: RecommendResponse['recommendations'] }) {
  const counts: Record<string, number> = {}
  recs.forEach(r => { counts[r.product.provider] = (counts[r.product.provider] ?? 0) + 1 })
  const max = Math.max(...Object.values(counts))
  return (
    <div className="space-y-2">
      {Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([prov, cnt]) => (
        <div key={prov} className="flex items-center gap-3 text-xs">
          <span className="w-28 shrink-0 truncate text-slate-600 font-medium">{prov}</span>
          <div className="h-5 flex-1 overflow-hidden rounded bg-slate-100">
            <div className="h-full rounded bg-gradient-to-r from-brand-400 to-brand-600 flex items-center pl-2"
              style={{ width: `${(cnt / max) * 100}%`, minWidth: '24px' }}>
              <span className="text-white font-bold text-[10px]">{cnt}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Score distribution chart ───────────────────────────────────── */
function ScoreDistChart({ recs }: { recs: RecommendResponse['recommendations'] }) {
  return (
    <div className="flex items-end gap-2 h-16">
      {recs.map(r => {
        const h = Math.round(r.reasoning.score * 100)
        const bg = h >= 80 ? 'bg-emerald-500' : h >= 60 ? 'bg-brand-500' : 'bg-amber-400'
        return (
          <div key={r.product.id} className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <span className="text-[9px] font-bold text-slate-600">{h}</span>
            <div className={`w-full rounded-t ${bg}`} style={{ height: `${h * 0.48}px` }} />
            <span className="text-[8px] text-slate-400 truncate w-full text-center">#{r.rank}</span>
          </div>
        )
      })}
    </div>
  )
}

/* ── Main Report component ──────────────────────────────────────── */
interface Props {
  data: RecommendResponse
  profile: UserProfile
  onClose: () => void
}

export default function Report({ data, profile, onClose }: Props) {
  const date = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-100 print:static print:bg-white">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur px-6 py-3 shadow-sm print:hidden">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 12L8 4L13 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5.5 9H10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-semibold text-slate-800">Báo cáo Gợi ý Tài chính</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="btn-ghost">
            🖨 In / Lưu PDF
          </button>
          <button onClick={onClose} className="btn-primary py-2">
            Đóng
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8 print:px-0 print:py-0 space-y-6">

        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-br from-brand-900 to-brand-700 p-6 text-white">
          <div className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-1">UIT-LAB Financial Advisor</div>
          <h1 className="text-2xl font-extrabold tracking-tight">Báo cáo Gợi ý Sản phẩm Tài chính</h1>
          <p className="mt-1 text-sm text-blue-200">Tạo ngày {date} · LLM: {data.llm_provider}</p>
        </div>

        {/* Profile + Summary side by side */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card">
            <div className="section-label mb-3">Hồ sơ người dùng</div>
            <div className="space-y-2 text-sm">
              {[
                ['Tuổi', `${profile.age}`],
                ['Thu nhập / tháng', vnd(profile.monthly_income)],
                ['Mục tiêu', GOAL_LABEL[profile.goal]],
                ['Khẩu vị rủi ro', RISK_LABEL[profile.risk_appetite]],
                ...(profile.investment_horizon_months
                  ? [['Kỳ hạn mong muốn', `${profile.investment_horizon_months} tháng`]] : []),
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2">
                  <span className="text-slate-500">{k}</span>
                  <span className="font-semibold text-slate-800">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card flex flex-col">
            <div className="section-label mb-3">Phân bổ điểm khớp</div>
            <div className="flex-1 flex items-end">
              <ScoreDistChart recs={data.recommendations} />
            </div>
          </div>
        </div>

        {/* Charts row */}
        {data.recommendations.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card">
              <div className="section-label mb-3">Phân bổ nhà cung cấp</div>
              <ProviderChart recs={data.recommendations} />
            </div>
            <div className="card flex flex-col items-center">
              <div className="section-label mb-2 self-start">Radar: Top #1</div>
              <RadarChart breakdown={data.recommendations[0].reasoning.score_breakdown} />
              <p className="text-xs text-slate-400 mt-1">{data.recommendations[0].product.name}</p>
            </div>
          </div>
        )}

        {/* Top recommendation banner */}
        {data.recommendations.length > 0 && (
          <div className="rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50 to-white p-5">
            <div className="section-label text-brand-600 mb-1">Gợi ý hàng đầu</div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-bold text-brand-900">
                  {data.recommendations[0].product.name}
                </div>
                <div className="text-sm text-brand-700 mt-0.5">
                  {data.recommendations[0].product.provider} ·{' '}
                  {PRODUCT_TYPE_LABEL[data.recommendations[0].product.type]}
                </div>
                {data.recommendations[0].reasoning.llm_rationale && (
                  <p className="mt-2 text-sm text-slate-600">{data.recommendations[0].reasoning.llm_rationale}</p>
                )}
              </div>
              <div className="shrink-0 rounded-2xl bg-white border border-brand-100 px-4 py-3 text-center shadow-sm">
                <div className="text-3xl font-extrabold text-brand-700">
                  {(data.recommendations[0].reasoning.score * 100).toFixed(0)}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-slate-400">/ 100</div>
              </div>
            </div>
          </div>
        )}

        {/* All recommendations */}
        <div>
          <div className="section-label mb-4">
            Danh sách gợi ý ({data.recommendations.length} sản phẩm)
          </div>
          {data.recommendations.length === 0 && (
            <div className="card text-sm text-slate-500 text-center py-8">
              Không có sản phẩm phù hợp. Thử nới khẩu vị rủi ro hoặc đổi mục tiêu.
            </div>
          )}
          <div className="space-y-4">
            {data.recommendations.map((rec) => (
              <div key={rec.product.id} className="card overflow-hidden">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                      <span className="rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 px-2 py-0.5 text-[11px] font-bold text-white">
                        #{rec.rank}
                      </span>
                      <span>{PRODUCT_TYPE_LABEL[rec.product.type]} · {rec.product.provider}</span>
                    </div>
                    <h3 className="font-bold text-slate-900">{rec.product.name}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{rec.product.description}</p>
                  </div>
                  <div className="shrink-0 text-center">
                    <div className="text-2xl font-extrabold text-brand-700">
                      {(rec.reasoning.score * 100).toFixed(0)}
                    </div>
                    <div className="text-[9px] uppercase tracking-widest text-slate-400">điểm</div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                  <span className={`pill ${RISK_COLOR[rec.product.risk_level]}`}>
                    {RISK_LABEL[rec.product.risk_level]}
                  </span>
                  {rec.product.interest_rate_pct != null && <span className="pill bg-brand-50 text-brand-700">Lãi {pct(rec.product.interest_rate_pct)}</span>}
                  {rec.product.expected_return_pct != null && <span className="pill bg-brand-50 text-brand-700">Kỳ vọng {pct(rec.product.expected_return_pct)}/năm</span>}
                  {rec.product.term_months != null && <span className="pill bg-slate-100 text-slate-600">{rec.product.term_months} tháng</span>}
                  {rec.product.min_amount_vnd != null && <span className="pill bg-slate-100 text-slate-600">Vốn tối thiểu {vnd(rec.product.min_amount_vnd)}</span>}
                </div>

                {/* Score bars + radar */}
                <div className="mt-4 flex gap-4 flex-wrap">
                  <div className="flex-1 min-w-[180px] space-y-1.5 rounded-xl bg-slate-50 p-3">
                    {Object.entries(rec.reasoning.score_breakdown).map(([k, v]) => (
                      <HBar key={k} label={SCORE_KEYS[k] ?? k} value={v} />
                    ))}
                  </div>
                  <div className="shrink-0">
                    <RadarChart breakdown={rec.reasoning.score_breakdown} />
                  </div>
                </div>

                {/* Pros / Cons */}
                <div className="mt-3 grid gap-3 sm:grid-cols-2 text-sm">
                  <div>
                    <div className="section-label text-emerald-600 mb-1.5">Vì sao phù hợp</div>
                    <ul className="space-y-1">
                      {rec.reasoning.pros.map((pro, i) => (
                        <li key={i} className="flex gap-2 text-slate-700">
                          <span className="text-emerald-500 shrink-0">✓</span>{pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {rec.reasoning.cons.length > 0 && (
                    <div>
                      <div className="section-label text-rose-500 mb-1.5">Cần cân nhắc</div>
                      <ul className="space-y-1">
                        {rec.reasoning.cons.map((con, i) => (
                          <li key={i} className="flex gap-2 text-slate-700">
                            <span className="text-rose-400 shrink-0">!</span>{con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {rec.reasoning.llm_rationale && (
                  <div className="mt-3 flex gap-2 rounded-xl border border-brand-100 bg-brand-50 p-3 text-sm text-brand-900">
                    <span className="shrink-0">🤖</span>
                    <p>{rec.reasoning.llm_rationale}</p>
                  </div>
                )}

                <div className="mt-3 border-t border-slate-100 pt-2.5 text-xs text-slate-400 flex justify-between">
                  <span>Cập nhật: {rec.product.updated_at}</span>
                  <a href={rec.product.source_url} target="_blank" rel="noreferrer noopener"
                    className="text-brand-600 hover:underline">Nguồn →</a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance */}
        <div className="card">
          <div className="section-label mb-3">Kiểm tra tuân thủ</div>
          <div className="flex items-center gap-2 mb-3">
            <span className="badge bg-emerald-100 text-emerald-700">
              {data.compliance.passed ? '✓ Đã kiểm tra' : '✗ Có vấn đề'}
            </span>
          </div>
          {data.compliance.warnings.length > 0 && (
            <ul className="space-y-1.5">
              {data.compliance.warnings.map((w, i) => (
                <li key={i} className="rounded-xl bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-900">
                  ⚠ {w}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Agent trace */}
        <div className="card">
          <div className="section-label mb-3">Agent trace</div>
          <ol className="space-y-2.5">
            {data.trace.map((t, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-xs font-bold text-brand-700">
                  {i + 1}
                </span>
                <div>
                  <span className="font-semibold">{t.agent}</span>
                  <span className="mx-1.5 text-slate-300">·</span>
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{t.action}</code>
                  <span className="mx-1.5 text-slate-300">·</span>
                  <span className="text-slate-500">{t.summary}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Disclaimer */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
          <strong className="font-semibold">Tuyên bố miễn trừ trách nhiệm: </strong>
          {data.compliance.disclaimer}
        </div>
      </div>
    </div>
  )
}
