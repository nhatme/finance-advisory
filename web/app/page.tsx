'use client'

import { useState } from 'react'
import ProfileForm from '@/components/profile-form'
import Recommendations from '@/components/recommendations'
import { recommend } from '@/lib/api'
import type { RecommendResponse, UserProfile } from '@/lib/types'

export default function HomePage() {
  const [data, setData] = useState<RecommendResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (profile: UserProfile) => {
    setLoading(true)
    setError(null)
    try {
      const res = await recommend(profile)
      setData(res)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <section className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Gợi ý sản phẩm tài chính phù hợp với bạn
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Trợ lý AI so khớp hồ sơ của bạn với{' '}
          <strong>tiết kiệm · quỹ mở · thẻ tín dụng</strong> từ nhiều nhà cung cấp, kèm{' '}
          <strong>giải thích lý do</strong> minh bạch và trích dẫn nguồn.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <ProfileForm onSubmit={handleSubmit} loading={loading} />

        <div>
          {error && (
            <div className="card mb-4 border-rose-200 bg-rose-50 text-sm text-rose-700">
              Lỗi: {error}
            </div>
          )}
          {!data && !loading && <Placeholder />}
          {loading && <LoadingState />}
          {data && <Recommendations data={data} />}
        </div>
      </div>
    </div>
  )
}

function Placeholder() {
  const steps = [
    { n: 1, t: 'Profiler', d: 'Chuẩn hoá hồ sơ, suy ra income band & age band.' },
    { n: 2, t: 'Researcher', d: 'Hybrid Retrieval: filter catalog + RAG điều khoản.' },
    { n: 3, t: 'Recommender', d: 'So khớp, xếp hạng, sinh lý do cho từng gợi ý.' },
    { n: 4, t: 'Compliance', d: 'Suitability, anti-bias, chèn disclaimer.' },
  ]
  return (
    <div className="card">
      <h3 className="text-base font-semibold">Cách hệ thống hoạt động</h3>
      <p className="mt-1 text-sm text-slate-500">
        4 agent chạy tuần tự để đưa ra gợi ý có thể giải thích được.
      </p>
      <ol className="mt-4 space-y-3">
        {steps.map((s) => (
          <li key={s.n} className="flex gap-3 text-sm">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">
              {s.n}
            </span>
            <div>
              <div className="font-medium">{s.t}</div>
              <div className="text-slate-600">{s.d}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="card animate-pulse">
      <div className="h-4 w-32 rounded bg-slate-200" />
      <div className="mt-4 space-y-3">
        <div className="h-20 rounded bg-slate-100" />
        <div className="h-20 rounded bg-slate-100" />
      </div>
    </div>
  )
}
