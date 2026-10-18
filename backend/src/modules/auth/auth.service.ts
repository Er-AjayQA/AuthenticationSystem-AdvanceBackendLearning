import ms, { StringValue } from "ms";
import {
  generateSessionId,
  verifyRefreshToken,
} from "../../common/auth/auth.helper.js";
import { comparePassword, hashPassword } from "../../common/auth/password.js";
import { AppError } from "../../common/errors/AppError.js";
import { IAuthRepository } from "./auth.interface.js";
import { sanitizeUserResponse } from "./auth.response.js";
import { CreateUserType, userType } from "./auth.types.js";
import { env } from "../../config/env.config.js";
import { signAccessToken, signRefreshToken } from "../../common/auth/jwt.js";
import { hashRefreshToken } from "../../common/auth/token.js";
import { permissionsService } from "./auth.permissions.service.js";
import { loginLockoutService } from "./security/login-lockout.service.js";
import { refreshProtectionService } from "./security/refresh-protection.service.js";

export class AuthService {
  constructor(private authRepo: IAuthRepository) {}

  async createAuthenticatedSession(
    userId: string,
    userAgent?: string,
    ipAddress?: string,
  ) {
    const sessionId = generateSessionId();

    const tokenPayload = {
      sub: userId,
      sessionId,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);
    const hashedRefreshToken = hashRefreshToken(refreshToken);
    const expiresAt = new Date(
      Date.now() + ms(env.REFRESH_TOKEN_EXPIRES as StringValue),
    );

    await this.authRepo.createSession({
      id: sessionId,
      userId: userId,
      refreshTokenHash: hashedRefreshToken,
      userAgent: userAgent,
      ipAddress: ipAddress,
      expiresAt,
    });

    return { accessToken, refreshToken };
  }

  async registerUser(data: {
    email: string;
    password: string;
    userAgent?: string;
    ipAddress?: string;
  }) {
    const { email, password, userAgent, ipAddress } = data;
    const existingUser = await this.authRepo.findUserByEmail(email);

    if (existingUser) {
      throw new AppError("User already registered", 400);
    }

    const hashedPassword = await hashPassword(password);

    const payload = {
      email,
      passwordHash: hashedPassword,
    };
    const newUser = await this.authRepo.createUser(payload as CreateUserType);

    const authSession = await this.createAuthenticatedSession(
      newUser.id,
      userAgent,
      ipAddress,
    );

    return { user: sanitizeUserResponse(newUser), ...authSession };
  }

  async loginUser(data: {
    email: string;
    password: string;
    userAgent?: string;
    ipAddress?: string;
  }) {
    const { email, password, userAgent, ipAddress } = data;

    const existingUser = await this.authRepo.findUserByEmail(email);

    if (!existingUser || !existingUser.passwordHash) {
      await loginLockoutService.recordFailure(
        email as string,
        ipAddress as string,
      );

      throw new AppError("Invalid credentials", 401);
    }

    const isPasswordCorrect = await comparePassword(
      password,
      existingUser?.passwordHash as string,
    );

    if (!isPasswordCorrect) {
      await loginLockoutService.recordFailure(
        email as string,
        ipAddress as string,
      );

      throw new AppError("Invalid credentials", 401);
    }

    await loginLockoutService.clearFailures(
      email as string,
      ipAddress as string,
    );

    const authSession = await this.createAuthenticatedSession(
      existingUser.id,
      userAgent,
      ipAddress,
    );

    return {
      user: sanitizeUserResponse(existingUser),
      ...authSession,
    };
  }

  async getLoggedInUser(data: userType) {
    const user = await this.authRepo.findUserById(data.userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  }

  async refreshSession(
    refreshToken: string,
    userAgent?: string,
    ipAddress?: string,
  ) {
    if (!refreshToken) {
      throw new AppError("Refresh token is missing", 401);
    }

    const payload = verifyRefreshToken(refreshToken);

    await refreshProtectionService.acquireRefreshLock(payload.sessionId);

    try {
      const session = await this.authRepo.findSessionById(payload.sessionId);

      if (!session) {
        throw new AppError("Session not found", 404);
      }

      refreshProtectionService.validateSession({
        isRevoked: session.isRevoked,
        isDeleted: session.isDeleted,
      });

      if (userAgent && session.userAgent && userAgent !== session.userAgent) {
        refreshProtectionService.logSuspiciousRefresh({
          userId: session.userId,
          sessionId: session.id,
          previousUserAgent: session.userAgent,
          currentUserAgent: userAgent,
        });
      }

      const incomingTokenHash = hashRefreshToken(refreshToken);
      const isIncomingRefreshTokenValid =
        incomingTokenHash === session.refreshTokenHash;

      if (!isIncomingRefreshTokenValid) {
        refreshProtectionService.logRefreshReuse({
          userId: session.userId,
          sessionId: session.id,
        });

        await this.authRepo.revokeAllRefreshTokenByUser(session.userId);

        throw new AppError("Refresh token reuse detected", 401);
      }

      const tokenPayload = {
        sub: session.userId,
        sessionId: session.id,
      };

      const newAccessToken = signAccessToken(tokenPayload);
      const newRefreshToken = signRefreshToken(tokenPayload);
      const hashedRefreshToken = hashRefreshToken(newRefreshToken);
      const expiresAt = new Date(
        Date.now() + ms(env.REFRESH_TOKEN_EXPIRES as StringValue),
      );

      const updatedSession = await this.authRepo.updateSession(session.id, {
        refreshTokenHash: hashedRefreshToken,
        expiresAt,
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } finally {
      await refreshProtectionService.releaseRefreshLock(payload.sessionId);
    }
  }

  async getUserSessionByUserIdAndSessionId(userId: string, sessionId: string) {
    if (!sessionId) {
      throw new AppError("SessionId is missing", 401);
    }

    const session = await this.authRepo.findSessionByUserIdandSessionId(
      userId,
      sessionId,
    );

    if (!session) {
      throw new AppError("Session not found", 404);
    }

    return session;
  }

  async logout(data: userType) {
    const { userId, sessionId } = data;

    if (!sessionId) {
      throw new AppError("SessionId is missing", 401);
    }

    const userSession = await this.authRepo.findSessionByUserIdandSessionId(
      userId,
      sessionId,
    );

    if (!userSession) {
      throw new AppError("Session not found or you are not authorized", 401);
    }

    const revokeSession = await this.authRepo.revokeSessionBySessionId(
      userSession.id,
    );

    return true;
  }

  async logoutAllDevices(userId: string) {
    const user = await this.authRepo.findUserById(userId);

    if (!user) {
      throw new AppError("User not found", 401);
    }

    await this.authRepo.revokeAllRefreshTokenByUser(user.id);
  }

  async getUserPersmissions(userId: string) {
    const permissions = await permissionsService.getUserPermissions(userId);

    if (!permissions.length) {
      throw new AppError("User don't have any permissions", 404);
    }

    return permissions;
  }
}
