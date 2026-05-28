'use client'

import Link from 'next/link'

interface FeaturePlaceholderProps {
  title: string
  description?: string
  icon?: React.ReactNode
}

const DEFAULT_ICONS: Record<string, React.ReactNode> = {
  'My Contracts': (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  'Contract Search': (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  'Renewal Calendar': (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
    </svg>
  ),
  'Legal Partners': (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
}

const FEATURE_DESCRIPTIONS: Record<string, string> = {
  'My Contracts': 'A full-text searchable archive of every contract you\'ve analysed — with risk scores, clause summaries, and version history.',
  'Contract Search': 'Search across clauses, risk labels, contract types, and parties. Full-text search across your entire contract library.',
  'Renewal Calendar': 'Never miss a renewal deadline. All your critical dates visualised on a calendar with configurable email alerts.',
  'Legal Partners': 'Connect with verified corporate lawyers specialising in your contract type — on demand, with context from your Signet AI report.',
}

export default function FeaturePlaceholder({ title, description, icon }: FeaturePlaceholderProps) {
  const resolvedIcon = icon ?? DEFAULT_ICONS[title]
  const resolvedDescription = description ?? FEATURE_DESCRIPTIONS[title] ?? 'This feature is being built by our engineering team and will be available soon.'

  return (
    <div
      style={{
        maxWidth: '100%',
        padding: '40px 32px',
        color: '#E2E8F0',
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Skeleton shimmer rows at top to suggest content is loading/coming */}
      <div style={{ width: '100%', maxWidth: 680, marginBottom: 48 }}>
        {[100, 70, 85].map((w, i) => (
          <div
            key={i}
            style={{
              height: i === 0 ? 20 : 14,
              width: `${w}%`,
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 6,
              marginBottom: 10,
              animation: 'pulse 2s ease-in-out infinite',
              animationDelay: `${i * 200}ms`,
            }}
          />
        ))}
      </div>

      {/* Central message card */}
      <div
        style={{
          maxWidth: 520,
          width: '100%',
          textAlign: 'center',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: '48px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'rgba(29,158,117,0.08)',
            border: '1px solid rgba(29,158,117,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(29,158,117,0.7)',
            marginBottom: 4,
          }}
        >
          {resolvedIcon ?? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          )}
        </div>

        {/* Heading */}
        <div>
          <h1
            className="font-display"
            style={{
              fontSize: 24,
              fontWeight: 400,
              color: '#fff',
              margin: '0 0 8px 0',
              fontFamily: 'var(--font-display), serif',
            }}
          >
            {title}
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: 0 }}>
            {resolvedDescription}
          </p>
        </div>

        {/* Status badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(186,117,23,0.1)',
            border: '1px solid rgba(186,117,23,0.25)',
            color: '#BA7517',
            fontSize: 12,
            fontWeight: 600,
            padding: '5px 14px',
            borderRadius: 100,
            letterSpacing: '0.04em',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#BA7517', display: 'inline-block' }} />
          COMING SOON
        </div>

        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '4px 0 0 0', lineHeight: 1.5 }}>
          Want early access?{' '}
          <a
            href="mailto:hello@signet-ai.in?subject=Early Access Request"
            style={{ color: 'var(--teal)', textDecoration: 'underline' }}
          >
            Contact our team
          </a>
        </p>
      </div>

      {/* Bottom skeleton shimmer rows */}
      <div style={{ width: '100%', maxWidth: 680, marginTop: 48 }}>
        {[60, 90, 50].map((w, i) => (
          <div
            key={i}
            style={{
              height: 14,
              width: `${w}%`,
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 6,
              marginBottom: 10,
              animation: 'pulse 2s ease-in-out infinite',
              animationDelay: `${i * 150 + 400}ms`,
            }}
          />
        ))}
      </div>

      {/* CTA back to dashboard */}
      <div style={{ marginTop: 32 }}>
        <Link
          href="/app"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            color: 'rgba(255,255,255,0.4)',
            textDecoration: 'none',
            transition: 'color 150ms',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
