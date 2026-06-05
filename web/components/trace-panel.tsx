import type { TraceEntry } from '@/lib/types'

const AGENT_ICON: Record<string, string> = {
  Profiler: '👤',
  Researcher: '🔎',
  Recommender: '🎯',
  Compliance: '🛡️',
}

export default function TracePanel({ trace, warnings }: { trace: TraceEntry[]; warnings: string[] }) {
  return (
    <aside className="card space-y-4">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Agent trace
        </h3>
        <ol className="mt-3 space-y-3">
          {trace.map((t, i) => (
            <li key={i} className="flex gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm">
                {AGENT_ICON[t.agent] ?? '•'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{t.agent}</div>
                <div className="text-xs text-slate-500">
                  <code className="rounded bg-slate-100 px-1 py-0.5">{t.action}</code> ·{' '}
                  {t.summary}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {warnings.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-700">
            Cảnh báo
          </h3>
          <ul className="mt-2 space-y-1 text-xs text-amber-900">
            {warnings.map((w, i) => (
              <li key={i} className="rounded bg-amber-50 px-2 py-1.5">
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  )
}
