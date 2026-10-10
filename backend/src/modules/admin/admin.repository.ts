import { AppError } from "../../common/errors/AppError.js";
import { prisma } from "../../lib/prisma.js";
import { IAdminRepository } from "./admin.interface.js";
import { updateRoleInputType } from "./admin.types.js";

export class AdminRepository implements IAdminRepository {
  async findAllUsers() {
    const allUsers = await prisma.user.findMany();
    return allUsers;
  }

  async findAllRoles() {
    const roles = await prisma.role.findMany({
      where: { isDeleted: false },

      select: {
        id: true,
        name: true,
        createdAt: true,
        isDeleted: false,

        userRoles: {
          select: {
            userId: true,
          },
        },

        rolePermissions: {
          select: {
            permission: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return roles;
  }

  async findRoleByRoleId(roleId: string) {
    const role = await prisma.role.findUnique({
      where: { id: roleId, isDeleted: false },

      select: {
        id: true,
        name: true,
        createdAt: true,
        isDeleted: false,

        userRoles: {
          select: {
            assignedAt: true,

            user: {
              select: {
                id: true,
                email: true,
                createdAt: true,
              },
            },
          },
        },

        rolePermissions: {
          select: {
            assignedAt: true,

            permission: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return role;
  }

  async findAllRolesByIds(roleIds: string[]) {
    const roles = await prisma.role.findMany({
      where: {
        isDeleted: false,
        id: {
          in: roleIds,
        },
      },
    });

    return roles;
  }

  async createRoleWithPermissions(name: string, permissions: string[]) {
    return prisma.$transaction(async (tx) => {
      const existingRole = await tx.role.findUnique({ where: { name } });

      if (existingRole) {
        throw new Error("ROLE_ALREADY_EXIST");
      }

      const dbPermissions = await tx.permission.findMany({
        where: {
          name: {
            in: permissions,
          },
        },
      });

      if (dbPermissions.length !== permissions.length) {
        throw new Error("INVALID_PERMISSIONS");
      }

      const role = await tx.role.create({ data: { name } });

      await tx.rolePermission.createMany({
        data: dbPermissions.map((permission) => ({
          roleId: role.id,
          permissionId: permission.id,
        })),
      });

      return role;
    });
  }

  async updateRoleWithPermissions(roleId: string, data: updateRoleInputType) {
    return prisma.$transaction(async (tx) => {
      const existingRole = tx.role.findUnique({
        where: { id: roleId },
        include: { rolePermissions: true },
      });

      if (!existingRole) {
        throw new Error("ROLE_NOT_FOUND");
      }

      if (data.name) {
        const duplicateRole = await tx.role.findFirst({
          where: { name: data.name, NOT: { id: roleId } },
        });

        if (duplicateRole) {
          throw new Error("ROLE_ALREADY_EXIST");
        }
      }

      const updatedRole = await tx.role.update({
        where: { id: roleId },
        data: { name: data.name },
      });

      if (data.permissions) {
        const dbPermissions = await tx.permission.findMany({
          where: {
            name: {
              in: data.permissions,
            },
          },
        });

        if (dbPermissions.length !== data.permissions.length) {
          throw new Error("INVALID_PERMISSIONS");
        }

        // Delete the previous permissions mapping
        await tx.rolePermission.deleteMany({ where: { roleId } });

        // Insert new Role Permission mapping
        await tx.rolePermission.createMany({
          data: dbPermissions.map((permission) => ({
            roleId,
            permissionId: permission.id,
          })),
        });
      }

      return updatedRole;
    });
  }

  async deleteRoleById(roleId: string) {
    return await prisma.$transaction(async (tx) => {
      const existingRole = await tx.role.findUnique({
        where: { id: roleId, isDeleted: false },
        include: { userRoles: true },
      });

      if (!existingRole) {
        throw new Error("ROLE_NOT_FOUND");
      }

      if (existingRole.userRoles.length > 0) {
        throw new Error("ASSIGNED_TO_USERS");
      }

      const updatedRole = await prisma.role.update({
        where: { id: roleId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });
    });
  }

  async assignRolesToUser(userId: string, roleIds: string[]) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });

      if (!user) {
        throw new AppError("User not found", 404);
      }

      const existingDbRoles = await tx.role.findMany({
        where: {
          id: {
            in: roleIds,
          },
          isDeleted: false,
        },
      });

      if (existingDbRoles.length !== roleIds.length) {
        throw new AppError("Invalid roles provided", 400);
      }

      const existingAssignments = await tx.userRole.findMany({
        where: {
          userId,
          roleId: {
            in: roleIds,
          },
        },
      });

      const existingRoleIds = new Set(
        existingAssignments.map((assignment) => assignment.roleId),
      );

      const newAssignments = roleIds.filter(
        (roleId) => !existingRoleIds.has(roleId),
      );

      if (newAssignments.length === 0) {
        throw new AppError("Roles already assigned", 400);
      }

      await tx.userRole.createMany({
        data: newAssignments.map((roleId) => ({
          userId,
          roleId,
        })),
      });

      return true;
    });
  }
}
