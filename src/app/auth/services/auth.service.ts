import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { toLoadingStateStream } from '../../loading-state-stream';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ToastService } from '../../toast/services/toast.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  url = 'http://localhost:4200/api/auth';

  constructor(private http: HttpClient) {}

  submitLoginForm(email: string, password: string): Observable<any> {
    console.log('email: ', email);
    console.log('password: ', password);
    return this.http.post<any>(`${this.url}/login`, { email, password }).pipe(
      map((res) => {
        return res;
      }),
      catchError((err) => {
        return throwError(() => new Error(err));
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
          catchError((err: HttpErrorResponse) => {
            return throwError(() => err);
          })
        )
    );
  }
}
