import { Session } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { IAuthRepository } from "./auth.interface.js";
import {
  createSessionType,
  CreateUserType,
  updatedSessionType,
} from "./auth.types.js";

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
      where: { userId },
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
