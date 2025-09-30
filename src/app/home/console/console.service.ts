import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { UsersResponse } from './console.component';
import { catchError, map, Observable, throwError } from 'rxjs';
import { SessionUser } from '../../../../types/interfaces/interfaces.session';
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
    const meta = {
      title: song.title,
      songMeta: song.songMeta,
      thumbnailMeta: song.thumbnailMeta,
    };
    const formData = new FormData();
    formData.append('song', song.song!, song.songMeta?.name);
    formData.append('thumbnail', song.thumbnail!, song.thumbnailMeta?.name);
    formData.append('meta', JSON.stringify(meta));
    return this.http
      .post<any>(`${this.baseApi}/song/upload`, formData, {
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        map((res) => {
          console.log('res: ', res);
          return res;
        }),
        catchError((err) => throwError(() => err))
      );
  }
}
