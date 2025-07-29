import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
    email: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
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

  validatePassword(): boolean {
    // It will check for 
    /*
      1. Atleast one capital letter,
      2. Atleast one small letter,
      3. Atleast one special character,
      4. Atleast one digit,
      5. Length should be atleast 8 or more
    */
    const passwordRegex: RegExp = /([A-Z])([a-z])([0-9]){8, }/;
    if(this.loginForm.value.password)
    return true;
  }
}
