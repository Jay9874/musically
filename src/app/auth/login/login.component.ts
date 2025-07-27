import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../../toast/services/toast.service';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  authService = inject(AuthService);
  toast: ToastService = inject(ToastService);
  loginForm = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
  });

  submitForm() {
    this.authService
      .submitLoginForm(
        this.loginForm.value.email ?? '',
        this.loginForm.value.password ?? ''
      )
      .subscribe({
        next: (data) => {
          this.toast.success('Logged in successfully');
        },
        error: (err) => {
          this.toast.error('Failed to login.');
        },
        complete: () => {
          // console.log('logged in');
        },
      });
  }
}
