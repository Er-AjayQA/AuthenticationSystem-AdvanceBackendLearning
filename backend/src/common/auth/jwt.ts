import { env } from "../../config/env.config.js";
import { JWTPayload } from "../types/index.js";
import jwt, { SignOptions } from "jsonwebtoken";

export const signAccessToken = (payload: JWTPayload) => {
  return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRES as SignOptions["expiresIn"],
  });
};

export const signRefreshToken = (payload: JWTPayload) => {
  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES as SignOptions["expiresIn"],
  });
};

export const verigyAccessToken = (token: string) => {
  return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as JWTPayload;
};
