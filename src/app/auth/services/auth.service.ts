import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toLoadingStateStream } from '../../loading-state-stream';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  url = 'http://localhost:4200/api';

  constructor(private http: HttpClient) {}

  async submitLoginForm(email: string, password: string): Promise<object> {
    const data = await fetch(`${this.url}?id=hello`);
    const res = await data.json();
    return res;
  }

  // submitRegistrationForm(email: string, password: string) {
  //   this.http
  //     .post('http://localhost:4200/api/auth/register', { email, password })
  //     .subscribe({
  //       next: (res) => console.log('Success', res),
  //       error: (err) => console.error('Error', err),
  //     });
  // }

  submitRegistrationForm(email: string, password: string) {
    return toLoadingStateStream(
      this.http.post('https://api.mywebsite.com/data', {
        email,
        password,
      })
    );
  }
}
