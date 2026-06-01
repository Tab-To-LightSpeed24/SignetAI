'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'

const FAQS = [
  { q: 'What counts as one contract?', a: 'Any single uploaded document — a PDF, DOCX, or TXT file. Uploading the same contract twice does count as two analyses.' },
  { q: 'What happens when I hit my monthly limit?', a: 'The "Analyse New Contract" button will be disabled, and you will see an upgrade prompt. Your existing contracts remain fully accessible and searchable.' },
  { q: 'Can I cancel anytime?', a: 'Yes. You can cancel your subscription at any time from your billing settings. You will retain access to your account and contracts until the end of the current billing cycle.' },
  { q: 'Is my contract data private?', a: 'Yes. All contracts are encrypted at rest and in transit. We never use your contract data to train models. Full details in our Privacy Policy.' },
  { q: 'Is this legal advice?', a: 'No. Signet AI provides risk analysis for informational purposes only. It does not constitute legal advice. We recommend consulting a qualified lawyer for any contract with significant financial or legal implications.' },
  { q: 'Do you offer invoicing for Indian businesses?', a: 'Yes. All plans include GST-compliant invoices. You can add your GST number in billing settings.' },
]

const PLANS = [
  { name: 'Free', price: '₹0', priceAnnual: '₹0', features: { contracts: '3/month', breakdown: true, risk: true, english: true, counter: false, pdf: false, renewal: false, playbook: false, repo: false, search: false, priority: false, api: false }, cta: 'Start free', href: '/login?plan=Free', highlighted: false },
  { name: 'Starter', price: '₹1,999', priceAnnual: '₹1,599', features: { contracts: '15/month', breakdown: true, risk: true, english: true, counter: true, pdf: true, renewal: true, playbook: false, repo: false, search: false, priority: false, api: false }, cta: 'Start 14-day trial', href: '/login?plan=Starter', highlighted: true },
  { name: 'Growth', price: '₹4,999', priceAnnual: '₹3,999', features: { contracts: '50/month', breakdown: true, risk: true, english: true, counter: true, pdf: true, renewal: true, playbook: true, repo: true, search: false, priority: false, api: false }, cta: 'Get started', href: '/login?plan=Growth', highlighted: false },
  { name: 'Pro', price: '₹9,999', priceAnnual: '₹7,999', features: { contracts: 'Unlimited', breakdown: true, risk: true, english: true, counter: true, pdf: true, renewal: true, playbook: true, repo: true, search: true, priority: true, api: true }, cta: 'Get started', href: '/login?plan=Pro', highlighted: false },
]

