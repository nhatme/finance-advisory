'use client'

import SlideDeck, { type Slide, type DeckTheme } from '@/components/slide-deck'

const SLIDES: Slide[] = [
  {
    type: 'cover',
    title: 'AI Tư vấn Sản phẩm Tài chính',
    subtitle: 'Hệ thống So khớp & Gợi ý có Giải thích cho Người trẻ Việt Nam',
    tag: 'RAG + Multi-agent · UIT-LAB 2026',
  },

  // ── PHẦN 1: BỐI CẢNH & BÀI TOÁN ──────────────────────────────
  {
    type: 'bullets',
    title: '1. Bối cảnh xã hội',
    content: [
      'Người trẻ VN (Gen Z, Millennials) bắt đầu **có thu nhập**, muốn tiết kiệm/đầu tư',
      '**Rối** trước hàng trăm sản phẩm: gửi ngân hàng nào, quỹ nào, thẻ tín dụng đầu tiên ra sao',
      'Thiếu thời gian so sánh, dễ bị **quảng cáo dẫn dắt**',
      'Dễ chọn sai sản phẩm so với nhu cầu & khẩu vị rủi ro',
    ],
    highlight: 'Nhu cầu thực: một trợ lý khách quan, cá nhân hóa, giải thích được.',
  },
  {
    type: 'bullets',
    title: '2. Bài toán cốt lõi',
    subtitle: 'Đây KHÔNG phải hỏi–đáp kiến thức — mà là so khớp hồ sơ ↔ sản phẩm.',
    content: [
      '**Input:** hồ sơ người dùng — tuổi, thu nhập, mục tiêu, khẩu vị rủi ro, kỳ hạn',
      '**Output:** danh sách sản phẩm phù hợp, **xếp hạng**, **kèm lý do** + so sánh + disclaimer',
    ],
    highlight: 'Bài toán Product Matching / Recommendation có giải thích (explainable).',
  },
  {
    type: 'two-col',
    title: '3. Vì sao RAG + Multi-agent?',
    cols: [
      { title: 'RAG — chống bịa số liệu', body: 'Lãi suất, phí, điều kiện lấy từ nguồn thực, có trích dẫn. Chống hallucination — rủi ro chí mạng khi nói về tiền.' },
      { title: 'Multi-agent — chia tác vụ', body: 'Thu thập hồ sơ → truy vấn → so khớp/xếp hạng → kiểm tra tuân thủ. Mỗi bước một agent chuyên biệt → chính xác & an toàn hơn single-agent.' },
    ],
  },
  {
    type: 'bullets',
    title: '4. Định vị pháp lý',
    quote: '"Trợ lý So sánh & Gợi ý Sản phẩm Tài chính (tham khảo)"',
    content: [
      'Mô hình **comparison site** (như TheBank) nhưng AI-driven, cá nhân hóa',
      'Chỉ dùng **thông tin sản phẩm công khai** — không môi giới, không hoa hồng',
      'Không thiên vị nhà cung cấp · luôn kèm disclaimer + trích dẫn nguồn',
      'Tránh khuyến nghị **mã chứng khoán cụ thể** (vùng pháp lý nhạy cảm)',
    ],
  },

  // ── PHẦN 2: KHẢO SÁT & ĐỊNH VỊ ───────────────────────────────
  {
    type: 'bullets',
    title: '5. Khảo sát công trình liên quan',
    content: [
      '**Comparison sites** (TheBank, GoBear): so sánh nhưng không cá nhân hóa, không AI hội thoại',
      '**Robo-advisor / micro-investing** (Finhay, Infina, Tikop): gợi ý nhưng **đóng** — chỉ sản phẩm của họ, không minh bạch tiêu chí',
      '**Nghiên cứu:** RAG-based recommendation, LLM-as-recommender, conversational RecSys',
    ],
    highlight: 'Gap: conversational + cá nhân hóa + đa NCC + giải thích, tiếng Việt — chưa có.',
  },
  {
    type: 'table',
    title: '6. Khoảng trống thị trường',
    table: {
      head: ['', 'Cá nhân hóa', 'Đa NCC', 'Giải thích', 'Hội thoại'],
      rows: [
        ['TheBank',         '❌', '✅', '❌', '❌'],
        ['Finhay / Infina', '✅', '❌', '❌', '❌'],
        ['**Đề tài này**',  '✅', '✅', '✅', '✅'],
      ],
    },
    highlight: 'Định vị: AI hội thoại + đa nhà cung cấp + giải thích được, tiếng Việt.',
  },

  // ── PHẦN 3: DỮ LIỆU ──────────────────────────────────────────
  {
    type: 'cards',
    title: '7. Phạm vi MVP — 3 nhóm sản phẩm',
    subtitle: 'Phù hợp người trẻ · Bảo hiểm = stretch goal',
    cards: [
      { icon: '🏦', label: 'Tiền gửi tiết kiệm' },
      { icon: '📈', label: 'Quỹ mở / micro-investing' },
      { icon: '💳', label: 'Thẻ tín dụng' },
    ],
  },
  {
    type: 'table',
    title: '8. Catalog thực tế — 15 sản phẩm',
    subtitle: '11 nhà cung cấp · dữ liệu công khai có thật',
    table: {
      head: ['Nhóm', 'Số SP', 'Nhà cung cấp tiêu biểu'],
      rows: [
        ['🏦 Tiết kiệm',   '4', 'Vietcombank, Techcombank, ACB, MB'],
        ['📈 Quỹ / tích lũy', '7', 'Dragon Capital, VinaCapital, SSIAM, Finhay…'],
        ['💳 Thẻ tín dụng', '4', 'VCB, Techcombank, ACB, MB'],
      ],
    },
    highlight: 'Phân bố rủi ro: 8 thấp · 6 trung bình · 1 cao.',
  },
  {
    type: 'table',
    title: '9. Ba lớp dữ liệu',
    subtitle: 'Khác chatbot kiến thức: tài sản chính là CATALOG CÓ CẤU TRÚC',
    table: {
      head: ['Lớp', 'Tính chất', 'Lưu ở đâu'],
      rows: [
        ['**Catalog sản phẩm** (lõi)', 'Structured', 'SQL DB → filter & rank'],
        ['**Điều khoản & T&C**',       'Unstructured', 'Vector DB / RAG → trích dẫn'],
        ['**Kiến thức nền**',          'Ổn định', 'RAG phụ trợ giải thích'],
      ],
    },
    highlight: 'Dữ liệu động (lãi suất, NAV) → cập nhật vào DB qua API/crawl, không nhét vào vector.',
  },
  {
    type: 'bullets',
    title: '10. Nguồn dữ liệu — công khai, hợp pháp',
    content: [
      '**Tiết kiệm:** biểu lãi suất công khai trên web ngân hàng (VCB, TCB, ACB, MB…)',
      '**Quỹ mở:** thông tin quỹ công khai (Dragon Capital, VinaCapital, SSIAM, VCBF)',
      '**Thẻ tín dụng:** biểu phí & điều kiện công khai từ ngân hàng',
      '**Micro-investing:** thông tin sản phẩm công khai (Finhay, Infina, Tikop)',
    ],
    highlight: 'Mỗi con số gắn nguồn + ngày cập nhật — an toàn bản quyền/ToS.',
  },

  // ── PHẦN 4: KIẾN TRÚC ────────────────────────────────────────
  {
    type: 'two-col',
    title: '11. Tìm đúng sản phẩm bằng 2 cách',
    subtitle: 'Kết hợp lọc chính xác với tìm kiếm theo ý nghĩa',
    cols: [
      { title: 'Lọc theo tiêu chí cứng', body: 'Sàng nhanh theo lãi suất, kỳ hạn, phí, vốn tối thiểu, thu nhập, độ tuổi — chỉ giữ sản phẩm bạn đủ điều kiện.' },
      { title: 'Tìm theo ý nghĩa', body: 'Đọc hiểu điều khoản & mô tả để khớp đúng nhu cầu, kèm trích dẫn nguồn cho từng con số.' },
    ],
    highlight: 'Vừa chính xác, vừa hiểu ngữ cảnh — và luôn dẫn nguồn để bạn kiểm chứng.',
  },
  {
    type: 'pipeline',
    title: '12. Bốn "chuyên gia ảo" phối hợp',
    subtitle: 'Mỗi bước do một chuyên gia đảm nhận, nối tiếp nhau',
    steps: [
      { name: 'Hiểu hồ sơ', desc: 'Nắm tuổi, thu nhập, mục tiêu, khẩu vị rủi ro của bạn' },
      { name: 'Tra cứu',    desc: 'Tìm sản phẩm phù hợp + đọc điều khoản liên quan' },
      { name: 'Gợi ý',      desc: 'So khớp, xếp hạng và GIẢI THÍCH vì sao phù hợp' },
      { name: 'Kiểm tra',   desc: 'Đảm bảo an toàn, khách quan, kèm cảnh báo & disclaimer' },
    ],
    highlight: 'Chia nhỏ trách nhiệm → chính xác và an toàn hơn một mô hình đơn lẻ.',
  },

  // ── PHẦN 5: LOGIC GỢI Ý ──────────────────────────────────────
  {
    type: 'two-col',
    title: '13. Cách chọn & xếp hạng sản phẩm',
    cols: [
      { title: 'Loại bỏ thứ không phù hợp', body: 'Bỏ qua sản phẩm bạn không đủ điều kiện: vốn tối thiểu, thu nhập, độ tuổi.' },
      { title: 'Chấm điểm độ phù hợp', body: 'Cho điểm theo mức khớp khẩu vị rủi ro, mục tiêu, kỳ hạn và thu nhập của bạn.' },
    ],
    content: [
      'Ưu tiên sản phẩm điểm cao nhất, đồng thời đảm bảo đa dạng nhà cung cấp',
    ],
  },
  {
    type: 'bullets',
    title: '14. Explainability — điểm cộng học thuật',
    quote: '"Gợi ý quỹ X vì khẩu vị rủi ro thấp ✓, vốn tối thiểu phù hợp thu nhập ✓, kỳ hạn linh hoạt ✓"',
    content: [
      '→ Mỗi gợi ý kèm **lý do minh bạch** — tăng độ tin cậy, chống "black box"',
      '→ Score breakdown: **5 chiều**, mỗi chiều 0–1, trung bình = điểm tổng',
      '→ **Bảng so sánh** 2–3 sản phẩm cùng nhóm → người dùng tự quyết',
    ],
  },

  // ── PHẦN 6: GUARDRAILS ───────────────────────────────────────
  {
    type: 'bullets',
    title: '15. Guardrails, Tuân thủ & Bảo mật',
    content: [
      '**Disclaimer bắt buộc:** "Tham khảo, không phải khuyến nghị đầu tư/môi giới"',
      '**Anti-bias:** không ưu tiên 1 NCC, minh bạch tiêu chí xếp hạng',
      '**Suitability check:** sản phẩm rủi ro cao ≠ hồ sơ khẩu vị thấp',
      '**Từ chối có kiểm soát:** không khuyến nghị mã CK, không cam kết lợi nhuận',
      '**PII:** thu nhập không log, không lưu, stateless per request',
    ],
  },

  // ── PHẦN 7: ĐẢM BẢO CHẤT LƯỢNG ───────────────────────────────
  {
    type: 'bullets',
    title: '16. Đảm bảo chất lượng & chứng minh giá trị',
    subtitle: 'Không chỉ "chạy được" — mà đo được và so sánh được',
    content: [
      '**Gợi ý có thực sự phù hợp?** Đo suitability, độ đa dạng, chống thiên vị',
      '**Số liệu có đáng tin?** Lãi suất/phí đúng nguồn, không bịa (faithfulness)',
      '**Có bộ kiểm thử chuẩn:** 50–100 kịch bản, chuyên gia xác nhận',
      '**So sánh 3 cấu hình:** LLM thuần → LLM+RAG → đề xuất đầy đủ → chứng minh từng lớp tăng giá trị',
    ],
    highlight: 'Bằng chứng định lượng: kiến trúc đề xuất thực sự tốt hơn cách làm đơn giản.',
  },

  // ── PHẦN 8: MỤC ĐÍCH & GIÁ TRỊ ───────────────────────────────
  {
    type: 'cards',
    title: '17. Phục vụ ai?',
    subtitle: 'Người trẻ Việt bắt đầu hành trình tài chính cá nhân',
    cards: [
      { icon: '🎓', label: 'Sinh viên mới ra trường — bắt đầu tiết kiệm' },
      { icon: '💼', label: 'Nhân viên trẻ — quỹ đầu tiên & thẻ tín dụng' },
      { icon: '🧑‍💻', label: 'Freelancer — quỹ dự phòng linh hoạt' },
      { icon: '🏠', label: 'Mới lập gia đình — kế hoạch dài hạn' },
    ],
  },
  {
    type: 'pipeline',
    title: '18. Hành trình người dùng',
    subtitle: 'Từ bối rối → quyết định tự tin, chỉ trong vài bước',
    steps: [
      { name: 'Khai hồ sơ',     desc: 'Tuổi, thu nhập, mục tiêu, khẩu vị rủi ro, kỳ hạn' },
      { name: 'Hệ thống so khớp', desc: 'Lọc cứng + chấm điểm 5 chiều + RAG điều khoản' },
      { name: 'Nhận gợi ý',     desc: 'Top sản phẩm xếp hạng + lý do minh bạch' },
      { name: 'So sánh & chọn',  desc: 'Bảng so sánh trực quan → tự tin quyết định' },
    ],
    highlight: 'Mục tiêu: thay thế hàng giờ tự tra cứu bằng vài phút có hướng dẫn.',
  },
  {
    type: 'bullets',
    title: '19. Giá trị mang lại',
    content: [
      '**Tiết kiệm thời gian:** không phải lướt hàng chục trang web so sánh',
      '**Quyết định tự tin:** mỗi gợi ý có lý do rõ ràng, không "black box"',
      '**Khách quan:** đa nhà cung cấp, không bị quảng cáo một bên dẫn dắt',
      '**Nâng cao hiểu biết tài chính:** giải thích khái niệm ngay khi cần',
      '**An toàn:** chỉ tham khảo, có disclaimer, bảo vệ dữ liệu cá nhân',
    ],
  },
  {
    type: 'bullets',
    title: '20. Đóng góp & điểm khác biệt',
    subtitle: 'Vì sao đề tài có giá trị học thuật, không chỉ là một chatbot',
    content: [
      '**Hybrid Retrieval** cho domain tài chính tiếng Việt — SQL + RAG',
      '**Explainable recommendation** — score breakdown 5 chiều, chống black-box',
      '**Multi-agent vs single-agent** — chứng minh bằng baseline có số liệu',
      '**Bộ dữ liệu mở:** catalog + corpus T&C + golden test set tiếng Việt',
      'Lấp **khoảng trống thị trường:** comparison site AI-driven cho người trẻ VN',
    ],
  },
  {
    type: 'bullets',
    title: '21. Tầm nhìn & hướng phát triển',
    content: [
      'Mở rộng nhóm sản phẩm: **bảo hiểm, vay tiêu dùng**',
      'Cập nhật dữ liệu **real-time** qua API ngân hàng/quỹ',
      'Cá nhân hóa sâu hơn theo **lịch sử & hành vi** người dùng',
      'Tích hợp **trợ lý hội thoại đa lượt** (multi-turn)',
    ],
    highlight: 'Tầm nhìn: nền tảng so sánh tài chính khách quan, minh bạch cho người trẻ Việt Nam.',
  },
  {
    type: 'cover',
    title: 'Cảm ơn!',
    subtitle: 'Q&A',
    tag: 'UIT-LAB · 2026',
  },
]

