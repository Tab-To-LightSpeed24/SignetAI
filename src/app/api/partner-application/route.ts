import { NextResponse } from 'next/server'
import { db } from '@/db'
import { partnerApplications } from '@/db/schema'
import { sendAdminNotification } from '@/lib/email';

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

    const data = {
      full_name: fullName,
      firm_name: firmName,
      bar_enrollment: barNumber,
      city,
      email,
      phone,
      specializations: practiceStr || '—',
      bio: bio || '—'
    };

    await sendAdminNotification(
      `New lawyer partner application: ${data.full_name}`,
      `<p><strong>Name:</strong> ${data.full_name}</p>
       <p><strong>Firm:</strong> ${data.firm_name}</p>
       <p><strong>Bar No:</strong> ${data.bar_enrollment}</p>
       <p><strong>City:</strong> ${data.city}</p>
       <p><strong>Email:</strong> ${data.email}</p>
       <p><strong>Phone:</strong> ${data.phone}</p>
       <p><strong>Specializations:</strong> ${data.specializations}</p>
       <p><strong>Bio:</strong> ${data.bio}</p>`
    );

    return NextResponse.json({ success: true, application: inserted })
  } catch (err: any) {
    return NextResponse.json({ error: true, message: err.message }, { status: 500 })
  }
}
