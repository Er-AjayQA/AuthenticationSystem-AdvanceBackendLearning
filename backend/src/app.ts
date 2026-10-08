import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "./config/env.config.js";
import cookieParser from "cookie-parser";
import { globalErrorHandler } from "./middleware/error.middleware.js";
import { AppError } from "./common/errors/AppError.js";

export const app = express();

// For Production Use Only
// app.set("trust proxy", 1);

app.use(helmet());
app.use(requestLogger);
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health Check Route
app.get("/api/v1/health-check", async (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Server is healthy",
    upTIme: process.uptime(),
    timeStamp: Date.now(),
  });
});

import authRouter from "./modules/auth/auth.route.js";
import { requestLogger } from "./middleware/request-logger.middleware.js";

app.use("/api/v1/auth", authRouter);

// Global error for unknown routes
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can;t find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);
