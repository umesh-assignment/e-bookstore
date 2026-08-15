import { Injectable, inject, computed } from '@angular/core';
import { PointsTransaction } from '@core/models';
import { AuthService } from './auth.service';

/** 10 points earned per £1 spent (rounded down) */
const EARN_RATE = 10;
/** 100 points = £1.00 discount */
const REDEEM_RATE = 100;

@Injectable({ providedIn: 'root' })
export class GiftPointsService {
  private readonly auth = inject(AuthService);

  // ── Reactive signals ──────────────────────────────────────────────────────

  /** Current points balance as a reactive signal */
  readonly balance = computed(() => this.auth.currentUser()?.giftPoints ?? 0);

  /** Points balance expressed as a GBP discount value */
  readonly balanceInGBP = computed(() => this.balance() / REDEEM_RATE);

  // ── Read helpers (kept for backwards-compat) ──────────────────────────────

  getBalance(): number {
    return this.balance();
  }

  /** Convert points balance to GBP equivalent */
  getBalanceInGBP(): number {
    return this.balanceInGBP();
  }

  /** Convert a GBP discount amount to required points */
  gbpToPoints(gbp: number): number {
    return Math.ceil(gbp * REDEEM_RATE);
  }

  /** Convert points to GBP discount */
  pointsToGBP(points: number): number {
    return points / REDEEM_RATE;
  }

  /** Max points redeemable against a given order total (pts, not GBP) */
  maxRedeemable(orderTotal: number): number {
    return Math.min(this.balance(), this.gbpToPoints(orderTotal));
  }

  // ── Mutations ─────────────────────────────────────────────────────────────

  /**
   * Earn points after order placement.
   * Rate: Math.floor(amountPaidByCard) * EARN_RATE
   * Points are awarded on the card-paid portion only.
   */
  earnPoints(orderId: string, amountPaidByCard: number): void {
    const earned = Math.floor(amountPaidByCard) * EARN_RATE;
    if (earned <= 0) return;

    const tx: PointsTransaction = {
      id:          crypto.randomUUID(),
      type:        'earn',
      points:      earned,
      orderId,
      date:        new Date().toISOString(),
      description: `Earned on order #${orderId.slice(-8).toUpperCase()}`,
    };

    this.auth.updateCurrentUser(u => ({
      ...u,
      giftPoints:    u.giftPoints + earned,
      pointsHistory: [...u.pointsHistory, tx],
    }));
  }

  /**
   * Redeem points at checkout.
   * Clamps redemption to available balance and order total equivalent.
   */
  redeemPoints(orderId: string, points: number): void {
    const balance = this.getBalance();
    const actual  = Math.min(points, balance);
    if (actual <= 0) return;

    const tx: PointsTransaction = {
      id:          crypto.randomUUID(),
      type:        'redeem',
      points:      actual,
      orderId,
      date:        new Date().toISOString(),
      description: `Redeemed on order #${orderId.slice(-8).toUpperCase()}`,
    };

    this.auth.updateCurrentUser(u => ({
      ...u,
      giftPoints:    Math.max(0, u.giftPoints - actual),
      pointsHistory: [...u.pointsHistory, tx],
    }));
  }

  /**
   * Reverse earned points when an order is cancelled.
   * Looks up the earn transaction for orderId in pointsHistory.
   */
  reverseEarnedPoints(orderId: string): void {
    const user = this.auth.currentUser();
    if (!user) return;

    const earnTx = user.pointsHistory.find(
      tx => tx.orderId === orderId && tx.type === 'earn'
    );
    if (!earnTx) return;

    const tx: PointsTransaction = {
      id:          crypto.randomUUID(),
      type:        'reverse',
      points:      earnTx.points,
      orderId,
      date:        new Date().toISOString(),
      description: `Reversed earn for cancelled order #${orderId.slice(-8).toUpperCase()}`,
    };

    this.auth.updateCurrentUser(u => ({
      ...u,
      giftPoints:    Math.max(0, u.giftPoints - earnTx.points),
      pointsHistory: [...u.pointsHistory, tx],
    }));
  }

  /**
   * Refund redeemed points when an order is cancelled.
   * Looks up the redeem transaction for orderId in pointsHistory.
   */
  refundRedeemedPoints(orderId: string): void {
    const user = this.auth.currentUser();
    if (!user) return;

    const redeemTx = user.pointsHistory.find(
      tx => tx.orderId === orderId && tx.type === 'redeem'
    );
    if (!redeemTx) return;

    const tx: PointsTransaction = {
      id:          crypto.randomUUID(),
      type:        'refund',
      points:      redeemTx.points,
      orderId,
      date:        new Date().toISOString(),
      description: `Refund of redeemed points for cancelled order #${orderId.slice(-8).toUpperCase()}`,
    };

    this.auth.updateCurrentUser(u => ({
      ...u,
      giftPoints:    u.giftPoints + redeemTx.points,
      pointsHistory: [...u.pointsHistory, tx],
    }));
  }
}
