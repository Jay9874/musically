import { Component, inject, model } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../../toast/services/toast.service';
import { User } from '../../../../types/interfaces/interfaces.user';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css', '../../../styles.css'],
})
export class LoginComponent {
  authService = inject(AuthService);
  toast: ToastService = inject(ToastService);

  // Form model
  user = model<User>({
    email: '',
    password: '',
  });

  constructor(private router: Router) {}

  submitForm() {
    this.authService.loading.set(true);
    this.authService
      .submitLoginForm(this.user().email, this.user().password)
      .subscribe({
        next: (data) => {
          this.toast.success('Logged in successfully');
          this.router.navigate(['']);
        },
        error: (err) => {
          const { error }: { error: HttpErrorResponse } = err;
          console.log('err:', error);
          this.toast.error(error.message);
          this.authService.loading.set(false);
        },
        complete: () => {
          this.authService.loading.set(false);
        },
      });
  }
}
