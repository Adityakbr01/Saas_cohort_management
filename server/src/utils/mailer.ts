import { env_config } from "@/configs/env";
import nodemailer from "nodemailer";

// Simple in-memory rate limiter
let lastSentTime = 0;
const RATE_LIMIT_MS = 5 * 60 * 1000; // 5 minutes

export const sendErrorMail = async (subject: string, message: string) => {
  const now = Date.now();
  if (now - lastSentTime < RATE_LIMIT_MS) {
    console.log("⏳ Email alert skipped due to rate limit");
    return;
  }

  lastSentTime = now;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env_config.SMTP_USER,
      pass:env_config.SMTP_PASS
    },
  });

  await transporter.sendMail({
    from: `"Error Bot" <${process.env.ERROR_EMAIL_SENDER}>`,
    to: env_config.ERROR_EMAIL_RECEIVER|| process.env.ERROR_EMAIL_RECEIVER,
    subject,
    text: message,
  });

  console.log("📧 Error email sent");
};
