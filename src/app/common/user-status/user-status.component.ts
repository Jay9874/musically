import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../toast/services/toast.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-user-status',
  imports: [RouterLink],
  templateUrl: './user-status.component.html',
  styleUrl: './user-status.component.css',
})
export class UserStatusComponent {
  authService: AuthService = inject(AuthService);
  toast: ToastService = inject(ToastService);

  isMenuVisible = signal(false);

  onAvatarClick(): void {
    this.isMenuVisible.set(!this.isMenuVisible());
  }

  async onLogout(): Promise<void> {
    this.authService.loading.set(true);
    this.authService.user.set(null);
    this.authService.logout().subscribe({
      next: (res) => {
        console.log('res: ', res);
        this.toast.success('Successfully logged out.', 2000);
        this.authService.loading.set(false);
      },
      error: (err) => {
        const { error }: { error: HttpErrorResponse } =
          err as HttpErrorResponse;
        this.toast.error(error.message);
      },
      complete: () => {
        this.isMenuVisible.set(false);
        this.authService.loading.set(false);
      },
    });
  }
}
