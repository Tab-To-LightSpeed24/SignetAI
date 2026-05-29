'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { installAuthInterceptor, clearSessionAndRedirect } from '@/lib/auth-interceptor'

// ─── Navigation config ────────────────────────────────────────────────────────
const PRIMARY_NAV = [
  { label: 'Dashboard',        href: '/app/dashboard' },
  { label: 'My Contracts',     href: '/app/contracts' },
  { label: 'My Playbook',      href: '/app/settings' },
  { label: 'Renewal Calendar', href: '/app/calendar' },
]

// ─── Icon helper ──────────────────────────────────────────────────────────────
function SidebarIcon({ label, color }: { label: string; color: string }) {
  const props = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (label) {
    case 'Dashboard':        return <svg {...props}><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
    case 'My Contracts':     return <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
    case 'Contract Search':  return <svg {...props}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    case 'My Playbook':      return <svg {...props}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
    case 'Renewal Calendar': return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    case 'Legal Partners':   return <svg {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    case 'Settings':         return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
    case 'Billing':          return <svg {...props}><rect x="2" y="5" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
    default:                 return null
  }
}

// ─── Single nav link ──────────────────────────────────────────────────────────
function NavLink({ label, href, isActive, collapsed }: { label: string; href: string; isActive: boolean; collapsed: boolean }) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 10,
        padding: '10px 12px', borderRadius: 6, textDecoration: 'none',
        fontSize: 14, fontWeight: isActive ? 600 : 500,
        color: isActive ? '#1D9E75' : 'rgba(255, 255, 255, 0.65)',
        background: isActive ? 'rgba(29, 158, 117, 0.12)' : 'transparent',
        transition: 'all 200ms cubic-bezier(0.16,1,0.3,1)',
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}
      title={collapsed ? label : undefined}
      onMouseEnter={e => {
        if (!isActive) {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
          e.currentTarget.style.color = '#FFFFFF'
          const svg = e.currentTarget.querySelector('svg')
          if (svg) svg.style.stroke = '#FFFFFF'
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)'
          const svg = e.currentTarget.querySelector('svg')
          if (svg) svg.style.stroke = 'rgba(255, 255, 255, 0.5)'
        }
      }}
    >
      <SidebarIcon label={label} color={isActive ? '#1D9E75' : 'rgba(255, 255, 255, 0.5)'} />
      <span style={{
        opacity: collapsed ? 0 : 1,
        maxWidth: collapsed ? 0 : 160,
        marginLeft: collapsed ? 0 : 10,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        transition: 'opacity 300ms ease, max-width 300ms ease, margin-left 300ms ease',
      }}>
        {label}
      </span>
    </Link>
  )
}

