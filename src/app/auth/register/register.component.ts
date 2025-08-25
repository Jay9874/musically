import { Component, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { LoadingState } from '../../loading-state.interface';
import { ToastService } from '../../toast/services/toast.service';
import { User } from '../../../../types/interfaces/interfaces.user';

@Component({
  selector: 'app-register',
  imports: [RouterLink, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  authService: AuthService = inject(AuthService);
  toast: ToastService = inject(ToastService);

  // Form model
  user = model<User>({
    email: '',
    password: '',
  });

  data$!: Observable<LoadingState>;
  constructor(private router: Router) {}

  submitRegistrationForm() {
    this.data$ = this.authService.submitRegistrationForm(
      this.user().email,
      this.user().password
    );
    this.data$.subscribe({
      next: (value) => {
        console.log('value', value);
        this.toast.success('Registered successfully');
        this.router.navigate(['auth']);
      },
      error: (err) => {
        console.log('err at sign up: ', err);
        this.toast.error(err.message);
      },
    });
  }
}
