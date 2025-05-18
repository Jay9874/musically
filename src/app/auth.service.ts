import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {}

  submitLoginForm(email: string, password: string) {
    return `Got your input: ${email}, ${password}`;
  }

  submitRegistrationForm(email: string, password: string) {
    return `Got your request: ${email}, ${password}`;
  }
}
