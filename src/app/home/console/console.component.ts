import {
  Component,
  effect,
  inject,
  model,
  OnInit,
  signal,
} from '@angular/core';
import { SessionUser } from '../../../../types/interfaces/interfaces.session';
import { ToastService } from '../../toast/services/toast.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ConsoleService } from './console.service';
import { lastValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { LoaderService } from '../../services/loader/loader.service';
import { FileMeta, Song } from '../../../../types/interfaces/interfaces.song';

type Tab = 'console' | 'users';

export interface UsersResponse {
  users: SessionUser[];
}

export interface updatedRoles {
  roles: string[];
}

export interface Roles {
  value: string;
  label: string;
}

@Component({
  selector: 'app-console',
  imports: [FormsModule],
  templateUrl: './console.component.html',
  styleUrl: './console.component.css',
})
export class ConsoleComponent implements OnInit {
  readonly availableRoles: Roles[] = [
    { value: 'admin', label: 'Admin' },
    { value: 'normal', label: 'Normal' },
  ];

  // Services
  toast: ToastService = inject(ToastService);
  consoleService: ConsoleService = inject(ConsoleService);
  loader: LoaderService = inject(LoaderService);

  // Signals
  activeTab = model<Tab>('console');
  songUrl = signal<string | null>(null);
  thumbnailUrl = signal<string | null>(null);

  song = model<Song>({
    title: '',
    thumbnail: null,
    song: null,
    songMeta: null,
    thumbnailMeta: null,
  });

  constructor() {
    effect(() => {
      const song: Song = this.song();
      this.loadUrl();
    });
  }

  ngOnInit(): void {
    this.getUsers();
  }

  // Cancel thumbnail upload
  cancelThumbnail(): void {
    this.song.update((prev) => ({
      ...prev,
      thumbnail: null,
      thumbnailMeta: null,
    }));
    this.thumbnailUrl.set(null);
  }

  async onFileChange(event: Event): Promise<void> {
    const { name, files } = event.target as HTMLInputElement;

    // Check if the files is there
    if (files && files.length > 0) {
      const file: File | null = files.item(0);
      if (file) {
        console.log('file name is: ', file.name);
        let blob: Blob = new Blob();
        try {
          const arrayBuffer = await file.arrayBuffer();
          blob = new Blob([arrayBuffer], { type: file.type });
        } catch (error) {
          console.error('Error reading file:', error);
        }
        let meta: FileMeta = {
          name: file.name,
          type: blob.type,
          size: blob.size,
        };
        if (name === 'song') {
          this.song.update((prev) => ({
            ...prev,
            song: blob,
            songMeta: meta,
          }));
        } else if (name === 'thumbnail') {
          this.song.update((prev) => ({
            ...prev,
            thumbnail: blob,
            thumbnailMeta: meta,
          }));
        }
      }
    }
  }

  loadUrl(): void {
    if (this.song().song) {
      const url: string = URL.createObjectURL(this.song().song!);
      this.songUrl.set(url);
    }
    if (this.song().thumbnail) {
      const url: string = URL.createObjectURL(this.song().thumbnail!);
      this.thumbnailUrl.set(url);
    }
  }

  async uploadSong(): Promise<void> {
    try {
      if (!this.song().song || !this.song().thumbnail) {
        this.toast.info('Please upload correct audio and thumbnail.');
        return;
      }
      const token$ = this.consoleService.uploadSong(this.song());
      const res = await lastValueFrom(token$);
      this.toast.success('Uploaded the song successfully.');
    } catch (err) {
      console.log('err occurred while uploading a song: ', err);
      const { error } = err as HttpErrorResponse;
      console.log('err:', error);
      this.toast.error(error.message);
    }
  }

  onTabChange(tab: Tab) {
    this.activeTab.set(tab);
  }

  async getUsers(): Promise<void> {
    try {
      const token$ = this.consoleService.getAllUsers();
      const res = await lastValueFrom(token$);
    } catch (err) {
      console.log('Err at getting all users: ', err);
      const { error } = err as HttpErrorResponse;
      console.log('err:', error);
      this.toast.error(error.message);
    }
  }

  async onUpdate(userId: string): Promise<void> {
    try {
      const user: SessionUser | undefined = this.consoleService
        .allUsers()
        .find((user) => user.userId === userId);
      if (!user) {
        this.toast.warning('Could not find the user in list.');
        return;
      }
      const token$ = this.consoleService.updateUser(userId, user.roles);
      const res = await lastValueFrom(token$);
    } catch (err) {
      console.log('Err at updating error: ', err);
      const { error } = err as HttpErrorResponse;
      console.log('err:', error);
      this.toast.error(error.message);
    }
  }
}
