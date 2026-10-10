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
      select: {
        id: true,
        name: true,
        createdAt: true,

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
      where: { id: roleId },
      select: {
        id: true,
        name: true,
        createdAt: true,

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
}
