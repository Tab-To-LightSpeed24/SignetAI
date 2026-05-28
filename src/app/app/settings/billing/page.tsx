'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Check, Shield, Zap } from 'lucide-react'

export default function BillingPage() {
  const [loading, setLoading] = useState(true)
  const [usage, setUsage] = useState({ used: 0, limit: 3, plan: 'free' })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function loadUsage() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const res = await fetch('/api/billing/usage-check', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        if (res.ok) {
          const d = await res.json()
          setUsage({ used: d.used ?? 0, limit: d.limit ?? 3, plan: d.plan ?? 'free' })
        }
      } catch (err) {
        console.error('Failed to load usage', err)
      } finally {
        setLoading(false)
      }
    }
    loadUsage()
  }, [supabase])

  const handleUpgrade = async (planType: string) => {
    // In a real application, this would call your backend to create a Razorpay order,
    // then open the Razorpay checkout modal. For the production MVP, we simulate
    // or trigger an API route. Here we just show an alert simulating the checkout.
    alert(`Initiating Razorpay checkout for ${planType} plan. Webhook will process success.`)
  }

  if (loading) {
    return <div style={{ padding: 32, color: 'rgba(255,255,255,0.6)' }}>Loading billing details...</div>
  }

  const usagePercent = usage.limit > 0 ? Math.min((usage.used / usage.limit) * 100, 100) : 0
  const isDanger = usagePercent >= 80

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: 900, padding: 32, color: '#E2E8F0', margin: '0 auto' }}>
      <h1 className="font-display" style={{ fontSize: 28, margin: '0 0 32px 0', fontWeight: 500, color: '#fff', fontFamily: 'var(--font-display), serif' }}>
        Billing & Plan
      </h1>

      <div className="glass" style={{ 
        borderRadius: 16, 
        padding: 32,
        marginBottom: 40
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Current Plan</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: '#fff', textTransform: 'capitalize' }}>
              {usage.plan} Plan
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Billing Cycle</div>
            <div style={{ fontSize: 15, color: '#fff' }}>Resets on 1st of next month</div>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8, color: 'rgba(255,255,255,0.8)' }}>
            <span>Contracts analyzed this cycle</span>
            <span style={{ fontWeight: 600 }}>{usage.used} / {usage.limit === -1 ? 'Unlimited' : usage.limit}</span>
          </div>
          {usage.limit !== -1 && (
            <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 100, overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                width: `${usagePercent}%`, 
                background: isDanger ? '#E24B4A' : '#1D9E75',
                borderRadius: 100,
                transition: 'width 0.5s ease'
              }} />
            </div>
          )}
        </div>
      </div>

      <h2 style={{ fontSize: 18, margin: '0 0 16px 0', color: '#fff' }}>Upgrade your plan</h2>
      
      <div style={{ display: 'flex', gap: 20, alignItems: 'stretch' }}>
        {/* Starter Plan */}
        <div className="glass" style={{ 
          flex: 1,
          borderRadius: 16, 
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.2)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Shield size={20} color="#BA7517" />
              <span style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>Starter</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 20 }}>
              ₹1,999 <span style={{ fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.5)' }}>/ month</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                <Check size={16} color="#1D9E75" /> 15 contract analyses/month
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                <Check size={16} color="#1D9E75" /> PDF export
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                <Check size={16} color="#1D9E75" /> Counter-clause generator
              </div>
            </div>
          </div>
          <button 
            onClick={() => handleUpgrade('starter')}
            className="btn-secondary"
            style={{ width: '100%', padding: '12px 0', fontSize: 14, fontWeight: 600 }}
          >
            Upgrade to Starter
          </button>
        </div>

        {/* Growth Plan */}
        <div className="glass" style={{ 
          flex: 1,
          background: 'rgba(29,158,117,0.05)', 
          border: '1px solid rgba(29,158,117,0.3)', 
          borderRadius: 16, 
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(29,158,117,0.15)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <div>
            <div style={{ position: 'absolute', top: -12, right: 24, background: '#1D9E75', color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Recommended
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Zap size={20} color="#1D9E75" />
              <span style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>Growth</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 20 }}>
              ₹4,999 <span style={{ fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.5)' }}>/ month</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                <Check size={16} color="#1D9E75" /> 50 contract analyses/month
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                <Check size={16} color="#1D9E75" /> Personal playbook integration
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                <Check size={16} color="#1D9E75" /> Contract repository
              </div>
            </div>
          </div>
          <button 
            onClick={() => handleUpgrade('growth')}
            className="btn-cta"
            style={{ width: '100%', padding: '12px 0', fontSize: 14, fontWeight: 600 }}
          >
            Upgrade to Growth
          </button>
        </div>
      </div>

    </div>
  )
}
