import { Component, inject, model, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MusicService } from '../../services/music/music.service';
import { Album } from '../../../../types/interfaces/interfaces.song';
import { of, switchMap } from 'rxjs';

@Component({
  selector: 'app-album',
  imports: [],
  templateUrl: './album.component.html',
  styleUrl: './album.component.css',
})
export class AlbumComponent implements OnInit {
  // Services
  musicService: MusicService = inject(MusicService);

  albumid!: string | null;
  heroes = [];
  album = signal<Album | null>(null);
  albumThumbnailUrl = model<string | null>(null);

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
          console.log('res: ', res);
          this.album.set(res);
        },
        error: (err) => {
          console.log('err at details: ', err);
        },
      });
  }
}
