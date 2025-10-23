import { Component, inject } from '@angular/core';
import { ConsoleService } from '../service/console.service';

@Component({
  selector: 'app-users',
  imports: [],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent {
  // Services
  consoleService: ConsoleService = inject(ConsoleService);
}
