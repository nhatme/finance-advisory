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

export default function ProfileForm({ onSubmit, loading }: Props) {
  const [age, setAge] = useState(24)
  const [income, setIncome] = useState(15_000_000)
  const [goal, setGoal] = useState<Goal>('save')
  const [risk, setRisk] = useState<RiskLevel>('low')
  const [horizon, setHorizon] = useState<number | ''>(12)
  const [notes, setNotes] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      age,
      monthly_income: income,
      goal,
      risk_appetite: risk,
      investment_horizon_months: horizon === '' ? undefined : horizon,
      notes: notes || undefined,
    })
  }

  return (
    <form onSubmit={submit} className="card space-y-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Hồ sơ của bạn</h2>
        <p className="text-sm text-slate-500">
          Chúng tôi không lưu thông tin này — chỉ dùng để tính gợi ý ngay trong phiên.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Tuổi</label>
          <input
            type="number"
            className="input"
            min={16}
            max={100}
            value={age}
            onChange={(e) => setAge(parseInt(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="label">Thu nhập / tháng (VND)</label>
          <input
            type="number"
            className="input"
            min={0}
            step={500_000}
            value={income}
            onChange={(e) => setIncome(parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      <div>
        <label className="label">Mục tiêu chính</label>
        <div className="grid grid-cols-2 gap-2">
          {GOALS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGoal(g)}
              className={`rounded-md border px-3 py-2 text-sm transition ${
                goal === g
                  ? 'border-brand-600 bg-brand-50 text-brand-700'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {GOAL_LABEL[g]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Khẩu vị rủi ro</label>
        <div className="grid grid-cols-3 gap-2">
          {RISKS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRisk(r)}
              className={`rounded-md border px-3 py-2 text-sm transition ${
                risk === r
                  ? 'border-brand-600 bg-brand-50 text-brand-700'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {RISK_LABEL[r]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Khung thời gian (tháng, tuỳ chọn)</label>
        <input
          type="number"
          className="input"
          min={1}
          max={240}
          value={horizon}
          onChange={(e) =>
            setHorizon(e.target.value === '' ? '' : parseInt(e.target.value) || 0)
          }
        />
      </div>

      <div>
        <label className="label">Ghi chú thêm (tuỳ chọn)</label>
        <textarea
          className="input min-h-[64px]"
          placeholder="Ví dụ: lần đầu đầu tư, hoặc đang dồn tiền cho việc lớn..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Đang phân tích...' : 'Nhận gợi ý'}
      </button>
    </form>
  )
}
