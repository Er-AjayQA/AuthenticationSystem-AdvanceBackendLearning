import { Permission, Role, User } from "@prisma/client";
import {
  AllRolesType,
  GetAllPermissionsType,
  GetPermissionDetailType,
  GetRoleWithUsersType,
  GetUsersByPermissionType,
  RoleByIdType,
  UpdateRoleInputType,
} from "./admin.types.js";

export interface IAdminRepository {
  findAllUsers(): Promise<User[]>;
  findAllRoles(): Promise<AllRolesType | null>;
  findRoleByRoleId(roleId: string): Promise<RoleByIdType | null>;
  findAllRolesByIds(roleIds: string[]): Promise<Role[] | null>;
  findAllUsersByRoleId(roleId: string): Promise<GetRoleWithUsersType>;
  findAllPermissions(): Promise<GetAllPermissionsType[]>;
  findPermissionById(
    permissionId: string,
  ): Promise<GetPermissionDetailType | null>;
  findAllUsersByPermissionId(
    permissionId: string,
  ): Promise<GetUsersByPermissionType | null>;

  createRoleWithPermissions(name: string, permissions: string[]): Promise<Role>;

  updateRoleWithPermissions(
    roleId: string,
    data: UpdateRoleInputType,
  ): Promise<Role>;

  deleteRoleById(role: RoleByIdType): Promise<void>;

  assignRolesToUser(userId: string, roleIds: string[]): Promise<boolean>;

  removeUserRole(userId: string, roleId: string): Promise<boolean>;
}
