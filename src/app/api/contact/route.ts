import { NextResponse } from 'next/server'
import { db } from '@/db'
import { contactSubmissions } from '@/db/schema'
import { sendAdminNotification } from '@/lib/email';

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

    const data = {
      name,
      email,
      company: company || '—',
      subject: subject || 'General Enquiry',
      message
    };

    await sendAdminNotification(
      `New contact form: ${data.subject}`,
      `<p><strong>From:</strong> ${data.name} (${data.email})</p>
       <p><strong>Company:</strong> ${data.company}</p>
       <p><strong>Message:</strong> ${data.message}</p>`
    );

    return NextResponse.json({ success: true, submission: inserted })
  } catch (error: any) {
    console.error("Resend API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}
