import { Component } from '@angular/core';
import { SessionUser } from '../../../types/interfaces/interfaces.session';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';


export interface UsersResponse {
  users: SessionUser[];
}

export interface updatedRoles {
  roles: string[];
}



@Component({
  selector: 'app-console',
  imports: [FormsModule, RouterModule],
  templateUrl: './console.component.html',
  styleUrl: './console.component.css',
})
export class ConsoleComponent {}
