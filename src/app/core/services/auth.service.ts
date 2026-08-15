import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { User, DeliveryAddress, PointsTransaction } from '@core/models';
import { StorageService } from './storage.service';

const STORAGE_KEY_USER  = 'ebk_user';
const STORAGE_KEY_USERS = 'ebk_users';

/** Result type returned by login/register */
export interface AuthResult {
  success: boolean;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storage = inject(StorageService);

  private readonly _currentUser = signal<User | null>(null);
  private _users: User[] = [];

  // ── Public signals ────────────────────────────────────────────────────────
  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn  = computed(() => this._currentUser() !== null);

  constructor() {
    this.init();
    // Persist current user to localStorage on every change
    effect(() => {
      const user = this._currentUser();
      if (user) {
        this.storage.set(STORAGE_KEY_USER, user);
      } else {
        this.storage.remove(STORAGE_KEY_USER);
      }
    });
  }

  // ── Initialisation ────────────────────────────────────────────────────────

  private init(): void {
    this._users = this.storage.get<User[]>(STORAGE_KEY_USERS) ?? [];

    // Seed demo account on first run
    if (this._users.length === 0) {
      this.seedDemoAccount();
    }

    // Restore session
    const saved = this.storage.get<User>(STORAGE_KEY_USER);
    if (saved) {
      const match = this._users.find(u => u.id === saved.id);
      this._currentUser.set(match ?? null);
    }
  }

  private seedDemoAccount(): void {
    const demo: User = {
      id:            'demo-001',
      firstName:     'Demo',
      lastName:      'User',
      email:         'demo@ebookstore.com',
      // btoa('Demo1234!') — NOT real hashing, front-end mock only
      passwordHash:  'RGVtbzEyMzQh',
      giftPoints:    350,
      pointsHistory: [
        {
          id:          'pt-seed-001',
          type:        'earn',
          points:      200,
          orderId:     'seed',
          date:        '2025-01-01T00:00:00.000Z',
          description: 'Welcome bonus',
        },
        {
          id:          'pt-seed-002',
          type:        'earn',
          points:      150,
          orderId:     'ord-demo-002',
          date:        '2025-03-10T14:30:00.000Z',
          description: 'Earned on order #ORD-DEMO-002',
        },
      ],
      savedAddress: {
        firstName: 'Demo',
        lastName:  'User',
        line1:     '10 Bookshelf Lane',
        city:      'London',
        postcode:  'EC1A 1BB',
        country:   'United Kingdom',
      },
      createdAt: '2025-01-01T00:00:00.000Z',
    };

    this._users = [demo];
    this.storage.set(STORAGE_KEY_USERS, this._users);
  }

  // ── Auth Actions ──────────────────────────────────────────────────────────

  login(email: string, password: string): AuthResult {
    const user = this._users.find(
      u => u.email.toLowerCase() === email.toLowerCase() &&
           u.passwordHash === btoa(password)
    );

    if (!user) {
      return { success: false, error: 'Invalid email or password.' };
    }

    this._currentUser.set(user);
    return { success: true };
  }

  register(
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): AuthResult {
    const exists = this._users.some(
      u => u.email.toLowerCase() === email.toLowerCase()
    );

    if (exists) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser: User = {
      id:            crypto.randomUUID(),
      firstName,
      lastName,
      email,
      passwordHash:  btoa(password),
      giftPoints:    200, // opening balance per GP-01
      pointsHistory: [
        {
          id:          crypto.randomUUID(),
          type:        'earn',
          points:      200,
          orderId:     'welcome',
          date:        new Date().toISOString(),
          description: 'Welcome bonus',
        },
      ],
      createdAt: new Date().toISOString(),
    };

    this._users = [...this._users, newUser];
    this.storage.set(STORAGE_KEY_USERS, this._users);
    this._currentUser.set(newUser);

    return { success: true };
  }

  logout(): void {
    this._currentUser.set(null);
  }

  // ── User Mutation Helpers (called by GiftPointsService, OrderService) ─────

  /**
   * Updates the currently logged-in user.
   * Persists changes to both the session and the users array.
   */
  updateCurrentUser(updater: (user: User) => User): void {
    const user = this._currentUser();
    if (!user) return;

    const updated = updater(user);
    this._currentUser.set(updated);

    // Sync back to users array
    this._users = this._users.map(u => u.id === updated.id ? updated : u);
    this.storage.set(STORAGE_KEY_USERS, this._users);
  }

  /** Save a delivery address against the current user */
  saveAddress(address: DeliveryAddress): void {
    this.updateCurrentUser(u => ({ ...u, savedAddress: address }));
  }

  /** Append a points transaction to the current user's history */
  appendPointsTransaction(tx: PointsTransaction): void {
    this.updateCurrentUser(u => ({
      ...u,
      pointsHistory: [...u.pointsHistory, tx],
    }));
  }
}
