'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({ fullName: '', companyName: '', email: '' })
  const [message, setMessage] = useState({ type: '', text: '' })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        
      if (data) {
        setProfile({
          fullName: data.full_name || '',
          companyName: data.company_name || '',
          email: user.email || ''
        })
      } else {
        setProfile(prev => ({ ...prev, email: user.email || '' }))
      }
      setLoading(false)
    }
    loadProfile()
  }, [supabase])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.fullName,
          company_name: profile.companyName,
        })
        .eq('id', user.id)

      if (error) throw error
      setMessage({ type: 'success', text: 'Profile updated successfully' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div style={{ padding: 32, color: 'rgba(255,255,255,0.6)' }}>Loading profile...</div>
  }

  return (
    <div style={{ maxWidth: 600, padding: 32, color: '#E2E8F0' }}>
      <h1 className="font-display" style={{ fontSize: 24, margin: '0 0 24px 0', fontWeight: 400, color: '#fff', fontFamily: 'var(--font-display), serif' }}>
        User Profile
      </h1>
      
      {message.text && (
        <div style={{ 
          padding: '12px 16px', 
          marginBottom: 24, 
          borderRadius: 8, 
          background: message.type === 'error' ? 'rgba(226,75,74,0.1)' : 'rgba(29,158,117,0.1)',
          color: message.type === 'error' ? '#E24B4A' : '#1D9E75',
          border: `1px solid ${message.type === 'error' ? 'rgba(226,75,74,0.3)' : 'rgba(29,158,117,0.3)'}`,
          fontSize: 14
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email (Read Only)</label>
          <input 
            type="text" 
            value={profile.email} 
            disabled 
            style={{ 
              padding: '10px 14px', 
              borderRadius: 6, 
              background: 'rgba(255,255,255,0.03)', 
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.4)',
              fontSize: 14,
              outline: 'none',
              cursor: 'not-allowed'
            }} 
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Full Name</label>
          <input 
            type="text" 
            value={profile.fullName} 
            onChange={e => setProfile({...profile, fullName: e.target.value})}
            placeholder="John Doe"
            style={{ 
              padding: '10px 14px', 
              borderRadius: 6, 
              background: 'rgba(0,0,0,0.2)', 
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff',
              fontSize: 14,
              outline: 'none',
              transition: 'border-color 0.2s'
            }} 
            onFocus={e => e.currentTarget.style.borderColor = '#1D9E75'}
            onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Company Name</label>
          <input 
            type="text" 
            value={profile.companyName} 
            onChange={e => setProfile({...profile, companyName: e.target.value})}
            placeholder="Acme Corp"
            style={{ 
              padding: '10px 14px', 
              borderRadius: 6, 
              background: 'rgba(0,0,0,0.2)', 
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff',
              fontSize: 14,
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={e => e.currentTarget.style.borderColor = '#1D9E75'}
            onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
          />
        </div>

        <div style={{ marginTop: 8 }}>
          <button 
            type="submit" 
            disabled={saving}
            className="btn-primary"
            style={{ padding: '10px 24px', fontSize: 14 }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
