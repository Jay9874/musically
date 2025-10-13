import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Album } from '../../../../types/interfaces/interfaces.song';

import { LoadedAlbum } from '../../../../types/interfaces/interfaces.album';
interface AlbumResponse {
  albums: Album[];
}

interface LoadAlbumResponse {
  albums: LoadedAlbum[];
}

interface Player {
  title: string;
  song: string;
  thumbnail: string;
}

@Injectable({
  providedIn: 'root',
})
export class MusicService {
  private readonly apiBase = 'api/music';

  // Signals
  allAlbums = signal<Album[]>([]);

  player = signal<Player | null>(null);
  queue = signal<string[]>([]);

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

  loadAlbum(albumId: string): Observable<LoadedAlbum> {
    return this.http
      .get<LoadAlbumResponse>(`${this.apiBase}/load/album/${albumId}`)
      .pipe(
        map((res) => {
          console.log('loaded album: ', res);
          const album: LoadedAlbum = res.albums[0];

          this.player.set({
            title: album.name,
            song: this.generateFile(
              album.songs[0].thumbnail.data,
              album.songs[0].meta.songMeta.type
            ),
            thumbnail: this.generateFile(
              album.songs[0].thumbnail.data,
              album.songs[0].meta.thumbnailMeta.type
            ),
          });
          return res.albums[0];
        }),
        catchError((err) => {
          return throwError(() => err);
        })
      );
  }

  generateFile(data: Uint8Array, mimetype: string): string {
    let blob = new Blob([new Uint8Array(data).buffer], { type: mimetype });
    const url: string = URL.createObjectURL(blob);
    return url;
  }
}
