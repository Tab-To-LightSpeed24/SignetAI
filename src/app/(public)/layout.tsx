import PublicNavbar from '@/components/public/PublicNavbar'
import PublicFooter from '@/components/public/PublicFooter'

export const metadata = {
  title: 'Signet AI — AI Contract Risk Analyzer for Indian SMEs',
  description:
    'Upload any vendor, buyer, or service contract and get a plain-English risk report in 60 seconds. Built for Tamil Nadu exporters, manufacturers, and growing businesses.',
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicNavbar />
      {/* paddingTop:0 — navbar is transparent/overlay so pages start from the very top */}
      <main
        className="page-transition"
        style={{ minHeight: '100vh', background: '#0D1B2A' }}
      >
        {children}
      </main>
      <PublicFooter />
    </>
  )
}