const THEME: DeckTheme = {
  dark: true,
  pageBg:         '#020617',
  onPage:         '#ffffff',
  onPageMuted:    '#94a3b8',
  controlBg:      'rgba(255,255,255,0.1)',
  controlBorder:  'rgba(255,255,255,0.1)',
  slideBg:  'linear-gradient(135deg, #1e3a8a 0%, #1e40af 60%, #0f172a 100%)',
  coverBg:  'linear-gradient(135deg, #1e3a8a 0%, #1e40af 60%, #0f172a 100%)',
  coverTitle:      '#ffffff',
  coverSubtitle:   '#bfdbfe',
  coverTag:        '#dbeafe',
  coverTagBg:      'rgba(255,255,255,0.1)',
  coverTagBorder:  'rgba(255,255,255,0.2)',
  heading:        '#ffffff',
  subtitle:       '#bfdbfe',
  body:           '#eff6ff',
  strong:         '#ffffff',
  accent:         '#60a5fa',
  accentText:     '#60a5fa',
  surface:        'rgba(255,255,255,0.1)',
  surfaceBorder:  'rgba(255,255,255,0.1)',
  highlightBg:    'rgba(59,130,246,0.2)',
  highlightBorder:'rgba(96,165,250,0.4)',
  highlightText:  '#bfdbfe',
  badgeBg:        '#2563eb',
  badgeText:      '#ffffff',
  pptx: {
    bg:            '0F172A',
    coverBg:       '1E3A8A',
    coverTitle:    'FFFFFF',
    coverSubtitle: 'BFDBFE',
    coverTag:      '93C5FD',
    heading:       'FFFFFF',
    subtitle:      'BFDBFE',
    body:          'BFDBFE',
    strong:        'FFFFFF',
    accent:        '60A5FA',
    accentDeep:    '2563EB',
    surface:       '1E293B',
    highlightBg:   '1D4ED8',
    highlightLine: '60A5FA',
    highlightText: '60A5FA',
    pageNum:       '475569',
  },
}

export default function PurposeSlidesPage() {
  return (
    <SlideDeck
      slides={SLIDES}
      theme={THEME}
      fileName="uit-lab-purpose.pptx"
      backHref="/slides"
      backLabel="← Chọn bộ slide"
    />
  )
}
