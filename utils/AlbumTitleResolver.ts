// product-title.resolver.ts
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { map, Observable, of } from 'rxjs';
import { MusicService } from '../src/app/services/music/music.service';

@Injectable({ providedIn: 'root' })
export class AlbumNameResolver implements Resolve<string> {
  constructor(private musicService: MusicService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<string> {
    const albumid = route.paramMap.get('album');
    if (albumid) {
      // Fetch product details and construct the title
      return this.musicService
        .getAlbumDetails(albumid)
        .pipe(map((res) => `Musically | ${res.name}`));
    } else return of('Musically | Album');
  }
}
