export type SignupRequest = {
  email: string;
  password: string;
  confirmPassword: string;
};
export type SignupResponse = {
  sessionToken: string;
};

export type VerifyEmailRequest = {
  email: string;
  token: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  sessionToken: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  email: string;
  token: string;
  password: string;
  confirmPassword: string;
};

// Database record types (server-side)
export type UserRecord = {
  email: string;
  type: 'USER';
  passwordHash: string;
  createdAt: string;
  emailVerified: boolean;
  emailVerifiedToken: string | null;
  resetPasswordToken: string | null;
};

export type SafeUserRecord = Omit<
  UserRecord,
  'passwordHash' | 'emailVerifiedToken' | 'resetPasswordToken'
>;

export type SessionRecord = {
  email: string;
  type: string; // Stored as 'SESSION#${token}'
  createdAt: string;
  timeToLive: number;
};

export type AuthRecord = UserRecord | SessionRecord;

// Client-facing types (without sensitive data)
export type User = {
  email: string;
  createdAt: string;
  emailVerified: boolean;
};

export type Session = {
  email: string;
  type: string;
  createdAt: string;
};

export type SessionInfoResponse = {
  user: User | null;
  session: Session | null;
};
