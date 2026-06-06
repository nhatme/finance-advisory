import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Trợ lý Tài chính · UIT-LAB',
  description: 'AI Tư vấn So sánh & Gợi ý Sản phẩm Tài chính cho Người trẻ — RAG + Multi-agent',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}
