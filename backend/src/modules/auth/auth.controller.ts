import { Request, Response } from "express";
import { CatchAsync } from "../../common/helpers/CatchAsync.js";
import authService from "./auth.container.js";
import { sendResponse } from "../../common/helpers/AppResponse.js";

export const registerUserController = CatchAsync(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await authService.registerUser({ email, password });

    sendResponse(res, 201, {
      success: true,
      message: "User registered successfully",
      data: result,
    });
  },
);
