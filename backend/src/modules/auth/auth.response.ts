import { User } from "@prisma/client";

export const sanitizeUserResponse = (user: User) => {
  return {
    id: user.id,
    email: user.email,
    isEmailVerified: user.isEmailVerified,
    provider: user.provider,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
