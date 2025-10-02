import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Album } from '../../../../types/interfaces/interfaces.song';
interface AlbumResponse {
  albums: Album[];
}

@Injectable({
  providedIn: 'root',
})
export class MusicService {
  private readonly apiBase = 'api/music';

  // Signals
  allAlbums = signal<Album[]>([]);

  constructor(private http: HttpClient) {}

  getAlbumDetails(albumid: string): Observable<Album> {
    return this.http
      .get<AlbumResponse>(`${this.apiBase}/album/${albumid}`)
      .pipe(
        map((res) => {
          console.log('res: ', res);
          return res.albums[0];
        }),
        catchError((err) => {
          return throwError(() => err);
        })
      );
  }

  getAllAlbums(): Observable<Album[]> {
    return this.http.get<AlbumResponse>(`${this.apiBase}/albums`).pipe(
      map((res) => {
        console.log('all albums: ', res.albums);
        return res.albums;
      }),
      catchError((err) => {
        return throwError(() => err);
      })
    );
  }

  loadAlbum(albumId: string): Observable<any> {
    return this.http.get<any>(`${this.apiBase}/load/album/${albumId}`).pipe(
      map((res) => {
        console.log('loaded album: ', res);
        return res;
      }),
      catchError((err) => {
        return throwError(() => err);
      })
    );
  }
}
