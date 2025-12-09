export const welcomeEmailTemplate = (name: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4A90E2; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    .button { display: inline-block; padding: 10px 20px; background-color: #4A90E2; color: #ffffff !important; text-decoration: none; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to BlueZone!</h1>
    </div>
    <div class="content">
      <p>Hi ${name},</p>
      <p>Welcome to BlueZone! We're excited to have you on board.</p>
      <p>Discover events, join groups, and connect with your community.</p>
      <p><a href="${process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173'}" class="button">Get Started</a></p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} BlueZone. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const passwordResetTemplate = (resetUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4A90E2; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    .button { display: inline-block; padding: 10px 20px; background-color: #4A90E2; color: white; text-decoration: none; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset Request</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>You requested a password reset for your BlueZone account.</p>
      <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
      <p><a href="${resetUrl}" class="button">Reset Password</a></p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} BlueZone. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
