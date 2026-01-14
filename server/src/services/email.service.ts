import { Resend } from 'resend';
import { welcomeEmailTemplate, passwordResetTemplate } from '../utils/email.templates';

let resendClient: Resend | null = null;

const getResendClient = () => {
  if (resendClient) return resendClient;

  if (process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
    return resendClient;
  }

  console.warn('RESEND_API_KEY not configured. Emails will not be sent.');
  return null;
};

const getClientUrl = () => {
  return process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    console.log(`Attempting to send welcome email to ${email}`);
    const resend = getResendClient();

    if (!resend) {
      console.log('Resend not configured, skipping email');
      return;
    }

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'BlueZone <noreply@bluezonetwente.com>',
      to: email,
      subject: 'Welcome to BlueZone!',
      html: welcomeEmailTemplate(name),
    });

    if (error) {
      console.error('Error sending welcome email:', error);
    } else {
      console.log(`Welcome email sent to ${email}`, data);
    }
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  try {
    console.log(`Attempting to send password reset email to ${email}`);
    const resend = getResendClient();

    if (!resend) {
      console.log('Resend not configured, skipping email');
      return;
    }

    const resetUrl = `${getClientUrl()}/reset-password?token=${token}`;
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'BlueZone <noreply@bluezonetwente.com>',
      to: email,
      subject: 'Reset Your Password',
      html: passwordResetTemplate(resetUrl),
    });

    if (error) {
      console.error('Error sending password reset email:', error);
    } else {
      console.log(`Password reset email sent to ${email}`, data);
    }
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};

export const sendNewsletterConfirmation = async (email: string) => {
  try {
    console.log(`Attempting to send newsletter confirmation to ${email}`);
    const resend = getResendClient();

    if (!resend) {
      console.log('Resend not configured, skipping email');
      return;
    }

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'BlueZone <noreply@bluezonetwente.com>',
      to: email,
      subject: 'Newsletter Subscription Confirmed',
      html: `<p>You have successfully subscribed to the BlueZone newsletter.</p>`,
    });

    if (error) {
      console.error('Error sending newsletter confirmation email:', error);
    } else {
      console.log(`Newsletter confirmation email sent to ${email}`, data);
    }
  } catch (error) {
    console.error('Error sending newsletter confirmation email:', error);
  }
};

export const sendNewsletterBroadcast = async (recipients: string[], subject: string, content: string) => {
  try {
    const resend = getResendClient();

    if (!resend) {
      console.log('Resend not configured, skipping newsletter broadcast');
      return 0;
    }

    console.log(`Starting broadcast to ${recipients.length} subscribers...`);

    let sentCount = 0;
    for (const email of recipients) {
      try {
        const { error } = await resend.emails.send({
          from: process.env.EMAIL_FROM || 'BlueZone <noreply@bluezonetwente.com>',
          to: email,
          subject: subject,
          html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            ${content.replace(/\n/g, '<br>')}
            <br><br>
            <hr>
            <p style="font-size: 12px; color: #666;">
              You are receiving this email because you subscribed to the BlueZone newsletter.
              <a href="${getClientUrl()}/newsletter">Unsubscribe</a>
            </p>
          </div>`,
        });

        if (error) {
          console.error(`Failed to send to ${email}:`, error);
        } else {
          sentCount++;
        }
      } catch (err) {
        console.error(`Failed to send to ${email}:`, err);
      }
    }

    console.log(`Broadcast complete. Sent ${sentCount}/${recipients.length} emails.`);
    return sentCount;
  } catch (error) {
    console.error('Error in newsletter broadcast:', error);
    throw error;
  }
};
