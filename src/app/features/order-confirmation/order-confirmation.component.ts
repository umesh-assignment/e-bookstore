import { Component, inject, computed } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { OrderService } from '@core/services/order.service';
import { AuthService }  from '@core/services/auth.service';
import { GiftPointsService } from '@core/services/gift-points.service';

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
}
