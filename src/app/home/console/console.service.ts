import { HttpClient } from '@angular/common/http';
import { inject, Injectable, OnInit, signal } from '@angular/core';
import { UsersResponse } from './console.component';
import { catchError, finalize, map, Observable, throwError } from 'rxjs';
import { SessionUser } from '../../../../types/interfaces/interfaces.session';
import { LoaderService } from '../../services/loader/loader.service';
import { Song } from '../../../../types/interfaces/interfaces.song';

export interface UploadResponse {
  success: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ConsoleService {
  private readonly baseApi = 'api/admin/console';

  // Signals
  allUsers = signal<SessionUser[]>([]);
  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<UsersResponse> {
    return this.http.get<UsersResponse>(`${this.baseApi}/users`).pipe(
      map((res) => {
        this.allUsers.set(res.users);
        console.log('res: ', res);
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

  uploadSong(song: Song): Observable<any> {

    
    const formData = new FormData();
    formData.append('song', song.song);
    formData.append('thumbnail', song.thumbnail);
    return this.http
      .post<any>(`${this.baseApi}/song/upload`, formData, {
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        map((res) => res),
        catchError((err) => throwError(() => err))
      );
  }
}
