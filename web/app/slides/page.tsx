'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

const SLIDES = [
  {
    title: 'AI Tư vấn Sản phẩm Tài chính',
    subtitle: 'Trợ lý So sánh & Gợi ý cho Người trẻ',
    tag: 'RAG + Multi-agent · UIT-LAB 2026',
    content: null,
    type: 'cover' as const,
  },
  {
    title: '1. Bối cảnh',
    content: [
      'Người trẻ VN (Gen Z, Millennials) bắt đầu có thu nhập',
      '**Rối** trước hàng trăm sản phẩm tài chính',
      'Thiếu thời gian so sánh, dễ bị quảng cáo dẫn dắt',
      'Dễ chọn sai sản phẩm so với nhu cầu & khẩu vị rủi ro',
    ],
    type: 'bullets' as const,
  },
  {
    title: '2. Bài toán cốt lõi',
    subtitle: 'Đây KHÔNG phải hỏi–đáp kiến thức.',
    content: [
      '**Input:** hồ sơ (tuổi, thu nhập, mục tiêu, khẩu vị rủi ro)',
      '**Output:** sản phẩm phù hợp, xếp hạng, **kèm lý do** + disclaimer',
    ],
    highlight: 'Đây là so khớp hồ sơ ↔ sản phẩm có giải thích',
    type: 'bullets' as const,
  },
  {
    title: '3. Định vị pháp lý',
    quote: '"Trợ lý So sánh & Gợi ý Sản phẩm Tài chính (tham khảo)"',
    content: [
      'Mô hình **comparison site** (như TheBank) nhưng AI-driven',
      'Chỉ dùng **thông tin sản phẩm công khai**',
      'Không môi giới, không hoa hồng, không thiên vị',
      'Luôn kèm disclaimer + trích dẫn nguồn',
    ],
    type: 'bullets' as const,
  },
  {
    title: '4. Khoảng trống thị trường',
    type: 'table' as const,
    table: {
      head: ['', 'Cá nhân hóa', 'Đa NCC', 'Giải thích', 'Hội thoại'],
      rows: [
        ['TheBank',         '❌', '✅', '❌', '❌'],
        ['Finhay / Infina', '✅', '❌', '❌', '❌'],
        ['**Đề tài này**',  '✅', '✅', '✅', '✅'],
      ],
    },
    highlight: 'AI hội thoại + đa nhà cung cấp + giải thích được, tiếng Việt',
  },
  {
    title: '5. Phạm vi MVP',
    subtitle: '3 nhóm sản phẩm phù hợp người trẻ',
    type: 'cards' as const,
    cards: [
      { icon: '🏦', label: 'Tiền gửi tiết kiệm' },
      { icon: '📈', label: 'Quỹ mở / micro-investing' },
      { icon: '💳', label: 'Thẻ tín dụng' },
    ],
  },
  {
    title: '6. Ba lớp dữ liệu',
    type: 'table' as const,
    table: {
      head: ['Lớp', 'Tính chất', 'Lưu ở đâu'],
      rows: [
        ['**Catalog sản phẩm** (lõi)', 'Structured', 'SQL DB'],
        ['**Điều khoản & T&C**', 'Unstructured', 'Vector DB / RAG'],
        ['**Kiến thức nền**', 'Ổn định', 'RAG phụ trợ'],
      ],
    },
    highlight: 'Dữ liệu động (lãi suất, NAV) → cập nhật vào DB, không nhét vào vector.',
  },
  {
    title: '7. Hybrid Retrieval',
    subtitle: 'Điểm kỹ thuật trọng tâm — 2 cơ chế truy xuất',
    type: 'two-col' as const,
    cols: [
      { title: 'Structured filtering (SQL)', body: 'Query theo thuộc tính cứng: lãi suất, kỳ hạn, phí, vốn min, thu nhập min.' },
      { title: 'Semantic retrieval (RAG)', body: 'ChromaDB tìm điều khoản phù hợp ngữ cảnh câu hỏi. Trích dẫn nguồn.' },
    ],
    highlight: 'Re-ranking + trích dẫn nguồn cho từng con số',
  },
  {
    title: '8. Multi-agent Workflow',
    type: 'pipeline' as const,
    steps: [
      { name: 'Profiler',    desc: 'Chuẩn hóa hồ sơ, suy ra income & age band' },
      { name: 'Researcher',  desc: 'Hybrid Retrieval: SQL filter + RAG T&C' },
      { name: 'Recommender', desc: 'So khớp, xếp hạng, GIẢI THÍCH lý do' },
      { name: 'Compliance',  desc: 'Suitability check, anti-bias, disclaimer' },
    ],
  },
  {
    title: '9. Logic gợi ý & Scoring',
    type: 'two-col' as const,
    cols: [
      { title: 'Lọc cứng (Hard constraints)', body: 'Loại sản phẩm không đủ điều kiện: vốn min, thu nhập min, tuổi min.' },
      { title: 'Chấm điểm (Soft scoring)', body: 'Khớp rủi ro + mục tiêu + kỳ hạn + thu nhập. Rule-based, không cần LLM.' },
    ],
    content: [
      'Diversity cap: tối đa 2 sản phẩm / nhà cung cấp trong top-5',
      'LLM sinh 2 câu giải thích cho mỗi sản phẩm (chỉ gọi ở Recommender)',
    ],
  },
  {
    title: '10. Explainability',
    quote: '"Gợi ý quỹ X vì khẩu vị rủi ro thấp ✓, vốn tối thiểu phù hợp thu nhập ✓, kỳ hạn linh hoạt ✓"',
    content: [
      '→ Tăng độ tin cậy, chống "black box"',
      '→ **Điểm cộng học thuật** so với chatbot thường',
      '→ Score breakdown: 5 chiều, mỗi chiều 0–1, trung bình = tổng điểm',
    ],
    type: 'bullets' as const,
  },
  {
    title: '11. Guardrails & Compliance',
    type: 'bullets' as const,
    content: [
      '**Disclaimer bắt buộc:** "Tham khảo, không phải khuyến nghị"',
      '**Anti-bias:** không ưu tiên 1 NCC, minh bạch tiêu chí',
      '**Suitability check:** sản phẩm rủi ro cao ≠ hồ sơ rủi ro thấp',
      '**Từ chối:** không khuyến nghị mã CK, không cam kết lợi nhuận',
      '**PII:** thu nhập không log, không lưu, stateless per request',
    ],
  },
  {
    title: '12. Phương pháp đánh giá',
    type: 'table' as const,
    table: {
      head: ['Loại', 'Metric'],
      rows: [
        ['**Chất lượng gợi ý** (lõi)', 'Suitability, Precision@k, Diversity, Bias'],
        ['**Chất lượng RAG**', 'Faithfulness, Context Precision, RAGAS'],
        ['**Baseline**', 'LLM thuần / LLM+RAG / RAG+Multi-agent+Hybrid'],
        ['**System**', 'Latency, chi phí token / request'],
      ],
    },
    highlight: 'Golden test set: 50–100 kịch bản, có chuyên gia xác nhận.',
  },
  {
    title: '13. Tech Stack',
    type: 'two-col' as const,
    cols: [
      { title: 'Backend', body: 'FastAPI · LangGraph · SQLAlchemy · ChromaDB · sentence-transformers (multilingual-e5)' },
      { title: 'Frontend', body: 'Next.js 14 · TypeScript · Tailwind CSS · Mock fallback khi backend offline' },
    ],
    content: [
      'LLM: Claude Haiku (Anthropic) → GPT-4o-mini → Ollama (local) → Stub',
    ],
  },
  {
    title: '14. Lộ trình 10 tuần',
    type: 'table' as const,
    table: {
      head: ['Tuần', 'Trọng tâm'],
      rows: [
        ['1–2', 'Đề cương, schema catalog, golden test set'],
        ['3–4', 'Hybrid Retrieval + metric lần 1'],
        ['5–6', '**MVP**: 3 agent end-to-end (tiết kiệm)'],
        ['7–8', 'Mở rộng 2 nhóm sản phẩm + Compliance Agent'],
        ['9',   'UI + tích hợp + baseline comparison'],
        ['10',  'Eval, báo cáo, slide, video demo'],
      ],
    },
  },
  {
    title: '15. Sản phẩm bàn giao',
    type: 'cards' as const,
    cards: [
      { icon: '💻', label: 'Source Code — GitHub' },
      { icon: '📦', label: 'Dataset — catalog + T&C + golden test' },
      { icon: '📄', label: 'Báo cáo — phương pháp + eval' },
      { icon: '🎬', label: 'Video Demo — 3–5 phút end-to-end' },
    ],
  },
  {
    title: 'Cảm ơn!',
    subtitle: 'Q&A',
    tag: 'UIT-LAB · 2026',
    content: null,
    type: 'cover' as const,
  },
]

