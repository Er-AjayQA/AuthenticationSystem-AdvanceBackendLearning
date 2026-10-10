import { Session } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { IAuthRepository } from "./auth.interface.js";
import {
  createSessionType,
  CreateUserType,
  updatedSessionType,
} from "./auth.types.js";
import { AppError } from "../../common/errors/AppError.js";

export class AuthRepository implements IAuthRepository {
  async findUserByEmail(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    return user;
  }

  async findUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, createdAt: true },
    });
    return user;
  }

  async findSessionById(sessionId: string) {
    const userSession = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    return userSession;
  }

  async findSessionByUserIdandSessionId(userId: string, sessionId: string) {
    const session = await prisma.session.findUnique({
      where: { userId, id: sessionId },
    });

    return session;
  }

  async findUserPermissions(userId: string) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,

          userRoles: {
            select: {
              role: {
                select: {
                  id: true,
                  name: true,
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
              },
            },
          },
        },
      });

      if (!user) {
        throw new AppError("User not found", 404);
      }

      // Extract Roles
      const roles = user?.userRoles?.map((userRole) => userRole.role.name);

      // Extract permissions
      const permissions = user?.userRoles?.flatMap((userRole) =>
        userRole.role.rolePermissions.map(
          (rolePermission) => rolePermission.permission.name,
        ),
      );

      // Remove Duplicates if any
      const uniquePermissions = [...new Set(permissions)];

      return {
        user: {
          id: user.id,
          email: user.email,
        },
        roles,
        permissions: uniquePermissions,
      };
    });
  }

  async createUser(data: CreateUserType) {
    const newUser = await prisma.user.create({
      data: { email: data.email, passwordHash: data.passwordHash },
    });
    return newUser;
  }

  async createSession(data: createSessionType) {
    const newSession = await prisma.session.create({ data });
    return newSession;
  }

  async revokeSessionBySessionId(sessionId: string) {
    await prisma.session.updateMany({
      where: { id: sessionId },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
      },
    });
    return true;
  }

  async revokeAllRefreshTokenByUser(userId: string) {
    await prisma.session.updateMany({
      where: { userId, isRevoked: false },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
      },
    });
    return true;
  }

  async updateSession(sessionId: string, data: updatedSessionType) {
    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data,
    });

    return updatedSession;
  }
}
