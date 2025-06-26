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
export const sendEmail = async (
  options: EmailOptions
): Promise<EmailSendResult> => {
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
        
        <p><strong>Important:</strong> This OTP is valid for <strong>${
          process.env.OTP_EXPIRY || 2
        } minutes</strong> only.</p>
        
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
        
        <p><strong>Important:</strong> This OTP is valid for <strong>${
          process.env.OTP_EXPIRY || 2
        } minutes</strong> only.</p>
        
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

// send password reset susccess email
export const sendPasswordResetSuccessEmail = async (
  email: string,
  firstName: string = "User"
): Promise<EmailSendResult> => {
  try {
    const subject = "Password Reset Successful - EduLaunch";
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Successful</title>
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
        .success-box {
            background-color: #28a745;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
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
            <h2>Password Reset Successful</h2>
        </div>
        <div class="success-box">
            <h2>Success! 🎉</h2>
            <p>Your password has been successfully reset.</p>
        </div>
        <p>Hello <strong>${firstName}</strong>,</p>
        <p>Your password has been successfully reset. You can now log in with your new password.</p>
        <div class="warning">
            <strong>Security Notice:</strong> If you did not initiate this password reset, please contact our support team immediately.
        </div>
        <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
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
      html,
    });
  } catch (error: any) {
    logger.error(
      `Password reset success email sending failed: ${error.message}`
    );
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

// create a send email to join organization
export const sendEmailToJoinOrganization = async (
  email: string,
  orgName: string,
  firstName: string = "User",
  role: string = "mentor",
  orgId: string
): Promise<EmailSendResult> => {
  const backend_URL = process.env.backend_URL!;

  try {
    const subject = "Invitation to join EduLaunch Organization";

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitation to join EduLaunch Organization</title>
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
        .invitation-box {
            background-color: #007bff;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            margin: 20px 0;
        }
        .org-name {
            font-size: 24px;
            font-weight: bold;
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
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛒 EduLaunch</h1>
            <h2>Invitation to join Organization</h2>
        </div>
        
        <div class="invitation-box">
            <h2>Join Our Organization!</h2>
            <p>You have been invited to join the ${orgName} organization on EduLaunch as a ${role}.</p>
        </div>
        
        <p>Hello <strong>${firstName}</strong>,</p>
        
        <p>You have been invited to join the ${orgName} organization on EduLaunch. Please click the button below to accept the invitation.</p>

        <p>Thank you for considering our invitation. We look forward to having you on board!</p>

        <button style="background-color: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
            <a href="${backend_URL}/org/accept-mentor-request?email=${email}?orgId=${orgId}" style="color: white; text-decoration: none;">Accept Invitation</a>
        </button>
        
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
      html,
    });
  } catch (error: any) {
    logger.error(`Email to join organization sending failed: ${error.message}`);
    throw error;
  }
};

const frontend_URL = process.env.FRONTEND_URL;
const backend_URL = process.env.backend_URL;

/**
 * Interface for invite email parameters
 */
interface InviteEmailParams {
  email: string;
  token: string;
  orgName: string;
  role: string;
  firstName?: string;
  phone?: string;
  specialization?: string;
  experience?: string;
  bio?: string;
  certifications?: string;
}

/**
 * Email template configuration for better maintainability
 */
const EMAIL_CONFIG = {
  BRAND_COLORS: {
    PRIMARY: "#667eea",
    SECONDARY: "#764ba2",
    SUCCESS: "#10b981",
    WARNING: "#f59e0b",
    DANGER: "#ef4444",
    TEXT_PRIMARY: "#333333",
    TEXT_SECONDARY: "#666666",
    TEXT_MUTED: "#6c757d",
    BACKGROUND: "#f5f5f5",
    WHITE: "#ffffff",
  },
  LOGO_URL: "https://via.placeholder.com/120x40/ffffff/667eea?text=EduLaunch",
  SUPPORT_EMAIL: "support@edulaunch.com",
  COMPANY_NAME: "EduLaunch",
  INVITATION_EXPIRY_DAYS: 7,
} as const;

/**
 * Validates email parameters and sanitizes input
 * @param params - The invite email parameters
 * @throws Error if required parameters are missing or invalid
 */
const validateInviteParams = (params: InviteEmailParams): void => {
  const { email, token, orgName, role } = params;

  if (!email || !email.includes("@")) {
    throw new Error("Valid email address is required");
  }

  if (!token || token.length < 10) {
    throw new Error("Valid invitation token is required");
  }

  if (!orgName || orgName.trim().length === 0) {
    throw new Error("Organization name is required");
  }

  if (!role || role.trim().length === 0) {
    throw new Error("Role is required");
  }
};

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param content - The content to sanitize
 * @returns Sanitized content
 */
const sanitizeContent = (content: string | undefined): string => {
  if (!content) return "";
  return content
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
};

/**
 * Generates the user information section for the email template
 * @param userInfo - User information object
 * @returns HTML string for user info section
 */
const generateUserInfoSection = (userInfo: {
  phone?: string;
  specialization?: string;
  experience?: string;
  bio?: string;
  certifications?: string;
}): string => {
  const { phone, specialization, experience, bio, certifications } = userInfo;

  // Check if we have any user info to display
  const hasUserInfo =
    phone || specialization || experience || bio || certifications;

  if (!hasUserInfo) {
    return "";
  }

  let infoItems = "";

  if (phone) {
    infoItems += `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
          <strong style="color: #333333; font-size: 14px;">📞 Phone:</strong>
          <span style="color: #666666; font-size: 14px; margin-left: 10px;">${sanitizeContent(
            phone
          )}</span>
        </td>
      </tr>`;
  }

  if (specialization) {
    infoItems += `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
          <strong style="color: #333333; font-size: 14px;">🎯 Specialization:</strong>
          <span style="color: #666666; font-size: 14px; margin-left: 10px;">${sanitizeContent(
            specialization
          )}</span>
        </td>
      </tr>`;
  }

  if (experience) {
    infoItems += `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
          <strong style="color: #333333; font-size: 14px;">💼 Experience:</strong>
          <span style="color: #666666; font-size: 14px; margin-left: 10px;">${sanitizeContent(
            experience
          )}</span>
        </td>
      </tr>`;
  }

  if (bio) {
    infoItems += `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
          <strong style="color: #333333; font-size: 14px;">📝 Bio:</strong>
          <div style="color: #666666; font-size: 14px; margin-top: 5px; line-height: 1.5;">${sanitizeContent(
            bio
          )}</div>
        </td>
      </tr>`;
  }

  if (certifications) {
    infoItems += `
      <tr>
        <td style="padding: 8px 0;">
          <strong style="color: #333333; font-size: 14px;">🏆 Certifications:</strong>
          <span style="color: #666666; font-size: 14px; margin-left: 10px;">${sanitizeContent(
            certifications
          )}</span>
        </td>
      </tr>`;
  }

  return `
    <!-- User Information Section -->
    <div style="background-color: #fafbfc; border: 1px solid #e1e5e9; border-radius: 6px; padding: 20px; margin: 25px 0;">
      <h3 style="color: #333333; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">
        Your Profile Information
      </h3>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        ${infoItems}
      </table>
    </div>`;
};

/**
 * Generates the HTML email template for organization invitations
 * @param params - The invite email parameters
 * @returns Professional HTML email template
 */
const generateInviteEmailHTML = (params: InviteEmailParams): string => {
  const {
    orgName,
    role,
    firstName,
    phone,
    specialization,
    experience,
    bio,
    certifications,
    token,
  } = params;

  const inviteLink = `${backend_URL}/org/accept-invite?token=${token}`;
  const safeOrgName = sanitizeContent(orgName);
  const safeRole = sanitizeContent(role);
  const safeFirstName = sanitizeContent(firstName) || "there";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitation to join ${safeOrgName}</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <!-- Main Container -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
                            <img src="https://via.placeholder.com/120x40/ffffff/667eea?text=EduLaunch" alt="EduLaunch Logo" style="height: 40px; width: auto; margin-bottom: 20px;" />
                            <h1 style="color: #ffffff; font-size: 28px; font-weight: 600; margin: 0; line-height: 1.2;">
                                You're Invited!
                            </h1>
                            <p style="color: #e8eaff; font-size: 16px; margin: 10px 0 0 0; opacity: 0.9;">
                                Join ${safeOrgName} on EduLaunch
                            </p>
                        </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #333333; font-size: 24px; font-weight: 600; margin: 0 0 20px 0; line-height: 1.3;">
                                Hello ${safeFirstName}!
                            </h2>

                            <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                                We're excited to invite you to join <strong>${safeOrgName}</strong> as a <strong>${safeRole}</strong> on the EduLaunch platform. Your expertise and experience will be a valuable addition to our community.
                            </p>

                            ${generateUserInfoSection({
                              phone,
                              specialization,
                              experience,
                              bio,
                              certifications,
                            })}

                            <!-- Call to Action -->
                            <div style="text-align: center; margin: 35px 0;">
                                <a href="${inviteLink}"
                                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 6px; font-size: 16px; font-weight: 600; text-align: center; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);"
                                   onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(102, 126, 234, 0.6)';"
                                   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(102, 126, 234, 0.4)';">
                                    Accept Invitation
                                </a>
                            </div>

                            <!-- Security Notice -->
                            <div style="background-color: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 0 6px 6px 0;">
                                <p style="color: #555555; font-size: 14px; margin: 0; line-height: 1.5;">
                                    <strong>🔒 Security Notice:</strong> This invitation link is secure and will expire in 7 days. If you didn't expect this invitation, please ignore this email.
                                </p>
                            </div>

                            <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 25px 0 0 0;">
                                Thank you for considering our invitation. We look forward to having you on board and are excited to see the impact you'll make!
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
                            <p style="color: #6c757d; font-size: 14px; margin: 0 0 15px 0; line-height: 1.5;">
                                <strong>EduLaunch Platform</strong><br>
                                Empowering Education Through Technology
                            </p>

                            <p style="color: #6c757d; font-size: 12px; margin: 0; line-height: 1.4;">
                                Need help? Contact us at
                                <a href="mailto:support@edulaunch.com" style="color: #667eea; text-decoration: none;">support@edulaunch.com</a>
                                <br>
                                © 2024 EduLaunch. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
};

