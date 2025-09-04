import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { toLoadingStateStream } from '../../loading-state-stream';

@Injectable({
  providedIn: 'root',
})
export class SecurityService {
  readonly apiBaseUrl: string = 'api/auth/validate-link';
  constructor(private http: HttpClient) {}

  validateVerifyToken(token: string, email: string): Observable<boolean> {
    return this.http
      .get<boolean>(`${this.apiBaseUrl}?token=${token}&email=${email}`)
      .pipe(
        map((res) => true),
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
}
