import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";

export const createDynamicRateLimiter = ({
  maxRequests,
  timeWindow,
  keyGenerator,
}: {
  maxRequests: number;
  timeWindow: number;
  keyGenerator?: (req: Request) => string;
}) => {
  return rateLimit({
    windowMs: timeWindow * 60 * 1000,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req: Request, res: Response) => {
      res.status(429).json({
        status: "error",
        message: "Too many requests, please try again later.",
      });
    },
  });
};

