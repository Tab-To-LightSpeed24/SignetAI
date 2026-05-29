'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

import { X } from 'lucide-react'

interface Milestone {
  id: string
  contractId: string
  contractName: string
  dateType: string
  dateValue: string
  description: string
  reminderSent: boolean
  reminder: {
    id: string
    active: boolean
    remindDaysBefore: number
  } | null
}

interface Contract {
  id: string
  name: string
}

export default function CalendarPage() {
  const router = useRouter()
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null)
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalContractId, setModalContractId] = useState('')
  const [modalDateType, setModalDateType] = useState('Expiration Date')
  const [modalDateValue, setModalDateValue] = useState('')
  const [modalDescription, setModalDescription] = useState('')
  const [modalRemindDays, setModalRemindDays] = useState(30)
  const [modalActiveReminder, setModalActiveReminder] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const supabase = useMemo(
    () => createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ),
    []
  )

  const fetchCalendarData = useCallback(async () => {
    try {
      setLoading(true)
      // Fetch milestones from our API
      const res = await fetch('/api/calendar')
      if (res.ok) {
        const data = await res.json()
        setMilestones(data.milestones || [])
      }

      // Fetch contracts from Supabase for the modal dropdown
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: userContracts } = await supabase
          .from('contracts')
          .select('id, name')
          .eq('user_id', user.id)
          .eq('status', 'done')
          .order('name', { ascending: true })
        
        if (userContracts) {
          setContracts(userContracts)
          if (userContracts.length > 0) {
            setModalContractId(userContracts[0].id)
          }
        }
      }
    } catch (err) {
      console.error('Error fetching calendar data:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchCalendarData()
  }, [fetchCalendarData])

  // Calendar Calculations
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayIndex = new Date(year, month, 1).getDay() // 0 = Sunday, 1 = Monday...

  const prevMonthDays = new Date(year, month, 0).getDate()

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  // Helper to check if a specific day in the current month has milestones
  const getMilestonesForDay = useCallback((day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return milestones.filter(m => m.dateValue === dateStr)
  }, [milestones, year, month])

  // Get active milestones sorted chronologically
  const upcomingMilestones = useMemo(() => {
    return [...milestones].sort((a, b) => new Date(a.dateValue).getTime() - new Date(b.dateValue).getTime())
  }, [milestones])

  // Selected date milestones
  const selectedMilestones = useMemo(() => {
    if (!selectedDateStr) return []
    return milestones.filter(m => m.dateValue === selectedDateStr)
  }, [milestones, selectedDateStr])

  // Toggle reminder trigger
  const handleToggleReminder = async (milestoneId: string, currentActive: boolean) => {
    try {
      const targetMilestone = milestones.find(m => m.id === milestoneId)
      const currentDays = targetMilestone?.reminder?.remindDaysBefore || 30

      const res = await fetch('/api/calendar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneId,
          active: !currentActive,
          remindDaysBefore: currentDays
        })
      })

      if (res.ok) {
        const data = await res.json()
        setMilestones(prev => prev.map(m => {
          if (m.id === milestoneId) {
            return {
              ...m,
              reminder: data.reminder
            }
          }
          return m
        }))
      }
    } catch (err) {
      console.error('Error toggling reminder:', err)
    }
  }

  // Create Milestone Submission
  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!modalContractId || !modalDateType || !modalDateValue) return

    try {
      setSubmitting(true)
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractId: modalContractId,
          dateType: modalDateType,
          dateValue: modalDateValue,
          description: modalDescription,
          remindDaysBefore: modalRemindDays,
          active: modalActiveReminder
        })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          // Refresh data
          await fetchCalendarData()
          // Reset modal states
          setIsModalOpen(false)
          setModalDescription('')
          setModalDateValue('')
          setModalRemindDays(30)
          setModalActiveReminder(true)
        }
      }
    } catch (err) {
      console.error('Error creating custom milestone:', err)
    } finally {
      setSubmitting(false)
    }
  }

  // Helper to color code milestone types
  const getBadgeStyles = (type: string) => {
    const t = type.toLowerCase()
    if (t.includes('expiration') || t.includes('expiry') || t.includes('end')) {
      return { bg: 'rgba(226, 75, 74, 0.15)', color: '#E24B4A', dot: '#E24B4A' }
    }
    if (t.includes('renewal') || t.includes('renew') || t.includes('auto')) {
      return { bg: 'rgba(29, 158, 117, 0.15)', color: '#1D9E75', dot: '#1D9E75' }
    }
    return { bg: 'rgba(124, 58, 237, 0.15)', color: '#A78BFA', dot: '#7C3AED' }
  }

  const getDaysRemainingString = (dateVal: string) => {
    const milestoneDate = new Date(dateVal)
    milestoneDate.setHours(0,0,0,0)
    const today = new Date()
    today.setHours(0,0,0,0)
    const diffTime = milestoneDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return { label: 'Today', color: '#1D9E75' }
    if (diffDays === 1) return { label: 'Tomorrow', color: '#BA7517' }
    if (diffDays > 1) return { label: `In ${diffDays} days`, color: '#639922' }
    return { label: `${Math.abs(diffDays)} days ago`, color: '#E24B4A' }
  }

  return (
    <div style={{ maxWidth: '100%', padding: '32px 40px', color: '#E2E8F0' }}>
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8">
        <div>
          <h1 className="font-display" style={{ fontSize: 30, color: '#fff', margin: '0 0 6px 0', fontWeight: 400, fontFamily: 'var(--font-display), serif' }}>
            Renewal Calendar
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
            Track expirations, renewals, and other critical dates automatically extracted from your legal agreements.
          </p>
        </div>
        <button
          onClick={() => {
            if (contracts.length === 0) {
              alert('Please upload and analyze a contract successfully to add custom milestones.')
            } else {
              setIsModalOpen(true)
            }
          }}
          className="btn-primary w-full md:w-auto mt-4 md:mt-0"
          style={{ padding: '10px 20px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Milestone
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, opacity: 0.3 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ height: 100, background: 'rgba(255,255,255,0.04)', borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32, alignItems: 'start' }}>
          
          {/* LEFT: THE MONTHLY GRID */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            padding: 24,
          }}>
            {/* Month / Year controller */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, color: '#fff', fontWeight: 600, margin: 0 }}>
                {months[month]} {year}
              </h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={prevMonth}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    width: 32, height: 32,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#fff'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                >
                  ◀
                </button>
                <button
                  onClick={nextMonth}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    width: 32, height: 32,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#fff'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                >
                  ▶
                </button>
              </div>
            </div>

            {/* Scrollable Calendar Grid Container */}
            <div className="overflow-x-auto w-full">
              <div style={{ minWidth: '700px' }}>
                {/* Weekdays Row */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
                  textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)',
                  marginBottom: 12
                }}>
                  {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                    <div key={day} style={{ padding: '6px 0' }}>{day}</div>
                  ))}
                </div>

                {/* Calendar Days Grid */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: 8
                }}>
                  {/* Prev Month filler days */}
                  {Array.from({ length: firstDayIndex }).map((_, i) => {
                    const day = prevMonthDays - firstDayIndex + i + 1
                    return (
                      <div
                        key={`prev-${day}`}
                        style={{
                          height: 80,
                          padding: 8,
                          borderRadius: 8,
                          background: 'transparent',
                          opacity: 0.15,
                          border: '1px solid rgba(255,255,255,0.03)',
                          color: 'var(--text-muted)',
                          fontSize: 13,
                        }}
                      >
                        {day}
                      </div>
                    )
                  })}

                  {/* Active Month Days */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1
                    const dayMilestones = getMilestonesForDay(day)
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                    const isSelected = selectedDateStr === dateStr
                    const hasMilestones = dayMilestones.length > 0

                    return (
                      <div
                        key={`active-${day}`}
                        onClick={() => setSelectedDateStr(isSelected ? null : dateStr)}
                        style={{
                          height: 80,
                          padding: 8,
                          borderRadius: 8,
                          background: isSelected ? 'rgba(29, 158, 117, 0.08)' : hasMilestones ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                          border: `1px solid ${isSelected ? 'var(--teal)' : hasMilestones ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)'}`,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          transition: 'all 150ms ease',
                        }}
                        onMouseEnter={e => {
                          if (!isSelected) {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isSelected) {
                            e.currentTarget.style.background = hasMilestones ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)'
                            e.currentTarget.style.borderColor = hasMilestones ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)'
                          }
                        }}
                      >
                        <div style={{
                          fontSize: 13,
                          fontWeight: hasMilestones ? '700' : '400',
                          color: isSelected ? 'var(--teal)' : '#fff'
                        }}>
                          {day}
                        </div>

                        {/* Small dot/badge indicators */}
                        {hasMilestones && (
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                            {dayMilestones.slice(0, 3).map((m) => {
                              const badge = getBadgeStyles(m.dateType)
                              return (
                                <span
                                  key={m.id}
                                  style={{
                                    width: 6, height: 6,
                                    borderRadius: '50%',
                                    background: badge.color
                                  }}
                                  title={`${m.contractName} - ${m.dateType}`}
                                />
                              )
                            })}
                            {dayMilestones.length > 3 && (
                              <span style={{ fontSize: 9, color: 'var(--text-muted)', lineHeight: '6px' }}>
                                +{dayMilestones.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR: SELECTED DAY OR OVERALL TIMELINE */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            padding: 24,
            minHeight: 450,
          }}>
            {selectedDateStr ? (
              // Selected Date view
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 12 }}>
                  <h2 style={{ fontSize: 16, color: '#fff', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8, color: '#1D9E75' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    {new Date(selectedDateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </h2>
                  <button
                    onClick={() => setSelectedDateStr(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}
                  >
                    Clear Filter
                  </button>
                </div>

                {selectedMilestones.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No milestones scheduled on this date.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {selectedMilestones.map(m => {
                      const badge = getBadgeStyles(m.dateType)
                      const timeStr = getDaysRemainingString(m.dateValue)
                      return (
                        <div
                          key={m.id}
                          style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: 12,
                            padding: 16,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                            <span style={{
                              fontSize: 10, fontWeight: 700,
                              color: badge.color, background: badge.bg,
                              padding: '3px 8px', borderRadius: 100,
                              textTransform: 'uppercase', letterSpacing: '0.05em'
                            }}>
                              {m.dateType}
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 500, color: timeStr.color }}>
                              {timeStr.label}
                            </span>
                          </div>

                          <h3
                            onClick={() => router.push(`/app?contractId=${m.contractId}`)}
                            style={{ fontSize: 14, color: '#fff', fontWeight: 600, margin: '0 0 6px 0', cursor: 'pointer', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: 6 }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                            {m.contractName}
                          </h3>

                          {m.description && (
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: '0 0 16px 0', lineHeight: '1.4' }}>
                              {m.description}
                            </p>
                          )}

                          {/* Email Reminder Trigger */}
                          <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 12, marginTop: 12
                          }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: 12, color: '#fff', fontWeight: 500 }}>Email Alerts</span>
                              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                Notify {m.reminder?.remindDaysBefore || 30} days prior
                              </span>
                            </div>

                            <button
                              onClick={() => handleToggleReminder(m.id, !!m.reminder?.active)}
                              style={{
                                padding: '4px 10px',
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: 'pointer',
                                background: m.reminder?.active ? 'rgba(29, 158, 117, 0.15)' : 'rgba(255,255,255,0.05)',
                                color: m.reminder?.active ? '#1D9E75' : 'rgba(255,255,255,0.4)',
                                border: `1px solid ${m.reminder?.active ? '#1D9E75' : 'rgba(255,255,255,0.1)'}`,
                                transition: 'all 150ms ease'
                              }}
                            >
                              {m.reminder?.active ? 'ON' : 'OFF'}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              // General Agenda Timeline View
              <div>
                <h2 style={{ fontSize: 16, color: '#fff', fontWeight: 600, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 12, display: 'flex', alignItems: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8, color: '#1D9E75' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  Upcoming Agenda
                </h2>

                {upcomingMilestones.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 12px', textAlign: 'center', opacity: 0.5 }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', marginBottom: 12 }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>No upcoming contract dates found.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 500, overflowY: 'auto', paddingRight: 4 }}>
                    {upcomingMilestones.map(m => {
                      const badge = getBadgeStyles(m.dateType)
                      const timeStr = getDaysRemainingString(m.dateValue)
                      const dateObj = new Date(m.dateValue)
                      const formattedDate = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

                      return (
                        <div
                          key={m.id}
                          style={{
                            background: 'rgba(255,255,255,0.01)',
                            border: '1px solid rgba(255,255,255,0.04)',
                            borderRadius: 10,
                            padding: 12,
                            display: 'flex', gap: 12,
                            alignItems: 'start'
                          }}
                        >
                          {/* Left calendar block */}
                          <div style={{
                            background: badge.bg,
                            border: `1px solid ${badge.color}20`,
                            color: badge.color,
                            borderRadius: 8,
                            padding: '6px 10px',
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            minWidth: 50, textAlign: 'center',
                          }}>
                            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>
                              {dateObj.toLocaleDateString('en-GB', { month: 'short' })}
                            </span>
                            <span style={{ fontSize: 16, fontWeight: 800 }}>
                              {dateObj.getDate()}
                            </span>
                          </div>

                          {/* Right text info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {m.contractName}
                              </span>
                              <span style={{ fontSize: 11, fontWeight: 500, color: timeStr.color, flexShrink: 0 }}>
                                {timeStr.label}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <span style={{ fontSize: 10, fontWeight: 600, color: badge.color }}>
                                {m.dateType}
                              </span>
                              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10 }}>•</span>
                              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                {formattedDate}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* GLASSMORPHIC DIALOG MODAL: ADD CUSTOM MILESTONE */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(13, 27, 42, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 24
        }}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#0D1B2A',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 16,
              padding: 32,
              width: '100%',
              maxWidth: 480,
              boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 18, color: '#fff', fontWeight: 600, margin: 0 }}>
                  Add Custom Milestone
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Register a milestone and set critical notifications.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddMilestone} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Select Contract */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>Related Contract</label>
                <select
                  value={modalContractId}
                  onChange={e => setModalContractId(e.target.value)}
                  required
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    padding: '10px 12px',
                    fontSize: 13,
                    color: '#fff',
                    outline: 'none',
                  }}
                >
                  {contracts.map(c => (
                    <option key={c.id} value={c.id} style={{ background: '#0D1B2A' }}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Milestone Type */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>Milestone Type</label>
                <select
                  value={modalDateType}
                  onChange={e => setModalDateType(e.target.value)}
                  required
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    padding: '10px 12px',
                    fontSize: 13,
                    color: '#fff',
                    outline: 'none',
                  }}
                >
                  <option value="Expiration Date" style={{ background: '#0D1B2A' }}>Expiration Date</option>
                  <option value="Renewal Notice Deadline" style={{ background: '#0D1B2A' }}>Renewal Notice Deadline</option>
                  <option value="Audit Checkpoint" style={{ background: '#0D1B2A' }}>Audit Checkpoint</option>
                  <option value="Payment Milestone" style={{ background: '#0D1B2A' }}>Payment Milestone</option>
                  <option value="Custom Deadline" style={{ background: '#0D1B2A' }}>Custom Deadline</option>
                </select>
              </div>

              {/* Date Value */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>Date</label>
                <input
                  type="date"
                  value={modalDateValue}
                  onChange={e => setModalDateValue(e.target.value)}
                  required
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    padding: '10px 12px',
                    fontSize: 13,
                    color: '#fff',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Description */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>Description / Context</label>
                <textarea
                  placeholder="Details regarding this expiration or review..."
                  value={modalDescription}
                  onChange={e => setModalDescription(e.target.value)}
                  rows={3}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    padding: '10px 12px',
                    fontSize: 13,
                    color: '#fff',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>

              {/* Email Reminder settings */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10,
                padding: 12,
                marginTop: 4
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Enable Email Warning</label>
                  <input
                    type="checkbox"
                    checked={modalActiveReminder}
                    onChange={e => setModalActiveReminder(e.target.checked)}
                    style={{ cursor: 'pointer', width: 16, height: 16, accentColor: 'var(--teal)' }}
                  />
                </div>
                {modalActiveReminder && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Send warning alert</span>
                    <input
                      type="number"
                      min={1}
                      max={180}
                      value={modalRemindDays}
                      onChange={e => setModalRemindDays(Number(e.target.value))}
                      style={{
                        width: 60,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 6,
                        padding: '4px 6px',
                        fontSize: 12,
                        color: '#fff',
                        textAlign: 'center',
                        outline: 'none'
                      }}
                    />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>days beforehand</span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    flex: 1, padding: '10px 16px', background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
                    color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 500
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                  style={{
                    flex: 1, padding: '10px 16px',
                    fontSize: 13, fontWeight: 600,
                  }}
                >
                  {submitting ? 'Creating...' : 'Create Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
