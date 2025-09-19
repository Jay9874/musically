import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toLoadingStateStream } from '../../loading-state-stream';
import { catchError, map, Observable, throwError } from 'rxjs';
import { SessionUser } from '../../../../types/interfaces/interfaces.session';

export interface AuthResponse {
  user: SessionUser;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly apiBaseUrl = 'http://localhost:4200/api/auth';
  loading = signal(false);
  user = signal<SessionUser | null>(null);

  constructor(private http: HttpClient) {}

  submitLoginForm(email: string, password: string): Observable<SessionUser> {
    return this.http
      .post<AuthResponse>(`${this.apiBaseUrl}/login`, { email, password })
      .pipe(
        map((res) => {
          console.log('res: ', res);
          this.user.set(res.user);
          return res.user;
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

  validateSession = (): Observable<SessionUser> => {
    return this.http
      .get<AuthResponse>(`${this.apiBaseUrl}/validate-session`)
      .pipe(
        map((res) => {
          console.log('user: ', res.user);
          this.user.set(res.user);
          return res.user;
        }),
        catchError((err) => {
          console.log('err at check session: ', err);
          return throwError(() => err);
        })
      );
  };
}
