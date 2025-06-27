import { Request, Response, NextFunction } from "express";
import rateLimit, { ValueDeterminingMiddleware } from "express-rate-limit";

interface RateLimitOptions {
  timeWindow: number; // Time window in minutes (can be fractional, e.g., 0.5 for 30 seconds)
  maxRequests: number; // Max requests in timeWindow
  keyGenerator: ValueDeterminingMiddleware<string>; // Custom key for rate limiting (e.g., IP or user ID)
  onLimitExceeded?: (req: Request, res: Response, next: NextFunction) => void; // Custom handler for 429
}

export const createDynamicRateLimiter = ({
  timeWindow,
  maxRequests,
  keyGenerator,
  onLimitExceeded,
}: RateLimitOptions) => {
  console.log(
    `[DEBUG] Creating rate limiter: timeWindow=${timeWindow}min, maxRequests=${maxRequests}`
  );

  return rateLimit({
    windowMs: timeWindow * 60 * 1000, // Convert minutes to milliseconds
    max: maxRequests,
    standardHeaders: true, // Include RateLimit-* headers
    legacyHeaders: false, // Disable X-RateLimit-* headers
    keyGenerator, // Use provided keyGenerator
    handler: (req: Request, res: Response, next: NextFunction) => {
      const key = keyGenerator(req,res);
      console.log(`[DEBUG] Rate limit exceeded for key: ${key}`);
      if (onLimitExceeded) {
        onLimitExceeded(req, res, next);
      } else {
        res.status(429).json({
          status: "error",
          message: "Too many requests, please try again later.",
        });
      }
    },
  });
};