/**
 * Generates the plain text version of the invitation email
 * @param params - The invite email parameters
 * @returns Plain text email content
 */
const generateInviteEmailText = (params: InviteEmailParams): string => {
  const {
    orgName,
    role,
    firstName,
    phone,
    specialization,
    experience,
    bio,
    certifications,
    token,
  } = params;

  const inviteLink = `${backend_URL}/org/accept-invite?token=${token}`;
  const safeOrgName = sanitizeContent(orgName);
  const safeRole = sanitizeContent(role);
  const safeFirstName = sanitizeContent(firstName) || "there";

  let userInfoText = "";
  if (phone || specialization || experience || bio || certifications) {
    userInfoText = "\n\nYour Profile Information:\n";
    userInfoText += "========================\n";

    if (phone) userInfoText += `Phone: ${sanitizeContent(phone)}\n`;
    if (specialization)
      userInfoText += `Specialization: ${sanitizeContent(specialization)}\n`;
    if (experience)
      userInfoText += `Experience: ${sanitizeContent(experience)}\n`;
    if (bio) userInfoText += `Bio: ${sanitizeContent(bio)}\n`;
    if (certifications)
      userInfoText += `Certifications: ${sanitizeContent(certifications)}\n`;
  }

  return `
INVITATION TO JOIN ${safeOrgName.toUpperCase()}

Hello ${safeFirstName}!

We're excited to invite you to join ${safeOrgName} as a ${safeRole} on the EduLaunch platform. Your expertise and experience will be a valuable addition to our community.
${userInfoText}

To accept this invitation, please visit the following link:
${inviteLink}

SECURITY NOTICE: This invitation link is secure and will expire in 7 days. If you didn't expect this invitation, please ignore this email.

Thank you for considering our invitation. We look forward to having you on board and are excited to see the impact you'll make!

---
EduLaunch Platform
Empowering Education Through Technology

Need help? Contact us at support@edulaunch.com
© 2024 EduLaunch. All rights reserved.
`.trim();
};

