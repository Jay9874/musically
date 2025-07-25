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
  toastId = signal<number>(1);

  constructor() {}

  // add = (
  //   message: string,
  //   duration: number = 1000,
  //   type: ToastType = 'success'
  // ): string => {
  //   try {
  //     // Generate a unique ID for each toast
  //     const id = Date.now().toString();
  //     const newToast: Toast = { message, duration, type, id };

  //     this.toasts.update((prev) => [...prev, newToast]);

  //     console.log('all toasts: ', this.toasts());
  //     setTimeout(() => {
  //       this.remove(newToast.id);
  //     }, duration);

  //     return newToast.id;
  //   } catch (err) {
  //     console.log('err while adding toast: ', err);
  //     throw err;
  //   }
  // };

  error = (message: string, duration: number = 1000): number => {
    try {
      // Generate a unique ID for each toast
      if (this.toasts().length === 3) {
        const modifiedArr: Toast[] = this.toasts().filter(
          (toast, i) => i !== 0
        );
        this.toasts.set(modifiedArr);
        this.toastId.set(1);
      }
      // const id = Date.now().toString();
      const newToast: Toast = {
        message,
        duration,
        id: this.toastId(),
        type: 'error',
      };

      this.toasts.update((prev) => [...prev, newToast]);
      this.toastId.update((prev) => prev + 1);
      console.log('all toasts: ', this.toasts());
      // setTimeout(() => {
      //   this.remove(newToast.id);
      // }, duration);

      return newToast.id;
    } catch (err) {
      console.log('err while adding toast: ', err);
      throw err;
    }
  };

  success = (message: string, duration: number = 1000): number => {
    try {
      // Generate a unique ID for each toast
      if (this.toasts().length === 3) {
        const modifiedArr: Toast[] = this.toasts().filter(
          (toast, i) => i !== 0
        );
        this.toasts.set(modifiedArr);
        this.toastId.set(1);
      }
      // const id = Date.now().toString();
      const newToast: Toast = {
        message,
        duration,
        id: this.toastId(),
        type: 'success',
      };

      this.toasts.update((prev) => [...prev, newToast]);
      this.toastId.update((prev) => prev + 1);
      console.log('all toasts: ', this.toasts());

      return newToast.id;
    } catch (err) {
      console.log('err while adding toast: ', err);
      throw err;
    }
  };

  loading = (message: string, duration: number = 1000): number => {
    try {
      // Generate a unique ID for each toast
      if (this.toasts().length === 3) {
        const modifiedArr: Toast[] = this.toasts().filter(
          (toast, i) => i !== 0
        );
        this.toasts.set(modifiedArr);
        this.toastId.set(1);
      }
      // const id = Date.now().toString();
      const newToast: Toast = {
        message,
        duration,
        id: this.toastId(),
        type: 'loading',
      };

      this.toasts.update((prev) => [...prev, newToast]);
      this.toastId.update((prev) => prev + 1);
      console.log('all toasts: ', this.toasts());

      return newToast.id;
    } catch (err) {
      console.log('err while adding toast: ', err);
      throw err;
    }
  };

  info = (message: string, duration: number = 1000): number => {
    try {
      // Generate a unique ID for each toast
      if (this.toasts().length === 3) {
        const modifiedArr: Toast[] = this.toasts().filter(
          (toast, i) => i !== 0
        );
        this.toasts.set(modifiedArr);
        this.toastId.set(1);
      }
      // const id = Date.now().toString();
      const newToast: Toast = {
        message,
        duration,
        id: this.toastId(),
        type: 'info',
      };

      this.toasts.update((prev) => [...prev, newToast]);
      this.toastId.update((prev) => prev + 1);
      console.log('all toasts: ', this.toasts());

      return newToast.id;
    } catch (err) {
      console.log('err while adding toast: ', err);
      throw err;
    }
  };

  warning = (message: string, duration: number = 1000): number => {
    try {
      // Generate a unique ID for each toast
      if (this.toasts().length === 3) {
        const modifiedArr: Toast[] = this.toasts().filter(
          (toast, i) => i !== 0
        );
        this.toasts.set(modifiedArr);
        this.toastId.set(1);
      }
      // const id = Date.now().toString();
      const newToast: Toast = {
        message,
        duration,
        id: this.toastId(),
        type: 'warning',
      };

      this.toasts.update((prev) => [...prev, newToast]);
      this.toastId.update((prev) => prev + 1);
      console.log('all toasts: ', this.toasts());

      return newToast.id;
    } catch (err) {
      console.log('err while adding toast: ', err);
      throw err;
    }
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
