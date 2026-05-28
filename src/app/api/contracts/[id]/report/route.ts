import { NextResponse } from 'next/server'
import { db } from '@/db'
import { contracts, clauses } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [contract] = await db.select().from(contracts).where(eq(contracts.id, params.id))
    if (!contract) {
      return NextResponse.json({ error: true, message: 'Not found' }, { status: 404 })
    }

    const clauseRecords = await db.select().from(clauses).where(eq(clauses.contractId, params.id))

    return NextResponse.json({
      contract: {
        name: contract.name,
        filePath: contract.filePath,
        overallRisk: contract.overallRisk,
        riskLabel: contract.riskLabel,
        summary: contract.summary,
        contractType: contract.contractType,
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
    })
  } catch (err: any) {
    return NextResponse.json({ error: true, message: err.message }, { status: 500 })
  }
}