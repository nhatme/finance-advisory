import Link from 'next/link'

export default function Nav() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2.5 group">
          {/* Logo mark */}
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 shadow-md shadow-brand-200 group-hover:shadow-brand-300 transition-shadow">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 12 L8 4 L13 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5.5 9 H10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-tight text-slate-900">Trợ lý Tài chính</div>
            <div className="text-[10px] font-medium text-slate-400 -mt-0.5">UIT-LAB · RAG + Multi-agent</div>
          </div>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          <Link href="/" className="rounded-lg px-3 py-1.5 font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition-colors">
            Gợi ý
          </Link>
          <Link href="/slides" className="rounded-lg px-3 py-1.5 font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition-colors">
            Slides
          </Link>
          <Link href="/about" className="rounded-lg px-3 py-1.5 font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition-colors">
            Giới thiệu
          </Link>
        </nav>
      </div>
    </header>
  )
}
