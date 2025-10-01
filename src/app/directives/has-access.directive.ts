import {
  Directive,
  effect,
  inject,
  Input,
  signal,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { SessionUser } from '../../../types/interfaces/interfaces.session';
import { Roles } from '../../../types/interfaces/interfaces.user';
import { AuthService } from '../auth/services/auth.service';

@Directive({
  selector: '[hasAccess]',
})
export class HasAccessDirective {
  authService: AuthService = inject(AuthService);
  private _templateRef = inject(TemplateRef);
  private _viewContainer = inject(ViewContainerRef);
  private _roles!: Roles[];

  user = signal<SessionUser | null>(null);

  @Input()
  set hasAccess(roles: Roles[]) {
    this._roles = roles;
  }

  constructor() {
    effect(() => {
      this.user.set(this.authService.user());
      if (this.user()) {
        const userRoles: Roles[] = this.user()!.roles;
        let hasRole: boolean = userRoles.some((r) => this._roles.includes(r));
        if (hasRole) {
          this._viewContainer.clear();
          this._viewContainer.createEmbeddedView(this._templateRef);
        }
      } else {
        this._viewContainer.clear();
      }
    });
  }

  ngOnInit() {
    this.user.set(this.authService.user());
    if (this.user()) {
      const userRoles: Roles[] = this.user()!.roles;
      let hasRole: boolean = userRoles.some((r) => this._roles.includes(r));
      if (hasRole) {
        this._viewContainer.clear();
        this._viewContainer.createEmbeddedView(this._templateRef);
      }
    } else {
      this._viewContainer.clear();
    }
  }
}
