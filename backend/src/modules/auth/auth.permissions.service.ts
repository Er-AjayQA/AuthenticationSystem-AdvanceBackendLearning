import { prisma } from "../../lib/prisma.js";
import redis from "../../lib/redis.js";

export class PermissionService {
  private readonly CACHE_TTL = 60 * 60;

  private getCacheKey(userId: string) {
    return `permissions:${userId}`;
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const cacheKey = this.getCacheKey(userId);

    const cachedPermissions = await redis.get(cacheKey);

    if (cachedPermissions) {
      return JSON.parse(cachedPermissions);
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },

      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return [];
    }

    const userPermissions = user.userRoles.flatMap((userRole) => {
      return userRole.role.rolePermissions.map(
        (rolePermission) => rolePermission.permission.name,
      );
    });

    const uniquePermissions = [...new Set(userPermissions)];

    await redis.set(
      cacheKey,
      JSON.stringify(uniquePermissions),
      "EX",
      this.CACHE_TTL,
    );

    return uniquePermissions;
  }

  async invalidateUserPermissions(userId: string) {
    await redis.del(this.getCacheKey(userId));
  }

  async invalidateRoleUsers(roleId: string) {
    const users = await prisma.userRole.findMany({
      where: {
        roleId,
      },

      select: {
        userId: true,
      },
    });

    if (!users.length) {
      return;
    }

    const keys = users.map((user) => this.getCacheKey(user.userId));

    await redis.del(...keys);
  }
}

export const permissionsService = new PermissionService();
