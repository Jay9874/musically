import { Component, inject, model, signal } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../toast/services/toast.service';
import { Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { SessionUser } from '../../../../types/interfaces/interfaces.session';

@Component({
  selector: 'app-profile',
  imports: [FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  // Services
  authService: AuthService = inject(AuthService);
  toast: ToastService = inject(ToastService);

  // Form model
  username = model('');
  usernameAvailable = signal(false);

  data$!: Observable<SessionUser>;
  constructor(private router: Router) {}

  onUsernameChange(val: string): void {
    this.usernameAvailable.set(false);
    if (val) this.username.set(val);
    else this.username.set('');
  }

  checkAvailability(): void {
    const usernamePattern = /^[a-zA-Z0-9_-]+$/;
    const validUsername = usernamePattern.test(this.username());
    if (!validUsername) {
      this.toast.warning(
        "Username should be alphanumeric. Allowed special characters are '-' and '_'"
      );
      return;
    }
    this.authService.loading.set(false);
    this.authService.checkAvailability(this.username()).subscribe({
      next: (res) => {
        this.usernameAvailable.set(true);
        this.authService.loading.set(false);
      },
      error: (err) => {
        const { error }: { error: HttpErrorResponse } = err;
        console.log('err at check username: ', err);
        this.toast.error(error.message);
        this.usernameAvailable.set(false);
        this.authService.loading.set(false);
      },
    });
  }

  changeUsername() {
    this.authService.loading.set(true);
    this.data$ = this.authService.changeUsername(this.username());
    this.data$.subscribe({
      next: (value) => {
        this.toast.success('Hurrah! your username changed.');
        this.authService.loading.set(false);
      },
      error: (err) => {
        const { error }: { error: HttpErrorResponse } = err;
        console.log('err at username change: ', err);
        this.toast.error(error.message);
        this.authService.loading.set(false);
      },
    });
  }
}
