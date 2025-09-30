import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../auth/services/auth.service';
import { Router } from '@angular/router';
import { inject, Injectable } from '@angular/core';
import { Roles } from '../../../types/interfaces/interfaces.user';
import { SecurityService } from '../services/security/security.service';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccessGuard implements CanActivate {
  securityService: SecurityService = inject(SecurityService);
  authService: AuthService = inject(AuthService);

  constructor(private router: Router) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    let roles = route.data['roles'] as string[];
    if (this.authService.user()) {
      const userRoles: Roles[] = this.authService.user()!.roles;
      let hasRole: boolean = userRoles.some((r) => roles.includes(r));
      if (hasRole) return true;
      else return false;
    } else {
      // Check the session in cookie
      try {
        const token$ = this.authService.validateSession();
        const user = await lastValueFrom(token$);
        // return true;
        console.log('token: ', token$);
        const userRoles: Roles[] = user.roles;
        let hasRole: boolean = userRoles.some((r) => roles.includes(r));
        if (hasRole) return true;
        else return false;
      } catch (err) {
        console.log('err: ', err);
        this.router.navigate(['']); // Redirect to login if not authenticated
        return false;
      }
    }
  }
}
