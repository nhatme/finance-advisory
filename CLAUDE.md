# CLAUDE.md — UIT-LAB Financial Advisor

Quick reference so each session starts with full context without re-reading the codebase.

---

## What this project is

A university lab project (UIT-LAB) — an AI financial product recommendation system for young Vietnamese users.
**Core task:** match a user profile (age, income, goal, risk appetite) against a catalog of savings accounts,
open-end funds, and credit cards → ranked list with transparent reasoning + compliance guardrails.

This is NOT a Q&A chatbot. It is a product-matching engine with explainable scoring.

---

## Tech stack (one line each)

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS — `web/` |
| Backend | FastAPI + Uvicorn, Python 3.11 — `backend/` |
| Agent orchestration | LangGraph (StateGraph, fixed DAG) |
| Structured DB | SQLite (dev) / PostgreSQL (prod), SQLAlchemy 2, Alembic |
| Vector store | ChromaDB (local persistent) |
| Embeddings | `intfloat/multilingual-e5-small` via sentence-transformers (CPU) |
| LLM | Pluggable: Anthropic → OpenAI → Ollama → Stub (auto-detected) |
| Logging | structlog (structured JSON) |

---

## Repository layout

```
finance-advisory/
├── CLAUDE.md               ← this file
├── README.md               ← architecture + setup guide
├── setup.sh                ← one-shot prep (venv, deps, migrate, seed, slides)
├── docker-compose.yml      ← api + ollama + web
├── ke-hoach-tong-quan.md   ← full Vietnamese project plan
│
├── backend/
│   ├── run.sh              ← dev start: venv + pip + migrate + seed + uvicorn
│   ├── entrypoint.sh       ← Docker only: migrate + seed + uvicorn
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/
│   │   ├── env.py          ← imports app.db.models so Base.metadata is populated
│   │   └── versions/
│   │       └── 0001_init.py ← creates `products` table
│   ├── data/
│   │   ├── catalog.json    ← 15 products (seed source for SQL DB)
│   │   └── tc_docs/        ← 15 Markdown T&C files, one per product (seed source for ChromaDB)
│   ├── scripts/
│   │   └── seed.py         ← seeds SQL catalog + ChromaDB vector index (idempotent)
│   ├── tests/
│   │   ├── conftest.py     ← isolated tmp DB + Chroma + LLM_PROVIDER=stub
│   │   └── test_pipeline.py
│   └── app/
│       ├── main.py         ← FastAPI app, CORS, lifespan (warm LLM on startup)
│       ├── graph.py        ← LangGraph pipeline singleton (lru_cache)
│       ├── core/
│       │   ├── config.py   ← Settings (pydantic-settings, reads .env)
│       │   ├── llm.py      ← LLM abstraction: AnthropicLLM / OpenAILLM / OllamaLLM / StubLLM
│       │   └── logging.py  ← structlog setup
│       ├── agents/
│       │   ├── state.py    ← AgentState TypedDict (shared between all nodes)
│       │   ├── profiler.py ← derives income_band + age_band, no LLM
│       │   ├── researcher.py ← Hybrid Retrieval: SQL filter + ChromaDB RAG per candidate
│       │   ├── recommender.py ← scores products (5 dimensions), diversity cap, LLM rationale
│       │   └── compliance.py ← suitability filter, concentration warning, disclaimer
│       ├── api/
│       │   ├── recommend.py ← POST /recommend → calls graph.invoke(profile)
│       │   ├── catalog.py   ← GET /catalog, GET /catalog/{id}
│       │   └── health.py    ← GET /health (db ping + vector count + llm provider)
│       ├── db/
│       │   ├── models.py    ← Product SQLAlchemy model
│       │   ├── session.py   ← engine + SessionLocal + get_db() FastAPI dep
│       │   ├── base.py      ← declarative Base
│       │   └── repositories/
│       │       └── product_repo.py ← list_all, get, filter_eligible, upsert, count
│       ├── schemas/
│       │   ├── profile.py        ← UserProfile (age, monthly_income, goal, risk_appetite, horizon)
│       │   ├── product.py        ← ProductDTO (Pydantic, from_attributes=True)
│       │   └── recommendation.py ← Citation, Reasoning, Recommendation, ComplianceCheck,
│       │                            TraceEntry, RecommendResponse
│       └── vector/
│           ├── store.py      ← VectorStore (ChromaDB wrapper, lru_cache singleton)
│           └── embeddings.py ← embed_query / embed_passages (E5 prefix logic)
│
├── web/
│   ├── .env.local          ← NEXT_PUBLIC_API_URL=http://localhost:8000
│   ├── app/
│   │   ├── layout.tsx      ← root layout: Nav + main + Disclaimer footer
│   │   ├── page.tsx        ← main page: ProfileForm + Recommendations + Report modal
│   │   ├── about/page.tsx  ← static about page
│   │   └── slides/page.tsx ← iframe wrapper for /slides/index.html
│   ├── components/
│   │   ├── profile-form.tsx    ← user input (age, income, goal, risk, horizon, notes)
│   │   ├── recommendations.tsx ← ComparisonTable + ProductCards + TracePanel
│   │   ├── product-card.tsx    ← single product: score, pills, pros/cons, LLM rationale
│   │   ├── comparison-table.tsx ← top-3 side-by-side attribute table
│   │   ├── trace-panel.tsx     ← agent execution trace + compliance warnings (sidebar)
│   │   ├── report.tsx          ← full-page report modal with print/PDF support
│   │   ├── nav.tsx             ← sticky header with links to / /slides /about
│   │   └── disclaimer.tsx      ← sticky footer disclaimer
│   ├── lib/
│   │   ├── api.ts          ← fetch wrapper; falls back to mock.ts if backend unreachable
│   │   ├── types.ts        ← TS interfaces mirroring all Pydantic schemas
│   │   ├── format.ts       ← vnd(), pct(), GOAL_LABEL, RISK_LABEL, RISK_COLOR, etc.
│   │   └── mock.ts         ← static mock response (used when backend is down)
│   └── public/
│       └── slides/
│           └── index.html  ← built by `bash slides/build.sh` (Marp → HTML)
│
└── slides/
    ├── deck.md             ← Marp presentation source
    └── build.sh            ← npx marp deck.md → web/public/slides/index.html
```

