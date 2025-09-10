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
    const validate$ = securityService.validateSession();
    let session = await lastValueFrom(validate$);
    return true;
  } catch (err) {
    // const error: HttpErrorResponse = err;
    // if (error.status === 404) {
    //   toast.info('We could not find your token, create a new link.');
    // } else if (error.status === 401) {
    //   toast.error('The link got expired, create a new one.');
    // }
    const verify$ = securityService.validateVerifyToken(token, email);
    let success = await lastValueFrom(verify$);
    console.log('res: ', success);
    toast.success('Hurrah! Your email got verified.');
    if (success) return true;
    else {
      console.log('err at validate guard: ', err);
      return router.navigate(['auth/resend-link'], {
        queryParams: {
          email: email,
          code: 401,
        },
      });
    }
  }
};
