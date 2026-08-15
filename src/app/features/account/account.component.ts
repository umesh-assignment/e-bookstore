import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthService }       from '@core/services/auth.service';
import { OrderService }      from '@core/services/order.service';
import { GiftPointsService } from '@core/services/gift-points.service';
import { BreadcrumbComponent, Breadcrumb } from '@shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [RouterLink, DatePipe, BreadcrumbComponent],
  templateUrl: './account.component.html',
  styleUrl:    './account.component.scss',
})
export class AccountComponent {
  readonly authSvc   = inject(AuthService);
  private readonly orderSvc  = inject(OrderService);
  private readonly pointsSvc = inject(GiftPointsService);

  readonly breadcrumbs: Breadcrumb[] = [
    { label: 'Home',       path: '/' },
    { label: 'My Account' },
  ];

  readonly user         = this.authSvc.currentUser;
  readonly pointsBal    = computed(() => this.pointsSvc.getBalance());
  readonly pointsInGBP  = computed(() => this.pointsSvc.getBalanceInGBP());
  readonly recentOrders = computed(() => this.orderSvc.getOrdersForCurrentUser().slice(0, 3));

  readonly pointsHistory = computed(() =>
    [...(this.user()?.pointsHistory ?? [])].reverse()
  );

  txIcon(type: string): string {
    switch (type) {
      case 'earn':    return '⬆';
      case 'redeem':  return '⬇';
      case 'reverse': return '↩';
      case 'refund':  return '↩';
      default:        return '·';
    }
  }

  txColor(type: string): string {
    return type === 'earn' || type === 'refund' ? 'positive' : 'negative';
  }
}
