import { FileMeta } from './interfaces.song';

export interface LoadedAlbum {
  id: string;
  name: string;
  songs: SongInAlbum[];
}

export interface SongInAlbum {
  id: string;
  meta: {
    title: string;
    songMeta: FileMeta;
    thumbnailMeta: FileMeta;
  };
  thumbnail: { type: string; data: Uint8Array };
}

export interface UploadingAlbum{
  name: string,
  description: string,
  
}
