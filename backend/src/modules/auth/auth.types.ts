import { AuthProvider, Prisma } from "@prisma/client";

export type CreateUserType = {
  email: string;
  passwordHash: string | null;
  provider: AuthProvider;
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

export type LinkAuthAccountType = {
  userId: string;
  providerAccountId: string;
  provider: AuthProvider;
};

export type GetAuthAccountType = Prisma.AuthAccountGetPayload<{
  include: {
    user: true;
  };
}>;
