import { NextResponse } from 'next/server'
import { db } from '@/db'
import { contractDates, reminders, contracts, profiles } from '@/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic' // Ensure it runs dynamically for cron

export async function GET(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const apiKey = process.env.RESEND_API_KEY
  const toEmail = process.env.CONTACT_EMAIL
  const fromEmail = process.env.RESEND_FROM ?? 'Signet AI <onboarding@resend.dev>'

  if (!apiKey) {
    console.error('[Cron] RESEND_API_KEY is not set. Cannot dispatch reminders.')
    return NextResponse.json({ error: true, message: 'RESEND_API_KEY not configured' }, { status: 500 })
  }

  if (!toEmail) {
    console.error('[Cron] CONTACT_EMAIL is not set. Cannot dispatch reminders.')
    return NextResponse.json({ error: true, message: 'CONTACT_EMAIL not configured' }, { status: 500 })
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
        userEmail: profiles.id, // routes to the central CONTACT_EMAIL inbox
      })
      .from(reminders)
      .innerJoin(contractDates, eq(reminders.contractDateId, contractDates.id))
      .innerJoin(contracts, eq(contractDates.contractId, contracts.id))
      .innerJoin(profiles, eq(reminders.userId, profiles.id))
      .where(
        and(
          eq(reminders.active, true),
          eq(contractDates.reminderSent, false),
          sql`${contractDates.dateValue}::date <= (CURRENT_DATE + (${reminders.remindDaysBefore} || ' days')::interval)::date`
        )
      )

    console.log(`[Cron] Found ${activeReminders.length} pending reminders to process.`)

    if (activeReminders.length === 0) {
      return NextResponse.json({ success: true, message: 'No reminders to send.' })
    }

    const resend = new Resend(apiKey)
    let sent = 0

    for (const r of activeReminders) {
      const subject = `[Signet AI Reminder] ${r.dateType} approaching for ${r.contractName}`
      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1D9E75;">Contract Deadline Reminder</h2>
          <p>This is a reminder that a key date is approaching for your contract.</p>
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

      const { error } = await resend.emails.send({
        from: fromEmail,
        to: [toEmail],
        subject,
        html,
      })

      if (error) {
        console.error(`[Cron] Failed to send reminder for contract "${r.contractName}":`, error)
      } else {
        sent++
      }
    }

    // Mark as sent
    const dateIds = activeReminders.map(r => r.contractDateId)
    if (dateIds.length > 0) {
      await db.update(contractDates)
        .set({ reminderSent: true })
        .where(sql`${contractDates.id} IN ${dateIds}`)
    }

    return NextResponse.json({ success: true, sent, total: activeReminders.length })
  } catch (err: any) {
    console.error('[Cron] Reminder cron error:', err)
    return NextResponse.json({ error: true, message: err.message }, { status: 500 })
  }
}
