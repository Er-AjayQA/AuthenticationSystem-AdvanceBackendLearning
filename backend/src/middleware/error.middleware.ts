import { NextFunction, Request, Response } from "express";
import { env } from "../config/env.config.js";
import { logger } from "../config/logger.js";

export const globalErrorHandler = (
  err: Error & {
    statusCode?: number;
    status?: string;
    message?: string;
    isOperational?: boolean;
  },
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let error = { ...err };
  error.message = err.message;
  error.status = err.status || "error";
  error.statusCode = err.statusCode || 500;

  //   For Develpment Environment
  if (env.NODE_ENV === "development") {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      stack: err.stack,
      error,
    });
  }

  // For Production Environment
  if (error.isOperational) {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  }

  // Generic Error
  logger.error(err, "Unexpected error");

  return res.status(500).json({
    status: "error",
    message: "Something went wrong. Please try again later.",
  });
};
