import { NextResponse } from 'next/server'
import { db } from '@/db'
import { clauses, contracts } from '@/db/schema'
import { eq } from 'drizzle-orm'
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

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAuth()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401 })
    }

    // Check ownership of the clause via its associated contract
    const [clauseRecord] = await db
      .select({ contractId: clauses.contractId })
      .from(clauses)
      .where(eq(clauses.id, params.id))

    if (!clauseRecord || !clauseRecord.contractId) {
      return NextResponse.json({ error: true, message: 'Clause not found' }, { status: 404 })
    }

    const [contract] = await db
      .select({ userId: contracts.userId })
      .from(contracts)
      .where(eq(contracts.id, clauseRecord.contractId))

    if (!contract || contract.userId !== user.id) {
      return NextResponse.json({ error: true, message: 'Forbidden' }, { status: 403 })
    }

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

    return NextResponse.json({ success: true, clause: updated })
  } catch (err: any) {
    return NextResponse.json({ error: true, message: err.message }, { status: 500 })
  }
}
