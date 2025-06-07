import { sendError } from "@/utils/responseUtil";
import { NextFunction, Request, Response, RequestHandler } from "express";
import { ZodSchema } from "zod";

export const validateRequest = (schema: ZodSchema<any>): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.body || Object.keys(req.body).length === 0) {
         sendError(res, 400, "Request body is missing");
         return
      }

      schema.parse(req.body);
      next();
    } catch (err: any) {
       sendError(res, 400, "Validation failed", err.errors);
       return
    }
  };
};

