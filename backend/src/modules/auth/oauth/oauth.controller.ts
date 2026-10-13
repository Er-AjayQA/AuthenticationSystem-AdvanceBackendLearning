import { Request, Response } from "express";
import { CatchAsync } from "../../../common/helpers/CatchAsync.js";
import { googleOAuthService } from "./oauth.container.js";
import { sendResponse } from "../../../common/helpers/AppResponse.js";
import {
  clearOAuthStateCookie,
  OAUTH_STATE_COOKIE,
  setOAuthStateCookie,
} from "./oauth.helper.js";
import { AppError } from "../../../common/errors/AppError.js";
import { logger } from "../../../config/logger.js";

export const redirectToGoogleController = CatchAsync(
  async (req: Request, res: Response) => {
    const result = await googleOAuthService.generateGoogleAuthUrl();

    setOAuthStateCookie(res, result.state);

    sendResponse(res, 200, {
      success: true,
      message: "Google OAuth URL generated successfully",
      data: { url: result.url },
    });
  },
);

export const googleCallbackController = CatchAsync(
  async (req: Request, res: Response) => {
    const state = req.query.state as string | undefined;
    const code = req.query.code as string | undefined;

    if (!state) {
      throw new AppError("OAuth state is missing", 400);
    }

    if (!code) {
      throw new AppError("Authorization code is missing", 400);
    }

    const cookieState = req.cookies[OAUTH_STATE_COOKIE];
    googleOAuthService.validateOAuthState(cookieState, state);
    clearOAuthStateCookie(res);

    const result = await googleOAuthService.handleGoogleCallback(code);

    sendResponse(res, 200, {
      success: true,
      message: "Google callback received successfully",
      data: result,
    });
  },
);
