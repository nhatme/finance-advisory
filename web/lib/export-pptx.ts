// Dynamically imported to avoid SSR — only runs in the browser.

/** Per-deck colour palette (hex strings, no leading '#'). */
export type PptxPalette = {
  bg: string         // body-slide background
  coverBg: string    // cover-slide background
  coverTitle: string
  coverSubtitle: string
  coverTag: string
  heading: string    // slide titles + box headings
  subtitle: string   // subtitle / italic
  body: string       // body text
  strong: string     // **bold** runs
  accent: string     // bullets ▸, accent marks, rules
  accentDeep: string // table header fill, badges, accent bar
  surface: string    // card / box fill
  highlightBg: string
  highlightLine: string
  highlightText: string
  pageNum: string
}

// Default palette = original blue/slate look (keeps the legacy /slides deck unchanged).
const DEFAULT_PALETTE: PptxPalette = {
  bg:           '0F172A',
  coverBg:      '1E3A8A',
  coverTitle:   'FFFFFF',
  coverSubtitle:'BFDBFE',
  coverTag:     '93C5FD',
  heading:      'FFFFFF',
  subtitle:     'BFDBFE',
  body:         'BFDBFE',
  strong:       'FFFFFF',
  accent:       '60A5FA',
  accentDeep:   '2563EB',
  surface:      '1E293B',
  highlightBg:  '1D4ED8',
  highlightLine:'60A5FA',
  highlightText:'60A5FA',
  pageNum:      '475569',
}

// Parse **bold** markers into PptxGenJS text run objects
function richText(s: string, base: Record<string, unknown>, strong: string) {
  const parts = s.split(/(\*\*[^*]+\*\*)/)
  return parts.map(p =>
    p.startsWith('**') && p.endsWith('**')
      ? { text: p.slice(2, -2), options: { ...base, bold: true, color: strong } }
      : { text: p,              options: { ...base } }
  )
}

