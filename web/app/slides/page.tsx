import Link from 'next/link'

export default function SlidesPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Slides thuyết trình</h1>
          <p className="text-sm text-slate-500">
            Dùng phím <kbd className="rounded bg-slate-100 px-1.5 py-0.5">←</kbd> /{' '}
            <kbd className="rounded bg-slate-100 px-1.5 py-0.5">→</kbd> để chuyển slide ·{' '}
            <kbd className="rounded bg-slate-100 px-1.5 py-0.5">F</kbd> fullscreen
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/slides/index.html"
            target="_blank"
            rel="noreferrer noopener"
            className="btn-ghost"
          >
            Mở tab mới
          </a>
          <Link href="/" className="btn-ghost">
            ← Về trang chính
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-black shadow-sm">
        <iframe
          src="/slides/index.html"
          title="UIT-LAB slides"
          className="block h-[calc(100vh-180px)] w-full"
        />
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Slides chưa render? Chạy <code className="rounded bg-slate-100 px-1 py-0.5">bash slides/build.sh</code>{' '}
        ở thư mục gốc dự án để build từ Markdown.
      </p>
    </div>
  )
}
