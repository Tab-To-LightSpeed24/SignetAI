import Link from 'next/link'

export const metadata = {
  title: 'Auto Component Contracts — Signet AI',
  description: 'Protect your OEM supply agreements. AI contract analysis built for Hosur, Chennai, and Coimbatore auto component suppliers.'
}

const RISKS = [
  { risk: 'Unlimited indemnification', desc: 'Machinery defect scenario — liability without cap', severity: 'high' },
  { risk: 'Unilateral quality audit termination', desc: 'Buyer can terminate based on their sole discretion after audit', severity: 'high' },
  { risk: 'Volume commitment without demand guarantee', desc: 'You commit to supply volumes, but buyer has no purchase obligation', severity: 'medium' },
  { risk: 'IP ownership of custom tooling/dies', desc: 'You design the tooling, but buyer owns the IP', severity: 'medium' },
  { risk: 'Governing law: European jurisdiction', desc: 'Disputes resolved in EU courts — costly for Indian suppliers', severity: 'medium' },
]

export default function AutoComponentsPage() {
  return (
    <div>
      {/* Hero */}
      <section style={{ background: '#0D1B2A', padding: '120px 24px 96px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1D9E75', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'block' }}>AUTO COMPONENT SUPPLIERS</span>
          <h1 style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: 44, color: '#FFFFFF', fontWeight: 400, lineHeight: 1.15, margin: '0 0 20px 0' }}>
            Protect your OEM supply agreements before Stellantis and Hyundai lock you in.
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.65)', maxWidth: 660, margin: '0 auto 36px', lineHeight: 1.65 }}>
            138 Tamil Nadu suppliers are signing complex OEM agreements this year. Here's what to watch for.
          </p>
          <Link href="/login" className="btn-cta">
            Analyse an OEM agreement free →
          </Link>
        </div>
      </section>

      {/* Risks */}
      <section style={{ background: '#09111E', padding: '96px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 840, margin: '0 auto' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1D9E75', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'block' }}>RISK ANALYSIS</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: '#FFFFFF', fontWeight: 400, margin: '0 0 40px 0' }}>
            The risks in OEM supply contracts
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {RISKS.map((item, i) => (
              <div key={i} style={{ padding: '18px 22px', border: `1px solid ${item.severity === 'high' ? 'rgba(226,75,74,0.2)' : 'rgba(186,117,23,0.15)'}`, borderRadius: 12, background: item.severity === 'high' ? 'rgba(226,75,74,0.04)' : 'rgba(186,117,23,0.04)' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: item.severity === 'high' ? '#E24B4A' : '#BA7517', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.severity === 'high' ? '#E24B4A' : '#BA7517', display: 'inline-block', flexShrink: 0 }} />
                  {item.risk}
                </div>
                <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.6)', paddingLeft: 18 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* India-EU FTA */}
      <section style={{ background: '#0D1B2A', padding: '72px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', padding: '40px 36px', background: 'rgba(186,117,23,0.05)', border: '1px solid rgba(186,117,23,0.15)', borderRadius: 16 }}>
          <h3 style={{ fontSize: 22, fontWeight: 600, color: '#FFFFFF', margin: '0 0 14px 0' }}>What changed in 2026</h3>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, margin: 0 }}>
            The India-EU FTA brings new opportunities — and new contract complexities. OEM agreements now include revised quality standards, data transfer clauses, and IP provisions that didn't exist before. Signet AI helps you navigate these changes.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#09111E', padding: '72px 24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: '#FFFFFF', fontWeight: 400, margin: '0 0 28px 0' }}>Ready to protect your next OEM contract?</h2>
        <Link href="/login" className="btn-cta">
          Analyse an OEM agreement free →
        </Link>
      </section>
    </div>
  )
}