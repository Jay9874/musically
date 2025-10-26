import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { UsersResponse } from '../console.component';
import { catchError, map, Observable, throwError } from 'rxjs';
import { SessionUser } from '../../../../types/interfaces/interfaces.session';
import { Album, Meta } from '../../../../types/interfaces/interfaces.song';
import { AuthService } from '../../auth/services/auth.service';
import { UploadingAlbum } from '../../../../types/interfaces/interfaces.album';
import {
  SingerOption,
  SongUploadBody,
} from '../../../../types/interfaces/interfaces.console';
import { FormsModule } from '@angular/forms';

export interface UploadResponse {
  success: boolean;
}

export interface RelatedResponse {
  albums: Album[];
}

@Injectable({
  providedIn: 'root',
})
export class ConsoleService {
  private readonly baseApi = 'api/admin/console';

  // Services
  authService: AuthService = inject(AuthService);

  // Signals
  allUsers = signal<SessionUser[]>([]);
  albums = signal<Album[]>([]);
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

  getRelatedData(): Observable<Album[]> {
    return this.http.get<RelatedResponse>(`${this.baseApi}/related-data`).pipe(
      map((res) => {
        this.albums.set(res.albums);
        return res.albums;
      }),
      catchError((err) => {
        return throwError(() => err);
      })
    );
  }

  typeToSearch(term: string): Observable<SingerOption[]> {
    return this.http
      .get<{ singers: SingerOption[] }>(`${this.baseApi}/singers?term=${term}`)
      .pipe(
        map((res) => {
          console.log('res: ', res);
          return res.singers;
        }),
        catchError((err) => {
          return throwError(() => err);
        })
      );
  }

  uploadSong(newAlbum: UploadingAlbum): Observable<any> {
    const body: SongUploadBody = {
      albumData: {
        id: newAlbum.id,
        name: newAlbum.name,
        description: newAlbum.description,
      },
      songData: {
        title: newAlbum.title,
        singers: newAlbum.singers,
        newSingers: newAlbum.newSinger,
      },
      meta: {
        songMeta: newAlbum.song!.meta,
        songThumbnailMeta: newAlbum.songThumbnail!.meta,
        albumThumbnailMeta: newAlbum.albumThumbnail!.meta,
      },
    };
    const formData = new FormData();
    formData.append('song', newAlbum.song!.blob);
    formData.append('songThumbnail', newAlbum.songThumbnail!.blob);
    formData.append('albumThumbnail', newAlbum.albumThumbnail!.blob);
    formData.append('body', JSON.stringify(body));
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
