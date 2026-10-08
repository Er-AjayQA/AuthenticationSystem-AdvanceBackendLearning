import { Session, User } from "@prisma/client";
import {
  createSessionType,
  CreateUserType,
  finUserById,
  updatedSessionType,
} from "./auth.types.js";

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(userId: string): Promise<finUserById | null>;
  findSessionById(sessionId: string): Promise<Session | null>;

  createUser(data: CreateUserType): Promise<User>;
  createSession(data: createSessionType): Promise<Session>;
  revokeSessionBySessionId(sessionId: string): Promise<boolean>;
  revokeAllRefreshTokenByUser(userId: string): Promise<boolean>;
  updateSession(sessionId: string, data: updatedSessionType): Promise<any>;
}
