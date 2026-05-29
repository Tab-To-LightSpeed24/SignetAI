'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const NAV_LINKS = [
  { label: 'How It Works', href: '/how-it-works' },
  {
    label: 'Verticals',
    dropdown: true,
    items: [
      { label: 'Auto Component Suppliers', href: '/verticals/auto-components' },
      { label: 'Garment Exporters', href: '/verticals/garment-exporters' },
      { label: 'Electronics SMEs', href: '/verticals/electronics' },
      { label: 'See all industries →', href: '/how-it-works#industries', divider: true },
    ],
  },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Resources', href: '/resources' },
]

export default function PublicNavbar() {
  const [visible, setVisible] = useState(true)
  const [atTop, setAtTop] = useState(true)
  const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY
      const isAtTop = currentY < 10

      setAtTop(isAtTop)

      // If mobile menu is open, do not hide navbar on scroll
      if (mobileMenuOpen) {
        setVisible(true)
        return
      }

      if (currentY > lastScrollY.current && currentY > 80) {
        // Scrolling down — hide
        setVisible(false)
      } else {
        // Scrolling up — show
        setVisible(true)
      }
      lastScrollY.current = currentY
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [mobileMenuOpen])

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: 64,
          // Solid background if mobile menu is open
          background: (atTop && !mobileMenuOpen) ? 'transparent' : 'rgba(13, 27, 42, 0.95)',
          backdropFilter: (atTop && !mobileMenuOpen) ? 'none' : 'blur(20px)',
          WebkitBackdropFilter: (atTop && !mobileMenuOpen) ? 'none' : 'blur(20px)',
          borderBottom: (atTop && !mobileMenuOpen) ? '1px solid transparent' : '1px solid rgba(255,255,255,0.06)',
          // Slide out on scroll-down, slide back in on scroll-up
          transform: visible ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 350ms cubic-bezier(0.16,1,0.3,1), background 300ms ease, border-color 300ms ease, backdrop-filter 300ms ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
        }}
      >
        {/* ── Logo ── */}
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ color: '#1D9E75' }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 15l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: 22, color: '#FFFFFF', fontWeight: 400, fontFamily: 'var(--font-display), Georgia, serif', letterSpacing: '-0.01em' }}>
            Signet AI
          </span>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden md:flex" style={{ alignItems: 'center', gap: 4, margin: '0 16px' }}>
          {NAV_LINKS.map((link) => {
            if (link.dropdown) {
              return (
                <div
                  key={link.label}
                  style={{ position: 'relative' }}
                  onMouseEnter={() => setHoveredDropdown(link.label)}
                  onMouseLeave={() => setHoveredDropdown(null)}
                >
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '8px 14px',
                      fontSize: 14,
                      fontWeight: 500,
                      color: 'rgba(255,255,255,0.8)',
                      cursor: 'pointer',
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    {link.label}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {hoveredDropdown === link.label && (
                    <div
                      ref={dropdownRef}
                      style={{
                        position: 'absolute',
                        top: 40,
                        left: 0,
                        minWidth: 220,
                        background: 'rgba(13,27,42,0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 10,
                        boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                        padding: '6px 0',
                        zIndex: 200,
                        animation: 'navDropIn 150ms ease-out',
                      }}
                    >
                      {link.items?.map((item, i) =>
                        item.divider ? (
                          <div key={i}>
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '4px 0' }} />
                            <Link
                              href={item.href}
                              style={{ display: 'block', padding: '8px 16px', fontSize: 13, color: '#1D9E75', fontWeight: 500, textDecoration: 'none', transition: 'background 150ms' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              {item.label}
                            </Link>
                          </div>
                        ) : (
                          <Link
                            key={i}
                            href={item.href}
                            style={{ display: 'block', padding: '8px 16px', fontSize: 13, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', transition: 'background 150ms' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#FFFFFF' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)' }}
                          >
                            {item.label}
                          </Link>
                        )
                      )}
                    </div>
                  )}
                </div>
              )
            }
            return (
              <Link
                key={link.label}
                href={link.href!}
                style={{
                  padding: '8px 14px',
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.8)',
                  textDecoration: 'none',
                  borderRadius: 6,
                }}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* ── Desktop Right Side CTAs ── */}
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <Link
            href="/login"
            className="nav-link-btn"
            style={{
              padding: '8px 16px',
              fontSize: 14,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.8)',
              textDecoration: 'none',
              borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.12)',
              transition: 'all 250ms cubic-bezier(0.16,1,0.3,1)',
              display: 'inline-block',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#FFFFFF'
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
            }}
          >
            Log in
          </Link>
          <Link
            href="/login"
            style={{
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              color: '#FFFFFF',
              background: '#1D9E75',
              border: 'none',
              borderRadius: 6,
              textDecoration: 'none',
              transition: 'all 300ms cubic-bezier(0.16,1,0.3,1)',
              boxShadow: '0 4px 12px rgba(29,158,117,0.25)',
              display: 'inline-block',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#0F6E56'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(29,158,117,0.45)'
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#1D9E75'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(29,158,117,0.25)'
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
            }}
          >
            Start free — 3 contracts
          </Link>
        </div>

        {/* ── Mobile Hamburger Toggle Button ── */}
        <button
          onClick={() => setMobileMenuOpen(prev => !prev)}
          className="flex md:hidden items-center justify-center"
          aria-label="Toggle navigation menu"
          style={{
            background: 'none',
            border: 'none',
            color: '#FFFFFF',
            cursor: 'pointer',
            padding: 8,
            borderRadius: 6,
            transition: 'background 200ms',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          {mobileMenuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </header>

      {/* ── Mobile Menu Overlay ── */}
      {mobileMenuOpen && (
        <div
          className="md:hidden animate-fadeIn"
          style={{
            position: 'fixed',
            top: 64,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(9, 17, 30, 0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            zIndex: 99,
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            overflowY: 'auto',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Mobile Navigation Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {NAV_LINKS.map((link) => {
              if (link.dropdown) {
                return (
                  <div key={link.label} style={{ display: 'flex', flexDirection: 'column' }}>
                    <button
                      onClick={() => setMobileDropdownOpen(prev => !prev)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '12px 8px',
                        fontSize: 16,
                        fontWeight: 500,
                        color: 'rgba(255,255,255,0.9)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        textAlign: 'left',
                      }}
                    >
                      <span>{link.label}</span>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        style={{
                          transform: mobileDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 200ms ease',
                        }}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    {mobileDropdownOpen && (
                      <div
                        style={{
                          paddingLeft: 16,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4,
                          borderLeft: '1px solid rgba(255,255,255,0.1)',
                          marginLeft: 8,
                          marginTop: 4,
                          marginBottom: 8,
                        }}
                      >
                        {link.items?.map((item, i) =>
                          item.divider ? (
                            <Link
                              key={i}
                              href={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                              style={{
                                display: 'block',
                                padding: '8px 0',
                                fontSize: 14,
                                color: '#1D9E75',
                                fontWeight: 500,
                                textDecoration: 'none',
                              }}
                            >
                              {item.label}
                            </Link>
                          ) : (
                            <Link
                              key={i}
                              href={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                              style={{
                                display: 'block',
                                padding: '8px 0',
                                fontSize: 14,
                                color: 'rgba(255,255,255,0.7)',
                                textDecoration: 'none',
                              }}
                            >
                              {item.label}
                            </Link>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <Link
                  key={link.label}
                  href={link.href!}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    padding: '12px 8px',
                    fontSize: 16,
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.9)',
                    textDecoration: 'none',
                    display: 'block',
                  }}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '8px 0' }} />

          {/* Mobile CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: '12px',
                fontSize: 15,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.85)',
                textDecoration: 'none',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.12)',
                textAlign: 'center',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              Log in
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: '14px',
                fontSize: 15,
                fontWeight: 600,
                color: '#FFFFFF',
                background: '#1D9E75',
                borderRadius: 8,
                textDecoration: 'none',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(29,158,117,0.25)',
              }}
            >
              Start free — 3 contracts
            </Link>
          </div>
        </div>
      )}
    </>
  )
}