import { CanActivateFn } from '@angular/router';

export const resendLinkGuard: CanActivateFn = (route, state) => {
  return true;
};
