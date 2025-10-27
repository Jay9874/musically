import { FileMeta } from './interfaces.song';

export interface SingerOption {
  id: string;
  name: string;
}

export interface SongUploadBody {
  albumData: {
    id: string | null;
    name: string;
    description: string;
  };
  songData: {
    title: string;
    singers: SingerOption[];
    newSingers: string[];
  };
  meta: {
    songMeta: FileMeta;
    songThumbnailMeta: FileMeta;
    albumThumbnailMeta: FileMeta | null;
  };
}
