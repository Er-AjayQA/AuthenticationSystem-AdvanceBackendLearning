export type CreateUserType = {
  email: string;
  passwordHash: string;
};

export type createSessionType = {
  userId: string;
  refreshTokenHash: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
};
