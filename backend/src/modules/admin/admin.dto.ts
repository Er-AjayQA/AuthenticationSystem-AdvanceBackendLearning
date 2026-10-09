import { AllRolesType, RoleByIdType } from "./admin.types.js";

export const toRoleResponseDTO = (role: RoleByIdType) => {
  return {
    id: role.id,
    name: role.name,
    createdAt: role.createdAt,
    permissions: role.rolePermissions.map((rolePermission) => ({
      id: rolePermission.permission.id,
      name: rolePermission.permission.name,
      assignedAt: rolePermission.assignedAt,
    })),
    users: role.userRoles.map((userRole) => ({
      id: userRole.user.id,
      email: userRole.user.email,
      createdAt: userRole.user.createdAt,
      assignedAt: userRole.assignedAt,
    })),
  };
};
