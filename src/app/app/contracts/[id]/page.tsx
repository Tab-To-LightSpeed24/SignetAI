'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import dynamic from 'next/dynamic'
import { 
  Check, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Bell, 
  BellOff, 
  Flag,
  ArrowLeft,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react'

const PdfViewerPane = dynamic(
  () => import('@/components/PdfViewerPane'),
  { ssr: false, loading: () => <div style={{ flex: 1, display: 'flex' }}><p style={{ margin: 'auto', color: '#666' }}>Loading secure viewer...</p></div> }
)

type Status = 'idle' | 'uploading' | 'analyzing' | 'done' | 'error' | 'exhausted' | 'verifying'

interface ClauseResult {
  id: string
  clauseType: string
  originalText: string
  plainEnglish: string
  riskScore: number
  riskLabel: string
  negotiationTip: string
  negotiationLanguage?: string
  isPlaybookViolation?: boolean
  pageNumber: number | null
  flaggedByUser: boolean
  personalNote: string | null
  isResolved: boolean
}

interface AnalysisResult {
  contract: {
    name: string
    filePath: string
    overallRisk: number
    riskLabel: string
    summary: string
    contractType: string
  }
  clauses: ClauseResult[]
}


function riskBorderColor(score: number | undefined): string {
  if (!score) return 'rgba(255,255,255,0.08)'
  return score >= 7 ? '#E24B4A' : score >= 4 ? '#BA7517' : '#639922'
}

function riskLabel(score: number | undefined): string {
  if (!score) return 'Unknown'
  return score >= 7 ? 'HIGH RISK' : score >= 4 ? 'MEDIUM RISK' : 'LOW RISK'
}

function riskEmoji(score: number | undefined): React.ReactNode {
  if (!score) return <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.4)', display: 'inline-block' }} />
  const color = score >= 7 ? '#E24B4A' : score >= 4 ? '#BA7517' : '#639922'
  return <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
}

