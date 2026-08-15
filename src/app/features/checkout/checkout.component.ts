import {
  Component,
  inject,
  signal,
  computed,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService }        from '@core/services/cart.service';
import { AuthService }        from '@core/services/auth.service';
import { AddressService }     from '@core/services/address.service';
import { OrderService }       from '@core/services/order.service';
import { GiftPointsService }  from '@core/services/gift-points.service';
import { ToastService }       from '@core/services/toast.service';
import { DeliveryAddress, OrderPayload } from '@core/models';
import { BreadcrumbComponent, Breadcrumb } from '@shared/components/breadcrumb/breadcrumb.component';
import { SpinnerComponent }   from '@shared/components/spinner/spinner.component';

// ── Local types ───────────────────────────────────────────────────────────────

type CheckoutStep    = 'address' | 'payment';
type AddressMode     = 'list' | 'add' | 'edit';
type PaymentMethod   = 'card' | 'upi' | 'netbanking' | 'cod';
type PaymentState    = 'idle' | 'processing' | 'success' | 'failure';

/** Probability (0–1) that the mock payment will fail — configurable for demos */
const MOCK_FAILURE_RATE = 0.15;
const MOCK_PROCESSING_MS = 2200;

const BLANK_ADDR: Omit<DeliveryAddress, 'id'> = {
  label: '', firstName: '', lastName: '',
  line1: '', line2: '', city: '', postcode: '',
  country: 'United Kingdom',
};

const NET_BANKING_BANKS = [
  'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank',
  'Kotak Mahindra Bank', 'Punjab National Bank', 'Bank of Baroda',
  'Canara Bank', 'Union Bank of India', 'IndusInd Bank',
] as const;

