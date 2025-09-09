import { CanActivateFn, Router, RouterEvent, UrlTree } from '@angular/router';
import { ToastService } from '../toast/services/toast.service';
import { SecurityService } from '../services/security/security.service';
import { inject } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

export const validateLinkGuard: CanActivateFn = (
  route,
  state
): Observable<boolean | UrlTree> | boolean => {
  // Services
  const toast: ToastService = inject(ToastService);
  const securityService: SecurityService = inject(SecurityService);
  const router: Router = inject(Router);

  try {
    const { email, token } = route.queryParams;
    if (!email || !token) return false;
    return securityService.validateSession().pipe(
      map((res) => {
        console.log('res: ', res);
        return true;
      }),
      catchError((err) => {
        console.log('err: ', err);
        return securityService.validateVerifyToken(token, email).pipe(
          map((res) => {
            console.log('res: ', res);
            toast.success('Hurrah! Your email got verified.');
            return true;
          }),
          catchError((tokenErr) => {
            const error: HttpErrorResponse = tokenErr;
            if (error.status === 404) {
              toast.info('We could not find your token, create a new link.');
            } else if (error.status === 401) {
              toast.error('The link got expired, create a new one.');
            }
            return router.navigate(['auth/resend-link'], {
              queryParams: {
                email: email,
                code: error.status,
              },
            });
          })
        );
      })
    );
  } catch (err) {
    return false;
  }
};
