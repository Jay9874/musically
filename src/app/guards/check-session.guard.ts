import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';

export const checkSessionGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);

  authService.hasSession().subscribe({
    next: (res) => {},
    error: (err) => {},
  });
  return true;
};
