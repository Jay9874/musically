import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toLoadingStateStream } from '../../loading-state-stream';
import { catchError, lastValueFrom, map, Observable, throwError } from 'rxjs';
import { SessionUser } from '../../../../types/interfaces/interfaces.session';
import { Roles } from '../../../../types/interfaces/interfaces.user';

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

  submitRegistrationForm(
    email: string,
    password: string,
    username: string
  ): Observable<any> {
    // return toLoadingStateStream(
    return this.http
      .post<any>(`${this.apiBaseUrl}/register`, {
        email,
        password,
        username,
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
          this.user.set(res.user);
          return res.user;
        }),
        catchError((err) => {
          console.log('err at check session: ', err);
          return throwError(() => err);
        })
      );
  };

  hasSession(): Observable<SessionUser> {
    return this.http.get<AuthResponse>(`${this.apiBaseUrl}/check-session`).pipe(
      map((res) => {
        console.log('res: ', res);
        this.user.set(res.user);
        return res.user;
      }),
      catchError((err) => {
        console.log('err at has session: ', err);
        return throwError(() => err);
      })
    );
  }

  logout(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiBaseUrl}/logout`).pipe(
      map((res) => {
        console.log('the res is: ', res);
        return true;
      }),
      catchError((err) => {
        console.log('err while logging out: ', err);
        return throwError(() => err);
      })
    );
  }

  checkAvailability(username: string): Observable<boolean> {
    return this.http
      .get<boolean>(`${this.apiBaseUrl}/username?username=${username}`)
      .pipe(
        map((res) => {
          console.log('res is: ', res);
          return true;
        }),
        catchError((err) => {
          return throwError(() => err);
        })
      );
  }

  changePassword(
    password: string,
    email: string,
    token: string
  ): Observable<boolean> {
    return this.http
      .post<AuthResponse>(`${this.apiBaseUrl}/change-password`, {
        password,
        email,
        token,
      })
      .pipe(
        map((res) => {
          console.log('the res: ', res);
          this.user.set(res.user);
          return true;
        }),
        catchError((err) => {
          return throwError(() => err);
        })
      );
  }

  changeUsername(newUsername: string): Observable<SessionUser> {
    return this.http
      .put<AuthResponse>(`${this.apiBaseUrl}/username`, {
        newUsername,
      })
      .pipe(
        map((res) => {
          this.user.set(res.user);
          return res.user;
        }),
        catchError((err) => {
          return throwError(() => err);
        })
      );
  }
}
