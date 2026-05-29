'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Car, 
  Shirt, 
  Zap, 
  Laptop, 
  Pill, 
  BarChart3, 
  MessageSquare, 
  Edit3, 
  FileText, 
  Calendar, 
  Download, 
  Factory 
} from 'lucide-react'

export default function HomePageClient() {
  const [demoModalOpen, setDemoModalOpen] = useState(false)

  const INDUSTRIES = [
    { name: 'Auto Components · Hosur / Chennai', icon: <Car size={24} style={{ color: '#1D9E75' }} /> },
    { name: 'Garment Exporters · Tiruppur / Erode', icon: <Shirt size={24} style={{ color: '#1D9E75' }} /> },
    { name: 'Electronics SMEs · Sriperumbudur', icon: <Zap size={24} style={{ color: '#1D9E75' }} /> },
    { name: 'IT & Software Services · Chennai', icon: <Laptop size={24} style={{ color: '#1D9E75' }} /> },
    { name: 'Pharma Manufacturers · Coimbatore', icon: <Pill size={24} style={{ color: '#1D9E75' }} /> },
  ]

  const FEATURES = [
    { icon: <BarChart3 size={28} style={{ color: '#1D9E75' }} />, title: 'Clause-by-clause risk scores', desc: 'Every clause rated 1–10. High-risk clauses flagged in red with detailed reasoning — not just a label, but an explanation of exactly what could go wrong.' },
    { icon: <MessageSquare size={28} style={{ color: '#1D9E75' }} />, title: 'Plain-English rewrites', desc: 'Legal language translated into plain English every time. You should never have to Google what a contract clause means.' },
    { icon: <Edit3 size={28} style={{ color: '#1D9E75' }} />, title: 'AI redlining — counter-clause generator', desc: 'For every high-risk clause, Signet AI generates the specific alternative language to propose back.' },
    { icon: <FileText size={28} style={{ color: '#1D9E75' }} />, title: 'Your personal contract playbook', desc: 'Define your non-negotiables once. Every future contract is checked against your playbook automatically.' },
    { icon: <Calendar size={28} style={{ color: '#1D9E75' }} />, title: 'Auto-renewal reminders', desc: 'Signet AI extracts every key date from your contracts and reminds you 30, 60, or 90 days in advance.' },
    { icon: <Download size={28} style={{ color: '#1D9E75' }} />, title: 'Exportable risk reports', desc: 'Every analysis generates a branded PDF report you can share with your team, your bank, or your lawyer.' },
  ]

  const VERTICAL_CARDS = [
    { badge: 'Fastest growing', badgeColor: '#BA7517', icon: <Factory size={32} style={{ color: '#BA7517' }} />, title: 'Auto Component Suppliers', desc: 'Stellantis, Hyundai, Rolls-Royce supply agreements. Structural liability controls.', href: '/verticals/auto-components' },
    { badge: 'India-EU FTA 2026', badgeColor: '#639922', icon: <Shirt size={32} style={{ color: '#639922' }} />, title: 'Garment Exporters', desc: 'UK/EU buyer agreements. Quality audit provisions & currency risk filters.', href: '/verticals/garment-exporters' },
    { badge: 'Popular', badgeColor: '#1D9E75', icon: <Laptop size={32} style={{ color: '#1D9E75' }} />, title: 'IT Businesses & Startups', desc: 'SaaS vendor agreements. Data ownership, indemnity thresholds, and SLA protections.', href: '/verticals/electronics' },
  ]

  const PRICING_PLANS = [
    { name: 'Free', price: 'Rs.0', period: '/ month', features: ['3 analyses/month', 'Basic risk report', 'No export options'], highlighted: false, cta: 'Start free', href: '/login' },
    { name: 'Starter', price: 'Rs.1,999', period: '/ month', features: ['15 analyses/month', 'Full risk report', 'PDF export options', 'Renewal alerts', 'Counter-clauses'], highlighted: true, cta: 'Start 14-day trial', href: '/login?plan=starter' },
    { name: 'Growth', price: 'Rs.4,999', period: '/ month', features: ['50 analyses/month', 'All Starter features', 'Personal playbook', 'Priority analysis support'], highlighted: false, cta: 'Get started', href: '/login?plan=growth' },
  ]

  return (
    <div style={{ background: '#0D1B2A', color: '#FFFFFF', overflow: 'hidden' }}>
      {/* HERO SECTION */}
      <section style={{ minHeight: '92vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        
        {/* Technical Isometric SVG Grid & Radial Glowing Accents */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.15 }}>
            <defs>
              <pattern id="grid-pattern" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
          <div style={{
            position: 'absolute',
            top: '15%',
            right: '10%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(29, 158, 117, 0.18) 0%, transparent 70%)',
            filter: 'blur(80px)',
            borderRadius: '50%'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-10%',
            left: '5%',
            width: '450px',
            height: '450px',
            background: 'radial-gradient(circle, rgba(186, 117, 23, 0.12) 0%, transparent 70%)',
            filter: 'blur(70px)',
            borderRadius: '50%'
          }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-16 items-center w-full" style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px', position: 'relative', zIndex: 1 }}>
          
          {/* Left Text Column */}
          <div style={{ maxWidth: 580 }} className="animate-fade-in-up">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'rgba(29, 158, 117, 0.12)', border: '1px solid rgba(29, 158, 117, 0.25)', borderRadius: 100, fontSize: 12, color: '#1D9E75', fontWeight: 600, marginBottom: 28, boxShadow: '0 0 15px rgba(29, 158, 117, 0.15)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1D9E75', display: 'inline-block' }}></span>
              India-EU FTA 2026 - protect your new export agreements
            </span>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.1] tracking-tight break-words hyphens-auto w-full mb-6 font-display" style={{ color: '#FFFFFF' }}>
              Sign every contract<br />
              <span style={{ fontStyle: 'italic', color: '#1D9E75', textShadow: '0 0 20px rgba(29,158,117,0.1)', fontWeight: 400 }}>knowing exactly</span><br />
              what you are signing.
            </h1>
            <p className="text-lg md:text-xl w-full max-w-full px-4 md:px-0 leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.75)', maxWidth: 500 }}>
              Upload any vendor, buyer, or supplier agreement. Signet AI decodes complex legal parameters into clear English and flags critical liabilities before you sign.
            </p>
            <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)', margin: '0 0 32px 0', lineHeight: 1.4 }}>
              Trusted by leading auto-component developers, garment exporters, and enterprise IT SMEs across Tamil Nadu. Not legal advice.
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', marginBottom: 40 }}>
              <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: '#1D9E75', color: '#FFFFFF', fontSize: 16, fontWeight: 600, borderRadius: 6, textDecoration: 'none', transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: '0 4px 14px rgba(29, 158, 117, 0.3)' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#0F6E56'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(29, 158, 117, 0.45)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#1D9E75'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(29, 158, 117, 0.3)'; e.currentTarget.style.transform = 'translateY(0)' }}>
                Analyse your first contract free
              </Link>
              <button onClick={() => setDemoModalOpen(true)} style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: 14.5, fontWeight: 500, cursor: 'pointer', padding: 0, textDecoration: 'underline', textUnderlineOffset: 4, transition: 'color 200ms' }}
                onMouseEnter={e => e.currentTarget.style.color = '#1D9E75'}
                onMouseLeave={e => e.currentTarget.style.color = '#FFFFFF'}>
                See a sample analysis
              </button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', gap: -8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1D9E75', border: '2px solid #0D1B2A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600 }}>T</div>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#BA7517', border: '2px solid #0D1B2A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, marginLeft: -8 }}>N</div>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#0F6E56', border: '2px solid #0D1B2A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, marginLeft: -8 }}>S</div>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 500 }}>Empowering 200+ Tamil Nadu Industrial SMEs</span>
            </div>
          </div>

          {/* Right Interactive Mockup Card */}
          <div style={{ 
            background: 'rgba(26, 42, 58, 0.4)', 
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)', 
            borderRadius: 16, 
            padding: 28,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            transition: 'all 400ms cubic-bezier(0.16, 1, 0.3, 1)',
          }} 
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-6px) scale(1.01)';
            e.currentTarget.style.borderColor = 'rgba(29, 158, 117, 0.35)';
            e.currentTarget.style.boxShadow = '0 30px 60px rgba(0,0,0,0.4), 0 0 30px rgba(29, 158, 117, 0.1), inset 0 1px 0 rgba(255,255,255,0.15)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
          }}
          className="hidden lg:block">
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ width: 100, height: 130, background: 'rgba(255, 255, 255, 0.03)', borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 11, color: 'rgba(255, 255, 255, 0.45)', transition: 'all 200ms' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Contract.pdf
              </div>
              <div style={{ display: 'flex', alignItems: 'center', color: '#1D9E75', fontSize: 20 }}>&rarr;</div>
              <div style={{ flex: 1 }}>
                <div style={{ background: '#0D1B2A', borderRadius: 10, padding: 16, border: '1px solid rgba(29, 158, 117, 0.25)', boxShadow: '0 0 15px rgba(29, 158, 117, 0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600, letterSpacing: '0.04em' }}>SIGNET AI RISK ENGINE</span>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: 'rgba(226, 75, 74, 0.15)', color: '#E24B4A', fontWeight: 600 }}>7.2 / 10 High Risk</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: 'rgba(226, 75, 74, 0.08)', borderLeft: '3px solid #E24B4A', fontSize: 11.5, color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.4 }}>
                      Unlimited Indemnification <span style={{ color: '#E24B4A', fontWeight: 500 }}>(Section 11)</span>
                    </div>
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: 'rgba(226, 75, 74, 0.08)', borderLeft: '3px solid #E24B4A', fontSize: 11.5, color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.4 }}>
                      Auto-renewal 90 days notice <span style={{ color: '#E24B4A', fontWeight: 500 }}>(Section 14)</span>
                    </div>
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: 'rgba(186, 117, 23, 0.08)', borderLeft: '3px solid #BA7517', fontSize: 11.5, color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.4 }}>
                      Governing law: London courts <span style={{ color: '#BA7517', fontWeight: 500 }}>(Section 22)</span>
                    </div>
                  </div>
                  <div style={{ marginTop: 12, fontSize: 11, color: '#1D9E75', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#1D9E75' }}></span>
                    Teal Counter-Clause Ready
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF SECTION */}
      <section style={{ background: '#09111E', padding: '60px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 14.5, fontWeight: 500, color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '0.04em', textTransform: 'uppercase', margin: '0 0 28px 0' }}>
            Protecting industrial value inside Tamil Nadu's fastest growing sectors
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
            {INDUSTRIES.map((ind, i) => (
              <div key={i} style={{ 
                background: 'rgba(255, 255, 255, 0.02)', 
                border: '1px solid rgba(255, 255, 255, 0.05)', 
                borderRadius: 100, 
                padding: '10px 20px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 10,
                transition: 'all 300ms ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(29, 158, 117, 0.3)';
                e.currentTarget.style.background = 'rgba(29, 158, 117, 0.05)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <span style={{ display: 'inline-flex' }}>{ind.icon}</span>
                <span style={{ fontSize: 13.5, fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>{ind.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THE PROBLEM SECTION */}
      <section style={{ background: '#0D1B2A', padding: '96px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center" style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#1D9E75', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'block' }}>THE LIQUIDITY THREAT</span>
            <h2 style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: 40, lineHeight: 1.2, color: '#FFFFFF', fontWeight: 400, margin: '0 0 24px 0' }}>
              Every contract signed blindly is a ticking corporate liability.
            </h2>
            <p style={{ fontSize: 16.5, lineHeight: 1.7, color: 'rgba(255, 255, 255, 0.7)', margin: '0 0 24px 0' }}>
              Standard supply agreements are customized by buyers' specialized legal counsels. They are designed to transfer 100% of the operational risk, delay fines, and liability onto your SME operations.
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: 'rgba(255, 255, 255, 0.5)', margin: 0 }}>
              Checking agreements page-by-page takes hours or costs exorbitant lawyer fees. Signet AI runs full verification profiles instantly.
            </p>
          </div>
          
          {/* Glowing Metrics Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Card 1 */}
            <div style={{ 
              padding: '24px 28px', 
              borderLeft: '4px solid #E24B4A', 
              borderRadius: 12, 
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderLeftColor: '#E24B4A',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              transition: 'all 300ms ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'rgba(226, 75, 74, 0.3)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(226, 75, 74, 0.15)';
              e.currentTarget.style.background = 'rgba(226, 75, 74, 0.03)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
            }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#E24B4A', lineHeight: 1.1, marginBottom: 6, fontFamily: 'var(--font-display), Georgia, serif' }}>Rs. 18 Lakhs</div>
              <div style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.7)', fontWeight: 500 }}>Average cost of an overlooked auto-renewal or indemnity trap</div>
            </div>

            {/* Card 2 */}
            <div style={{ 
              padding: '24px 28px', 
              borderLeft: '4px solid #BA7517', 
              borderRadius: 12, 
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderLeftColor: '#BA7517',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              transition: 'all 300ms ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'rgba(186, 117, 23, 0.3)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(186, 117, 23, 0.15)';
              e.currentTarget.style.background = 'rgba(186, 117, 23, 0.03)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
            }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#BA7517', lineHeight: 1.1, marginBottom: 6, fontFamily: 'var(--font-display), Georgia, serif' }}>1 in 3</div>
              <div style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.7)', fontWeight: 500 }}>Indian export SME contracts contain critical, highly restrictive clauses</div>
            </div>

            {/* Card 3 */}
            <div style={{ 
              padding: '24px 28px', 
              borderLeft: '4px solid #1D9E75', 
              borderRadius: 12, 
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderLeftColor: '#1D9E75',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              transition: 'all 300ms ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'rgba(29, 158, 117, 0.3)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(29, 158, 117, 0.15)';
              e.currentTarget.style.background = 'rgba(29, 158, 117, 0.03)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
            }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#1D9E75', lineHeight: 1.1, marginBottom: 6, fontFamily: 'var(--font-display), Georgia, serif' }}>60 seconds</div>
              <div style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.7)', fontWeight: 500 }}>Average processing speed for fully detailed plain English report</div>
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section style={{ background: '#09111E', padding: '96px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1D9E75', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'block' }}>THE 3-STEP INTEGRATION</span>
          <h2 style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: 40, lineHeight: 1.2, color: '#FFFFFF', fontWeight: 400, margin: '0 0 56px 0' }}>
            From complex document to clear intelligence.
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            
            {/* Step 1 */}
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.01)', 
              border: '1px solid rgba(255, 255, 255, 0.04)', 
              borderRadius: 16, 
              padding: '36px 24px',
              transition: 'all 300ms ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(29, 158, 117, 0.2)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.04)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{ width: 50, height: 50, borderRadius: 12, background: 'rgba(29, 158, 117, 0.1)', color: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, margin: '0 auto 24px' }}>1</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#FFFFFF', margin: '0 0 12px 0' }}>Secure Upload</h3>
              <p style={{ fontSize: 14.5, color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.6, margin: 0 }}>
                Drop PDF or Word files. Encrypted client-side with bank-grade security protocols.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.01)', 
              border: '1px solid rgba(255, 255, 255, 0.04)', 
              borderRadius: 16, 
              padding: '36px 24px',
              transition: 'all 300ms ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(29, 158, 117, 0.2)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.04)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{ width: 50, height: 50, borderRadius: 12, background: 'rgba(29, 158, 117, 0.1)', color: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, margin: '0 auto 24px' }}>2</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#FFFFFF', margin: '0 0 12px 0' }}>AI Clause Analysis</h3>
              <p style={{ fontSize: 14.5, color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.6, margin: 0 }}>
                Signet risk compiler parses terms, constructs risk parameters, and maps simple translations.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.01)', 
              border: '1px solid rgba(255, 255, 255, 0.04)', 
              borderRadius: 16, 
              padding: '36px 24px',
              transition: 'all 300ms ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(29, 158, 117, 0.2)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.04)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{ width: 50, height: 50, borderRadius: 12, background: 'rgba(29, 158, 117, 0.1)', color: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, margin: '0 auto 24px' }}>3</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#FFFFFF', margin: '0 0 12px 0' }}>Review & Edit</h3>
              <p style={{ fontSize: 14.5, color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.6, margin: 0 }}>
                Review interactive scores, generate redline backups, and export legal-ready PDFs.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CORE FEATURES SECTION (Glassmorphism Overhaul) */}
      <section style={{ background: '#0D1B2A', padding: '96px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1D9E75', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'block' }}>PRODUCT FEATURES</span>
          <h2 style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: 40, lineHeight: 1.2, color: '#FFFFFF', fontWeight: 400, margin: '0 0 52px 0' }}>
            Everything you need to negotiate with complete confidence.
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 text-left">
            {FEATURES.map((feat, i) => (
              <div key={i} style={{ 
                padding: '28px', 
                borderRadius: 16, 
                background: 'rgba(255, 255, 255, 0.02)', 
                border: '1px solid rgba(255, 255, 255, 0.06)',
                transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.borderColor = 'rgba(29, 158, 117, 0.3)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(29, 158, 117, 0.12), inset 0 1px 0 rgba(255,255,255,0.05)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
              }}>
                <span style={{ display: 'inline-flex', marginBottom: 16 }}>{feat.icon}</span>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#FFFFFF', margin: '0 0 10px 0' }}>{feat.title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.6, margin: 0 }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INDUSTRIAL VERTICAL CARDS (Glassmorphism Overhaul) */}
      <section style={{ background: '#09111E', padding: '96px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1D9E75', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'block' }}>TAILORED LOGIC PROFILES</span>
          <h2 style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: 36, color: '#FFFFFF', fontWeight: 400, margin: '0 0 48px 0' }}>
            Built specifically for Tamil Nadu's export powerhouses.
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-7">
            {VERTICAL_CARDS.map((card, i) => (
              <Link key={i} href={card.href} style={{ 
                textDecoration: 'none', 
                background: 'rgba(255, 255, 255, 0.02)', 
                border: '1px solid rgba(255, 255, 255, 0.06)', 
                borderRadius: 16, 
                padding: '36px 28px', 
                textAlign: 'left', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 16, 
                transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                position: 'relative'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.borderColor = 'rgba(29, 158, 117, 0.3)';
                e.currentTarget.style.boxShadow = '0 16px 36px rgba(29, 158, 117, 0.12), inset 0 1px 0 rgba(255,255,255,0.05)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
              }}>
                {card.badge && (
                  <span style={{ 
                    alignSelf: 'flex-start', 
                    fontSize: 11, 
                    fontWeight: 600, 
                    padding: '3px 10px', 
                    borderRadius: 100, 
                    background: card.badgeColor + '18', 
                    color: card.badgeColor,
                    border: `1px solid ${card.badgeColor}35`
                  }}>
                    {card.badge}
                  </span>
                )}
                <span style={{ display: 'inline-flex', marginBottom: 4 }}>{card.icon}</span>
                <h3 style={{ fontSize: 19, fontWeight: 600, color: '#FFFFFF', margin: 0 }}>{card.title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, margin: 0 }}>{card.desc}</p>
                <span style={{ fontSize: 13.5, color: '#1D9E75', fontWeight: 600, marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Open logic specification &rarr;
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING PLANS (Equal-Height Grid Overhaul) */}
      <section style={{ background: '#0D1B2A', padding: '96px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1D9E75', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'block' }}>FLEXIBLE SUBSCRIPTIONS</span>
          <h2 style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: 40, color: '#FFFFFF', fontWeight: 400, margin: '0 0 12px 0' }}>
            Start free. Scale when you scale.
          </h2>
          <p style={{ fontSize: 16.5, color: 'rgba(255,255,255,0.5)', marginBottom: 56 }}>
            Include 3 free contract analyses every month. Zero credit card or verification hoops required.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
            {PRICING_PLANS.map((plan, i) => (
              <div key={i} style={{ 
                background: 'rgba(255, 255, 255, 0.02)', 
                borderRadius: 16, 
                padding: '40px 32px', 
                textAlign: 'left', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 20, 
                border: plan.highlighted ? '2px solid #1D9E75' : '1px solid rgba(255, 255, 255, 0.08)', 
                boxShadow: plan.highlighted ? '0 12px 30px rgba(29, 158, 117, 0.15)' : '0 4px 20px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                transition: 'all 300ms ease',
                flex: '1 1 280px',
                maxWidth: '340px'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                if (plan.highlighted) {
                  e.currentTarget.style.boxShadow = '0 16px 40px rgba(29, 158, 117, 0.25)';
                } else {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.2)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                if (plan.highlighted) {
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(29, 158, 117, 0.15)';
                } else {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                }
              }}>
                {plan.highlighted && (
                  <span style={{ 
                    position: 'absolute', 
                    top: -12, 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    background: '#1D9E75', 
                    color: '#FFFFFF', 
                    fontSize: 11, 
                    fontWeight: 700, 
                    padding: '4px 16px', 
                    borderRadius: 100,
                    letterSpacing: '0.04em',
                    boxShadow: '0 4px 10px rgba(29, 158, 117, 0.3)'
                  }}>
                    MOST POPULAR
                  </span>
                )}
                <h3 style={{ fontSize: 22, fontWeight: 600, color: '#FFFFFF', margin: 0 }}>{plan.name}</h3>
                <div>
                  <span style={{ fontSize: 36, fontWeight: 700, color: '#FFFFFF' }}>{plan.price}</span>
                  <span style={{ fontSize: 14.5, color: 'rgba(255, 255, 255, 0.5)', marginLeft: 4 }}>{plan.period}</span>
                </div>
                
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {plan.features.map((feat, j) => (
                    <li key={j} style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.75)', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ color: '#1D9E75', display: 'inline-flex' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      </span> 
                      {feat}
                    </li>
                  ))}
                </ul>
                
                <Link href={plan.href} style={{ 
                  display: 'block', 
                  textAlign: 'center', 
                  padding: '14px', 
                  borderRadius: 6, 
                  fontSize: 14.5, 
                  fontWeight: 600, 
                  textDecoration: 'none', 
                  background: plan.highlighted ? '#1D9E75' : 'transparent', 
                  color: '#FFFFFF', 
                  border: plan.highlighted ? 'none' : '1px solid rgba(255, 255, 255, 0.15)', 
                  marginTop: 'auto',
                  transition: 'all 200ms ease'
                }}
                onMouseEnter={e => {
                  if (plan.highlighted) e.currentTarget.style.background = '#0F6E56';
                  else e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
                onMouseLeave={e => {
                  if (plan.highlighted) e.currentTarget.style.background = '#1D9E75';
                  else e.currentTarget.style.background = 'transparent';
                }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LAWYER PARTNER SECTION (Premium Ambient Box) */}
      <section style={{ background: '#09111E', padding: '72px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: '48px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 48, flexWrap: 'wrap', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#BA7517', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>FOR TAMIL NADU ADVOCATES</span>
            <h3 style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: 26, lineHeight: 1.3, color: '#FFFFFF', fontWeight: 400, margin: '0 0 12px 0' }}>
              Partner with Signet AI. Link with pre-screened SME accounts.
            </h3>
            <p style={{ fontSize: 15, color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.6, margin: 0 }}>
              Connect with local corporate clients automatically through our dedicated lawyer directory.
            </p>
          </div>
          <div style={{ flexShrink: 0 }}>
            <Link href="/partners/lawyers" style={{ display: 'inline-flex', padding: '14px 28px', background: '#1D9E75', color: '#FFFFFF', fontSize: 14.5, fontWeight: 600, borderRadius: 6, textDecoration: 'none', transition: 'all 200ms ease' }}
              onMouseEnter={e => e.currentTarget.style.background = '#0F6E56'}
              onMouseLeave={e => e.currentTarget.style.background = '#1D9E75'}>
              Apply as a legal partner
            </Link>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION SECTION */}
      <section style={{ background: '#0D1B2A', padding: '96px 24px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(29, 158, 117, 0.08) 0%, transparent 60%)', pointerEvents: 'none' }}></div>
        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: 44, lineHeight: 1.2, color: '#FFFFFF', fontWeight: 400, margin: '0 0 20px 0' }}>
            Protect your next supply agreement today.
          </h2>
          <p style={{ fontSize: 19, color: 'rgba(255, 255, 255, 0.7)', margin: '0 0 40px 0', lineHeight: 1.5 }}>
            Upload. Inspect. Renegotiate terms. Achieve true peace of mind.
          </p>
          
          <Link href="/login" style={{ display: 'inline-flex', gap: 10, padding: '16px 36px', height: 56, background: '#1D9E75', color: '#FFFFFF', fontSize: 17, fontWeight: 600, borderRadius: 6, textDecoration: 'none', transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: '0 4px 14px rgba(29, 158, 117, 0.3)' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#0F6E56'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(29, 158, 117, 0.45)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#1D9E75'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(29, 158, 117, 0.3)'; e.currentTarget.style.transform = 'translateY(0)' }}>
            Analyse your first contract free
          </Link>
          <p style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.45)', marginTop: 24 }}>
            Includes 3 free contract analyses every month. No credit cards required.
          </p>
        </div>
      </section>

      {/* SAMPLE DEMO MODAL */}
      {demoModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(13, 27, 42, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setDemoModalOpen(false)}>
          <div style={{ maxWidth: 640, width: '100%', background: '#132233', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 16, padding: 36, boxShadow: '0 24px 50px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: 24, color: '#FFFFFF', fontWeight: 400, margin: 0 }}>Sample Signet AI Analysis</h3>
              <button onClick={() => setDemoModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255, 255, 255, 0.5)', fontSize: 18 }}
                onMouseEnter={e => e.currentTarget.style.color = '#FFFFFF'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'}>X</button>
            </div>
            
            <p style={{ fontSize: 14.5, color: 'rgba(255, 255, 255, 0.7)', marginBottom: 24, lineHeight: 1.6 }}>
              This is a preview of the detailed, actionable intelligence that Signet AI automatically compiles for your corporate playbook:
            </p>
            
            <div style={{ background: '#0D1B2A', borderRadius: 12, padding: 20, border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF' }}>Document Risk Summary</span>
                <span style={{ fontSize: 13, padding: '3px 10px', borderRadius: 100, background: 'rgba(226, 75, 74, 0.15)', color: '#E24B4A', fontWeight: 700 }}>High Risk (7.2/10)</span>
              </div>
              
              <div>
                <h4 style={{ fontSize: 14, color: '#BA7517', fontWeight: 600, margin: '0 0 6px 0' }}>Governing Law: London Courts (Section 22)</h4>
                <p style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.5, margin: 0 }}>
                  If a dispute arises, you must litigate in the UK, which is financially prohibitive for Tamil Nadu SMEs. Recommended counter-clause: "Governing law shall be the Courts of Chennai, India."
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}