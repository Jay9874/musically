import { CanActivateFn } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';
import { inject } from '@angular/core';
import { Roles } from '../../../types/interfaces/interfaces.user';

export const accessGuard: CanActivateFn = (route, state) => {
  const authService: AuthService = inject(AuthService);
  let roles = route.data['roles'] as string[];

  if (authService.user()) {
    const userRoles: Roles[] = authService.user()!.roles;
    let hasRole: boolean = userRoles.some((r) => roles.includes(r));
    if (hasRole) return true;
    else return false;
  } else {
    return false;
  }
};
