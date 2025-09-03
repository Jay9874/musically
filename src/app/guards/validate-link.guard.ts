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
import { lastValueFrom, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ValidateLinkGuard implements CanActivate {
  constructor(
    private toast: ToastService,
    private securityService: SecurityService,
    private router: Router
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    try {
      console.log('the route data: ', route.data);
      let token: Observable<boolean> = this.securityService.validateVerifyToken(
        'hello',
        'hello'
      );
      const token$ = await lastValueFrom(token);
      this.toast.success('Hurrah! your email got verified.');
      console.log('token is: ', token$);
      return true;
    } catch (err) {
      console.log('Error while validating link: ', err);
      return false;
    }
  }
}
