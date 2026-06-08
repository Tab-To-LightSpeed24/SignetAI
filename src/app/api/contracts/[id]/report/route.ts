import { NextResponse } from 'next/server'
import { db } from '@/db'
import { contracts, clauses, contractDates, userPlaybook } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAuth()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401 })
    }

    const [contract] = await db
      .select()
      .from(contracts)
      .where(and(eq(contracts.id, params.id), eq(contracts.userId, user.id)))

    if (!contract) {
      return NextResponse.json({ error: true, message: 'Not found' }, { status: 404 })
    }

    const clauseRecords = await db.select().from(clauses).where(eq(clauses.contractId, params.id))
    const dateRecords = await db.select().from(contractDates).where(eq(contractDates.contractId, params.id))
    const playbookRecords = await db.select().from(userPlaybook).where(eq(userPlaybook.userId, user.id))
    const hasPlaybookRules = playbookRecords.length > 0

    return NextResponse.json({
      contract: {
        name: contract.name,
        filePath: contract.filePath,
        overallRisk: contract.overallRisk,
        riskLabel: contract.riskLabel,
        summary: contract.summary,
        contractType: contract.contractType,
        requiresLawyerReview: contract.requiresLawyerReview ?? false,
        lawyerReferralReasoning: contract.lawyerReferralReasoning ?? null,
        hasPlaybookRules,
      },
      clauses: clauseRecords.map(c => ({
        id: c.id,
        clauseType: c.clauseType,
        originalText: c.originalText,
        plainEnglish: c.plainEnglish,
        riskScore: c.riskScore,
        riskLabel: c.riskLabel,
        negotiationTip: c.negotiationTip,
        negotiationLanguage: c.negotiationLanguage,
        isPlaybookViolation: c.isPlaybookViolation,
        pageNumber: c.pageNumber,
        flaggedByUser: c.flaggedByUser,
        personalNote: c.personalNote,
        isResolved: c.isResolved,
      })),
      dates: dateRecords.map(d => ({
        id: d.id,
        dateType: d.dateType,
        dateValue: d.dateValue,
        description: d.description,
        reminderSent: d.reminderSent,
      })),
    })
  } catch (err: any) {
    return NextResponse.json({ error: true, message: err.message }, { status: 500 })
  }
}