import { NextResponse } from 'next/server'
import { db } from '@/db'
import { contractDates, reminders, contracts, authUsers } from '@/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { sendUserConfirmation } from '@/lib/email'

export const dynamic = 'force-dynamic' // Ensure it runs dynamically for cron

export async function GET(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Find active reminders where the target date is approaching and reminderSent is false
    const activeReminders = await db
      .select({
        reminderId: reminders.id,
        remindDaysBefore: reminders.remindDaysBefore,
        contractDateId: contractDates.id,
        dateType: contractDates.dateType,
        dateValue: contractDates.dateValue,
        contractName: contracts.name,
        userEmail: authUsers.email,
      })
      .from(reminders)
      .innerJoin(contractDates, eq(reminders.contractDateId, contractDates.id))
      .innerJoin(contracts, eq(contractDates.contractId, contracts.id))
      .innerJoin(authUsers, eq(reminders.userId, authUsers.id))
      .where(
        and(
          eq(reminders.active, true),
          eq(contractDates.reminderSent, false),
          sql`CASE WHEN ${contractDates.dateValue} ~ '^\\d{4}-\\d{2}-\\d{2}$' THEN ${contractDates.dateValue}::date <= (CURRENT_DATE + (${reminders.remindDaysBefore} || ' days')::interval)::date ELSE false END`
        )
      )

    console.log(`[Cron] Found ${activeReminders.length} pending reminders to process.`)

    if (activeReminders.length === 0) {
      return NextResponse.json({ success: true, message: 'No reminders to send.' })
    }

    let sent = 0
    const successfulDateIds: string[] = []

    for (const r of activeReminders) {
      const userEmail = r.userEmail
      if (!userEmail) {
        console.warn(`[Cron] User email is missing for reminder on contract "${r.contractName}"`)
        continue
      }

      const subject = `Reminder: Contract expiring soon - ${r.contractName}`
      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1D9E75;">Contract Deadline Reminder</h2>
          <p>Your contract <strong>${r.contractName}</strong> has an upcoming milestone.</p>
          <ul>
            <li><strong>Contract:</strong> ${r.contractName}</li>
            <li><strong>Event:</strong> ${r.dateType}</li>
            <li><strong>Date:</strong> ${r.dateValue}</li>
            <li><strong>Reminder Setting:</strong> ${r.remindDaysBefore} days before</li>
          </ul>
          <p>Please log in to Signet AI to review the contract and take necessary actions.</p>
          <p style="font-size: 11px; color: #718096; margin-top: 24px; border-top: 1px solid #eee; padding-top: 10px;">
            Sent via Signet AI · Powered by Resend
          </p>
        </div>
      `

      try {
        await sendUserConfirmation(
          userEmail,
          subject,
          html
        )
        successfulDateIds.push(r.contractDateId)
        sent++
      } catch (error: any) {
        console.error(`Failed to send reminder to ${userEmail}:`, error.message)
        continue
      }
    }

    // Mark successful ones as sent
    if (successfulDateIds.length > 0) {
      for (const id of successfulDateIds) {
        await db.update(contractDates)
          .set({ reminderSent: true })
          .where(eq(contractDates.id, id))
      }
    }

    return NextResponse.json({ success: true, sent, total: activeReminders.length })
  } catch (err: any) {
    console.error('[Cron] Reminder cron error:', err)
    return NextResponse.json({ error: true, message: err.message }, { status: 500 })
  }
}
