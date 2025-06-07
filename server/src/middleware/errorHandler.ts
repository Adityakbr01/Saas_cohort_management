import { Request, Response, NextFunction } from "express";
import { logger } from "@/utils/logger";
import { sendErrorMail } from "@/utils/mailer";

const errorHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  logger.error(`[${req.method}] ${req.originalUrl} - ${message}`, {
    statusCode,
    stack: err.stack,
  });

  // Only send alert for 500 errors in production
  if (process.env.NODE_ENV === "production" && statusCode >= 500) {
    await sendErrorMail(
      `🚨 [${statusCode}] Error in ${req.method} ${req.originalUrl}`,
      `Message: ${message}\n\nStack:\n${err.stack}`
    );
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

export default errorHandler;
