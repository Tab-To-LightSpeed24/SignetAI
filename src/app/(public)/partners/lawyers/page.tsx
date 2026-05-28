'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

export default function LawyersPage() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '', firmName: '', barNumber: '', city: '',
    practice: [] as string[], industries: [] as string[],
    phone: '', email: '', bio: '', agreed: false,
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('/api/partner-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (data.error) {
        setError(data.message || 'Something went wrong. Please check your submission.')
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
      <div style={{ background: '#0D1B2A', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '52px 44px', maxWidth: 480, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(29,158,117,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#1D9E75', border: '1px solid rgba(29,158,117,0.2)' }}>
            <Check size={32} />
          </div>
          <h2 style={{ fontSize: 24, color: '#FFFFFF', margin: '0 0 12px 0' }}>Application received!</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, margin: 0 }}>Thank you for applying to the Signet AI partner network. We'll review your application and respond within 3 business days.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Hero */}
      <section style={{ background: '#0D1B2A', padding: '120px 24px 80px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1D9E75', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'block' }}>LAWYER PARTNERSHIPS</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: '#FFFFFF', fontWeight: 400, lineHeight: 1.15, margin: '0 0 20px 0' }}>
            Receive better-prepared SME clients.<br />Free to join.
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.65)', maxWidth: 660, margin: '0 auto', lineHeight: 1.7 }}>
            Signet AI refers SME clients to verified Tamil Nadu lawyers when contracts require expert review. You pay only when a connection leads to a consultation.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: '#09111E', padding: '96px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1D9E75', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'block', textAlign: 'center' }}>HOW IT WORKS</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: '#FFFFFF', fontWeight: 400, textAlign: 'center', margin: '0 0 52px 0' }}>How the partnership works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28 }} className="grid-cols-1 md:grid-cols-3">
            {[
              { step: '1', title: 'Apply and get verified', desc: 'Submit your credentials. We verify your Bar Council enrollment and practice areas.' },
              { step: '2', title: 'Signet AI flags high-risk clauses', desc: "When a user's contract needs expert review, we show \"Get expert review\" with your profile." },
              { step: '3', title: 'Receive pre-briefed clients', desc: 'Users connect with you. You receive a prepared client who understands their legal issue and the Signet AI report.' },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '36px 24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(29,158,117,0.15)', border: '1px solid rgba(29,158,117,0.3)', color: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, margin: '0 auto 20px' }}>{item.step}</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#FFFFFF', margin: '0 0 10px 0' }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section style={{ background: '#0D1B2A', padding: '96px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 660, margin: '0 auto', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '40px 36px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: '#FFFFFF', fontWeight: 400, margin: '0 0 32px 0' }}>Apply to join the network</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[
              { label: 'Full name *', key: 'fullName', type: 'text' },
              { label: 'Law firm name *', key: 'firmName', type: 'text' },
              { label: 'Bar Council enrollment number *', key: 'barNumber', type: 'text' },
              { label: 'City / District *', key: 'city', type: 'text' },
              { label: 'Phone number *', key: 'phone', type: 'tel' },
              { label: 'Email address *', key: 'email', type: 'email' },
            ].map(field => (
              <div key={field.key}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.5)', marginBottom: 6, letterSpacing: '0.04em' }}>{field.label}</label>
                <input type={field.type} required value={(formData as any)[field.key]} onChange={e => setFormData({ ...formData, [field.key]: e.target.value })} style={inputStyle}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(29,158,117,0.5)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            ))}

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.5)', marginBottom: 10, letterSpacing: '0.04em' }}>Areas of practice</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {['Commercial', 'Contracts', 'Export/Import', 'Intellectual Property', 'Employment', 'Real Estate', 'Other'].map(p => (
                  <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.practice.includes(p)} onChange={() => setFormData({ ...formData, practice: formData.practice.includes(p) ? formData.practice.filter(x => x !== p) : [...formData.practice, p] })} /> {p}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.5)', marginBottom: 10, letterSpacing: '0.04em' }}>Industries served</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {['Auto components', 'Garments/Textiles', 'IT/Software', 'Pharma', 'Manufacturing', 'Other'].map(p => (
                  <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.industries.includes(p)} onChange={() => setFormData({ ...formData, industries: formData.industries.includes(p) ? formData.industries.filter(x => x !== p) : [...formData.industries, p] })} /> {p}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.5)', marginBottom: 6, letterSpacing: '0.04em' }}>Brief bio (200 chars max)</label>
              <textarea maxLength={200} value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(29,158,117,0.5)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
              <input type="checkbox" required checked={formData.agreed} onChange={() => setFormData({ ...formData, agreed: !formData.agreed })} style={{ marginTop: 2 }} />
              I confirm I am a licensed advocate registered with the Bar Council of Tamil Nadu
            </label>

            {error && (
              <div style={{ color: '#E24B4A', fontSize: 13, background: 'rgba(226,75,74,0.08)', padding: '10px 14px', borderRadius: 6, border: '1px solid rgba(226,75,74,0.15)' }}>
                {error}
              </div>
            )}

            <button type="submit" style={{
              width: '100%', padding: '14px', background: '#1D9E75', color: '#FFFFFF', border: 'none',
              borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              transition: 'all 300ms cubic-bezier(0.16,1,0.3,1)',
              boxShadow: '0 4px 14px rgba(29,158,117,0.25)',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#0F6E56'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(29,158,117,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1D9E75'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(29,158,117,0.25)' }}
            >
              Submit application →
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}