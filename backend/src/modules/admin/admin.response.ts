import { User } from "@prisma/client";

export const sanitizeUserListResponse = (users: User[]) => {
  return users.map((user: User) => ({
    id: user.id,
    email: user.email,
    isEmailVerified: user.isEmailVerified,
    provider: user.provider,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));
};
