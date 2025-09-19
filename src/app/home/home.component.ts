import {
  Component,
  CreateEffectOptions,
  effect,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/services/auth.service';
import { SessionUser } from '../../../types/interfaces/interfaces.session';

@Component({
  selector: 'app-home',
  imports: [RouterLink, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  authService: AuthService = inject(AuthService);
  user = signal<SessionUser | null>(this.authService.user());

  constructor() {
    effect(() => {
      this.user.set(this.authService.user());
    });
  }
}
