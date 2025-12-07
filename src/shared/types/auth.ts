export type SignupRequest = {
  email: string;
  password: string;
  confirmPassword: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  sessionToken: string;
};

export type SignupResponse = {
  sessionToken: string;
};

export type User = {
  email: string;
  createdAt: string;
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

// Internal server types (not shared with client)
export type AuthRecord = {
  email: string;
  type: string;
  passwordHash?: string;
  createdAt: string;
};
