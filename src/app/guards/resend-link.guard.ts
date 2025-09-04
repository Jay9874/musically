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
import { catchError, map, Observable, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ResendLinkGuard implements CanActivate {
  constructor(
    private toast: ToastService,
    private securityService: SecurityService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<UrlTree | boolean> | boolean {
    const { email, code } = route.queryParams;
    if (!email || !code) {
      this.toast.error('Could not validate link, try again.');
      return this.router.navigate(['login']);
    }
    return true;
  }
}
