import { Session, User } from "@prisma/client";
import {
  createSessionType,
  CreateUserType,
  finUserById,
} from "./auth.types.js";

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(userId: string): Promise<finUserById | null>;

  createUser(data: CreateUserType): Promise<User>;
  createSession(data: createSessionType): Promise<Session>;
}
