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

## How to Run

### Windows & Mac — Docker (recommended, no setup required)

No Python, no Node.js, no scripts needed. Docker handles everything inside containers.

**Step 1 — Install Docker Desktop**

Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/) for your OS.
Start it and wait until the icon is steady (whale in taskbar on Windows, menu bar icon on Mac).

**Step 2 — Start the app**

Windows (Command Prompt or PowerShell):
```bat
cd path\to\finance-advisory
docker compose up --build
```

Mac (Terminal):
```bash
cd path/to/finance-advisory
docker compose up --build
```

First run downloads ~500 MB total (Python slim + CPU PyTorch + Node Alpine). Subsequent starts reuse cached layers and take seconds.

**Step 3 — Open the app**

| Service | URL |
|---|---|
| Web UI | http://localhost:3000 |
| API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

**Stop:**

```bat
docker compose down
```

**Full reset** (wipe all data and start clean):
```bat
docker compose down -v
```

**Useful Docker commands (CPU):**

| Command | What it does |
|---|---|
| `docker compose up --build` | Build images and start all services |
| `docker compose up` | Start without rebuilding (faster after first run) |
| `docker compose down` | Stop and remove containers |
| `docker compose down -v` | Stop + wipe all data volumes |
| `docker compose logs -f api` | Stream backend logs only |
| `docker compose logs -f web` | Stream frontend logs only |

---

### With Docker — GPU version (for researchers / experimenters)

Use this if you have an NVIDIA GPU and want to run the embedding model and Ollama local LLM on GPU.

**Additional requirements:**
- NVIDIA GPU with driver **≥ 525**
- [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html) installed on the host

**Verify your setup before starting:**

```bash
# Should print your GPU name
nvidia-smi

# Should print "Hello from CUDA"
docker run --rm --gpus all nvidia/cuda:12.1-base-ubuntu22.04 nvidia-smi
```

**Start GPU version:**

Windows (PowerShell):
```powershell
docker compose -f docker-compose.gpu.yml up --build
```

Mac / Linux:
```bash
docker compose -f docker-compose.gpu.yml up --build
```

> **Note:** First run downloads ~3 GB (GPU PyTorch wheel + Ollama image). Subsequent starts reuse cached layers.

**After first start — pull a local LLM model into Ollama:**

```bash
# Pull the default model (qwen2.5:3b, ~2 GB)
docker exec -it uit-lab-ollama ollama pull qwen2.5:3b

# Or a larger, more capable model
docker exec -it uit-lab-ollama ollama pull llama3.2:3b
docker exec -it uit-lab-ollama ollama pull qwen2.5:7b
```

Once pulled, the API auto-detects Ollama and uses it for LLM rationale generation.

**What changes in GPU mode vs CPU mode:**

| | CPU (`docker-compose.yml`) | GPU (`docker-compose.gpu.yml`) |
|---|---|---|
| PyTorch build | CPU-only (~220 MB) | CUDA 12.1 (~2 GB) |
| Embedding device | CPU | CUDA (GPU) |
| Ollama | Not included | Included with GPU passthrough |
| LLM fallback order | Anthropic → OpenAI → stub | Anthropic → OpenAI → Ollama (GPU) → stub |
| Download size | ~500 MB | ~3 GB |

**Stop GPU version:**
```bash
docker compose -f docker-compose.gpu.yml down

# Full reset including Ollama model cache
docker compose -f docker-compose.gpu.yml down -v
```

**Optional — enable AI rationale**

Without an API key the app runs in **stub mode** (rule-based scoring, fully functional) — only the
2-sentence AI rationale per product is skipped. To enable it:

Windows:
```bat
copy backend\.env.example backend\.env
:: Open backend\.env in Notepad, set ANTHROPIC_API_KEY or OPENAI_API_KEY, then:
docker compose up --build
```

Mac:
```bash
cp backend/.env.example backend/.env
# Open backend/.env, set ANTHROPIC_API_KEY or OPENAI_API_KEY, then:
docker compose up --build
```

---

### Linux / WSL2 — one command

```bash
bash dev.sh
```

`dev.sh` is the single entry point. It auto-detects a first run, sets up everything, then starts
both services with colour-coded logs in one terminal.

| Command | What it does |
|---|---|
| `bash dev.sh` | Auto-setup on first run, then start API + Web |
| `bash dev.sh --setup` | Force re-run setup (reinstall deps, re-seed DB), then start |
| `bash dev.sh --stop` | Kill running API / Web processes from a previous session |

Press `Ctrl+C` to stop. Logs are saved to `.logs/api.log` and `.logs/web.log`.

**Shell scripts reference** (you only ever need `dev.sh` for local dev):

| Script | Purpose |
|---|---|
| `dev.sh` | **Start here** — setup + start everything |
| `setup.sh` | Prepare only (no server start) — useful for CI |
| `backend/run.sh` | Backend only — start API without the frontend |
| `backend/entrypoint.sh` | Docker only — called by `docker-compose.yml` |
| `slides/build.sh` | Rebuild slides after editing `slides/deck.md` |

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
│   ├── (main)/
│   │   ├── page.tsx          # Main page: ProfileForm + Recommendations + Report button
│   │   └── about/page.tsx    # Static about page
│   └── slides/page.tsx       # Built-in slide deck (keyboard navigation, fullscreen)
├── components/
│   ├── profile-form.tsx      # User input form
│   ├── recommendations.tsx   # ComparisonTable + ProductCards + TracePanel
│   ├── product-card.tsx      # Score ring, bars, pros/cons, LLM rationale
│   ├── comparison-table.tsx  # Top-3 side-by-side attribute table
│   ├── trace-panel.tsx       # Agent execution trace sidebar
│   ├── report.tsx            # Full-page report modal with radar charts + print/PDF
│   ├── nav.tsx               # Sticky header
│   └── disclaimer.tsx        # Footer disclaimer
└── lib/
    ├── api.ts                # fetch wrapper — falls back to mock if backend unreachable
    ├── types.ts              # TypeScript mirrors of all Pydantic schemas
    └── format.ts             # vnd(), pct(), label maps
```

---

## Project Structure

```
finance-advisory/
├── CLAUDE.md               # AI session context — read this first in every session
├── README.md               # This file
├── dev.sh                  # Linux/WSL2 entry point — setup + start everything
├── setup.sh                # Prepare only (no server start) — used by dev.sh internally
├── docker-compose.yml      # Windows/Mac/Linux Docker setup
├── ke-hoach-tong-quan.md   # Full project plan (Vietnamese)
├── backend/
│   ├── run.sh              # Backend only: setup + start uvicorn
│   ├── entrypoint.sh       # Docker entrypoint: migrate + seed + start
│   ├── data/
│   │   ├── catalog.json    # 15 products (seed source for SQL DB)
│   │   └── tc_docs/        # 15 Markdown T&C files (seed source for ChromaDB)
│   └── app/
│       ├── agents/         # Profiler, Researcher, Recommender, Compliance
│       ├── api/            # FastAPI routers
│       ├── core/           # Config, LLM abstraction, logging
│       ├── db/             # SQLAlchemy models, session, repositories, Alembic
│       ├── schemas/        # Pydantic schemas
│       ├── vector/         # ChromaDB wrapper + embeddings
│       ├── graph.py        # LangGraph pipeline singleton
│       └── main.py         # FastAPI app entry point
├── web/                    # Next.js frontend
└── slides/
    ├── deck.md             # Marp presentation source
    └── build.sh            # Builds deck.md → web/public/slides/index.html
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
