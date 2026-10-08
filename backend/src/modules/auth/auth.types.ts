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
