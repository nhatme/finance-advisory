'use client'

import { useState } from 'react'
import ProfileForm from '@/components/profile-form'
import Recommendations from '@/components/recommendations'
import Report from '@/components/report'
import { recommend } from '@/lib/api'
import type { RecommendResponse, UserProfile } from '@/lib/types'

const STEPS = [
  { n: 1, title: 'Profiler',    desc: 'Chuẩn hoá hồ sơ, suy ra income & age band.' },
  { n: 2, title: 'Researcher',  desc: 'Hybrid Retrieval: filter catalog SQL + RAG điều khoản.' },
  { n: 3, title: 'Recommender', desc: 'So khớp, xếp hạng, sinh lý do có trích dẫn.' },
  { n: 4, title: 'Compliance',  desc: 'Suitability check, anti-bias, chèn disclaimer.' },
]

export default function HomePage() {
  const [data, setData]           = useState<RecommendResponse | null>(null)
  const [profile, setProfile]     = useState<UserProfile | null>(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [showReport, setShowReport] = useState(false)

  const handleSubmit = async (p: UserProfile) => {
    setLoading(true)
    setError(null)
    setShowReport(false)
    try {
      const res = await recommend(p)
      setData(res)
      setProfile(p)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600">
        {/* subtle grid overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-blue-100 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            RAG + Multi-agent · LangGraph
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Gợi ý sản phẩm tài chính<br className="hidden sm:block" /> phù hợp với bạn
          </h1>
          <p className="mt-3 max-w-xl text-base text-blue-100">
            Trợ lý AI so khớp hồ sơ của bạn với{' '}
            <strong className="text-white">tiết kiệm · quỹ mở · thẻ tín dụng</strong>{' '}
            từ nhiều nhà cung cấp — kèm <strong className="text-white">giải thích lý do</strong> minh bạch và trích dẫn nguồn.
          </p>
          {/* stat pills */}
          <div className="mt-6 flex flex-wrap gap-3 text-xs font-medium">
            {['15 sản phẩm', '4 agent', 'Hybrid Retrieval', 'Explainable AI'].map(t => (
              <span key={t} className="rounded-full bg-white/15 px-3 py-1 text-white backdrop-blur-sm">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <ProfileForm onSubmit={handleSubmit} loading={loading} />

          <div className="space-y-4">
            {error && (
              <div className="card border-rose-200 bg-rose-50 text-sm text-rose-700 animate-fade-in">
                ⚠ {error}
              </div>
            )}
            {!data && !loading && <PipelinePlaceholder />}
            {loading && <LoadingState />}
            {data && profile && (
              <div className="animate-slide-up">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    <span className="font-semibold text-slate-700">{data.recommendations.length}</span> sản phẩm phù hợp · provider: <code className="rounded bg-slate-100 px-1 text-xs">{data.llm_provider}</code>
                  </p>
                  <button onClick={() => setShowReport(true)} className="btn-outline-brand">
                    Xem báo cáo &amp; biểu đồ
                  </button>
                </div>
                <Recommendations data={data} />
              </div>
            )}
          </div>
        </div>
      </div>

      {showReport && data && profile && (
        <Report data={data} profile={profile} onClose={() => setShowReport(false)} />
      )}
    </>
  )
}

function PipelinePlaceholder() {
  return (
    <div className="card space-y-5">
      <div>
        <div className="section-label mb-1">Cách hệ thống hoạt động</div>
        <p className="text-sm text-slate-500">4 agent chạy tuần tự để đưa ra gợi ý có thể giải thích được.</p>
      </div>
      <ol className="space-y-3">
        {STEPS.map((s) => (
          <li key={s.n} className="flex gap-3.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white shadow-sm shadow-brand-200">
              {s.n}
            </span>
            <div className="pt-1">
              <div className="text-sm font-semibold text-slate-800">{s.title}</div>
              <div className="text-xs text-slate-500">{s.desc}</div>
            </div>
          </li>
        ))}
      </ol>
      <div className="rounded-xl border border-dashed border-brand-200 bg-brand-50/60 p-4 text-center text-sm text-brand-600">
        Điền hồ sơ bên trái và nhấn <strong>Nhận gợi ý</strong> để bắt đầu.
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="card space-y-4 animate-pulse2">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-xl bg-brand-100" />
        <div className="space-y-1.5">
          <div className="h-3 w-32 rounded bg-slate-200" />
          <div className="h-2.5 w-48 rounded bg-slate-100" />
        </div>
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} className="h-28 rounded-xl bg-slate-100" />
      ))}
    </div>
  )
}