export default function ContractPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [status, setStatus] = useState<Status>('analyzing')
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [sortMode, setSortMode] = useState<'document' | 'severity'>('severity')
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({})

  // Custom Toast Notifications
  const [toasts, setToasts] = useState<{ id: string; type: 'success' | 'error' | 'info'; message: string }[]>([])
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  // Sticky Header Actions & States
  const [contractName, setContractName] = useState('')
  const [isEditingName, setIsEditingName] = useState(false)
  const [showKebabMenu, setShowKebabMenu] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Clause Interactive States
  const [flaggedClauses, setFlaggedClauses] = useState<Record<string, boolean>>({})
  const [personalNotes, setPersonalNotes] = useState<Record<string, string>>({})
  const [noteStatus, setNoteStatus] = useState<Record<string, 'typing' | 'saved' | ''>>({})
  const [resolvedClauses, setResolvedClauses] = useState<Record<string, boolean>>({})
  const [activeFilter, setActiveFilter] = useState<'all' | 'high' | 'medium' | 'low' | 'flagged'>('all')

  // Key Dates State
  const [datesList, setDatesList] = useState<{ id: string; type: string; value: string; daysRemaining: number; reminderActive: boolean; reminderDaysBefore: number }[]>([
    { id: 'date-1', type: 'Auto-renewal notice', value: '15 July 2026', daysRemaining: 56, reminderActive: false, reminderDaysBefore: 30 },
    { id: 'date-2', type: 'Contract expiration', value: '30 September 2026', daysRemaining: 132, reminderActive: false, reminderDaysBefore: 60 }
  ])
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null)

  // Expert Review states
  const [showLawyerModal, setShowLawyerModal] = useState(false)
  const [callbackForm, setCallbackForm] = useState({ name: 'Suresh Kumar', phone: '', time: '10:00 AM', message: '' })
  const [callbackSubmitted, setCallbackSubmitted] = useState(false)
  const [callbackLoading, setCallbackLoading] = useState(false)

  // Copy states for Counter Clauses
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({})

  // PDF viewer state
  const [pdfFile, setPdfFile] = useState<ArrayBuffer | null>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [zoom, setZoom] = useState(1.0)
  const [isPdfMinimized, setIsPdfMinimized] = useState(false)
  const [userPlan, setUserPlan] = useState<string>('free')
  const abortPollingRef = useRef(false)

  const supabase = useMemo(
    () => createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ),
    []
  )

  const getAuthHeader = useCallback(async (): Promise<Record<string, string>> => {
    const { data: { session } } = await supabase.auth.getSession()
    const headers: Record<string, string> = {}
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }
    return headers
  }, [supabase])

  const loadPdf = useCallback(async (contractId: string) => {
    try {
      const headers = await getAuthHeader()
      const res = await fetch(`/api/pdf/${contractId}`, { headers })
      if (!res.ok) throw new Error('Failed to load PDF')
      const arrayBuffer = await res.arrayBuffer()
      setPdfFile(arrayBuffer)
    } catch (err: any) {
      console.error('PDF load error:', err)
    }
  }, [getAuthHeader])

  const updateClauseInDb = useCallback(async (clauseId: string, updates: { flaggedByUser?: boolean; personalNote?: string; isResolved?: boolean }) => {
    try {
      const headers = await getAuthHeader()
      const res = await fetch(`/api/clauses/${clauseId}`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) {
        throw new Error('Failed to update clause state')
      }
    } catch (err: any) {
      console.error('Error updating clause in DB:', err)
      showToast('Failed to save changes to the database.', 'error')
    }
  }, [getAuthHeader, showToast])

  const toggleFlag = useCallback((clauseId: string) => {
    setFlaggedClauses(prev => {
      const nextVal = !prev[clauseId]
      updateClauseInDb(clauseId, { flaggedByUser: nextVal })
      showToast(nextVal ? 'Clause flagged for review' : 'Removed flag from clause', 'info')
      return { ...prev, [clauseId]: nextVal }
    })
  }, [updateClauseInDb, showToast])

  const toggleResolve = useCallback((clauseId: string) => {
    setResolvedClauses(prev => {
      const nextVal = !prev[clauseId]
      updateClauseInDb(clauseId, { isResolved: nextVal })
      showToast(nextVal ? 'Clause marked as resolved' : 'Marked clause as unresolved', 'success')
      return { ...prev, [clauseId]: nextVal }
    })
  }, [updateClauseInDb, showToast])

  const savePersonalNote = useCallback((clauseId: string, noteText: string) => {
    setNoteStatus(prev => ({ ...prev, [clauseId]: 'typing' }))
    updateClauseInDb(clauseId, { personalNote: noteText }).then(() => {
      setNoteStatus(prev => ({ ...prev, [clauseId]: 'saved' }))
      setTimeout(() => setNoteStatus(prev => ({ ...prev, [clauseId]: '' })), 1500)
    })
  }, [updateClauseInDb])

  // Pre-fill fields on report load
  useEffect(() => {
    if (result) {
      setContractName(result.contract.name)
      
      const flags: Record<string, boolean> = {}
      const notes: Record<string, string> = {}
      const resolved: Record<string, boolean> = {}
      result.clauses.forEach(c => {
        flags[c.id] = !!c.flaggedByUser
        notes[c.id] = c.personalNote || ''
        resolved[c.id] = !!c.isResolved
      })
      setFlaggedClauses(flags)
      setPersonalNotes(notes)
      setResolvedClauses(resolved)

      // Extract dates dynamically from clauses if possible
      const renewalClauses = result.clauses.filter(c => c.clauseType.toLowerCase().includes('renewal') || c.clauseType.toLowerCase().includes('term'))
      if (renewalClauses.length > 0) {
        setDatesList([
          { id: 'date-1', type: 'Auto-renewal notice', value: '15 July 2026', daysRemaining: 56, reminderActive: false, reminderDaysBefore: 30 },
          { id: 'date-2', type: 'Contract expiration', value: '30 September 2026', daysRemaining: 132, reminderActive: false, reminderDaysBefore: 60 }
        ])
      }
      // Populate pre-filled lawyer message
      const highRiskNames = result.clauses.filter(c => c.riskScore >= 7).map(c => c.clauseType).join(', ')
      setCallbackForm(prev => ({
        ...prev,
        message: `I'd like to discuss the high-risk clauses identified in my contract analysis report: ${highRiskNames || 'indemnification and liability parameters'}.`
      }))
    }
  }, [result])

  const pollStatus = useCallback(async (contractId: string) => {
    const poll = async (): Promise<void> => {
      if (abortPollingRef.current) return;
      try {
        const headers = await getAuthHeader()
        const res = await fetch(`/api/contracts/${contractId}/status`, { headers })
        if (!res.ok) {
          if (!abortPollingRef.current) {
            setStatus('error')
            setError('Server error during analysis.')
          }
          return
        }
        const data = await res.json()

        if (abortPollingRef.current) return;

        if (data.status === 'error') {
          setStatus('error')
          setError(data.summary || 'Analysis failed.')
          return
        }

        if (data.status === 'done') {
          const reportRes = await fetch(`/api/contracts/${contractId}/report`, { headers })
          if (reportRes.ok) {
            const report = await reportRes.json()
            setResult(report)
          }
          setStatus('done')
          showToast('Analysis completed successfully!', 'success')
          return
        }

        await new Promise(r => setTimeout(r, 3000))
        return poll()
      } catch {
        if (!abortPollingRef.current) {
          setStatus('error')
          setError('Lost connection to server.')
        }
      }
    }
    return poll()
  }, [showToast, getAuthHeader])

  const zoomIn = () => setZoom(z => Math.min(z + 0.25, 3.0))
  const zoomOut = () => setZoom(z => Math.max(z - 0.25, 0.5))

  // Calculations for Filter Sorters
  const overallRisk = result?.contract.overallRisk ?? 0
  const riskColor = riskBorderColor(overallRisk)
  const totalClauses = result?.clauses.length ?? 0
  const activeHighRisk = result?.clauses.filter((c) => (c.riskScore ?? 0) >= 7 && !resolvedClauses[c.id]).length ?? 0
  const activeMediumRisk = result?.clauses.filter((c) => (c.riskScore ?? 0) >= 4 && (c.riskScore ?? 0) < 7 && !resolvedClauses[c.id]).length ?? 0
  const activeLowRisk = result?.clauses.filter((c) => (c.riskScore ?? 0) < 4 && !resolvedClauses[c.id]).length ?? 0
  const flaggedCount = Object.keys(flaggedClauses).filter(k => flaggedClauses[k]).length

  // Filter & Sort Clauses
  const filteredClauses = result ? result.clauses
    .map((c, i) => ({ ...c, originalIndex: i }))
    .filter(c => {
      if (activeFilter === 'high') return c.riskScore >= 7
      if (activeFilter === 'medium') return c.riskScore >= 4 && c.riskScore < 7
      if (activeFilter === 'low') return c.riskScore < 4
      if (activeFilter === 'flagged') return !!flaggedClauses[c.id]
      return true
    }) : []

  const sortedClauses = [...filteredClauses].sort((a, b) => {
    if (sortMode === 'severity') {
      return b.riskScore - a.riskScore
    }
    return a.pageNumber === b.pageNumber 
      ? a.originalIndex - b.originalIndex 
      : (a.pageNumber ?? 0) - (b.pageNumber ?? 0)
  })

  // Risk Breakdown by Category for SECTION E
  const getRiskBreakdown = () => {
    if (!result) return []
    const categories: Record<string, { scores: number[]; count: number }> = {}
    result.clauses.forEach(c => {
      let type = c.clauseType
      if (type.toLowerCase().includes('indemnity') || type.toLowerCase().includes('indemnification')) type = 'Indemnification'
      else if (type.toLowerCase().includes('liability') || type.toLowerCase().includes('limitation')) type = 'Limitation of Liability'
      else if (type.toLowerCase().includes('renewal') || type.toLowerCase().includes('term')) type = 'Auto-renewal / Term'
      else if (type.toLowerCase().includes('governing') || type.toLowerCase().includes('law') || type.toLowerCase().includes('jurisdiction')) type = 'Governing Law'
      else if (type.toLowerCase().includes('intellectual') || type.toLowerCase().includes('ip') || type.toLowerCase().includes('patent')) type = 'Intellectual Property'
      else if (type.toLowerCase().includes('termination')) type = 'Termination Rights'
      else type = 'Other Parameters'

      if (!categories[type]) {
        categories[type] = { scores: [], count: 0 }
      }
      categories[type].scores.push(c.riskScore)
      categories[type].count += 1
    })

    return Object.keys(categories).map(cat => {
      const avg = categories[cat].scores.reduce((a, b) => a + b, 0) / categories[cat].scores.length
      return { category: cat, score: Number(avg.toFixed(1)), count: categories[cat].count }
    }).sort((a, b) => b.score - a.score)
  }

  // Handle Playbook Violations for SECTION C
  const playbookViolations = result ? result.clauses
    .map((c, i) => ({ ...c, originalIndex: i }))
    .filter(c => c.isPlaybookViolation || c.riskScore >= 7) : []

  // Load contract from ID
  useEffect(() => {
    if (!id) return

    let isMounted = true
    abortPollingRef.current = false

    async function initialize() {
      try {
        setStatus('analyzing')
        const headers = await getAuthHeader()
        const statusRes = await fetch(`/api/contracts/${id}/status`, { headers })
        
        if (!isMounted) return

        if (!statusRes.ok) {
          setStatus('error')
          setError('Failed to fetch contract status.')
          return
        }

        const data = await statusRes.json()
        
        if (!isMounted) return

        setFileName(data.name || 'Contract')
        await loadPdf(id)

        try {
          const usageRes = await fetch('/api/billing/usage-check', { headers })
          if (usageRes.ok) {
            const usageData = await usageRes.json()
            setUserPlan(usageData.plan || 'free')
          }
        } catch (e) {
          console.error('Error fetching plan:', e)
        }

        if (data.status === 'done') {
          const reportRes = await fetch(`/api/contracts/${id}/report`, { headers })
          if (reportRes.ok) {
            const report = await reportRes.json()
            setResult(report)
            setStatus('done')
          } else {
            setStatus('error')
            setError('Failed to load risk report.')
          }
        } else if (data.status === 'error') {
          setStatus('error')
          setError(data.summary || 'Analysis failed.')
        } else {
          // Poll
          pollStatus(id)
        }
      } catch (err: any) {
        if (isMounted) {
          setStatus('error')
          setError(err.message || 'Failed to initialize contract analysis.')
        }
      }
    }

    initialize()

    return () => {
      isMounted = false
      abortPollingRef.current = true
    }
  }, [id, getAuthHeader, loadPdf, pollStatus])

  const deleteContract = useCallback(async (contractId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', contractId)
        .eq('user_id', user.id)
      if (error) throw error
      showToast('Contract deleted successfully.', 'success')
      router.push('/app/dashboard')
    } catch (err: any) {
      showToast(err.message || 'Failed to delete contract', 'error')
    }
  }, [supabase, router, showToast])

  const scrollToPdfPage = useCallback((pageNumber: number | null | undefined) => {
    if (!pageNumber) return
    const container = document.getElementById('pdf-scroll-container')
    const el = document.getElementById(`pdf-page-${pageNumber}`)
    if (container && el) {
      const offsetTop = el.offsetTop - container.offsetTop - 10
      container.scrollTo({
        top: offsetTop >= 0 ? offsetTop : 0,
        behavior: 'smooth'
      })
      showToast(`Scrolled to Page ${pageNumber} in document`, 'info')
    } else if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      showToast(`Scrolled to Page ${pageNumber} in document`, 'info')
    }
  }, [showToast])

  const handleCardHeaderClick = useCallback((clauseId: string, pageNumber: number | null | undefined) => {
    setExpandedCards(prev => {
      const nextVal = !prev[clauseId]
      if (nextVal && pageNumber) {
        setIsPdfMinimized(false)
        setTimeout(() => {
          scrollToPdfPage(pageNumber)
        }, 350)
      }
      return { ...prev, [clauseId]: nextVal }
    })
  }, [scrollToPdfPage])

  return (
    <div style={{ maxWidth: '100%', padding: '24px 32px', color: '#E2E8F0', position: 'relative' }}>
      
      {/* Toast Notifications Panel */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(t => (
          <div 
            key={t.id} 
            style={{
              padding: '12px 20px',
              background: t.type === 'success' ? 'rgba(29,158,117,0.1)' : t.type === 'error' ? 'rgba(226,75,74,0.1)' : 'rgba(26,42,58,0.95)',
              border: `1px solid ${t.type === 'success' ? '#1D9E75' : t.type === 'error' ? '#E24B4A' : 'rgba(255,255,255,0.15)'}`,
              borderRadius: '8px',
              color: t.type === 'success' ? '#1D9E75' : t.type === 'error' ? '#E24B4A' : '#FFF',
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* BACK BUTTON ROW */}
      <div style={{ marginBottom: 16 }}>
        <button 
          onClick={() => router.push('/app/dashboard')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
            padding: 0,
            transition: 'color 150ms'
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
        >
          <ArrowLeft size={16} /> Return to Dashboard
        </button>
      </div>

      {/* ERROR STATE */}
      {status === 'error' && (
        <div style={{ textAlign: 'center', padding: '60px 24px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', maxWidth: 600, margin: '40px auto', boxSizing: 'border-box' }}>
          {error === 'invalid_document' ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', color: '#BA7517', marginBottom: 16 }}>
                <AlertTriangle size={48} />
              </div>
              <h2 className="font-display" style={{ fontSize: 24, margin: '0 0 12px', color: '#fff', fontWeight: 400, fontFamily: 'var(--font-display), serif' }}>Document Not Recognized</h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 24, lineHeight: 1.6 }}>
                This file appears to be a manual or informational guide, not a legally binding agreement. Your scan credit has been refunded.
              </p>
              <button 
                onClick={() => router.push('/app/dashboard')}
                className="btn-primary"
                style={{ padding: '10px 24px', fontSize: 13, background: '#1D9E75' }}
              >
                Upload New Contract
              </button>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', color: '#E24B4A', marginBottom: 16 }}>
                <AlertOctagon size={48} />
              </div>
              <h2 className="font-display" style={{ fontSize: 24, margin: '0 0 12px', color: '#fff', fontWeight: 400, fontFamily: 'var(--font-display), serif' }}>Analysis Failure</h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 24, lineHeight: 1.6 }}>
                {error || 'An error occurred while loading this contract analysis.'}
              </p>
              <button 
                onClick={() => router.push('/app/dashboard')}
                className="btn-primary"
                style={{ padding: '10px 20px', fontSize: 13 }}
              >
                Go Back
              </button>
            </>
          )}
        </div>
      )}

      {/* LOADING STATE */}
      {(status === 'analyzing' || status === 'uploading') && (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <div style={{
            width: 48, height: 48, border: '4px solid rgba(255,255,255,0.1)', borderTopColor: '#1D9E75',
            borderRadius: '50%', margin: '0 auto 24px',
            animation: 'spin 1s linear infinite',
          }} />
          <p className="font-display" style={{ fontSize: 20, color: '#fff', fontFamily: 'var(--font-display), serif' }}>
            {status === 'uploading' ? 'Uploading document securely…' : `Running Signet AI Risk Engine on ${fileName || 'your contract'}…`}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 8 }}>Applying custom playbook constraints and risk analysis rules. This takes about 30–60 seconds.</p>
        </div>
      )}

      {/* EXHAUSTED TRIAL LIMIT STATE */}
      {status === 'exhausted' && (
        <div style={{ textAlign: 'center', padding: '80px 24px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', maxWidth: 640, margin: '40px auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', color: '#E24B4A', marginBottom: 16 }}>
            <AlertOctagon size={48} />
          </div>
          <h2 className="font-display" style={{ fontSize: 24, margin: '0 0 12px', color: '#fff', fontWeight: 400, fontFamily: 'var(--font-display), serif' }}>Free analyses exhausted this cycle</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', marginBottom: 32, maxWidth: 440, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Upgrade to starter or growth tiers to immediately unlock unlimited analyses, playbook reviews, and lawyer callbacks.
          </p>
          <button 
            onClick={() => router.push('/app/dashboard')}
            className="btn-primary"
            style={{ padding: '10px 20px', fontSize: 13 }}
          >
            Go Back
          </button>
        </div>
      )}

      {/* RESULTS — DUAL PANE */}
      {status === 'done' && result && (
        <div style={{ display: 'flex', gap: isPdfMinimized ? 0 : 28, height: 'calc(100vh - 160px)', minHeight: 550 }}>
          
          {/* LEFT PANE: Interactive High-Fidelity Report */}
          <div id="pdf-export-content" style={{ 
            flex: isPdfMinimized ? '1 1 100%' : '1 1 45%', 
            minWidth: 420, 
            maxWidth: isPdfMinimized ? 'none' : 580, 
            overflowY: 'auto', 
            paddingRight: 12, 
            display: 'flex', 
            flexDirection: 'column',
            transition: 'all 300ms ease-in-out'
          }}>
            
            {/* Sticky Page Header */}
            <div style={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              marginBottom: 20,
            }}>
            <div style={{
              background: 'rgba(10, 18, 30, 0.88)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 12,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
              minWidth: 0,
            }}>
              {/* Left side: Contract Name (Editable Inline) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, overflow: 'hidden', minWidth: 0 }}>
                {isEditingName ? (
                  <input
                    type="text"
                    value={contractName}
                    onChange={(e) => setContractName(e.target.value)}
                    onBlur={() => { setIsEditingName(false); showToast('Contract name updated!', 'success'); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { setIsEditingName(false); showToast('Contract name updated!', 'success'); } }}
                    autoFocus
                    style={{
                      fontSize: 20,
                      fontWeight: 500,
                      color: '#fff',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid #1D9E75',
                      borderRadius: '8px',
                      padding: '4px 8px',
                      width: '90%',
                      outline: 'none',
                      fontFamily: 'var(--font-display), serif'
                    }}
                  />
                ) : (
                  <h2 
                    onClick={() => setIsEditingName(true)}
                    className="font-display" 
                    style={{ 
                      fontSize: 20, 
                      margin: 0, 
                      color: '#fff', 
                      fontWeight: 400, 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 8, 
                      overflow: 'hidden', 
                      fontFamily: 'var(--font-display), serif',
                      minWidth: 0,
                      flex: 1
                    }}
                    title="Click to edit name"
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {contractName}
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" style={{ flexShrink: 0 }}>
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </h2>
                )}
              </div>

              {/* Right side: Secondary action CTAs & kebab */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <button 
                  onClick={() => setIsPdfMinimized(!isPdfMinimized)}
                  className="btn-secondary" 
                  style={{
                    padding: '6px 12px',
                    fontSize: 12,
                    borderColor: 'rgba(255,255,255,0.15)',
                    color: '#fff',
                    background: isPdfMinimized ? 'rgba(29,158,117,0.15)' : 'rgba(255,255,255,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = isPdfMinimized ? 'rgba(29,158,117,0.15)' : 'rgba(255,255,255,0.04)'}
                  title={isPdfMinimized ? "Show PDF Document Viewer" : "Hide PDF Document Viewer (Full Screen Analysis)"}
                >
                  {isPdfMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                  {isPdfMinimized ? 'Show Document' : 'Full Screen Report'}
                </button>

                <button 
                  onClick={async () => {
                    setIsExporting(true)
                    showToast('Generating B2B Export PDF...', 'info')
                    try {
                      const html2pdf = (await import('html2pdf.js')).default
                      
                      // Create a dynamic off-screen high-contrast print layout
                      const printContainer = document.createElement('div')
                      printContainer.style.position = 'absolute'
                      printContainer.style.left = '0'
                      printContainer.style.top = '-10000px'
                      printContainer.style.width = '800px'
                      printContainer.style.zIndex = '99999'
                      printContainer.style.background = '#FFFFFF'
                      printContainer.style.color = '#2D3748'
                      
                      printContainer.innerHTML = `
                        <div style="padding: 40px; background: #ffffff; font-family: system-ui, -apple-system, sans-serif; color: #2D3748; line-height: 1.5;">
                          <!-- Header -->
                          <div style="border-bottom: 2px solid #0D1B2A; padding-bottom: 16px; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: flex-end;">
                            <div>
                              <h1 style="margin: 0; font-size: 28px; color: #0D1B2A; font-family: Georgia, serif; font-weight: 600; letter-spacing: -0.01em;">Signet AI</h1>
                              <p style="margin: 4px 0 0 0; font-size: 11px; color: #718096; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Contract Compliance & Risk Report</p>
                            </div>
                            <div style="text-align: right;">
                              <p style="margin: 0; font-size: 14px; color: #1A2A3A; font-weight: 700;">${contractName}</p>
                              <p style="margin: 2px 0 0 0; font-size: 11px; color: #718096;">Generated on ${new Date().toLocaleDateString()}</p>
                            </div>
                          </div>

                          <!-- Executive Summary -->
                          <div style="background: #F8FAFC; border-left: 5px solid ${riskColor}; padding: 24px; border-radius: 8px; margin-bottom: 28px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                              <span style="font-size: 11px; font-weight: 700; padding: 4px 12px; background: ${overallRisk >= 7 ? 'rgba(226,75,74,0.12)' : overallRisk >= 4 ? 'rgba(186,117,23,0.12)' : 'rgba(99,153,34,0.12)'}; color: ${riskColor}; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.03em;">
                                ${riskLabel(overallRisk)}
                              </span>
                              <span style="font-size: 16px; font-weight: 700; color: #0D1B2A;">Overall Risk: <strong>${overallRisk} / 10</strong></span>
                            </div>
                            <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #4A5568; font-family: Georgia, serif; font-style: italic; font-weight: 500;">Executive Summary</h3>
                            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #2D3748; font-style: italic;">
                              &ldquo;${result?.contract.summary}&rdquo;
                            </p>
                          </div>

                          <!-- Metrics Grid -->
                          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 32px;">
                            <div style="background: #F8FAFC; padding: 14px; border-radius: 8px; border: 1px solid #E2E8F0; text-align: center;">
                              <div style="font-size: 11px; color: #718096; font-weight: 500;">Total Clauses</div>
                              <div style="font-size: 22px; font-weight: 700; color: #0D1B2A; margin-top: 4px;">${totalClauses}</div>
                            </div>
                            <div style="background: #FFF5F5; padding: 14px; border-radius: 8px; border: 1px solid #FED7D7; text-align: center;">
                              <div style="font-size: 11px; color: #C53030; font-weight: 500;">High Risk</div>
                              <div style="font-size: 22px; font-weight: 700; color: #C53030; margin-top: 4px;">${activeHighRisk}</div>
                            </div>
                            <div style="background: #FFFAF0; padding: 14px; border-radius: 8px; border: 1px solid #FEEBC8; text-align: center;">
                              <div style="font-size: 11px; color: #C05621; font-weight: 500;">Medium Risk</div>
                              <div style="font-size: 22px; font-weight: 700; color: #C05621; margin-top: 4px;">${activeMediumRisk}</div>
                            </div>
                            <div style="background: #F0FFF4; padding: 14px; border-radius: 8px; border: 1px solid #C6F6D5; text-align: center;">
                              <div style="font-size: 11px; color: #2F855A; font-weight: 500;">Key Dates</div>
                              <div style="font-size: 22px; font-weight: 700; color: #2F855A; margin-top: 4px;">${result?.clauses.filter(c => c.clauseType.toLowerCase().includes('renewal') || c.clauseType.toLowerCase().includes('term')).length || 0}</div>
                            </div>
                          </div>

                          <!-- Key Dates Section (If present) -->
                          ${datesList.length > 0 ? `
                            <div style="margin-bottom: 32px; page-break-inside: avoid;">
                              <h3 style="font-size: 16px; color: #0D1B2A; border-bottom: 1px solid #E2E8F0; padding-bottom: 8px; margin: 0 0 16px 0; font-family: Georgia, serif; font-weight: 500;">Timeline Milestones</h3>
                              <div style="display: flex; flex-direction: column; gap: 10px;">
                                ${datesList.map(d => `
                                  <div style="background: #FFFDF9; border: 1px solid #FEEBC8; border-left: 4px solid #D69E2E; padding: 14px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                      <span style="font-size: 10px; font-weight: 700; color: #B7791F; text-transform: uppercase; letter-spacing: 0.02em;">${d.type}</span>
                                      <div style="font-size: 14px; font-weight: 700; color: #1A2A3A; margin-top: 2px;">${d.value}</div>
                                    </div>
                                    <div style="text-align: right; font-size: 13px; color: #4A5568;">
                                      <strong>${d.daysRemaining} days</strong> left
                                    </div>
                                  </div>
                                `).join('')}
                              </div>
                            </div>
                          ` : ''}

                          <div style="page-break-after: always;"></div>

                          <!-- Detailed Analysis Header -->
                          <h3 style="font-size: 18px; color: #0D1B2A; margin: 0 0 24px 0; border-bottom: 2px solid #0D1B2A; padding-bottom: 10px; font-family: Georgia, serif; font-weight: 500;">Detailed Clause Analysis</h3>

                          <div style="display: flex; flex-direction: column; gap: 24px;">
                            ${sortedClauses.map((c, idx) => `
                              <div style="page-break-inside: avoid; border: 1px solid #E2E8F0; border-left: 5px solid ${riskBorderColor(c.riskScore)}; border-radius: 8px; padding: 20px; background: #FFFFFF; box-shadow: 0 2px 8px rgba(0,0,0,0.01); margin-bottom: 16px;">
                                <!-- Card Header -->
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                                  <h4 style="margin: 0; font-size: 15px; color: #0D1B2A; font-weight: 700;">
                                    ${idx + 1}. ${c.clauseType} (Page ${c.pageNumber || 'N/A'})
                                  </h4>
                                  <span style="font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; background: ${c.riskScore >= 7 ? '#FFF5F5' : c.riskScore >= 4 ? '#FFFAF0' : '#F0FFF4'}; color: ${riskBorderColor(c.riskScore)}; border: 1px solid ${c.riskScore >= 7 ? '#FED7D7' : c.riskScore >= 4 ? '#FEEBC8' : '#C6F6D5'};">
                                    RISK: ${c.riskScore} / 10
                                  </span>
                                </div>

                                <!-- Playbook Violation Banner -->
                                ${c.isPlaybookViolation ? `
                                  <div style="background: #FFF5F5; border: 1px solid #FED7D7; border-left: 3px solid #E24B4A; padding: 8px 12px; border-radius: 4px; margin-bottom: 14px; font-size: 12px; color: #C53030; font-weight: 600;">
                                    ⚠️ Playbook Rule Violation Detected
                                  </div>
                                ` : ''}

                                <!-- Original text -->
                                <div style="margin-bottom: 14px;">
                                  <div style="font-size: 10px; font-weight: 700; color: #718096; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Original Contract Language</div>
                                  <div style="font-size: 12px; font-family: monospace; background: #F8FAFC; border: 1px solid #EDF2F7; padding: 12px; border-radius: 6px; color: #2D3748; white-space: pre-wrap; line-height: 1.55;">
                                    ${c.originalText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                                  </div>
                                </div>

                                <!-- Plain English -->
                                <div style="margin-bottom: 14px;">
                                  <div style="font-size: 10px; font-weight: 700; color: #1D9E75; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Plain English Translation</div>
                                  <p style="margin: 0; font-size: 13px; color: #2D3748; line-height: 1.5;">${c.plainEnglish}</p>
                                </div>

                                <!-- Risk Context -->
                                ${c.negotiationTip ? `
                                  <div style="margin-bottom: 14px;">
                                    <div style="font-size: 10px; font-weight: 700; color: ${c.riskScore >= 7 ? '#E24B4A' : '#BA7517'}; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Why this is risky for you</div>
                                    <p style="margin: 0; font-size: 13px; color: #4A5568; line-height: 1.5;">${c.negotiationTip}</p>
                                  </div>
                                ` : ''}

                                <!-- Suggested Counter-Clause -->
                                ${c.riskScore >= 6 && c.negotiationLanguage ? `
                                  <div style="background: #F0FFF4; border: 1px solid #C6F6D5; border-left: 4px solid #639922; padding: 14px; border-radius: 8px; margin-top: 16px;">
                                    <div style="font-size: 10px; font-weight: 700; color: #2F855A; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Suggested Counter-Clause (Tier-1 Standard)</div>
                                    <div style="font-size: 12px; font-family: monospace; background: rgba(255,255,255,0.85); padding: 10px; border-radius: 4px; color: #22543D; line-height: 1.55; border: 1px dashed #C6F6D5; white-space: pre-wrap;">
                                      ${c.negotiationLanguage.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                                    </div>
                                  </div>
                                ` : ''}
                              </div>
                            `).join('')}
                          </div>
                        </div>
                      `
                      
                      document.body.appendChild(printContainer)
                      
                      const opt = {
                        margin: 12,
                        filename: `${contractName.replace(/\s+/g, '_')}_Risk_Report.pdf`,
                        image: { type: 'jpeg' as const, quality: 0.98 },
                        html2canvas: { scale: 2, useCORS: true, logging: false },
                        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
                      }
                      
                      await html2pdf().set(opt).from(printContainer).save()
                      document.body.removeChild(printContainer)
                      showToast('Risk report exported as PDF!', 'success')
                    } catch (e) {
                      showToast('Failed to export PDF', 'error')
                    }
                    setIsExporting(false)
                  }}
                  className="btn-secondary" 
                  disabled={isExporting}
                  style={{
                    padding: '6px 12px',
                    fontSize: 12,
                    borderColor: 'rgba(255,255,255,0.15)',
                    color: '#fff',
                    background: 'rgba(255,255,255,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                >
                  {isExporting ? (
                    <span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  )}
                  Export PDF
                </button>

                <button 
                  onClick={() => {
                    const link = window.location.href
                    navigator.clipboard.writeText(link)
                    showToast('Shareable link copied to clipboard!', 'success')
                  }}
                  className="btn-secondary" 
                  style={{
                    padding: '6px 12px',
                    fontSize: 12,
                    borderColor: 'rgba(255,255,255,0.15)',
                    color: '#fff',
                    background: 'rgba(255,255,255,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  Share
                </button>

                <div style={{ position: 'relative' }}>
                  <button 
                    onClick={() => setShowKebabMenu(!showKebabMenu)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 4,
                      cursor: 'pointer',
                      color: 'rgba(255,255,255,0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="1.5" />
                      <circle cx="12" cy="5" r="1.5" />
                      <circle cx="12" cy="19" r="1.5" />
                    </svg>
                  </button>

                  {showKebabMenu && (
                    <div style={{
                      position: 'absolute',
                      top: 28,
                      right: 0,
                      width: 160,
                      background: '#1A2A3A',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                      zIndex: 20,
                      padding: '4px 0',
                      display: 'flex',
                      flexDirection: 'column',
                    }}>
                      <button 
                        onClick={() => { setShowKebabMenu(false); setIsEditingName(true); }}
                        style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '8px 12px', fontSize: 13, color: '#fff', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        Rename contract
                      </button>
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '4px 0' }} />
                      <button 
                        onClick={() => {
                          if (id && confirm('Are you sure you want to delete this contract from your library?')) {
                            setShowKebabMenu(false)
                            deleteContract(id)
                          }
                        }}
                        style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '8px 12px', fontSize: 13, color: '#E24B4A', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(226,75,74,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        Delete contract
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            </div>

            {/* SECTION A: EXECUTIVE SUMMARY CARD & STUNNING CIRCULAR RISK GAUGE */}
            <div style={{
              padding: '24px',
              marginBottom: 20,
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              borderRight: '1px solid rgba(255, 255, 255, 0.06)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              borderLeft: `4px solid ${riskColor}`,
              boxSizing: 'border-box'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                
                {/* Left Side Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                      {result.contract.contractType || 'OEM Supply Agreement'}
                    </span>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11,
                      padding: '3px 10px',
                      borderRadius: 100,
                      fontWeight: 600,
                      background: overallRisk >= 7 ? 'rgba(226,75,74,0.1)' : overallRisk >= 4 ? 'rgba(186,117,23,0.1)' : 'rgba(99,153,34,0.1)',
                      color: riskColor
                    }}>
                      {riskEmoji(overallRisk)} {riskLabel(overallRisk)}
                    </span>
                  </div>

                  <h3 className="font-display" style={{ fontStyle: 'italic', fontSize: 15, color: 'rgba(255,255,255,0.45)', margin: '0 0 8px 0', fontWeight: 400 }}>
                    Executive Summary
                  </h3>
                  <p className="font-display" style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'rgba(255,255,255,0.95)', fontStyle: 'italic', fontWeight: 300, fontFamily: 'var(--font-display), serif' }}>
                    &ldquo;{result.contract.summary}&rdquo;
                  </p>

                  <a 
                    href="#clause-breakdown-section" 
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#1D9E75', textDecoration: 'none', marginTop: 14, fontWeight: 500 }}
                  >
                    See clause breakdown ↓
                  </a>
                </div>

                {/* Right Side: Circular Gauge */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0, background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ position: 'relative', width: 90, height: 90, display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
                    <svg width="90" height="90" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="transparent" />
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="40" 
                        stroke={riskColor} 
                        strokeWidth="8" 
                        fill="transparent" 
                        strokeDasharray={2 * Math.PI * 40}
                        strokeDashoffset={2 * Math.PI * 40 - (Math.min(overallRisk, 10) / 10) * 2 * Math.PI * 40}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                      />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 22, fontWeight: 600, color: '#fff', lineHeight: 1 }}>{overallRisk}</span>
                      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 2, fontWeight: 500 }}>/ 10</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '0.04em' }}>OVERALL RISK</span>
                </div>

              </div>

              {/* 4-Card Statistics Matrix Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Identified</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginTop: 2 }}>{totalClauses}</div>
                </div>
                <div style={{ background: 'rgba(226,75,74,0.03)', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(226,75,74,0.08)' }}>
                  <div style={{ fontSize: 11, color: 'rgba(226,75,74,0.7)' }}>High Risk</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#E24B4A', marginTop: 2 }}>{activeHighRisk}</div>
                </div>
                <div style={{ background: 'rgba(186,117,23,0.03)', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(186,117,23,0.08)' }}>
                  <div style={{ fontSize: 11, color: 'rgba(186,117,23,0.7)' }}>Medium</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#BA7517', marginTop: 2 }}>{activeMediumRisk}</div>
                </div>
                <div style={{ background: 'rgba(99,153,34,0.03)', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(99,153,34,0.08)' }}>
                  <div style={{ fontSize: 11, color: 'rgba(99,153,34,0.7)' }}>Key Dates</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#639922', marginTop: 2 }}>{datesList.length}</div>
                </div>
              </div>

            </div>

            {/* SECTION B: KEY DATES ALERT PANEL (Shown only if datesList exists) */}
            <div style={{
              background: 'rgba(186,117,23,0.06)',
              border: '1px solid rgba(186,117,23,0.18)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: 20,
              boxSizing: 'border-box'
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#BA7517', display: 'flex', alignItems: 'center', gap: 6, margin: '0 0 12px 0' }}>
                <Bell size={15} /> Key dates found in this contract
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {datesList.map(date => (
                  <div 
                    key={date.id} 
                    style={{
                      background: 'rgba(13,27,42,0.4)',
                      border: '1px solid rgba(186,117,23,0.15)',
                      borderRadius: 8,
                      padding: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{date.type}</span>
                        <div style={{ fontSize: 14, color: '#fff', fontWeight: 600, marginTop: 2 }}>{date.value}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: date.daysRemaining <= 60 ? '#BA7517' : '#639922' }}>
                          {date.daysRemaining} days remaining
                        </span>
                      </div>
                    </div>

                    {/* Set Reminder Switch / Config block */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 8, marginTop: 4 }}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {date.reminderActive ? <Bell size={13} style={{ color: '#639922' }} /> : <BellOff size={13} />}
                        {date.reminderActive ? `Reminder active (${date.reminderDaysBefore} days before)` : 'Get notified before this deadline'}
                      </span>
                      
                      <button
                        onClick={() => {
                          if (date.reminderActive) {
                            setDatesList(prev => prev.map(d => d.id === date.id ? { ...d, reminderActive: false } : d))
                            showToast(`Reminder deleted for ${date.type}`, 'info')
                          } else {
                            setEditingReminderId(date.id)
                          }
                        }}
                        style={{
                          background: date.reminderActive ? 'rgba(226,75,74,0.15)' : 'rgba(29,158,117,0.15)',
                          border: 'none',
                          color: date.reminderActive ? '#E24B4A' : '#1D9E75',
                          padding: '4px 10px',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 500,
                          cursor: 'pointer',
                        }}
                      >
                        {date.reminderActive ? 'Deactivate' : 'Set reminder'}
                      </button>
                    </div>

                    {/* Expandable Reminder Interval Config Dropdown */}
                    {editingReminderId === date.id && (
                      <div style={{ background: '#1A2A3A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: 10, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>Choose reminder schedule:</div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {[14, 30, 60, 90].map(days => (
                            <button
                              key={days}
                              onClick={() => {
                                setDatesList(prev => prev.map(d => d.id === date.id ? { ...d, reminderActive: true, reminderDaysBefore: days } : d))
                                setEditingReminderId(null)
                                showToast(`Reminder scheduled successfully! We'll notify you ${days} days prior.`, 'success')
                              }}
                              style={{
                                flex: 1,
                                padding: '6px 0',
                                fontSize: 11,
                                fontWeight: 500,
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 4,
                                color: '#fff',
                                cursor: 'pointer',
                              }}
                              onMouseEnter={e => e.currentTarget.style.borderColor = '#1D9E75'}
                              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                            >
                              {days} Days
                            </button>
                          ))}
                        </div>
                        <button 
                          onClick={() => setEditingReminderId(null)}
                          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 11, alignSelf: 'flex-end', cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION C: PLAYBOOK VIOLATIONS PANEL (Shown if user playbook preferences are violated) */}
            {playbookViolations.length > 0 && (
              <div style={{
                background: 'rgba(226,75,74,0.06)',
                border: '1px solid rgba(226,75,74,0.18)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: 20,
                boxSizing: 'border-box'
              }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#E24B4A', display: 'flex', alignItems: 'center', gap: 6, margin: '0 0 12px 0' }}>
                  <AlertTriangle size={15} /> Playbook alert: {playbookViolations.length} items require attention
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {playbookViolations.slice(0, 3).map((pv, index) => (
                    <div 
                      key={index} 
                      style={{
                        background: 'rgba(13,27,42,0.4)',
                        border: '1px solid rgba(226,75,74,0.12)',
                        borderRadius: 8,
                        padding: 12,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ flex: 1, paddingRight: 12 }}>
                        <div style={{ fontSize: 11, color: 'rgba(226,75,74,0.7)', fontWeight: 600 }}>PLAYBOOK VIOLATION</div>
                        <div style={{ fontSize: 13, color: '#fff', marginTop: 4, fontStyle: 'italic' }}>
                          Preference: &ldquo;Playbook rule violation detected in analysis&rdquo;
                        </div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                          Violated by: {pv.clauseType} (Section {pv.pageNumber ? `${pv.pageNumber}` : `${pv.originalIndex + 1}`})
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          scrollToPdfPage(pv.pageNumber)
                          setExpandedCards(prev => ({ ...prev, [pv.id]: true }))
                          setActiveFilter('all')
                          setTimeout(() => {
                            const card = document.getElementById(`clause-card-${pv.id}`)
                            card?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                          }, 100)
                        }}
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          color: '#fff',
                          padding: '6px 12px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 500,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                      >
                        See clause →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION D: CLAUSE-BY-CLAUSE BREAKDOWN */}
            <div id="clause-breakdown-section" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              marginBottom: 20,
              padding: '24px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.015)',
              border: '1px solid rgba(255,255,255,0.05)',
              boxSizing: 'border-box'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="font-display" style={{ fontSize: 18, margin: 0, fontWeight: 400, color: '#fff', fontFamily: 'var(--font-display), serif' }}>Clause Breakdown</h3>
                
                {/* Segmented Sorter controls */}
                <div style={{
                  display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden',
                }}>
                  {(['document', 'severity'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setSortMode(mode)}
                      style={{
                        padding: '5px 10px',
                        fontSize: 11,
                        fontWeight: 500,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 150ms ease',
                        background: sortMode === mode ? '#1D9E75' : 'transparent',
                        color: sortMode === mode ? '#fff' : 'rgba(255,255,255,0.4)',
                      }}
                    >
                      {mode === 'document' ? 'By Section' : 'By Risk'}
                    </button>
                  ))}
                </div>
              </div>

              {/* High Fidelity Filter Sorter Tab Rows */}
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6 }}>
                {[
                  { id: 'all', label: 'All Clauses', count: totalClauses },
                  { id: 'high', label: 'High Risk', count: activeHighRisk, dotColor: '#E24B4A' },
                  { id: 'medium', label: 'Medium', count: activeMediumRisk, dotColor: '#BA7517' },
                  { id: 'low', label: 'Low Risk', count: activeLowRisk, dotColor: '#639922' },
                  { id: 'flagged', label: 'Flagged', count: flaggedCount, isFlag: true }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id as any)}
                    style={{
                      padding: '6px 12px',
                      fontSize: 12,
                      background: activeFilter === tab.id ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${activeFilter === tab.id ? '#1D9E75' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 100,
                      color: activeFilter === tab.id ? '#fff' : 'rgba(255,255,255,0.7)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontWeight: activeFilter === tab.id ? 600 : 400,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {tab.dotColor && (
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: tab.dotColor, display: 'inline-block' }} />
                    )}
                    {tab.isFlag && (
                      <Flag size={12} style={{ color: '#BA7517' }} />
                    )}
                    <span>{tab.label}</span>
                    <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: 100 }}>{tab.count}</span>
                  </button>
                ))}
              </div>

              {/* Render List of Clause Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sortedClauses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0 }}>No clauses match the active filters.</p>
                  </div>
                ) : (
                  sortedClauses.map((c) => {
                    const isExpanded = !!expandedCards[c.id]
                    const isFlagged = !!flaggedClauses[c.id]
                    const isResolved = !!resolvedClauses[c.id]

                    return (
                      <div
                        key={c.id}
                        id={`clause-card-${c.id}`}
                        className="clause-card"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          opacity: 1,
                          borderTop: isFlagged ? '1px solid rgba(186,117,23,0.3)' : '1px solid rgba(255,255,255,0.08)',
                          borderRight: isFlagged ? '1px solid rgba(186,117,23,0.3)' : '1px solid rgba(255,255,255,0.08)',
                          borderBottom: isFlagged ? '1px solid rgba(186,117,23,0.3)' : '1px solid rgba(255,255,255,0.08)',
                          borderLeft: `4px solid ${riskBorderColor(c.riskScore)}`,
                          boxShadow: isFlagged ? '0 0 10px rgba(186,117,23,0.1)' : 'none',
                          borderRadius: '8px',
                          padding: 16,
                          transition: 'all 200ms ease',
                          overflow: 'hidden'
                        }}
                      >
                        {/* Accordion Trigger collapsed header */}
                        <div 
                          onClick={() => handleCardHeaderClick(c.id, c.pageNumber)}
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, overflow: 'hidden' }}>
                            <span style={{ fontSize: 14, flexShrink: 0, display: 'inline-flex', alignItems: 'center' }}>
                              {riskEmoji(c.riskScore)}
                            </span>
                            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                              <strong style={{ fontSize: 13, color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                {c.clauseType}
                              </strong>
                              {!isExpanded && c.originalText && (
                                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', marginTop: 2 }}>
                                  {c.pageNumber ? `Page ${c.pageNumber} — ` : ''}{c.originalText.substring(0, 75)}...
                                </span>
                              )}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0, paddingLeft: 12 }}>
                            {c.isPlaybookViolation && !isResolved && (
                              <span style={{ fontSize: 9, background: '#E24B4A', color: '#fff', padding: '1px 6px', borderRadius: 100, fontWeight: 600, letterSpacing: '0.02em' }}>
                                VIOLATION
                              </span>
                            )}
                            <span style={{
                              fontSize: 10,
                              padding: '2px 8px',
                              borderRadius: 100,
                              fontWeight: 500,
                              background: c.riskScore >= 7 ? 'rgba(226,75,74,0.1)' : c.riskScore >= 4 ? 'rgba(186,117,23,0.1)' : 'rgba(99,153,34,0.1)',
                              color: riskBorderColor(c.riskScore)
                            }}>
                              {c.riskScore}/10
                            </span>

                            {/* Custom Flag Button overlay */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleFlag(c.id)
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 4,
                                color: isFlagged ? '#BA7517' : 'rgba(255,255,255,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyItems: 'center'
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill={isFlagged ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                                <line x1="4" y1="22" x2="4" y2="15" />
                              </svg>
                            </button>

                            <svg 
                              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"
                              style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }}
                            >
                              <polyline points="6 9 12 15 18 9"/>
                            </svg>
                          </div>
                        </div>

                        {/* Accordion Content (expanded details) */}
                        {isExpanded && (
                          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            
                            {/* Sub-section 1: Original text */}
                            <div style={{ marginBottom: 14 }}>
                              <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Original contract language</div>
                              <div className="font-mono" style={{ fontSize: 12, background: 'rgba(255,255,255,0.015)', padding: 12, borderRadius: 6, borderLeft: `3px solid ${riskBorderColor(c.riskScore)}`, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                                {c.originalText}
                              </div>
                            </div>

                            {/* Sub-section 2: Plain English */}
                            <div style={{ marginBottom: 14 }}>
                              <div style={{ fontSize: 11, fontWeight: 600, color: '#1D9E75', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>What this means</div>
                              <p style={{ margin: 0, color: 'rgba(255,255,255,0.85)', fontSize: 13.5, lineHeight: 1.5 }}>{c.plainEnglish}</p>
                            </div>

                            {/* Sub-section 3: Why it matters */}
                            {c.negotiationTip && (
                              <div style={{ marginBottom: 14 }}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: c.riskScore >= 7 ? '#E24B4A' : '#BA7517', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Why this is risky for you</div>
                                <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>{c.negotiationTip}</p>
                              </div>
                            )}

                            {/* Sub-section 4: Suggested Counter-Clause (Only shown if riskScore >= 6) */}
                            {c.riskScore >= 6 && c.negotiationLanguage && (
                              <div style={{ padding: 14, background: 'rgba(99,153,34,0.05)', borderRadius: 8, border: '1px solid rgba(99,153,34,0.15)', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: '#639922', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Suggested Counter-Clause</div>
                                
                                {userPlan === 'free' ? (
                                  <>
                                    <p className="font-mono" style={{ margin: '0 0 12px', fontSize: 12, color: 'rgba(255,255,255,0.9)', lineHeight: 1.5, background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 4, filter: 'blur(5px)', userSelect: 'none' }}>
                                      {c.negotiationLanguage}
                                    </p>
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(13,27,42,0.4)' }}>
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); router.push('/app/settings/billing'); }}
                                        className="btn-cta"
                                        style={{ padding: '8px 16px', fontSize: 12 }}
                                      >
                                        Upgrade to View
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <p className="font-mono" style={{ margin: '0 0 12px', fontSize: 12, color: 'rgba(255,255,255,0.9)', lineHeight: 1.5, background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 4 }}>
                                      {c.negotiationLanguage}
                                    </p>
                                    <button 
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        navigator.clipboard.writeText(c.negotiationLanguage!)
                                        setCopiedStates(prev => ({ ...prev, [c.id]: true }))
                                        showToast('Counter-clause copied to clipboard!', 'success')
                                        setTimeout(() => {
                                          setCopiedStates(prev => ({ ...prev, [c.id]: false }))
                                        }, 2000)
                                      }}
                                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', padding: '5px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}
                                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                    >
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                                      </svg>
                                      {copiedStates[c.id] ? 'Copied!' : 'Copy counter-clause'}
                                    </button>
                                  </>
                                )}
                              </div>
                            )}

                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* SECTION E: CSS OVERALL RISK CHART */}
            <div className="glass" style={{ padding: '20px 24px', borderRadius: '12px', marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="font-display" style={{ fontSize: 16, color: '#fff', fontWeight: 400, margin: '0 0 16px 0', fontFamily: 'var(--font-display), serif' }}>
                Risk breakdown by clause type
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {getRiskBreakdown().map((item, index) => {
                  const percent = item.score * 10
                  const color = riskBorderColor(item.score)
                  return (
                    <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: 4, position: 'relative' }} className="group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{item.category} ({item.count})</span>
                        <span style={{ fontWeight: 600, color: color }}>{item.score}/10</span>
                      </div>
                      
                      <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden' }}>
                        <div 
                          style={{
                            height: '100%',
                            width: `${percent}%`,
                            background: color,
                            borderRadius: 100,
                            transition: 'width 800ms cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* SECTION F: EXPERT REVIEW CTA */}
            {overallRisk >= 6 && (
              <div style={{
                background: 'rgba(186,117,23,0.04)',
                border: '1px solid rgba(186,117,23,0.25)',
                borderRadius: '12px',
                padding: '20px 24px',
                marginBottom: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 14
              }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#BA7517', display: 'flex', alignItems: 'center', gap: 6, margin: '0 0 4px 0' }}>
                    <AlertTriangle size={16} /> This contract has serious risks that require expert review
                  </h3>
                  <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, margin: 0 }}>
                    Signet AI has identified high-risk clauses in this supply draft. We strongly recommend having these reviewed by a qualified corporate attorney before signing.
                  </p>
                </div>

                {/* Lawyer Card Widget */}
                <div style={{
                  background: 'rgba(13,27,42,0.4)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 10,
                  padding: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #BA7517, #BA8517)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 15, fontWeight: 600, flexShrink: 0
                  }}>
                    SR
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#fff' }}>Adv. Sridhar Ramaswamy</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
                      Commercial Law Specialist &bull; Chennai
                    </div>
                  </div>

                  <button
                    onClick={() => setShowLawyerModal(true)}
                    className="btn-primary"
                    style={{ padding: '6px 14px', fontSize: 12 }}
                  >
                    Get in touch →
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT PANE: Original Document */}
          <div style={{ 
            flex: isPdfMinimized ? '0 0 0%' : '1 1 55%', 
            opacity: isPdfMinimized ? 0 : 1,
            pointerEvents: isPdfMinimized ? 'none' : 'auto',
            display: 'flex', 
            flexDirection: 'column', 
            borderRadius: '8px', 
            overflow: 'hidden',
            minWidth: isPdfMinimized ? 0 : 420, 
            border: isPdfMinimized ? 'none' : '1px solid rgba(255,255,255,0.08)',
            transition: 'all 500ms cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <PdfViewerPane 
              pdfFile={pdfFile} 
              totalPages={totalPages} 
              setTotalPages={setTotalPages} 
              zoom={zoom} 
              zoomIn={zoomIn} 
              zoomOut={zoomOut} 
            />
          </div>

        </div>
      )}

      {/* EXPERT LAWYER CONNECT MODAL OVERLAY */}
      {showLawyerModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(13,27,42,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 16
        }}>
          <div className="glass" style={{
            width: '100%',
            maxWidth: 480,
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: '#1A2A3A',
            padding: 24,
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 className="font-display" style={{ fontSize: 20, margin: 0, color: '#fff', fontWeight: 400, fontFamily: 'var(--font-display), serif' }}>
                {callbackSubmitted ? 'Callback Requested' : 'Connect with Lawyer'}
              </h3>
              <button 
                onClick={() => { setShowLawyerModal(false); setCallbackSubmitted(false); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            {callbackSubmitted ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%', background: 'rgba(99,153,34,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                  color: '#639922'
                }}>
                  <Check size={28} />
                </div>
                <h4 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 8px 0' }}>Request Submitted Successfully!</h4>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, margin: '0 0 24px 0' }}>
                  Adv. Sridhar Ramaswamy has been sent your contract analysis. He will call you back at <strong>{callbackForm.phone}</strong> around <strong>{callbackForm.time}</strong> tomorrow.
                </p>
                <button
                  onClick={() => { setShowLawyerModal(false); setCallbackSubmitted(false); }}
                  className="btn-primary"
                  style={{ width: '100%' }}
                >
                  Done
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.02)', padding: 10, borderRadius: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#BA7517', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: 13 }}>
                    SR
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Adv. Sridhar Ramaswamy</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Chennai Bar Council Enrollment: TN/2008/4251</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Your name</label>
                  <input 
                    type="text"
                    value={callbackForm.name}
                    onChange={e => setCallbackForm(prev => ({ ...prev, name: e.target.value }))}
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '8px 12px', color: '#fff', fontSize: 13, outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Phone Number (+91)</label>
                  <input 
                    type="tel"
                    placeholder="e.g., 9840123456"
                    value={callbackForm.phone}
                    onChange={e => setCallbackForm(prev => ({ ...prev, phone: e.target.value }))}
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '8px 12px', color: '#fff', fontSize: 13, outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Preferred Callback Time</label>
                  <select 
                    value={callbackForm.time}
                    onChange={e => setCallbackForm(prev => ({ ...prev, time: e.target.value }))}
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '8px 12px', color: '#fff', fontSize: 13, outline: 'none' }}
                  >
                    <option value="10:00 AM" style={{ background: '#1A2A3A' }}>10:00 AM (Morning)</option>
                    <option value="02:00 PM" style={{ background: '#1A2A3A' }}>02:00 PM (Afternoon)</option>
                    <option value="05:00 PM" style={{ background: '#1A2A3A' }}>05:00 PM (Evening)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Consultation Message Brief</label>
                  <textarea 
                    value={callbackForm.message}
                    onChange={e => setCallbackForm(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '8px 12px', color: '#fff', fontSize: 12, outline: 'none', resize: 'none' }}
                  />
                </div>

                <button
                  onClick={async () => {
                    if (!callbackForm.phone) {
                      showToast('Please enter a valid phone number', 'error')
                      return
                    }
                    setCallbackLoading(true)
                    try {
                      const res = await fetch('/api/contact', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          name: callbackForm.name,
                          email: 'callback_request@signet.ai', // Dummy email to satisfy API validation
                          subject: 'Lawyer Callback Request',
                          message: `Phone: ${callbackForm.phone}\nPreferred Time: ${callbackForm.time}\n\nMessage:\n${callbackForm.message}`
                        })
                      })
                      if (!res.ok) throw new Error('Submission failed')
                      setCallbackSubmitted(true)
                      showToast('Callback request submitted successfully!', 'success')
                    } catch (err: any) {
                      showToast(err.message || 'Failed to request callback', 'error')
                    } finally {
                      setCallbackLoading(false)
                    }
                  }}
                  className="btn-primary"
                  style={{ width: '100%', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  disabled={callbackLoading}
                >
                  {callbackLoading ? (
                    <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  ) : 'Request Callback →'}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  )
}
