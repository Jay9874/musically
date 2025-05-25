import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { LoadingState } from '../../loading-state.interface';

@Component({
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  authService = inject(AuthService);
  registrationForm = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
  });

  data$!: Observable<LoadingState>;

  submitRegistrationForm() {
    this.data$ = this.authService.submitRegistrationForm(
      this.registrationForm.value.email ?? '',
      this.registrationForm.value.password ?? ''
    );
  }
}
