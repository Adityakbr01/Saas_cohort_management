import nodemailer, { Transporter } from "nodemailer";

import { logger } from "@/utils/logger";

// Interface for email options
interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

// Interface for email send result
interface EmailSendResult {
  success: boolean;
  messageId: string;
  response: string;
}

// Create email transporter
export const createTransporter = (): Transporter => {
  try {
    if (
      !process.env.EMAIL_HOST ||
      !process.env.EMAIL_PORT ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS
    ) {
      throw new Error("Missing email configuration environment variables");
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    return transporter;
  } catch (error: any) {
    logger.error(`Email transporter creation failed: ${error.message}`);
    throw new Error("Failed to create email transporter");
  }
};

// Send email
export const sendEmail = async (options: EmailOptions): Promise<EmailSendResult> => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"EduLaunch" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to: ${options.to}`);

    return {
      success: true,
      messageId: result.messageId,
      response: result.response,
    };
  } catch (error: any) {
    logger.error(`Email sending failed: ${error.message}`);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Send OTP email
export const sendOTPEmail = async (
  email: string,
  otp: string,
  firstName: string = "User"
): Promise<EmailSendResult> => {
  try {
    const subject = "Your OTP for EduLaunch App Verification";

    const text = `
Hello ${firstName},

Your OTP for email verification is: ${otp}

This OTP is valid for ${process.env.OTP_EXPIRY || 2} minutes.

If you didn't request this OTP, please ignore this email.

Best regards,
EduLaunch App Team
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 10px;
            border: 1px solid #ddd;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .otp-box {
            background-color: #007bff;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            margin: 20px 0;
        }
        .otp-code {
            font-size: 18px;
            font-weight: bold;
            letter-spacing: 4px;
            margin: 10px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛒 EduLaunch</h1>
            <h2>Email Verification</h2>
        </div>
        
        <p>Hello <strong>${firstName}</strong>,</p>
        
        <p>Thank you for registering with our EduLaunch! To complete your registration, please use the following OTP:</p>
        
        <div class="otp-box">
            <div>Your Verification Code</div>
            <div class="otp-code">${otp}</div>
        </div>
        
        <p><strong>Important:</strong> This OTP is valid for <strong>${process.env.OTP_EXPIRY || 2} minutes</strong> only.</p>
        
        <div class="warning">
            <strong>Security Notice:</strong> If you didn't request this verification code, please ignore this email. Never share your OTP with anyone.
        </div>
        
        <p>If you have any questions or need assistance, please contact our support team.</p>
        
        <div class="footer">
            <p>Best regards,<br>
            <strong>EduLaunch Team</strong></p>
            <p>This is an automated email. Please do not reply to this message.</p>
        </div>
    </div>
</body>
</html>
    `;

    return await sendEmail({
      to: email,
      subject,
      text,
      html,
    });
  } catch (error: any) {
    logger.error(`OTP email sending failed: ${error.message}`);
    throw error;
  }
};

// Send welcome email
export const sendWelcomeEmail = async (
  email: string,
  firstName: string = "User"
): Promise<EmailSendResult> => {
  try {
    const subject = "Welcome to EduLaunch!";

    const text = `
Hello ${firstName},

Welcome to EduLaunch! Your account has been successfully verified.

You can now:
- Browse our wide range of products
- Add items to your cart
- Place orders and track them in real-time
- Manage your profile and addresses

Thank you for choosing us!

Best regards,
EduLaunch Team
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to EduLaunch</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 10px;
            border: 1px solid #ddd;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .welcome-box {
            background-color: #28a745;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            margin: 20px 0;
        }
        .features {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .feature-item {
            margin: 10px 0;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛒 EduLaunch</h1>
        </div>
        
        <div class="welcome-box">
            <h2>Welcome, ${firstName}! 🎉</h2>
            <p>Your account has been successfully verified!</p>
        </div>
        
        <p>Thank you for joining our E-Commerce community. We're excited to have you on board!</p>
        
        <div class="features">
            <h3>What you can do now:</h3>
            <div class="feature-item">🛍️ Browse our wide range of products</div>
            <div class="feature-item">🛒 Add items to your cart</div>
            <div class="feature-item">📦 Place orders and track them in real-time</div>
            <div class="feature-item">👤 Manage your profile and addresses</div>
            <div class="feature-item">💬 Get real-time order updates</div>
        </div>
        
        <p>Start exploring our products and enjoy a seamless shopping experience!</p>
        
        <div class="footer">
            <p>Best regards,<br>
            <strong>EduLaunch Team</strong></p>
            <p>Need help? Contact our support team anytime.</p>
        </div>
    </div>
</body>
</html>
    `;

    return await sendEmail({
      to: email,
      subject,
      text,
      html,
    });
  } catch (error: any) {
    logger.error(`Welcome email sending failed: ${error.message}`);
    throw error;
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (
  email: string,
  otp: string,
  firstName: string = "User"
): Promise<EmailSendResult> => {
  try {
    const subject = "Password Reset Request - EduLaunch";

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 10px;
            border: 1px solid #ddd;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .otp-box {
            background-color: #dc3545;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            margin: 20px 0;
        }
        .otp-code {
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            margin: 10px 0;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛒 EduLaunch</h1>
            <h2>Password Reset Request</h2>
        </div>
        
        <p>Hello <strong>${firstName}</strong>,</p>
        
        <p>We received a request to reset your password. Use the following OTP to reset your password:</p>
        
        <div class="otp-box">
            <div>Password Reset Code</div>
            <div class="otp-code">${otp}</div>
        </div>
        
        <p><strong>Important:</strong> This OTP is valid for <strong>${process.env.OTP_EXPIRY || 2} minutes</strong> only.</p>
        
        <div class="warning">
            <strong>Security Notice:</strong> If you didn't request a password reset, please ignore this email and consider changing your password for security.
        </div>
        
        <div class="footer">
            <p>Best regards,<br>
            <strong>EduLaunch Team</strong></p>
        </div>
    </div>
</body>
</html>
    `;

    return await sendEmail({
      to: email,
      subject,
      html,
    });
  } catch (error: any) {
    logger.error(`Password reset email sending failed: ${error.message}`);
    throw error;
  }
};

// Verify email configuration
export const verifyEmailConfig = async (): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    logger.info("Email configuration verified successfully");
    return true;
  } catch (error: any) {
    logger.error(`Email configuration verification failed: ${error.message}`);
    return false;
  }
};
