import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/nav'
import Disclaimer from '@/components/disclaimer'

export const metadata: Metadata = {
  title: 'Trợ lý Tài chính · UIT-LAB',
  description:
    'AI Tư vấn So sánh & Gợi ý Sản phẩm Tài chính cho Người trẻ — RAG + Multi-agent',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Disclaimer />
      </body>
    </html>
  )
}
