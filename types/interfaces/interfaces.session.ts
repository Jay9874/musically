export interface Session {
  id: string;
  user: SessionUser;
}

type Roles = 'Admin' | 'Creator' | 'Normal';

export interface SessionUser {
  email: string;
  userId: number;
  roles: Roles[];
}
