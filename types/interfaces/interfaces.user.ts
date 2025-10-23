export interface User {
  email: string;
  password: string;
}

export interface NewUser {
  email: string;
  password: string;
  username: string;
}

export type Role = 'admin' | 'creator' | 'normal';

export interface DbUser {
  id: number;
  email: string;
  password: string;
  username: string;
  verified_email: boolean;
  roles: Role[];
}
