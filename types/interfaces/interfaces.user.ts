export interface User {
  email: string;
  password: string;
}

export interface DbUser {
  id: number;
  email: string;
  password: string;
  verified_email: boolean;
}
