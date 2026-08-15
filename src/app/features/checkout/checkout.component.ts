import {
  Component,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService }        from '@core/services/cart.service';
import { AuthService }        from '@core/services/auth.service';
import { OrderService }       from '@core/services/order.service';
import { GiftPointsService }  from '@core/services/gift-points.service';
import { ToastService }       from '@core/services/toast.service';
import { DeliveryAddress, OrderPayload } from '@core/models';
import { BreadcrumbComponent, Breadcrumb } from '@shared/components/breadcrumb/breadcrumb.component';
import { SpinnerComponent }   from '@shared/components/spinner/spinner.component';

type Step = 'address' | 'payment';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule, BreadcrumbComponent, SpinnerComponent],
  templateUrl: './checkout.component.html',
  styleUrl:    './checkout.component.scss',
})
export class CheckoutComponent {
  private readonly cartSvc   = inject(CartService);
  readonly authSvc           = inject(AuthService);
  private readonly orderSvc  = inject(OrderService);
  private readonly pointsSvc = inject(GiftPointsService);
  private readonly toast     = inject(ToastService);
  private readonly router    = inject(Router);

  readonly breadcrumbs: Breadcrumb[] = [
    { label: 'Home',     path: '/' },
    { label: 'Basket',   path: '/basket' },
    { label: 'Checkout' },
  ];

  // ── Steps ─────────────────────────────────────────────────────────────────
  readonly currentStep = signal<Step>('address');
  readonly isPlacing   = signal(false);

  // ── Cart aliases ──────────────────────────────────────────────────────────
  readonly items       = this.cartSvc.items;
  readonly subtotal    = this.cartSvc.subtotal;
  readonly deliveryFee = this.cartSvc.deliveryFee;

  // ── Address form ──────────────────────────────────────────────────────────
  address: DeliveryAddress = {
    firstName: '',
    lastName:  '',
    line1:     '',
    line2:     '',
    city:      '',
    postcode:  '',
    country:   'United Kingdom',
  };

  addressError = '';

  // ── Points redemption ─────────────────────────────────────────────────────
  readonly pointsBalance  = computed(() => this.pointsSvc.getBalance());
  readonly pointsInGBP    = computed(() => this.pointsSvc.getBalanceInGBP());
  readonly usePoints      = signal(false);

  readonly pointsDiscount = computed(() =>
    this.usePoints() ? Math.min(this.pointsInGBP(), this.subtotal()) : 0
  );

  readonly pointsRedeemed = computed(() =>
    this.usePoints() ? this.pointsSvc.gbpToPoints(this.pointsDiscount()) : 0
  );

  readonly orderTotal = computed(() =>
    Math.max(0, this.subtotal() + this.deliveryFee() - this.pointsDiscount())
  );

  // ── Payment (mock card) ───────────────────────────────────────────────────
  cardNumber  = '';
  cardExpiry  = '';
  cardCvc     = '';
  cardName    = '';
  paymentError = '';

  // ── Pre-fill address from saved user data ─────────────────────────────────
  constructor() {
    effect(() => {
      const user = this.authSvc.currentUser();
      if (user?.savedAddress) {
        this.address = { ...user.savedAddress };
      } else if (user) {
        this.address.firstName = user.firstName;
        this.address.lastName  = user.lastName;
      }
    });
  }

  // ── Step navigation ───────────────────────────────────────────────────────
  goToPayment(): void {
    this.addressError = '';
    const { firstName, lastName, line1, city, postcode, country } = this.address;
    if (!firstName || !lastName || !line1 || !city || !postcode || !country) {
      this.addressError = 'Please complete all required address fields.';
      return;
    }
    this.currentStep.set('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  backToAddress(): void {
    this.currentStep.set('address');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Place order ───────────────────────────────────────────────────────────
  placeOrder(): void {
    this.paymentError = '';

    // Basic card validation (mock)
    if (!this.cardName.trim()) {
      this.paymentError = 'Please enter the name on your card.';
      return;
    }
    const cleanCard = this.cardNumber.replace(/\s/g, '');
    if (cleanCard.length < 13) {
      this.paymentError = 'Please enter a valid card number.';
      return;
    }
    if (!this.cardExpiry.match(/^\d{2}\/\d{2}$/)) {
      this.paymentError = 'Please enter a valid expiry date (MM/YY).';
      return;
    }
    if (this.cardCvc.length < 3) {
      this.paymentError = 'Please enter a valid CVC.';
      return;
    }

    const user = this.authSvc.currentUser();
    const userId = user?.id ?? 'guest';

    const last4 = this.cardNumber.replace(/\s/g, '').slice(-4);
    const redeemed = this.pointsRedeemed();
    const cardAmount = this.orderTotal();

    const payload: OrderPayload = {
      userId,
      items:           this.items(),
      deliveryAddress: { ...this.address },
      payment: {
        method:         redeemed > 0 ? 'mixed' : 'card',
        last4,
        pointsUsed:     redeemed > 0 ? redeemed : undefined,
        amountFromCard: cardAmount,
      },
      subtotal:        this.subtotal(),
      deliveryFee:     this.deliveryFee(),
      total:           this.orderTotal(),
      pointsRedeemed:  redeemed,
    };

    this.isPlacing.set(true);

    this.orderSvc.placeOrder(payload).subscribe({
      next: (order) => {
        this.orderSvc.finaliseOrder(order);

        // Save address to user profile
        if (user) {
          this.authSvc.saveAddress({ ...this.address });
        }

        this.isPlacing.set(false);
        this.router.navigate(['/order-confirmation'], {
          queryParams: { orderId: order.id }
        });
      },
      error: () => {
        this.isPlacing.set(false);
        this.toast.error('Could not place order. Please try again.');
      }
    });
  }

  // ── Card number formatter ──────────────────────────────────────────────────
  formatCardNumber(): void {
    const clean = this.cardNumber.replace(/\D/g, '').slice(0, 16);
    this.cardNumber = clean.replace(/(.{4})/g, '$1 ').trim();
  }

  formatExpiry(): void {
    const clean = this.cardExpiry.replace(/\D/g, '').slice(0, 4);
    if (clean.length >= 2) {
      this.cardExpiry = clean.slice(0, 2) + '/' + clean.slice(2);
    } else {
      this.cardExpiry = clean;
    }
  }
}
