import Link from 'next/link'

export const metadata = {
  title: 'India-EU FTA 2026: Contract Guide for Exporters — Signet AI',
  description: 'How the new India-EU Free Trade Agreement impacts contract terms for auto components, textiles, and IT exporters in Tamil Nadu.'
}

export default function IndiaEuFtaGuidePage() {
  return (
    <article style={{ background: '#fff', minHeight: '100dvh', padding: '0 0 80px 0', color: '#1A202C' }}>
      {/* Editorial Hero */}
      <header style={{
        background: 'linear-gradient(135deg, #0D1B2A 0%, #1A3048 100%)',
        color: '#fff',
        padding: '96px 24px 64px 24px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#1D9E75',
            background: 'rgba(29, 158, 117, 0.15)',
            padding: '4px 12px',
            borderRadius: 100,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'inline-block',
            marginBottom: 20
          }}>
            Featured · Industry Updates
          </span>
          <h1 style={{
            fontFamily: 'var(--font-display), serif',
            fontSize: '2.5rem',
            fontWeight: 400,
            lineHeight: 1.2,
            margin: '0 0 20px 0',
            letterSpacing: '-0.02em',
          }}>
            India-EU FTA 2026: What Tamil Nadu Exporters Need to Know
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: 'rgba(255,255,255,0.7)',
            maxWidth: 640,
            margin: '0 auto 32px auto',
            lineHeight: 1.6,
            fontWeight: 300,
          }}>
            The historic India-EU Free Trade Agreement brings unprecedented duty-free market access — alongside highly strict compliance terms. Here is how your export agreements must evolve.
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 20,
            fontSize: 13,
            color: 'rgba(255,255,255,0.5)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: 24,
            maxWidth: 400,
            margin: '0 auto'
          }}>
            <span>Published: 28 April 2026</span>
            <span>•</span>
            <span>10 min read</span>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <section style={{ maxWidth: 740, margin: '0 auto', padding: '60px 24px 0 24px', fontSize: 16, lineHeight: 1.8, color: '#2D3748' }}>
        <p style={{ fontSize: 18, color: '#4A5568', lineHeight: 1.7, marginBottom: 32, fontStyle: 'italic' }}>
          Tamil Nadu is positioned as a primary beneficiary of the new India-EU Free Trade Agreement (FTA). For garment exporters in Tiruppur, auto component manufacturers in Chennai/Hosur, and SaaS startups in Coimbatore, duty elimination unlocks major potential. However, European buyers are locking in high-standard compliance warranties in new supply agreements.
        </p>

        <p>Before you sign a renewed export or purchase contract under the FTA frameworks, your legal and management teams must carefully audit several critical clauses that carry high operational risk.</p>

        <h2 style={{ fontFamily: 'var(--font-display), serif', fontSize: 24, color: '#0D1B2A', fontWeight: 500, margin: '44px 0 16px 0' }}>1. Rules of Origin (RoO) Compliance Covenants</h2>
        <p>Duty-free access to the EU requires strict proof that your goods qualify as "originating in India." This is not just a customs filing requirement; it is a major contractual warranty in purchase orders.</p>
        
        {/* Compliance box styling */}
        <div style={{ background: '#F7FAFC', borderLeft: '4px solid #1D9E75', borderRadius: 8, padding: 24, margin: '32px 0' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0D1B2A', fontWeight: 600 }}>Contractual Trap:</h4>
          <p style={{ margin: 0, fontSize: 14, color: '#4A5568' }}>
            European buyers are inserting broad indemnification clauses. If EU customs audits reject the tariff preference certificate later due to a sub-supplier auditing failure, the exporter is made fully liable for back-duties, penalties, and delay damages.
          </p>
        </div>

        <p><strong>Action Point:</strong> Limit your liability for Rules of Origin audits to direct compliance proof, and explicitly exclude consequential business damages or cargo delay losses from your indemnification exposure.</p>

        <h2 style={{ fontFamily: 'var(--font-display), serif', fontSize: 24, color: '#0D1B2A', fontWeight: 500, margin: '44px 0 16px 0' }}>2. European Green Deal & Carbon Border Adjustments (CBAM)</h2>
        <p>The EU’s Carbon Border Adjustment Mechanism (CBAM) is now in full effect. For Tamil Nadu’s metal and engineering sectors, carbon emissions reporting must be verified by certified auditors. New supply contracts frequently assign all compliance burdens to the supplier.</p>
        
        <p>Ensure your contracts contain realistic timelines (e.g., 60 days) to furnish carbon accounting metrics and do not grant buyers the immediate right to terminate the contract for basic reporting delays.</p>

        <h2 style={{ fontFamily: 'var(--font-display), serif', fontSize: 24, color: '#0D1B2A', fontWeight: 500, margin: '44px 0 16px 0' }}>3. Jurisdiction & Dispute Resolution</h2>
        <p>Almost all European purchase agreements specify European governing law (e.g., German, French, or English courts) and arbitration in London, Munich, or Paris. For an Indian SME, defending a breach-of-contract claim in a Munich court is financially crippling.</p>
        
        <p><strong>Action Point:</strong> Negotiate for a neutral jurisdiction (like the Singapore International Arbitration Centre - SIAC) or restrict disputes to domestic institutional arbitration in India under the MCIA (Mumbai) or Chennai IAC guidelines.</p>

        {/* Call to action */}
        <div style={{
          background: 'linear-gradient(135deg, #0D1B2A 0%, #1A2A3A 100%)',
          color: '#fff',
          borderRadius: 12,
          padding: 36,
          textAlign: 'center',
          margin: '52px 0 40px 0',
          boxShadow: '0 10px 25px rgba(13,27,42,0.15)'
        }}>
          <h3 style={{ fontFamily: 'var(--font-display), serif', fontSize: 22, color: '#fff', fontWeight: 400, margin: '0 0 12px 0' }}>
            Auditing a renewed export agreement?
          </h3>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', maxWidth: 460, margin: '0 auto 24px auto', lineHeight: 1.6 }}>
            Upload your draft agreement to the Signet AI dashboard. Our specialized B2B engines immediately flag Rules of Origin liabilities, jurisdiction risks, and unlimited indemnifications.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link href="/app" style={{
              padding: '12px 24px',
              background: '#1D9E75',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(29,158,117,0.3)'
            }}>
              Analyze Draft Agreement →
            </Link>
          </div>
        </div>

        <Link href="/resources" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#1D9E75', textDecoration: 'none', fontSize: 15, fontWeight: 500 }}>
          ← Back to resources index
        </Link>
      </section>
    </article>
  )
}
