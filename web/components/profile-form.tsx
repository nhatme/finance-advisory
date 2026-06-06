'use client'

import { useState } from 'react'
import type { Goal, RiskLevel, UserProfile } from '@/lib/types'
import { GOAL_LABEL, RISK_LABEL } from '@/lib/format'

interface Props {
  onSubmit: (profile: UserProfile) => void
  loading: boolean
}

const GOALS: Goal[] = ['save', 'grow', 'learn', 'spend']
const RISKS: RiskLevel[] = ['low', 'medium', 'high']

function toWords(n: number): string {
  if (n === 0) return ''
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(n % 1_000_000_000 === 0 ? 0 : 1)} tỷ đồng`
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)} triệu đồng`
  if (n >= 1_000)         return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)} nghìn đồng`
  return `${n} đồng`
}

const GOAL_ICON: Record<Goal, string> = {
  save: '🏦', grow: '📈', learn: '🎓', spend: '💳',
}
const RISK_COLOR_ACTIVE: Record<RiskLevel, string> = {
  low:    'border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100',
  medium: 'border-amber-400 bg-amber-50 text-amber-700 shadow-sm shadow-amber-100',
  high:   'border-rose-400 bg-rose-50 text-rose-700 shadow-sm shadow-rose-100',
}

export default function ProfileForm({ onSubmit, loading }: Props) {
  const [age, setAge]       = useState(24)
  const [income, setIncome] = useState(15_000_000)
  const [goal, setGoal]     = useState<Goal>('save')
  const [risk, setRisk]     = useState<RiskLevel>('low')
  const [horizon, setHorizon] = useState<number | ''>(12)
  const [notes, setNotes]   = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ age, monthly_income: income, goal, risk_appetite: risk,
               investment_horizon_months: horizon === '' ? undefined : horizon,
               notes: notes || undefined })
  }

  return (
    <form onSubmit={submit} className="card space-y-5">
      <div>
        <h2 className="text-base font-bold tracking-tight text-slate-900">Hồ sơ của bạn</h2>
        <p className="mt-0.5 text-xs text-slate-400">Không lưu trữ — chỉ dùng trong phiên này.</p>
      </div>

      {/* Age */}
      <div className="w-1/2 pr-1.5">
        <label className="label">Tuổi</label>
        <input type="number" className="input" min={16} max={100}
          value={age} onChange={(e) => setAge(parseInt(e.target.value) || 0)} />
      </div>

      {/* Income — full width + hover tooltip */}
      <div>
        <label className="label">Thu nhập / tháng</label>
        <div className="group relative">
          {/* Tooltip */}
          {income > 0 && (
            <div className="pointer-events-none absolute -top-14 left-1/2 z-20 -translate-x-1/2
                            opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0
                            transition-all duration-200 ease-out">
              <div className="rounded-xl bg-slate-900 px-4 py-2.5 shadow-xl text-center whitespace-nowrap">
                <div className="text-xl font-extrabold tracking-tight text-white">
                  {income.toLocaleString('vi-VN')} đ
                </div>
                <div className="mt-0.5 text-xs text-slate-400">{toWords(income)}</div>
              </div>
              {/* arrow */}
              <div className="mx-auto mt-0.5 h-2 w-2 rotate-45 rounded-sm bg-slate-900" style={{ marginLeft: 'calc(50% - 4px)' }} />
            </div>
          )}

          <div className="flex rounded-xl border border-slate-200 bg-white shadow-sm
                          focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-200
                          transition-all duration-150 overflow-hidden">
            <button type="button"
              onClick={() => setIncome(i => Math.max(0, i - 500_000))}
              className="px-4 text-xl font-bold text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors shrink-0 border-r border-slate-100">
              −
            </button>
            <input
              type="text"
              inputMode="numeric"
              className="flex-1 border-0 bg-transparent px-3 py-2.5 text-sm font-semibold text-center outline-none min-w-0"
              value={income === 0 ? '' : income.toLocaleString('vi-VN')}
              placeholder="15.000.000"
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '')
                setIncome(raw === '' ? 0 : parseInt(raw, 10))
              }}
            />
            <button type="button"
              onClick={() => setIncome(i => i + 500_000)}
              className="px-4 text-xl font-bold text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors shrink-0 border-l border-slate-100">
              +
            </button>
          </div>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">Bước nhảy 500.000đ · hover để xem số đầy đủ</p>
      </div>

      {/* Goal */}
      <div>
        <label className="label">Mục tiêu chính</label>
        <div className="grid grid-cols-2 gap-2">
          {GOALS.map((g) => (
            <button key={g} type="button" onClick={() => setGoal(g)}
              className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                goal === g
                  ? 'border-brand-500 bg-brand-50 text-brand-800 shadow-sm shadow-brand-100'
                  : 'border-slate-200 text-slate-600 hover:border-brand-200 hover:bg-slate-50'
              }`}>
              <span>{GOAL_ICON[g]}</span>
              <span className="leading-tight text-left">{GOAL_LABEL[g]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Risk appetite */}
      <div>
        <label className="label">Khẩu vị rủi ro</label>
        <div className="grid grid-cols-3 gap-2">
          {RISKS.map((r) => (
            <button key={r} type="button" onClick={() => setRisk(r)}
              className={`rounded-xl border-2 px-2 py-2 text-sm font-semibold transition-all duration-150 ${
                risk === r ? RISK_COLOR_ACTIVE[r] : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}>
              {RISK_LABEL[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Horizon */}
      <div>
        <label className="label">Khung thời gian <span className="font-normal text-slate-400">(tháng, tuỳ chọn)</span></label>
        <input type="number" className="input" min={1} max={240}
          placeholder="Ví dụ: 12"
          value={horizon}
          onChange={(e) => setHorizon(e.target.value === '' ? '' : parseInt(e.target.value) || 0)} />
      </div>

      {/* Notes */}
      <div>
        <label className="label">Ghi chú <span className="font-normal text-slate-400">(tuỳ chọn)</span></label>
        <textarea className="input min-h-[60px] resize-none" value={notes}
          placeholder="Ví dụ: lần đầu đầu tư, đang dồn tiền mua xe..."
          onChange={(e) => setNotes(e.target.value)} />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full text-base py-3">
        {loading
          ? <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Đang phân tích...</>
          : 'Nhận gợi ý →'}
      </button>
    </form>
  )
}
