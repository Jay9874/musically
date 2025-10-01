import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarLink } from '../../../../types/interfaces/interfaces.common';
import { HasAccessDirective } from '../../directives/has-access.directive';

@Component({
  selector: 'app-menu-links',
  imports: [RouterModule, HasAccessDirective],
  templateUrl: './menu-links.component.html',
  styleUrl: './menu-links.component.css',
})
export class MenuLinksComponent {
  @Input({ required: true }) links!: SidebarLink[];
}
