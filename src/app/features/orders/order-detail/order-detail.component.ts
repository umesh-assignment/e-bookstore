import { Component, inject, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { OrderService }  from '@core/services/order.service';
import { CartService }   from '@core/services/cart.service';
import { BadgeComponent } from '@shared/components/badge/badge.component';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { BreadcrumbComponent, Breadcrumb } from '@shared/components/breadcrumb/breadcrumb.component';
import { OrderItem, OrderStatus } from '@core/models';
import { signal } from '@angular/core';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, BadgeComponent, ModalComponent, BreadcrumbComponent],
  templateUrl: './order-detail.component.html',
  styleUrl:    './order-detail.component.scss',
})
export class OrderDetailComponent {
  private readonly orderSvc = inject(OrderService);
  private readonly cartSvc  = inject(CartService);
  private readonly router   = inject(Router);
  private readonly route    = inject(ActivatedRoute);

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

  readonly showCancelModal = signal(false);

  statusVariant(status: OrderStatus): 'processing' | 'success' | 'danger' | 'muted' {
    switch (status) {
      case 'Processing': return 'processing';
      case 'Delivered':  return 'success';
      case 'Cancelled':  return 'danger';
      default:           return 'muted';
    }
  }

  reorderItem(item: OrderItem): void {
    this.orderSvc.reorderItem(item);
    this.router.navigate(['/basket']);
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
    if (o) {
      this.orderSvc.cancelOrder(o.id);
      this.showCancelModal.set(false);
    }
  }
}
