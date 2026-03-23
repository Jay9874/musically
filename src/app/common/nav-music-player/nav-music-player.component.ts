import { Component, computed, inject } from '@angular/core';
import { UserStatusComponent } from '../user-status/user-status.component';
import { MusicService } from '../../services/music/music.service';

@Component({
  selector: 'app-nav-music-player',
  imports: [UserStatusComponent],
  templateUrl: './nav-music-player.component.html',
  styleUrl: './nav-music-player.component.css',
})
export class NavMusicPlayerComponent {
  // Services
  musicService: MusicService = inject(MusicService);

  musicPlaying = computed(() => this.musicService.musicPlaying());
}
