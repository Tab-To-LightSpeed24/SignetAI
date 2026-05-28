import { db } from '@/db'
import { userPlaybook } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Shield, Trash2, Plus, ArrowLeft, BookOpen, AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getAuthUser() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() { },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function addRule(formData: FormData) {
  'use server'
  const ruleText = formData.get('ruleText') as string
  const contractType = (formData.get('contractType') as string) || 'global'
  if (!ruleText?.trim()) return
  const user = await getAuthUser()
  if (!user) return
  
  await db.insert(userPlaybook).values({
    userId: user.id,
    ruleText: ruleText.trim(),
    contractType: contractType,
  })
  revalidatePath('/app/settings')
}

async function deleteRule(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  if (!id) return
  const user = await getAuthUser()
  if (!user) return
  
  await db.delete(userPlaybook).where(
    and(eq(userPlaybook.id, id), eq(userPlaybook.userId, user.id))
  )
  revalidatePath('/app/settings')
}

export default async function SettingsPage() {
  const user = await getAuthUser()
  if (!user) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#0D1B2A', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        color: '#fff',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{ textAlign: 'center', padding: 40, background: 'rgba(255, 255, 255, 0.03)', borderRadius: 16, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <AlertCircle size={48} color="#ef4444" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: 24, margin: '0 0 8px 0', fontWeight: 500 }}>Unauthorized Access</h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: 24 }}>Please log in to manage your playbook settings.</p>
          <Link href="/login" style={{ 
            padding: '10px 20px', 
            background: 'var(--teal)', 
            color: '#fff', 
            textDecoration: 'none', 
            borderRadius: 8, 
            fontWeight: 600,
            fontSize: 14
          }}>
            Log In
          </Link>
        </div>
      </div>
    )
  }

  const rules = await db.select().from(userPlaybook).where(eq(userPlaybook.userId, user.id))

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #070e17 0%, #0D1B2A 100%)', 
      color: '#eee', 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header Section */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 40,
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          paddingBottom: 24
        }}>
          <div>
            <h1 style={{ 
              fontSize: 36, 
              margin: 0, 
              fontFamily: '"DM Serif Display", "Playfair Display", Georgia, serif', 
              color: '#fff',
              fontWeight: 400,
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <Shield size={32} color="#1D9E75" /> Settings & Playbook
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', margin: '8px 0 0 0', fontSize: 14 }}>
              Manage your compliance guardrails and AI evaluation rules
            </p>
          </div>
          <Link href="/app" style={{ 
            padding: '10px 18px', 
            background: 'rgba(255, 255, 255, 0.04)', 
            color: '#fff', 
            textDecoration: 'none', 
            borderRadius: 8, 
            fontSize: 13,
            fontWeight: 500,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 200ms'
          }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>

        {/* Main Card */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.02)', 
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.06)', 
          borderRadius: 16, 
          padding: '32px 28px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 28 }}>
            <div style={{ 
              background: 'rgba(29, 158, 117, 0.1)', 
              padding: 12, 
              borderRadius: 12, 
              color: '#1D9E75',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BookOpen size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: 20, margin: '0 0 6px 0', fontWeight: 600, color: '#fff' }}>Personal Playbook</h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                Define your non-negotiable rules and contractual preferences. Signet AI AI automatically evaluates all incoming drafts against these preferences and flags non-compliance.
              </p>
            </div>
          </div>

          {/* Add Rule Form */}
          <form action={addRule} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 36 }}>
            <input
              name="ruleText"
              type="text"
              placeholder="e.g., Never accept liability below 12 months"
              required
              style={{
                flex: '1 1 300px', 
                padding: '12px 16px', 
                background: 'rgba(0, 0, 0, 0.2)', 
                border: '1px solid rgba(255, 255, 255, 0.12)', 
                borderRadius: 8, 
                color: '#fff', 
                fontSize: 14,
                outline: 'none',
                transition: 'border-color 200ms'
              }}
            />
            <select
              name="contractType"
              required
              style={{
                padding: '12px 16px',
                background: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 8,
                color: '#fff',
                fontSize: 14,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="global" style={{ background: '#0D1B2A', color: '#fff' }}>Global (All Contracts)</option>
              <option value="lease" style={{ background: '#0D1B2A', color: '#fff' }}>Lease Agreement</option>
              <option value="nda" style={{ background: '#0D1B2A', color: '#fff' }}>NDA / Confidentiality</option>
              <option value="vendor" style={{ background: '#0D1B2A', color: '#fff' }}>Vendor Agreement</option>
              <option value="service" style={{ background: '#0D1B2A', color: '#fff' }}>Service Level Agreement (SLA)</option>
            </select>
            <button type="submit" style={{
              padding: '12px 24px', 
              background: '#1D9E75', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 8, 
              cursor: 'pointer', 
              fontWeight: 600,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'background 200ms'
            }}>
              <Plus size={16} /> Add Rule
            </button>
          </form>

          {/* Rules List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.4)', margin: '0 0 4px 0', fontWeight: 700 }}>
              Active Preferences ({rules.length})
            </h3>
            {rules.length === 0 ? (
              <div style={{ 
                padding: '32px', 
                textAlign: 'center', 
                border: '1px dashed rgba(255, 255, 255, 0.1)', 
                borderRadius: 12, 
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: 14
              }}>
                No playbook preferences defined yet. Build your playbook using the form above.
              </div>
            ) : (
              rules.map(rule => (
                <div key={rule.id} style={{
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  background: 'rgba(255, 255, 255, 0.02)', 
                  border: '1px solid rgba(255, 255, 255, 0.05)', 
                  padding: '14px 20px', 
                  borderRadius: 10,
                  transition: 'background 200ms'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, color: '#fff', lineHeight: 1.5 }}>{rule.ruleText}</span>
                    <span style={{ 
                      fontSize: 11, 
                      background: 'rgba(29, 158, 117, 0.15)', 
                      color: '#1D9E75', 
                      padding: '2px 8px', 
                      borderRadius: 4, 
                      textTransform: 'uppercase', 
                      fontWeight: 600,
                      letterSpacing: '0.02em'
                    }}>
                      {rule.contractType}
                    </span>
                  </div>
                  <form action={deleteRule}>
                    <input type="hidden" name="id" value={rule.id} />
                    <button type="submit" style={{
                      background: 'rgba(239, 68, 68, 0.1)', 
                      border: 'none', 
                      color: '#ef4444', 
                      cursor: 'pointer', 
                      padding: '8px 12px', 
                      borderRadius: 6,
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 200ms'
                    }}
                    title="Remove rule"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </form>
                </div>
              ))
            )}
          </div>

        </div>

      </div>
    </div>
  )
}
