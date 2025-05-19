import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  url = 'http://localhost:4000/api';
  constructor() {}

  async submitLoginForm(email: string, password: string): Promise<object> {
    const data = await fetch(`${this.url}?id=hello`);
    const res = await data.json();
    return res;
  }

  submitRegistrationForm(email: string, password: string) {
    return `Got your request: ${email}, ${password}`;
  }
}
