import { Component, inject } from '@angular/core';
import { MusicService } from '../../services/music/music.service';

@Component({
  selector: 'app-floating-music-player',
  imports: [],
  templateUrl: './floating-music-player.component.html',
  styleUrl: './floating-music-player.component.css',
})
export class FloatingMusicPlayerComponent {
  // Services
  musicService: MusicService = inject(MusicService);
}
