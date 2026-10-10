import { Role, User } from "@prisma/client";
import {
  AllRolesType,
  GetRoleWithUsersType,
  GetUserWithPermissionType,
  RoleByIdType,
  UpdateRoleInputType,
} from "./admin.types.js";

export interface IAdminRepository {
  findAllUsers(): Promise<User[]>;
  findAllRoles(): Promise<AllRolesType | null>;
  findRoleByRoleId(roleId: string): Promise<RoleByIdType | null>;
  findAllRolesByIds(roleIds: string[]): Promise<Role[] | null>;
  findAllUsersByRoleId(roleId: string): Promise<GetRoleWithUsersType>;
  findPermissionsByUserId(
    userId: string,
  ): Promise<GetUserWithPermissionType | null>;

  createRoleWithPermissions(name: string, permissions: string[]): Promise<Role>;

  updateRoleWithPermissions(
    roleId: string,
    data: UpdateRoleInputType,
  ): Promise<Role>;

  deleteRoleById(roleId: string): Promise<void>;

  assignRolesToUser(userId: string, roleIds: string[]): Promise<boolean>;

  removeUserRole(userId: string, roleId: string): Promise<boolean>;
}
