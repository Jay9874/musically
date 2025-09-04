import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toLoadingStateStream } from '../../loading-state-stream';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly apiBaseUrl = 'http://localhost:4200/api/auth';
  loading = signal(true);

  constructor(private http: HttpClient) {}

  submitLoginForm(email: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiBaseUrl}/login`, { email, password })
      .pipe(
        map((res) => {
          return res;
        }),
        catchError((err) => {
          return throwError(() => err);
        })
      );
  }

  submitRegistrationForm(email: string, password: string): Observable<any> {
    // return toLoadingStateStream(
    return this.http
      .post<any>(`${this.apiBaseUrl}/register`, {
        email,
        password,
      })
      .pipe(
        map((res) => res),
        catchError((err) => {
          return throwError(() => err);
        })
      );
    // );
  }
}
