import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { UsersResponse } from './console.component';
import { catchError, map, Observable, throwError } from 'rxjs';
import { SessionUser } from '../../../../types/interfaces/interfaces.session';

@Injectable({
  providedIn: 'root',
})
export class ConsoleService {
  private readonly baseApi = 'api/console';

  // Signals
  allUsers = signal<SessionUser[]>([]);
  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<UsersResponse> {
    return this.http.get<UsersResponse>(`${this.baseApi}/users`).pipe(
      map((res) => {
        this.allUsers.set(res.users);
        return res;
      }),
      catchError((err) => {
        return throwError(() => err);
      })
    );
  }

  updateUser(userId: string, roles: string[]): Observable<UsersResponse> {
    return this.http
      .put<UsersResponse>(`${this.baseApi}/users`, { userId, roles })
      .pipe(
        map((res) => res),
        catchError((err) => throwError(() => err))
      );
  }
}
