import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAdminNotification(subject: string, html: string) {
  return resend.emails.send({
    from: 'onboarding@resend.dev', // <-- CHANGED THIS LINE
    to: process.env.ADMIN_EMAIL ?? 'signetai.support@gmail.com',
    subject,
    html,
  });
}

export async function sendUserConfirmation(
  to: string,
  subject: string,
  html: string
) {
  return resend.emails.send({
    from: 'onboarding@resend.dev', // <-- CHANGED THIS LINE
    to,
    subject,
    html,
  });
}
