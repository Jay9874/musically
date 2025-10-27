import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { ToastService } from '../toast/services/toast.service';
import { SecurityService } from '../services/security/security.service';
import { inject } from '@angular/core';
import { lastValueFrom } from 'rxjs';

export const validateLinkGuard: CanActivateFn = async (
  route,
  state
): Promise<boolean | UrlTree> => {
  // Services
  const toast: ToastService = inject(ToastService);
  const securityService: SecurityService = inject(SecurityService);
  const router: Router = inject(Router);
  const { email, token } = route.queryParams;
  if (!email || !token) return false;
  try {
    const verify$ = securityService.validateVerifyToken(token, email);
    let success = await lastValueFrom(verify$);
    toast.success('Hurrah! Your email got verified.');
    return router.navigate(['auth']);
  } catch (err) {
    console.log('err at validate guard: ', err);
    return router.navigate(['auth/resend-link'], {
      queryParams: {
        email: email,
        code: 401,
      },
    });
  }
};
