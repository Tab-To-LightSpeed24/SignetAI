'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', company: '', role: 'Business owner / SME',
    subject: 'General enquiry', message: '', newsletter: true,
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok || data.success === false || data.error) {
        setError(data.error || data.message || 'Something went wrong. Please try again.')
      } else {
        setSubmitted(true)
      }
    } catch {
      setError('Connection error. Please check your network.')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, fontSize: 14,
    outline: 'none', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.04)',
    color: '#FFFFFF',
    transition: 'border-color 200ms',
  }

  if (submitted) {
    return (
      <section style={{ background: '#0D1B2A', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(29,158,117,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#1D9E75', border: '1px solid rgba(29,158,117,0.25)' }}>
            <Check size={32} />
          </div>
          <h2 style={{ fontSize: 24, color: '#FFFFFF', margin: '0 0 12px 0' }}>Message sent!</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>Thanks {form.name}, we'll respond within 1 business day.</p>
        </div>
      </section>
    )
  }

  return (
    <div>
      {/* Hero */}
      <section style={{ background: '#0D1B2A', padding: '120px 24px 64px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1D9E75', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'block' }}>CONTACT US</span>
          <h1 style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: 44, color: '#FFFFFF', fontWeight: 400, margin: '0 0 16px 0', lineHeight: 1.15 }}>
            Get in touch
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>
            Questions, partnership enquiries, or feedback — we respond within one business day.
          </p>
        </div>
      </section>

      {/* Form + Info */}
      <section style={{ background: '#09111E', padding: '72px 24px 96px' }}>
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-8 md:gap-14" style={{ maxWidth: 960, margin: '0 auto' }}>
          {/* Form */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 36 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: '#FFFFFF', fontWeight: 400, margin: '0 0 28px 0' }}>Send us a message</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Name *', key: 'name', type: 'text' },
                { label: 'Email *', key: 'email', type: 'email' },
                { label: 'Company name', key: 'company', type: 'text', required: false },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.5)', marginBottom: 6, letterSpacing: '0.04em' }}>{f.label}</label>
                  <input type={f.type} required={f.required !== false} value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} style={inputStyle}
                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(29,158,117,0.5)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
              ))}

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.5)', marginBottom: 8, letterSpacing: '0.04em' }}>I am a:</label>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {['Business owner / SME', 'Lawyer / Legal professional', 'Investor', 'Other'].map(r => (
                    <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: 'rgba(255,255,255,0.7)' }}>
                      <input type="radio" name="role" checked={form.role === r} onChange={() => setForm({ ...form, role: r })} /> {r}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.5)', marginBottom: 6, letterSpacing: '0.04em' }}>Subject *</label>
                <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} style={{ ...inputStyle }}>
                  {['General enquiry', 'Product question', 'Partnership (Law firm)', 'Press / Media', 'Other'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.5)', marginBottom: 6, letterSpacing: '0.04em' }}>Message *</label>
                <textarea required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={4} style={{ ...inputStyle, resize: 'vertical', minHeight: 110 }}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(29,158,117,0.5)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.newsletter} onChange={() => setForm({ ...form, newsletter: !form.newsletter })} />
                Subscribe to newsletter
              </label>

              {error && (
                <div style={{ color: '#E24B4A', fontSize: 13, background: 'rgba(226,75,74,0.08)', padding: '10px 14px', borderRadius: 6, border: '1px solid rgba(226,75,74,0.15)' }}>
                  {error}
                </div>
              )}

              <button type="submit" style={{
                padding: '14px', background: '#1D9E75', color: '#FFFFFF', border: 'none',
                borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                transition: 'all 300ms cubic-bezier(0.16,1,0.3,1)',
                boxShadow: '0 4px 14px rgba(29,158,117,0.25)',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#0F6E56'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(29,158,117,0.4)' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#1D9E75'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(29,158,117,0.25)' }}
              >
                Send message →
              </button>
            </form>
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 32 }}>
            {/* SVG Illustration */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <svg width="220" height="190" viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="shieldGrad2" x1="60" y1="20" x2="180" y2="160" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#1D9E75" />
                    <stop offset="100%" stopColor="#0D1B2A" />
                  </linearGradient>
                </defs>
                <circle cx="120" cy="100" r="80" stroke="rgba(29,158,117,0.1)" strokeWidth="2" strokeDasharray="6 6" />
                <circle cx="120" cy="100" r="60" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
                <rect x="110" y="35" width="80" height="110" rx="8" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <line x1="125" y1="55" x2="165" y2="55" stroke="rgba(255,255,255,0.15)" strokeWidth="3" strokeLinecap="round" />
                <line x1="125" y1="70" x2="175" y2="70" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeLinecap="round" />
                <line x1="125" y1="85" x2="160" y2="85" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeLinecap="round" />
                <line x1="125" y1="100" x2="170" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeLinecap="round" />
                <path d="M70 50 C70 50, 100 40, 120 30 C140 40, 170 50, 170 50 C170 100, 155 140, 120 165 C85 140, 70 100, 70 50 Z" fill="url(#shieldGrad2)" stroke="rgba(255,255,255,0.2)" strokeWidth="2" style={{ filter: 'drop-shadow(0px 8px 24px rgba(29,158,117,0.3))' }} />
                <path d="M102 98 L115 111 L138 88" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {[
              { label: 'Email', val: <a href="mailto:signetai.support@gmail.com" style={{ color: '#1D9E75', textDecoration: 'none', fontSize: 15, fontWeight: 500 }}>signetai.support@gmail.com</a>, sub: 'We respond within 1 business day' },
              { label: 'Office', val: <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>Chennai, Tamil Nadu</span>, sub: null },
              { label: 'For lawyer partnerships', val: <Link href="/partners/lawyers" style={{ color: '#1D9E75', fontSize: 14, textDecoration: 'none', fontWeight: 500 }}>Apply here →</Link>, sub: null },
            ].map((item, i) => (
              <div key={i}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#FFFFFF', margin: '0 0 6px 0' }}>{item.label}</h3>
                {item.val}
                {item.sub && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '4px 0 0 0' }}>{item.sub}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}