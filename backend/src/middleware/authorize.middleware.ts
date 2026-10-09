import { NextFunction, Request, Response } from "express";
import { AppError } from "../common/errors/AppError.js";
import { prisma } from "../lib/prisma.js";

export const authorizedPermissions =
  (...requiredPermissions: string[]) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError("Unauthorized", 401));
      }

      // Fetch user with user roles
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: {
          userRoles: {
            include: {
              role: {
                include: { rolePermissions: { include: { permission: true } } },
              },
            },
          },
        },
      });

      if (!user) {
        return next(new AppError("User not found", 404));
      }

      // Extract all permissions
      const permissions = user.userRoles.flatMap((userRole) => {
        return userRole.role.rolePermissions.map(
          (rolePermission) => rolePermission.permission.name,
        );
      });

      // Remove duplicates
      const uniquePermissions = [...new Set(permissions)];

      const hasPermissions = requiredPermissions.every((permission) =>
        uniquePermissions.includes(permission),
      );

      if (!hasPermissions) {
        return next(new AppError("Forbidden", 403));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