/**
 * Sends a professional invitation email to join an organization
 * @param params - The invitation email parameters
 * @returns Promise that resolves when email is sent successfully
 * @throws Error if validation fails or email sending fails
 *
 * @example
 * ```typescript
 * await sendInviteEmail({
 *   email: 'mentor@example.com',
 *   token: 'secure-token-123',
 *   orgName: 'Tech Academy',
 *   role: 'Senior Mentor',
 *   firstName: 'John',
 *   phone: '+1-555-0123',
 *   specialization: 'Data Science',
 *   experience: '5 years',
 *   bio: 'Experienced data scientist...',
 *   certifications: 'AWS Certified, Google Cloud Professional'
 * });
 * ```
 */
export const sendInviteEmail = async (params: InviteEmailParams) => {
  try {
    // Validate input parameters
    validateInviteParams(params);

    const { email, orgName } = params;

    // Generate email subject
    const subject = `Invitation to join ${sanitizeContent(
      orgName
    )} on EduLaunch`;

    // Generate HTML and plain text versions
    const html = generateInviteEmailHTML(params);
    const text = generateInviteEmailText(params);

    // Send the email with both HTML and plain text versions
    const result = await sendEmail({
      to: email,
      subject,
      html,
      text, // Plain text fallback for email clients that don't support HTML
    });

    console.log(
      `Invitation email sent successfully to ${email} for ${orgName}`
    );
    return result;
  } catch (error) {
    console.error("Failed to send invitation email:", error);

    // Re-throw with more context
    if (error instanceof Error) {
      throw new Error(`Failed to send invitation email: ${error.message}`);
    } else {
      throw new Error(
        "Failed to send invitation email: Unknown error occurred"
      );
    }
  }
};

