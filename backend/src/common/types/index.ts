export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

export type JWTPayload = {
  sub: string;
  sessionId: string;
};
