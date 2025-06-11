// src/middleware/dynamicRateLimiter.ts
import { Request, Response } from "express";
import rateLimit from "express-rate-limit";

interface RateLimitOptions {
  timeWindow: number;     // in milliseconds (e.g. 60_000 for 1 min)
  maxRequests: number;    // number of max requests in timeWindow
}

export const createDynamicRateLimiter = ({ timeWindow, maxRequests }: RateLimitOptions) => {
  return rateLimit({
    windowMs: timeWindow * 60 * 1000, // e.g. 1 minute = 60,000 ms
    max: maxRequests,
    standardHeaders: true,    // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,     // Disable the `X-RateLimit-*` headers
    message: (req:Request, res:Response) => {
      return {
        success: false,
        message: `Too many requests, please try again later.`,
      };
    },
  });
};
