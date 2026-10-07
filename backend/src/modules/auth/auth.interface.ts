import { User } from "@prisma/client";
import { CreateUserType } from "./auth.types.js";

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<User | null>;

  createUser(data: CreateUserType): Promise<User>;
}
