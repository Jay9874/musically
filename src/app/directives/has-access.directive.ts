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

  @Input()
  set hasAccess(roles: Roles[]) {
    this._roles = roles;
  }

  constructor() {}

  ngOnInit() {
    if (this.authService.isGranted(this._roles)) {
      this._viewContainer.clear();
      this._viewContainer.createEmbeddedView(this._templateRef);
    }
  }
}
