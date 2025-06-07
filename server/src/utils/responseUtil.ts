import { Response } from 'express';
import { logger } from '@/utils/logger.js';

// Define the shape of the API response
interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data?: T;
  error?: string | object;
  timestamp: string;
}

export const sendSuccess = <T>(
  res: Response,
  status: number,
  message: string,
  data?: T
) => {
  const response: ApiResponse<T> = {
    success: true,
    status,
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  logger.info(`Success Response: ${message}`, { status, data });
  return res.status(status).json(response);
};


export const sendError = (
  res: Response,
  status: number,
  message: string,
  error?: string | object
) => {
  const response: ApiResponse<never> = {
    success: false,
    status,
    message,
    error,
    timestamp: new Date().toISOString(),
  };

  logger.error(`Error Response: ${message}`, { status, error });
  return res.status(status).json(response);
};