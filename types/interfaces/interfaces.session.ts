export interface Session {
  id: string;
  userid: SessionUser;
}

export interface SessionUser {
  email: string;
  userId: number;
}
