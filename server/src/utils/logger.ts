import winston from "winston";
import path from "path";

// Log directory path
const logDir = path.join(process.cwd(), "logs");

// Custom log format
const logFormat = winston.format.printf(({ timestamp, level, message }) => {
  return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
});

// Create logger instance
export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    logFormat
  ),
  transports: [
    // Save all logs in app.log
    new winston.transports.File({
      filename: path.join(logDir, "app.log"),
    }),

    // Save only errors in error.log
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    }),
  ],
});

// Console logging (with colors)
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // add colors
        winston.format.timestamp(),
        logFormat
      ),
    })
  );
}
