import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

/**
 * Sends contact form and partner application emails via SMTP transport.
 *
 * Required env vars:
 *   SMTP_HOST      — e.g., smtp.gmail.com
 *   SMTP_PORT      — e.g., 587
 *   SMTP_USER      — SMTP username / sender email
 *   SMTP_PASS      — SMTP password / app password
 *   CONTACT_EMAIL  — corporate inbox, e.g. signetai.support@gmail.com
 */
export async function sendSubmissionEmail(type: 'contact' | 'partner', data: any) {
  const toEmail = process.env.CONTACT_EMAIL || 'signetai.support@gmail.com'
  const fromEmail = process.env.SMTP_USER || 'hello@signet-ai.in'

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[Mailer] SMTP credentials are not fully set. Falling back to DB-only logging.')
    return { success: false, reason: 'smtp_unconfigured' }
  }

  let subject = ''
  let html = ''

  if (type === 'contact') {
    subject = `[Signet AI Contact] New Submission: ${data.subject || 'General Enquiry'}`
    html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0D1B2A; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid rgba(13,27,42,0.08); border-radius: 8px;">
        <h2 style="color: #1D9E75; border-bottom: 1px solid rgba(13,27,42,0.08); padding-bottom: 10px;">Contact Form Submission</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold; width: 120px;">Name:</td>
            <td style="padding: 6px 0;">${data.name}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Email:</td>
            <td style="padding: 6px 0;"><a href="mailto:${data.email}" style="color: #1D9E75;">${data.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Company:</td>
            <td style="padding: 6px 0;">${data.company || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Role:</td>
            <td style="padding: 6px 0;">${data.role || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Subject:</td>
            <td style="padding: 6px 0;">${data.subject || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Newsletter:</td>
            <td style="padding: 6px 0;">${data.newsletter ? 'Yes' : 'No'}</td>
          </tr>
        </table>
        <div style="margin-top: 20px; padding: 15px; background: rgba(13,27,42,0.03); border-radius: 6px; border-left: 4px solid #1D9E75;">
          <strong style="display: block; margin-bottom: 6px;">Message:</strong>
          <p style="margin: 0; white-space: pre-wrap;">${data.message}</p>
        </div>
        <p style="font-size: 11px; color: #718096; margin-top: 24px; text-align: center; border-top: 1px solid rgba(13,27,42,0.08); padding-top: 10px;">Sent via Signet AI Lead Routing · Powered by SMTP</p>
      </div>
    `
  } else {
    subject = `[Signet AI Partner] New Lawyer Application: ${data.fullName}`
    html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0D1B2A; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid rgba(13,27,42,0.08); border-radius: 8px;">
        <h2 style="color: #1D9E75; border-bottom: 1px solid rgba(13,27,42,0.08); padding-bottom: 10px;">Lawyer Partner Application</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold; width: 120px;">Full Name:</td>
            <td style="padding: 6px 0;">${data.fullName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Firm Name:</td>
            <td style="padding: 6px 0;">${data.firmName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Bar Number:</td>
            <td style="padding: 6px 0;">${data.barNumber}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Email:</td>
            <td style="padding: 6px 0;"><a href="mailto:${data.email}" style="color: #1D9E75;">${data.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Phone:</td>
            <td style="padding: 6px 0;">${data.phone}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">City:</td>
            <td style="padding: 6px 0;">${data.city}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Practice Areas:</td>
            <td style="padding: 6px 0;">${data.practice || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Focus Industries:</td>
            <td style="padding: 6px 0;">${data.industries || '—'}</td>
          </tr>
        </table>
        <div style="margin-top: 20px; padding: 15px; background: rgba(13,27,42,0.03); border-radius: 6px; border-left: 4px solid #1D9E75;">
          <strong style="display: block; margin-bottom: 6px;">Biography &amp; Statement:</strong>
          <p style="margin: 0; white-space: pre-wrap;">${data.bio || 'None provided'}</p>
        </div>
        <p style="font-size: 11px; color: #718096; margin-top: 24px; text-align: center; border-top: 1px solid rgba(13,27,42,0.08); padding-top: 10px;">Sent via Signet AI Lead Routing · Powered by SMTP</p>
      </div>
    `
  }

  try {
    const info = await transporter.sendMail({
      from: `"Signet AI Lead Router" <${fromEmail}>`,
      to: toEmail,
      subject,
      html,
    })

    console.log(`[Mailer] Email dispatched via SMTP. Message ID: ${info.messageId}`)
    return { success: true, id: info.messageId }
  } catch (err: any) {
    console.error('[Mailer] SMTP transport error:', err)
    return { success: false, error: err.message }
  }
}
