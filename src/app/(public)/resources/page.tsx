'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'

const ARTICLES = [
  { category: 'Contract Guides', title: 'Understanding OEM Supply Agreements: A Guide for Tamil Nadu Auto Component Suppliers', excerpt: 'Key clauses to watch for in Stellantis, Hyundai, and other OEM contracts.', date: '12 May 2026', readTime: '8 min read', href: '#' },
  { category: 'Legal Explainers', title: 'What Unlimited Indemnification Really Means for Your Business', excerpt: 'A plain-English explanation of indemnification clauses and how they can expose your business.', date: '5 May 2026', readTime: '6 min read', href: '#' },
  { category: 'Industry Updates', title: 'India-EU FTA 2026: What Exporters Need to Know', excerpt: 'How the new free trade agreement changes contract terms for Tamil Nadu exporters.', date: '28 Apr 2026', readTime: '10 min read', href: '/resources/india-eu-fta-guide' },
  { category: 'Case Studies', title: 'How a Hosur Supplier Avoided ₹25 Lakhs in Liability', excerpt: 'A Tier-2 auto component supplier used Signet AI to catch an unlimited indemnification clause.', date: '20 Apr 2026', readTime: '5 min read', href: '#' },
  { category: 'Contract Guides', title: 'Auto-Renewal Clauses: The Silent Trap in Export Agreements', excerpt: 'How garment exporters can spot and negotiate auto-renewal clauses before they lock in.', date: '15 Apr 2026', readTime: '7 min read', href: '#' },
  { category: 'Legal Explainers', title: 'Governing Law and Jurisdiction: Why UK Courts Matter for Indian SMEs', excerpt: 'Why foreign jurisdiction clauses in your contracts could cost you more than the contract value.', date: '8 Apr 2026', readTime: '6 min read', href: '#' },
  { category: 'Case Studies', title: 'Tiruppur Garment Exporter Catches Silent Auto-Renewal', excerpt: 'How Signet AI flagged a 90-day auto-renewal clause with time to renegotiate.', date: '1 Apr 2026', readTime: '4 min read', href: '#' },
  { category: 'Industry Updates', title: 'New Data Privacy Requirements for EU Buyer Contracts', excerpt: 'GDPR implications for Tamil Nadu IT and garment exporters working with European clients.', date: '25 Mar 2026', readTime: '9 min read', href: '#' },
  { category: 'Contract Guides', title: 'IP Ownership Clauses in SaaS and IT Service Agreements', excerpt: 'Protecting your intellectual property when signing work-for-hire and software development contracts.', date: '18 Mar 2026', readTime: '7 min read', href: '#' },
]

const CATEGORIES = ['All', 'Contract Guides', 'Legal Explainers', 'Industry Updates', 'Case Studies']

export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [newsletterErrorMsg, setNewsletterErrorMsg] = useState('')

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail) return
    setNewsletterStatus('loading')
    setNewsletterErrorMsg('')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail })
      })
      const data = await res.json()
      if (data.error) {
        setNewsletterStatus('error')
        setNewsletterErrorMsg(data.message || 'Subscription failed.')
      } else {
        setNewsletterStatus('success')
        setNewsletterEmail('')
      }
    } catch {
      setNewsletterStatus('error')
      setNewsletterErrorMsg('Connection error. Please try again.')
    }
  }

  const filtered = activeCategory === 'All' ? ARTICLES : ARTICLES.filter(a => a.category === activeCategory)

  return (
    <div>
      {/* Featured Post */}
      <section style={{ background: '#0D1B2A', padding: '120px 24px 80px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1D9E75', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'block' }}>RESOURCES & GUIDES</span>
          <Link href="/resources/india-eu-fta-guide" style={{ textDecoration: 'none', display: 'block', background: 'rgba(255,255,255,0.02)', borderRadius: 16, padding: 36, border: '1px solid rgba(255,255,255,0.07)' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#1D9E75', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Featured — Industry Updates</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: '#FFFFFF', fontWeight: 400, margin: '12px 0 10px 0', lineHeight: 1.25 }}>India-EU FTA 2026: What Exporters Need to Know</h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: '0 0 20px 0' }}>The India-EU Free Trade Agreement brings unprecedented opportunities — and new contract complexities. Our comprehensive guide covers what changed, what to watch for, and how to protect your business.</p>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
              <span>28 April 2026</span>
              <span>10 min read</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Category Filter */}
      <section style={{ background: '#09111E', padding: '40px 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              padding: '7px 18px', fontSize: 13, fontWeight: activeCategory === cat ? 600 : 400,
              background: activeCategory === cat ? '#1D9E75' : 'rgba(255,255,255,0.03)',
              color: activeCategory === cat ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
              border: activeCategory === cat ? 'none' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 100, cursor: 'pointer', whiteSpace: 'nowrap',
              transition: 'all 200ms cubic-bezier(0.16,1,0.3,1)',
            }}
              onMouseEnter={e => { if (activeCategory !== cat) { e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' } }}
              onMouseLeave={e => { if (activeCategory !== cat) { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' } }}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Article Grid */}
      <section style={{ background: '#09111E', padding: '40px 24px 96px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((article, i) => (
            <Link key={i} href={article.href} style={{ textDecoration: 'none', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '26px', display: 'flex', flexDirection: 'column', gap: 10, background: 'rgba(255,255,255,0.02)' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#1D9E75', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{article.category}</span>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#FFFFFF', margin: 0, lineHeight: 1.4 }}>{article.title}</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0 }}>{article.excerpt}</p>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', display: 'flex', gap: 10, marginTop: 'auto', paddingTop: 8 }}>
                <span>{article.date}</span>
                <span>{article.readTime}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section style={{ background: '#0D1B2A', padding: '80px 24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1D9E75', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'block' }}>NEWSLETTER</span>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: '#FFFFFF', fontWeight: 400, margin: '0 0 10px 0' }}>Contract intelligence for Tamil Nadu SMEs</h3>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', margin: '0 0 28px 0', lineHeight: 1.6 }}>Monthly digest — clause guides, industry updates, and case studies.</p>

          {newsletterStatus === 'success' ? (
            <div style={{ color: '#1D9E75', fontSize: 15, fontWeight: 500, background: 'rgba(29,158,117,0.08)', padding: '14px 24px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid rgba(29,158,117,0.2)' }}>
              <Check size={16} /> Subscribed successfully! Thank you.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 420 }}>
                <input
                  type="email" required placeholder="Your email address"
                  value={newsletterEmail} onChange={e => setNewsletterEmail(e.target.value)}
                  style={{ flex: 1, padding: '12px 16px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 14, outline: 'none', background: 'rgba(255,255,255,0.04)', color: '#FFFFFF' }}
                  disabled={newsletterStatus === 'loading'}
                />
                <button type="submit" style={{
                  padding: '12px 22px', background: '#1D9E75', color: '#FFFFFF', border: 'none',
                  borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: 'all 250ms cubic-bezier(0.16,1,0.3,1)',
                  boxShadow: '0 4px 12px rgba(29,158,117,0.25)',
                }} disabled={newsletterStatus === 'loading'}
                  onMouseEnter={e => { e.currentTarget.style.background = '#0F6E56'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(29,158,117,0.4)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#1D9E75'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(29,158,117,0.25)' }}
                >
                  {newsletterStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
              {newsletterStatus === 'error' && (
                <span style={{ color: '#E24B4A', fontSize: 13 }}>{newsletterErrorMsg}</span>
              )}
            </form>
          )}
        </div>
      </section>
    </div>
  )
}