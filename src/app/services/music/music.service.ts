import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

import { generateFile } from '../../../../utils/FileHandler';
import {
  DBAlbum,
  DBSong,
  LoadedAlbum,
} from '../../../../types/interfaces/interfaces.album';
import {
  AlbumResponse,
  Player,
  SongResponse,
} from '../../../../types/interfaces/interfaces.player';

@Injectable({
  providedIn: 'root',
})
export class MusicService {
  private readonly apiBase = 'api/music';
  private http = inject(HttpClient);
  player = signal<Player | null>(null);
  source = signal<AudioBufferSourceNode | null>(null);
  queue = signal<DBSong[]>([]);
  songBuffer = signal<AudioBuffer | null>(null);
  context = signal<AudioContext | null>(null);
  musicPlaying = signal(false);
  volume = computed(() => {
    const audioCtx = this.context();
    if (audioCtx) {
      return new GainNode(audioCtx);
    } else return null;
  });

  ngOnInit(): void {}

  playPause(): void {
    const audioCtx = this.context();
    const player = this.player();
    const song = this.source();
    console.log('song is: ', song);
    // check if context is in suspended state (autoplay policy)
    if (!audioCtx) {
      return;
    }
    if (song && !this.musicPlaying()) {
      song.start(0);
      this.source.set(song);
      this.musicPlaying.set(true);
    } else {
      this.musicPlaying.set(false);
      if (song) {
        song.stop(0);
        this.source.set(song);
      }
    }
  }

  // Get album name to show in title
  getAlbumDetails(albumid: string): Observable<DBAlbum> {
    return this.http
      .get<AlbumResponse>(`${this.apiBase}/album/${albumid}`)
      .pipe(
        map((res) => {
          return res.albums[0];
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
          const { song, meta, thumbnail, title } = res.song;
          const uint8 = new Uint8Array(song.data);
          const audioContext = new AudioContext();

          audioContext
            .decodeAudioData(uint8.buffer as ArrayBuffer)
            .then((decodedData) => {
              this.songBuffer.set(decodedData)
              const source = audioContext.createBufferSource();
              source.buffer = decodedData;
              source.connect(audioContext.destination);
              this.source.set(source);
            })
            .catch((err) => {
              console.log('Could not decode audio from buffer: ', err);
            });
          this.context.set(audioContext);
          const newPlayer: Player = {
            singers: [],
            title: title,
            song: generateFile(song.data, meta.songMeta.type),
            thumbnail: generateFile(thumbnail.data, meta.thumbnailMeta.type),
            isPaused: true,
          };
          this.player.set(newPlayer);
          return newPlayer;
        }),
        catchError((err) => {
          return throwError(() => err);
        })
      );
  }

  // Get all the albums.
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
}
