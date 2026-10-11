import { IMUTABLE_ROLES } from "../../common/constants/system-roles.js";
import { AppError } from "../../common/errors/AppError.js";
import { IAuthRepository } from "../auth/auth.interface.js";
import { permissionsService } from "../auth/auth.permissions.service.js";
import { toRoleResponseDTO } from "./admin.dto.js";
import {
  ensureRoleIsAssignable,
  ensureRoleIsDeletable,
  ensureRoleIsEditable,
  ensureRoleIsRemovable,
} from "./admin.helper.js";
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
    const existingRole = await this.adminRepo.findRoleByRoleId(roleId);

    if (!existingRole) {
      throw new AppError("Role not found", 404);
    }

    ensureRoleIsEditable(existingRole);

    const updatedRole = await this.adminRepo.updateRoleWithPermissions(
      roleId,
      data,
    );

    await permissionsService.invalidateRoleUsers(roleId);

    return updatedRole;
  }

  async deleteRole(roleId: string) {
    const existingRole = await this.adminRepo.findRoleByRoleId(roleId);

    if (!existingRole) {
      throw new AppError("Role not found", 404);
    }

    ensureRoleIsDeletable(existingRole);

    await this.adminRepo.deleteRoleById(existingRole);
    await permissionsService.invalidateRoleUsers(roleId);
  }

  async assignRolesToUser(userId: string, data: AssignRolesBodyDTO) {
    const allRoles = await this.adminRepo.findAllRolesByIds(data.roleIds);

    if (!allRoles) {
      throw new AppError("Roles not found", 404);
    }

    allRoles.forEach((role) => ensureRoleIsAssignable(role));

    await this.adminRepo.assignRolesToUser(userId, data.roleIds);
    await permissionsService.invalidateUserPermissions(userId);
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

    ensureRoleIsRemovable(existingRole);

    const data = await this.adminRepo.removeUserRole(userId, roleId);
    await permissionsService.invalidateUserPermissions(userId);
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
    const permissions = await permissionsService.getUserPermissions(userId);

    if (!permissions.length) {
      throw new AppError("user don't have any permissions", 404);
    }

    return permissions;
  }

  async getAllPermissions() {
    const permissions = await this.adminRepo.findAllPermissions();
    return permissions;
  }

  async getPermissionDetail(permissionId: string) {
    const permission = await this.adminRepo.findPermissionById(permissionId);

    if (!permission) {
      throw new AppError("Permission not found", 404);
    }

    return permission;
  }

  async getAllUsersByPermissionId(permissionId: string) {
    const permissionExist =
      await this.adminRepo.findPermissionById(permissionId);

    if (!permissionExist) {
      throw new AppError("Permission not found", 404);
    }

    const permission =
      await this.adminRepo.findAllUsersByPermissionId(permissionId);

    const users = permission?.rolePermissions.flatMap((rolePermission) => {
      return rolePermission.role.userRoles.map((userRole) => ({
        id: userRole.user.id,
        email: userRole.user.email,
      }));
    });

    if (!users) {
      throw new AppError("Users not found", 404);
    }

    const uniqueUsers = Array.from(
      new Map(users?.map((user) => [user.id, user])).values(),
    );

    return {
      permission: { id: permission?.id, name: permission?.name },
      users: uniqueUsers,
    };
  }
}
