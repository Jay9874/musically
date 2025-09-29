export interface Song {
  title: string;
  thumbnail: Blob | null;
  thumbnailMeta: FileMeta | null;
  song: Blob | null;
  songMeta: FileMeta | null;
}

export interface FileMeta {
  name: string;
  size: number;
  type: string;
}
