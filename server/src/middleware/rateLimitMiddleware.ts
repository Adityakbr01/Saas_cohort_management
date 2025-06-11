import { Request, Response, NextFunction } from "express";
import safeCache from "@/utils/cache"; // Assume a cache utility (e.g., node-cache)
import {logger} from "@/utils/logger"; // Assume a logger setup (e.g., winston)

// Rate limit state stored in cache
interface RateLimitState {
  count: number; // Number of requests made
  resetTime: number; // Timestamp (ms) when limit resets
}

// Configurable rate limit options
interface RateLimitConfig {
  maxRequests: number; // Max requests allowed
  windowMs: number; // Time window in milliseconds
  keyPrefix: string; // Prefix for cache keys
}

const defaultConfig: RateLimitConfig = {
  maxRequests: 5, // 5 requests
  windowMs: 60 * 1000, // 60 seconds
  keyPrefix: "rate-limit",
};

// Rate limit middleware
const rateLimitMiddleware = (customConfig: Partial<RateLimitConfig> = {}) => {
  const config = { ...defaultConfig, ...customConfig };

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Determine key: use email if available, else IP
      let key = req.ip || "unknown-ip";
      if (req.body.email && typeof req.body.email === "string") {
        key = `email:${req.body.email.toLowerCase()}`;
      }
      const cacheKey = `${config.keyPrefix}:${key}`;

      // Get current rate limit state from cache
      const state = safeCache.get<RateLimitState>(cacheKey) || {
        count: 0,
        resetTime: Date.now() + config.windowMs,
      };

      // Check if window has expired
      if (state.resetTime <= Date.now()) {
        state.count = 0;
        state.resetTime = Date.now() + config.windowMs;
      }

      // Increment request count
      state.count += 1;

      // Check if limit exceeded
      if (state.count > config.maxRequests) {
        const retryAfter = Math.ceil((state.resetTime - Date.now()) / 1000);
        res.set({
          "Retry-After": retryAfter.toString(),
          "X-RateLimit-Limit": config.maxRequests.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": new Date(state.resetTime).toISOString(),
        });

        logger.warn(`Rate limit exceeded for key: ${key}, path: ${req.path}`);

        return res.status(429).json({
          status: "error",
          message: `Too many requests. Please try again after ${retryAfter} seconds.`,
        });
      }

      // Calculate remaining requests
      const remaining = Math.max(0, config.maxRequests - state.count);

      // Set rate limit headers
      res.set({
        "X-RateLimit-Limit": config.maxRequests.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": new Date(state.resetTime).toISOString(),
      });

      // Save updated state to cache
      const ttl = Math.ceil((state.resetTime - Date.now()) / 1000);
      const success = safeCache.set<RateLimitState>(cacheKey, state, ttl);
      if (!success) {
        logger.error(`Failed to set cache for key: ${cacheKey}, path: ${req.path}`);
      }

      next();
    } catch (error: any) {
      logger.error(`Rate limiter error: ${error.message}, path: ${req.path}`);
      return res.status(500).json({
        status: "error",
        message: "Internal server error. Please try again later.",
      });
    }
  };
};

// Specific configs for forgot password endpoints
export const forgotPasswordRateLimit = rateLimitMiddleware({
  maxRequests: 3, // 3 requests
  windowMs: 5 * 60 * 1000, // 5 minutes
  keyPrefix: "forgot-password",
});

export const resendOtpRateLimit = rateLimitMiddleware({
  maxRequests: 2, // 2 resend attempts
  windowMs: 5 * 60 * 1000, // 5 minutes
  keyPrefix: "resend-otp",
});

export default rateLimitMiddleware;