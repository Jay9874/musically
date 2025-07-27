import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { LoadingState } from '../../loading-state.interface';
import { ToastService } from '../../toast/services/toast.service';

@Component({
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  authService: AuthService = inject(AuthService);
  toast: ToastService = inject(ToastService);

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
    this.data$.subscribe({
      next: (value) => this.toast.success('Registered successfully'),
      error: (err) => this.toast.error('Could not register'),
    });
  }
}
