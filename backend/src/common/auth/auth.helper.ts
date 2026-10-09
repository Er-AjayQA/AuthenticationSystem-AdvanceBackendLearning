import { Response } from "express";
import { env } from "../../config/env.config.js";
import { JWTPayload } from "../types/index.js";
import jwt from "jsonwebtoken";
import ms, { StringValue } from "ms";
import { AppError } from "../errors/AppError.js";

export const generateSessionId = () => {
  return crypto.randomUUID();
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as JWTPayload;
};

export const setCookies = (res: Response, refreshToken: string) => {
  const refreshTokenMaxAge = ms(env.REFRESH_TOKEN_EXPIRES as StringValue);

  if (typeof refreshTokenMaxAge !== "number") {
    throw new AppError("Invalid refresh token expiry configuration", 401);
  }

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: refreshTokenMaxAge,
    path: "/api/v1/auth/refresh-token",
  });
};

export const clearCookies = (res: Response) => {
  const refreshTokenMaxAge = ms(env.REFRESH_TOKEN_EXPIRES as StringValue);

  if (typeof refreshTokenMaxAge !== "number") {
    throw new AppError("Invalid refresh token expiry configuration", 401);
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: refreshTokenMaxAge,
    path: "/api/v1/auth/refresh-token",
  });
};
