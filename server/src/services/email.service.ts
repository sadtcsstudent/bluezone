import nodemailer from 'nodemailer';
import { welcomeEmailTemplate, passwordResetTemplate } from '../utils/email.templates';

let transporterPromise: Promise<nodemailer.Transporter> | null = null;

const getTransporter = () => {
  if (transporterPromise) return transporterPromise;

  transporterPromise = (async () => {
    if (process.env.SMTP_HOST) {
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('SMTP not configured. Creating Ethereal test account...');
      try {
        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
          },
        });
        console.log('Ethereal Email Server ready');
        console.log('Credentials:', testAccount.user, testAccount.pass);
        return transporter;
      } catch (err) {
        console.error('Failed to create Ethereal test account', err);
        throw err;
      }
    }

    // Fallback or silent fail if not prod and not dev?
    // Better to return a dummy that logs
    console.warn('SMTP not configured and not in dev mode. Emails will not be sent.');
    return nodemailer.createTransport({
      jsonTransport: true
    });
  })();

  return transporterPromise;
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    const transporter = await getTransporter();

    // For jsonTransport (fallback), this mimics sendMail
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"BlueZone" <noreply@bluezone.com>',
      to: email,
      subject: 'Welcome to BlueZone!',
      html: welcomeEmailTemplate(name),
    });

    console.log(`Welcome email sent to ${email}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('Preview URL: %s', previewUrl);
    }
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  try {
    const transporter = await getTransporter();

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"BlueZone" <noreply@bluezone.com>',
      to: email,
      subject: 'Reset Your Password',
      html: passwordResetTemplate(resetUrl),
    });

    console.log(`Password reset email sent to ${email}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('Preview URL: %s', previewUrl);
    }
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};

export const sendNewsletterConfirmation = async (email: string) => {
  try {
    const transporter = await getTransporter();

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"BlueZone" <noreply@bluezone.com>',
      to: email,
      subject: 'Newsletter Subscription Confirmed',
      html: `<p>You have successfully subscribed to the BlueZone newsletter.</p>`,
    });

    console.log(`Newsletter confirmation email sent to ${email}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('Preview URL: %s', previewUrl);
    }
  } catch (error) {
    console.error('Error sending newsletter confirmation email:', error);
  }
};

export const sendNewsletterBroadcast = async (recipients: string[], subject: string, content: string) => {
  try {
    const transporter = await getTransporter();

    // In a real production app with thousands of users, we would use a queue (BullMQ) 
    // and a specialized provider API (SendGrid/SES) for bulk sending to avoid timeouts and blocks.
    // For this MVP, we will send sequentially.
    console.log(`Starting broadcast to ${recipients.length} subscribers...`);

    let sentCount = 0;
    for (const email of recipients) {
      try {
        const info = await transporter.sendMail({
          from: process.env.SMTP_FROM || '"BlueZone" <noreply@bluezone.com>',
          to: email,
          subject: subject,
          html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            ${content.replace(/\n/g, '<br>')}
            <br><br>
            <hr>
            <p style="font-size: 12px; color: #666;">
              You are receiving this email because you subscribed to the BlueZone newsletter.
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/newsletter">Unsubscribe</a>
            </p>
          </div>`,
        });
        sentCount++;

        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          console.log('Preview URL: %s', previewUrl);
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
