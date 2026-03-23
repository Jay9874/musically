import { DBAlbum } from './interfaces.album';
import { FileMeta } from './interfaces.song';

export interface AlbumResponse {
  albums: DBAlbum[];
}

export interface LoadedSong {
  thumbnail: { type: string; data: Uint8Array };
  song: { type: string; data: Uint8Array };
  id: string;
  title: string;
  meta: {
    songMeta: FileMeta;
    thumbnailMeta: FileMeta;
  };
  singers: string[];
}

export interface SongResponse {
  song: LoadedSong;
}

export interface Player {
  title: string;
  song: string;
  thumbnail: string;
  singers: string[];
  isPaused: boolean;
}

export interface PlayerEffects {
  volume: number;
  panner: number;
  context: AudioContextOptions;
}

export type PlayerStatus = 'play' | 'pause';
