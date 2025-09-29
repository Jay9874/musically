export interface Song {
  title: string;
  thumbnail: File | null;
  thumbnailMeta: FileMeta | null;
  song: File | null;
  songMeta: FileMeta | null;
}

export interface FileMeta {
  name: string;
  size: number;
  type: string;
}
