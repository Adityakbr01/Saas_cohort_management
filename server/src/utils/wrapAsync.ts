import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import { logger } from "@/utils/logger"; // import your winston logger

type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const wrapAsync = (fn: AsyncRouteHandler) =>
  asyncHandler(async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error: any) {
      logger.error(`[${req.method}] ${req.originalUrl} - ${error.message}`, {
        stack: error.stack,
      });
      next(error);
    }
  });
