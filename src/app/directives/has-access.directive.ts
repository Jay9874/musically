import {
  Directive,
  inject,
  Input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { SessionUser } from '../../../types/interfaces/interfaces.session';
import { Roles } from '../../../types/interfaces/interfaces.user';

@Directive({
  selector: '[hasAccess]',
})
export class HasAccessDirective {
  private _templateRef = inject(TemplateRef);
  private _viewContainer = inject(ViewContainerRef);
  private _user!: SessionUser;
  private _roles!: Roles[];

  @Input()
  set hasAccess(roles: Roles[]) {
    this._roles = roles;
  }

  @Input('isGrantedFor')
  set isGrantedFor(user: SessionUser) {
    this._user = user;
  }
  constructor() {}

  ngOnInit() {
    if (this._user) {
      const roles: Roles[] = this._user.roles;
      let hasRole: boolean = this._roles.some((r) => roles.includes(r));
      if (hasRole) {
        this._viewContainer.clear();
        this._viewContainer.createEmbeddedView(this._templateRef);
      }
    }
  }
}
