import Link from 'next/link'

export default function Nav() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-brand-500 to-brand-700" />
          <span className="font-semibold tracking-tight">Trợ lý Tài chính</span>
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
            UIT-LAB
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/" className="rounded-md px-3 py-1.5 text-slate-700 hover:bg-slate-100">
            Gợi ý
          </Link>
          <Link href="/slides" className="rounded-md px-3 py-1.5 text-slate-700 hover:bg-slate-100">
            Slides
          </Link>
          <Link href="/about" className="rounded-md px-3 py-1.5 text-slate-700 hover:bg-slate-100">
            Giới thiệu
          </Link>
        </nav>
      </div>
    </header>
  )
}
