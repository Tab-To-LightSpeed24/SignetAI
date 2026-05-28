'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

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
  const [filterType, setFilterType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'created_at' | 'overall_risk' | 'name'>('created_at')
  const [sortAsc, setSortAsc] = useState(false)

  const supabase = useMemo(
    () => createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ),
    []
  )

  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) {
        setContracts(data)
      }
    } catch (err) {
      console.error('Error loading contracts:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchContracts()
  }, [fetchContracts])

  const deleteContract = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this contract from your library?')) return

    try {
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', id)
      if (error) throw error
      setContracts(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      console.error('Error deleting contract:', err)
    }
  }

  // Filter and Sort logic
  const processedContracts = useMemo(() => {
    return contracts
      .filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (c.contract_type || '').toLowerCase().includes(searchQuery.toLowerCase())
        
        if (filterType === 'all') return matchesSearch
        if (filterType === 'high') return matchesSearch && (c.overall_risk ?? 0) >= 7
        if (filterType === 'medium') return matchesSearch && (c.overall_risk ?? 0) >= 4 && (c.overall_risk ?? 0) < 7
        if (filterType === 'low') return matchesSearch && (c.overall_risk ?? 0) < 4 && (c.overall_risk ?? 0) > 0
        return matchesSearch
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
  }, [contracts, searchQuery, filterType, sortBy, sortAsc])

  const toggleSort = (field: 'created_at' | 'overall_risk' | 'name') => {
    if (sortBy === field) {
      setSortAsc(prev => !prev)
    } else {
      setSortBy(field)
      setSortAsc(false)
    }
  }

  return (
    <div style={{ maxWidth: '100%', padding: '32px 40px', color: '#E2E8F0' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 30, color: '#fff', margin: '0 0 6px 0', fontWeight: 400, fontFamily: 'var(--font-display), serif' }}>
            My Contracts
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
            Manage and view risk profiles of all your uploaded legal agreements.
          </p>
        </div>
        <button
          onClick={() => router.push('/app')}
          className="btn-primary"
          style={{ padding: '10px 20px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Analyse New
        </button>
      </div>

      {/* Filter and Search Bar Row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8, padding: '8px 14px', flex: 1, minWidth: 260
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search by contract name or type..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, color: '#fff', width: '100%' }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Tiers' },
            { id: 'high', label: 'High Risk', dotColor: '#E24B4A' },
            { id: 'medium', label: 'Medium Risk', dotColor: '#BA7517' },
            { id: 'low', label: 'Low Risk', dotColor: '#1D9E75' }
          ].map(tier => (
            <button
              key={tier.id}
              onClick={() => setFilterType(tier.id)}
              style={{
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 500,
                background: filterType === tier.id ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${filterType === tier.id ? 'var(--teal)' : 'rgba(255,255,255,0.08)'}`,
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
      </div>

      {/* Contracts Table / List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, opacity: 0.3 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ height: 64, background: 'rgba(255,255,255,0.04)', borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : processedContracts.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 24px',
          background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, textAlign: 'center'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', marginBottom: 16 }}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          <h3 style={{ fontSize: 16, color: '#fff', fontWeight: 600, margin: '0 0 6px 0' }}>No contracts found</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            {searchQuery ? 'Adjust your search queries to locate files.' : 'Upload and analyze a contract to begin.'}
          </p>
        </div>
      ) : (
        <div style={{
          borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden', background: 'rgba(255,255,255,0.02)'
        }}>
          {/* Header Row */}
          <div style={{
            display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 1.5fr 1.2fr 80px',
            padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.02)', fontWeight: 600, fontSize: 11,
            textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)'
          }}>
            <div onClick={() => toggleSort('name')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              Contract Name {sortBy === 'name' && (sortAsc ? '▲' : '▼')}
            </div>
            <div>Agreement Type</div>
            <div onClick={() => toggleSort('created_at')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              Analysis Date {sortBy === 'created_at' && (sortAsc ? '▲' : '▼')}
            </div>
            <div onClick={() => toggleSort('overall_risk')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              Overall Risk {sortBy === 'overall_risk' && (sortAsc ? '▲' : '▼')}
            </div>
            <div style={{ textAlign: 'right' }}>Actions</div>
          </div>

          {/* Rows */}
          {processedContracts.map((contract) => {
            const risk = riskBadgeCls(contract.overall_risk)
            const dateStr = contract.created_at
              ? new Date(contract.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
              : '—'

            return (
              <div
                key={contract.id}
                onClick={() => router.push(`/app?contractId=${contract.id}`)}
                style={{
                  display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 1.5fr 1.2fr 80px',
                  padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                  alignItems: 'center', cursor: 'pointer', transition: 'background 150ms ease'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Name */}
                <div style={{ fontSize: 14, fontWeight: 500, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: 'rgba(255,255,255,0.4)' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span>{contract.name}</span>
                </div>

                {/* Type */}
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                  {contract.contract_type || 'Custom Agreement'}
                </div>

                {/* Date */}
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                  {dateStr}
                </div>

                {/* Risk Badge */}
                <div>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontSize: 11, fontWeight: 600, color: risk.color, background: risk.bg,
                    padding: '3px 10px', borderRadius: 100, border: `1px solid ${risk.color}25`
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: risk.color }} />
                    {risk.label} {contract.overall_risk !== null ? `(${contract.overall_risk})` : ''}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ textAlign: 'right' }}>
                  <button
                    onClick={(e) => deleteContract(contract.id, e)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', color: '#E24B4A',
                      fontSize: 12, fontWeight: 500, padding: '4px 8px', borderRadius: 4,
                      transition: 'background 150ms'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(226,75,74,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
