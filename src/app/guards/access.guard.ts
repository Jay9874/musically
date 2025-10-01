import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../auth/services/auth.service';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { Roles } from '../../../types/interfaces/interfaces.user';
import { lastValueFrom } from 'rxjs';

export const consoleGuard: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Promise<boolean | UrlTree> => {
  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router);

  let roles = route.data['roles'] as string[];
  if (authService.user()) {
    const userRoles: Roles[] = authService.user()!.roles;
    let hasRole: boolean = userRoles.some((r) => roles.includes(r));
    if (hasRole) return true;
    else return false;
  } else {
    try {
      const token$ = authService.validateSession();
      const user = await lastValueFrom(token$);
      const userRoles: Roles[] = user.roles;
      let hasRole: boolean = userRoles.some((r) => roles.includes(r));
      if (hasRole) return true;
      else return false;
    } catch (err) {
      router.navigate(['']);
      return false;
    }
  }
};
