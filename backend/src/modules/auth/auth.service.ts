import { hashPassword } from "../../common/auth/password.js";
import { AppError } from "../../common/errors/AppError.js";
import { IAuthRepository } from "./auth.interface.js";
import { sanitizeUserResponse } from "./auth.response.js";
import { CreateUserType } from "./auth.types.js";

export class AuthService {
  constructor(private authRepo: IAuthRepository) {}

  async registerUser(data: { email: string; password: string }) {
    const { email, password } = data;
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

    return sanitizeUserResponse(createdUser);
  }
}
