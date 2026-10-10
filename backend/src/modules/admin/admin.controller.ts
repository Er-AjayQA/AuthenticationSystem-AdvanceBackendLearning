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

export const createRoleController = CatchAsync(
  async (req: Request, res: Response) => {
    const result = await adminService.createRole(req.body);

    sendResponse(res, 201, {
      success: true,
      message: "Role created successfully",
      data: result,
    });
  },
);

export const updateRoleController = CatchAsync(
  async (req: Request, res: Response) => {
    const roleId = req.params.roleId as string;
    const result = await adminService.updateRole(roleId, req.body);

    sendResponse(res, 201, {
      success: true,
      message: "Role updated successfully",
      data: result,
    });
  },
);

export const deleteRoleByIdController = CatchAsync(
  async (req: Request, res: Response) => {
    const roleId = req.params.roleId as string;
    await adminService.deleteRole(roleId);

    sendResponse(res, 201, {
      success: true,
      message: "Role deleted successfully",
    });
  },
);

export const assignRolesController = CatchAsync(
  async (req: Request, res: Response) => {
    const userId = req.params.userId as string;
    await adminService.assignRolesToUser(userId, req.body);

    sendResponse(res, 201, {
      success: true,
      message: "Roles assigned successfully",
    });
  },
);

export const removeUserRoleController = CatchAsync(
  async (req: Request, res: Response) => {
    const userId = req.params.userId as string;
    const result = await adminService.removeUserRole(userId, req.body.roleId);

    sendResponse(res, 201, {
      success: true,
      message: "User role removed successfully",
    });
  },
);

export const getAllUsersByRoleController = CatchAsync(
  async (req: Request, res: Response) => {
    const roleId = req.params.roleId as string;
    const result = await adminService.findAllUsersByRole(roleId);

    sendResponse(res, 200, {
      success: true,
      message: "Users fetched successfully",
      data: result,
    });
  },
);

export const getUserPermissionsController = CatchAsync(
  async (req: Request, res: Response) => {
    const userId = req.params.userId as string;
    const result = await adminService.userPermissionsByUserId(userId);

    sendResponse(res, 200, {
      success: true,
      message: "User permissions fetched successfully",
      data: result,
    });
  },
);
