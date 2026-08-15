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
  method: 'card' | 'points' | 'mixed';
  last4?: string;
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
