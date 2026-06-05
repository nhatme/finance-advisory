# Kế Hoạch Tổng Quan Đồ Án
## AI Tư vấn Sản phẩm Tài chính cho Người trẻ — Ứng dụng RAG & Multi-agent

> **Trọng tâm:** Hệ thống **gợi ý & so khớp sản phẩm tài chính (Product Matching / Recommendation)**. Nhiệm vụ lõi: *hiểu hồ sơ người dùng → khớp với sản phẩm phù hợp → so sánh & giải thích lý do → kiểm soát tuân thủ.*
>
> **Định vị pháp lý:** Sản phẩm là **"Trợ lý So sánh & Gợi ý Sản phẩm Tài chính (tham khảo)"** — tương tự mô hình comparison site (TheBank), nhưng AI-driven, cá nhân hóa. Chỉ dùng **thông tin sản phẩm công khai**, không đóng vai môi giới/đại lý, không nhận hoa hồng, không thiên vị nhà cung cấp, luôn kèm disclaimer. Tránh khuyến nghị mã chứng khoán cụ thể (vùng pháp lý nhạy cảm).
>
> **Phạm vi sản phẩm (scope):** 3 nhóm hợp với người trẻ — (1) Tiền gửi tiết kiệm, (2) Quỹ mở / micro-investing, (3) Thẻ tín dụng. *Bảo hiểm = stretch goal.*

---

## Mục Lục

