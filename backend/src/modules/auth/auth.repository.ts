import { AuthAccount, AuthProvider, Session } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { IAuthRepository } from "./auth.interface.js";
import {
  createSessionType,
  CreateUserType,
  LinkAuthAccountType,
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

  async findSessionByUserIdandSessionId(userId: string, sessionId: string) {
    const session = await prisma.session.findUnique({
      where: { userId, id: sessionId },
    });

    return session;
  }

  async createUser(data: CreateUserType) {
    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        provider: data.provider,
      },
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

  // OAuth
  async findAuthAccount(provider: AuthProvider, providerAccountId: string) {
    const account = await prisma.authAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
      include: {
        user: true,
      },
    });

    return account;
  }

  async createAuthAccount(data: AuthAccount) {
    return await prisma.authAccount.create({
      data,
    });
  }

  async linkAuthAccount(data: LinkAuthAccountType) {
    const authAccount = await prisma.authAccount.create({ data });
    return authAccount;
  }
}