//send forgotPassword email
export const sendForgotPasswordEmail = async (
  email: string,
  otp: string,
  firstName: string = "User"
): Promise<EmailSendResult> => {
  try {
    const subject = "Password Reset Request - EduLaunch";

    const text = `
  Hello ${firstName},
  
  We received a request to reset your password. Use the following OTP to reset your password:
  
  Your OTP is: ${otp}
  
  This OTP is valid for ${process.env.OTP_EXPIRY || 2} minutes.
  
  If you did not request a password reset, please ignore this email.
  
  Best regards,
  EduLaunch Team
      `;

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
              <div class="otp-code">${otp}</div>
          </div>
          
          <p><strong>Important:</strong> This OTP is valid for <strong>${
            process.env.OTP_EXPIRY || 2
          } minutes</strong> only.</p>
          
          <p>If you did not request a password reset, please ignore this email.</p>
          
          <div class="footer">
              <p>Best regards,<br>
              <strong>EduLaunch Team</strong></p>
              <p>This is an automated email. Please do not reply to this message.</p>
          </div>
      </div>
  </body>
  </html>
      `;

    const result = await sendEmail({
      to: email,
      subject,
      html,
      text,
    });

    return result;
  } catch (error: any) {
    logger.error(`Forgot password email sending failed: ${error.message}`);
    throw error;
  }
};
