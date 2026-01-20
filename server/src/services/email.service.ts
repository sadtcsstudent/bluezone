import nodemailer from 'nodemailer';
import { welcomeEmailTemplate, passwordResetTemplate } from '../utils/email.templates';

let transporterPromise: Promise<nodemailer.Transporter> | null = null;

const getFromAddress = () => {
  if (process.env.EMAIL_FROM) return process.env.EMAIL_FROM;
  if (process.env.SMTP_FROM) return process.env.SMTP_FROM;
  if (process.env.SMTP_USER) return `"BlueZone" <${process.env.SMTP_USER}>`;
  return '"BlueZone" <noreply@bluezone.com>';
};

const getTransporter = () => {
  if (transporterPromise) return transporterPromise;

  transporterPromise = (async () => {
    if (process.env.SMTP_HOST) {
      const port = parseInt(process.env.SMTP_PORT || '587');
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: port,
        secure: port === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
      });
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('SMTP not configured. Creating Ethereal test account...');
      try {
        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
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

    console.warn('SMTP not configured and not in dev mode. Emails will not be sent.');
    return nodemailer.createTransport({
      jsonTransport: true,
    });
  })();

  return transporterPromise;
};

const getClientUrl = () => {
  return process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    console.log(`Attempting to send welcome email to ${email}`);
    const transporter = await getTransporter();

    const info = await transporter.sendMail({
      from: getFromAddress(),
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
    console.log(`Attempting to send password reset email to ${email}`);
    const transporter = await getTransporter();

    const resetUrl = `${getClientUrl()}/reset-password?token=${token}`;
    const info = await transporter.sendMail({
      from: getFromAddress(),
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
    console.log(`Attempting to send newsletter confirmation to ${email}`);
    const transporter = await getTransporter();

    const info = await transporter.sendMail({
      from: getFromAddress(),
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

    console.log(`Starting broadcast to ${recipients.length} subscribers...`);

    let sentCount = 0;
    for (const email of recipients) {
      try {
        const info = await transporter.sendMail({
          from: getFromAddress(),
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
