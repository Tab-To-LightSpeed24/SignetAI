export const metadata = {
  title: 'Cookie Policy — Signet AI',
  description: 'Signet AI Cookie Policy — how we use cookies and tracking technologies.'
}

const h2Style = { fontSize: 20, color: '#FFFFFF', fontWeight: 600 as const, marginTop: 40, marginBottom: 12, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)' }

export default function CookiePage() {
  return (
    <section style={{ background: '#0D1B2A', padding: '120px 24px 96px' }}>
      <div style={{ maxWidth: 740, margin: '0 auto', fontSize: 15, color: 'rgba(255,255,255,0.72)', lineHeight: 1.8 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 42, color: '#FFFFFF', fontWeight: 400, marginBottom: 36, lineHeight: 1.2 }}>Cookie Policy</h1>
        <p><strong style={{ color: 'rgba(255,255,255,0.85)' }}>Last updated: May 2026</strong></p>
        <p>This Cookie Policy explains how Signet AI uses cookies and similar tracking technologies when you visit our website or use our application.</p>

        <h2 style={h2Style}>What Are Cookies?</h2>
        <p>Cookies are small text files that are stored on your device when you visit a website. They are widely used to make websites work more efficiently, improve user experience, and provide information to the website owners.</p>

        <h2 style={h2Style}>How We Use Cookies</h2>
        <p>We use cookies for the following essential and functional purposes:</p>
        <ul style={{ paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li><strong style={{ color: 'rgba(255,255,255,0.85)' }}>Authentication and Security:</strong> We use cookies to keep you signed into your account and secure your sessions using Supabase Auth.</li>
          <li><strong style={{ color: 'rgba(255,255,255,0.85)' }}>Preferences:</strong> We store basic preferences to ensure your experience remains personalized.</li>
          <li><strong style={{ color: 'rgba(255,255,255,0.85)' }}>Performance:</strong> We collect anonymous data about how visitors interact with our service to optimize loading speeds and UI transitions.</li>
        </ul>

        <h2 style={h2Style}>Managing Your Cookies</h2>
        <p>Most web browsers allow you to control cookies through their settings preferences. If you choose to disable or block cookies, please note that essential parts of our application (such as logging in or uploading contracts) will not function correctly.</p>

        <h2 style={h2Style}>Updates to This Policy</h2>
        <p>We may update this Cookie Policy from time to time to reflect changes in our practices or legal obligations. We encourage you to review this page periodically to stay informed.</p>
      </div>
    </section>
  )
}
