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

export const getAllRolesController = CatchAsync(
  async (req: Request, res: Response) => {
    const result = await adminService.getAllRoles();

    sendResponse(res, 200, {
      success: true,
      message: "All roles fetched successfully",
      data: result,
    });
  },
);

export const getRoleByIdController = CatchAsync(
  async (req: Request, res: Response) => {
    const roleId = req.params.roleId as string;
    const result = await adminService.getRoleById(roleId);

    sendResponse(res, 200, {
      success: true,
      message: "Role fetched successfully",
      data: result,
    });
  },
);
