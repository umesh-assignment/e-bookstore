import { Component, inject, computed } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { OrderService }      from '@core/services/order.service';
import { AuthService }       from '@core/services/auth.service';
import { GiftPointsService } from '@core/services/gift-points.service';
import { PaymentSummary }    from '@core/models';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './order-confirmation.component.html',
  styleUrl:    './order-confirmation.component.scss',
})
export class OrderConfirmationComponent {
  private readonly orderSvc  = inject(OrderService);
  readonly authSvc           = inject(AuthService);
  private readonly pointsSvc = inject(GiftPointsService);
  private readonly route     = inject(ActivatedRoute);

  private readonly queryParams = toSignal(this.route.queryParamMap, { initialValue: null });

  readonly order = computed(() => {
    const params = this.queryParams();
    const id = params?.get('orderId') ?? '';
    return id ? this.orderSvc.getOrderById(id) : undefined;
  });

  readonly pointsBalance = computed(() => this.pointsSvc.getBalance());

  /** Resolves to the order-detail route for the "View Order" button */
  readonly viewOrderRoute = computed(() => {
    const o = this.order();
    return o ? ['/orders', o.id] : ['/orders'];
  });

  /** Human-readable payment method label with icon */
  paymentLabel(p: PaymentSummary): string {
    switch (p.method) {
      case 'card':
        return `💳 Card ending ${p.last4}`;
      case 'mixed':
        return `💳 Card ending ${p.last4} + 🎁 ${p.pointsUsed} pts`;
      case 'points':
        return `🎁 Paid with gift points`;
      case 'upi':
        return `📱 UPI — ${p.upiId ?? ''}`;
      case 'netbanking':
        return `🏦 Net Banking — ${p.bankName ?? ''}`;
      case 'cod':
        return `💵 Cash on Delivery`;
      default:
        return `Payment processed`;
    }
  }
}