// ─── AppLayout ────────────────────────────────────────────────────────────────
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  // Stable Supabase client — created once, not on every render
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  )

  const [usage, setUsage] = useState({ used: 0, limit: 3, plan: 'free' })
  const [userEmail, setUserEmail] = useState('')
  const [userInitial, setUserInitial] = useState('U')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [visible, setVisible] = useState(true)
  const [atTop, setAtTop] = useState(true)
  const lastScrollY = useRef(0)
  const mainRef = useRef<HTMLElement>(null)

  const userMenuRef = useRef<HTMLDivElement>(null)
  const fetchedRef = useRef(false) // prevent double-fetch in StrictMode

  const [isMobile, setIsMobile] = useState(true)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // ── Install auth interceptor (session-verified, loop-safe) ────────────────
  useEffect(() => {
    const cleanup = installAuthInterceptor(() => supabase.auth.getSession())
    return cleanup
  }, [supabase])

  // ── Scroll event listener for hide-on-scroll camouflage navbar ──
  useEffect(() => {
    const mainEl = mainRef.current
    if (!mainEl) return

    const onScroll = () => {
      const currentY = mainEl.scrollTop
      const isAtTop = currentY < 10

      setAtTop(isAtTop)

      if (currentY > lastScrollY.current && currentY > 60) {
        // Scrolling down — hide
        setVisible(false)
      } else {
        // Scrolling up — show
        setVisible(true)
      }
      lastScrollY.current = currentY
    }

    mainEl.addEventListener('scroll', onScroll, { passive: true })
    return () => mainEl.removeEventListener('scroll', onScroll)
  }, [])

  // ── Supabase SIGNED_OUT listener — soft redirect only ────────────────────
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        router.replace('/login')
      }
    })
    return () => subscription.unsubscribe()
  }, [supabase, router])

  // ── Profile + usage fetch (runs once) ────────────────────────────────────
  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true

    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser()

      // No session: redirect to login — do NOT clear storage to avoid loop
      if (!user) {
        router.replace('/login')
        return
      }

      const email = user.email ?? ''
      setUserEmail(email)
      setUserInitial(
        (user.user_metadata?.full_name?.[0] ?? email[0] ?? 'U').toUpperCase()
      )

      // Fetch usage separately — failure is non-fatal
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const res = await fetch('/api/billing/usage-check', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        if (res.ok) {
          const d = await res.json()
          setUsage({ used: d.used ?? 0, limit: d.limit ?? 3, plan: d.plan ?? 'free' })
        }
      } catch {}
    }

    fetchProfile()
  }, [supabase, router])

  // ── Close dropdowns on outside click ────────────────────────────────────
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  // ── Sign out (explicit user action — only place we clear storage) ────────
  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut()
    clearSessionAndRedirect()
  }, [supabase])

  const usagePercent = usage.limit > 0 ? Math.min((usage.used / usage.limit) * 100, 100) : 0
  const barDanger = usagePercent >= 80 ? 'danger' : usagePercent >= 60 ? 'warning' : ''

  return (
    <div className="motion-glow overflow-x-hidden w-full max-w-[100vw]" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>

      {/* ═══ TOP NAVBAR ══════════════════════════════════════════════════════ */}
      <header style={{
        height: 60,
        background: atTop ? 'transparent' : 'rgba(13, 27, 42, 0.75)',
        backdropFilter: atTop ? 'none' : 'blur(20px)',
        WebkitBackdropFilter: atTop ? 'none' : 'blur(20px)',
        borderBottom: atTop ? '1px solid transparent' : '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
        position: 'fixed', top: 0, left: 0, right: 0,
        zIndex: 50,
        transform: visible ? 'translateY(0)' : 'translateY(-60px)',
        transition: 'transform 350ms cubic-bezier(0.16,1,0.3,1), background 300ms ease, border-color 300ms ease, backdrop-filter 300ms ease',
      }}>
        {/* Logo */}
        <Link href="/app" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#1D9E75' }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 15l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-display" style={{ fontSize: 22, color: '#FFFFFF', fontWeight: 400 }}>Signet AI</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1, justifyContent: 'flex-end' }}>

          {/* Plan badge */}
          <span style={{
            fontSize: 12, padding: '4px 12px', borderRadius: 100, fontWeight: 500,
            background: usage.plan === 'free' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(29, 158, 117, 0.12)',
            color: usage.plan === 'free' ? 'rgba(255, 255, 255, 0.5)' : '#1D9E75',
            textTransform: 'capitalize', whiteSpace: 'nowrap',
          }}>
            {usage.plan === 'free' ? 'Free Plan' : `${usage.plan} Plan`}
          </span>

          {/* ── User Avatar + Dropdown ─────────────────────────────────────── */}
          <div ref={userMenuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => { setShowUserMenu(v => !v) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px', borderRadius: 6 }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, #1D9E75, #15725A)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 13, fontWeight: 600, userSelect: 'none',
              }}>
                {userInitial}
              </div>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {showUserMenu && (
              <div style={{
                position: 'absolute', top: 42, right: 0, width: 216,
                background: '#1A2A3A', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                zIndex: 100, overflow: 'hidden',
              }}>
                {/* Account header */}
                <div style={{ padding: '12px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF' }}>My Account</div>
                  {userEmail && (
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {userEmail}
                    </div>
                  )}
                </div>

                {/* Profile Settings */}
                <Link
                  href="/app/settings/profile"
                  style={{ padding: '10px 16px', fontSize: 13, color: 'rgba(255,255,255,0.85)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, transition: 'background 150ms' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Profile Settings
                </Link>

                {/* Billing & Plan */}
                <Link
                  href="/app/settings/billing"
                  style={{ padding: '10px 16px', fontSize: 13, color: 'rgba(255,255,255,0.85)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, transition: 'background 150ms' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                  Billing & Plan
                </Link>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '4px 0' }} />

                {/* Log Out */}
                <button
                  onClick={handleSignOut}
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '10px 16px', fontSize: 13, color: '#E24B4A', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'background 150ms' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(226,75,74,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Horizontal Navigation Bar */}
      <div 
        className="flex md:hidden items-center gap-4 px-4 overflow-x-auto border-b border-white/10"
        style={{
          height: 48,
          background: 'rgba(9, 17, 30, 0.95)',
          position: 'fixed',
          top: visible ? 60 : 0,
          left: 0,
          right: 0,
          zIndex: 44,
          whiteSpace: 'nowrap',
          transition: 'top 350ms cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {PRIMARY_NAV.map(item => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#1D9E75' : 'rgba(255,255,255,0.6)',
                padding: '4px 10px',
                borderRadius: 4,
                background: isActive ? 'rgba(29, 158, 117, 0.1)' : 'transparent',
                textDecoration: 'none',
                flexShrink: 0
              }}
            >
              {item.label}
            </Link>
          )
        })}
        <Link
          href="/app/referrals"
          style={{
            fontSize: 13,
            fontWeight: pathname === '/app/referrals' ? 600 : 500,
            color: pathname === '/app/referrals' ? '#1D9E75' : 'rgba(255,255,255,0.6)',
            padding: '4px 10px',
            borderRadius: 4,
            background: pathname === '/app/referrals' ? 'rgba(29, 158, 117, 0.1)' : 'transparent',
            textDecoration: 'none',
            flexShrink: 0
          }}
        >
          Legal Partners
        </Link>
      </div>

      {/* Mobile Top Bar */}
      <div className="flex md:hidden w-full h-16 border-b border-gray-800 items-center px-4 justify-between bg-gray-950" style={{ position: 'fixed', top: visible ? 60 : 0, left: 0, right: 0, zIndex: 44 }}>
        <span className="text-white font-bold text-lg">Signet AI</span>
        {/* Hamburger menu icon */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </div>

      {/* ═══ BODY: SIDEBAR + CONTENT ════════════════════════════════════════ */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative' }}>

        {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────── */}
        <aside
          className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0"
          style={{
            top: visible ? 60 : 0,
            background: 'rgba(9, 17, 30, 0.95)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            padding: '20px 12px',
            zIndex: 46,
            transition: 'top 350ms cubic-bezier(0.16,1,0.3,1)',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {/* Analyse New CTA */}
          <button
            className="btn-cta"
            onClick={() => router.push('/app/dashboard')}
            style={{ 
              width: '100%', 
              padding: '10px 16px', 
              fontSize: 14, 
              marginBottom: 24, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 8,
              boxShadow: 'none',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span style={{ whiteSpace: 'nowrap' }}>
              Analyse New Contract
            </span>
          </button>

          {/* Primary nav */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {PRIMARY_NAV.map(item => (
              <NavLink key={item.href} label={item.label} href={item.href} isActive={pathname === item.href} collapsed={false} />
            ))}
          </nav>

          {/* Usage indicator */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16, marginTop: 'auto', overflow: 'hidden' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span>Contracts this month</span>
              <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{usage.used}/{usage.limit}</span>
            </div>
            <div className="usage-bar">
              <div className={`usage-bar-fill ${barDanger}`} style={{ width: `${usagePercent}%` }} />
            </div>
            {usagePercent >= 80 && (
              <Link
                href="/app/settings/billing"
                style={{ display: 'block', marginTop: 8, fontSize: 12, textDecoration: 'none', fontWeight: 500, color: '#E24B4A' }}
              >
                Upgrade plan now →
              </Link>
            )}
          </div>
        </aside>

        {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
        <main
          ref={mainRef}
          className="w-full md:pl-64 flex-1"
          style={{
            overflowY: 'auto',
            background: 'transparent',
            minHeight: 0,
            paddingTop: isMobile ? 108 : 60, // Fixed padding for top fixed header
          }}
        >
          <div key={pathname} className="page-transition">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
