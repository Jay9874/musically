export interface Session {
  sessionId: string;
  user: SessionUser;
}

export interface SessionUser {
  email: string;
  userId: number;
}
