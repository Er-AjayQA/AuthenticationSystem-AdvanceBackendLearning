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

export type userType = {
  userId: string;
  sessionId: string;
};

export type finUserById = {
  id: string;
  email: string;
  createdAt: Date;
};
