'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AppIndexPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/app/dashboard')
  }, [router])

  return (
    <div style={{ display: 'flex', minHeight: '50vh', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 24,
          height: 24,
          border: '3px solid rgba(13,27,42,0.1)',
          borderTopColor: '#1D9E75',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <span style={{ fontSize: 14, color: '#4A5568' }}>Loading your dashboard...</span>
      </div>
    </div>
  )
}