import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';
import { inject } from '@angular/core';
import { lastValueFrom, Observable } from 'rxjs';
import { ToastService } from '../toast/services/toast.service';

export const profileGuard: CanActivateFn = async (
  route,
  state
): Promise<boolean | UrlTree> => {
  const authService: AuthService = inject(AuthService);
  const toast: ToastService = inject(ToastService);
  const router: Router = inject(Router);

  try {
    const token$ = authService.hasSession();
    const res = await lastValueFrom(token$);
    if (res) return true;
    return false;
  } catch (err) {
    toast.warning('Please log in to see this page.');
    return router.navigate(['']);
  }
};
