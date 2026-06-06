import Link from 'next/link'

const DECKS = [
  {
    href: '/slides/purpose',
    icon: '🎯',
    title: 'Mục đích & Định hướng',
    desc: 'Bối cảnh, bài toán, định vị pháp lý, phạm vi MVP, lộ trình & sản phẩm bàn giao.',
    meta: '23 slide · cho hội đồng / người không chuyên',
    accent: 'from-blue-600/30 to-blue-900/10 border-blue-500/30 hover:border-blue-400/60',
  },
  {
    href: '/slides/tech',
    icon: '⚙️',
    title: 'Kiến trúc & Kỹ thuật',
    desc: 'LangGraph pipeline, Hybrid Retrieval, scoring 5 chiều, vector store, LLM fallback, API.',
    meta: '18 slide · cho phần demo kỹ thuật',
    accent: 'from-emerald-600/30 to-emerald-900/10 border-emerald-500/30 hover:border-emerald-400/60',
  },
]

export default function SlidesChooser() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6 py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-white">Chọn bộ slide</h1>
        <p className="mt-2 text-slate-400">Hai bộ trình chiếu cho hai mục đích khác nhau.</p>
      </div>

      <div className="grid w-full max-w-3xl gap-5 sm:grid-cols-2">
        {DECKS.map(deck => (
          <Link
            key={deck.href}
            href={deck.href}
            className={`group flex flex-col rounded-3xl border bg-gradient-to-br p-6 transition-all duration-300 ${deck.accent}`}
          >
            <span className="text-4xl">{deck.icon}</span>
            <h2 className="mt-4 text-xl font-bold text-white">{deck.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-300">{deck.desc}</p>
            <span className="mt-4 text-xs font-medium text-slate-400">{deck.meta}</span>
            <span className="mt-3 text-sm font-semibold text-white opacity-70 transition-opacity group-hover:opacity-100">
              Mở bộ slide →
            </span>
          </Link>
        ))}
      </div>

      <Link href="/" className="mt-10 text-sm text-slate-400 transition-colors hover:text-white">
        ← Về trang chính
      </Link>
    </div>
  )
}
