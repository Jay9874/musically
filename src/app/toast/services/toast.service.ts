import { Injectable, model, signal } from '@angular/core';
import {
  Toast,
  ToastType,
} from '../../../../types/interfaces/interfaces.toast';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts = signal<Toast[]>([]);
  constructor() {}

  add = (
    message: string,
    duration: number = 1000,
    type: ToastType = 'success'
  ): string => {
    try {
      // Generate a unique ID for each toast
      const id = Date.now().toString();
      const newToast: Toast = { message, duration, type, id };

      this.toasts.update((prev) => [...prev, newToast]);

      console.log('all toasts: ', this.toasts());
      setTimeout(() => {
        this.remove(newToast.id);
      }, duration);

      return newToast.id;
    } catch (err) {
      console.log('err while adding toast: ', err);
      throw err;
    }
  };

  remove = (toastId: string): void => {
    console.log('called remove: ', toastId);
    console.log('toasts: ', this.toasts());

    // Filter out the toast with the matching ID to create a new array (immutable update)
    const modifiedToasts: Toast[] = this.toasts().filter(
      (toast) => toast.id !== toastId
    );

    // Update the reactive state with the new array
    this.toasts.set(modifiedToasts);
  };

  // Optional: A method to clear all toasts
  clearAll = (): void => {
    this.toasts.set([]);
  };
}
