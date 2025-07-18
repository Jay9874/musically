export type ToastType = 'success' | 'warning' | 'loading' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  duration: number;
  type: ToastType;
}
