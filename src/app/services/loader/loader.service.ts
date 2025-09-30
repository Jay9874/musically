import { inject, Injectable, signal } from '@angular/core';
import { ToastService } from '../../toast/services/toast.service';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  toast: ToastService = inject(ToastService);
  isLoading = signal(false);

  constructor() {}

  showLoader(): void {
    this.isLoading.set(true);
    this.toast.loading('Loading...', Infinity);
  }
  hideLoader(): void {
    this.isLoading.set(false);
    this.toast.toasts.set([]);
  }
}
