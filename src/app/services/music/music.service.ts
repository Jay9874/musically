import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { FileMeta } from '../../../../types/interfaces/interfaces.song';

import { generateFile } from '../../../../utils/FileHandler';
import {
  DBAlbum,
  DBSong,
  LoadedAlbum,
} from '../../../../types/interfaces/interfaces.album';
interface AlbumResponse {
  albums: DBAlbum[];
}

export interface LoadedSong {
  thumbnail: { type: string; data: Uint8Array };
  song: { type: string; data: Uint8Array };
  meta: {
    title: string;
    songMeta: FileMeta;
    thumbnailMeta: FileMeta;
  };
}

interface SongResponse {
  song: LoadedSong;
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

  player = signal<Player | null>(null);
  queue = signal<DBSong[]>([]);

  constructor(private http: HttpClient) {}

  // Get album name to show in title
  getAlbumDetails(albumid: string): Observable<DBAlbum> {
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

  getAllAlbums(): Observable<DBAlbum[]> {
    return this.http.get<AlbumResponse>(`${this.apiBase}/albums`).pipe(
      map((res) => {
        // Loop over albums and create thumbnail url
        const updatedAlbums: DBAlbum[] = res.albums.map((album) => {
          return {
            ...album,
            id: album.id,
            name: album.name,
            thumbnailUrl: generateFile(album.thumbnail.data, album.meta.type),
          };
        });
        return updatedAlbums;
      }),
      catchError((err) => {
        return throwError(() => err);
      })
    );
  }

  loadAlbum(albumId: string): Observable<LoadedAlbum> {
    return this.http
      .get<LoadedAlbum>(`${this.apiBase}/load/album/${albumId}`)
      .pipe(
        map((res) => {
          const { album, songs } = res;
          const updatedAlbum: DBAlbum = {
            ...album,
            thumbnailUrl: generateFile(album.thumbnail.data, album.meta.type),
          };
          const updatedSongs: DBSong[] = songs.map((song) => ({
            ...song,
            thumbnailUrl: generateFile(song.thumbnail.data, song.meta.type),
          }));
          return { album: updatedAlbum, songs: updatedSongs };
        }),
        catchError((err) => {
          return throwError(() => err);
        })
      );
  }

  loadSong(songId: string): Observable<Player> {
    return this.http
      .get<SongResponse>(`${this.apiBase}/song?id=${songId}`)
      .pipe(
        map((res) => {
          console.log('res: ', res);
          const { song, meta, thumbnail } = res.song;
          const newPlayer: Player = {
            title: meta.title,
            song: generateFile(song.data, meta.songMeta.type),
            thumbnail: generateFile(thumbnail.data, meta.thumbnailMeta.type),
          };
          this.player.set(newPlayer);
          return newPlayer;
        }),
        catchError((err) => {
          return throwError(() => err);
        })
      );
  }
}
