'use client'

import { useState, useMemo } from 'react'
import { Scale, GraduationCap, X, Check, Star } from 'lucide-react'

interface Advocate {
  id: string
  name: string
  title: string
  firm: string
  city: string
  experience: number
  rating: number
  education: string
  description: string
  practiceAreas: string[]
  tags: string[]
  email: string
  initials: string
}

const VERIFIED_ADVOCATES: Advocate[] = [
  {
    id: 'adv_sridhar',
    name: 'Sridhar Ramaswamy',
    title: 'Senior Advocate',
    firm: 'Ramaswamy & Partners',
    city: 'Chennai',
    experience: 24,
    rating: 4.9,
    education: 'NLSIU Bangalore (LL.B), Columbia Law School (LL.M)',
    description: 'Specializes in international trade laws, cross-border FTA regulatory compliance, and high-value B2B commercial arbitration. Frequently acts as lead counsel for major Tamil Nadu textile and software exporters.',
    practiceAreas: ['Commercial Disputes', 'FTA & Export Compliance'],
    tags: ['FTA Audits', 'International Arbitration', 'Customs Disputes'],
    email: 'sridhar.r@ramaswamypartners.in',
    initials: 'SR'
  },
  {
    id: 'adv_suresh',
    name: 'Suresh Kumar',
    title: 'Managing Partner',
    firm: 'Kovai Legal Associates',
    city: 'Coimbatore',
    experience: 18,
    rating: 4.8,
    education: 'Madras Law College',
    description: 'Focuses on domestic supply agreements, manufacturing joint ventures, equipment leases, and domestic commercial arbitration. Strongly anchored in the Coimbatore and Tiruppur industrial manufacturing belts.',
    practiceAreas: ['Commercial Disputes', 'General Corporate'],
    tags: ['OEM Contracts', 'Joint Ventures', 'Dispute Resolution'],
    email: 'suresh@kovailegal.in',
    initials: 'SK'
  },
  {
    id: 'adv_anjali',
    name: 'Anjali Nair',
    title: 'Lead IP Attorney',
    firm: 'IP Shield Law Chambers',
    city: 'Chennai',
    experience: 12,
    rating: 4.7,
    education: 'ILS Law College, Pune',
    description: 'Expert in patent filing strategies, copyright prosecution, technology transfer agreements, software licensing disputes, and general SaaS B2B commercial agreements.',
    practiceAreas: ['IP & Tech Licensing', 'General Corporate'],
    tags: ['SaaS Contracts', 'Patent Filings', 'GDPR / Privacy'],
    email: 'anjali.nair@ipshield.in',
    initials: 'AN'
  },
  {
    id: 'adv_karthik',
    name: 'Karthik Sundaram',
    title: 'Senior Corporate Advisor',
    firm: 'Sundaram Corporate Chambers',
    city: 'Madurai',
    experience: 20,
    rating: 4.9,
    education: 'National Law University, Jodhpur',
    description: 'Advises high-growth mid-market enterprises on mergers & acquisitions, growth-equity funding contracts, labor compliance, and structured commercial restructurings in southern Tamil Nadu.',
    practiceAreas: ['General Corporate', 'FTA & Export Compliance'],
    tags: ['M&A Contracts', 'Venture Capital', 'Labor Disputes'],
    email: 'k.sundaram@sundaramcorp.com',
    initials: 'KS'
  }
]

