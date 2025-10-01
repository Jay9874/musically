import { Component, effect, inject, model, signal } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/services/auth.service';
import { SessionUser } from '../../../types/interfaces/interfaces.session';
import { UserStatusComponent } from '../common/user-status/user-status.component';
import { HasAccessDirective } from '../directives/has-access.directive';
import { ConsoleService } from './console/console.service';
import { SidebarLink } from '../../../types/interfaces/interfaces.common';
import { MenuLinksComponent } from "../common/menu-links/menu-links.component";

type MenuStates = 'active' | 'inactive';

@Component({
  selector: 'app-home',
  imports: [
    FormsModule,
    UserStatusComponent,
    RouterOutlet,
    RouterModule,
    MenuLinksComponent
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  readonly sidebarLinks: SidebarLink[] = [
    { title: 'Home', value: 'home', iconUrl: 'icons/home.svg', href: '' },
    { title: 'New', value: 'new', iconUrl: 'icons/menu.svg', href: '/new' },
    {
      title: 'Radio',
      value: 'radio',
      iconUrl: 'icons/radio.svg',
      href: '/radio',
    },
    {
      title: 'Console',
      value: 'console',
      iconUrl: 'icons/log-in.svg',
      href: '/console',
    },
  ];

  authService: AuthService = inject(AuthService);
  consoleService: ConsoleService = inject(ConsoleService);
  user = signal<SessionUser | null>(this.authService.user());

  menuStatus = model<MenuStates>('inactive');

  constructor() {
    effect(() => {
      this.user.set(this.authService.user());
    });
  }

  onMenuToggle(): void {
    if (this.menuStatus() === 'inactive') {
      this.menuStatus.set('active');
    } else {
      this.menuStatus.set('inactive');
    }
  }
}
