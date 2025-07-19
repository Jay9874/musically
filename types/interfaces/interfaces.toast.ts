export type ToastType = 'success' | 'warning' | 'loading' | 'error' | 'info';
export type ToastHorizontalAlignment = 'left' | 'center' | 'right';
export type ToastVerticalAlignment = 'top' | 'bottom';

export interface Toast {
  id: string;
  message: string;
  duration: number;
  type: ToastType;
}

export interface Alignment {
  vertical: ToastVerticalAlignment;
  horizontal: ToastHorizontalAlignment;
}
