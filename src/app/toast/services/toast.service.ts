import { Injectable, model, signal } from '@angular/core';
import {
  Toast,
  ToastType,
} from '../../../../types/interfaces/interfaces.toast';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  readonly DEFAULT_DURATION: number = 2000;
  toasts = signal<Toast[]>([]);

  constructor() {}

  add = (
    message: string,
    duration: number = this.DEFAULT_DURATION,
    type: ToastType = 'info'
  ): number => {
    try {
      let newToastArray: Toast[] = this.toasts();

      const id = Date.now();
      const newToast: Toast = {
        message,
        duration,
        id: id,
        type,
      };
      if (newToastArray.length === 3) {
        newToastArray.splice(0, 1);
      }
      newToastArray = [...newToastArray, newToast];
      this.toasts.set(newToastArray);

      setTimeout(() => {
        this.remove(newToast.id);
      }, duration);

      return newToast.id;
    } catch (err) {
      console.log('err while adding toast: ', err);
      throw err;
    }
  };

  error = (
    message: string,
    duration: number = this.DEFAULT_DURATION
  ): number => {
    return this.add(message, duration, 'error');
  };
  loading = (
    message: string,
    duration: number = this.DEFAULT_DURATION
  ): number => {
    return this.add(message, duration, 'loading');
  };

  success = (
    message: string,
    duration: number = this.DEFAULT_DURATION
  ): number => {
    return this.add(message, duration, 'success');
  };

  info = (
    message: string,
    duration: number = this.DEFAULT_DURATION
  ): number => {
    return this.add(message, duration, 'info');
  };

  warning = (
    message: string,
    duration: number = this.DEFAULT_DURATION
  ): number => {
    return this.add(message, duration, 'warning');
  };

  remove = (toastId: number): void => {
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
