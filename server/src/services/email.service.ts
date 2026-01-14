import axios from 'axios';
import { welcomeEmailTemplate, passwordResetTemplate } from '../utils/email.templates';

const MAILERLITE_API_URL = 'https://connect.mailerlite.com/api';

const getMailerLiteClient = () => {
  const apiKey = process.env.MAILERLITE_API_KEY;

  if (!apiKey) {
    console.warn('MAILERLITE_API_KEY not configured. Emails will not be sent.');
    return null;
  }

  return axios.create({
    baseURL: MAILERLITE_API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }
  });
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

    const response = await client.post('/emails', {
      from: {
        email: process.env.EMAIL_FROM || 'noreply@bluezonetwente.com',
        name: 'BlueZone'
      },
      to: [{ email }],
      subject: 'Welcome to BlueZone!',
      html: welcomeEmailTemplate(name)
    });

    console.log(`Welcome email sent to ${email}`, response.data);
  } catch (error: any) {
    console.error('Error sending welcome email:', error.response?.data || error.message);
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
    const response = await client.post('/emails', {
      from: {
        email: process.env.EMAIL_FROM || 'noreply@bluezonetwente.com',
        name: 'BlueZone'
      },
      to: [{ email }],
      subject: 'Reset Your Password',
      html: passwordResetTemplate(resetUrl)
    });

    console.log(`Password reset email sent to ${email}`, response.data);
  } catch (error: any) {
    console.error('Error sending password reset email:', error.response?.data || error.message);
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

    const response = await client.post('/emails', {
      from: {
        email: process.env.EMAIL_FROM || 'noreply@bluezonetwente.com',
        name: 'BlueZone'
      },
      to: [{ email }],
      subject: 'Newsletter Subscription Confirmed',
      html: `<p>You have successfully subscribed to the BlueZone newsletter.</p>`
    });

    console.log(`Newsletter confirmation email sent to ${email}`, response.data);
  } catch (error: any) {
    console.error('Error sending newsletter confirmation email:', error.response?.data || error.message);
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
        await client.post('/emails', {
          from: {
            email: process.env.EMAIL_FROM || 'noreply@bluezonetwente.com',
            name: 'BlueZone'
          },
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
        });

        sentCount++;
      } catch (err: any) {
        console.error(`Failed to send to ${email}:`, err.response?.data || err.message);
      }
    }

    console.log(`Broadcast complete. Sent ${sentCount}/${recipients.length} emails.`);
    return sentCount;
  } catch (error) {
    console.error('Error in newsletter broadcast:', error);
    throw error;
  }
};
