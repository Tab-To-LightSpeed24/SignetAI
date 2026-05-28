'use client'

import React, { useState, useEffect } from 'react'
import { X, Mail, CheckCircle2, Loader2 } from 'lucide-react'

export default function GlobalWaitlistModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      if (link) {
        const href = link.getAttribute('href')
        if (href === '/verticals/electronics' || href === '/verticals/garment-exporters') {
          e.preventDefault()
          setIsOpen(true)
          setStatus('idle')
          setEmail('')
        }
      }
    }

    document.addEventListener('click', handleGlobalClick, true)
    return () => document.removeEventListener('click', handleGlobalClick, true)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')
    
    // Simulate 1-second legal engineering pipeline ingestion waitlist signup
    setTimeout(() => {
      setStatus('success')
      setToastMessage('Added to waitlist!')
      
      // Clear toast and close modal after 1.5s
      setTimeout(() => {
        setIsOpen(false)
        setToastMessage(null)
      }, 1500)
    }, 1000)
  }

  if (!isOpen) return null

  return (
    <>
      {/* ─── Backdrop (Glass Blur Overlay) ─── */}
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(7, 14, 23, 0.65)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          animation: 'fadeInUp 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
        onClick={() => status !== 'loading' && setIsOpen(false)}
      >
        {/* ─── Modal Dialog ─── */}
        <div 
          style={{
            width: '100%',
            maxWidth: 480,
            background: 'linear-gradient(135deg, rgba(26,42,58,0.75) 0%, rgba(13,27,42,0.9) 100%)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 16,
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            padding: '36px 32px',
            position: 'relative',
            color: '#E2E8F0',
            fontFamily: 'var(--font-body), system-ui, -apple-system, sans-serif',
            animation: 'fadeInUp 350ms cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button 
            onClick={() => setIsOpen(false)}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              transition: 'all 200ms'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#fff'
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
            }}
          >
            <X size={16} />
          </button>

          {status === 'success' ? (
            /* ─── Success Animation Frame ─── */
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ display: 'inline-flex', color: '#1D9E75', marginBottom: 20 }}>
                <CheckCircle2 size={56} style={{ animation: 'fadeInUp 300ms ease' }} />
              </div>
              <h3 style={{ fontSize: 22, color: '#fff', fontWeight: 500, margin: '0 0 10px', fontFamily: 'var(--font-display), Georgia, serif' }}>
                You're on the list!
              </h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.5 }}>
                We've reserved your slot. You will be notified the absolute millisecond this pipeline is deploy-ready.
              </p>
            </div>
          ) : (
            /* ─── Active Sign-up Form ─── */
            <>
              {/* Icon / Accent Header */}
              <div style={{
                display: 'inline-flex',
                background: 'rgba(29, 158, 117, 0.1)',
                border: '1px solid rgba(29, 158, 117, 0.2)',
                color: '#1D9E75',
                padding: 12,
                borderRadius: 12,
                marginBottom: 20
              }}>
                <Mail size={24} />
              </div>

              {/* Title & Description */}
              <h2 className="font-display" style={{
                fontSize: 22,
                fontWeight: 400,
                color: '#fff',
                margin: '0 0 12px 0',
                fontFamily: 'var(--font-display), Georgia, serif',
                letterSpacing: '-0.01em',
                lineHeight: 1.3
              }}>
                Scaling Signet AI's Compliance Engine
              </h2>
              <p style={{
                fontSize: 14.5,
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.65)',
                margin: '0 0 28px 0'
              }}>
                Our legal engineering team is actively training the model context for your industry. Drop your work email below to get notified the second this ingestion pipeline drops.
              </p>

              {/* Submission Form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === 'loading'}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: 'rgba(0,0,0,0.25)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 8,
                      color: '#fff',
                      fontSize: 14.5,
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 200ms ease'
                    }}
                    onFocus={e => e.target.style.borderColor = '#1D9E75'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={status === 'loading'}
                  style={{
                    background: '#1D9E75',
                    color: '#fff',
                    padding: '14px 20px',
                    borderRadius: 8,
                    border: 'none',
                    fontSize: 14.5,
                    fontWeight: 600,
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    boxShadow: '0 4px 12px rgba(29,158,117,0.25)',
                    transition: 'all 250ms'
                  }}
                  onMouseEnter={e => {
                    if (status !== 'loading') {
                      e.currentTarget.style.background = '#0F6E56'
                      e.currentTarget.style.boxShadow = '0 6px 18px rgba(29,158,117,0.35)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (status !== 'loading') {
                      e.currentTarget.style.background = '#1D9E75'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(29,158,117,0.25)'
                    }
                  }}
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      Securing Spot...
                    </>
                  ) : (
                    'Join the Waitlist'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* ─── Sleek Toast Notification Overlay ─── */}
      {toastMessage && (
        <div 
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 10000,
            background: 'rgba(29,158,117,0.1)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid #1D9E75',
            borderRadius: '8px',
            color: '#1D9E75',
            padding: '12px 20px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            fontSize: 13,
            fontWeight: 500,
            animation: 'fadeInUp 200ms ease'
          }}
        >
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  )
}
