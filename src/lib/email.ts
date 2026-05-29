import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'signetai.support@gmail.com';
const FROM_EMAIL = 'onboarding@resend.dev'; // Mandatory for Resend Free Tier

export async function sendAdminNotification(subject: string, html: string) {
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject,
    html,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function sendUserConfirmation(to: string, subject: string, html: string) {
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  });
  if (error) throw new Error(error.message);
  return data;
}
