export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Về đề tài</h1>

      <p className="mt-4 text-slate-700">
        Đề tài <strong>AI Tư vấn Sản phẩm Tài chính cho Người trẻ</strong> xây dựng một{' '}
        <strong>trợ lý so sánh & gợi ý sản phẩm tài chính</strong> dựa trên kiến trúc{' '}
        <strong>RAG + Multi-agent</strong>. Khác với chatbot kiến thức, trọng tâm là{' '}
        <em>so khớp hồ sơ ↔ sản phẩm có giải thích</em>.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Tại sao RAG + Multi-agent?</h2>
      <ul className="mt-2 list-disc space-y-1 pl-6 text-slate-700">
        <li>
          <strong>RAG</strong> đảm bảo thông tin sản phẩm (lãi suất, phí, điều kiện) đến từ nguồn
          thực, có trích dẫn — chống bịa số.
        </li>
        <li>
          <strong>Multi-agent</strong> chia nhỏ tác vụ (profile → retrieval → recommend → compliance)
          giúp kết quả chính xác và an toàn hơn single-agent.
        </li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">Định vị pháp lý</h2>
      <p className="mt-2 text-slate-700">
        Đây là <strong>công cụ so sánh tham khảo</strong>, tương tự mô hình comparison site nhưng
        AI-driven. Không đóng vai môi giới, không nhận hoa hồng, không thiên vị nhà cung cấp.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Phạm vi sản phẩm</h2>
      <ol className="mt-2 list-decimal space-y-1 pl-6 text-slate-700">
        <li>Tiền gửi tiết kiệm</li>
        <li>Quỹ mở / micro-investing</li>
        <li>Thẻ tín dụng</li>
      </ol>

      <h2 className="mt-8 text-xl font-semibold">Kiến trúc</h2>
      <p className="mt-2 text-slate-700">
        Frontend: <strong>Next.js + Tailwind</strong>. Backend: <strong>FastAPI + LangGraph</strong>{' '}
        (catalog SQL + RAG điều khoản). Mặc định backend chạy ở chế độ <em>stub</em> rule-based,
        không cần API key LLM.
      </p>
    </div>
  )
}
