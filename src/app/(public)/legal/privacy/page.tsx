export const metadata = {
  title: 'Privacy Policy — Signet AI',
  description: 'Signet AI Privacy Policy — how we collect, use, and protect your data.'
}

const sectionStyle = { background: '#0D1B2A', padding: '120px 24px 96px' }
const containerStyle = { maxWidth: 740, margin: '0 auto', fontSize: 15, color: 'rgba(255,255,255,0.72)', lineHeight: 1.8 }
const h1Style = { fontFamily: 'var(--font-display)', fontSize: 42, color: '#FFFFFF', fontWeight: 400, marginBottom: 36, lineHeight: 1.2 }
const h2Style = { fontSize: 20, color: '#FFFFFF', fontWeight: 600, marginTop: 40, marginBottom: 12, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)' }
const strongStyle: React.CSSProperties = { color: 'rgba(255,255,255,0.85)' }

export default function PrivacyPage() {
  return (
    <section style={sectionStyle}>
      <div style={containerStyle}>
        <h1 style={h1Style}>Privacy Policy</h1>
        <p><strong style={strongStyle}>Last updated: May 2026</strong></p>
        <h2 style={h2Style}>Data We Collect</h2>
        <p>When you create an account, we collect your name, email address, and company name. When you upload a contract, we process the document content to generate risk analysis. We also collect basic usage data to improve our service.</p>
        <h2 style={h2Style}>How We Use Your Data</h2>
        <p>Your contract data is used solely to generate risk analysis reports. We use Supabase for secure storage, and our AI analysis is powered by Google Gemini API. We do not use your contract data to train or fine-tune models. Payment data is handled by Razorpay and Stripe — we never store full payment details.</p>
        <h2 style={h2Style}>Data Retention</h2>
        <p>Your contracts and analysis reports are stored until you delete them or close your account. You can export or delete your data at any time from your account settings.</p>
        <h2 style={h2Style}>Your Rights</h2>
        <p>You have the right to access, correct, export, and delete your data at any time. For privacy-related requests, contact us at <a href="mailto:privacy@signet-ai.in" style={{ color: '#1D9E75', textDecoration: 'none' }}>privacy@signet-ai.in</a>.</p>
        <h2 style={h2Style}>Third-Party Services</h2>
        <p>We use Supabase (database & auth), Google Gemini API (AI analysis), Razorpay and Stripe (payments), and Vercel (hosting). Each service has its own privacy policy governing data handling.</p>
      </div>
    </section>
  )
}