1. [Bối cảnh & Định vị bài toán](#1-bối-cảnh--định-vị-bài-toán)
2. [Khảo sát công trình liên quan](#2-khảo-sát-công-trình-liên-quan)
3. [Chiến lược dữ liệu — Catalog sản phẩm là cốt lõi](#3-chiến-lược-dữ-liệu)
4. [Kiến trúc hệ thống (Hybrid Retrieval + Multi-agent)](#4-kiến-trúc-hệ-thống)
5. [Logic gợi ý & giải thích (Matching & Explainability)](#5-logic-gợi-ý--giải-thích)
6. [Guardrails, Tuân thủ & Bảo mật](#6-guardrails-tuân-thủ--bảo-mật)
7. [Phương pháp đánh giá](#7-phương-pháp-đánh-giá)
8. [Kế hoạch triển khai & Bàn giao](#8-kế-hoạch-triển-khai--bàn-giao)
9. [Quản lý rủi ro](#9-quản-lý-rủi-ro)

---

## 1. Bối cảnh & Định vị bài toán

**Bối cảnh xã hội.** Người trẻ VN (Gen Z, Millennials) bắt đầu có thu nhập, muốn tiết kiệm/đầu tư nhưng **rối trước hàng trăm sản phẩm tài chính**: chọn gửi tiết kiệm ngân hàng nào, quỹ mở nào, thẻ tín dụng đầu tiên ra sao. Họ thiếu thời gian so sánh, dễ bị quảng cáo dẫn dắt, dễ chọn sai sản phẩm so với nhu cầu/khẩu vị rủi ro.

**Bài toán cốt lõi (KHÔNG phải hỏi–đáp kiến thức).** Đây là bài toán **so khớp hồ sơ ↔ sản phẩm có giải thích**:
> Input: hồ sơ người dùng (tuổi, thu nhập, mục tiêu, khẩu vị rủi ro, nhu cầu).
> Output: danh sách sản phẩm phù hợp, xếp hạng, **kèm lý do** và so sánh — có disclaimer.

**Vì sao RAG + Multi-agent?**
- **RAG** đảm bảo thông tin sản phẩm (lãi suất, phí, điều kiện) lấy từ **nguồn thực, có trích dẫn** → chống hallucination số liệu (rủi ro chí mạng khi nói về tiền).
- **Multi-agent** chia tác vụ: thu thập hồ sơ → truy vấn sản phẩm → so khớp/xếp hạng → kiểm tra tuân thủ. Mỗi bước là một agent chuyên biệt → chính xác & an toàn hơn single-agent.

---

## 2. Khảo sát công trình liên quan

- **Comparison sites VN** (TheBank, GoBear cũ): so sánh sản phẩm nhưng **không cá nhân hóa, không AI hội thoại**.
- **Robo-advisor / micro-investing app** (Finhay, Infina, Tikop): gợi ý danh mục nhưng **đóng (chỉ sản phẩm của họ)**, không minh bạch tiêu chí.
- **RAG & Recommendation:** RAG-based recommendation, LLM-as-recommender, conversational recommender systems.
- **Khoảng trống (gap):** **conversational + cá nhân hóa + đa nhà cung cấp + minh bạch lý do (explainable)** cho sản phẩm tài chính **tiếng Việt** cho người trẻ — chưa có.

---

## 3. Chiến lược dữ liệu

> **Khác biệt cốt lõi so với chatbot kiến thức:** tài sản dữ liệu chính là **CATALOG SẢN PHẨM CÓ CẤU TRÚC**, không phải văn bản giáo trình.

### 3.1 Ba lớp dữ liệu

| Lớp | Nội dung | Tính chất | Cách lưu/xử lý |
|---|---|---|---|
| **Catalog sản phẩm (lõi)** | Thuộc tính: tên, nhà cung cấp, lãi suất, kỳ hạn, phí, vốn tối thiểu, điều kiện, mức rủi ro | **Structured** (bảng) | **DB có cấu trúc** → filter & rank chính xác |
| **Điều khoản & mô tả (T&C)** | Mô tả chi tiết, điều kiện, quyền lợi, rủi ro | **Unstructured** (văn bản) | **Vector DB / RAG** → trích dẫn |
| **Kiến thức nền (phụ trợ)** | Khái niệm: lãi kép, NAV, hạn mức tín dụng | Ổn định | RAG (vai trò hỗ trợ giải thích) |

### 3.2 Dữ liệu động → API/Tool (không nhét vào vector)
Lãi suất tiết kiệm, NAV quỹ biến động → cập nhật qua **API/crawl định kỳ vào DB sản phẩm**, gắn `ngày_cập_nhật`. Không lưu số liệu biến động trong vector embedding.

### 3.3 Nguồn dữ liệu (ưu tiên hợp pháp, công khai)
- **Tiết kiệm:** biểu lãi suất công khai trên web ngân hàng (VCB, Techcombank, ACB, MB...).
- **Quỹ mở:** thông tin quỹ công khai (Dragon Capital, VinaCapital, SSIAM, VCBF) — loại quỹ, NAV, phí, mức rủi ro.
- **Thẻ tín dụng:** biểu phí/điều kiện công khai từ ngân hàng.
- **Micro-investing:** thông tin sản phẩm công khai (Finhay, Infina, Tikop).

> ⚠️ **Copyright/ToS:** chỉ dùng thông tin công khai, ghi rõ nguồn + ngày cập nhật. Đây là dữ liệu mang tính sự thật/công khai, an toàn hơn nội dung có bản quyền.

### 3.4 Pipeline xử lý
1. **Chuẩn hóa catalog:** thu thập → ánh xạ về **schema thống nhất** (mọi sản phẩm chung bộ thuộc tính) → đây là bước quan trọng nhất.
2. **Clean & chunk T&C:** làm sạch, chia theo điều khoản.
3. **Embedding (tiếng Việt):** `bge-m3` / `multilingual-e5` cho phần T&C.
4. **Metadata:** `loại_sản_phẩm`, `nhà_cung_cấp`, `mức_rủi_ro`, `ngày_cập_nhật` → phục vụ Hybrid Search + filter.

---

## 4. Kiến trúc hệ thống

### 4.1 Hybrid Retrieval (điểm kỹ thuật trọng tâm)
Khác RAG thuần — kết hợp **2 cơ chế truy xuất**:
- **Structured filtering:** lọc cứng theo thuộc tính ("thẻ miễn phí thường niên, thu nhập < 10tr", "quỹ rủi ro thấp, vốn tối thiểu thấp") → query trên DB sản phẩm.
- **Semantic retrieval (RAG):** truy xuất điều khoản/mô tả phù hợp ngữ cảnh câu hỏi.
- Kết hợp + **re-ranking** + trích dẫn nguồn.

### 4.2 Multi-agent (MVP-first)

```
Người dùng
   │
   ▼
[Profiler] ──► hồ sơ (tuổi, thu nhập, mục tiêu, khẩu vị rủi ro, nhu cầu)
   │
   ▼
[Researcher] ──► Hybrid Retrieval: filter DB sản phẩm + RAG (T&C)
   │
   ▼
[Recommender] ──► so khớp profile↔sản phẩm, xếp hạng, GIẢI THÍCH lý do, so sánh
   │
   ▼
[Compliance/Critic] ──► kiểm tra phù hợp (suitability), chống thiên vị, chèn disclaimer, cảnh báo rủi ro
   │
   ▼
Câu trả lời (danh sách sản phẩm + lý do + disclaimer)
```

| Agent | Vai trò | Ưu tiên |
|---|---|---|
| **Profiler** | Khai thác hồ sơ & nhu cầu cụ thể (tiết kiệm/đầu tư/thẻ) | Core |
| **Researcher** | Hybrid Retrieval: filter catalog + RAG điều khoản | Core |
| **Recommender** | So khớp, xếp hạng, **giải thích lý do**, bảng so sánh | Core (lõi của đề tài) |
| **Compliance/Critic** | Suitability check, chống thiên vị, disclaimer, cảnh báo rủi ro | Stretch (ưu tiên cao trong stretch) |

> **MVP-first:** giai đoạn đầu = **Profiler + Researcher + Recommender** chạy end-to-end trên 1 nhóm sản phẩm (tiết kiệm). Mở rộng nhóm sản phẩm + Compliance sau.

### 4.3 Technology Stack
- **LLM Core:** GPT-4o / Claude (cho Recommender & Compliance cần lý luận); model rẻ (4o-mini/Haiku) cho Profiler → tối ưu chi phí.
- **Multi-agent:** **LangGraph** (state + luồng có điều kiện).
- **RAG:** LlamaIndex / LangChain.
- **Structured DB:** SQLite/PostgreSQL cho catalog sản phẩm.
- **Vector DB:** ChromaDB (local) → Qdrant (cloud).
- **Embedding:** bge-m3 / multilingual-e5.
- **UI:** Streamlit.

---

## 5. Logic gợi ý & giải thích

> Đây là phần **lõi học thuật** — phải làm rõ để phân biệt với chatbot thường.

### 5.1 Cơ chế so khớp (Matching)
- **Lọc cứng (hard constraints):** loại sản phẩm không đủ điều kiện (vốn tối thiểu, thu nhập, độ tuổi).
- **Chấm điểm phù hợp (soft scoring):** điểm theo độ khớp khẩu vị rủi ro, mục tiêu, kỳ hạn. Có thể kết hợp **rule-based + LLM reasoning**.
- **Xếp hạng (ranking):** sản phẩm điểm cao nhất + đa dạng nhà cung cấp.

### 5.2 Giải thích (Explainability) — điểm cộng lớn
Mỗi gợi ý kèm **lý do minh bạch**: "Gợi ý quỹ X vì khẩu vị rủi ro thấp + vốn tối thiểu phù hợp thu nhập của bạn + kỳ hạn linh hoạt." → tăng độ tin cậy, chống "black box".

### 5.3 So sánh (Comparison)
Bảng so sánh 2–3 sản phẩm cùng nhóm theo thuộc tính → người dùng tự quyết.

---

## 6. Guardrails, Tuân thủ & Bảo mật

- **Disclaimer bắt buộc:** "Thông tin tham khảo, không phải khuyến nghị đầu tư/môi giới."
- **Chống thiên vị (anti-bias):** không ưu tiên một nhà cung cấp; minh bạch tiêu chí xếp hạng.
- **Suitability check:** Compliance Agent đảm bảo sản phẩm rủi ro cao không gợi ý cho hồ sơ khẩu vị thấp.
- **Từ chối có kiểm soát:** không khuyến nghị mã chứng khoán cụ thể, không cam kết lợi nhuận, từ chối "x2 tài khoản"/cờ bạc.
- **Bảo mật PII:** thu nhập/tài chính người dùng = nhạy cảm → không lưu, không log, ẩn danh hóa.
- **Trích dẫn nguồn + ngày cập nhật** cho mọi con số (lãi suất, phí).

---

## 7. Phương pháp đánh giá

> Chạy **song song từ tuần 3**. Tiêu chí đặc thù bài toán **gợi ý sản phẩm**, không chỉ RAG.

### 7.1 Golden Test Set
~50–100 kịch bản: (hồ sơ người dùng) → (sản phẩm phù hợp kỳ vọng, có chuyên gia/giảng viên xác nhận).

### 7.2 Chất lượng gợi ý (lõi)
- **Suitability / Precision@k:** sản phẩm gợi ý có phù hợp hồ sơ không (so với ground truth).
- **Diversity / Coverage:** không lặp đi lặp lại một sản phẩm/nhà cung cấp.
- **Bias check:** phân bố gợi ý có thiên vị nhà cung cấp không.

### 7.3 Chất lượng thông tin (RAG)
- **Faithfulness:** số liệu (lãi suất, phí) đúng nguồn, không bịa.
- **Context Precision/Recall**, **Answer Relevancy** (RAGAS).

### 7.4 Baseline Comparison (quan trọng cho báo cáo)
So sánh số liệu: (1) LLM thuần — (2) LLM + RAG — (3) RAG + Multi-agent + Hybrid Retrieval.

### 7.5 System Metrics
Latency end-to-end, chi phí token/truy vấn.

---

## 8. Kế hoạch triển khai & Bàn giao

### Lộ trình 10 tuần (MVP-first, eval song song)

| Tuần | Trọng tâm | Đầu ra |
|---|---|---|
| **1–2** | Chốt đề cương, Related Work, định vị pháp lý, **thiết kế schema catalog** + thu thập sản phẩm nhóm 1 (tiết kiệm), **xây golden test set** | Đề cương, catalog v1, sơ đồ kiến trúc, bộ test |
| **3–4** | Hybrid Retrieval: DB sản phẩm + RAG T&C; **bắt đầu đo faithfulness/precision** | Truy xuất chạy độc lập, báo cáo metric lần 1 |
| **5–6** | **MVP: Profiler+Researcher+Recommender** end-to-end trên nhóm tiết kiệm | Demo MVP có giải thích lý do |
| **7–8** | Mở rộng 2 nhóm sản phẩm (quỹ mở, thẻ); thêm logic ranking/explainability; Compliance Agent | Hệ thống multi-agent đa nhóm |
| **9** | UI Streamlit + tích hợp + **baseline comparison 3 cấu hình** | Demo hoàn thiện + bảng so sánh |
| **10** | Hoàn thiện eval (suitability, bias), báo cáo, slide, video | Báo cáo, slide, video, source code |

### Sản phẩm bàn giao
1. **Source Code** — GitHub, `requirements.txt`, `README.md`.
2. **Dataset** — catalog sản phẩm (schema + sample) + corpus T&C + golden test set.
3. **Báo cáo** — phương pháp luận, **Hybrid Retrieval**, lý do multi-agent vs single (kèm số liệu), logic matching & explainability, kết quả eval (suitability/bias/faithfulness/latency).
4. **Video Demo** — 3–5 phút: người trẻ khai hồ sơ → nhận danh sách sản phẩm phù hợp kèm lý do.

---

## 9. Quản lý rủi ro

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| Pháp lý (bị xem là môi giới/khuyến nghị) | Cao | Định vị "so sánh tham khảo", disclaimer, không khuyến nghị mã CK, không hoa hồng |
| Catalog sản phẩm phình to, khó chuẩn hóa | Cao | Schema thống nhất, scope 3 nhóm, MVP từ 1 nhóm |
| Số liệu lãi suất/phí stale | Trung bình | Cập nhật vào DB qua API/crawl định kỳ + gắn ngày |
| Over-scope multi-agent | Cao | MVP-first; Compliance là stretch |
| Thiên vị nhà cung cấp trong gợi ý | Trung bình | Bias check trong eval, minh bạch tiêu chí |
| Eval làm muộn | Cao | Chạy song song từ tuần 3 |
| Chi phí API | Trung bình | Model rẻ cho agent đơn giản |

---


