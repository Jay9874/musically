import { Component, effect, inject, model, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/services/auth.service';
import { SessionUser } from '../../../types/interfaces/interfaces.session';
import { UserStatusComponent } from '../common/user-status/user-status.component';
import { HasAccessDirective } from '../directives/has-access.directive';

type MenuStates = 'active' | 'inactive';

@Component({
  selector: 'app-home',
  imports: [RouterLink, FormsModule, UserStatusComponent, HasAccessDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  authService: AuthService = inject(AuthService);
  user = signal<SessionUser | null>(this.authService.user());

  menuStatus = model<MenuStates>('inactive');

  constructor() {
    effect(() => {
      this.user.set(this.authService.user());
    });
  }

  onMenuToggle(): void {
    if (this.menuStatus() === 'inactive') {
      this.menuStatus.set('active');
    } else {
      this.menuStatus.set('inactive');
    }
  }
}