---

## Agent pipeline (LangGraph DAG)

```
UserProfile → [Profiler] → [Researcher] → [Recommender] → [Compliance] → RecommendResponse
```

### Profiler (`agents/profiler.py`)
- Input: `profile`
- Derives: `income_band` (low/mid/high), `age_band` (young/mid/senior)
- Output: `enriched` dict
- **No LLM call**

### Researcher (`agents/researcher.py`)
- Input: `profile`
- Step 1 — SQL filter: `ProductRepository.filter_eligible(age, income, types)` — hard constraints
- Step 2 — RAG: per-candidate ChromaDB search (2 chunks each), Vietnamese query built from goal+risk
- Output: `candidates: list[Product]`, `citations_by_product: dict[str, list[Citation]]`
- **No LLM call**

### Recommender (`agents/recommender.py`)
- Input: `candidates`, `citations_by_product`, `profile`
- Scores each product across 5 dimensions (see table below)
- Sorts descending; diversity cap: max 2 per provider in top-5
- Calls LLM once per top-k product for a 2-sentence Vietnamese rationale (≤180 tokens)
- Output: `recommendations: list[Recommendation]`
- **Only agent that calls LLM**

#### Scoring dimensions
| Key | What it measures |
|---|---|
| `risk_alignment` | 1 − 0.4 × \|user_risk − product_risk\| (ordinal 1–3) |
| `goal_alignment` | Lookup table (goal, product_type) → 0.1–1.0 |
| `income_compat` | Whether monthly income ≥ min_income_vnd |
| `amount_feasibility` | Whether 20% of income can cover min_amount_vnd |
| `horizon_match` | min(horizon, term) / max(horizon, term) |

### Compliance (`agents/compliance.py`)
- Removes `risk_level=high` products for `risk_appetite=low` users
- Warns if all remaining products share one provider
- Appends the mandatory disclaimer
- **No LLM call**