const FEATURE_ROWS = [
  { key: 'contracts', label: 'Contracts/month' }, { key: 'breakdown', label: 'Clause-by-clause breakdown' },
  { key: 'risk', label: 'Risk scoring (1–10)' }, { key: 'english', label: 'Plain-English explanations' },
  { key: 'counter', label: 'Counter-clause generator' }, { key: 'pdf', label: 'PDF export' },
  { key: 'renewal', label: 'Renewal alerts' }, { key: 'playbook', label: 'Personal playbook' },
  { key: 'repo', label: 'Contract repository' }, { key: 'search', label: 'Conversational search' },
  { key: 'priority', label: 'Priority analysis (< 30 sec)' }, { key: 'api', label: 'API access' },
]

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null)

  return (
    <div>
      {/* Header */}
      <section style={{ background: '#0D1B2A', padding: '120px 24px 64px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1D9E75', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'block' }}>SUBSCRIPTION TIERS</span>
          <h1 style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: 48, color: '#FFFFFF', fontWeight: 400, margin: '0 0 16px 0', lineHeight: 1.15 }}>
            Simple pricing. Real protection.
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.65)', margin: '0 0 36px 0', lineHeight: 1.6 }}>
            Start free. Upgrade only when you need more analyses.
          </p>
          {/* Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <span style={{ fontSize: 14, fontWeight: annual ? 400 : 600, color: annual ? 'rgba(255,255,255,0.5)' : '#FFFFFF' }}>Monthly</span>
            <button onClick={() => setAnnual(!annual)} style={{ width: 48, height: 26, borderRadius: 13, background: annual ? '#1D9E75' : 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 250ms' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: annual ? 25 : 3, transition: 'left 250ms', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
            </button>
            <span style={{ fontSize: 14, fontWeight: annual ? 600 : 400, color: annual ? '#FFFFFF' : 'rgba(255,255,255,0.5)' }}>
              Annual <span style={{ color: '#1D9E75', fontWeight: 600, fontSize: 12 }}>Save 20%</span>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Table */}
      <section style={{ background: '#09111E', padding: '64px 24px 96px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', overflowX: 'auto', paddingTop: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: 700 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>Feature</th>
                {PLANS.map(p => (
                  <th key={p.name} style={{ padding: '28px 20px 20px', textAlign: 'center', background: p.highlighted ? 'rgba(29,158,117,0.08)' : 'transparent', borderTop: p.highlighted ? '2px solid #1D9E75' : '1px solid rgba(255,255,255,0.05)', borderLeft: p.highlighted ? '2px solid #1D9E75' : '1px solid rgba(255,255,255,0.05)', borderRight: p.highlighted ? '2px solid #1D9E75' : '1px solid rgba(255,255,255,0.05)', borderRadius: p.highlighted ? '12px 12px 0 0' : 0, position: 'relative', minWidth: 140 }}>
                    {p.highlighted && (
                      <span style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#1D9E75', color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 14px', borderRadius: 100, letterSpacing: '0.05em', whiteSpace: 'nowrap', boxShadow: '0 4px 10px rgba(29,158,117,0.35)', zIndex: 10 }}>MOST POPULAR</span>
                    )}
                    <div style={{ fontSize: 18, fontWeight: 600, color: '#FFFFFF' }}>{p.name}</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#FFFFFF', marginTop: 8 }}>{annual ? p.priceAnnual : p.price}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{annual ? '/ month, billed annually' : '/ month'}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURE_ROWS.map((feat, i) => (
                <tr key={feat.key} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '12px 20px', fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: 500, borderTop: '1px solid rgba(255,255,255,0.04)' }}>{feat.label}</td>
                  {PLANS.map(p => (
                    <td key={p.name} style={{ padding: '12px 20px', textAlign: 'center', background: p.highlighted ? 'rgba(29,158,117,0.04)' : 'transparent', borderLeft: p.highlighted ? '2px solid #1D9E75' : '1px solid rgba(255,255,255,0.04)', borderRight: p.highlighted ? '2px solid #1D9E75' : '1px solid rgba(255,255,255,0.04)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      {p.features[feat.key as keyof typeof p.features] === true ? (
                        <span style={{ color: '#1D9E75', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Check size={18} /></span>
                      ) : typeof p.features[feat.key as keyof typeof p.features] === 'string' ? (
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{p.features[feat.key as keyof typeof p.features] as string}</span>
                      ) : (
                        <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 18 }}>—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              {/* CTA row */}
              <tr>
                <td style={{ padding: '20px 20px' }} />
                {PLANS.map(p => (
                  <td key={p.name} style={{ padding: '20px', textAlign: 'center', background: p.highlighted ? 'rgba(29,158,117,0.08)' : 'transparent', borderBottom: p.highlighted ? '2px solid #1D9E75' : '1px solid rgba(255,255,255,0.05)', borderLeft: p.highlighted ? '2px solid #1D9E75' : '1px solid rgba(255,255,255,0.05)', borderRight: p.highlighted ? '2px solid #1D9E75' : '1px solid rgba(255,255,255,0.05)', borderRadius: '0 0 12px 12px' }}>
                    <Link href={p.href} style={{
                      display: 'inline-block', padding: '11px 22px',
                      background: p.highlighted ? '#1D9E75' : 'transparent',
                      color: '#FFFFFF',
                      border: p.highlighted ? 'none' : '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 6, fontSize: 13, fontWeight: 600, textDecoration: 'none',
                      transition: 'all 250ms cubic-bezier(0.16,1,0.3,1)',
                    }}
                      onMouseEnter={e => {
                        if (p.highlighted) { e.currentTarget.style.background = '#0F6E56'; e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(29,158,117,0.4)' }
                        else { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)' }
                      }}
                      onMouseLeave={e => {
                        if (p.highlighted) { e.currentTarget.style.background = '#1D9E75'; e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = 'none' }
                        else { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'translateY(0)' }
                      }}
                    >
                      {p.cta} →
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: '#0D1B2A', padding: '96px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1D9E75', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'block', textAlign: 'center' }}>FREQUENTLY ASKED</span>
          <h2 style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: 36, color: '#FFFFFF', fontWeight: 400, textAlign: 'center', margin: '0 0 48px 0' }}>
            Common questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'hidden' }}>
                <button onClick={() => setActiveQuestion(activeQuestion === i ? null : i)} style={{ width: '100%', textAlign: 'left', padding: '16px 20px', background: activeQuestion === i ? 'rgba(29,158,117,0.08)' : 'rgba(255,255,255,0.02)', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 200ms' }}>
                  {faq.q}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: activeQuestion === i ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 250ms', flexShrink: 0, marginLeft: 12, color: '#1D9E75' }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {activeQuestion === i && (
                  <div style={{ padding: '0 20px 16px', fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, background: 'rgba(29,158,117,0.04)' }}>{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise */}
      <section style={{ background: '#09111E', padding: '72px 24px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '48px 40px', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
          <h3 style={{ fontSize: 22, fontWeight: 600, color: '#FFFFFF', margin: '0 0 12px 0' }}>Need more than 5 team members or custom volume?</h3>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: '0 0 28px 0', lineHeight: 1.7 }}>Contact us for a custom plan tailored to your organisation's contract volume and compliance needs.</p>
          <Link href="/contact" style={{
            display: 'inline-flex', padding: '13px 28px', background: '#1D9E75', color: '#FFFFFF',
            borderRadius: 6, fontSize: 14, fontWeight: 600, textDecoration: 'none',
            transition: 'all 300ms cubic-bezier(0.16,1,0.3,1)', boxShadow: '0 4px 14px rgba(29,158,117,0.25)',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#0F6E56'; e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(29,158,117,0.45)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#1D9E75'; e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(29,158,117,0.25)' }}
          >
            Contact us →
          </Link>
        </div>
      </section>
    </div>
  )
}