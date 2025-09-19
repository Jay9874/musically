export interface User {
  email: string;
  password: string;
}

type Roles = 'Admin' | 'Creator' | 'Normal';

export interface DbUser {
  id: number;
  email: string;
  password: string;
  verified_email: boolean;
  roles: Roles[];
}