---

## Data layer

### Product catalog (SQL)
- Source: `backend/data/catalog.json` — 15 products
- Schema: id, name, provider, type (savings|fund|credit_card), risk_level (low|medium|high),
  interest_rate_pct, expected_return_pct, annual_fee_vnd, min_amount_vnd, min_income_vnd,
  min_age, term_months, description, source_url, updated_at
- Seeded via `scripts/seed.py → seed_catalog()` using `db.merge()` (idempotent)

### Vector store (ChromaDB)
- Source: `backend/data/tc_docs/*.md` — 15 Markdown files, one per product id
- Each file chunked at 600 chars (paragraph-aware), stored with metadata: product_id, source_url, provider, type
- Embeddings: `intfloat/multilingual-e5-small`, E5 prefix convention (`query: ...` / `passage: ...`)
- Seeded via `scripts/seed.py → seed_vectors()` (idempotent via `vs.reset()` + re-index on `--reset`)

---

## LLM provider selection (`core/llm.py`)

Auto mode (default) tries in order: **Anthropic → OpenAI → Ollama → Stub**

| Env var | Default |
|---|---|
| `LLM_PROVIDER` | `auto` |
| `ANTHROPIC_API_KEY` | (empty → skip) |
| `ANTHROPIC_MODEL` | `claude-haiku-4-5-20251001` |
| `OPENAI_API_KEY` | (empty → skip) |
| `OPENAI_MODEL` | `gpt-4o-mini` |
| `OLLAMA_HOST` | `http://localhost:11434` |
| `OLLAMA_MODEL` | `qwen2.5:3b` |

Stub mode: pipeline runs fully rule-based, no LLM rationale generated. All tests use stub.

---

## API endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/recommend` | Full pipeline; body = UserProfile JSON |
| `GET` | `/catalog` | All 15 products |
| `GET` | `/catalog/{id}` | Single product |
| `GET` | `/health` | DB ping, vector count, LLM provider |

### UserProfile fields
```json
{ "age": 24, "monthly_income": 15000000, "goal": "save", "risk_appetite": "low",
  "investment_horizon_months": 12, "notes": null }
```
`goal`: save | grow | spend | learn  
`risk_appetite`: low | medium | high

---

## Running locally

```bash
# One-time setup (creates venv, installs deps, migrates, seeds DB + vectors, builds slides)
bash setup.sh

# Start backend (http://localhost:8000)
bash backend/run.sh

# Start frontend (http://localhost:3000) — separate terminal
cd web && npm run dev

# Or Docker (api + ollama + web, all-in-one)
docker compose up --build
```

Tests (stub LLM, tmp DB, no network):
```bash
cd backend && source .venv/bin/activate
pytest tests/ -v
```

---

## Frontend pages

| Route | Component | Description |
|---|---|---|
| `/` | `app/page.tsx` | Profile form + recommendations + "Xem báo cáo" button |
| `/about` | `app/about/page.tsx` | Static project description |
| `/slides` | `app/slides/page.tsx` | iframe wrapping `public/slides/index.html` |

**Report modal** (`components/report.tsx`): opens as a fullscreen overlay from the main page.
Shows profile snapshot, all recommendations with score bar charts, compliance section,
agent trace, and a disclaimer. Has "In / Lưu PDF" button (`window.print()`).

---

## Key design decisions to remember

- **Hybrid Retrieval** = SQL hard-filter first, then RAG per-candidate. Not RAG-only.
- **LLM is only called in Recommender** — Profiler, Researcher, Compliance are all deterministic.
- **Stub mode is fully functional** — scoring and ranking work without any API key.
- **Diversity cap** — max 2 products per provider in top-5 to avoid single-provider monopoly.
- **Vector index scoped by product_id** — `vs.search(query, where={"product_id": p.id})` so RAG retrieval is per-candidate, not global.
- **PII policy** — user profile is never logged or persisted; each request is stateless.
- **E5 prefix convention** — queries prefixed `query: ...`, indexed passages prefixed `passage: ...` for correct cosine similarity.