type Slide = {
  type: string
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

export async function exportToPptx(
  slides: Slide[],
  fileName = 'uit-lab-financial-advisor.pptx',
  palette: PptxPalette = DEFAULT_PALETTE,
) {
  // Dynamic import — avoids Next.js SSR crash (pptxgenjs uses window/document)
  const PptxGenJS = (await import('pptxgenjs')).default
  const pptx = new PptxGenJS()

  pptx.layout  = 'LAYOUT_WIDE'     // 16:9 (13.33 × 7.5 inches)
  pptx.title   = 'UIT-LAB Financial Advisor'
  pptx.subject = 'AI Tư vấn So sánh & Gợi ý Sản phẩm Tài chính — RAG + Multi-agent'
  pptx.author  = 'UIT-LAB'

  // Map palette → local names used throughout the layout code below.
  const P         = palette
  const BG        = P.bg
  const BG_CARD   = P.coverBg
  const WHITE     = P.heading      // slide titles + box/card headings
  const BLUE_200  = P.body         // body text + table cells
  const BLUE_300  = P.coverTag
  const BRAND_400 = P.accent       // bullets, accent marks
  const BRAND_600 = P.accentDeep   // accent bar, badges, table head fill
  const SURFACE   = P.surface      // card / box fill
  const SLATE_600 = P.pageNum

  const W = 13.33  // slide width  (inches)
  const H = 7.5    // slide height

  for (const data of slides) {
    const s = pptx.addSlide()
    s.background = { color: BG }

    // ── Left accent bar ──────────────────────────────────────────
    if (data.type !== 'cover') {
      s.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: 0.06, h: H,
        fill: { color: BRAND_600 },
        line: { color: BRAND_600, width: 0 },
      })
    }

    // ── COVER ────────────────────────────────────────────────────
    if (data.type === 'cover') {
      // Background gradient rectangle
      s.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: W, h: H,
        fill: { color: BG_CARD },
        line: { color: BG_CARD, width: 0 },
      })
      s.addText(data.title ?? '', {
        x: 0.8, y: 2.0, w: W - 1.6, h: 1.4,
        fontSize: 44, bold: true, color: P.coverTitle,
        align: 'center', valign: 'middle',
      })
      if (data.subtitle) {
        s.addText(data.subtitle, {
          x: 0.8, y: 3.6, w: W - 1.6, h: 0.7,
          fontSize: 24, color: P.coverSubtitle,
          align: 'center',
        })
      }
      if (data.tag) {
        s.addText(data.tag, {
          x: W / 2 - 2, y: 4.6, w: 4, h: 0.4,
          fontSize: 13, color: BLUE_300,
          align: 'center',
        })
      }
      continue
    }

    // ── Title (all non-cover slides) ─────────────────────────────
    s.addText(data.title ?? '', {
      x: 0.2, y: 0.2, w: W - 0.4, h: 0.65,
      fontSize: 26, bold: true, color: WHITE,
    })

    // Horizontal rule under title
    s.addShape(pptx.ShapeType.line, {
      x: 0.2, y: 0.9, w: W - 0.4, h: 0,
      line: { color: BRAND_600, width: 1.5 },
    })

    const BODY_Y = 1.1
    const BODY_H = H - BODY_Y - 0.3

    // ── Subtitle / Quote ─────────────────────────────────────────
    let offsetY = BODY_Y
    if (data.subtitle) {
      s.addText(data.subtitle, {
        x: 0.2, y: offsetY, w: W - 0.4, h: 0.4,
        fontSize: 15, color: P.subtitle, italic: true,
      })
      offsetY += 0.45
    }
    if (data.quote) {
      s.addShape(pptx.ShapeType.rect, {
        x: 0.2, y: offsetY, w: 0.06, h: 0.5,
        fill: { color: BRAND_400 },
        line: { color: BRAND_400, width: 0 },
      })
      s.addText(data.quote, {
        x: 0.4, y: offsetY, w: W - 0.6, h: 0.55,
        fontSize: 14, color: P.subtitle, italic: true,
      })
      offsetY += 0.65
    }

    // ── BULLETS ──────────────────────────────────────────────────
    if (data.type === 'bullets' && data.content) {
      const rows = data.content.map(item => richText(item, { fontSize: 16, color: BLUE_200 }))
      s.addText(
        rows.map((r, i) => [
          { text: '▸  ', options: { color: BRAND_400, fontSize: 16, bold: true } },
          ...r,
          ...(i < rows.length - 1 ? [{ text: '\n', options: { fontSize: 6 } }] : []),
        ]).flat(),
        { x: 0.3, y: offsetY, w: W - 0.6, h: BODY_H - (offsetY - BODY_Y), valign: 'top' }
      )
    }

    // ── TABLE ────────────────────────────────────────────────────
    if (data.type === 'table' && data.table) {
      const head = data.table.head.map(h => ({
        text: h,
        options: { bold: true, color: WHITE, fill: { color: BRAND_600 }, fontSize: 13 },
      }))
      const rows = data.table.rows.map(row =>
        row.map(cell => ({
          text: cell.replace(/\*\*/g, ''),
          options: { color: BLUE_200, fontSize: 12 },
        }))
      )
      s.addTable([head, ...rows], {
        x: 0.2, y: offsetY, w: W - 0.4,
        border: { type: 'solid', color: BRAND_600, pt: 0.5 },
        rowH: 0.42,
        color: BLUE_200,
      })
    }

    // ── PIPELINE ─────────────────────────────────────────────────
    if (data.type === 'pipeline' && data.steps) {
      data.steps.forEach((step, i) => {
        const y = offsetY + i * 1.1
        // Number badge
        s.addShape(pptx.ShapeType.roundRect, {
          x: 0.2, y, w: 0.55, h: 0.55,
          fill: { color: BRAND_600 },
          line: { color: BRAND_600, width: 0 },
          rectRadius: 0.1,
        })
        s.addText(`${i + 1}`, {
          x: 0.2, y, w: 0.55, h: 0.55,
          fontSize: 16, bold: true, color: WHITE,
          align: 'center', valign: 'middle',
        })
        // Step box
        s.addShape(pptx.ShapeType.roundRect, {
          x: 0.85, y, w: W - 1.1, h: 0.55,
          fill: { color: '1E293B' },
          line: { color: BRAND_600, width: 0.5 },
          rectRadius: 0.08,
        })
        s.addText([
          { text: step.name + '  ', options: { bold: true, color: WHITE, fontSize: 15 } },
          { text: '→  ' + step.desc, options: { color: BLUE_200, fontSize: 13 } },
        ], {
          x: 1.0, y, w: W - 1.3, h: 0.55,
          valign: 'middle',
        })
      })
    }

    // ── TWO-COL ──────────────────────────────────────────────────
    if (data.type === 'two-col' && data.cols) {
      const colW = (W - 0.6) / 2
      data.cols.forEach((col, i) => {
        const x = 0.2 + i * (colW + 0.2)
        s.addShape(pptx.ShapeType.roundRect, {
          x, y: offsetY, w: colW, h: BODY_H - (offsetY - BODY_Y),
          fill: { color: '1E293B' },
          line: { color: BRAND_600, width: 0.5 },
          rectRadius: 0.12,
        })
        s.addText(col.title, {
          x: x + 0.15, y: offsetY + 0.15, w: colW - 0.3, h: 0.4,
          fontSize: 15, bold: true, color: WHITE,
        })
        s.addText(col.body, {
          x: x + 0.15, y: offsetY + 0.6, w: colW - 0.3, h: BODY_H - (offsetY - BODY_Y) - 0.75,
          fontSize: 12, color: BLUE_200, wrap: true,
        })
      })
    }

    // ── CARDS ────────────────────────────────────────────────────
    if (data.type === 'cards' && data.cards) {
      const cols = 2
      const cardW = (W - 0.6) / cols
      const cardH = (BODY_H - (offsetY - BODY_Y) - 0.1) / Math.ceil(data.cards.length / cols)
      data.cards.forEach((card, i) => {
        const col = i % cols
        const row = Math.floor(i / cols)
        const x = 0.2 + col * (cardW + 0.2)
        const y = offsetY + row * (cardH + 0.15)
        s.addShape(pptx.ShapeType.roundRect, {
          x, y, w: cardW, h: cardH - 0.05,
          fill: { color: '1E293B' },
          line: { color: BRAND_600, width: 0.5 },
          rectRadius: 0.12,
        })
        s.addText(`${card.icon}  ${card.label}`, {
          x: x + 0.2, y, w: cardW - 0.4, h: cardH - 0.05,
          fontSize: 16, color: WHITE, valign: 'middle',
        })
      })
    }

    // ── Extra content bullets (non-bullet slides) ─────────────────
    if (data.content && data.type !== 'bullets') {
      const startY = offsetY + (
        data.type === 'table'    ? (data.table!.rows.length + 1) * 0.42 + 0.2 :
        data.type === 'pipeline' ? data.steps!.length * 1.1 + 0.1 :
        0
      )
      s.addText(
        data.content.map((item, i) => [
          { text: '→  ', options: { color: BRAND_400, fontSize: 13, bold: true } },
          ...richText(item, { fontSize: 13, color: BLUE_200 }),
          ...(i < data.content!.length - 1 ? [{ text: '\n', options: { fontSize: 4 } }] : []),
        ]).flat(),
        { x: 0.3, y: startY, w: W - 0.6, h: 0.8, valign: 'top' }
      )
    }

    // ── Highlight box ─────────────────────────────────────────────
    if (data.highlight) {
      s.addShape(pptx.ShapeType.roundRect, {
        x: 0.2, y: H - 0.75, w: W - 0.4, h: 0.5,
        fill: { color: '1D4ED8' },
        line: { color: BRAND_400, width: 0.8 },
        rectRadius: 0.08,
      })
      s.addText('→  ' + data.highlight, {
        x: 0.35, y: H - 0.75, w: W - 0.7, h: 0.5,
        fontSize: 13, bold: true, color: BRAND_400, valign: 'middle',
      })
    }

    // ── Slide number ──────────────────────────────────────────────
    s.addText(`${slides.indexOf(data) + 1} / ${slides.length}`, {
      x: W - 0.8, y: H - 0.3, w: 0.7, h: 0.25,
      fontSize: 9, color: SLATE_600, align: 'right',
    })
  }

  await pptx.writeFile({ fileName: 'uit-lab-financial-advisor.pptx' })
}
