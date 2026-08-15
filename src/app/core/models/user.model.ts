export interface DeliveryAddress {
  id: string;
  label?: string;       // e.g. "Home", "Work"
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  country: string;
}

export interface PointsTransaction {
  id: string;
  type: 'earn' | 'redeem' | 'reverse' | 'refund';
  points: number;
  orderId: string;
  date: string;
  description: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  /**
   * Base64-encoded password — NOT a real hash.
   * This is a frontend-only mock: btoa(password) is used purely for obfuscation.
   */
  passwordHash: string;
  giftPoints: number;
  pointsHistory: PointsTransaction[];
  /** Legacy single address — kept for backwards-compat with existing localStorage data */
  savedAddress?: DeliveryAddress;
  /** Address book — list of saved delivery addresses */
  savedAddresses: DeliveryAddress[];
  createdAt: string;
}
