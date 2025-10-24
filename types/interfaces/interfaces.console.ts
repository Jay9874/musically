import { FileMeta } from './interfaces.song';

export interface SongUploadBody {
  albumData: {
    id: string | null;
    name: string;
    description: string;
  };
  songData: {
    title: string;
    singers: string[];
  };
  meta: {
    songMeta: FileMeta;
    songThumbnailMeta: FileMeta;
    albumThumbnailMeta: FileMeta;
  };
}
