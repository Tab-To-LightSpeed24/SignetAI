import { Resend } from 'resend'

/**
 * Sends contact form and partner application emails via Resend.
 *
 * Required env vars:
 *   RESEND_API_KEY   — Resend API key (already configured)
 *   CONTACT_EMAIL    — corporate inbox, e.g. signetai.support@gmail.com
 *
 * The `from` address uses Resend's shared onboarding domain while you are
 * in sandbox / before verifying a custom sending domain. Once you verify
 * a domain on resend.com, change RESEND_FROM to e.g. no-reply@signetai.in
 */
export async function sendSubmissionEmail(type: 'contact' | 'partner', data: any) {
  const apiKey = process.env.RESEND_API_KEY
  const toEmail = process.env.CONTACT_EMAIL
  const fromEmail = process.env.RESEND_FROM ?? 'Signet AI <onboarding@resend.dev>'

  if (!apiKey) {
    console.warn('[Mailer] RESEND_API_KEY is not set. Falling back to DB-only logging.')
    return { success: false, reason: 'no_api_key' }
  }

  if (!toEmail) {
    console.error('[Mailer] CONTACT_EMAIL is not set. Email routing aborted.')
    return { success: false, reason: 'no_contact_email' }
  }

  const resend = new Resend(apiKey)

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
        <p style="font-size: 11px; color: #718096; margin-top: 24px; text-align: center; border-top: 1px solid rgba(13,27,42,0.08); padding-top: 10px;">Sent via Signet AI Lead Routing · Powered by Resend</p>
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
        <p style="font-size: 11px; color: #718096; margin-top: 24px; text-align: center; border-top: 1px solid rgba(13,27,42,0.08); padding-top: 10px;">Sent via Signet AI Lead Routing · Powered by Resend</p>
      </div>
    `
  }

  try {
    const { data: result, error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject,
      html,
    })

    if (error) {
      console.error('[Mailer] Resend API returned error:', error)
      return { success: false, error: error.message }
    }

    console.log(`[Mailer] Email dispatched via Resend. ID: ${result?.id}`)
    return { success: true, id: result?.id }
  } catch (err: any) {
    console.error('[Mailer] Unexpected error calling Resend:', err)
    return { success: false, error: err.message }
  }
}
