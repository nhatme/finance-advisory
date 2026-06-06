'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { exportToPptx, type PptxPalette } from '@/lib/export-pptx'

/* ────────────────────────────────────────────────────────────────────────
 * Shared, themeable slide engine.
 * Both decks (/slides/purpose, /slides/tech) render through this component;
 * only the `slides` data and the `theme` palette differ.
 * Colours are applied as inline styles so each deck's vibe is self-contained
 * and never depends on Tailwind purging dynamic class names.
 * ──────────────────────────────────────────────────────────────────────── */

export type Slide = {
  type: 'cover' | 'bullets' | 'table' | 'pipeline' | 'two-col' | 'cards'
  title?: string
  subtitle?: string
  tag?: string
  content?: string[] | null
  quote?: string
  highlight?: string
  table?: { head: string[]; rows: string[][] }
  steps?: { name: string; desc: string }[]
  cols?: { title: string; body: string }[]
  cards?: { icon: string; label: string }[]
}

export type DeckTheme = {
  dark: boolean
  /** page / toolbar background */
  pageBg: string
  onPage: string
  onPageMuted: string
  controlBg: string
  controlBorder: string
  /** slide surface backgrounds (CSS gradients ok) */
  slideBg: string
  coverBg: string
  /** cover text */
  coverTitle: string
  coverSubtitle: string
  coverTag: string
  coverTagBg: string
  coverTagBorder: string
  /** body-slide text */
  heading: string
  subtitle: string
  body: string
  strong: string
  /** accents */
  accent: string
  accentText: string
  surface: string
  surfaceBorder: string
  highlightBg: string
  highlightBorder: string
  highlightText: string
  badgeBg: string
  badgeText: string
  pptx: PptxPalette
}

function renderText(s: string, strongColor: string) {
  const parts = s.split(/(\*\*[^*]+\*\*)/)
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={i} className="font-semibold" style={{ color: strongColor }}>{p.slice(2, -2)}</strong>
      : <span key={i}>{p}</span>
  )
}

