import { Component, inject, model, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MusicService } from '../../services/music/music.service';
import { LoadedAlbum } from '../../../../types/interfaces/interfaces.album';
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
  album = signal<LoadedAlbum | null>(null);
  thumbnailUrl = model<string | null>(null);
  songUrl = model<string | null>(null);

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
          this.thumbnailUrl.set(
            this.generateFile(
              res?.songs[0].thumbnail.data!,
              res?.songs[0].meta.thumbnailMeta.type!
            )
          );

          this.songUrl.set(
            this.generateFile(
              res?.songs[0].thumbnail.data!,
              res?.songs[0].meta.songMeta.type!
            )
          );
        },
        error: (err) => {
          console.log('err at details: ', err);
        },
      });
  }

  generateFile(data: Uint8Array, mimetype: string): string {
    let blob = new Blob([new Uint8Array(data).buffer], { type: mimetype });
    const url: string = URL.createObjectURL(blob);
    return url;
  }
}
