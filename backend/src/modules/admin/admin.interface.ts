import { User } from "@prisma/client";
import { AllRolesType, RoleByIdType } from "./admin.types.js";

export interface IAdminRepository {
  findAllUsers(): Promise<User[]>;
  findAllRoles(): Promise<AllRolesType | null>;
  findRoleByRoleId(roleId: string): Promise<RoleByIdType | null>;
}
