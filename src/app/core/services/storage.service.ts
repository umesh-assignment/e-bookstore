import { Injectable, inject } from '@angular/core';
import { ToastService } from './toast.service';

/**
 * Typed localStorage wrapper.
 * All read/write operations are wrapped in try/catch.
 * On QuotaExceededError a toast notification is shown.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly toast = inject(ToastService);

  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      if (err instanceof DOMException && err.name === 'QuotaExceededError') {
        this.toast.error('Storage limit reached. Some data may not be saved.');
      }
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // silently ignore
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch {
      // silently ignore
    }
  }
}
