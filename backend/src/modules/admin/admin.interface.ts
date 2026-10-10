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

  createRoleWithPermissions(name: string, permissions: string[]): Promise<Role>;

  updateRoleWithPermissions(
    roleId: string,
    data: updateRoleInputType,
  ): Promise<Role>;
}
