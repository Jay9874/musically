import { Component, inject, Input, input, signal } from '@angular/core';
import { ToastService } from './services/toast.service';
import { Alignment, Toast } from '../../../types/interfaces/interfaces.toast';

@Component({
  selector: 'app-toast',
  imports: [],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
})
export class ToastComponent {
  @Input() alignment: Alignment = { vertical: 'top', horizontal: 'center' };
  toastService: ToastService = inject(ToastService);
}
