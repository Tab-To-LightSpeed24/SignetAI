import { NextResponse } from 'next/server'
import { db } from '@/db'
import { contracts, contractDates, reminders } from '@/db/schema'
import { eq, inArray } from 'drizzle-orm'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function getSupabaseClient() {
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

export async function GET(_req: Request) {
  try {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Fetch user's contracts
    const userContracts = await db
      .select({ id: contracts.id, name: contracts.name })
      .from(contracts)
      .where(eq(contracts.userId, user.id))

    if (userContracts.length === 0) {
      return NextResponse.json({ milestones: [] })
    }

    const contractIds = userContracts.map(c => c.id)

    // 2. Fetch contract dates for these contracts
    const dates = await db
      .select()
      .from(contractDates)
      .where(inArray(contractDates.contractId, contractIds))

    if (dates.length === 0) {
      return NextResponse.json({ milestones: [] })
    }

    const dateIds = dates.map(d => d.id)

    // 3. Fetch reminders for these dates
    const reminderRecords = await db
      .select()
      .from(reminders)
      .where(
        inArray(reminders.contractDateId, dateIds)
      )

    // Match them up
    const milestones = dates.map(d => {
      const contract = userContracts.find(c => c.id === d.contractId)
      const reminder = reminderRecords.find(r => r.contractDateId === d.id)
      return {
        id: d.id,
        contractId: d.contractId,
        contractName: contract ? contract.name : 'Unknown Contract',
        dateType: d.dateType || 'Milestone',
        dateValue: d.dateValue,
        description: d.description || '',
        reminderSent: !!d.reminderSent,
        reminder: reminder ? {
          id: reminder.id,
          active: !!reminder.active,
          remindDaysBefore: reminder.remindDaysBefore || 30
        } : null
      }
    })

    return NextResponse.json({ milestones })
  } catch (err: any) {
    console.error('Error fetching calendar milestones:', err)
    return NextResponse.json({ error: true, message: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { contractId, dateType, dateValue, description, remindDaysBefore, active } = body

    if (!contractId || !dateType || !dateValue) {
      return NextResponse.json({ error: true, message: 'contractId, dateType, and dateValue are required' }, { status: 400 })
    }

    // Verify contract belongs to user
    const [contract] = await db
      .select()
      .from(contracts)
      .where(eq(contracts.id, contractId))

    if (!contract || contract.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Insert milestone
    const [newDate] = await db
      .insert(contractDates)
      .values({
        contractId,
        dateType,
        dateValue,
        description: description || '',
      })
      .returning()

    // Insert reminder if requested
    let newReminder = null
    if (active !== undefined || remindDaysBefore !== undefined) {
      const [insertedReminder] = await db
        .insert(reminders)
        .values({
          userId: user.id,
          contractDateId: newDate.id,
          remindDaysBefore: remindDaysBefore || 30,
          active: active !== undefined ? !!active : true,
        })
        .returning()
      newReminder = insertedReminder
    }

    return NextResponse.json({
      success: true,
      milestone: {
        ...newDate,
        reminder: newReminder ? {
          id: newReminder.id,
          active: !!newReminder.active,
          remindDaysBefore: newReminder.remindDaysBefore || 30
        } : null
      }
    })
  } catch (err: any) {
    console.error('Error creating milestone:', err)
    return NextResponse.json({ error: true, message: err.message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { milestoneId, remindDaysBefore, active } = body

    if (!milestoneId) {
      return NextResponse.json({ error: true, message: 'milestoneId is required' }, { status: 400 })
    }

    // Check if the milestone belongs to a contract owned by this user
    const [dateRecord] = await db
      .select()
      .from(contractDates)
      .where(eq(contractDates.id, milestoneId))

    if (!dateRecord) {
      return NextResponse.json({ error: true, message: 'Milestone not found' }, { status: 404 })
    }

    if (!dateRecord.contractId) {
      return NextResponse.json({ error: true, message: 'Milestone is not associated with a contract' }, { status: 400 })
    }

    const [contract] = await db
      .select()
      .from(contracts)
      .where(eq(contracts.id, dateRecord.contractId as string))

    if (!contract || contract.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Upsert reminder
    const [existingReminder] = await db
      .select()
      .from(reminders)
      .where(eq(reminders.contractDateId, milestoneId))

    let updatedReminder = null
    if (existingReminder) {
      const updateData: any = {}
      if (active !== undefined) updateData.active = !!active
      if (remindDaysBefore !== undefined) updateData.remindDaysBefore = remindDaysBefore

      const [updated] = await db
        .update(reminders)
        .set(updateData)
        .where(eq(reminders.id, existingReminder.id))
        .returning()
      updatedReminder = updated
    } else {
      const [inserted] = await db
        .insert(reminders)
        .values({
          userId: user.id,
          contractDateId: milestoneId,
          remindDaysBefore: remindDaysBefore !== undefined ? remindDaysBefore : 30,
          active: active !== undefined ? !!active : true,
        })
        .returning()
      updatedReminder = inserted
    }

    return NextResponse.json({
      success: true,
      reminder: updatedReminder ? {
        id: updatedReminder.id,
        active: !!updatedReminder.active,
        remindDaysBefore: updatedReminder.remindDaysBefore || 30
      } : null
    })
  } catch (err: any) {
    console.error('Error updating milestone reminder:', err)
    return NextResponse.json({ error: true, message: err.message }, { status: 500 })
  }
}
