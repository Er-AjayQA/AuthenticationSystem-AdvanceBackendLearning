import { NextFunction, Request, Response } from "express";
import { AppError } from "../common/errors/AppError.js";
import jwt from "jsonwebtoken";
import { verifyAccessToken } from "../common/auth/jwt.js";
import { JWTPayload } from "../common/types/index.js";
import { CatchAsync } from "../common/helpers/CatchAsync.js";
import authService from "../modules/auth/auth.container.js";

export const authMiddleware = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return next(new AppError("Authorization required", 401));
      }

      if (!authHeader.startsWith("Bearer ")) {
        return next(new AppError("Invalid authentication header format", 401));
      }

      const accessToken = authHeader.split(" ")[1];

      if (!accessToken) {
        return next(new AppError("Access token is missing", 401));
      }

      const payload = verifyAccessToken(accessToken) as JWTPayload;

      console.log("JWT claims:", {
        userId: payload.sub,
        sessionId: payload.sessionId,
      });

      const session = await authService.getUserSessionByUserIdAndSessionId(
        payload.sub,
        payload.sessionId,
      );

      if (session.isRevoked) {
        return next(new AppError("Session revoked", 401));
      }

      if (session.expiresAt < new Date()) {
        return next(new AppError("Session expired", 401));
      }

      if (session.userId !== payload.sub) {
        return next(new AppError("Invalid session", 401));
      }

      req.user = {
        userId: payload.sub,
        sessionId: payload.sessionId,
      };

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return next(new AppError("Access token expired", 401));
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return next(new AppError("Invalid access token", 401));
      }

      return next(error);
    }
  },
);
