import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '../../toast/services/toast.service';
import { MusicService } from '../../services/music/music.service';
import { lastValueFrom } from 'rxjs';
import { AlbumCardComponent } from '../../common/album-card/album-card.component';
import { DBAlbum } from '../../../../types/interfaces/interfaces.album';

@Component({
  selector: 'app-music-collections',
  imports: [AlbumCardComponent],
  templateUrl: './music-collections.component.html',
  styleUrl: './music-collections.component.css',
})
export class MusicCollectionsComponent implements OnInit {
  // Services
  toast: ToastService = inject(ToastService);
  musicService: MusicService = inject(MusicService);

  albums = signal<DBAlbum[]>([]);

  constructor() {}

  ngOnInit(): void {
    this.getAllAlbums();
  }

  async getAllAlbums(): Promise<void> {
    try {
      const token$ = this.musicService.getAllAlbums();
      const res = await lastValueFrom(token$);
      // Get make url from thumbnail
      this.albums.set(res);
    } catch (err) {
      console.log('err occurred while getting albums: ', err);
      const { error } = err as HttpErrorResponse;
      this.toast.error(error.message);
    }
  }
}
