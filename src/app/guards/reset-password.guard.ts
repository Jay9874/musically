import { CanActivateFn, Router } from '@angular/router';
import { ToastService } from '../toast/services/toast.service';
import { inject } from '@angular/core';

export const resetPasswordGuard: CanActivateFn = (route, state) => {
  const toast: ToastService = inject(ToastService);
  const router: Router = inject(Router);

  const { email, token } = route.queryParams;
  if (!email || !token) {
    toast.error('Could not validate link, try again.');
    toast.error('The recovery link is invalid, try again.');
    return router.navigate(['login']);
  }
  return true;
};
