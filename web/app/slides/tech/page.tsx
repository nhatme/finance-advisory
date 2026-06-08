'use client'

import SlideDeck, { type Slide, type DeckTheme } from '@/components/slide-deck'

const SLIDES: Slide[] = [
  {
    type: 'cover',
    title: 'Kiến trúc & Kỹ thuật',
    subtitle: 'RAG + Multi-agent · Hybrid Retrieval · Explainable Scoring',
    members: ['Phan Văn Nhật — 26410083', 'Trương Quốc Bảo — 26410008'],
    tag: 'UIT-LAB · Technical Deep-Dive 2026',
  },

  // ── TỔNG QUAN ────────────────────────────────────────────────
  {
    type: 'two-col',
    title: '1. Tổng quan hệ thống',
    subtitle: 'Tách biệt Frontend ↔ Backend, giao tiếp qua REST',
    cols: [
      { title: 'Frontend', body: 'Next.js 14 (App Router) · TypeScript · Tailwind. Gọi POST /recommend; tự fallback mock khi backend offline.' },
      { title: 'Backend', body: 'FastAPI + Uvicorn · Python 3.11. LangGraph điều phối; SQLite/Postgres + ChromaDB; structlog JSON.' },
    ],
    highlight: 'Stateless per request — không lưu hồ sơ người dùng (PII policy).',
  },
  {
    type: 'table',
    title: '2. Các lớp công nghệ',
    table: {
      head: ['Lớp', 'Công nghệ'],
      rows: [
        ['Orchestration', 'LangGraph (StateGraph, DAG cố định)'],
        ['Structured DB', 'SQLite (dev) / PostgreSQL (prod), SQLAlchemy 2, Alembic'],
        ['Vector store',  'ChromaDB (local persistent)'],
        ['Embeddings',    'multilingual-e5-small (sentence-transformers, CPU)'],
        ['LLM',           'Anthropic → OpenAI → Ollama → Stub (auto)'],
      ],
    },
  },
  {
    type: 'bullets',
    title: '3. AgentState & LangGraph',
    content: [
      'DAG cố định 4 node — không vòng lặp, không nhánh điều kiện',
      '**AgentState** (TypedDict) chia sẻ giữa mọi node',
      'LangGraph **merge** partial update — mỗi node chỉ ghi key nó sở hữu',
      'Pipeline khởi tạo 1 lần qua **lru_cache** singleton (graph.py)',
      'Warm LLM ở startup (lifespan) → request đầu không trả phí cold-start',
    ],
    highlight: 'Deterministic, dễ test, dễ trace — mỗi bước ghi 1 TraceEntry.',
  },
  {
    type: 'pipeline',
    title: '4. Pipeline 4 agent',
    steps: [
      { name: 'Profiler',    desc: 'income_band + age_band. Không LLM.' },
      { name: 'Researcher',  desc: 'SQL filter → RAG per-candidate. Không LLM.' },
      { name: 'Recommender', desc: 'Score 5 chiều + LLM rationale. DUY NHẤT gọi LLM.' },
      { name: 'Compliance',  desc: 'Suitability filter + cảnh báo + disclaimer.' },
    ],
    highlight: 'Chỉ Recommender gọi LLM — 3 agent còn lại hoàn toàn deterministic.',
  },

  // ── TỪNG AGENT ───────────────────────────────────────────────
  {
    type: 'table',
    title: '5. Profiler — suy ra band',
    subtitle: 'Chuẩn hóa hồ sơ thô thành band cho downstream · không LLM',
    table: {
      head: ['Input', 'Band suy ra'],
      rows: [
        ['monthly_income', 'income_band: low / mid / high'],
        ['age',            'age_band: young / mid / senior'],
      ],
    },
    highlight: 'Xuất `enriched` dict, ghi vào shared state.',
  },
  {
    type: 'two-col',
    title: '6. Researcher — Hybrid Retrieval',
    subtitle: 'SQL hard-filter TRƯỚC, rồi RAG từng ứng viên',
    cols: [
      { title: 'Bước 1 — SQL filter', body: 'filter_eligible: map goal→type (save→savings/fund, spend→credit_card), gate min_age & min_income. Fallback nếu rỗng.' },
      { title: 'Bước 2 — RAG per-candidate', body: 'Mỗi ứng viên: ChromaDB lấy 2 chunk T&C liên quan nhất, scoped theo product_id. Trả Citation (chunk id, url, snippet 240 ký tự).' },
    ],
    highlight: 'Không RAG-only: lọc cứng giảm nhiễu trước khi tìm ngữ nghĩa.',
  },
  {
    type: 'table',
    title: '7. Recommender — Scoring 5 chiều',
    table: {
      head: ['Chiều', 'Đo lường'],
      rows: [
        ['**risk_alignment**',     '1 − 0.4 × |risk_user − risk_sp| (ordinal 1–3)'],
        ['**goal_alignment**',     'Bảng tra (goal, type) → 0.1–1.0'],
        ['**income_compat**',      'monthly_income ≥ min_income_vnd?'],
        ['**amount_feasibility**', '20% thu nhập ≥ min_amount_vnd?'],
        ['**horizon_match**',      'min(horizon, term) / max(horizon, term)'],
      ],
    },
    highlight: 'Điểm tổng = trung bình các chiều áp dụng được.',
  },
  {
    type: 'bullets',
    title: '8. Recommender — Rank & Rationale',
    content: [
      'Sort giảm dần theo điểm tổng',
      '**Diversity cap:** tối đa 2 sản phẩm / nhà cung cấp trong top-5',
      'LLM sinh **≤2 câu** lý do tiếng Việt cho mỗi top-k (≤180 token)',
      'Lý do **grounded** trên score breakdown + trích dẫn T&C',
      'Đây là agent **duy nhất** gọi LLM trong toàn pipeline',
    ],
  },
  {
    type: 'bullets',
    title: '9. Compliance — hậu kiểm',
    content: [
      'Loại sản phẩm **risk_level=high** với người dùng **risk_appetite=low**',
      'Cảnh báo nếu mọi gợi ý đến từ **một nhà cung cấp** (concentration risk)',
      'Chèn **disclaimer** pháp lý bắt buộc vào mọi response',
      'Hoàn toàn rule-based — không gọi LLM',
    ],
  },

  // ── DỮ LIỆU ──────────────────────────────────────────────────
  {
    type: 'bullets',
    title: '10. Catalog schema (unified)',
    subtitle: 'Một bảng products chung cho cả 3 nhóm sản phẩm',
    content: [
      'id · name · provider · **type** (savings|fund|credit_card)',
      '**risk_level** (low|medium|high)',
      'interest_rate_pct · expected_return_pct · annual_fee_vnd',
      'min_amount_vnd · min_income_vnd · min_age · term_months',
      'description · source_url · updated_at',
    ],
    highlight: 'Schema thống nhất → filter & rank đồng nhất mọi loại sản phẩm.',
  },
  {
    type: 'table',
    title: '11. Lớp dữ liệu & Seed',
    table: {
      head: ['Lớp', 'Nguồn', 'Lưu trữ'],
      rows: [
        ['**Catalog** (15 SP)',   'catalog.json', 'SQL (SQLAlchemy 2)'],
        ['**T&C docs** (15 file)', 'tc_docs/*.md', 'ChromaDB vector'],
        ['**Migrations**',         'Alembic 0001', 'bảng products'],
      ],
    },
    highlight: 'Seed idempotent: db.merge() cho SQL, vs.reset() + re-index cho vector.',
  },
  {
    type: 'bullets',
    title: '12. Vector store & Embeddings',
    content: [
      '**ChromaDB** local persistent — collection `tc_docs`',
      'Chunk **600 ký tự**, paragraph-aware; metadata: product_id, source_url, provider, type',
      'Model **intfloat/multilingual-e5-small** (CPU, ~470MB)',
      '**E5 prefix:** query → `query: …`, passage → `passage: …` cho cosine đúng',
      'Search **scoped theo product_id** → RAG per-candidate, không global',
    ],
  },

  // ── LLM & API ────────────────────────────────────────────────
  {
    type: 'table',
    title: '13. LLM Provider — Auto fallback',
    subtitle: 'LLM_PROVIDER=auto thử lần lượt tới khi có provider khả dụng',
    table: {
      head: ['Thứ tự', 'Provider', 'Model mặc định'],
      rows: [
        ['1', 'Anthropic',      'claude-haiku-4-5'],
        ['2', 'OpenAI',         'gpt-4o-mini'],
        ['3', 'Ollama (local)', 'qwen2.5:3b'],
        ['4', '**Stub**',       'rule-based, không cần API key'],
      ],
    },
    highlight: 'Protocol chung: complete(system, prompt) → str. Stub chạy đầy đủ pipeline.',
  },
  {
    type: 'table',
    title: '14. API Endpoints',
    table: {
      head: ['Method', 'Path', 'Mô tả'],
      rows: [
        ['POST', '/recommend',    'Full pipeline; body = UserProfile'],
        ['GET',  '/catalog',      'Toàn bộ 15 sản phẩm'],
        ['GET',  '/catalog/{id}', 'Một sản phẩm'],
        ['GET',  '/health',       'DB ping + vector count + LLM provider'],
      ],
    },
  },
  {
    type: 'bullets',
    title: '15. Response shape',
    subtitle: 'RecommendResponse — minh bạch & truy vết được',
    content: [
      '**recommendations[]:** score, **score_breakdown** (5 chiều), pros/cons, rationale',
      '**citations[]:** chunk id, source_url, snippet — cho từng con số',
      '**compliance:** warnings + disclaimer bắt buộc',
      '**trace[]:** mỗi agent ghi action + summary → hiển thị ở TracePanel',
    ],
  },

  // ── KIỂM THỬ & VẬN HÀNH ──────────────────────────────────────
  {
    type: 'bullets',
    title: '16. Kiểm thử & Chất lượng',
    subtitle: 'Pytest chạy offline — không cần mạng, không cần API key',
    content: [
      '**conftest.py:** tmp DB + Chroma riêng + LLM_PROVIDER=stub → cô lập hoàn toàn',
      '**test_pipeline.py:** kiểm thử pipeline end-to-end qua stub',
      'Stub mode → kết quả **deterministic**, CI ổn định, không tốn token',
      'Ranh giới agent rõ ràng → dễ test từng bước qua AgentState',
    ],
    highlight: 'pytest tests/ -v — xanh mà không gọi mạng hay LLM thật.',
  },
  {
    type: 'two-col',
    title: '17. Triển khai & Vận hành',
    subtitle: 'Docker Compose · cấu hình qua .env · health check',
    cols: [
      { title: 'CPU (mặc định)', body: 'docker-compose.yml: api + web. entrypoint tự migrate + seed + uvicorn; health check tại /health.' },
      { title: 'GPU (nghiên cứu)', body: 'docker-compose.gpu.yml: thêm Ollama chạy GPU cho LLM local nhanh hơn.' },
    ],
    highlight: 'Cấu hình runtime qua biến môi trường: LLM_PROVIDER, CORS_ORIGINS, DATABASE_URL.',
  },

  // ── KẾT ──────────────────────────────────────────────────────
  {
    type: 'bullets',
    title: '18. Quyết định thiết kế cốt lõi',
    content: [
      '**Hybrid Retrieval** — SQL trước, RAG sau (không RAG-only)',
      '**LLM chỉ ở Recommender** — phần còn lại deterministic, dễ test',
      '**Stub fully functional** — scoring + ranking chạy không cần API key',
      '**Diversity cap** — chống một NCC độc chiếm top-5',
      '**PII policy** — hồ sơ không log, không lưu, stateless',
    ],
  },
  {
    type: 'cover',
    title: 'Cảm ơn!',
    subtitle: 'Q&A — Technical',
    tag: 'UIT-LAB · 2026',
  },
]

