import { NextFunction, Request, Response } from "express";
import { AppError } from "../common/errors/AppError.js";
import { permissionsService } from "../modules/auth/auth.permissions.service.js";

export const authorizedPermissions =
  (...requiredPermissions: string[]) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError("Unauthorized", 401));
      }

      const permissions = await permissionsService.getUserPermissions(
        req.user.userId,
      );

      const hasPermissions = requiredPermissions.every((permission) =>
        permissions.includes(permission),
      );

      if (!hasPermissions) {
        return next(new AppError("Forbidden", 403));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
