import Nav from '@/components/nav'
import Disclaimer from '@/components/disclaimer'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1">{children}</main>
      <Disclaimer />
    </div>
  )
}
