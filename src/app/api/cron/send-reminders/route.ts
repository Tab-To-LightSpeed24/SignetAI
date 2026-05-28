import { NextResponse } from 'next/server'
import { db } from '@/db'
import { contractDates, reminders, contracts, profiles } from '@/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import nodemailer from 'nodemailer'

export const dynamic = 'force-dynamic' // Ensure it runs dynamically for cron

export async function GET(req: Request) {
  // Optional: add cron secret validation
  const authHeader = req.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // We want to find active reminders where the target date is approaching or passed
    // AND reminderSent is false.
    // In PostgreSQL: contractDates.dateValue <= CURRENT_DATE + reminders.remindDaysBefore
    
    const activeReminders = await db
      .select({
        reminderId: reminders.id,
        remindDaysBefore: reminders.remindDaysBefore,
        contractDateId: contractDates.id,
        dateType: contractDates.dateType,
        dateValue: contractDates.dateValue,
        contractName: contracts.name,
        userEmail: profiles.id, // we might need the actual email from auth.users or profiles if we store it
        // Actually, we'll route to kaushik.vgs@gmail.com per instructions or use standard SMTP
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

    console.log(`Found ${activeReminders.length} pending reminders to process.`)

    if (activeReminders.length === 0) {
      return NextResponse.json({ success: true, message: 'No reminders to send.' })
    }

    const host = process.env.SMTP_HOST
    const port = parseInt(process.env.SMTP_PORT || '587', 10)
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS
    const targetEmail = 'kaushik.vgs@gmail.com'

    if (!host || !user || !pass) {
      console.warn(`[Cron] SMTP is unconfigured. Simulated sending ${activeReminders.length} reminders.`)
    } else {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      })

      for (const r of activeReminders) {
        const subject = `[Signet AI Reminder] ${r.dateType} approaching for ${r.contractName}`
        const html = `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #1D9E75;">Contract Deadline Reminder</h2>
            <p>This is a reminder that a key date is approaching for your contract.</p>
            <ul>
              <li><strong>Contract:</strong> ${r.contractName}</li>
              <li><strong>Event:</strong> ${r.dateType}</li>
              <li><strong>Date:</strong> ${r.dateValue}</li>
              <li><strong>Reminder Setting:</strong> ${r.remindDaysBefore} days before</li>
            </ul>
            <p>Please log in to Signet AI to review the contract and take necessary actions.</p>
          </div>
        `
        await transporter.sendMail({
          from: `"Signet AI" <${user}>`,
          to: targetEmail, // We send to the central inbox as requested
          subject,
          html,
        })
      }
    }

    // Mark as sent
    const dateIds = activeReminders.map(r => r.contractDateId)
    if (dateIds.length > 0) {
      await db.update(contractDates)
        .set({ reminderSent: true })
        .where(sql`${contractDates.id} IN ${dateIds}`)
    }

    return NextResponse.json({ success: true, sent: activeReminders.length })
  } catch (err: any) {
    console.error('Reminder cron error:', err)
    return NextResponse.json({ error: true, message: err.message }, { status: 500 })
  }
}
