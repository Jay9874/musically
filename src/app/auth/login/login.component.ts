import { Component, inject, model } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../../toast/services/toast.service';
import { User } from '../../../../types/interfaces/interfaces.user';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  authService = inject(AuthService);
  toast: ToastService = inject(ToastService);

  // Form model
  user = model<User>({
    email: '',
    password: '',
  });

  constructor() {}

  submitForm() {
    this.authService
      .submitLoginForm(this.user().email, this.user().password)
      .subscribe({
        next: (data) => {
          this.toast.loading('Logged in successfully');
        },
        error: (err) => {
          this.toast.error(err.message);
        },
        complete: () => {
          // console.log('logged in');
        },
      });
  }
}
