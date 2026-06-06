# UIT-LAB Financial Advisor

AI-powered financial product recommendation system for young Vietnamese users (Gen Z / Millennials).
Matches a user profile against savings accounts, open-end funds, and credit cards from real Vietnamese
providers — with transparent, explainable reasoning and compliance guardrails.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Next.js)                        │
│  ProfileForm  ──POST /recommend──►  Recommendations + TracePanel│
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP JSON
┌────────────────────────▼────────────────────────────────────────┐
│                    FastAPI  (port 8000)                         │
│   POST /recommend   GET /catalog   GET /health                  │
└────────────────────────┬────────────────────────────────────────┘
                         │ invoke(UserProfile)
┌────────────────────────▼────────────────────────────────────────┐
│              LangGraph Pipeline  (graph.py)                     │
│                                                                 │
│  [Profiler] → [Researcher] → [Recommender] → [Compliance] → END│
└─────────────────────────────────────────────────────────────────┘
         │              │              │               │
   Enriches         Hybrid         Scores &        Suitability
   profile         Retrieval       ranks           check +
   (income /       SQL filter +    products        disclaimer
   age bands)      RAG (ChromaDB)  LLM rationale
         │              │
   ┌─────┘    ┌──────────┴──────────┐
   │          │                     │
 State    SQLite DB            ChromaDB
 (dict)   (products)          (T&C chunks)
              │                     │
        Product catalog       multilingual-e5
        (structured)          embeddings
```

---

## Agent Pipeline

Each request flows through four agents in a fixed sequence. Every agent reads from and writes to a
shared `AgentState` dict; LangGraph merges partial updates so each node only touches the keys it owns.

### 1. Profiler
**File:** `backend/app/agents/profiler.py`

Normalises the raw `UserProfile` into derived bands used by downstream agents:

| Input field | Derived band |
|---|---|
| `monthly_income` | `income_band`: low / mid / high |
| `age` | `age_band`: young / mid / senior |

Outputs an `enriched` dict appended to the shared state.

### 2. Researcher — Hybrid Retrieval
**File:** `backend/app/agents/researcher.py`

Combines two retrieval mechanisms:

**Structured filter (SQL)** — queries the product catalog DB with hard constraints:
- Eligible product types mapped from the user's `goal` (`save` → savings/fund, `spend` → credit_card, …)
- `min_age` and `min_income_vnd` eligibility gates
- Falls back to age/income-only filter if the goal-typed query returns nothing

**Semantic retrieval (RAG)** — for each candidate product, queries ChromaDB for the 2 most relevant
Terms & Conditions chunks using a Vietnamese natural-language query built from the user's goal + risk
appetite. Returns `Citation` objects (chunk id, source URL, 240-char snippet).

### 3. Recommender
**File:** `backend/app/agents/recommender.py`

Scores every candidate against the profile across five dimensions:

| Dimension | What is measured |
|---|---|
| `risk_alignment` | Distance between user risk appetite and product risk level |
| `goal_alignment` | Lookup table: (goal, product_type) → fit score 0.1–1.0 |
| `income_compat` | Whether monthly income meets `min_income_vnd` |
| `amount_feasibility` | Whether 20 % of monthly income can cover `min_amount_vnd` |
| `horizon_match` | Overlap ratio between user's investment horizon and product term |

Final score = average of applicable dimensions. Products are sorted descending, then **diversity
capping** is applied (max 2 products per provider in the top-5 window).

An **LLM rationale** (≤ 2 Vietnamese sentences) is generated for each top-k product using the active
LLM provider, grounded on the score breakdown and T&C citations.

### 4. Compliance
**File:** `backend/app/agents/compliance.py`

Post-filters the ranked list before it reaches the user:
- Removes products with `risk_level = high` for users with `risk_appetite = low`
- Warns if every recommendation comes from the same provider (concentration risk)
- Appends the mandatory legal disclaimer to every response

---

## Data Layer

### Product Catalog (SQLite / PostgreSQL)
**File:** `backend/app/db/models.py`

One `products` table with a unified schema across all product types:

```
id · name · provider · type (savings|fund|credit_card)
risk_level (low|medium|high)
interest_rate_pct · expected_return_pct · annual_fee_vnd
min_amount_vnd · min_income_vnd · min_age · term_months
description · source_url · updated_at
```

Products are seeded from `backend/data/catalog.json` via `backend/scripts/seed.py`.

### Vector Store (ChromaDB)
**File:** `backend/app/vector/store.py`

Stores chunked Terms & Conditions documents from `backend/data/tc_docs/` (one Markdown file per
product). Each chunk carries metadata: `product_id`, `source_url`.

Embeddings use `intfloat/multilingual-e5-small` (configurable) running on CPU by default.

---

## LLM Abstraction
**File:** `backend/app/core/llm.py`

A single `LLMClient` protocol (`complete(system, prompt) → str`) with four concrete implementations.
Provider is selected by `LLM_PROVIDER` env var:

| Value | Provider | Default model |
|---|---|---|
| `auto` (default) | First available: Anthropic → OpenAI → Ollama → Stub | — |
| `anthropic` | Anthropic Messages API | `claude-haiku-4-5-20251001` |
| `openai` | OpenAI Chat Completions | `gpt-4o-mini` |
| `ollama` | Local Ollama daemon | `qwen2.5:3b` |
| `stub` | No-op (rule-based only) | — |

The pipeline is fully functional without any LLM configured — the stub returns empty strings and agents
fall back to deterministic scoring and templates.

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/recommend` | Run the full agent pipeline; returns ranked products + trace |
| `GET` | `/catalog` | List all products in the catalog DB |
| `GET` | `/health` | Liveness check |

