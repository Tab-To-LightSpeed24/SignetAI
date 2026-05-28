import { db } from '@/db'
import { contracts, clauses } from '@/db/schema'
import { ilike, or, eq, desc } from 'drizzle-orm'
import Link from 'next/link'
import { Search, FileText, ChevronRight, AlertTriangle } from 'lucide-react'

export const metadata = { title: 'Contract Search — Signet AI' }

export default async function RepositoryPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const query = searchParams.q || ''

  let results: any[] = []

  try {
    if (query) {
      const qIlike = `%${query}%`
      
      results = await db.selectDistinct({
        id: contracts.id,
        name: contracts.name,
        contractType: contracts.contractType,
        riskLabel: contracts.riskLabel,
        overallRisk: contracts.overallRisk,
        createdAt: contracts.createdAt,
      })
      .from(contracts)
      .leftJoin(clauses, eq(contracts.id, clauses.contractId))
      .where(
        or(
          ilike(contracts.name, qIlike),
          ilike(clauses.originalText, qIlike),
          ilike(clauses.plainEnglish, qIlike)
        )
      )
    } else {
      results = await db.select({
        id: contracts.id,
        name: contracts.name,
        contractType: contracts.contractType,
        riskLabel: contracts.riskLabel,
        overallRisk: contracts.overallRisk,
        createdAt: contracts.createdAt,
      })
      .from(contracts)
      .orderBy(desc(contracts.createdAt))
      .limit(50)
    }
  } catch (err) {
    console.error("Search error:", err)
  }

  function riskColor(score: number | null) {
    if (!score) return '#639922'
    if (score >= 7) return '#E24B4A'
    if (score >= 4) return '#BA7517'
    return '#639922'
  }

  return (
    <div style={{ padding: '40px', maxWidth: 900, margin: '0 auto', color: '#E2E8F0' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 className="font-display" style={{ fontSize: 28, color: '#fff', margin: '0 0 12px 0', fontWeight: 400, fontFamily: 'var(--font-display), serif' }}>
          Repository Search
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, margin: 0 }}>
          Search across your entire contract portfolio, including full-text clause analysis and plain English translations.
        </p>
      </div>

      <div style={{ 
        background: 'rgba(255,255,255,0.03)', 
        border: '1px solid rgba(255,255,255,0.08)', 
        borderRadius: 12, 
        padding: '24px',
        marginBottom: 32
      }}>
        <form method="GET" action="/app/repository" style={{ display: 'flex', gap: 12 }}>
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            background: 'rgba(0,0,0,0.2)', 
            border: '1px solid rgba(255,255,255,0.12)', 
            borderRadius: 8, 
            padding: '0 16px',
            transition: 'border-color 0.2s ease'
          }}>
            <Search size={18} color="rgba(255,255,255,0.4)" />
            <input 
              type="text" 
              name="q" 
              defaultValue={query} 
              placeholder="Search by contract name, clause text, or meaning..."
              style={{ 
                flex: 1, 
                background: 'none', 
                border: 'none', 
                color: '#fff', 
                padding: '12px', 
                fontSize: 15,
                outline: 'none' 
              }}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '0 24px', fontSize: 14 }}>
            Search
          </button>
        </form>
      </div>

      <div>
        <h2 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>
          {query ? `Search Results (${results.length})` : 'Recent Contracts'}
        </h2>

        {results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 12 }}>
            <FileText size={32} color="rgba(255,255,255,0.2)" style={{ margin: '0 auto 16px' }} />
            <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)' }}>No contracts found.</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>Try adjusting your search terms or reviewing your filters.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {results.map((contract) => (
              <Link 
                href={`/app/contracts/${contract.id}`} 
                key={contract.id}
                className="repository-card"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ 
                    width: 40, height: 40, borderRadius: 8, 
                    background: 'rgba(29,158,117,0.1)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#1D9E75'
                  }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 500, color: '#fff', marginBottom: 4 }}>
                      {contract.name}
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {contract.contractType || 'Uncategorized'}
                      </span>
                      <span>&bull;</span>
                      <span>
                        {new Date(contract.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {contract.overallRisk !== null && (
                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: `${riskColor(contract.overallRisk)}20`,
                      color: riskColor(contract.overallRisk),
                      padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 500
                    }}>
                      {contract.overallRisk >= 7 && <AlertTriangle size={12} />}
                      {contract.riskLabel || `${contract.overallRisk}/10 Risk`}
                    </div>
                  )}
                  <ChevronRight size={18} color="rgba(255,255,255,0.3)" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
