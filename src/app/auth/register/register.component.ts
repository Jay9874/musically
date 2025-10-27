import { Component, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { LoadingState } from '../../loading-state.interface';
import { ToastService } from '../../toast/services/toast.service';
import { NewUser } from '../../../../types/interfaces/interfaces.user';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  imports: [RouterLink, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  authService: AuthService = inject(AuthService);
  toast: ToastService = inject(ToastService);

  // Form model
  user = model<NewUser>({
    email: '',
    password: '',
    username: '',
  });
  usernameAvailable = signal(false);

  data$!: Observable<LoadingState>;
  constructor(private router: Router) {}

  onUsernameChange(val: string): void {
    this.usernameAvailable.set(false);
    if (val) {
      this.user.update((prev) => ({ ...prev, username: val }));
    } else {
      this.user.update((prev) => ({ ...prev, username: '' }));
    }
  }

  checkAvailability(): void {
    const usernamePattern = /^[a-zA-Z0-9_-]+$/;
    const validUsername = usernamePattern.test(this.user().username);
    if (!validUsername) {
      this.toast.warning(
        "Username should be alphanumeric. Allowed special characters are '-' and '_'"
      );
      return;
    }
    this.authService.loading.set(false);
    this.authService.checkAvailability(this.user().username).subscribe({
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

  submitRegistrationForm() {
    this.authService.loading.set(true);
    this.data$ = this.authService.submitRegistrationForm(
      this.user().email,
      this.user().password,
      this.user().username
    );
    this.data$.subscribe({
      next: (value) => {
        this.toast.success('Account created, check email to activate it.');
        this.router.navigate(['auth']);
        this.authService.loading.set(false);
      },
      error: (err) => {
        const { error }: { error: HttpErrorResponse } = err;
        console.log('err at sign up: ', err);
        this.toast.error(error.message);
        this.authService.loading.set(false);
      },
      complete: () => {
        this.authService.loading.set(false);
      },
    });
  }
}
