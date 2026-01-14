import { MailerLite } from '@mailerlite/mailerlite-nodejs';
import { welcomeEmailTemplate, passwordResetTemplate } from '../utils/email.templates';

let mailerLiteClient: MailerLite | null = null;

const getMailerLiteClient = () => {
  if (mailerLiteClient) return mailerLiteClient;

  const apiKey = process.env.MAILERLITE_API_KEY;

  if (!apiKey) {
    console.warn('MAILERLITE_API_KEY not configured. Emails will not be sent.');
    return null;
  }

  mailerLiteClient = new MailerLite({
    api_key: apiKey
  });

  return mailerLiteClient;
};

const getClientUrl = () => {
  return process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    console.log(`Attempting to send welcome email to ${email}`);
    const client = getMailerLiteClient();

    if (!client) {
      console.log('MailerLite not configured, skipping email');
      return;
    }

    const params = {
      from: process.env.EMAIL_FROM || 'noreply@bluezonetwente.com',
      from_name: 'BlueZone',
      to: [{ email }],
      subject: 'Welcome to BlueZone!',
      html: welcomeEmailTemplate(name)
    };

    const response = await client.emails.send(params);
    console.log(`Welcome email sent to ${email}`, response.data);
  } catch (error: any) {
    console.error('Error sending welcome email:', error.response?.data || error.message || error);
  }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  try {
    console.log(`Attempting to send password reset email to ${email}`);
    const client = getMailerLiteClient();

    if (!client) {
      console.log('MailerLite not configured, skipping email');
      return;
    }

    const resetUrl = `${getClientUrl()}/reset-password?token=${token}`;
    const params = {
      from: process.env.EMAIL_FROM || 'noreply@bluezonetwente.com',
      from_name: 'BlueZone',
      to: [{ email }],
      subject: 'Reset Your Password',
      html: passwordResetTemplate(resetUrl)
    };

    const response = await client.emails.send(params);
    console.log(`Password reset email sent to ${email}`, response.data);
  } catch (error: any) {
    console.error('Error sending password reset email:', error.response?.data || error.message || error);
  }
};

export const sendNewsletterConfirmation = async (email: string) => {
  try {
    console.log(`Attempting to send newsletter confirmation to ${email}`);
    const client = getMailerLiteClient();

    if (!client) {
      console.log('MailerLite not configured, skipping email');
      return;
    }

    const params = {
      from: process.env.EMAIL_FROM || 'noreply@bluezonetwente.com',
      from_name: 'BlueZone',
      to: [{ email }],
      subject: 'Newsletter Subscription Confirmed',
      html: `<p>You have successfully subscribed to the BlueZone newsletter.</p>`
    };

    const response = await client.emails.send(params);
    console.log(`Newsletter confirmation email sent to ${email}`, response.data);
  } catch (error: any) {
    console.error('Error sending newsletter confirmation email:', error.response?.data || error.message || error);
  }
};

export const sendNewsletterBroadcast = async (recipients: string[], subject: string, content: string) => {
  try {
    const client = getMailerLiteClient();

    if (!client) {
      console.log('MailerLite not configured, skipping newsletter broadcast');
      return 0;
    }

    console.log(`Starting broadcast to ${recipients.length} subscribers...`);

    let sentCount = 0;
    for (const email of recipients) {
      try {
        const params = {
          from: process.env.EMAIL_FROM || 'noreply@bluezonetwente.com',
          from_name: 'BlueZone',
          to: [{ email }],
          subject: subject,
          html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            ${content.replace(/\n/g, '<br>')}
            <br><br>
            <hr>
            <p style="font-size: 12px; color: #666;">
              You are receiving this email because you subscribed to the BlueZone newsletter.
              <a href="${getClientUrl()}/newsletter">Unsubscribe</a>
            </p>
          </div>`
        };

        await client.emails.send(params);
        sentCount++;
      } catch (err: any) {
        console.error(`Failed to send to ${email}:`, err.response?.data || err.message || err);
      }
    }

    console.log(`Broadcast complete. Sent ${sentCount}/${recipients.length} emails.`);
    return sentCount;
  } catch (error) {
    console.error('Error in newsletter broadcast:', error);
    throw error;
  }
};
