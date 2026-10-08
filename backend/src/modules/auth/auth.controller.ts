import { Request, Response } from "express";
import { CatchAsync } from "../../common/helpers/CatchAsync.js";
import authService from "./auth.container.js";
import { sendResponse } from "../../common/helpers/AppResponse.js";
import { setCookies } from "../../common/auth/auth.helper.js";
import { userType } from "./auth.types.js";
import { AppError } from "../../common/errors/AppError.js";

export const registerUserController = CatchAsync(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const userAgent = req.headers["user-agent"] || "unknown";
    const ipAddress = req.ip || "unknown";

    const result = await authService.registerUser({
      email,
      password,
      userAgent,
      ipAddress,
    });

    setCookies(res, result.refreshToken);

    sendResponse(res, 201, {
      success: true,
      message: "User registered successfully",
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  },
);

export const loginUserController = CatchAsync(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const userAgent = req.headers["user-agent"] || "unknown";
    const ipAddress = req.ip || "unknown";

    const result = await authService.loginUser({
      email,
      password,
      userAgent,
      ipAddress,
    });

    setCookies(res, result.refreshToken);

    sendResponse(res, 200, {
      success: true,
      message: "LoggedIn Successfully",
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  },
);

export const loggedInUserController = CatchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as userType;
    const result = await authService.getLoggedInUser(user);

    sendResponse(res, 200, {
      success: true,
      message: "User fetched successfullt",
      data: result,
    });
  },
);

export const refreshTokenController = CatchAsync(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    const userAgent = req.headers["user-agent"] || "unknown";
    const ipAddress = req.ip || "unknown";

    const result = await authService.refreshSession(
      refreshToken,
      userAgent,
      ipAddress,
    );

    setCookies(res, result.refreshToken);

    sendResponse(res, 201, {
      success: true,
      message: "Refresh token rotated successfully",
      data: { user: result.user, accessToken: result.accessToken },
    });
  },
);
