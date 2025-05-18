import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  authService = inject(AuthService);
  loginForm = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
  });
  submitForm() {
    const res = this.authService.submitLoginForm(
      this.loginForm.value.email ?? '',
      this.loginForm.value.password ?? ''
    );
    console.log(res);
  }
}
