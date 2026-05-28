import { NextResponse } from 'next/server'
import { db } from '@/db'
import { contracts, clauses } from '@/db/schema'
import { ilike, or, eq, and, desc } from 'drizzle-orm'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

function getSupabaseAuth() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() { },
      },
    }
  )
}

export async function GET(req: Request) {
  try {
    const supabase = getSupabaseAuth()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') || ''

    let results: any[] = []

    if (query) {
      const qIlike = `%${query}%`
      
      results = await db.selectDistinct({
        id: contracts.id,
        name: contracts.name,
        contract_type: contracts.contractType,
        risk_label: contracts.riskLabel,
        overall_risk: contracts.overallRisk,
        created_at: contracts.createdAt,
        status: contracts.status,
      })
      .from(contracts)
      .leftJoin(clauses, eq(contracts.id, clauses.contractId))
      .where(
        and(
          eq(contracts.userId, user.id),
          or(
            ilike(contracts.name, qIlike),
            ilike(clauses.originalText, qIlike),
            ilike(clauses.plainEnglish, qIlike)
          )
        )
      )
    } else {
      results = await db.select({
        id: contracts.id,
        name: contracts.name,
        contract_type: contracts.contractType,
        risk_label: contracts.riskLabel,
        overall_risk: contracts.overallRisk,
        created_at: contracts.createdAt,
        status: contracts.status,
      })
      .from(contracts)
      .where(eq(contracts.userId, user.id))
      .orderBy(desc(contracts.createdAt))
    }

    return NextResponse.json({ success: true, contracts: results })
  } catch (error: any) {
    console.error('Search API error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
