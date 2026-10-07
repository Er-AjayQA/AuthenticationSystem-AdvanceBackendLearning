import { prisma } from "../../lib/prisma.js";
import { IAuthRepository } from "./auth.interface.js";
import { CreateUserType } from "./auth.types.js";

export class AuthRepository implements IAuthRepository {
  async findUserByEmail(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    return user;
  }

  async createUser(data: CreateUserType) {
    const newUser = await prisma.user.create({
      data: { email: data.email, passwordHash: data.passwordHash },
    });
    return newUser;
  }
}
