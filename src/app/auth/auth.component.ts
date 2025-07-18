import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ToastService } from '../toast/services/toast.service';

@Component({
  selector: 'app-auth',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export class AuthComponent {
  // services
  toast: ToastService = inject(ToastService);
  constructor() {}

  // To show and hide toast
  showToast = (): void => {
    this.toast.add('This is a toast message.');
  };

  // To remove toast
  removeToast = (id: string): void => {
    this.toast.remove(id);
  };
}
