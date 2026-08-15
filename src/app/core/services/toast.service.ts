import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  /** Optional label for an inline CTA link */
  linkLabel?: string;
  /** Router path for the inline CTA link */
  linkPath?: string;
  duration: number;
}

export interface ToastOptions {
  type?: ToastType;
  duration?: number;
  linkLabel?: string;
  linkPath?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts$ = new Subject<Toast>();
  readonly toasts$ = this._toasts$.asObservable();

  show(message: string, options: ToastOptions = {}): void {
    const toast: Toast = {
      id: crypto.randomUUID(),
      message,
      type:      options.type     ?? 'info',
      duration:  options.duration ?? 4000,
      linkLabel: options.linkLabel,
      linkPath:  options.linkPath,
    };
    this._toasts$.next(toast);
  }

  success(message: string, options: Omit<ToastOptions, 'type'> = {}): void {
    this.show(message, { ...options, type: 'success' });
  }

  error(message: string, options: Omit<ToastOptions, 'type'> = {}): void {
    this.show(message, { ...options, type: 'error' });
  }

  warning(message: string, options: Omit<ToastOptions, 'type'> = {}): void {
    this.show(message, { ...options, type: 'warning' });
  }
}
