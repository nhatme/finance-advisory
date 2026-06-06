---
marp: true
theme: default
class: lead
paginate: true
backgroundColor: #ffffff
style: |
  section {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 1.05em;
  }
  h1 { color: #1e40af; }
  h2 { color: #1e40af; margin-bottom: 0.5em; }
  h3 { color: #334155; }
  code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
  .small { font-size: 0.78em; color: #64748b; }
  table { font-size: 0.82em; }
  blockquote { border-left: 4px solid #3b82f6; padding-left: 1em; color: #475569; font-style: normal; }
  strong { color: #1e40af; }
  ul li { margin-bottom: 0.3em; }
  pre { font-size: 0.8em; }
---

# AI Tư vấn Sản phẩm Tài chính

## Hệ thống So khớp & Gợi ý có Giải thích
### dành cho Người trẻ Việt Nam

<br>

<span class="small">UIT-LAB · 2026 &nbsp;|&nbsp; LangGraph · FastAPI · Next.js · ChromaDB</span>

---

## Vấn đề

Người trẻ Việt Nam (Gen Z, Millennials) **bắt đầu có thu nhập** nhưng:

- Hàng trăm sản phẩm tài chính từ hàng chục nhà cung cấp
- Thiếu công cụ so sánh **cá nhân hóa** theo hồ sơ thực tế
- Dễ chọn sai sản phẩm so với **mục tiêu** và **khẩu vị rủi ro**
- Các nền tảng hiện tại hoặc thiên vị nhà cung cấp, hoặc thiếu giải thích

---

## Đây KHÔNG phải chatbot hỏi-đáp

> **Đây là engine so khớp hồ sơ ↔ sản phẩm có giải thích minh bạch**

| Input | Output |
|---|---|
| Tuổi, thu nhập hàng tháng | Danh sách sản phẩm phù hợp |
| Mục tiêu (tiết kiệm / tăng trưởng / chi tiêu) | Điểm số 5 chiều |
| Khẩu vị rủi ro (thấp / vừa / cao) | **Lý do bằng tiếng Việt** |
| Kỳ hạn đầu tư | Cảnh báo compliance + disclaimer |

---

## Định vị thị trường

|  | Cá nhân hóa | Đa NCC | Giải thích lý do | Minh bạch |
|---|---|---|---|---|
| TheBank | ❌ | ✅ | ❌ | ❌ |
| Finhay / Infina | ✅ | ❌ | ❌ | ❌ |
| **Hệ thống này** | ✅ | ✅ | ✅ | ✅ |

<br>

> **Vị trí trống:** AI đa nhà cung cấp + có giải thích + tiếng Việt

---

## Phạm vi sản phẩm (15 sản phẩm MVP)

| Nhóm | Ví dụ | Rủi ro |
|---|---|---|
| 💰 Tiền gửi tiết kiệm | Techcombank, BIDV, VPBank | Thấp |
| 📈 Quỹ mở / micro-investing | VinaCapital, Dragon Capital, Finhay | Vừa – Cao |
| 💳 Thẻ tín dụng | VIB, Sacombank, MB Bank | Thấp |

<br>

Dữ liệu từ nguồn **công khai**, cập nhật vào SQL DB — **không** nhúng vào vector.

---

## Ba lớp dữ liệu

| Lớp | Tính chất | Lưu ở đâu |
|---|---|---|
| **Catalog sản phẩm** | Lãi suất, phí, điều kiện tối thiểu | SQLite / PostgreSQL |
| **Điều khoản & mô tả (T&C)** | Văn bản Markdown 15 sản phẩm | ChromaDB (vector) |
| **Hồ sơ người dùng** | Nhập mỗi lần, stateless | Không lưu (PII) |

<br>

<span class="small">Lãi suất / NAV biến động → cập nhật SQL, không cần re-index vector</span>

---

## Hybrid Retrieval — Trọng tâm kỹ thuật

**Không** dùng RAG đơn thuần. Hệ thống dùng **2 cơ chế song song**:

```
Hồ sơ người dùng
       │
  [SQL Filter]  ← lọc cứng: thu nhập, tuổi, loại sản phẩm
       │
  candidate list
       │
  [ChromaDB RAG] ← mỗi sản phẩm: 2 chunk T&C ngữ nghĩa gần nhất
       │
  candidates + citations
```

> SQL đảm bảo **đủ điều kiện**, RAG đảm bảo **ngữ cảnh T&C chính xác**

---

## Multi-agent Pipeline (LangGraph)

```
UserProfile
     ↓
[Profiler]     → chuẩn hóa: income_band, age_band  (no LLM)
     ↓
[Researcher]   → Hybrid Retrieval: SQL filter + RAG  (no LLM)
     ↓
[Recommender]  → chấm điểm 5 chiều + xếp hạng      (LLM ×k)
     ↓
[Compliance]   → suitability check, diversity, disclaimer (no LLM)
     ↓
RecommendResponse (JSON)
```

<span class="small">Chỉ Recommender gọi LLM — Profiler, Researcher, Compliance hoàn toàn rule-based</span>

---

## Chấm điểm 5 chiều (Recommender)

| Chiều | Công thức |
|---|---|
| `risk_alignment` | `1 − 0.4 × |user_risk − product_risk|` |
| `goal_alignment` | Bảng tra (goal, loại sản phẩm) → 0.1 – 1.0 |
| `income_compat` | Thu nhập ≥ `min_income_vnd` |
| `amount_feasibility` | 20% thu nhập ≥ `min_amount_vnd` |
| `horizon_match` | `min(horizon, term) / max(horizon, term)` |

Sắp xếp giảm dần · **Diversity cap:** tối đa 2 sản phẩm / nhà cung cấp trong top-5

---

## Explainability — Chống "Black Box"

Mỗi gợi ý kèm lý do **bằng tiếng Việt**, do LLM tạo ra từ T&C thực tế:

> *"Gợi ý Quỹ Cân bằng VinaCapital vì khẩu vị rủi ro vừa phải phù hợp ✓, vốn tối thiểu 100k nằm trong 20% thu nhập ✓, kỳ hạn linh hoạt khớp mục tiêu 12 tháng ✓"*

<br>

- Điểm số hiển thị theo từng chiều (thanh màu)
- Trích dẫn nguồn T&C tương ứng
- Agent trace đầy đủ trong UI

---

## Compliance & Guardrails

- **Suitability:** loại sản phẩm rủi ro cao nếu hồ sơ rủi ro thấp
- **Diversity:** cảnh báo nếu tất cả gợi ý từ cùng 1 nhà cung cấp
- **Disclaimer bắt buộc:** "Tham khảo, không phải khuyến nghị đầu tư"
- **Không cam kết lợi nhuận**, không môi giới, không hoa hồng
- **PII:** hồ sơ người dùng không log, không lưu — stateless

---

## LLM Provider — Linh hoạt, không phụ thuộc

Hệ thống tự động chọn theo thứ tự ưu tiên:

```
Anthropic (Claude Haiku) → OpenAI (GPT-4o mini) → Ollama (local) → Stub
```

- **Stub mode:** pipeline chạy hoàn toàn rule-based, không cần API key
- Mọi test đều dùng Stub — không phụ thuộc mạng hay chi phí
- Có thể deploy offline với Ollama (Qwen 2.5:3B)

---

## Tech Stack thực tế

| Tầng | Công nghệ |
|---|---|
| **Agent orchestration** | LangGraph (StateGraph, fixed DAG) |
| **Backend API** | FastAPI + Uvicorn, Python 3.11 |
| **Structured DB** | SQLite (dev) / PostgreSQL (prod), SQLAlchemy 2 |
| **Vector store** | ChromaDB (local persistent) |
| **Embedding** | `intfloat/multilingual-e5-small` (CPU, E5 prefix) |
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS |
| **Logging** | structlog (structured JSON) |

---

## Demo Flow

1. Người dùng nhập hồ sơ (tuổi, thu nhập, mục tiêu, rủi ro, kỳ hạn)
2. `POST /recommend` → LangGraph pipeline chạy ~1–3 giây
3. Kết quả hiển thị:
   - **Bảng so sánh top-3** (side-by-side)
   - **Card từng sản phẩm** với điểm 5 chiều + lý do LLM
   - **Agent trace panel** (sidebar)
   - **"Xem báo cáo"** → overlay in/PDF

<br>

<span class="small">Fallback: nếu backend không khởi động → frontend dùng mock response tĩnh</span>

---

## Kết quả & Điểm nổi bật học thuật

- **Hybrid Retrieval** thay vì RAG đơn thuần → loại bỏ sản phẩm không đủ điều kiện ngay từ SQL
- **Multi-agent DAG cố định** → dễ kiểm thử, dễ audit từng node
- **Explainability per recommendation** → điểm cộng so với chatbot thông thường
- **Stub mode** → test coverage đầy đủ, không phụ thuộc API
- **Stateless / no PII** → phù hợp triển khai thực tế

---

# Demo & Hỏi đáp

<br>

**GitHub:** `UIT-LAB / finance-advisory`

<br>

<span class="small">UIT-LAB · 2026</span>
