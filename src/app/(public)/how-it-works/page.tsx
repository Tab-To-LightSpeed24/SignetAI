import Link from 'next/link'
import { UploadCloud, Search, Shield, Scale, AlertTriangle, FileText } from 'lucide-react'

export default function HowItWorksPage() {
  const STEPS = [
    { step: '01', icon: <UploadCloud size={32} style={{ color: '#1D9E75' }} />, title: 'Upload your contract', desc: 'PDF, DOCX, or DOC. Drag and drop or click to upload. Up to 50MB. Your file is encrypted and private.' },
    { step: '02', icon: <Search size={32} style={{ color: '#1D9E75' }} />, title: 'Signet AI reads every clause', desc: 'Our AI reads the full document, identifies clause types, scores each one for risk, and generates plain-English explanations.' },
    { step: '03', icon: <Shield size={32} style={{ color: '#1D9E75' }} />, title: 'Get your risk report', desc: 'A complete risk report with clause-by-clause breakdown, risk scores, and replacement language for high-risk clauses.' },
  ]

  const DETECTED = [
    { type: 'Indemnification', risk: 'Unlimited liability can expose your business to catastrophic losses' },
    { type: 'Auto-renewal', risk: 'Silent renewals lock you into unfavourable terms' },
    { type: 'Limitation of Liability', risk: 'Caps on damages may leave you under-protected' },
    { type: 'Governing Law', risk: 'Foreign jurisdiction makes dispute resolution expensive' },
    { type: 'Termination Rights', risk: 'One-sided termination leaves you vulnerable' },
    { type: 'Intellectual Property', risk: 'Unclear IP ownership can cost you your innovations' },
    { type: 'Confidentiality', risk: 'Weak NDAs expose your trade secrets' },
    { type: 'Force Majeure', risk: 'Narrow definitions may not cover real-world disruptions' },
    { type: 'Payment Terms', risk: 'Unclear payment schedules create cash flow risk' },
    { type: 'Data Privacy', risk: 'GDPR violations can result in heavy penalties' },
    { type: 'Price Revision', risk: 'Unilateral price changes destroy margins' },
    { type: 'Warranty', risk: 'Extended warranty periods increase liability exposure' },
  ]

  const NOT_DO = [
    { icon: <Scale size={20} style={{ color: '#BA7517' }} />, text: 'We are not a law firm. Signet AI does not provide legal advice.' },
    { icon: <AlertTriangle size={20} style={{ color: '#BA7517' }} />, text: "We don't replace your lawyer. Our analysis is a tool, not a substitute." },
    { icon: <FileText size={20} style={{ color: '#BA7517' }} />, text: "We don't file documents or represent you in any legal proceeding." },
  ]

  const INDUSTRIES = [
    { name: 'Auto Component Suppliers', href: '/verticals/auto-components' },
    { name: 'Garment Exporters', href: '/verticals/garment-exporters' },
    { name: 'Electronics SMEs', href: '/verticals/electronics' },
    { name: 'IT & Software Services', href: '/verticals/electronics' },
  ]

  return (
    <div>
      {/* Hero / 3-Step */}
      <section style={{ background: '#0D1B2A', padding: '120px 24px 96px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1D9E75', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'block' }}>HOW IT WORKS</span>
          <h1 style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: 48, color: '#FFFFFF', fontWeight: 400, margin: '0 0 20px 0', lineHeight: 1.15 }}>
            From contract to clarity in three steps
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.65)', maxWidth: 600, margin: '0 auto 64px', lineHeight: 1.65 }}>
            Upload any vendor, buyer, or supplier agreement. Signet AI reads it, scores it, and tells you exactly what to watch for.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32 }} className="grid-cols-1 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '36px 24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16 }}>
                <div style={{ fontSize: 52, fontFamily: 'var(--font-display)', color: 'rgba(29,158,117,0.2)', lineHeight: 1, marginBottom: 12 }}>{s.step}</div>
                <div style={{ display: 'inline-flex', marginBottom: 16 }}>{s.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#FFFFFF', margin: '0 0 10px 0' }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Signet AI Detects */}
      <section style={{ background: '#09111E', padding: '96px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1D9E75', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'block', textAlign: 'center' }}>CLAUSE COVERAGE</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: '#FFFFFF', fontWeight: 400, textAlign: 'center', margin: '0 0 48px 0' }}>
            What Signet AI detects
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }} className="grid-cols-1 md:grid-cols-2">
            {DETECTED.map((item, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 10, padding: '18px 22px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1D9E75', marginBottom: 6 }}>{item.type}</div>
                <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.65)', lineHeight: 1.55 }}>{item.risk}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Signet AI Does NOT Do */}
      <section style={{ background: '#0D1B2A', padding: '96px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#BA7517', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'block', textAlign: 'center' }}>IMPORTANT DISCLOSURE</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: '#FFFFFF', fontWeight: 400, textAlign: 'center', margin: '0 0 40px 0' }}>
            What Signet AI does NOT do
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {NOT_DO.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, padding: '18px 22px', background: 'rgba(186,117,23,0.05)', borderRadius: 10, border: '1px solid rgba(186,117,23,0.15)', alignItems: 'flex-start' }}>
                <span style={{ display: 'inline-flex', flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
                <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>{item.text}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24, padding: '18px 22px', background: 'rgba(186,117,23,0.06)', border: '1px solid rgba(186,117,23,0.2)', borderRadius: 10 }}>
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>
              <strong style={{ color: '#BA7517' }}>Legal Disclaimer:</strong> Signet AI is not a law firm. All analysis and reports generated are for informational purposes only and do not constitute legal counsel. Users should not rely on Signet AI analysis as a substitute for professional legal advice from a licensed advocate.
            </p>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section id="industries" style={{ background: '#09111E', padding: '96px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1D9E75', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'block' }}>INDUSTRY PROFILES</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: '#FFFFFF', fontWeight: 400, margin: '0 0 48px 0' }}>
            Built for your industry
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20 }} className="grid-cols-1 md:grid-cols-2">
            {INDUSTRIES.map((ind, i) => (
              <Link key={i} href={ind.href} style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)', color: '#FFFFFF', textDecoration: 'none', textAlign: 'left', display: 'block' }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{ind.name}</div>
                <div style={{ fontSize: 13, color: '#1D9E75', fontWeight: 500 }}>View guide →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ background: '#0D1B2A', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: '#FFFFFF', fontWeight: 400, margin: '0 0 28px 0' }}>Ready to protect your next contract?</h2>
          <Link href="/login" className="btn-cta">
            Analyse your first contract free →
          </Link>
        </div>
      </section>
    </div>
  )
}