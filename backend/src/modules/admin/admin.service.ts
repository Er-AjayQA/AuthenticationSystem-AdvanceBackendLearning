import { IMUTABLE_ROLES } from "../../common/constants/system-roles.js";
import { AppError } from "../../common/errors/AppError.js";
import { IAuthRepository } from "../auth/auth.interface.js";
import { toRoleResponseDTO } from "./admin.dto.js";
import { IAdminRepository } from "./admin.interface.js";
import { sanitizeUserListResponse } from "./admin.response.js";
import {
  AssignRolesBodyDTO,
  CreateRoleInputDTO,
  UpdateRoleInputDTO,
} from "./admin.schema.js";

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

  async deleteRole(roleId: string) {
    const role = await this.adminRepo.findRoleByRoleId(roleId);

    if (!role) {
      throw new AppError("Role not found", 404);
    }

    if (IMUTABLE_ROLES.includes(role.name as any)) {
      throw new AppError("System roles can't be deleted", 400);
    }

    try {
      await this.adminRepo.deleteRoleById(roleId);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "ROLE_NOT_FOUND") {
          throw new AppError("Role not found", 404);
        }

        if (error.message === "ASSIGNED_TO_USERS") {
          throw new AppError(
            "Can't delete the role as it is already assigned to users",
            400,
          );
        }
      }

      throw error;
    }
  }

  async assignRolesToUser(userId: string, data: AssignRolesBodyDTO) {
    const allRoles = await this.adminRepo.findAllRolesByIds(data.roleIds);

    if (!allRoles) {
      throw new AppError("Roles not found", 404);
    }

    const immutableRoles = allRoles.filter((role) =>
      IMUTABLE_ROLES.includes(role.name as any),
    );

    if (immutableRoles.length > 0) {
      throw new AppError("System roles can't be assigned to anyone", 400);
    }

    await this.adminRepo.assignRolesToUser(userId, data.roleIds);
  }

  async removeUserRole(userId: string, roleId: string) {
    const user = this.authRepo.findUserById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const existingRole = await this.adminRepo.findRoleByRoleId(roleId);

    if (!existingRole) {
      throw new AppError("Role not found", 404);
    }

    const data = await this.adminRepo.removeUserRole(userId, roleId);
    return data;
  }

  async findAllUsersByRole(roleId: string) {
    const role = await this.adminRepo.findAllUsersByRoleId(roleId);

    if (!role) {
      throw new AppError("Role not found", 404);
    }

    const users = role.userRoles.map((userRole) => ({
      id: userRole.user.id,
      email: userRole.user.email,
    }));

    const formattedData = {
      id: role.id,
      name: role.name,
      users,
    };

    return formattedData;
  }

  async userPermissionsByUserId(userId: string) {
    const data = await this.adminRepo.findPermissionsByUserId(userId);

    if (!data) {
      throw new AppError("No permissions found", 404);
    }

    const formattedData = data.userRoles.flatMap((userRole) => {
      return userRole.role.rolePermissions.map(
        (rolePermission) => rolePermission.permission.name,
      );
    });

    // Fetch unique if any duplicate values
    const uniquePermissions = [...new Set(formattedData)];

    return uniquePermissions;
  }
}
