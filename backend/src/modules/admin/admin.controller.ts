import { Request, Response } from "express";
import { CatchAsync } from "../../common/helpers/CatchAsync.js";
import { sendResponse } from "../../common/helpers/AppResponse.js";
import { adminService } from "./admin.container.js";

export const getUsersController = CatchAsync(
  async (req: Request, res: Response) => {
    const result = await adminService.getAllUsers();

    sendResponse(res, 200, {
      success: true,
      message: "Users fetched successfully",
      data: result,
    });
  },
);
