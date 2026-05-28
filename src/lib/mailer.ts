import nodemailer from 'nodemailer'

export async function sendSubmissionEmail(type: 'contact' | 'partner', data: any) {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  // Resolve target from environment — never hardcoded
  const targetEmail = process.env.CONTACT_EMAIL
  if (!targetEmail) {
    console.error('[Mailer] CONTACT_EMAIL environment variable is not set. Email routing aborted.')
    return { success: false, reason: 'no_contact_email' }
  }

  console.log(`[Mailer] Attempting to route ${type} submission to ${targetEmail}`)

  if (!host || !user || !pass) {
    console.warn(`[Mailer] SMTP is unconfigured (SMTP_HOST, SMTP_USER, or SMTP_PASS missing). Falling back gracefully to DB logging.`)
    return { success: false, reason: 'unconfigured' }
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    })

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
          <p style="font-size: 11px; color: #718096; margin-top: 24px; text-align: center; border-top: 1px solid rgba(13,27,42,0.08); padding-top: 10px;">Sent via Signet AI Lead Routing</p>
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
            <strong style="display: block; margin-bottom: 6px;">Biography & Statement:</strong>
            <p style="margin: 0; white-space: pre-wrap;">${data.bio || 'None provided'}</p>
          </div>
          <p style="font-size: 11px; color: #718096; margin-top: 24px; text-align: center; border-top: 1px solid rgba(13,27,42,0.08); padding-top: 10px;">Sent via Signet AI Lead Routing</p>
        </div>
      `
    }

    await transporter.sendMail({
      from: `"Signet AI" <${user}>`,
      to: targetEmail,
      subject,
      html,
    })

    console.log(`[Mailer] Successfully routed submission to ${targetEmail}`)
    return { success: true }
  } catch (err: any) {
    console.error(`[Mailer] Failed to send email via SMTP:`, err)
    return { success: false, error: err.message }
  }
}
