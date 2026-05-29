import Link from 'next/link'

const FOOTER_COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Auto Component Contracts', href: '/verticals/auto-components' },
      { label: 'Garment Export Contracts', href: '/verticals/garment-exporters' },
      // { label: 'For Lawyers', href: '/partners/lawyers' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Resources / Blog', href: '/resources' },
      { label: 'Contact Us', href: '/contact' },
      // { label: 'Partner Program', href: '/partners/lawyers' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/legal/privacy' },
      { label: 'Terms of Service', href: '/legal/terms' },
      { label: 'Legal Disclaimer', href: '/legal/disclaimer' },
      { label: 'Cookie Policy', href: '/legal/cookie' },
    ],
  },
]

export default function PublicFooter() {
  return (
    <footer style={{ background: '#0D1B2A', color: '#fff' }}>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-8 md:gap-12"
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '64px 24px 40px',
        }}
      >
        {/* ── Column 1: Brand ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ color: '#1D9E75' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 15l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontSize: 20, fontWeight: 400, fontFamily: 'var(--font-display), Georgia, serif' }}>
              Signet AI
            </span>
          </div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: '0 0 20px 0', maxWidth: 260 }}>
            Know what you're signing — before it costs you.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            {/* LinkedIn */}
            <a href="#" className="footer-social-link" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            {/* Twitter/X */}
            <a href="#" className="footer-social-link" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          </div>
        </div>

        {/* ── Columns 2-4 ── */}
        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 16px 0' }}>
              {col.title}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="footer-link"
                    style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.65)', textDecoration: 'none' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Bottom Bar ── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
            &copy; 2026 Signet AI Technologies Pvt. Ltd. &middot; Chennai, Tamil Nadu
          </span>
          <span
            style={{
              fontSize: 11,
              padding: '4px 12px',
              borderRadius: 100,
              background: 'rgba(186,117,23,0.15)',
              color: '#BA7517',
              fontWeight: 600,
              letterSpacing: '0.02em',
            }}
          >
            Not a law firm. Not legal advice.
          </span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
            Made in Chennai 🇮🇳
          </span>
        </div>
      </div>
    </footer>
  )
}