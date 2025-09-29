import { effect, inject, Injectable, OnInit, signal } from '@angular/core';
import { ToastService } from '../../toast/services/toast.service';

@Injectable({
  providedIn: 'root',
})
export class LoaderService implements OnInit {
  toast: ToastService = inject(ToastService);
  isLoading = signal(false);

  constructor() {}

  ngOnInit(): void {
    console.log('loading: ', this.isLoading());
  }
}
