'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [success, setSuccess] = useState('')

  // If already logged in, go straight to app
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace('/app')
    })
  }, [supabase, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.replace('/app')
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSuccess('Account created! Check your email to confirm, then sign in.')
        setMode('login')
      }
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0D1B2A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'var(--font-body), system-ui, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: '#1D9E75' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 15l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontSize: 24, color: '#FFFFFF', fontFamily: 'var(--font-display), serif', fontWeight: 400 }}>
              Signet AI
            </span>
          </Link>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 8 }}>
            AI contract risk analysis for Indian SMEs
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: '32px 28px',
          backdropFilter: 'blur(12px)',
        }}>
          <h1 style={{ fontSize: 20, color: '#fff', fontWeight: 600, margin: '0 0 4px 0' }}>
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: '0 0 24px 0' }}>
            {mode === 'login'
              ? 'Enter your credentials to continue.'
              : 'Start your free trial — no credit card required.'}
          </p>

          {/* Success message */}
          {success && (
            <div style={{
              background: 'rgba(29,158,117,0.1)', border: '1px solid rgba(29,158,117,0.25)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 16,
              fontSize: 13, color: '#1D9E75', lineHeight: 1.5,
            }}>
              {success}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div style={{
              background: 'rgba(226,75,74,0.1)', border: '1px solid rgba(226,75,74,0.25)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 16,
              fontSize: 13, color: '#E24B4A', lineHeight: 1.5,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginBottom: 6, letterSpacing: '0.02em' }}>
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 8, padding: '11px 14px',
                  fontSize: 14, color: '#fff', outline: 'none',
                  transition: 'border-color 150ms',
                }}
                onFocus={e => e.target.style.borderColor = '#1D9E75'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginBottom: 6, letterSpacing: '0.02em' }}>
                PASSWORD
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 8, padding: '11px 14px',
                  fontSize: 14, color: '#fff', outline: 'none',
                  transition: 'border-color 150ms',
                }}
                onFocus={e => e.target.style.borderColor = '#1D9E75'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '12px', marginTop: 4,
                background: loading ? 'rgba(29,158,117,0.5)' : '#1D9E75',
                border: 'none', borderRadius: 8,
                fontSize: 14, fontWeight: 600, color: '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 150ms, transform 100ms',
                boxShadow: loading ? 'none' : '0 2px 8px rgba(29,158,117,0.3)',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#18896A' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#1D9E75' }}
            >
              {loading
                ? (mode === 'login' ? 'Signing in...' : 'Creating account...')
                : (mode === 'login' ? 'Sign in' : 'Create account')}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: 10 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255, 255, 255, 0.1)' }} />
            <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.35)', fontWeight: 500 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255, 255, 255, 0.1)' }} />
          </div>

          {/* Google Login */}
          <button
            onClick={async () => {
              setError('')
              setLoading(true)
              try {
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                      prompt: 'select_account',   // Always show Google account picker
                      access_type: 'offline',
                    }
                  }
                })
                if (error) throw error
              } catch (err: any) {
                setError(err.message ?? 'OAuth failed. Please try again.')
                setLoading(false)
              }
            }}
            disabled={loading}
            style={{
              width: '100%', padding: '11px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 8,
              fontSize: 14, fontWeight: 500, color: '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'background 150ms',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          {/* Toggle */}
          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            {mode === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => { setMode('signup'); setError(''); setSuccess('') }}
                  style={{ background: 'none', border: 'none', color: '#1D9E75', cursor: 'pointer', fontSize: 13, fontWeight: 500, padding: 0 }}
                >
                  Sign up free
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => { setMode('login'); setError(''); setSuccess('') }}
                  style={{ background: 'none', border: 'none', color: '#1D9E75', cursor: 'pointer', fontSize: 13, fontWeight: 500, padding: 0 }}
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
          © {new Date().getFullYear()} Signet AI · Built for Indian SMEs
        </p>
      </div>
    </div>
  )
}
