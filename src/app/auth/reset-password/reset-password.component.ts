import { Component, inject, model, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../toast/services/toast.service';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

interface NewPassword {
  password: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent implements OnInit {
  toast: ToastService = inject(ToastService);
  authService: AuthService = inject(AuthService);
  route: ActivatedRoute = inject(ActivatedRoute);
  router: Router = inject(Router);

  email = signal<string | null>(null);
  token = signal<string | null>(null);

  newPassword = model<NewPassword>({
    password: '',
    confirmPassword: '',
  });

  constructor() {}

  ngOnInit(): void {
    const snapshot = this.route.snapshot;
    const { email, token } = snapshot.queryParams;
    if (!(email && token)) {
      this.toast.error('The recovery link is invalid, try again.');
      this.router.navigate(['..'], { relativeTo: this.route });
    } else {
      this.email.set(email);
      this.token.set(token);
    }
  }

  submitForm(): void {
    if (
      this.newPassword().password !== '' &&
      this.newPassword().password !== this.newPassword().confirmPassword
    ) {
      this.toast.error(
        'The passwords do not match. Enter exactly same passwords'
      );
      return;
    }
    if (!this.email() || !this.token()) {
      this.toast.error('The recovery link is invalid, try again.');
      this.router.navigate(['..'], { relativeTo: this.route });
      return;
    }
    this.authService.loading.set(true);
    this.authService
      .changePassword(this.newPassword().password, this.email()!, this.token()!)
      .subscribe({
        next: (data) => {
          this.toast.success('Password changed successfully.');
          this.router.navigate(['']);
          this.authService.loading.set(false);
        },
        error: (err) => {
          const { error }: { error: HttpErrorResponse } = err;
          console.log('err:', error);
          this.toast.error(error.message);
          this.authService.loading.set(false);
        },
      });
  }
}
