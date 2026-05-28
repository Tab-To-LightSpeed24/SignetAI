import PublicNavbar from '@/components/public/PublicNavbar'
import PublicFooter from '@/components/public/PublicFooter'
import HomePageClient from '@/components/public/HomePageClient'

export default function RootPage() {
  return (
    <>
      <PublicNavbar />
      <main style={{ minHeight: '100vh', paddingTop: 64 }}>
        <HomePageClient />
      </main>
      <PublicFooter />
    </>
  )
}