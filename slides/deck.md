---
marp: true
theme: default
class: lead
paginate: true
backgroundColor: #ffffff
style: |
  section {
    font-family: 'Inter', system-ui, sans-serif;
  }
  h1, h2 { color: #1e40af; }
  h3 { color: #334155; }
  code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
  .small { font-size: 0.8em; color: #64748b; }
  table { font-size: 0.85em; }
  blockquote { border-left: 4px solid #3b82f6; padding-left: 1em; color: #475569; }
  strong { color: #1e40af; }
---

# AI Tư vấn Sản phẩm Tài chính
## Trợ lý So sánh & Gợi ý cho Người trẻ

**RAG + Multi-agent**

<br>

<span class="small">Đồ án UIT-LAB · 2026</span>

---

## 1. Bối cảnh

- Người trẻ VN (Gen Z, Millennials) bắt đầu có thu nhập
- **Rối** trước hàng trăm sản phẩm tài chính
- Thiếu thời gian so sánh, dễ bị quảng cáo dẫn dắt
- Dễ chọn sai sản phẩm so với nhu cầu và khẩu vị rủi ro

---

## 2. Bài toán cốt lõi

Đây **KHÔNG** phải hỏi-đáp kiến thức.

Đây là **so khớp hồ sơ ↔ sản phẩm có giải thích**:

- **Input:** hồ sơ (tuổi, thu nhập, mục tiêu, khẩu vị rủi ro)
- **Output:** sản phẩm phù hợp, xếp hạng, **kèm lý do** + disclaimer

---

## 3. Định vị pháp lý

> "Trợ lý So sánh & Gợi ý Sản phẩm Tài chính (tham khảo)"

- Mô hình **comparison site** (như TheBank) nhưng AI-driven
- Chỉ dùng **thông tin sản phẩm công khai**
- Không môi giới, không hoa hồng, không thiên vị
- Luôn kèm disclaimer + trích dẫn nguồn

---

## 4. Khoảng trống thị trường

|  | Cá nhân hóa | Đa NCC | Minh bạch lý do | Hội thoại |
|---|---|---|---|---|
| TheBank | ❌ | ✅ | ❌ | ❌ |
| Finhay / Infina | ✅ | ❌ | ❌ | ❌ |
| **Đề tài này** | ✅ | ✅ | ✅ | ✅ |

→ Vị trí trống: **AI hội thoại + đa NCC + giải thích được, tiếng Việt**

---

## 5. Phạm vi MVP

3 nhóm sản phẩm hợp với người trẻ:

1. 💰 **Tiền gửi tiết kiệm**
2. 📈 **Quỹ mở / micro-investing**
3. 💳 **Thẻ tín dụng**

<br>

<span class="small">Bảo hiểm = stretch goal</span>

---

## 6. Ba lớp dữ liệu

| Lớp | Tính chất | Lưu ở đâu |
|---|---|---|
| **Catalog sản phẩm** (lõi) | Structured | SQL DB |
| **Điều khoản & mô tả (T&C)** | Unstructured | Vector DB / RAG |
| **Kiến thức nền** | Ổn định | RAG phụ trợ |

> Dữ liệu động (lãi suất, NAV) → cập nhật vào DB qua API/crawl, **không** nhét vào vector.

---

## 7. Hybrid Retrieval

Điểm kỹ thuật trọng tâm — **2 cơ chế truy xuất**:

- **Structured filtering**
  Query SQL theo thuộc tính (lãi suất, kỳ hạn, phí, vốn min)
- **Semantic retrieval (RAG)**
  Tìm điều khoản / mô tả phù hợp ngữ cảnh
- **Re-ranking** + trích dẫn nguồn

---

## 8. Multi-agent Workflow

```
User
  ↓
[Profiler]    → chuẩn hóa hồ sơ
  ↓
[Researcher]  → Hybrid Retrieval (SQL + RAG)
  ↓
[Recommender] → so khớp, xếp hạng, GIẢI THÍCH lý do
  ↓
[Compliance]  → suitability, anti-bias, disclaimer
  ↓
Câu trả lời + reasoning + nguồn
```

---

## 9. Logic gợi ý

**Lọc cứng (hard constraints)**
Loại sản phẩm không đủ điều kiện (vốn min, thu nhập, tuổi)

**Chấm điểm (soft scoring)**
Khớp khẩu vị rủi ro + mục tiêu + kỳ hạn
Rule-based + LLM reasoning

**Xếp hạng (ranking)**
Top sản phẩm + đa dạng NCC (chống bias)

---

## 10. Giải thích (Explainability)

Mỗi gợi ý kèm **lý do minh bạch**:

> "Gợi ý quỹ X vì khẩu vị rủi ro thấp ✓, vốn tối thiểu phù hợp thu nhập ✓, kỳ hạn linh hoạt ✓"

→ Tăng độ tin cậy, chống "black box"
→ **Điểm cộng học thuật lớn** so với chatbot thường

---

## 11. Guardrails & Compliance

- **Disclaimer bắt buộc:** "Tham khảo, không phải khuyến nghị"
- **Anti-bias:** không ưu tiên 1 NCC, minh bạch tiêu chí
- **Suitability check:** sản phẩm rủi ro cao ≠ hồ sơ rủi ro thấp
- **Từ chối có kiểm soát:** không khuyến nghị mã CK, không cam kết lợi nhuận
- **PII:** thu nhập = nhạy cảm, không log, ẩn danh

---

## 12. Phương pháp đánh giá

| Loại | Metric |
|---|---|
| **Chất lượng gợi ý** (lõi) | Suitability, Precision@k, Diversity, Bias |
| **Chất lượng RAG** | Faithfulness, Context Precision, RAGAS |
| **Baseline** | LLM thuần / LLM+RAG / RAG+Multi-agent+Hybrid |
| **System** | Latency, chi phí token |

Golden test set: 50–100 kịch bản, có chuyên gia xác nhận.

---

## 13. Lộ trình 10 tuần

| Tuần | Trọng tâm |
|---|---|
| 1–2 | Đề cương, schema catalog, golden test |
| 3–4 | Hybrid Retrieval + metric lần 1 |
| 5–6 | **MVP**: 3 agent end-to-end (tiết kiệm) |
| 7–8 | Mở rộng 2 nhóm + Compliance Agent |
| 9 | UI + baseline comparison |
| 10 | Eval, báo cáo, slide, video |

---

## 14. Tech Stack

- **LLM:** GPT-4o / Claude (lý luận); mini cho Profiler
- **Multi-agent:** LangGraph
- **RAG:** LlamaIndex / LangChain
- **Structured DB:** SQLite → PostgreSQL
- **Vector DB:** ChromaDB → Qdrant
- **Embedding:** bge-m3 / multilingual-e5
- **UI:** Next.js + Tailwind (demo); Streamlit (báo cáo)

---

## 15. Bàn giao

1. **Source Code** — GitHub
2. **Dataset** — catalog + corpus T&C + golden test
3. **Báo cáo** — phương pháp, Hybrid Retrieval, eval
4. **Video Demo** — 3–5 phút end-to-end

---

# Q&A

**Cảm ơn!**

<span class="small">UIT-LAB · 2026</span>
