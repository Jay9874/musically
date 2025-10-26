import { SingerOption } from './interfaces.console';
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

export interface UploadingAlbum {
  id: string | null;
  name: string;
  description: string;
  song: BinaryFile | null;
  songThumbnail: BinaryFile | null;
  albumThumbnail: BinaryFile | null;
  singers: SingerOption[];
  newSinger: string[];
  title: string;
}

export interface BinaryFile {
  meta: FileMeta;
  blob: Blob;
}
