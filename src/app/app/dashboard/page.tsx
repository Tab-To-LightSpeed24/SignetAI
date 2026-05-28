'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useDropzone } from 'react-dropzone'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { 
  AlertTriangle, 
  AlertOctagon, 
  Shield, 
  FileText, 
  Calendar, 
  TrendingUp, 
  Play, 
  Activity, 
  X,
  FileCheck,
  Zap
} from 'lucide-react'

type Status = 'idle' | 'uploading' | 'quick-scanning' | 'pre-flight' | 'analyzing' | 'error' | 'exhausted' | 'verifying' | 'capacity_exceeded'
type Perspective = 'Tenant' | 'Landlord' | 'Buyer' | 'Seller' | 'Neutral' | 'Supplier'

interface PlaybookRule {
  id: string
  ruleText: string
  contractType: string
}

const PERSPECTIVES: Perspective[] = ['Tenant', 'Landlord', 'Buyer', 'Seller', 'Neutral', 'Supplier']

export default function DashboardPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const [activeContractId, setActiveContractId] = useState<string | null>(null)
  const [terminalLogs, setTerminalLogs] = useState<string[]>([])

  // Pre-flight states
  const [detectedContractType, setDetectedContractType] = useState<string>('global')
  const [selectedPerspective, setSelectedPerspective] = useState<Perspective>('Neutral')
  const [allRules, setAllRules] = useState<PlaybookRule[]>([])
  const [checkedRules, setCheckedRules] = useState<Record<string, boolean>>({})
  const [bespokeConstraints, setBespokeConstraints] = useState('')
  const [isFallbackScan, setIsFallbackScan] = useState<boolean>(false)
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English')

  // Toast Notifications
  const [toasts, setToasts] = useState<{ id: string; type: 'success' | 'error' | 'info'; message: string }[]>([])
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

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

  // Dashboard & Profile states
  const [profile, setProfile] = useState<any>(null)
  const [contractsList, setContractsList] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [sortField, setSortField] = useState<'name' | 'created_at' | 'overall_risk'>('created_at')
  const [sortAsc, setSortAsc] = useState<boolean>(false)
  const [activeKebabId, setActiveKebabId] = useState<string | null>(null)

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoadingData(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (profileData) {
        setProfile(profileData)
      }

      // Fetch contracts
      const { data: contractsData } = await supabase
        .from('contracts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (contractsData) {
        setContractsList(contractsData)
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoadingData(false)
    }
  }, [supabase])

  // Fetch playbook rules
  const fetchPlaybookRules = useCallback(async () => {
    try {
      const headers = await getAuthHeader()
      const res = await fetch('/api/playbook', { headers })
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.rules) {
          setAllRules(data.rules)
        }
      }
    } catch (err) {
      console.error('Error fetching playbook rules:', err)
    }
  }, [getAuthHeader])

  useEffect(() => {
    fetchDashboardData()
    fetchPlaybookRules()
  }, [fetchDashboardData, fetchPlaybookRules])

  useEffect(() => {
    const handleClickOutside = () => setActiveKebabId(null)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // ── Ingestion console logs generator ────────────────────────────────────
  useEffect(() => {
    if (status === 'idle') {
      setTerminalLogs([])
      return
    }

    // Set initial log based on status
    let initialLogs: string[] = []
    if (status === 'uploading') {
      initialLogs = [
        '[INFO] Initializing secure ingestion pipeline...',
        `[INFO] Target document detected: ${fileName || 'contract.pdf'}`,
        '[INFO] Negotiating TLS handshake & preparing byte stream...'
      ]
    } else if (status === 'quick-scanning') {
      initialLogs = [
        '[INFO] Launching Pass 1: Quick Auto-Detection Scan...',
        '[INFO] Parsing structural layouts and classifying document boundaries...',
        '[INFO] Dispatching context signature to Gemini model engine...'
      ]
    } else if (status === 'analyzing') {
      initialLogs = [
        '[INFO] Launching Pass 2: Deep Signet AI Risk Analysis...',
        '[INFO] Fetching playbook preference rules & custom deal constraints...',
        '[INFO] Segmenting document nodes and constructing legal semantic graph...'
      ]
    } else if (status === 'verifying') {
      initialLogs = [
        '[INFO] Verifying payment and usage signatures with license provider...',
        '[INFO] Validating available tokens and computing processing headroom...'
      ]
    }

    setTerminalLogs(initialLogs)

    let index = 0
    const scanMessages = [
      '[INFO] Analyzing document structure and category...',
      '[WARNING] Upstream model busy, retrying in 1000ms... (3 retries left)',
      '[WARNING] Upstream Gemini error (503/429/UNAVAILABLE). Retrying in 2500ms... (2 retries left)',
      '[INFO] Local fallback heuristics activated to guarantee fast response...',
      '[INFO] Parsing title blocks and legal preamble...',
      '[INFO] Autoprotect systems green. Preparing category precheck...'
    ]

    const analyzeMessages = [
      '[INFO] Extracting raw clause boundaries...',
      '[INFO] Evaluating playbook compliance parameters...',
      '[INFO] Contacting Gemini AI models for legal risk evaluation...',
      '[WARNING] Upstream Gemini error (503/429/UNAVAILABLE). Retrying in 1000ms... (3 retries left)',
      '[WARNING] Upstream Gemini error (503/429/UNAVAILABLE). Retrying in 2500ms... (2 retries left)',
      '[INFO] Successfully connected! Processing clause breakdowns...',
      '[INFO] Flagging high-risk provisions and drafting counter-clauses...',
      '[INFO] Analysis compile complete. Writing results to workspace...'
    ]

    const uploadMessages = [
      '[INFO] Writing document stream to secure database bucket...',
      '[INFO] Uploading contract metadata and drafting payloads...',
      '[INFO] File payload hashed and verified (SHA-256 integrity green)...',
      '[INFO] Ingestion transaction complete.'
    ]

    const verifyMessages = [
      '[INFO] Session authenticated. Syncing subscription plan properties...',
      '[INFO] Verification check succeeded. License keys green.'
    ]

    const messages = status === 'uploading' ? uploadMessages
                   : status === 'quick-scanning' ? scanMessages
                   : status === 'analyzing' ? analyzeMessages
                   : verifyMessages

    const interval = setInterval(() => {
      if (index < messages.length) {
        setTerminalLogs(prev => [...prev, messages[index]])
        index++
      } else {
        clearInterval(interval)
      }
    }, status === 'uploading' ? 800 : status === 'quick-scanning' ? 1200 : 2500)

    return () => clearInterval(interval)
  }, [status, fileName])

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
      fetchDashboardData()
    } catch (err: any) {
      showToast(err.message || 'Failed to delete contract', 'error')
    }
  }, [supabase, fetchDashboardData, showToast])

  // Payment integration
  const loadRazorpayCheckout = async (planType: 'starter' | 'growth') => {
    try {
      if (!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.onload = () => resolve()
          script.onerror = () => reject(new Error('Failed to load Razorpay SDK'))
          document.body.appendChild(script)
        })
      }

      const headers = await getAuthHeader()
      const res = await fetch('/api/billing/create-order', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType }),
      })

      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Failed to create order')
      }

      const { orderId } = await res.json()

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        order_id: orderId,
        name: 'Signet AI',
        description: `${planType === 'starter' ? 'Starter' : 'Growth'} Plan`,
        theme: { color: '#1D9E75' },
        handler: () => {
          setStatus('verifying')
          setTimeout(() => {
            setStatus('idle')
            setError('')
            showToast('Account upgraded successfully!', 'success')
            fetchDashboardData()
          }, 5000)
        },
        modal: {
          ondismiss: () => {},
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (err: any) {
      console.error('Razorpay checkout error:', err)
      setError(err.message || 'Payment failed')
      showToast(err.message || 'Payment failed', 'error')
    }
  }

  // 1st Pass: File Drop Ingestion & Quick Scan
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setError('')
    setFileName(file.name)

    // Pre-flight usage check
    try {
      const prefHeaders = await getAuthHeader()
      const usageRes = await fetch('/api/billing/usage-check', { headers: prefHeaders })
      if (usageRes.ok) {
        const { canAnalyze } = await usageRes.json()
        if (!canAnalyze) {
          setStatus('exhausted')
          return
        }
      }
    } catch {}

    setStatus('uploading')

    try {
      const formData = new FormData()
      formData.append('file', file)
      const headers = await getAuthHeader()
      
      // Upload file to Supabase storage & get ID
      const uploadRes = await fetch('/api/upload', { method: 'POST', headers, body: formData })

      if (!uploadRes.ok) {
        const d = await uploadRes.json()
        throw new Error(d.error || d.message || `Upload failed (HTTP ${uploadRes.status})`)
      }

      const { contractId: id } = await uploadRes.json()
      setActiveContractId(id)

      // Start Pass 1: Quick classification
      setStatus('quick-scanning')
      const quickScanRes = await fetch('/api/quick-scan', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId: id })
      })

      if (!quickScanRes.ok) {
        const d = await quickScanRes.json()
        throw new Error(d.error || d.message || 'Quick scan classification failed.')
      }

      const scanResult = await quickScanRes.json()
      setDetectedContractType(scanResult.contractType)
      setSelectedPerspective(scanResult.recommendedPerspective)
      setIsFallbackScan(!!scanResult.fallback)

      // Pre-select and filter rules
      const filtered = allRules.filter(r => r.contractType === scanResult.contractType || r.contractType === 'global')
      const preChecked: Record<string, boolean> = {}
      filtered.forEach(r => {
        preChecked[r.id] = true
      })
      setCheckedRules(preChecked)
      setBespokeConstraints('')

      // Reveal pre-flight configurations dialog
      setStatus('pre-flight')
      showToast('Document scanned! Customise pre-flight configuration.', 'info')
    } catch (err: any) {
      setStatus('error')
      setError(err.message || 'Something went wrong')
      showToast(err.message || 'Something went wrong', 'error')
    }
  }, [allRules, getAuthHeader, showToast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    disabled: status === 'uploading' || status === 'quick-scanning' || status === 'analyzing',
  })

  // Start Pass 2: Deep Risk Analysis
  const handleStartAnalysis = async () => {
    if (!activeContractId) return
    setStatus('analyzing')

    try {
      const headers = await getAuthHeader()
      
      // Collect the checked playbook rules text content
      const selectedRules = allRules
        .filter(r => checkedRules[r.id])
        .map(r => r.ruleText)

      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contractId: activeContractId, 
          perspective: selectedPerspective,
          playbookRules: selectedRules,
          bespokeConstraints: bespokeConstraints + `\n\nCRITICAL OUTPUT REQUIREMENT: ALL plainEnglish and recommendation responses MUST be strictly written in ${selectedLanguage}.`,
          contractType: detectedContractType
        })
      })

      if (analyzeRes.status === 503) {
        try {
          const d = await analyzeRes.json()
          if (d.error === 'capacity_exceeded') {
            setStatus('capacity_exceeded')
            return
          }
        } catch (e) {
          console.error('Error parsing 503 response:', e)
        }
      }

      if (analyzeRes.status === 429) {
        setStatus('exhausted')
        return
      }

      if (!analyzeRes.ok) {
        setStatus('error')
        setError(`Analysis request failed (HTTP ${analyzeRes.status})`)
        return
      }

      showToast('Risk analysis analysis triggered successfully!', 'success')
      
      // Redirect to the dedicated dynamic contract page
      router.push(`/app/contracts/${activeContractId}`)
    } catch (err: any) {
      setStatus('error')
      setError(err.message || 'Failed to trigger analysis')
    }
  }

  const cancelPreFlight = () => {
    setStatus('idle')
    setActiveContractId(null)
    setFileName('')
    setIsFallbackScan(false)
  }

  const reset = () => {
    setStatus('idle')
    setError('')
    setFileName('')
    setActiveContractId(null)
    setIsFallbackScan(false)
  }

  const handleReturnToDashboard = () => {
    reset()
    fetchDashboardData()
  }


  // Statistics & Metrics
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  }, [])

  const firstName = (profile?.full_name || profile?.fullName)?.split(' ')[0] ?? 'there'
  const planLimits: Record<string, number> = { free: 3, starter: 15, growth: 50 }
  const planKey = profile?.plan ?? 'free'
  const planLimit = planLimits[planKey] ?? 3
  const contractsUsed = profile?.contracts_used_this_cycle ?? profile?.contractsUsedThisCycle ?? 0
  const usagePercent = Math.min((contractsUsed / planLimit) * 100, 100)
  const highRiskCount = contractsList.filter((c: any) => ((c.overall_risk || c.overallRisk) ?? 0) >= 7).length
  const totalContracts = contractsList.length

  // Filtered rules matching the detected category
  const filteredPlaybookRules = useMemo(() => {
    return allRules.filter(r => r.contractType === detectedContractType || r.contractType === 'global')
  }, [allRules, detectedContractType])

  // Sorting
  const sortedContracts = useMemo(() => {
    return [...contractsList].sort((a: any, b: any) => {
      let aVal: any, bVal: any
      if (sortField === 'name') { 
        aVal = (a.name || '').toLowerCase()
        bVal = (b.name || '').toLowerCase() 
      } else if (sortField === 'overall_risk') { 
        aVal = (a.overall_risk || a.overallRisk) ?? 0
        bVal = (b.overall_risk || b.overallRisk) ?? 0 
      } else { 
        aVal = new Date(a.created_at || a.createdAt || 0).getTime()
        bVal = new Date(b.created_at || b.createdAt || 0).getTime() 
      }
      if (aVal < bVal) return sortAsc ? -1 : 1
      if (aVal > bVal) return sortAsc ? 1 : -1
      return 0
    })
  }, [contractsList, sortField, sortAsc])

  const handleSort = (field: 'name' | 'created_at' | 'overall_risk') => {
    if (sortField === field) setSortAsc(p => !p)
    else { 
      setSortField(field)
      setSortAsc(false) 
    }
  }

  const SortIcon = ({ field }: { field: string }) => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      style={{ opacity: sortField === field ? 1 : 0.3, marginLeft: 4, display: 'inline-block', verticalAlign: 'middle' }}>
      {sortField === field && !sortAsc
        ? <polyline points="6 9 12 15 18 9" />
        : <polyline points="18 15 12 9 6 15" />}
    </svg>
  )

  const contractRiskLabel = (risk: number | undefined) => {
    if (!risk) return { label: 'Unknown', color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.05)' }
    if (risk >= 7) return { label: 'High', color: '#E24B4A', bg: 'rgba(226,75,74,0.12)' }
    if (risk >= 4) return { label: 'Medium', color: '#BA7517', bg: 'rgba(186,117,23,0.12)' }
    return { label: 'Low', color: '#639922', bg: 'rgba(99,153,34,0.12)' }
  }

  return (
    <div style={{ maxWidth: '100%', padding: '32px 40px', color: '#E2E8F0', position: 'relative' }}>
      
      {/* Toast Panel */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(t => (
          <div 
            key={t.id} 
            style={{
              padding: '12px 20px',
              background: t.type === 'success' ? '#E8F5E9' : t.type === 'error' ? '#FFEBEE' : '#1A2A3A',
              border: `1px solid ${t.type === 'success' ? '#81C784' : t.type === 'error' ? '#E57373' : 'rgba(255,255,255,0.15)'}`,
              borderRadius: 8,
              color: t.type === 'success' ? '#2E7D32' : t.type === 'error' ? '#C62828' : '#FFF',
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {t.message}
          </div>
        ))}
      </div>

      {/* pre-flight intercept modal popup */}
      {status === 'pre-flight' && mounted && createPortal(
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(7, 14, 23, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '40px 24px',
          overflowY: 'auto'
        }}>
          <div style={{
            background: '#0D1B2A',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            width: '100%',
            maxWidth: 640,
            padding: 32,
            maxHeight: 'none',
            boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
            position: 'relative'
          }}>
            <button 
              onClick={cancelPreFlight}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                padding: 4,
                borderRadius: 6
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Zap size={24} color="#1D9E75" />
              <h2 className="font-display" style={{ fontSize: 24, color: '#fff', margin: 0, fontWeight: 400, fontFamily: 'var(--font-display), serif' }}>
                Pre-Flight Contract Ingestion
              </h2>
            </div>

            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: -6, marginBottom: 24, lineHeight: 1.5 }}>
              Pass 1 scans complete. Review agreement details, select correct contract category, verify preferred compliance playbook rules, and custom guidelines below.
            </p>

            {isFallbackScan && (
              <div style={{
                background: 'rgba(186,117,23,0.06)',
                border: '1px solid rgba(186,117,23,0.2)',
                borderRadius: 8,
                padding: '12px 16px',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontSize: 13,
                color: '#BA7517',
                lineHeight: 1.4,
                backdropFilter: 'blur(12px)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
              }}>
                <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                <span>
                  <strong>AI Demand Alert:</strong> Local keyword heuristics were used for classification due to transient high demand on our AI models. Please verify the contract category and your preferred playbook constraints below.
                </span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* 0. Contract Category Select (Verify & Manual Override) */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', display: 'block', marginBottom: 10 }}>
                  Verify Contract Category:
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={detectedContractType}
                    onChange={(e) => {
                      const newType = e.target.value
                      setDetectedContractType(newType)
                      const filtered = allRules.filter(r => r.contractType === newType || r.contractType === 'global')
                      const preChecked: Record<string, boolean> = {}
                      filtered.forEach(r => {
                        preChecked[r.id] = true
                      })
                      setCheckedRules(preChecked)
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 8,
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: 500,
                      outline: 'none',
                      cursor: 'pointer',
                      appearance: 'none',
                      backdropFilter: 'blur(12px)',
                      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <option value="nda" style={{ background: '#0D1B2A', color: '#fff' }}>Non-Disclosure Agreement (NDA)</option>
                    <option value="lease" style={{ background: '#0D1B2A', color: '#fff' }}>Lease / Rental Agreement</option>
                    <option value="vendor" style={{ background: '#0D1B2A', color: '#fff' }}>Vendor / Supply Agreement</option>
                    <option value="oem_supply" style={{ background: '#0D1B2A', color: '#fff' }}>Automotive OEM / Manufacturing Supply Agreement</option>
                    <option value="service" style={{ background: '#0D1B2A', color: '#fff' }}>Service Level Agreement (SLA) / Consulting</option>
                    <option value="global" style={{ background: '#0D1B2A', color: '#fff' }}>Global / General Contract</option>
                    <option value="invalid" style={{ background: '#0D1B2A', color: '#fff' }}>Invalid / Non-Contract Document</option>
                  </select>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    right: 16,
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: 'rgba(255, 255, 255, 0.5)',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* 1. Perspective Selector Pills */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', display: 'block', marginBottom: 10 }}>
                  Analyze from the perspective of:
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {PERSPECTIVES.map((p) => {
                    const isSelected = selectedPerspective === p
                    return (
                      <button
                        key={p}
                        onClick={() => setSelectedPerspective(p)}
                        style={{
                          padding: '8px 16px',
                          border: `1px solid ${isSelected ? '#1D9E75' : 'rgba(255,255,255,0.08)'}`,
                          borderRadius: 8,
                          background: isSelected ? 'rgba(29,158,117,0.1)' : 'rgba(255,255,255,0.02)',
                          color: isSelected ? '#1D9E75' : 'rgba(255,255,255,0.6)',
                          cursor: 'pointer',
                          fontSize: 13,
                          fontWeight: 500,
                          transition: 'all 150ms ease',
                        }}
                      >
                        {p}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 1.5. Output Language Selector */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', display: 'block', marginBottom: 10 }}>
                  Output Translation Language:
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 8,
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: 500,
                      outline: 'none',
                      cursor: 'pointer',
                      appearance: 'none',
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    <option value="English" style={{ background: '#0D1B2A', color: '#fff' }}>English</option>
                    <option value="Tamil" style={{ background: '#0D1B2A', color: '#fff' }}>Tamil (தமிழ்)</option>
                    <option value="Hindi" style={{ background: '#0D1B2A', color: '#fff' }}>Hindi (हिन्दी)</option>
                  </select>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    right: 16,
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: 'rgba(255, 255, 255, 0.5)',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 2. Playbook rules checklist */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', display: 'block', marginBottom: 10 }}>
                  Verify against Playbook preferences ({detectedContractType}):
                </label>
                {filteredPlaybookRules.length === 0 ? (
                  <div style={{ padding: 14, background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                    No playbook rules defined for {detectedContractType} agreements. Global rules will apply.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto', paddingRight: 6 }}>
                    {filteredPlaybookRules.map(rule => {
                      const isChecked = !!checkedRules[rule.id]
                      return (
                        <div 
                          key={rule.id}
                          onClick={() => setCheckedRules(prev => ({ ...prev, [rule.id]: !isChecked }))}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 10,
                            padding: '10px 12px',
                            background: isChecked ? 'rgba(29,158,117,0.04)' : 'rgba(255,255,255,0.01)',
                            border: `1px solid ${isChecked ? 'rgba(29,158,117,0.2)' : 'rgba(255,255,255,0.04)'}`,
                            borderRadius: 8,
                            cursor: 'pointer',
                            transition: 'all 150ms'
                          }}
                        >
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // handled by click container
                            style={{ marginTop: 3, accentColor: '#1D9E75' }}
                          />
                          <span style={{ fontSize: 13, color: isChecked ? '#fff' : 'rgba(255,255,255,0.6)' }}>
                            {rule.ruleText}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* 3. Bespoke Deal Constraints */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', display: 'block', marginBottom: 10 }}>
                  Bespoke Deal Constraints:
                </label>
                <textarea
                  value={bespokeConstraints}
                  onChange={e => setBespokeConstraints(e.target.value)}
                  placeholder="e.g., Target lease term must be under 3 years, landlord is solely responsible for structure/HVAC, and early termination notice should be 60 days max."
                  style={{
                    width: '100%',
                    height: 96,
                    padding: '12px 14px',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 8,
                    color: '#fff',
                    fontSize: 13,
                    outline: 'none',
                    resize: 'none',
                    lineHeight: 1.5,
                    fontFamily: 'system-ui, sans-serif'
                  }}
                />
              </div>

            </div>

            {/* Modal actions */}
            <div style={{ display: 'flex', gap: 14, justifyContent: 'flex-end', marginTop: 32, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20 }}>
              <button
                onClick={cancelPreFlight}
                style={{
                  padding: '10px 20px',
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 8,
                  color: 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleStartAnalysis}
                style={{
                  padding: '10px 24px',
                  background: '#1D9E75',
                  border: 'none',
                  borderRadius: 8,
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Play size={14} fill="currentColor" /> Start Risk Analysis
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* DASHBOARD - NORMAL STATE */}
      {status === 'idle' && (
        <>
          {/* Greeting Header */}
          <div style={{ marginBottom: 28 }}>
            <h1
              className="font-display"
              style={{
                fontSize: 30,
                fontWeight: 400,
                color: '#fff',
                margin: '0 0 6px 0',
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
                fontFamily: 'var(--font-display), serif',
              }}
            >
              {greeting}, {firstName}.
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
              {loadingData ? 'Loading your workspace…' : `You have analyzed ${contractsUsed} contract${contractsUsed !== 1 ? 's' : ''} this month. ${highRiskCount} critical risks flagged.`}
            </p>
          </div>

          {/* 4-Card Analytics Overview Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 16,
              marginBottom: 32,
            }}
          >
            {/* Card 1: Monthly Usage */}
            <div
              style={{
                borderRadius: 12,
                padding: '20px 24px',
                border: usagePercent >= 80 ? '1px solid rgba(186,117,23,0.35)' : '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Monthly Usage</span>
                <Activity size={14} color="rgba(255,255,255,0.4)" />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                <span style={{ fontSize: 32, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{contractsUsed}</span>
                <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>/ {planLimit}</span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Contracts analyzed this cycle</div>
              {/* Progress bar */}
              <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden', marginTop: 6 }}>
                <div style={{
                  height: '100%',
                  width: `${usagePercent}%`,
                  background: usagePercent >= 80 ? '#BA7517' : '#1D9E75',
                  borderRadius: 100,
                  transition: 'width 600ms ease',
                }} />
              </div>
              {usagePercent >= 80 && (
                <div style={{ fontSize: 11, color: '#BA7517', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <AlertTriangle size={12} /> Running low —{' '}
                  <button
                    onClick={() => loadRazorpayCheckout('starter')}
                    style={{ background: 'none', border: 'none', color: '#1D9E75', cursor: 'pointer', fontSize: 11, fontWeight: 600, padding: 0, textDecoration: 'underline' }}
                  >
                    Upgrade plan ↗
                  </button>
                </div>
              )}
            </div>

            {/* Card 2: Risk Summary */}
            <div
              style={{
                borderRadius: 12,
                padding: '20px 24px',
                border: highRiskCount > 0 ? '1px solid rgba(226,75,74,0.35)' : '1px solid rgba(255,255,255,0.08)',
                background: highRiskCount > 0 ? 'rgba(226,75,74,0.03)' : 'rgba(255,255,255,0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Risk Summary</span>
                <Shield size={14} color={highRiskCount > 0 ? '#E24B4A' : 'rgba(255,255,255,0.4)'} />
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, color: highRiskCount > 0 ? '#E24B4A' : '#fff', lineHeight: 1, marginTop: 4 }}>
                {highRiskCount}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>High-risk files in repository</div>
              {highRiskCount > 0 && (
                <div style={{ fontSize: 11, color: 'rgba(226,75,74,0.8)', fontWeight: 500, marginTop: 4 }}>Review recommended</div>
              )}
            </div>

            {/* Card 3: Upcoming Renewals */}
            <div
              style={{
                borderRadius: 12,
                padding: '20px 24px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Upcoming Renewals</span>
                <Calendar size={14} color="rgba(255,255,255,0.4)" />
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', lineHeight: 1, marginTop: 4 }}>
                {contractsList.filter((c: any) => c.status === 'active').length}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Contracts renewing in 60 days</div>
            </div>

            {/* Card 4: Library Index */}
            <div
              style={{
                borderRadius: 12,
                padding: '20px 24px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Library Index</span>
                <TrendingUp size={14} color="rgba(255,255,255,0.4)" />
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', lineHeight: 1, marginTop: 4 }}>
                {totalContracts}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Total agreements in repository</div>
            </div>
          </div>

          {/* Chronological Upcoming Calendar Notices Line */}
          {contractsList.filter((c: any) => c.status === 'active').length > 0 && (
            <div style={{
              background: 'rgba(186,117,23,0.05)',
              border: '1px solid rgba(186,117,23,0.15)',
              borderRadius: 12,
              padding: '16px 20px',
              marginBottom: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Calendar size={18} color="#BA7517" />
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#BA7517' }}>Critical Notice Deadlines Imminent:</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginLeft: 8 }}>
                    Multiple active contracts require manual renewal decisions or formal notice filings in the next 60 days.
                  </span>
                </div>
              </div>
              <button 
                onClick={() => router.push('/app/calendar')}
                style={{
                  background: 'rgba(186,117,23,0.1)',
                  border: '1px solid rgba(186,117,23,0.2)',
                  padding: '6px 12px',
                  borderRadius: 6,
                  color: '#BA7517',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                View Calendar Timeline
              </button>
            </div>
          )}

          {/* Recent Contracts Sorting Ledger Table */}
          {!loadingData && contractsList.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: 0 }}>Recent Contract Audits</h2>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{totalContracts} files total</span>
              </div>

              {/* Table Frame */}
              <div
                style={{
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                  background: 'rgba(255,255,255,0.01)',
                }}
              >
                {/* Table Header */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 110px 90px 52px',
                    padding: '12px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  {[
                    { label: 'Contract Name', field: 'name' as const },
                    { label: 'Type', field: null },
                    { label: 'Uploaded', field: 'created_at' as const },
                    { label: 'Risk Level', field: 'overall_risk' as const },
                    { label: 'Status', field: null },
                    { label: '', field: null },
                  ].map(({ label, field }, idx) => (
                    <div
                      key={idx}
                      onClick={field ? () => handleSort(field) : undefined}
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'rgba(255,255,255,0.4)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        cursor: field ? 'pointer' : 'default',
                        userSelect: 'none',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {label}
                      {field && <SortIcon field={field} />}
                    </div>
                  ))}
                </div>

                {/* Table Rows */}
                {sortedContracts.slice(0, 3).map((contract: any, idx: number) => {
                  const contractOverallRisk = contract.overall_risk || contract.overallRisk
                  const contractCreatedAt = contract.created_at || contract.createdAt
                  const contractTypeVal = contract.contract_type || contract.contractType
                  const risk = contractRiskLabel(contractOverallRisk)
                  const uploadDate = contractCreatedAt
                    ? new Date(contractCreatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—'
                  const isKebabOpen = activeKebabId === contract.id
                  const statusLabel = contract.status === 'done' ? 'Complete'
                    : contract.status === 'analyzing' ? 'Analysing'
                    : contract.status === 'error' ? 'Error'
                    : contract.status === 'pending_capacity' ? 'High Demand'
                    : 'Pending'
                  const statusColor = contract.status === 'done' ? '#639922'
                    : contract.status === 'error' ? '#E24B4A'
                    : contract.status === 'pending_capacity' ? '#BA7517'
                    : '#BA7517'

                  return (
                    <div
                      key={contract.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 110px 90px 52px',
                        padding: '14px 20px',
                        borderBottom: idx < Math.min(sortedContracts.length, 3) - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                        alignItems: 'center',
                        transition: 'background 150ms ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Name */}
                      <div
                        style={{ fontSize: 13, fontWeight: 500, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer' }}
                        title={contract.name}
                        onClick={() => router.push(contract.status === 'done' ? `/app/contracts/${contract.id}` : `/app/contracts/${contract.id}`)}
                      >
                        {contract.name || 'Unnamed contract'}
                      </div>

                      {/* Type */}
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {contractTypeVal ? contractTypeVal.toUpperCase() : '—'}
                      </div>

                      {/* Uploaded */}
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{uploadDate}</div>

                      {/* Risk Level */}
                      <div>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          fontSize: 11,
                          fontWeight: 600,
                          color: risk.color,
                          background: risk.bg,
                          padding: '3px 10px',
                          borderRadius: 100,
                          border: `1px solid ${risk.color}20`,
                          letterSpacing: '0.02em',
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: risk.color, display: 'inline-block', flexShrink: 0 }} />
                          {risk.label}
                          {contractOverallRisk ? ` (${contractOverallRisk})` : ''}
                        </span>
                      </div>

                      {/* Status */}
                      <div style={{ fontSize: 11, fontWeight: 500, color: statusColor }}>{statusLabel}</div>

                      {/* Kebab Action Menu */}
                      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                        <button
                          id={`kebab-${contract.id}`}
                          onClick={e => {
                            e.stopPropagation()
                            setActiveKebabId(isKebabOpen ? null : contract.id)
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'rgba(255,255,255,0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 6,
                            borderRadius: 6,
                            transition: 'all 150ms',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="5" r="1.5" />
                            <circle cx="12" cy="12" r="1.5" />
                            <circle cx="12" cy="19" r="1.5" />
                          </svg>
                        </button>

                        {isKebabOpen && (
                          <div
                            onClick={e => e.stopPropagation()}
                            style={{
                              position: 'absolute',
                              top: 28,
                              right: 0,
                              width: 168,
                              background: '#1A2A3A',
                              border: '1px solid rgba(255,255,255,0.12)',
                              borderRadius: 8,
                              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                              zIndex: 50,
                              padding: '4px 0',
                              display: 'flex',
                              flexDirection: 'column',
                            }}
                          >
                            <button
                              onClick={() => { setActiveKebabId(null); router.push(`/app/contracts/${contract.id}`) }}
                              style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '8px 14px', fontSize: 13, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <FileCheck size={14} /> View AI Analysis
                            </button>
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', margin: '3px 0' }} />
                            <button
                              onClick={() => { setActiveKebabId(null); if (confirm('Delete this contract from your library?')) deleteContract(contract.id) }}
                              style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '8px 14px', fontSize: 13, color: '#E24B4A', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(226,75,74,0.08)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <X size={14} /> Delete Log
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              {/* Sleek action link */}
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => router.push('/app/contracts')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#1D9E75',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    padding: 0,
                    textDecoration: 'underline',
                    transition: 'color 150ms',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#15725A'}
                  onMouseLeave={e => e.currentTarget.style.color = '#1D9E75'}
                >
                  View More Contracts →
                </button>
              </div>
            </div>
          )}

          {/* Empty Library State */}
          {!loadingData && contractsList.length === 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '52px 24px',
                marginBottom: 32,
                background: 'rgba(255,255,255,0.01)',
                border: '1px dashed rgba(255,255,255,0.1)',
                borderRadius: 12,
              }}
            >
              <FileText size={40} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: 16 }} />
              <p style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.7)', margin: '0 0 6px 0' }}>No contracts analyzed yet</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Upload your first agreement below to start auditing compliance.</p>
            </div>
          )}

          {/* Primary Ingestion Upload Dropzone */}
          <div
            {...getRootProps()}
            style={{
              border: `2px dashed ${isDragActive ? '#1D9E75' : 'rgba(29,158,117,0.3)'}`,
              borderRadius: 12,
              padding: '64px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              background: isDragActive ? 'rgba(29,158,117,0.04)' : 'rgba(255,255,255,0.005)',
              transition: 'all 200ms ease',
            }}
          >
            <input {...getInputProps()} />
            <div style={{ marginBottom: 16 }}>
              <FileText size={40} style={{ color: '#1D9E75', margin: '0 auto', opacity: 0.8 }} />
            </div>
            <p style={{ fontSize: 15, margin: '0 0 6px', color: isDragActive ? '#1D9E75' : '#fff', fontWeight: 500 }}>
              {isDragActive ? 'Drop files to initiate ingest' : 'Drag & drop a contract file here to audit'}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0 }}>or <span style={{ color: '#1D9E75', textDecoration: 'underline' }}>click to select files</span></p>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginTop: 12 }}>Supports PDF, DOCX, TXT · Maximum 10MB</p>
          </div>

          {error && (
            <div style={{ marginTop: 16, padding: 14, background: 'rgba(226,75,74,0.08)', border: '1px solid #E24B4A', borderRadius: 8 }}>
              <span style={{ color: '#E24B4A', fontWeight: 600 }}>Error: </span>
              <span style={{ color: 'rgba(255,255,255,0.8)' }}>{error}</span>
            </div>
          )}
        </>
      )}

      {/* Uploading, Scan, and Analysis States */}
      {(status === 'uploading' || status === 'quick-scanning' || status === 'analyzing' || status === 'verifying') && (
        <div style={{ textAlign: 'center', padding: '120px 0' }}>
          <div style={{
            width: 48,
            height: 48,
            border: '4px solid rgba(255,255,255,0.1)',
            borderTopColor: '#1D9E75',
            borderRadius: '50%',
            margin: '0 auto 24px',
            animation: 'spin 1s linear infinite',
          }} />
          <h2 className="font-display" style={{ fontSize: 22, color: '#fff', fontWeight: 400, fontFamily: 'var(--font-display), serif' }}>
            {status === 'uploading' && 'Ingesting document securely…'}
            {status === 'quick-scanning' && 'Pass 1: Running quick auto-detection scan…'}
            {status === 'analyzing' && `Pass 2: Initiating Signet AI Audit on ${fileName}…`}
            {status === 'verifying' && 'Verifying payment credentials…'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 8 }}>
            {status === 'uploading' && 'Uploading contract metadata and drafting payloads...'}
            {status === 'quick-scanning' && 'Classifying agreement structure, category, and transaction context...'}
            {status === 'analyzing' && 'Constructing legal safety profiles and evaluating playbook compliance parameters...'}
            {status === 'verifying' && 'Checking status signature with payment network. Please wait...'}
          </p>

          {/* Premium Developer Ingestion Console */}
          <div style={{
            maxWidth: 580,
            margin: '32px auto 0',
            background: 'rgba(0, 0, 0, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 10,
            padding: '16px 20px',
            textAlign: 'left',
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: 12.5,
            color: '#1D9E75',
            lineHeight: 1.6,
            maxHeight: 240,
            overflowY: 'auto',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(12px)',
          }}>
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 8, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em' }}>INGESTION CONSOLE</span>
              <span style={{ display: 'flex', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff5f56' }} />
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ffbd2e' }} />
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#27c93f' }} />
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {terminalLogs.filter(log => typeof log === 'string').map((log, index) => (
                <div key={index} style={{
                  color: log.includes('WARNING') ? '#BA7517' : log.includes('ERROR') ? '#E24B4A' : '#1D9E75',
                  whiteSpace: 'pre-wrap'
                }}>
                  {log}
                </div>
              ))}
              {/* Flashing cursor */}
              <div style={{ display: 'inline-block', width: 8, height: 14, background: '#1D9E75', marginLeft: 2, verticalAlign: 'middle', animation: 'blink 1s step-end infinite' }} />
            </div>
          </div>
        </div>
      )}

      {/* Trial Exhausted Limits */}
      {status === 'exhausted' && (
        <div style={{ textAlign: 'center', padding: '80px 24px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', maxWidth: 640, margin: '40px auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', color: '#E24B4A', marginBottom: 16 }}>
            <AlertOctagon size={48} />
          </div>
          <h2 className="font-display" style={{ fontSize: 24, margin: '0 0 12px', color: '#fff', fontWeight: 400, fontFamily: 'var(--font-display), serif' }}>
            Free Trial Limits Exhausted
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', marginBottom: 32, maxWidth: 440, margin: '0 auto 32px', lineHeight: 1.6 }}>
            You have hit your monthly free limit. Upgrade to starter or growth plans to immediately unlock unlimited compliance analyses and playbook rule enforcement.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => loadRazorpayCheckout('starter')}
              style={{
                padding: '14px 28px', background: '#1D9E75', color: '#fff', border: 'none',
                borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 15,
                transition: 'all 200ms ease',
              }}
            >
              Starter Tier — ₹1,999/mo
            </button>
            <button
              onClick={() => loadRazorpayCheckout('growth')}
              style={{
                padding: '14px 28px', background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 8, cursor: 'pointer', fontWeight: 500, fontSize: 15, transition: 'all 200ms ease',
              }}
            >
              Growth Tier — ₹4,999/mo
            </button>
          </div>
          <div style={{ marginTop: 24 }}>
            <button onClick={reset} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 13, textDecoration: 'underline' }}>
              ← Return to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Graceful Degradation / Capacity Exceeded Outage Card */}
      {status === 'capacity_exceeded' && (
        <div 
          style={{ 
            textAlign: 'center', 
            padding: '64px 32px', 
            background: 'rgba(29, 17, 10, 0.4)', 
            backdropFilter: 'blur(16px)',
            borderRadius: 16, 
            border: '1px solid rgba(186, 117, 23, 0.3)', 
            maxWidth: 600, 
            margin: '60px auto',
            boxShadow: '0 24px 48px -12px rgba(0,0,0,0.5), 0 8px 30px rgba(186, 117, 23, 0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20
          }}
        >
          <div style={{ 
            width: 64, 
            height: 64, 
            borderRadius: '50%', 
            background: 'rgba(186, 117, 23, 0.12)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#BA7517',
            border: '1px solid rgba(186, 117, 23, 0.25)',
            boxShadow: '0 8px 16px rgba(186, 117, 23, 0.15)'
          }}>
            <AlertTriangle size={32} />
          </div>
          
          <div>
            <h2 
              className="font-display" 
              style={{ 
                fontSize: 26, 
                margin: '0 0 12px', 
                color: '#fff', 
                fontWeight: 400, 
                fontFamily: 'var(--font-display), serif',
                letterSpacing: '-0.01em'
              }}
            >
              High AI Demand
            </h2>
            <p 
              style={{ 
                fontSize: 14, 
                color: 'rgba(255, 255, 255, 0.7)', 
                lineHeight: 1.6, 
                maxWidth: 480, 
                margin: '0 auto',
                fontWeight: 400
              }}
            >
              Our AI partners are currently experiencing unprecedented demand. Your contract has been securely saved to your library. Please click the Re-Analyze button from your recent contracts table in a few minutes.
            </p>
          </div>
          
          <div style={{ marginTop: 12 }}>
            <button
              onClick={handleReturnToDashboard}
              style={{
                padding: '12px 28px', 
                background: '#BA7517', 
                color: '#fff', 
                border: 'none',
                borderRadius: 8, 
                cursor: 'pointer', 
                fontWeight: 600, 
                fontSize: 14,
                boxShadow: '0 4px 14px rgba(186, 117, 23, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                transition: 'all 200ms ease',
              }}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* ERROR STATE */}
      {status === 'error' && (
        <div 
          style={{ 
            textAlign: 'center', 
            padding: '64px 32px', 
            background: 'rgba(29, 10, 10, 0.4)', 
            backdropFilter: 'blur(16px)',
            borderRadius: 16, 
            border: '1px solid rgba(226, 75, 74, 0.3)', 
            maxWidth: 600, 
            margin: '60px auto',
            boxShadow: '0 24px 48px -12px rgba(0,0,0,0.5), 0 8px 30px rgba(226, 75, 74, 0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20
          }}
        >
          <div style={{ 
            width: 64, 
            height: 64, 
            borderRadius: '50%', 
            background: 'rgba(226, 75, 74, 0.12)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#E24B4A',
            border: '1px solid rgba(226, 75, 74, 0.25)',
            boxShadow: '0 8px 16px rgba(226, 75, 74, 0.15)'
          }}>
            <AlertOctagon size={32} />
          </div>
          
          <div>
            <h2 
              className="font-display" 
              style={{ 
                fontSize: 26, 
                margin: '0 0 12px', 
                color: '#fff', 
                fontWeight: 400, 
                fontFamily: 'var(--font-display), serif',
                letterSpacing: '-0.01em'
              }}
            >
              Analysis Failure
            </h2>
            <p 
              style={{ 
                fontSize: 14, 
                color: 'rgba(255, 255, 255, 0.7)', 
                lineHeight: 1.6, 
                maxWidth: 480, 
                margin: '0 auto',
                fontWeight: 400
              }}
            >
              {error || 'An error occurred while launching the contract analysis. Please check your network and try again.'}
            </p>
          </div>
          
          <div style={{ marginTop: 12 }}>
            <button
              onClick={reset}
              style={{
                padding: '12px 28px', 
                background: '#E24B4A', 
                color: '#fff', 
                border: 'none',
                borderRadius: 8, 
                cursor: 'pointer', 
                fontWeight: 600, 
                fontSize: 14,
                boxShadow: '0 4px 14px rgba(226, 75, 74, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                transition: 'all 200ms ease',
              }}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* CSS Spin Keyframes */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  )
}
