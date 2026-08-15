import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { DeliveryAddress } from '@core/models';
import { AuthService } from './auth.service';

/**
 * Manages the logged-in user's address book.
 *
 * Addresses are stored on the User object via AuthService so they survive
 * across sessions. A signal-derived view is kept locally for reactive
 * template binding.
 *
 * When no user is logged in, a guest list is held in a local signal so
 * the checkout can still function for guest users (not persisted).
 */
@Injectable({ providedIn: 'root' })
export class AddressService {
  private readonly authSvc = inject(AuthService);

  // ── Local reactive view of the address list ─────────────────────────────
  private readonly _addresses = signal<DeliveryAddress[]>([]);

  readonly addresses      = this._addresses.asReadonly();
  readonly addressCount   = computed(() => this._addresses().length);
  readonly defaultAddress = computed(() => this._addresses()[0] ?? null);

  constructor() {
    // Hydrate from current user on init and whenever user changes
    effect(() => {
      const user = this.authSvc.currentUser();
      const list = user?.savedAddresses ?? [];
      // Migrate legacy single-address if present and list is empty
      if (list.length === 0 && user?.savedAddress) {
        const migrated: DeliveryAddress = {
          ...user.savedAddress,
          id:    user.savedAddress.id ?? crypto.randomUUID(),
          label: user.savedAddress.label ?? 'Home',
        };
        this._addresses.set([migrated]);
        this.authSvc.persistAddresses([migrated]);
      } else {
        this._addresses.set(list);
      }
    });
  }

  // ── Queries ──────────────────────────────────────────────────────────────

  getById(id: string): DeliveryAddress | undefined {
    return this._addresses().find(a => a.id === id);
  }

  // ── Mutations ────────────────────────────────────────────────────────────

  /**
   * Add a new address. Returns the created address.
   * The first address added automatically becomes the default.
   */
  addAddress(data: Omit<DeliveryAddress, 'id'>): DeliveryAddress {
    const newAddr: DeliveryAddress = { ...data, id: crypto.randomUUID() };
    const updated = [...this._addresses(), newAddr];
    this._addresses.set(updated);
    this.authSvc.persistAddresses(updated);
    return newAddr;
  }

  /**
   * Overwrite an existing address by id.
   */
  updateAddress(id: string, data: Omit<DeliveryAddress, 'id'>): void {
    const updated = this._addresses().map(a =>
      a.id === id ? { ...data, id } : a
    );
    this._addresses.set(updated);
    this.authSvc.persistAddresses(updated);
  }

  /**
   * Remove an address by id.
   */
  removeAddress(id: string): void {
    const updated = this._addresses().filter(a => a.id !== id);
    this._addresses.set(updated);
    this.authSvc.persistAddresses(updated);
  }

  /**
   * Move an address to position 0 (making it the default).
   */
  setDefault(id: string): void {
    const list = this._addresses();
    const target = list.find(a => a.id === id);
    if (!target) return;
    const updated = [target, ...list.filter(a => a.id !== id)];
    this._addresses.set(updated);
    this.authSvc.persistAddresses(updated);
  }
}
