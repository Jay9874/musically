import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { Role } from '../../../../types/interfaces/interfaces.user';
import { lastValueFrom } from 'rxjs';

export const consoleGuard: CanActivateFn = async (
  route,
  state
): Promise<boolean | UrlTree> => {
  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router);

  let roles = route.data['roles'] as string[];

  if (authService.user()) {
    const userRoles: Role[] = authService.user()!.roles;
    let hasRole: boolean = userRoles.some((r) => roles.includes(r));
    if (hasRole) return true;
    else return false;
  } else {
    try {
      const token$ = authService.validateSession();
      const user = await lastValueFrom(token$);
      const userRoles: Role[] = user.roles;
      let hasRole: boolean = userRoles.some((r) => roles.includes(r));
      if (hasRole) return true;
      else return false;
    } catch (err) {
      return router.navigate(['']);
    }
  }
};
