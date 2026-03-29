import { Component, computed, effect, inject, signal } from '@angular/core';
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
  context = computed(() => this.musicService.context());
  source = signal(this.musicService.source());
  gainNode = signal<GainNode | null>(null);
  volume = signal(1);

  constructor() {
    effect(() => {
      const ctx = this.context();
      if (ctx) {
        const gain = ctx.createGain();
        gain.connect(ctx.destination);
        this.gainNode.set(gain);
      }
    });

    effect(() => {
      this.musicService.source.set(this.source());
    });

    effect(() => {
      const gain = this.gainNode();
      const vol = this.volume();
      const src = this.source();
      const ctx = this.context();

      if (gain && ctx && src) {
        gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.1);
        src.connect(gain);
        this.source.set(src);
        this.gainNode.set(gain);
      }
    });
  }

  setVolume(event: Event) {
    const { value } = event.target as HTMLInputElement;
    this.volume.set(parseFloat(value));
  }
}
