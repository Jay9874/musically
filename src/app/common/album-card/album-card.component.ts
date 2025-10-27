import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DBAlbum } from '../../../../types/interfaces/interfaces.album';

@Component({
  selector: 'app-album-card',
  imports: [RouterLink],
  templateUrl: './album-card.component.html',
  styleUrl: './album-card.component.css',
})
export class AlbumCardComponent {
  @Input({ required: true }) album!: DBAlbum;

  constructor() {}
}
