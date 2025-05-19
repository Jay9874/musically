import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  authService = inject(AuthService);
  registrationForm = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
  });

  submitRegistrationForm() {
    const res = this.authService.submitRegistrationForm(
      this.registrationForm.value.email ?? '',
      this.registrationForm.value.password ?? ''
    );
    console.log(res);
  }
}
