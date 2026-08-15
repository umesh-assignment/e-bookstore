import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { OrderService }  from '@core/services/order.service';
import { AuthService }   from '@core/services/auth.service';
import { BadgeComponent } from '@shared/components/badge/badge.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { BreadcrumbComponent, Breadcrumb } from '@shared/components/breadcrumb/breadcrumb.component';
import { OrderStatus } from '@core/models';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [RouterLink, DatePipe, BadgeComponent, EmptyStateComponent, BreadcrumbComponent],
  templateUrl: './order-list.component.html',
  styleUrl:    './order-list.component.scss',
})
export class OrderListComponent {
  private readonly orderSvc = inject(OrderService);
  readonly authSvc          = inject(AuthService);

  readonly breadcrumbs: Breadcrumb[] = [
    { label: 'Home',      path: '/' },
    { label: 'My Orders' },
  ];

  readonly orders = computed(() => this.orderSvc.getOrdersForCurrentUser());

  statusVariant(status: OrderStatus): 'processing' | 'success' | 'danger' | 'muted' {
    switch (status) {
      case 'Processing': return 'processing';
      case 'Delivered':  return 'success';
      case 'Cancelled':  return 'danger';
      default:           return 'muted';
    }
  }
}
