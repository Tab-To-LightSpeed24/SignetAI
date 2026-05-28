import { NextResponse } from 'next/server'
import { db } from '@/db'
import { partnerApplications } from '@/db/schema'
import { sendSubmissionEmail } from '@/lib/mailer'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { fullName, firmName, barNumber, city, practice, industries, phone, email, bio } = body

    if (!fullName || !firmName || !barNumber || !city || !phone || !email) {
      return NextResponse.json({ error: true, message: 'Required fields are missing' }, { status: 400 })
    }

    // Convert array fields to comma-separated strings if they are passed as arrays
    const practiceStr = Array.isArray(practice) ? practice.join(', ') : (practice || '')
    const industriesStr = Array.isArray(industries) ? industries.join(', ') : (industries || '')

    const [inserted] = await db
      .insert(partnerApplications)
      .values({
        fullName,
        firmName,
        barNumber,
        city,
        practice: practiceStr || null,
        industries: industriesStr || null,
        phone,
        email,
        bio: bio || null,
      })
      .returning()

    // Trigger SMTP routing, falling back gracefully to DB-only logging if unconfigured
    await sendSubmissionEmail('partner', {
      fullName,
      firmName,
      barNumber,
      email,
      phone,
      city,
      practice: practiceStr,
      industries: industriesStr,
      bio,
    })

    return NextResponse.json({ success: true, application: inserted })
  } catch (err: any) {
    return NextResponse.json({ error: true, message: err.message }, { status: 500 })
  }
}
