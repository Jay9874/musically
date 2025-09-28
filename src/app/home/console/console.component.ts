import { Component, inject, model, OnInit } from '@angular/core';
import { SessionUser } from '../../../../types/interfaces/interfaces.session';
import { ToastService } from '../../toast/services/toast.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ConsoleService } from './console.service';
import { lastValueFrom } from 'rxjs';

type Tab = 'console' | 'users';

export interface UsersResponse {
  users: SessionUser[];
}

export interface updatedRoles {
  roles: string[];
}

export interface Roles {
  value: string;
  label: string;
}

@Component({
  selector: 'app-console',
  imports: [],
  templateUrl: './console.component.html',
  styleUrl: './console.component.css',
})
export class ConsoleComponent implements OnInit {
  readonly availableRoles: Roles[] = [
    { value: 'admin', label: 'Admin' },
    { value: 'normal', label: 'Normal' },
  ];

  // Services
  toast: ToastService = inject(ToastService);
  consoleService: ConsoleService = inject(ConsoleService);

  // Signals
  activeTab = model<Tab>('console');

  constructor() {}

  ngOnInit(): void {
    this.getUsers();
  }

  onTabChange(tab: Tab) {
    this.activeTab.set(tab);
  }

  async getUsers(): Promise<void> {
    try {
      const token$ = this.consoleService.getAllUsers();
      const res = await lastValueFrom(token$);
    } catch (err) {
      console.log('Err at getting all users: ', err);
      const { error } = err as HttpErrorResponse;
      console.log('err:', error);
      this.toast.error(error.message);
    }
  }

  async onUpdate(userId: string): Promise<void> {
    try {
      const user: SessionUser | undefined = this.consoleService
        .allUsers()
        .find((user) => user.userId === userId);
      if (!user) {
        this.toast.warning('Could not find the user in list.');
        return;
      }
      const token$ = this.consoleService.updateUser(userId, user.roles);
      const res = await lastValueFrom(token$);
    } catch (err) {
      console.log('Err at updating error: ', err);
      const { error } = err as HttpErrorResponse;
      console.log('err:', error);
      this.toast.error(error.message);
    }
  }
}
