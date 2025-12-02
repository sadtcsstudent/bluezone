import nodemailer from 'nodemailer';
import { welcomeEmailTemplate, passwordResetTemplate } from '../utils/email.templates';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    if (!process.env.SMTP_HOST) {
      console.log('SMTP not configured, skipping welcome email');
      return;
    }
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"BlueZone" <noreply@bluezone.com>',
      to: email,
      subject: 'Welcome to BlueZone!',
      html: welcomeEmailTemplate(name),
    });
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  try {
    if (!process.env.SMTP_HOST) {
      console.log('SMTP not configured, skipping password reset email');
      return;
    }
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"BlueZone" <noreply@bluezone.com>',
      to: email,
      subject: 'Reset Your Password',
      html: passwordResetTemplate(resetUrl),
    });
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};

export const sendNewsletterConfirmation = async (email: string) => {
  try {
    if (!process.env.SMTP_HOST) {
      console.log('SMTP not configured, skipping newsletter confirmation email');
      return;
    }
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"BlueZone" <noreply@bluezone.com>',
      to: email,
      subject: 'Newsletter Subscription Confirmed',
      html: `<p>You have successfully subscribed to the BlueZone newsletter.</p>`,
    });
    console.log(`Newsletter confirmation email sent to ${email}`);
  } catch (error) {
    console.error('Error sending newsletter confirmation email:', error);
  }
};
