import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { ToastService } from '../toast/services/toast.service';
import { SecurityService } from '../services/security/security.service';
import { catchError, map, Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ValidateLinkGuard implements CanActivate {
  constructor(
    private toast: ToastService,
    private securityService: SecurityService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | boolean {
    const { email, token } = route.queryParams;
    if (!email || !token) return false;

    return this.securityService.validateVerifyToken(token, email).pipe(
      map((res) => {
        this.toast.success('Hurrah! your email got verified.');
        return true;
      }),
      catchError((err) => {
        const error: HttpErrorResponse = err;
        if (error.status === 404) {
          this.toast.info('We could not find your token, create a new link.');
        } else if (error.status === 401) {
          this.toast.error('The link got expired, create a new one.');
        }
        return this.router.navigate(['auth/resend-link'], {
          queryParams: {
            email: email,
            code: error.status,
          },
        });
      })
    );
  }
}