const THEME: DeckTheme = {
  dark: true,
  pageBg:         '#021410',
  onPage:         '#ffffff',
  onPageMuted:    '#6ee7b7',
  controlBg:      'rgba(255,255,255,0.08)',
  controlBorder:  'rgba(110,231,183,0.2)',
  slideBg:  'linear-gradient(135deg, #064e3b 0%, #065f46 55%, #022c22 100%)',
  coverBg:  'linear-gradient(135deg, #064e3b 0%, #065f46 55%, #022c22 100%)',
  coverTitle:      '#ffffff',
  coverSubtitle:   '#a7f3d0',
  coverTag:        '#d1fae5',
  coverTagBg:      'rgba(255,255,255,0.1)',
  coverTagBorder:  'rgba(167,243,208,0.3)',
  heading:        '#ffffff',
  subtitle:       '#a7f3d0',
  body:           '#d1fae5',
  strong:         '#ffffff',
  accent:         '#34d399',
  accentText:     '#34d399',
  surface:        'rgba(255,255,255,0.08)',
  surfaceBorder:  'rgba(110,231,183,0.18)',
  highlightBg:    'rgba(16,185,129,0.2)',
  highlightBorder:'rgba(52,211,153,0.4)',
  highlightText:  '#a7f3d0',
  badgeBg:        '#059669',
  badgeText:      '#ffffff',
  pptx: {
    bg:            '022C22',
    coverBg:       '064E3B',
    coverTitle:    'FFFFFF',
    coverSubtitle: 'A7F3D0',
    coverTag:      '6EE7B7',
    heading:       'FFFFFF',
    subtitle:      'A7F3D0',
    body:          'D1FAE5',
    strong:        'FFFFFF',
    accent:        '34D399',
    accentDeep:    '059669',
    surface:       '064E3B',
    highlightBg:   '047857',
    highlightLine: '34D399',
    highlightText: '6EE7B7',
    pageNum:       '475569',
  },
}

export default function TechSlidesPage() {
  return (
    <SlideDeck
      slides={SLIDES}
      theme={THEME}
      fileName="uit-lab-tech.pptx"
      backHref="/slides"
      backLabel="← Chọn bộ slide"
    />
  )
}
