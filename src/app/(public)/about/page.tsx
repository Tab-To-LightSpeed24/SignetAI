import { MessageSquare, Scale, Building } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'About — Signet AI',
  description: "Built in Chennai. Built for Tamil Nadu's businesses. Know what you're signing — before it costs you."
}

const PRINCIPLES = [
  { icon: <MessageSquare style={{ color: '#1D9E75' }} size={36} />, title: 'Plain English always', desc: 'Every clause translated from legalese into clear, actionable language. No jargon, no ambiguity.' },
  { icon: <Scale style={{ color: '#1D9E75' }} size={36} />, title: 'Risk intelligence, not legal advice', desc: 'We identify risk. We never replace your lawyer. Our analysis empowers you to have better conversations with your legal advisor.' },
  { icon: <Building style={{ color: '#1D9E75' }} size={36} />, title: 'Built for SMEs, not enterprises', desc: 'Affordable, fast, and designed for Indian small and medium businesses — not Fortune 500 legal departments.' },
]

export default function AboutPage() {
  return (
    <div>
      {/* Mission Hero */}
      <section style={{ background: '#0D1B2A', padding: '120px 24px 96px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'rgba(29,158,117,0.12)', border: '1px solid rgba(29,158,117,0.25)', borderRadius: 100, fontSize: 12, color: '#1D9E75', fontWeight: 600, marginBottom: 28 }}>
            Chennai, Tamil Nadu · Made in India
          </span>
          <h1 style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: 48, color: '#FFFFFF', fontWeight: 400, lineHeight: 1.15, margin: '0 0 24px 0' }}>
            Built in Chennai.<br />Built for Tamil Nadu's businesses.
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.7)', lineHeight: 1.75, margin: '0 0 40px 0' }}>
            Signet AI was born from a simple observation: Tamil Nadu's SME exporters — the backbone of India's manufacturing economy — sign contracts every day that they don't fully understand. Auto-renewal traps, unlimited indemnification, foreign jurisdiction clauses buried in legalese. Most SME owners lack the time or budget for a full legal review on every contract. Signet AI bridges that gap: 60-second AI-powered risk analysis, in plain English, before you sign.
          </p>
          <Link href="/login" className="btn-cta">
            Try it free — first 3 contracts
          </Link>
        </div>
      </section>

      {/* Mission Pillars */}
      <section style={{ background: '#09111E', padding: '96px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1D9E75', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'block', textAlign: 'center' }}>OUR MISSION</span>
          <h2 style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: 36, color: '#FFFFFF', fontWeight: 400, textAlign: 'center', margin: '0 0 48px 0' }}>
            Empowering Indian SMEs with Legal Clarity
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 40 }} className="grid-cols-1 md:grid-cols-2">
            <div>
              <h3 style={{ fontSize: 19, fontWeight: 600, color: '#FFFFFF', margin: '0 0 12px 0' }}>SME Protection</h3>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, margin: 0 }}>
                We believe that every business owner, regardless of size, deserves to understand exactly what they are signing. Our mission is to safeguard Indian small and medium-sized enterprises from unfavorable hidden terms and unexpected legal liabilities.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: 19, fontWeight: 600, color: '#FFFFFF', margin: '0 0 12px 0' }}>Democratizing Risk Intelligence</h3>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, margin: 0 }}>
                By converting dense legalese into clean, plain-language risk reports, we level the playing field. Tamil Nadu's exporters and manufacturers can now negotiate with confidence, protect their operations, and avoid predatory contract loops.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section style={{ background: '#0D1B2A', padding: '96px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1D9E75', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'block', textAlign: 'center' }}>HOW WE OPERATE</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: '#FFFFFF', fontWeight: 400, textAlign: 'center', margin: '0 0 52px 0' }}>Our principles</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28 }} className="grid-cols-1 md:grid-cols-3">
            {PRINCIPLES.map((item, i) => (
              <div key={i} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '36px 24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16 }}>
                <span style={{ display: 'block', marginBottom: 16 }}>{item.icon}</span>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: '#FFFFFF', margin: '0 0 10px 0' }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section style={{ background: '#09111E', padding: '72px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Chennai, Tamil Nadu</p>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', margin: '0 0 24px 0' }}>
            <a href="mailto:hello@signet-ai.in" style={{ color: '#1D9E75', textDecoration: 'none', fontWeight: 500 }}>hello@signet-ai.in</a>
          </p>
          <Link href="/contact" className="btn-outline">
            Contact us →
          </Link>
        </div>
      </section>
    </div>
  )
}