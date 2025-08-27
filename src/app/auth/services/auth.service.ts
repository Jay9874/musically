import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { toLoadingStateStream } from '../../loading-state-stream';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ToastService } from '../../toast/services/toast.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  url = 'http://localhost:4200/api/auth';
  loading = signal(true);

  constructor(private http: HttpClient) {}

  submitLoginForm(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.url}/login`, { email, password }).pipe(
      map((res) => {
        return res;
      }),
      catchError((err) => {
        return throwError(() => err);
      })
    );
  }

  submitRegistrationForm(email: string, password: string) {
    return toLoadingStateStream(
      this.http
        .post('http://localhost:4200/api/auth/register', {
          email,
          password,
        })
        .pipe(
          map((res) => res),
          catchError((err) => {
            return throwError(() => err);
          })
        )
    );
  }
}
