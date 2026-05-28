import { NextResponse } from 'next/server'
import { db } from '@/db'
import { contactSubmissions } from '@/db/schema'
import { sendSubmissionEmail } from '@/lib/mailer'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, company, role, subject, message, newsletter } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: true, message: 'Name, email, and message are required' }, { status: 400 })
    }

    const [inserted] = await db
      .insert(contactSubmissions)
      .values({
        name,
        email,
        company: company || null,
        role: role || null,
        subject: subject || null,
        message,
        newsletter: !!newsletter,
      })
      .returning()

    // Trigger SMTP routing, falling back gracefully to DB-only logging if unconfigured
    await sendSubmissionEmail('contact', {
      name,
      email,
      company,
      role,
      subject,
      message,
      newsletter,
    })

    return NextResponse.json({ success: true, submission: inserted })
  } catch (err: any) {
    return NextResponse.json({ error: true, message: err.message }, { status: 500 })
  }
}
