export const metadata = {
  title: 'Terms of Service — Signet AI',
  description: 'Signet AI Terms of Service — terms governing the use of our contract analysis platform.'
}

const sectionStyle = { background: '#0D1B2A', padding: '120px 24px 96px' }
const containerStyle = { maxWidth: 740, margin: '0 auto', fontSize: 15, color: 'rgba(255,255,255,0.72)', lineHeight: 1.8 }
const h1Style = { fontFamily: 'var(--font-display)', fontSize: 42, color: '#FFFFFF', fontWeight: 400, marginBottom: 36, lineHeight: 1.2 }
const h2Style = { fontSize: 20, color: '#FFFFFF', fontWeight: 600, marginTop: 40, marginBottom: 12, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)' }
const strongStyle: React.CSSProperties = { color: 'rgba(255,255,255,0.85)' }

export default function TermsPage() {
  return (
    <section style={sectionStyle}>
      <div style={containerStyle}>
        <h1 style={h1Style}>Terms of Service</h1>
        <p><strong style={strongStyle}>Last updated: May 2026</strong></p>
        <h2 style={h2Style}>Service Description</h2>
        <p>Signet AI provides AI-powered contract risk analysis for informational purposes. Our platform reads uploaded contracts, identifies clause types, assigns risk scores, and generates plain-English explanations.</p>
        <h2 style={h2Style}>Acceptable Use</h2>
        <p>You agree to use Signet AI only for lawful purposes and in accordance with these terms. You may not use the service to upload malicious content, violate others' intellectual property, or attempt to bypass usage limits.</p>
        <h2 style={h2Style}>Subscription & Billing</h2>
        <p>Free accounts receive 3 analyses per month. Paid plans are billed monthly or annually as selected. Cancellations take effect at the end of the current billing cycle. Refunds are handled on a case-by-case basis.</p>
        <h2 style={h2Style}>Disclaimers</h2>
        <p>Signet AI is not a law firm and does not provide legal advice. Our analysis is for informational purposes only and should not be relied upon as a substitute for professional legal counsel. Use of Signet AI does not create an attorney-client relationship.</p>
        <h2 style={h2Style}>Limitation of Liability</h2>
        <p>Signet AI shall not be liable for any indirect, incidental, or consequential damages arising from the use or inability to use the service, including but not limited to reliance on analysis results.</p>
      </div>
    </section>
  )
}