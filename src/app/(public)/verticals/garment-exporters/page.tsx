import Link from 'next/link'

export const metadata = {
  title: 'Garment Export Contracts — Signet AI',
  description: 'AI contract analysis for Tiruppur and Erode garment exporters. Catch auto-renewal traps and unfair quality audit clauses.'
}

const RISKS = [
  { risk: 'Auto-renewal traps', desc: 'Long-term supply deals with silent renewal clauses', severity: 'high' },
  { risk: 'Unilateral quality audit termination', desc: 'Buyer can terminate based on subjective quality assessment', severity: 'high' },
  { risk: 'Price revision clauses', desc: 'Buyer can unilaterally reduce prices without renegotiation', severity: 'medium' },
  { risk: 'Foreign governing law', desc: 'UK/EU law disputes are expensive and complex', severity: 'medium' },
  { risk: 'Indemnity for delay penalties', desc: 'Disproportionate penalties for shipping delays', severity: 'medium' },
]

export default function GarmentExportersPage() {
  return (
    <div>
      {/* Hero */}
      <section style={{ background: '#0D1B2A', padding: '120px 24px 96px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1D9E75', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'block' }}>GARMENT EXPORTERS</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 44, color: '#FFFFFF', fontWeight: 400, lineHeight: 1.15, margin: '0 0 20px 0' }}>
            Protect your garment export contracts from silent auto-renewals and unfair buyer terms.
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.65)', maxWidth: 660, margin: '0 auto 36px', lineHeight: 1.65 }}>
            UK/EU buyer agreements are getting more complex. Signet AI helps Tiruppur exporters spot the traps before signing.
          </p>
          <Link href="/login" className="btn-cta">
            Analyse an export agreement free →
          </Link>
        </div>
      </section>

      {/* Risks */}
      <section style={{ background: '#09111E', padding: '96px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 840, margin: '0 auto' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1D9E75', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'block' }}>RISK ANALYSIS</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: '#FFFFFF', fontWeight: 400, margin: '0 0 40px 0' }}>
            Key risks for garment exporters
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

      {/* CTA */}
      <section style={{ background: '#0D1B2A', padding: '72px 24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: '#FFFFFF', fontWeight: 400, margin: '0 0 28px 0' }}>Ready to protect your next export deal?</h2>
        <Link href="/login" className="btn-cta">
          Analyse an export agreement free →
        </Link>
      </section>
    </div>
  )
}