import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAdminNotification(subject: string, html: string) {
  return resend.emails.send({
    from: 'Signet AI <noreply@signetai.in>',
    to: process.env.ADMIN_EMAIL ?? 'kaushik.vgs@gmail.com',
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
    from: 'Signet AI <noreply@signetai.in>',
    to,
    subject,
    html,
  });
}
