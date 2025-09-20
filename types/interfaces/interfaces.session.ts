export interface Session {
  id: string;
  user: SessionUser;
}

type Roles = 'admin' | 'creator' | 'normal';

export interface SessionUser {
  email: string;
  userId: number;
  username: string;
  roles: Roles[];
}
