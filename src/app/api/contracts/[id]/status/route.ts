import { NextResponse } from 'next/server'
import { db } from '@/db'
import { contracts } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [contract] = await db
      .select({ status: contracts.status, summary: contracts.summary })
      .from(contracts)
      .where(eq(contracts.id, params.id))

    if (!contract) {
      return NextResponse.json({ error: true, message: 'Contract not found' }, { status: 404 })
    }

    return NextResponse.json({ status: contract.status, summary: contract.summary })
  } catch (err: any) {
    return NextResponse.json({ error: true, message: err.message || 'Internal error' }, { status: 500 })
  }
}
