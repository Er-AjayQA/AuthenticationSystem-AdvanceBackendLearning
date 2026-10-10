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

export class AuthService {
  constructor(private authRepo: IAuthRepository) {}

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
    const createdUser = await this.authRepo.createUser(
      payload as CreateUserType,
    );

    return await this.loginUser({ email, password, userAgent, ipAddress });
  }

  async loginUser(data: {
    email: string;
    password: string;
    userAgent?: string;
    ipAddress?: string;
  }) {
    const { email, password, userAgent, ipAddress } = data;

    const existingUser = await this.authRepo.findUserByEmail(email);

    if (!existingUser) {
      throw new AppError("Invalid credentials", 401);
    }

    const isPasswordCorrect = await comparePassword(
      password,
      existingUser?.passwordHash as string,
    );

    if (!isPasswordCorrect) {
      throw new AppError("Invalid credentials", 401);
    }

    const sessionId = generateSessionId();

    const tokenPayload = {
      sub: existingUser.id,
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
      userId: existingUser.id,
      refreshTokenHash: hashedRefreshToken,
      userAgent: userAgent,
      ipAddress: ipAddress,
      expiresAt,
    });

    return {
      user: sanitizeUserResponse(existingUser),
      accessToken,
      refreshToken,
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

    const userSession = await this.authRepo.findSessionById(payload.sessionId);

    if (!userSession) {
      throw new AppError("Session not found", 401);
    }

    if (userSession.isRevoked) {
      throw new AppError("Session revoked", 401);
    }

    if (userSession.expiresAt < new Date()) {
      throw new AppError("Session expired", 401);
    }

    const user = await this.authRepo.findUserById(userSession.userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const hashIncomingToken = hashRefreshToken(refreshToken);
    const isRefreshTokenValid =
      hashIncomingToken === userSession.refreshTokenHash;

    if (!isRefreshTokenValid) {
      await this.authRepo.revokeAllRefreshTokenByUser(userSession.userId);

      throw new AppError("Refresh token reuse detected", 401);
    }

    const newSessionId = generateSessionId();
    const tokenPayload = {
      sub: userSession.userId,
      sessionId: newSessionId,
    };
    const newRefreshToken = signRefreshToken(tokenPayload);
    const hashedNewRefreshToken = hashRefreshToken(newRefreshToken);
    const newAccessToken = signAccessToken(tokenPayload);
    const newRefreshTokenExpiry = new Date(
      Date.now() + ms(env.REFRESH_TOKEN_EXPIRES as StringValue),
    );

    await this.authRepo.revokeSessionBySessionId(userSession.id);

    const newSession = await this.authRepo.createSession({
      id: newSessionId,
      userId: userSession.userId,
      refreshTokenHash: hashedNewRefreshToken,
      userAgent,
      ipAddress,
      expiresAt: newRefreshTokenExpiry,
    });

    return {
      user,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
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
    const user = await this.authRepo.findUserPermissions(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const permissions = await this.authRepo.findUserPermissions(userId);

    return permissions;
  }
}
