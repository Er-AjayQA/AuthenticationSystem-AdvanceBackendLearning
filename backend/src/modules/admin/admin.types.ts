import { Prisma } from "@prisma/client";

export type AllRolesType = Prisma.RoleGetPayload<{
  select: {
    id: true;
    name: true;
    createdAt: true;

    userRoles: {
      select: {
        userId: true;
      };
    };

    rolePermissions: {
      select: {
        permission: {
          select: {
            id: true;
            name: true;
          };
        };
      };
    };
  };
}>[];

export type RoleByIdType = Prisma.RoleGetPayload<{
  select: {
    id: true;
    name: true;
    isSystem: true;
    createdAt: true;
    isDeleted: false;

    userRoles: {
      select: {
        assignedAt: true;

        user: {
          select: {
            id: true;
            email: true;
            createdAt: true;
          };
        };
      };
    };

    rolePermissions: {
      select: {
        assignedAt: true;

        permission: {
          select: {
            id: true;
            name: true;
          };
        };
      };
    };
  };
}>;

export type UpdateRoleInputType = {
  name?: string;
  permissions?: string[];
};

export type GetRoleWithUsersType = {
  id: string;
  name: string;
  userRoles: {
    user: {
      id: string;
      email: string;
    };
  }[];
} | null;

export type GetAllPermissionsType = Prisma.PermissionGetPayload<{
  select: {
    id: true;
    name: true;
  };
}>;

export type GetPermissionDetailType = Prisma.PermissionGetPayload<{
  select: {
    id: true;
    name: true;

    rolePermissions: {
      select: {
        role: {
          select: {
            id: true;
            name: true;
          };
        };
      };
    };
  };
}>;

export type GetUsersByPermissionType = Prisma.PermissionGetPayload<{
  select: {
    id: true;
    name: true;

    rolePermissions: {
      select: {
        role: {
          select: {
            userRoles: {
              select: {
                user: {
                  select: {
                    id: true;
                    email: true;
                  };
                };
              };
            };
          };
        };
      };
    };
  };
}>;
