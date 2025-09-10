import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { ToastService } from '../toast/services/toast.service';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

export const resendLinkGuard: CanActivateFn = (
  route,
  state
): Promise<UrlTree | boolean> | boolean => {
  const toast: ToastService = inject(ToastService);
  const router: Router = inject(Router);

  const { email, code } = route.queryParams;
  if (!email || !code) {
    toast.error('Could not validate link, try again.');
    return router.navigate(['login']);
  }
  return true;
};
