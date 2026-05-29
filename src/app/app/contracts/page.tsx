'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Search, FileText, Shield, Plus, Trash2, SlidersHorizontal, ChevronRight } from 'lucide-react'

interface Contract {
  id: string
  name: string
  contract_type: string | null
  overall_risk: number | null
  risk_label: string | null
  summary: string | null
  created_at: string
  status: string
}

function riskBadgeCls(score: number | null): { label: string; color: string; bg: string } {
  if (score === null || score === undefined) {
    return { label: 'Unknown', color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.05)' }
  }
  if (score >= 7) return { label: 'High Risk', color: '#E24B4A', bg: 'rgba(226,75,74,0.12)' }
  if (score >= 4) return { label: 'Medium Risk', color: '#BA7517', bg: 'rgba(186,117,23,0.12)' }
  return { label: 'Low Risk', color: '#639922', bg: 'rgba(99,153,34,0.12)' }
}

export default function ContractsPage() {
  const router = useRouter()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [apiSearchQuery, setApiSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'created_at' | 'overall_risk' | 'name'>('created_at')
  const [sortAsc, setSortAsc] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [contractToDelete, setContractToDelete] = useState<{ id: string; name: string } | null>(null)

  const supabase = useMemo(
    () => createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ),
    []
  )

  // Fetch contracts from the unified search API (which handles full-text clauses automatically)
  const fetchContracts = useCallback(async (query: string = '') => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const url = query 
        ? `/api/contracts/search?q=${encodeURIComponent(query)}`
        : '/api/contracts/search'

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      })
      if (!res.ok) throw new Error('Search failed')
      
      const data = await res.json()
      if (data.success && data.contracts) {
        setContracts(data.contracts)
      }
    } catch (err) {
      console.error('Error fetching contracts:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Debounce API Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setApiSearchQuery(searchQuery)
    }, 350) // 350ms debounce

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  // Refetch when the debounced search changes
  useEffect(() => {
    fetchContracts(apiSearchQuery)
  }, [apiSearchQuery, fetchContracts])

  const deleteContract = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
      if (error) throw error
      setContracts(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      console.error('Error deleting contract:', err)
    }
  }

  // Local filtering and sorting (on top of the API results)
  const processedContracts = useMemo(() => {
    return [...contracts]
      .filter(c => {
        if (filterType === 'all') return true
        if (filterType === 'high') return (c.overall_risk ?? 0) >= 7
        if (filterType === 'medium') return (c.overall_risk ?? 0) >= 4 && (c.overall_risk ?? 0) < 7
        if (filterType === 'low') return (c.overall_risk ?? 0) < 4 && (c.overall_risk ?? 0) > 0
        return true
      })
      .sort((a, b) => {
        let valA: any = a[sortBy]
        let valB: any = b[sortBy]

        if (sortBy === 'name') {
          valA = (valA || '').toLowerCase()
          valB = (valB || '').toLowerCase()
        } else if (sortBy === 'overall_risk') {
          valA = valA ?? 0
          valB = valB ?? 0
        } else {
          valA = new Date(valA || 0).getTime()
          valB = new Date(valB || 0).getTime()
        }

        if (valA < valB) return sortAsc ? -1 : 1
        if (valA > valB) return sortAsc ? 1 : -1
        return 0
      })
  }, [contracts, filterType, sortBy, sortAsc])

  const toggleSort = (field: 'created_at' | 'overall_risk' | 'name') => {
    if (sortBy === field) {
      setSortAsc(prev => !prev)
    } else {
      setSortBy(field)
      setSortAsc(false)
    }
  }

  // Risk Counters
  const highRiskCount = useMemo(() => contracts.filter(c => (c.overall_risk ?? 0) >= 7).length, [contracts])
  const mediumRiskCount = useMemo(() => contracts.filter(c => (c.overall_risk ?? 0) >= 4 && (c.overall_risk ?? 0) < 7).length, [contracts])
  const lowRiskCount = useMemo(() => contracts.filter(c => (c.overall_risk ?? 0) < 4 && (c.overall_risk ?? 0) > 0).length, [contracts])

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 40px', color: '#E2E8F0' }}>
      
      {/* ─── Dashboard Stats Overview Cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Total Contracts <FileText size={14} color="rgba(255,255,255,0.3)" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', marginTop: 8 }}>{contracts.length}</div>
        </div>
        <div style={{ background: 'rgba(226,75,74,0.03)', padding: '16px 20px', borderRadius: 12, border: '1px solid rgba(226,75,74,0.15)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#E24B4A', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            High Risk <Shield size={14} color="#E24B4A" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#E24B4A', marginTop: 8 }}>{highRiskCount}</div>
        </div>
        <div style={{ background: 'rgba(186,117,23,0.03)', padding: '16px 20px', borderRadius: 12, border: '1px solid rgba(186,117,23,0.15)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#BA7517', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Medium Risk <SlidersHorizontal size={14} color="#BA7517" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#BA7517', marginTop: 8 }}>{mediumRiskCount}</div>
        </div>
        <div style={{ background: 'rgba(99,153,34,0.03)', padding: '16px 20px', borderRadius: 12, border: '1px solid rgba(99,153,34,0.15)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#639922', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Low Risk <Plus size={14} color="#639922" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#639922', marginTop: 8 }}>{lowRiskCount}</div>
        </div>
      </div>

      {/* Page Title & Analysis Button */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-7">
        <div>
          <h1 className="font-display" style={{ fontSize: 28, color: '#fff', margin: '0 0 6px 0', fontWeight: 400, fontFamily: 'var(--font-display), serif' }}>
            Contracts Library & Intelligent Search
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
            Search across full contract agreements, clause texts, and plain English meaning constraints in one unified vault.
          </p>
        </div>
        <button
          onClick={() => router.push('/app/dashboard')}
          className="btn-primary w-full md:w-auto mt-4 md:mt-0"
          style={{ padding: '10px 18px', fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}
        >
          <Plus size={15} /> Analyse New
        </button>
      </div>

      {/* Intelligent Search Input */}
      <div style={{ 
        background: 'rgba(255,255,255,0.03)', 
        border: '1px solid rgba(255,255,255,0.08)', 
        borderRadius: 12, 
        padding: '16px 20px',
        marginBottom: 28,
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <Search size={18} color="rgba(255,255,255,0.4)" />
        <input 
          type="text" 
          placeholder="Search by contract name, clause text, plain English meaning, or keywords..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ 
            flex: 1, 
            background: 'none', 
            border: 'none', 
            color: '#fff', 
            fontSize: 14.5,
            outline: 'none',
            fontFamily: 'var(--font-body), system-ui, sans-serif'
          }}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter and Sort Pills */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Contracts' },
            { id: 'high', label: 'High Risk', dotColor: '#E24B4A' },
            { id: 'medium', label: 'Medium Risk', dotColor: '#BA7517' },
            { id: 'low', label: 'Low Risk', dotColor: '#639922' }
          ].map(tier => (
            <button
              key={tier.id}
              onClick={() => setFilterType(tier.id)}
              style={{
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 500,
                background: filterType === tier.id ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${filterType === tier.id ? '#1D9E75' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 100,
                color: filterType === tier.id ? '#fff' : 'rgba(255,255,255,0.7)',
                cursor: 'pointer',
                transition: 'all 200ms ease',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              {tier.dotColor && <span style={{ width: 8, height: 8, borderRadius: '50%', background: tier.dotColor, display: 'inline-block' }} />}
              {tier.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
          <span>Sort:</span>
          <button 
            onClick={() => toggleSort('created_at')} 
            style={{ background: 'none', border: 'none', color: sortBy === 'created_at' ? '#1D9E75' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: sortBy === 'created_at' ? '600' : '500' }}
          >
            Date {sortBy === 'created_at' && (sortAsc ? '▲' : '▼')}
          </button>
          <button 
            onClick={() => toggleSort('overall_risk')} 
            style={{ background: 'none', border: 'none', color: sortBy === 'overall_risk' ? '#1D9E75' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: sortBy === 'overall_risk' ? '600' : '500' }}
          >
            Risk {sortBy === 'overall_risk' && (sortAsc ? '▲' : '▼')}
          </button>
          <button 
            onClick={() => toggleSort('name')} 
            style={{ background: 'none', border: 'none', color: sortBy === 'name' ? '#1D9E75' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: sortBy === 'name' ? '600' : '500' }}
          >
            Name {sortBy === 'name' && (sortAsc ? '▲' : '▼')}
          </button>
        </div>
      </div>

      {/* Contracts Table List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, opacity: 0.3 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ height: 68, background: 'rgba(255,255,255,0.04)', borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : processedContracts.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 24px',
          background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 12, textAlign: 'center'
        }}>
          <FileText size={40} color="rgba(255,255,255,0.2)" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: 16, color: '#fff', fontWeight: 600, margin: '0 0 6px 0' }}>No contracts found</h3>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            {searchQuery ? 'Adjust your search queries or keywords to locate matching files.' : 'Upload and analyze a contract to populate your workspace.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {processedContracts.map(contract => {
            const risk = riskBadgeCls(contract.overall_risk)
            const dateStr = contract.created_at
              ? new Date(contract.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
              : '—'

            return (
              <div
                key={contract.id}
                onClick={() => router.push(`/app/contracts/${contract.id}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 10,
                  cursor: 'pointer',
                  transition: 'all 200ms ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.borderColor = 'rgba(29, 158, 117, 0.3)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)'
                }}
              >
                {/* Contract Meta Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0, flex: 1 }}>
                  <div style={{ 
                    width: 42, height: 42, borderRadius: 8, 
                    background: 'rgba(29,158,117,0.1)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#1D9E75', flexShrink: 0
                  }}>
                    <FileText size={20} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 500, color: '#fff', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {contract.name}
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'rgba(255,255,255,0.5)', flexWrap: 'wrap' }}>
                      <span>{contract.contract_type ? contract.contract_type.toUpperCase() : 'Custom Agreement'}</span>
                      <span>&bull;</span>
                      <span>{dateStr}</span>
                    </div>
                  </div>
                </div>

                {/* Risk Badging & Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
                  <div>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontSize: 11, fontWeight: 600, color: risk.color, background: risk.bg,
                      padding: '4px 12px', borderRadius: 100, border: `1px solid ${risk.color}20`
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: risk.color }} />
                      {risk.label} {contract.overall_risk !== null ? `(${contract.overall_risk})` : ''}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setContractToDelete({ id: contract.id, name: contract.name })
                      setDeleteModalOpen(true)
                    }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', color: '#E24B4A',
                      fontSize: 12, fontWeight: 500, padding: '6px 12px', borderRadius: 6,
                      transition: 'background 150ms', display: 'flex', alignItems: 'center', gap: 4
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(226,75,74,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                  <ChevronRight size={18} color="rgba(255,255,255,0.3)" />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Center Glassmorphic Delete Modal */}
      {deleteModalOpen && contractToDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100dvh',
          background: 'rgba(10, 18, 30, 0.6)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
        }}>
          <div style={{
            background: 'rgba(26, 42, 62, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 16,
            padding: 32,
            width: '100%',
            maxWidth: 440,
            boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
            textAlign: 'center',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(226, 75, 74, 0.15)',
              color: '#E24B4A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              fontSize: 24,
            }}>
              ⚠️
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 12px 0' }}>
              Delete Contract Audit?
            </h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, margin: '0 0 28px 0' }}>
              Are you sure you want to permanently delete the risk audit report for "{contractToDelete.name}"? All clauses, flagged items, and milestones will be deleted.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setDeleteModalOpen(false)
                  setContractToDelete(null)
                }}
                style={{
                  padding: '11px 24px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 8,
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 200ms',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setDeleteModalOpen(false)
                  if (contractToDelete) {
                    await deleteContract(contractToDelete.id)
                  }
                  setContractToDelete(null)
                }}
                style={{
                  padding: '11px 24px',
                  background: '#E24B4A',
                  border: 'none',
                  borderRadius: 8,
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 200ms',
                }}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'none'}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
