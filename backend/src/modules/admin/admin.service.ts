import { AppError } from "../../common/errors/AppError.js";
import { IAuthRepository } from "../auth/auth.interface.js";
import { toRoleResponseDTO } from "./admin.dto.js";
import { IAdminRepository } from "./admin.interface.js";
import { sanitizeUserListResponse } from "./admin.response.js";
import { CreateRoleInputDTO, UpdateRoleInputDTO } from "./admin.schema.js";

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

  async createRole(data: CreateRoleInputDTO) {
    try {
      const { name, permissions } = data;
      const role = await this.adminRepo.createRoleWithPermissions(
        name,
        permissions,
      );

      return role;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "ROLE_ALREADY_EXIST") {
          throw new AppError("Role already exist", 409);
        }

        if (error.message === "INVALID_PERMISSIONS") {
          throw new AppError("Invalid Permissions provided", 400);
        }
      }

      throw error;
    }
  }

  async updateRole(roleId: string, data: UpdateRoleInputDTO) {
    try {
      const updatedRole = await this.adminRepo.updateRoleWithPermissions(
        roleId,
        data,
      );

      return updatedRole;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "ROLE_NOT_FOUND") {
          throw new AppError("Role not found", 404);
        }

        if (error.message === "ROLE_ALREADY_EXIST") {
          throw new AppError("Role already exist", 409);
        }

        if (error.message === "INVALID_PERMISSIONS") {
          throw new AppError("Invalid permissions provided", 400);
        }
      }

      throw error;
    }
  }
}
