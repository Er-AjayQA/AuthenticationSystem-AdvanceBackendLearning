import { Role, User } from "@prisma/client";
import {
  AllRolesType,
  RoleByIdType,
  updateRoleInputType,
} from "./admin.types.js";

export interface IAdminRepository {
  findAllUsers(): Promise<User[]>;
  findAllRoles(): Promise<AllRolesType | null>;
  findRoleByRoleId(roleId: string): Promise<RoleByIdType | null>;
  findAllRolesByIds(roleIds: string[]): Promise<Role[] | null>;

  createRoleWithPermissions(name: string, permissions: string[]): Promise<Role>;

  updateRoleWithPermissions(
    roleId: string,
    data: updateRoleInputType,
  ): Promise<Role>;

  deleteRoleById(roleId: string): Promise<void>;

  assignRolesToUser(userId: string, roleIds: string[]): Promise<boolean>;
}
