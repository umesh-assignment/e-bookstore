import { DeliveryAddress } from './user.model';

export type OrderStatus = 'Processing' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  bookId: string;
  title: string;
  author: string;
  coverUrl: string;
  price: number;
  quantity: number;
}

export interface PaymentSummary {
  method: 'card' | 'upi' | 'netbanking' | 'cod' | 'points' | 'mixed';
  /** Last 4 digits of card (card / mixed only) */
  last4?: string;
  /** UPI virtual payment address */
  upiId?: string;
  /** Selected bank name (netbanking only) */
  bankName?: string;
  pointsUsed?: number;
  amountFromCard?: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  deliveryAddress: DeliveryAddress;
  payment: PaymentSummary;
  subtotal: number;
  deliveryFee: number;
  total: number;
  pointsEarned: number;
  pointsRedeemed: number;
  status: OrderStatus;
  createdAt: string;
  estimatedDelivery: string;
}

/** Shape passed in to OrderService.placeOrder() from CheckoutComponent */
export interface OrderPayload {
  userId: string;
  items: OrderItem[];
  deliveryAddress: DeliveryAddress;
  payment: PaymentSummary;
  subtotal: number;
  deliveryFee: number;
  total: number;
  pointsRedeemed: number;
}
