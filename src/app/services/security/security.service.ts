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

  validateVerifyToken(token: string) {
    return toLoadingStateStream(
      this.http.get(`${this.apiBaseUrl}?token=${token}`).pipe(
        map((res) => res),
        catchError((err) => {
          return throwError(() => err);
        })
      )
    );
  }
}