function renderText(s: string) {
  const parts = s.split(/(\*\*[^*]+\*\*)/)
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={i} className="font-semibold text-white">{p.slice(2, -2)}</strong>
      : <span key={i}>{p}</span>
  )
}

function SlideContent({ slide }: { slide: typeof SLIDES[number] }) {
  if (slide.type === 'cover') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-4">
        <div className="text-4xl font-extrabold tracking-tight text-white leading-tight">
          {slide.title}
        </div>
        {slide.subtitle && <div className="text-xl text-blue-200 font-medium">{slide.subtitle}</div>}
        {slide.tag && (
          <div className="mt-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-blue-100">
            {slide.tag}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <h2 className="text-2xl font-extrabold text-white shrink-0">{slide.title}</h2>
      {'subtitle' in slide && slide.subtitle && (
        <p className="text-blue-200 text-base -mt-2">{slide.subtitle}</p>
      )}
      {'quote' in slide && slide.quote && (
        <blockquote className="border-l-4 border-brand-400 pl-4 text-blue-100 italic text-base">
          {slide.quote}
        </blockquote>
      )}

      {slide.type === 'bullets' && slide.content && (
        <ul className="space-y-2.5 flex-1">
          {(slide.content as string[]).map((item, i) => (
            <li key={i} className="flex gap-3 text-blue-50 text-sm">
              <span className="mt-0.5 text-brand-400 shrink-0">▸</span>
              <span>{renderText(item)}</span>
            </li>
          ))}
        </ul>
      )}

      {slide.type === 'table' && 'table' in slide && (
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {slide.table!.head.map((h, i) => (
                  <th key={i} className="text-left py-2 px-3 text-blue-200 font-semibold border-b border-white/10">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slide.table!.rows.map((row, ri) => (
                <tr key={ri} className="border-b border-white/5">
                  {row.map((cell, ci) => (
                    <td key={ci} className="py-2 px-3 text-blue-50">{renderText(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {slide.type === 'pipeline' && 'steps' in slide && (
        <div className="flex-1 flex items-center">
          <div className="flex flex-col gap-2 w-full">
            {(slide as any).steps.map((s: {name:string; desc:string}, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white font-bold text-sm shadow-md">
                  {i + 1}
                </div>
                <div className="flex-1 rounded-xl bg-white/10 px-4 py-2">
                  <span className="font-semibold text-white">{s.name}</span>
                  <span className="text-blue-200 text-sm ml-2">→ {s.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {slide.type === 'two-col' && 'cols' in slide && (
        <div className="flex-1 grid grid-cols-2 gap-4">
          {(slide as any).cols.map((col: {title:string; body:string}, i: number) => (
            <div key={i} className="rounded-2xl bg-white/10 p-4">
              <div className="font-semibold text-white mb-2">{col.title}</div>
              <p className="text-blue-100 text-sm leading-relaxed">{col.body}</p>
            </div>
          ))}
        </div>
      )}

      {slide.type === 'cards' && 'cards' in slide && (
        <div className="flex-1 grid grid-cols-2 gap-3">
          {(slide as any).cards.map((c: {icon:string; label:string}, i: number) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
              <span className="text-3xl">{c.icon}</span>
              <span className="text-white font-medium">{c.label}</span>
            </div>
          ))}
        </div>
      )}

      {'content' in slide && slide.content && slide.type !== 'bullets' && (
        <ul className="space-y-1.5">
          {(slide.content as string[]).map((item, i) => (
            <li key={i} className="flex gap-2 text-blue-100 text-sm">
              <span className="text-brand-400 shrink-0">→</span>
              <span>{renderText(item)}</span>
            </li>
          ))}
        </ul>
      )}

      {'highlight' in slide && slide.highlight && (
        <div className="rounded-xl border border-brand-400/40 bg-brand-500/20 px-4 py-2.5 text-sm font-medium text-brand-200">
          → {(slide as any).highlight}
        </div>
      )}
    </div>
  )
}

export default function SlidesPage() {
  const [idx, setIdx]           = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef            = useRef<HTMLDivElement>(null)
  const total                   = SLIDES.length

  const prev = useCallback(() => setIdx(i => Math.max(0, i - 1)), [])
  const next = useCallback(() => setIdx(i => Math.min(total - 1, i + 1)), [total])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }, [])

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next() }
      if (e.key === 'ArrowLeft')                   { e.preventDefault(); prev() }
      if (e.key === 'f' || e.key === 'F')           toggleFullscreen()
      if (e.key === 'Escape' && isFullscreen)        document.exitFullscreen()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [next, prev, toggleFullscreen, isFullscreen])

  const slide = SLIDES[idx]

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-slate-950 flex flex-col"
      style={isFullscreen ? { height: '100vh', overflow: 'hidden' } : {}}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          {!isFullscreen && (
            <>
              <Link href="/" className="text-slate-400 hover:text-white text-sm transition-colors">
                ← Về trang chính
              </Link>
              <span className="text-slate-700">|</span>
            </>
          )}
          <span className="text-slate-400 text-sm">
            <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-xs">←</kbd>
            {' / '}
            <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-xs">→</kbd>
            {' '}chuyển ·{' '}
            <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-xs">F</kbd>
            {' '}fullscreen
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-500 text-sm">{idx + 1} / {total}</span>
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Thoát toàn màn hình (Esc)' : 'Toàn màn hình (F)'}
            className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition-colors"
          >
            {isFullscreen ? (
              <>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M5 1H1v4M11 1h4v4M5 15H1v-4M11 15h4v-4"/>
                </svg>
                Thoát
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M1 5V1h4M10 1h4v4M1 10v4h4M15 10v4h-4"/>
                </svg>
                Trình chiếu
              </>
            )}
          </button>
        </div>
      </div>

      {/* Slide area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className={`w-full transition-all duration-300 ${isFullscreen ? 'max-w-6xl' : 'max-w-4xl'}`}>
          <div
            key={idx}
            className="animate-fade-in rounded-3xl bg-gradient-to-br from-brand-900 via-brand-800 to-slate-900 p-10 shadow-2xl"
            style={{ minHeight: isFullscreen ? 'calc(100vh - 180px)' : '460px' }}
          >
            <SlideContent slide={slide} />
          </div>

          {/* Navigation */}
          <div className="mt-5 flex items-center justify-between">
            <button onClick={prev} disabled={idx === 0}
              className="btn-ghost text-white border-white/20 bg-white/10 hover:bg-white/20 disabled:opacity-30">
              ← Trước
            </button>

            <div className="flex gap-1.5">
              {SLIDES.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === idx ? 'w-6 bg-brand-400' : 'w-1.5 bg-slate-600 hover:bg-slate-400'
                  }`} />
              ))}
            </div>

            <button onClick={next} disabled={idx === total - 1}
              className="btn-ghost text-white border-white/20 bg-white/10 hover:bg-white/20 disabled:opacity-30">
              Tiếp →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
