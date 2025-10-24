import { Component, Input, OnInit, signal } from '@angular/core';
import { Album, Song } from '../../../../types/interfaces/interfaces.song';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-album-card',
  imports: [RouterLink],
  templateUrl: './album-card.component.html',
  styleUrl: './album-card.component.css',
})
export class AlbumCardComponent {
  @Input({ required: true }) album!: Album;
  songs = signal<Song[]>([]);

  constructor() {}
}
