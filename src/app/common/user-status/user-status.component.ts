import {
  Component,
  effect,
  inject,
  model,
  OnInit,
  signal,
} from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterLink,
  UrlTree,
} from '@angular/router';
import { ToastService } from '../../toast/services/toast.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SessionUser } from '../../../../types/interfaces/interfaces.session';

@Component({
  selector: 'app-user-status',
  imports: [RouterLink],
  templateUrl: './user-status.component.html',
  styleUrl: './user-status.component.css',
})
export class UserStatusComponent implements OnInit {
  authService: AuthService = inject(AuthService);
  toast: ToastService = inject(ToastService);

  isMenuVisible = signal(false);
  loggedUser = signal<SessionUser | null>(null);

  constructor(private router: Router) {
    effect(() => {
      this.loggedUser.set(this.authService.user());
    });
  }

  ngOnInit(): void {
    this.loggedUser.set(this.authService.user());
  }

  onAvatarClick(): void {
    this.isMenuVisible.set(!this.isMenuVisible());
  }

  async onLogout(): Promise<void> {
    this.authService.logout(this.router.url).subscribe({
      next: (res) => {
        this.authService.loading.set(false);
        this.isMenuVisible.set(false);
      },
      error: (err) => {
        const { error }: { error: HttpErrorResponse } =
          err as HttpErrorResponse;
        this.toast.error(error.message);
        this.isMenuVisible.set(false);
      },
    });
  }

  routeToProfile(): Promise<boolean> {
    this.isMenuVisible.set(false);
    return this.router.navigate(['/profile']);
  }
}
