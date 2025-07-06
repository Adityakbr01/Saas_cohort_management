// backend/middleware/validateRequest.ts
import { sendError } from "@/utils/responseUtil";
import { NextFunction, Request, Response, RequestHandler } from "express";
import { ZodSchema } from "zod";

export const validateRequest = (schema: ZodSchema<any>): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // For multipart/form-data, req.body contains text fields, req.file contains the file
      const requestData = {
        ...req.body,
        ...req.files,
      };

      if (!requestData || Object.keys(requestData).length === 0) {
        sendError(res, 400, "Request body is missing");
        return;
      }

      schema.parse(requestData);
      // Attach parsed data to req for the controller to use
      req.body = requestData;
      next();
    } catch (err: any) {
      sendError(res, 400, "Validation failed", err.errors);
      return;
    }
  };
};