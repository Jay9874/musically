import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toLoadingStateStream } from '../../loading-state-stream';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ToastService } from '../../toast/services/toast.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  url = 'http://localhost:4200/api/auth';

  // Toast service
  toast: ToastService = inject(ToastService);

  constructor(private http: HttpClient) {}

  submitLoginForm(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.url}/login`, { email, password }).pipe(
      map((res) => {
        console.log('res: ', res);
        this.toast.success('Signed in');
        return res;
      }),
      catchError((err) => {
        console.log('err occurred while signing: ', err);
        this.toast.error('Err occurred while signing.');
        return throwError(() => new Error(err));
      })
    );
  }

  submitRegistrationForm(email: string, password: string) {
    return toLoadingStateStream(
      this.http.post('http://localhost:4200/api/auth/register', {
        email,
        password,
      })
    );
  }
}
