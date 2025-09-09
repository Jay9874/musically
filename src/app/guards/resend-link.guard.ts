import { inject, Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { ToastService } from '../toast/services/toast.service';

@Injectable({
  providedIn: 'root',
})
export class ResendLinkGuard implements CanActivate {
  private toast: ToastService = inject(ToastService);
  private router: Router = inject(Router);
  
  constructor() {}


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
