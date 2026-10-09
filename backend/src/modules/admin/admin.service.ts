import { AppError } from "../../common/errors/AppError.js";
import { IAuthRepository } from "../auth/auth.interface.js";
import { toRoleResponseDTO } from "./admin.dto.js";
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

  async getAllRoles() {
    const roles = await this.adminRepo.findAllRoles();

    const data = roles?.map((role) => ({
      id: role.id,
      name: role.name,
      createdAt: role.createdAt,
      userCount: role.userRoles.length,
      permissions: role.rolePermissions.map(
        (rolePermission) => rolePermission.permission.name,
      ),
    }));

    return data;
  }

  async getRoleById(roleId: string) {
    const role = await this.adminRepo.findRoleByRoleId(roleId);

    if (!role) {
      throw new AppError("Role not found", 404);
    }

    return toRoleResponseDTO(role);
  }
}
