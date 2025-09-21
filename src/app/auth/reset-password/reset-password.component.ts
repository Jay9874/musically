import { Component, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../toast/services/toast.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
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
export class ResetPasswordComponent {
  toast: ToastService = inject(ToastService);
  authService: AuthService = inject(AuthService);

  newPassword = model<NewPassword>({
    password: '',
    confirmPassword: '',
  });

  constructor(private router: Router) {}

  submitForm() {
    if (
      this.newPassword().password !== '' &&
      this.newPassword().password === this.newPassword().confirmPassword
    )
      this.authService.loading.set(true);
    this.authService.changePassword(this.newPassword().password).subscribe({
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
        this.authService.loading.set(false);
      },
    });
  }
}
