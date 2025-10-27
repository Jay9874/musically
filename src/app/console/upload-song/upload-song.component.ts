import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, model, signal } from '@angular/core';
import { debounceTime, distinctUntilChanged, lastValueFrom, map } from 'rxjs';
import { SessionUser } from '../../../../types/interfaces/interfaces.session';
import { Role } from '../../../../types/interfaces/interfaces.user';
import { ToastService } from '../../toast/services/toast.service';
import { ConsoleService } from '../service/console.service';
import { AuthService } from '../../auth/services/auth.service';
import { LoaderService } from '../../services/loader/loader.service';
import { Selectable } from '../../../../types/interfaces/interfaces.common';
import { FileMeta } from '../../../../types/interfaces/interfaces.song';
import {
  DBAlbum,
  UploadingAlbum,
} from '../../../../types/interfaces/interfaces.album';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SingerOption } from '../../../../types/interfaces/interfaces.console';

interface ThumbnailUrls {
  songThumbnail: string | null;
  albumThumbnail: string | null;
}

@Component({
  selector: 'app-upload-song',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './upload-song.component.html',
  styleUrl: './upload-song.component.css',
})
export class UploadSongComponent {
  readonly availableRoles: Selectable<Role, string>[] = [
    { value: 'admin', label: 'Admin' },
    { value: 'normal', label: 'Normal' },
  ];

  // Services
  toast: ToastService = inject(ToastService);
  consoleService: ConsoleService = inject(ConsoleService);
  authService: AuthService = inject(AuthService);
  loader: LoaderService = inject(LoaderService);

  // Signals
  urls = signal<ThumbnailUrls>({
    albumThumbnail: null,
    songThumbnail: null,
  });
  albums = model<DBAlbum[]>([]);
  newSingers = model<string[]>([]);
  currentInput = model('');
  foundSingers = signal<SingerOption[]>([]);
  loadingSinger = model(false);
  searchInput = new FormControl('');
  hideSingerResult = model(true);

  newAlbum = model<UploadingAlbum>({
    id: null,
    name: '',
    description: '',
    title: '',
    singers: [],
    newSinger: [],
    song: null,
    songThumbnail: null,
    albumThumbnail: null,
  });

  constructor() {}

  async ngOnInit(): Promise<void> {
    if (this.authService.user()) {
      await this.getUsers();
      await this.getRelatedData();
    }

    // Listen to input with debounce
    this.searchInput.valueChanges
      .pipe(
        map((value) => {
          this.foundSingers.set([]);
          return value;
        }),
        debounceTime(750), // Wait for 400ms after the last keystroke
        distinctUntilChanged() // Only emit if the value is different from the last
      )
      .subscribe(async (value) => {
        // call api is value is not only spaces
        if (value && value.trim() !== '') {
          this.typeToSearch(value);
        }
      });
  }

  getValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  hideResult(): void {
    this.hideSingerResult.set(true);
  }

  // Add singer to existing singer list
  addSinger(singer: SingerOption): void {
    this.newAlbum.update((prev) => ({
      ...prev,
      singers: [...prev.singers, singer],
    }));
  }

  async typeToSearch(term: string): Promise<void> {
    try {
      this.loadingSinger.set(true);
      this.hideSingerResult.set(false);
      this.foundSingers.set([]);
      const token$ = this.consoleService.typeToSearch(term);
      const res = await lastValueFrom(token$);
      this.loadingSinger.set(false);
      this.foundSingers.set(res);
    } catch (err) {
      console.log('err: ', err);
      const { error } = err as HttpErrorResponse;
      this.toast.error(error.message);
    }
  }
  addNewSinger(): void {
    if (this.currentInput() !== '') {
      this.newSingers.update((prev) => [...prev, this.currentInput()]);
    }
    this.currentInput.set('');
  }

  onBackspacePressed(event: Event): void {
    if (this.currentInput() === '') {
      const newSingers = this.newSingers();
      newSingers.pop();
      this.newSingers.set(newSingers);
    }
  }

  removeSinger(singer: SingerOption): void {
    const updatedSingers = this.newAlbum().singers.filter(
      (obj) => obj.id !== singer.id
    );
    this.newAlbum.update((prev) => ({ ...prev, singers: updatedSingers }));
  }

  removeNewSinger(singer: string): void {
    const updatedNewSingers = this.newSingers().filter((obj) => obj !== singer);
    this.newSingers.set(updatedNewSingers);
  }

  albumChange(event: Event): void {
    this.newAlbum.update((prev) => ({ ...prev, name: '' }));
  }

  onNewAlbum(val: string): void {
    this.newAlbum.update((prev) => ({ ...prev, id: null }));
    if (val) {
      this.newAlbum.update((prev) => ({ ...prev, name: val }));
    } else {
      if (this.albums().length > 0) {
        this.newAlbum.update((prev) => ({
          ...prev,
          id: this.albums()[0].id,
        }));
      } else {
        this.newAlbum.update((prev) => ({
          ...prev,
          id: null,
          name: '',
        }));
      }
    }
  }

  // Load users related data such as albums and playlists
  async getRelatedData(): Promise<void> {
    try {
      const token$ = this.consoleService.getRelatedData();
      const albums: DBAlbum[] = await lastValueFrom(token$);
      this.albums.set(albums);
      if (this.albums().length > 0) {
        this.newAlbum.update((prev) => ({ ...prev, id: this.albums()[0].id }));
      }
    } catch (err) {
      console.log('err occurred while finding related data: ', err);
      const { error } = err as HttpErrorResponse;
      this.toast.error(error.message);
    }
  }

  // Cancel thumbnail upload
  cancelThumbnail(buttonName: string): void {
    this.urls.update((prev) => ({
      ...prev,
      [buttonName]: null,
    }));
    this.newAlbum.update((prev) => ({
      ...prev,
      [buttonName]: null,
    }));
  }

  async onFileChange(event: Event): Promise<void> {
    const { name, files } = event.target as HTMLInputElement;
    // Check if the files is there
    if (files && files.length > 0) {
      const file: File | null = files.item(0);
      if (file) {
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
        this.newAlbum.update((prev) => ({
          ...prev,
          [name]: { blob, meta },
        }));
        const url: string = URL.createObjectURL(blob!);
        this.urls.update((prev) => ({
          ...prev,
          [name]: url,
        }));
      }
    }
  }

  async uploadSong(): Promise<void> {
    try {
      if (!this.newAlbum().song || !this.newAlbum().songThumbnail) {
        this.toast.info('Please upload correct audio and thumbnail.');
        return;
      }
      // Add newly added singer to new album
      this.newAlbum.update((prev) => ({
        ...prev,
        newSinger: this.newSingers(),
      }));
      const token$ = this.consoleService.uploadSong(this.newAlbum());
      const res = await lastValueFrom(token$);
      this.toast.success('Uploaded the song successfully.');
    } catch (err) {
      console.log('err occurred while uploading a song: ', err);
      const { error } = err as HttpErrorResponse;
      this.toast.error(error.message);
    }
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
