import { Component, inject, computed, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { OrderService }   from '@core/services/order.service';
import { CartService }    from '@core/services/cart.service';
import { ToastService }   from '@core/services/toast.service';
import { BadgeComponent } from '@shared/components/badge/badge.component';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { BreadcrumbComponent, Breadcrumb } from '@shared/components/breadcrumb/breadcrumb.component';
import { OrderItem, OrderStatus } from '@core/models';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, BadgeComponent, ModalComponent, BreadcrumbComponent],
  templateUrl: './order-detail.component.html',
  styleUrl:    './order-detail.component.scss',
})
export class OrderDetailComponent {
  private readonly orderSvc  = inject(OrderService);
  private readonly cartSvc   = inject(CartService);
  private readonly toastSvc  = inject(ToastService);
  private readonly router    = inject(Router);
  private readonly route     = inject(ActivatedRoute);

  readonly breadcrumbs: Breadcrumb[] = [
    { label: 'Home',       path: '/' },
    { label: 'My Orders',  path: '/orders' },
    { label: 'Order Details' },
  ];

  private readonly routeParams = toSignal(this.route.paramMap, { initialValue: null });

  readonly order = computed(() => {
    const id = this.routeParams()?.get('id') ?? '';
    return id ? this.orderSvc.getOrderById(id) : undefined;
  });

  // ── Cancellation eligibility ─────────────────────────────────────────────

  /**
   * True when the current order can still be cancelled:
   *  - status is 'Processing'
   *  - placed within the last 48 hours
   */
  readonly cancellable = computed(() => {
    const o = this.order();
    return o ? this.orderSvc.isCancellationAllowed(o) : false;
  });

  /**
   * The ISO deadline by which cancellation is still allowed.
   * null when the order is not in Processing status.
   */
  readonly cancelDeadline = computed(() => {
    const o = this.order();
    return o ? this.orderSvc.cancellationDeadline(o) : null;
  });

  /**
   * True when the order is in Processing but the 48-hour window has passed.
   * Used to render the "cancellation window expired" notice.
   */
  readonly cancelWindowExpired = computed(() => {
    const o = this.order();
    return o?.status === 'Processing' && !this.cancellable();
  });

  // ── Modal state ─────────────────────────────────────────────────────────
  readonly showCancelModal = signal(false);

  // ── Helpers ──────────────────────────────────────────────────────────────

  statusVariant(status: OrderStatus): 'processing' | 'success' | 'danger' | 'muted' {
    switch (status) {
      case 'Processing': return 'processing';
      case 'Delivered':  return 'success';
      case 'Cancelled':  return 'danger';
      default:           return 'muted';
    }
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  reorderItem(item: OrderItem): void {
    const ok = this.orderSvc.reorderItem(item);
    if (ok) {
      this.toastSvc.success(`"${item.title}" added to your basket.`, {
        linkLabel: 'View Basket',
        linkPath:  '/basket',
      });
    } else {
      this.toastSvc.error(`"${item.title}" is out of stock and cannot be re-ordered.`);
    }
  }

  reorderAll(): void {
    const o = this.order();
    if (o) {
      this.orderSvc.reorderAll(o);
      this.router.navigate(['/basket']);
    }
  }

  openCancelModal(): void  { this.showCancelModal.set(true); }
  closeCancelModal(): void { this.showCancelModal.set(false); }

  confirmCancel(): void {
    const o = this.order();
    if (!o) { this.showCancelModal.set(false); return; }

    const success = this.orderSvc.cancelOrder(o.id);
    this.showCancelModal.set(false);

    if (!success) {
      // Re-evaluate eligibility at the moment the user clicks confirm —
      // the window may have just expired while the modal was open.
      this.toastSvc.error(
        'This order can no longer be cancelled. The 48-hour cancellation window has expired.'
      );
    }
  }
}
