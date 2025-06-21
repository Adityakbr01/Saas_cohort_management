import crypto from "crypto";

import { logger } from "@/utils/logger";
import { UserDAO } from "@/dao/user.dao";
import { IUser } from "@/models/userModel";
import { IStudent } from "@/models/student";
import { StudentDAO } from "@/dao/studentDao";

// Interface for OTP verification result
interface OTPVerificationResult {
  isValid: boolean;
  error: string | null;
  isOTPExpired?: boolean;
  isOTPFormatValid?: boolean;
  isOTPMatch?: boolean;
  isOTPHashMatch?: boolean;
  isOTPHashValid?: boolean;
  isOTPHashExpired?: boolean;
  isOTPHashFormatValid?: boolean;
}

// Interface for OTP remaining time
interface OTPRemainingTime {
  expired: boolean;
  remainingSeconds: number;
  remainingMinutes: number;
  remainingSecondsInMinute?: number;
}

// Interface for OTP data
interface OTPData {
  otp: string;
  expiry: Date;
  purpose: string;
  createdAt: Date;
}

// Interface for user with OTP fields
interface OTPUser {
  otp?: string;
  otpExpiry?: Date;
}

// Generate a random OTP
export const generateOTP = (length: number = 6): string => {
  try {
    const digits = "0123456789";
    let otp = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, digits.length);
      otp += digits[randomIndex];
    }

    logger.info(`OTP generated with length: ${length}`);
    return otp;
  } catch (error: any) {
    logger.error(`OTP generation failed: ${error.message}`);
    throw new Error("Failed to generate OTP");
  }
};

// Generate OTP expiry time
export const generateOTPExpiry = (minutes: number = 2): Date => {
  const expiryMinutes = parseInt(process.env.OTP_EXPIRY || `${minutes}`);
  return new Date(Date.now() + expiryMinutes * 60 * 1000); // 2 minutes by default
};

// Validate OTP format
export const validateOTPFormat = (otp: string, expectedLength: number = 6): boolean => {
  if (!otp || typeof otp !== "string") {
    return false;
  }

  const otpRegex = new RegExp(`^\\d{${expectedLength}}$`);
  return otpRegex.test(otp);
};

// Check if OTP is expired
export const isOTPExpired = (otpExpiry?: Date): boolean => {
  if (!otpExpiry) return true;
  return new Date() > otpExpiry;
};

// Verify OTP against stored OTP
export const verifyOTP = (
  providedOTP: string,
  storedOTP: string,
  otpExpiry: Date
): OTPVerificationResult => {
  try {
    if (!validateOTPFormat(providedOTP)) {
      return {
        isValid: false,
        error: "Invalid OTP format",
      };
    }

    if (isOTPExpired(otpExpiry)) {
      return {
        isValid: false,
        error: "OTP has expired",
        isOTPExpired: true,
      };
    }

    if (providedOTP !== storedOTP) {
      return {
        isValid: false,
        error: "Invalid OTP",
      };
    }

    logger.info("OTP verification succeeded");
    return {
      isValid: true,
      error: null,
    };
  } catch (error: any) {
    logger.error(`OTP verification failed: ${error.message}`);
    return {
      isValid: false,
      error: "OTP verification failed",
    };
  }
};

// Generate secure hash for OTP
export const hashOTP = (otp: string): string => {
  try {
    return crypto.createHash("sha256").update(otp).digest("hex");
  } catch (error: any) {
    logger.error(`OTP hashing failed: ${error.message}`);
    throw new Error("Failed to hash OTP");
  }
};

// Verify hashed OTP
export const verifyHashedOTP = (providedOTP: string, hashedOTP: string): boolean => {
  try {
    const hashedProvidedOTP = hashOTP(providedOTP);
    return hashedProvidedOTP === hashedOTP;
  } catch (error: any) {
    logger.error(`Hashed OTP verification failed: ${error.message}`);
    return false;
  }
};

// Get remaining time for OTP expiry
export const getOTPRemainingTime = (otpExpiry?: Date): OTPRemainingTime => {
  if (!otpExpiry) {
    return {
      expired: true,
      remainingSeconds: 0,
      remainingMinutes: 0,
    };
  }

  const now = new Date();
  const remainingMs = otpExpiry.getTime() - now.getTime();

  if (remainingMs <= 0) {
    return {
      expired: true,
      remainingSeconds: 0,
      remainingMinutes: 0,
    };
  }

  const remainingSeconds = Math.floor(remainingMs / 1000);
  const remainingMinutes = Math.floor(remainingSeconds / 60);

  return {
    expired: false,
    remainingSeconds,
    remainingMinutes,
    remainingSecondsInMinute: remainingSeconds % 60,
  };
};

// Generate OTP for specific purpose
export const generateOTPForPurpose = (
  purpose: string = "verification",
  length: number = 6
): OTPData => {
  const otp = generateOTP(length);
  const expiry = generateOTPExpiry();
  logger.info(`OTP generated for purpose: ${purpose}`);
  return {
    otp,
    expiry,
    purpose,
    createdAt: new Date(),
  };
};

// Clean expired OTPs
export const cleanExpiredOTP = (student: IStudent): boolean => {
  if (student.otp && student.otpExpiry && isOTPExpired(student.otpExpiry)) {
    StudentDAO.updateUserOTP(student, undefined, undefined);
    student.otp = undefined;
    student.otpExpiry = undefined;
    logger.info("Expired OTP cleaned for user");
    return true;
  }
  return false;
};
