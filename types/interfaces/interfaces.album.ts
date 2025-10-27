import { FileBuffer } from './interfaces.common';
import { SingerOption } from './interfaces.console';
import { FileMeta } from './interfaces.song';

export interface SongInAlbum {
  id: string;
  meta: FileMeta;
  thumbnail: { type: string; data: Uint8Array };
  thumbnailUrl: string;
}

export interface DBAlbum {
  id: string;
  name: string;
  description: string;
  meta: FileMeta;
  thumbnail: FileBuffer;
  thumbnailUrl: string;
  songs?: SongInAlbum[];
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

export interface DBSong {
  meta: FileMeta;
  id: string;
  songid: string;
  name: string;
  thumbnail: FileBuffer;
  thumbnailUrl: string;
  song_title: string;
  singer_name: string;
}

export interface LoadedAlbum {
  album: DBAlbum;
  songs: DBSong[];
}
