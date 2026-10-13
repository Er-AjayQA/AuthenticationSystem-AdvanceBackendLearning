import crypto from "crypto";
import { Response } from "express";
import { env } from "../../../config/env.config.js";
const OAUTH_COOKIE_STATE_NAME = "oauth_state";

export const generateOAuthState = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const setOAuthStateCookie = (res: Response, state: string) => {
  res.cookie(OAUTH_COOKIE_STATE_NAME, state, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60 * 1000,
  });
};

export const clearOAuthStateCookie = (res: Response) => {
  res.clearCookie(OAUTH_COOKIE_STATE_NAME);
};

export const OAUTH_STATE_COOKIE = OAUTH_COOKIE_STATE_NAME;
