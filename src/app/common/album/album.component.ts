import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MusicService } from '../../services/music/music.service';
import { LoadedAlbum } from '../../../../types/interfaces/interfaces.album';
import { lastValueFrom, of, switchMap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '../../toast/services/toast.service';

@Component({
  selector: 'app-album',
  imports: [],
  templateUrl: './album.component.html',
  styleUrl: './album.component.css',
})
export class AlbumComponent implements OnInit {
  // Services
  musicService: MusicService = inject(MusicService);
  toast: ToastService = inject(ToastService);

  albumid!: string | null;
  heroes = [];
  album = signal<LoadedAlbum | null>(null);

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.albumid = params.get('albumid');
          if (this.albumid) {
            return this.musicService.loadAlbum(this.albumid);
          } else {
            return of(null);
          }
        })
      )
      .subscribe({
        next: (res) => {
          console.log('fetched album details: ', res);
          this.album.set(res);
        },
        error: (err) => {
          console.log('err at details: ', err);
        },
      });
  }

  async onSongClick(songId: string): Promise<void> {
    try {
      const token$ = this.musicService.loadSong(songId);
      const res = await lastValueFrom(token$);
    } catch (err) {
      console.log('err while loading song: ', err);
      const { error }: { error: HttpErrorResponse } = err as HttpErrorResponse;
      this.toast.error(error.message);
    }
  }
}