export default function ReferralsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPractice, setSelectedPractice] = useState('All')
  const [selectedCity, setSelectedCity] = useState('All')
  const [selectedExp, setSelectedExp] = useState('All')

  // Lead inquiry modal state
  const [activeAdvocate, setActiveAdvocate] = useState<Advocate | null>(null)
  const [inquiryName, setInquiryName] = useState('')
  const [inquiryEmail, setInquiryEmail] = useState('')
  const [inquiryMessage, setInquiryMessage] = useState('')
  const [submittingLead, setSubmittingLead] = useState(false)
  const [submittedLead, setSubmittedLead] = useState(false)

  // Filter processing
  const filteredAdvocates = useMemo(() => {
    return VERIFIED_ADVOCATES.filter(adv => {
      const matchesSearch = 
        adv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        adv.firm.toLowerCase().includes(searchQuery.toLowerCase()) ||
        adv.education.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesPractice = 
        selectedPractice === 'All' || 
        adv.practiceAreas.includes(selectedPractice)

      const matchesCity = 
        selectedCity === 'All' || 
        adv.city === selectedCity

      let matchesExp = true
      if (selectedExp === '10') {
        matchesExp = adv.experience >= 10
      } else if (selectedExp === '20') {
        matchesExp = adv.experience >= 20
      }

      return matchesSearch && matchesPractice && matchesCity && matchesExp
    })
  }, [searchQuery, selectedPractice, selectedCity, selectedExp])

  const handleConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeAdvocate || !inquiryName || !inquiryEmail || !inquiryMessage) return

    try {
      setSubmittingLead(true)
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inquiryName,
          email: inquiryEmail,
          company: 'SME Referral',
          role: 'Business owner / SME',
          subject: `Advocate Connection Request: ${activeAdvocate.name}`,
          message: `Referral Connection Request for ${activeAdvocate.name} (${activeAdvocate.firm}).\n\nUser Message: ${inquiryMessage}`,
          newsletter: false
        })
      })

      if (res.ok) {
        setSubmittedLead(true)
      }
    } catch (err) {
      console.error('Error submitting connection lead:', err)
    } finally {
      setSubmittingLead(false)
    }
  }

  const handleCloseModal = () => {
    setActiveAdvocate(null)
    setInquiryName('')
    setInquiryEmail('')
    setInquiryMessage('')
    setSubmittedLead(false)
  }

  return (
    <div style={{ maxWidth: '100%', padding: '32px 40px', color: '#E2E8F0' }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 className="font-display" style={{ fontSize: 30, color: '#fff', margin: '0 0 6px 0', fontWeight: 400, fontFamily: 'var(--font-display), serif' }}>
          Legal Partners Network
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
          Connect with pre-screened, high-caliber Tamil Nadu advocates specializing in SME commercial agreements.
        </p>
      </div>

      {/* Filter and Search Bar Row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8, padding: '8px 14px', flex: 1, minWidth: 240
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search by advocate name, firm, or credentials..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, color: '#fff', width: '100%' }}
          />
        </div>

        {/* Practice Areas */}
        <select
          value={selectedPractice}
          onChange={e => setSelectedPractice(e.target.value)}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#fff', outline: 'none', cursor: 'pointer'
          }}
        >
          <option value="All" style={{ background: '#0D1B2A' }}>All Practice Areas</option>
          <option value="Commercial Disputes" style={{ background: '#0D1B2A' }}>Commercial Disputes</option>
          <option value="IP & Tech Licensing" style={{ background: '#0D1B2A' }}>IP & Tech Licensing</option>
          <option value="FTA & Export Compliance" style={{ background: '#0D1B2A' }}>FTA & Export Compliance</option>
          <option value="General Corporate" style={{ background: '#0D1B2A' }}>General Corporate</option>
        </select>

        {/* City Filter */}
        <select
          value={selectedCity}
          onChange={e => setSelectedCity(e.target.value)}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#fff', outline: 'none', cursor: 'pointer'
          }}
        >
          <option value="All" style={{ background: '#0D1B2A' }}>All Cities</option>
          <option value="Chennai" style={{ background: '#0D1B2A' }}>Chennai</option>
          <option value="Coimbatore" style={{ background: '#0D1B2A' }}>Coimbatore</option>
          <option value="Madurai" style={{ background: '#0D1B2A' }}>Madurai</option>
        </select>

        {/* Experience Level */}
        <select
          value={selectedExp}
          onChange={e => setSelectedExp(e.target.value)}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#fff', outline: 'none', cursor: 'pointer'
          }}
        >
          <option value="All" style={{ background: '#0D1B2A' }}>All Experience Levels</option>
          <option value="10" style={{ background: '#0D1B2A' }}>10+ Years Experience</option>
          <option value="20" style={{ background: '#0D1B2A' }}>20+ Years Experience</option>
        </select>
      </div>

      {/* Advocates Grid */}
      {filteredAdvocates.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 24px',
          background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, textAlign: 'center'
        }}>
          <span style={{ color: 'var(--text-muted)', marginBottom: 16, display: 'inline-flex', alignItems: 'center' }}>
            <Scale size={40} />
          </span>
          <h3 style={{ fontSize: 16, color: '#fff', fontWeight: 600, margin: '0 0 6px 0' }}>No verified advocates match your criteria</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            Try expanding or modifying your filters.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))',
          gap: 24
        }}>
          {filteredAdvocates.map(adv => (
            <div
              key={adv.id}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16, padding: 24,
                display: 'flex', flexDirection: 'column',
                transition: 'all 200ms ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.borderColor = 'rgba(29, 158, 117, 0.3)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
              }}
            >
              {/* Profile Header */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'center' }}>
                <div style={{
                  width: 50, height: 50, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1D9E75, #0D1B2A)',
                  display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 16, fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(29, 158, 117, 0.2)'
                }}>
                  {adv.initials}
                </div>
                <div>
                  <h3 style={{ fontSize: 16, color: '#fff', fontWeight: 600, margin: '0 0 2px 0' }}>
                    {adv.name}
                  </h3>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                    <span>{adv.title}</span>
                    <span>•</span>
                    <span style={{ color: 'var(--teal)', fontWeight: 600 }}>{adv.firm}</span>
                  </div>
                </div>
                {/* Score Rating */}
                <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#BA7517', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Star size={13} fill="#BA7517" style={{ stroke: 'none' }} /> {adv.rating}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{adv.experience} Years Exp</span>
                </div>
              </div>

              {/* Bio details */}
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: '1.5', margin: '0 0 16px 0', flex: 1 }}>
                {adv.description}
              </p>

              {/* Credentials / Education */}
              <div style={{ display: 'flex', gap: 6, fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, alignItems: 'center' }}>
                <GraduationCap size={14} />
                <span style={{ fontStyle: 'italic' }}>{adv.education}</span>
              </div>

              {/* Specialized Tag Badges */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                {adv.tags.map(tag => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 10, fontWeight: 600, color: 'var(--teal)',
                      background: 'rgba(29, 158, 117, 0.1)',
                      padding: '3px 8px', borderRadius: 100, border: '1px solid rgba(29, 158, 117, 0.15)'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Quick Connect CTA */}
              <button
                onClick={() => setActiveAdvocate(adv)}
                className="btn-primary"
                style={{
                  width: '100%', padding: '10px', fontSize: 13, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}
              >
                Request Consultation Connection
              </button>
            </div>
          ))}
        </div>
      )}

      {/* GLASSMORPHIC CONNECT DIALOG MODAL */}
      {activeAdvocate && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(13, 27, 42, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 24
        }}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#0D1B2A',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 16,
              padding: 32,
              width: '100%',
              maxWidth: 480,
              boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 18, color: '#fff', fontWeight: 600, margin: 0 }}>
                  Connect with {activeAdvocate.name}
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Signet AI will share your request details securely with the advocate.
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                style={{ background: 'none', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
              >
                <X size={18} />
              </button>
            </div>

            {submittedLead ? (
              <div style={{ textAlign: 'center', padding: '24px 12px' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'rgba(29, 158, 117, 0.1)', color: 'var(--teal)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <Check size={24} />
                </div>
                <h4 style={{ fontSize: 16, color: '#fff', fontWeight: 600, margin: '0 0 8px 0' }}>Request Submitted!</h4>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 24px 0' }}>
                  The advocate will be notified of your request, and their team will get in touch with you at the provided email address shortly.
                </p>
                <button
                  onClick={handleCloseModal}
                  className="btn-primary"
                  style={{ padding: '8px 24px', fontSize: 13 }}
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleConnectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Advocate Summary Box */}
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 10, padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: 12
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: '#1D9E75', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700
                  }}>
                    {activeAdvocate.initials}
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#fff' }}>
                      {activeAdvocate.name}
                    </span>
                    <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)' }}>
                      {activeAdvocate.firm} • {activeAdvocate.city}
                    </span>
                  </div>
                </div>

                {/* Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={inquiryName}
                    onChange={e => setInquiryName(e.target.value)}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 8, padding: '10px 12px',
                      fontSize: 13, color: '#fff', outline: 'none'
                    }}
                  />
                </div>

                {/* Email */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>Your Email</label>
                  <input
                    type="email"
                    required
                    placeholder="Enter your contact email"
                    value={inquiryEmail}
                    onChange={e => setInquiryEmail(e.target.value)}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 8, padding: '10px 12px',
                      fontSize: 13, color: '#fff', outline: 'none'
                    }}
                  />
                </div>

                {/* Message */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>Brief Description of Legal Need</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Please mention what contract or clause you need assistance with..."
                    value={inquiryMessage}
                    onChange={e => setInquiryMessage(e.target.value)}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 8, padding: '10px 12px',
                      fontSize: 13, color: '#fff', outline: 'none',
                      resize: 'none'
                    }}
                  />
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    style={{
                      flex: 1, padding: '10px 16px', background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
                      color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 500
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingLead}
                    className="btn-primary"
                    style={{
                      flex: 1, padding: '10px 16px',
                      fontSize: 13, fontWeight: 600,
                    }}
                  >
                    {submittingLead ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