function SlideContent({ slide, fs, theme }: { slide: Slide; fs: boolean; theme: DeckTheme }) {
  const t = {
    h1:      fs ? 'text-5xl'  : 'text-4xl',
    h2:      fs ? 'text-3xl'  : 'text-2xl',
    sub:     fs ? 'text-2xl'  : 'text-xl',
    body:    fs ? 'text-lg'   : 'text-sm',
    small:   fs ? 'text-base' : 'text-xs',
    tag:     fs ? 'text-base' : 'text-sm',
    gap:     fs ? 'gap-6'     : 'gap-4',
    listGap: fs ? 'space-y-4' : 'space-y-2.5',
    icon:    fs ? 'text-4xl'  : 'text-3xl',
  }

  const card = {
    background: theme.surface,
    border: `1px solid ${theme.surfaceBorder}`,
  }

  if (slide.type === 'cover') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-5">
        <div className={`${t.h1} font-extrabold tracking-tight leading-tight`} style={{ color: theme.coverTitle }}>
          {slide.title}
        </div>
        {slide.subtitle && <div className={`${t.sub} font-medium`} style={{ color: theme.coverSubtitle }}>{slide.subtitle}</div>}
        {slide.tag && (
          <div
            className={`mt-2 rounded-full px-4 py-1.5 ${t.tag}`}
            style={{ color: theme.coverTag, background: theme.coverTagBg, border: `1px solid ${theme.coverTagBorder}` }}
          >
            {slide.tag}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full ${t.gap}`}>
      <h2 className={`${t.h2} font-extrabold shrink-0`} style={{ color: theme.heading }}>{slide.title}</h2>
      {slide.subtitle && (
        <p className={`${t.sub} -mt-2`} style={{ color: theme.subtitle }}>{slide.subtitle}</p>
      )}
      {slide.quote && (
        <blockquote className={`pl-4 italic ${t.body}`} style={{ borderLeft: `4px solid ${theme.accent}`, color: theme.subtitle }}>
          {slide.quote}
        </blockquote>
      )}

      {slide.type === 'bullets' && slide.content && (
        <ul className={`${t.listGap} flex-1`}>
          {slide.content.map((item, i) => (
            <li key={i} className={`flex gap-3 ${t.body}`} style={{ color: theme.body }}>
              <span className="mt-0.5 shrink-0" style={{ color: theme.accent }}>▸</span>
              <span>{renderText(item, theme.strong)}</span>
            </li>
          ))}
        </ul>
      )}

      {slide.type === 'table' && slide.table && (
        <div className="flex-1 overflow-auto">
          <table className={`w-full ${t.body}`}>
            <thead>
              <tr>
                {slide.table.head.map((h, i) => (
                  <th key={i} className="text-left py-2 px-3 font-semibold" style={{ color: theme.subtitle, borderBottom: `1px solid ${theme.surfaceBorder}` }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slide.table.rows.map((row, ri) => (
                <tr key={ri} style={{ borderBottom: `1px solid ${theme.surfaceBorder}` }}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="py-2 px-3" style={{ color: theme.body }}>{renderText(cell, theme.strong)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {slide.type === 'pipeline' && slide.steps && (
        <div className="flex-1 flex items-center">
          <div className="flex flex-col gap-3 w-full">
            {slide.steps.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold ${t.body} shadow-md`}
                  style={{ background: theme.badgeBg, color: theme.badgeText }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 rounded-xl px-4 py-2.5" style={card}>
                  <span className={`font-semibold ${t.body}`} style={{ color: theme.heading }}>{s.name}</span>
                  <span className={`${t.body} ml-2`} style={{ color: theme.subtitle }}>→ {s.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {slide.type === 'two-col' && slide.cols && (
        <div className="flex-1 grid grid-cols-2 gap-4">
          {slide.cols.map((col, i) => (
            <div key={i} className="rounded-2xl p-5" style={card}>
              <div className={`font-semibold mb-2 ${t.body}`} style={{ color: theme.heading }}>{col.title}</div>
              <p className={`${t.small} leading-relaxed`} style={{ color: theme.body }}>{col.body}</p>
            </div>
          ))}
        </div>
      )}

      {slide.type === 'cards' && slide.cards && (
        <div className="flex-1 grid grid-cols-2 gap-3">
          {slide.cards.map((c, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl p-5" style={card}>
              <span className={t.icon}>{c.icon}</span>
              <span className={`font-medium ${t.body}`} style={{ color: theme.heading }}>{c.label}</span>
            </div>
          ))}
        </div>
      )}

      {slide.content && slide.type !== 'bullets' && (
        <ul className="space-y-2">
          {slide.content.map((item, i) => (
            <li key={i} className={`flex gap-2 ${t.body}`} style={{ color: theme.body }}>
              <span className="shrink-0" style={{ color: theme.accent }}>→</span>
              <span>{renderText(item, theme.strong)}</span>
            </li>
          ))}
        </ul>
      )}

      {slide.highlight && (
        <div
          className={`rounded-xl px-4 py-3 ${t.body} font-medium`}
          style={{ background: theme.highlightBg, border: `1px solid ${theme.highlightBorder}`, color: theme.highlightText }}
        >
          → {slide.highlight}
        </div>
      )}
    </div>
  )
}

export default function SlideDeck({
  slides,
  theme,
  fileName,
  backHref = '/slides',
  backLabel = '← Chọn bộ slide',
}: {
  slides: Slide[]
  theme: DeckTheme
  fileName: string
  backHref?: string
  backLabel?: string
}) {
  const [idx, setIdx] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const total = slides.length

  const handleExport = useCallback(async () => {
    setExporting(true)
    try {
      await exportToPptx(slides, fileName, theme.pptx)
    } finally {
      setExporting(false)
    }
  }, [slides, fileName, theme.pptx])

  const prev = useCallback(() => setIdx(i => Math.max(0, i - 1)), [])
  const next = useCallback(() => setIdx(i => Math.min(total - 1, i + 1)), [total])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen()
    else document.exitFullscreen()
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

  const slide = slides[idx]
  const control = {
    background: theme.controlBg,
    border: `1px solid ${theme.controlBorder}`,
    color: theme.onPage,
  }
  const kbd = { background: theme.controlBg, color: theme.onPage }

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col"
      style={{ background: theme.pageBg, ...(isFullscreen ? { height: '100vh', overflow: 'hidden' } : {}) }}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 shrink-0" style={{ borderBottom: `1px solid ${theme.controlBorder}` }}>
        <div className="flex items-center gap-3">
          {!isFullscreen && (
            <>
              <Link href={backHref} className="text-sm transition-colors hover:opacity-80" style={{ color: theme.onPageMuted }}>
                {backLabel}
              </Link>
              <span style={{ color: theme.controlBorder }}>|</span>
            </>
          )}
          <span className="text-sm" style={{ color: theme.onPageMuted }}>
            <kbd className="rounded px-1.5 py-0.5 text-xs" style={kbd}>←</kbd>
            {' / '}
            <kbd className="rounded px-1.5 py-0.5 text-xs" style={kbd}>→</kbd>
            {' '}chuyển ·{' '}
            <kbd className="rounded px-1.5 py-0.5 text-xs" style={kbd}>F</kbd>
            {' '}fullscreen
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: theme.onPageMuted }}>{idx + 1} / {total}</span>

          <button
            onClick={handleExport}
            disabled={exporting}
            title="Xuất file PowerPoint (.pptx)"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium hover:opacity-80 disabled:opacity-50 transition-opacity"
            style={control}
          >
            {exporting ? (
              <>
                <span className="h-3 w-3 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: theme.onPage, borderTopColor: 'transparent' }} />
                Đang xuất...
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 2v8M5 7l3 3 3-3M3 13h10"/>
                </svg>
                Xuất PPTX
              </>
            )}
          </button>

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Thoát toàn màn hình (Esc)' : 'Toàn màn hình (F)'}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium hover:opacity-80 transition-opacity"
            style={control}
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
      <div className={`flex-1 flex flex-col items-center justify-center ${isFullscreen ? 'p-0' : 'p-6'}`}>
        <div
          className="w-full transition-all duration-300"
          style={isFullscreen
            ? { width: 'min(100vw, calc((100vh - 56px) * 16 / 9))' }
            : { maxWidth: '900px' }
          }
        >
          <div
            key={idx}
            className="animate-fade-in shadow-2xl w-full"
            style={{
              background: slide.type === 'cover' ? theme.coverBg : theme.slideBg,
              aspectRatio: '16/9',
              overflow: 'hidden',
              padding: isFullscreen ? '3% 4%' : '40px',
              borderRadius: isFullscreen ? '0' : '24px',
            }}
          >
            <SlideContent slide={slide} fs={isFullscreen} theme={theme} />
          </div>

          {!isFullscreen && (
            <div className="mt-5 flex items-center justify-between">
              <button onClick={prev} disabled={idx === 0}
                className="rounded-xl px-4 py-2 text-sm font-medium hover:opacity-80 disabled:opacity-30 transition-opacity"
                style={control}>
                ← Trước
              </button>

              <div className="flex gap-1.5">
                {slides.map((_, i) => (
                  <button key={i} onClick={() => setIdx(i)}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{ width: i === idx ? '1.5rem' : '0.375rem', background: i === idx ? theme.accent : theme.controlBorder }} />
                ))}
              </div>

              <button onClick={next} disabled={idx === total - 1}
                className="rounded-xl px-4 py-2 text-sm font-medium hover:opacity-80 disabled:opacity-30 transition-opacity"
                style={control}>
                Tiếp →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
