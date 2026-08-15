import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Toast, ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div
      class="toast-region"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
      aria-atomic="false"
    >
      @for (toast of visibleToasts(); track toast.id) {
        <div
          class="toast"
          [class]="'toast--' + toast.type"
          role="alert"
          aria-atomic="true"
        >
          <!-- Icon -->
          <span class="toast__icon" aria-hidden="true">
            @if (toast.type === 'success') { ✓ }
            @else if (toast.type === 'error') { ✕ }
            @else if (toast.type === 'warning') { ⚠ }
            @else { ℹ }
          </span>

          <!-- Message -->
          <span class="toast__message">
            {{ toast.message }}
            @if (toast.linkLabel && toast.linkPath) {
              <a class="toast__link" [routerLink]="toast.linkPath">{{ toast.linkLabel }}</a>
            }
          </span>

          <!-- Dismiss -->
          <button
            class="toast__close btn-icon"
            type="button"
            (click)="dismiss(toast.id)"
            aria-label="Dismiss notification"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styleUrl: './toast.component.scss'
})
export class ToastComponent implements OnInit, OnDestroy {
  private readonly toastService = inject(ToastService);
  private sub?: Subscription;
  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  protected visibleToasts = signal<Toast[]>([]);

  ngOnInit(): void {
    this.sub = this.toastService.toasts$.subscribe(toast => {
      this.visibleToasts.update(list => [...list, toast]);
      // Auto-dismiss after duration
      const timer = setTimeout(() => this.dismiss(toast.id), toast.duration);
      this.timers.set(toast.id, timer);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.timers.forEach(t => clearTimeout(t));
  }

  protected dismiss(id: string): void {
    clearTimeout(this.timers.get(id));
    this.timers.delete(id);
    this.visibleToasts.update(list => list.filter(t => t.id !== id));
  }
}
