import { AppError } from "../../common/errors/AppError.js";
import { IAuthRepository } from "../auth/auth.interface.js";
import { IAdminRepository } from "./admin.interface.js";
import { sanitizeUserListResponse } from "./admin.response.js";

export class AdminService {
  constructor(
    private adminRepo: IAdminRepository,
    private authRepo: IAuthRepository,
  ) {}

  async getAllUsers() {
    const allUsers = await this.adminRepo.findAllUsers();
    return sanitizeUserListResponse(allUsers);
  }
}
