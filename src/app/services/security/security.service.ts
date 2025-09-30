import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { toLoadingStateStream } from '../../loading-state-stream';
import { SessionUser } from '../../../../types/interfaces/interfaces.session';
import { AuthService } from '../../auth/services/auth.service';

export interface ValidateResponse {
  user: SessionUser;
}

@Injectable({
  providedIn: 'root',
})
export class SecurityService {
  readonly apiBaseUrl: string = 'api/auth';
  loading = signal(false);

  constructor(private http: HttpClient) {}

  validateVerifyToken(token: string, email: string): Observable<boolean> {
    return this.http
      .get<boolean>(
        `${this.apiBaseUrl}/validate-link?token=${token}&email=${email}`,
        { withCredentials: true }
      )
      .pipe(
        map((res) => {
          console.log('res: ', res);
          return true;
        }),
        catchError((err) => {
          return throwError(() => err);
        })
      );
  }

  resendVerificationLink = (email: string): Observable<any> => {
    return this.http
      .get<any>(`${this.apiBaseUrl}/resend-link?email=${email}`)
      .pipe(
        map((res) => res),
        catchError((err) => {
          return throwError(() => err);
        })
      );
  };

  recover = (email: string): Observable<boolean> => {
    return this.http
      .post<boolean>(`${this.apiBaseUrl}/recovery`, { email })
      .pipe(
        map((res) => true),
        catchError((err) => {
          return throwError(() => err);
        })
      );
  };
}