// ── Component ─────────────────────────────────────────────────────────────────

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
  readonly addrSvc           = inject(AddressService);
  private readonly orderSvc  = inject(OrderService);
  private readonly pointsSvc = inject(GiftPointsService);
  private readonly toast      = inject(ToastService);
  private readonly router     = inject(Router);

  readonly breadcrumbs: Breadcrumb[] = [
    { label: 'Home',     path: '/' },
    { label: 'Basket',   path: '/basket' },
    { label: 'Checkout' },
  ];

  // ── Steps ─────────────────────────────────────────────────────────────────
  readonly currentStep  = signal<CheckoutStep>('address');

  // ── Cart ──────────────────────────────────────────────────────────────────
  readonly items       = this.cartSvc.items;
  readonly subtotal    = this.cartSvc.subtotal;
  readonly deliveryFee = this.cartSvc.deliveryFee;

  // ── Address book ──────────────────────────────────────────────────────────
  readonly selectedAddressId = signal<string | null>(null);
  readonly addressMode       = signal<AddressMode>('list');
  readonly editingId         = signal<string | null>(null);

  formAddr: Omit<DeliveryAddress, 'id'> = { ...BLANK_ADDR };
  formError = '';

  guestAddr: Omit<DeliveryAddress, 'id'> = { ...BLANK_ADDR };
  guestError = '';

  readonly selectedAddress = computed<DeliveryAddress | null>(() => {
    const id = this.selectedAddressId();
    return id ? (this.addrSvc.getById(id) ?? null) : null;
  });

  constructor() {
    const initial = this.addrSvc.defaultAddress();
    if (initial) this.selectedAddressId.set(initial.id);
  }

  // ── Address actions ───────────────────────────────────────────────────────

  selectAddress(id: string): void { this.selectedAddressId.set(id); }

  openAddForm(): void {
    this.formAddr  = { ...BLANK_ADDR };
    this.formError = '';
    this.editingId.set(null);
    this.addressMode.set('add');
  }

  openEditForm(addr: DeliveryAddress): void {
    this.formAddr = {
      label: addr.label ?? '', firstName: addr.firstName, lastName: addr.lastName,
      line1: addr.line1, line2: addr.line2 ?? '', city: addr.city,
      postcode: addr.postcode, country: addr.country,
    };
    this.formError = '';
    this.editingId.set(addr.id);
    this.addressMode.set('edit');
  }

  cancelForm(): void { this.addressMode.set('list'); this.formError = ''; }

  saveAddress(): void {
    this.formError = '';
    if (!this._validateAddrForm(this.formAddr)) return;
    const id = this.editingId();
    if (id) {
      this.addrSvc.updateAddress(id, this.formAddr);
      this.toast.success('Address updated.');
    } else {
      const created = this.addrSvc.addAddress(this.formAddr);
      this.selectedAddressId.set(created.id);
      this.toast.success('Address saved.');
    }
    this.addressMode.set('list');
  }

  deleteAddress(id: string): void {
    this.addrSvc.removeAddress(id);
    if (this.selectedAddressId() === id) {
      this.selectedAddressId.set(this.addrSvc.defaultAddress()?.id ?? null);
    }
    this.toast.show('Address removed.', { type: 'info' });
  }

  setDefault(id: string): void {
    this.addrSvc.setDefault(id);
    this.selectedAddressId.set(id);
  }

  // ── Step navigation ───────────────────────────────────────────────────────

  goToPayment(): void {
    if (this.authSvc.isLoggedIn()) {
      if (!this.selectedAddressId()) {
        this.toast.show('Please select or add a delivery address.', { type: 'warning' });
        return;
      }
    } else {
      this.guestError = '';
      if (!this._validateAddrForm(this.guestAddr, true)) return;
    }
    this.currentStep.set('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  backToAddress(): void {
    this.currentStep.set('address');
    this.addressMode.set('list');
    this.paymentState.set('idle');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private _validateAddrForm(
    data: Omit<DeliveryAddress, 'id'>,
    isGuest = false
  ): boolean {
    const { firstName, lastName, line1, city, postcode, country } = data;
    if (!firstName.trim() || !lastName.trim() || !line1.trim() ||
        !city.trim()      || !postcode.trim()  || !country) {
      const msg = 'Please complete all required address fields.';
      if (isGuest) this.guestError = msg; else this.formError = msg;
      return false;
    }
    return true;
  }

  // ── Points redemption ─────────────────────────────────────────────────────

  readonly pointsBalance    = this.pointsSvc.balance;
  readonly pointsInGBP      = this.pointsSvc.balanceInGBP;
  readonly maxRedeemable    = computed(() =>
    this.pointsSvc.maxRedeemable(this.subtotal() + this.deliveryFee())
  );
  readonly maxRedeemableGBP = computed(() =>
    this.pointsSvc.pointsToGBP(this.maxRedeemable())
  );
  readonly pointsToRedeem   = signal(0);
  readonly pointsDiscount   = computed(() =>
    this.pointsSvc.pointsToGBP(this.pointsToRedeem())
  );
  readonly pointsRedeemed   = computed(() => this.pointsToRedeem());
  readonly orderTotal       = computed(() =>
    Math.max(0, this.subtotal() + this.deliveryFee() - this.pointsDiscount())
  );
  readonly usingPoints      = computed(() => this.pointsToRedeem() > 0);
  readonly pointsEarnPreview = computed(() =>
    Math.floor(this.orderTotal()) * 10
  );

  setPointsToRedeem(raw: number): void {
    this.pointsToRedeem.set(
      Math.max(0, Math.min(this.maxRedeemable(), Math.round(raw)))
    );
  }
  applyAllPoints(): void { this.pointsToRedeem.set(this.maxRedeemable()); }
  clearPoints():    void { this.pointsToRedeem.set(0); }

  // ── Payment method ────────────────────────────────────────────────────────

  /** The four payment options exposed to the template */
  readonly paymentMethods: { id: PaymentMethod; label: string; icon: string }[] = [
    { id: 'card',       label: 'Credit / Debit Card', icon: '💳' },
    { id: 'upi',        label: 'UPI',                 icon: '📱' },
    { id: 'netbanking', label: 'Net Banking',          icon: '🏦' },
    { id: 'cod',        label: 'Cash on Delivery',     icon: '💵' },
  ];

  readonly selectedPaymentMethod = signal<PaymentMethod>('card');

  readonly netBankingBanks = NET_BANKING_BANKS;

  // ── Card fields ───────────────────────────────────────────────────────────
  cardNumber = '';
  cardExpiry = '';
  cardCvc    = '';
  cardName   = '';

  // ── UPI fields ────────────────────────────────────────────────────────────
  upiId = '';

  // ── Net banking fields ────────────────────────────────────────────────────
  selectedBank = '';

  // ── Payment simulation state machine ─────────────────────────────────────

  /**
   * Drives the entire payment UI lifecycle:
   *   idle        → form is shown, user fills details
   *   processing  → spinner overlay, no interaction
   *   success     → success panel shown; auto-redirect after delay
   *   failure     → error panel shown; user may retry or change method
   */
  readonly paymentState  = signal<PaymentState>('idle');
  readonly paymentError  = signal('');

  readonly isProcessing  = computed(() => this.paymentState() === 'processing');
  readonly isSuccess     = computed(() => this.paymentState() === 'success');
  readonly isFailure     = computed(() => this.paymentState() === 'failure');

  // ── Validation helpers ────────────────────────────────────────────────────

  private _validateCard(): string {
    if (!this.cardName.trim())
      return 'Please enter the name on your card.';
    if (this.cardNumber.replace(/\s/g, '').length < 13)
      return 'Please enter a valid card number.';
    if (!this.cardExpiry.match(/^\d{2}\/\d{2}$/))
      return 'Please enter a valid expiry date (MM/YY).';
    if (this.cardCvc.length < 3)
      return 'Please enter a valid CVC.';
    return '';
  }

  private _validateUPI(): string {
    const vpa = this.upiId.trim();
    if (!vpa) return 'Please enter your UPI ID.';
    if (!/^[\w.\-+]+@[\w]+$/.test(vpa))
      return 'Please enter a valid UPI ID (e.g. name@upi).';
    return '';
  }

  private _validateNetBanking(): string {
    if (!this.selectedBank) return 'Please select your bank.';
    return '';
  }

  // ── Main submit ───────────────────────────────────────────────────────────

  submitPayment(): void {
    this.paymentError.set('');

    // Per-method form validation
    const method = this.selectedPaymentMethod();
    let err = '';
    if      (method === 'card')       err = this._validateCard();
    else if (method === 'upi')        err = this._validateUPI();
    else if (method === 'netbanking') err = this._validateNetBanking();
    // cod has no fields to validate

    if (err) { this.paymentError.set(err); return; }

    // Resolve delivery address
    const addr: DeliveryAddress | null =
      this.authSvc.isLoggedIn()
        ? this.selectedAddress()
        : { ...this.guestAddr, id: 'guest' };

    if (!addr) {
      this.paymentError.set('No delivery address selected.');
      return;
    }

    this.paymentState.set('processing');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Simulate async gateway call
    setTimeout(() => {
      const failed = Math.random() < MOCK_FAILURE_RATE;
      if (failed) {
        this.paymentState.set('failure');
        this.paymentError.set(this._failureMessage(method));
        return;
      }
      this._finalise(addr, method);
    }, MOCK_PROCESSING_MS);
  }

  private _failureMessage(method: PaymentMethod): string {
    switch (method) {
      case 'card':       return 'Your card was declined. Please check your details or try a different card.';
      case 'upi':        return 'UPI payment failed. The VPA could not be verified. Please try again.';
      case 'netbanking': return 'Net Banking transaction failed. Please retry or choose another payment method.';
      default:           return 'Payment could not be processed. Please try again.';
    }
  }

  /** Retry after failure — return to idle keeping all entered data */
  retryPayment(): void {
    this.paymentState.set('idle');
    this.paymentError.set('');
  }

  // ── Order finalisation ────────────────────────────────────────────────────

  private _finalise(addr: DeliveryAddress, method: PaymentMethod): void {
    const user     = this.authSvc.currentUser();
    const userId   = user?.id ?? 'guest';
    const redeemed = this.pointsRedeemed();
    const total    = this.orderTotal();

    const payment = this._buildPaymentSummary(method, redeemed, total);

    const payload: OrderPayload = {
      userId,
      items:           this.items(),
      deliveryAddress: addr,
      payment,
      subtotal:        this.subtotal(),
      deliveryFee:     this.deliveryFee(),
      total,
      pointsRedeemed:  redeemed,
    };

    this.orderSvc.placeOrder(payload).subscribe({
      next: (order) => {
        this.orderSvc.finaliseOrder(order);
        this.paymentState.set('success');
        // Brief success pause then redirect
        setTimeout(() => {
          this.router.navigate(['/order-confirmation'], {
            queryParams: { orderId: order.id }
          });
        }, 1800);
      },
      error: () => {
        this.paymentState.set('failure');
        this.paymentError.set('Order could not be placed. Please try again.');
      },
    });
  }

  private _buildPaymentSummary(
    method: PaymentMethod,
    redeemed: number,
    total: number
  ): import('@core/models').PaymentSummary {
    const effectiveMethod = (redeemed > 0 && method === 'card' ? 'mixed' : method) as import('@core/models').PaymentSummary['method'];
    const base = { method: effectiveMethod, pointsUsed: redeemed > 0 ? redeemed : undefined };

    switch (method) {
      case 'card':
        return {
          ...base,
          last4:         this.cardNumber.replace(/\s/g, '').slice(-4),
          amountFromCard: total,
        };
      case 'upi':
        return { ...base, upiId: this.upiId.trim() };
      case 'netbanking':
        return { ...base, bankName: this.selectedBank };
      case 'cod':
        return { ...base };
      default:
        return { ...base };
    }
  }

  // ── Card formatters ───────────────────────────────────────────────────────

  formatCardNumber(): void {
    const clean = this.cardNumber.replace(/\D/g, '').slice(0, 16);
    this.cardNumber = clean.replace(/(.{4})/g, '$1 ').trim();
  }

  formatExpiry(): void {
    const clean = this.cardExpiry.replace(/\D/g, '').slice(0, 4);
    this.cardExpiry = clean.length >= 2
      ? clean.slice(0, 2) + '/' + clean.slice(2)
      : clean;
  }
}