### Request — `POST /recommend`

```json
{
  "age": 24,
  "monthly_income": 15000000,
  "goal": "save",
  "risk_appetite": "low",
  "investment_horizon_months": 12,
  "notes": null
}
```

`goal` options: `save` · `grow` · `spend` · `learn`  
`risk_appetite` options: `low` · `medium` · `high`

### Response — `RecommendResponse`

```json
{
  "recommendations": [
    {
      "rank": 1,
      "product": { "id": "...", "name": "...", "provider": "...", ... },
      "reasoning": {
        "score": 0.87,
        "score_breakdown": { "risk_alignment": 1.0, "goal_alignment": 1.0, ... },
        "pros": ["Mức rủi ro (low) khớp khẩu vị của bạn", ...],
        "cons": [],
        "llm_rationale": "Sản phẩm này phù hợp vì ...",
        "citations": [{ "chunk_id": "...", "source": "https://...", "snippet": "..." }]
      }
    }
  ],
  "compliance": {
    "passed": true,
    "disclaimer": "Thông tin trên chỉ mang tính tham khảo ...",
    "warnings": []
  },
  "trace": [
    { "agent": "Profiler",    "action": "enrich",             "summary": "income_band=mid age_band=young" },
    { "agent": "Researcher",  "action": "hybrid_retrieve",    "summary": "8 ứng viên · 16 đoạn T&C" },
    { "agent": "Recommender", "action": "score_rank_explain", "summary": "top-5 sản phẩm · llm=anthropic" },
    { "agent": "Compliance",  "action": "suitability_check",  "summary": "0 cảnh báo · 5 sản phẩm giữ lại" }
  ],
  "llm_provider": "anthropic"
}
```

---

## Frontend (Next.js)

```
web/
├── app/
│   ├── page.tsx          # Main page: ProfileForm + Recommendations
│   └── about/page.tsx
├── components/
│   ├── profile-form.tsx  # User input form
│   ├── recommendations.tsx
│   ├── product-card.tsx  # Single product card with score breakdown
│   ├── comparison-table.tsx
│   ├── trace-panel.tsx   # Agent execution trace (debug panel)
│   └── disclaimer.tsx
└── lib/
    ├── api.ts            # fetch wrapper for POST /recommend
    └── types.ts          # TypeScript mirrors of backend Pydantic schemas
```

---

## Project Structure

```
finance-advisory/
├── backend/
│   ├── app/
│   │   ├── agents/       # Profiler, Researcher, Recommender, Compliance + shared state
│   │   ├── api/          # FastAPI routers
│   │   ├── core/         # Config, LLM abstraction, logging
│   │   ├── db/           # SQLAlchemy models, session, repositories, Alembic migrations
│   │   ├── schemas/      # Pydantic schemas (UserProfile, Recommendation, …)
│   │   ├── vector/       # ChromaDB wrapper + sentence-transformer embeddings
│   │   ├── graph.py      # LangGraph pipeline (singleton, lru_cache)
│   │   └── main.py       # FastAPI app + CORS + lifespan
│   ├── data/
│   │   ├── catalog.json  # Seed data for all products
│   │   └── tc_docs/      # Per-product T&C Markdown files (indexed into ChromaDB)
│   ├── scripts/seed.py   # Populates DB + vector store from catalog.json + tc_docs/
│   └── tests/
├── web/                  # Next.js frontend
├── slides/               # Presentation deck (Marp)
├── docker-compose.yml
└── ke-hoach-tong-quan.md # Full project plan (Vietnamese)
```

---

## Running Locally

### With Docker (recommended)

```bash
cp backend/.env.example backend/.env
# Edit backend/.env — set at least one of ANTHROPIC_API_KEY / OPENAI_API_KEY
# or leave all blank to run with the rule-based stub (no LLM calls)

docker compose up --build
```

Services: API → `http://localhost:8000` · Web → `http://localhost:3000` · Ollama → `http://localhost:11434`

### Without Docker

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # configure LLM_PROVIDER and keys

alembic upgrade head           # create DB schema
python -m scripts.seed         # seed products + index T&C docs
uvicorn app.main:app --reload  # http://localhost:8000

# Frontend (separate terminal)
cd web
npm install
cp .env.local.example .env.local
npm run dev                    # http://localhost:3000
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | FastAPI, Uvicorn, Python 3.11+ |
| Agent orchestration | LangGraph + LangChain-core |
| Database | SQLite (dev) / PostgreSQL (prod), SQLAlchemy 2, Alembic |
| Vector store | ChromaDB (persistent local) |
| Embeddings | `intfloat/multilingual-e5-small` via sentence-transformers |
| LLM providers | Anthropic (Claude), OpenAI (GPT-4o-mini), Ollama (local) |
| Logging | structlog (structured JSON) |
| Containerisation | Docker Compose (api + ollama + web) |
