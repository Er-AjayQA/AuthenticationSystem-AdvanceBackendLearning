import { Session, User } from "@prisma/client";
import { createSessionType, CreateUserType } from "./auth.types.js";

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<User | null>;

  createUser(data: CreateUserType): Promise<User>;
  createSession(data: createSessionType): Promise<Session>;
}
