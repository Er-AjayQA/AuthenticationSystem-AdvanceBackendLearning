import { NextFunction, Request, Response } from "express";
import { AppError } from "../common/errors/AppError.js";
import jwt from "jsonwebtoken";
import { verifyAccessToken } from "../common/auth/Jwt.js";
import { JWTPayload } from "../common/types/index.js";

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
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

    req.user = {
      userId: payload.sub,
      sessionId: payload.sessionId,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      new AppError("Access token expired", 401);
    }

    if (error instanceof jwt.JsonWebTokenError) {
      new AppError("Invalid access token", 401);
    }

    return next(error);
  }
};
