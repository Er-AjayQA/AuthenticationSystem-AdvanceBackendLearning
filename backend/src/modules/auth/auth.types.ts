import { Prisma } from "@prisma/client";

export type CreateUserType = {
  email: string;
  passwordHash: string;
};

export type createSessionType = {
  id: string;
  userId: string;
  refreshTokenHash: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
};

export type userType = {
  userId: string;
  sessionId: string;
};

export type finUserById = {
  id: string;
  email: string;
  createdAt: Date;
};

export type updatedSessionType = {
  refreshTokenHash: string;
  expiresAt: Date;
};

export type UserPermissionsType = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    userRoles: {
      select: {
        role: {
          select: {
            id: true;
            name: true;
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
        };
      };
    };
  };
}>;

export type UserWithPermissionType = {
  user: {
    id: string;
    email: string;
  };
  roles: string[];
  permissions: string[];
};
