import { NextResponse } from 'next/server'
import { db } from '@/db'
import { clauses } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { flaggedByUser, personalNote, isResolved } = body

    const updateData: Partial<typeof clauses.$inferInsert> = {}

    if (flaggedByUser !== undefined) {
      updateData.flaggedByUser = flaggedByUser
    }
    if (personalNote !== undefined) {
      updateData.personalNote = personalNote
    }
    if (isResolved !== undefined) {
      updateData.isResolved = isResolved
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: true, message: 'No fields to update' }, { status: 400 })
    }

    const [updated] = await db
      .update(clauses)
      .set(updateData)
      .where(eq(clauses.id, params.id))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: true, message: 'Clause not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, clause: updated })
  } catch (err: any) {
    return NextResponse.json({ error: true, message: err.message }, { status: 500 })
  }
}
