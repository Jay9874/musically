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

export interface Album {
  id: string;
  name: string;
  userId: string;
}

export interface SelectedAlbum {
  existingAlbum: string;
  newAlbum: string;
}

export interface Meta {
  title: string;
  songMeta: FileMeta;
  thumbnailMeta: FileMeta;
  album?: SelectedAlbum;
}

export interface LoadedAlbum {
  albumid: string;
  id: string;
  meta: { title: string; songMeta: FileMeta; thumbnailMeta: FileMeta };
  name: string;
  song: { type: string; data: Uint8Array };
  thumbnail: { type: string; data: Uint8Array };
  title: string;
  uploaded_at: string;
  uploaded_by: string;
  userid: string;
}
