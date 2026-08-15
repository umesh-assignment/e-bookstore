import {
  Component,
  inject,
  computed,
  HostListener,
} from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '@core/services/cart.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);

  // ── Signals ───────────────────────────────────────────────────────────────
  readonly totalItems  = this.cartService.totalItems;
  readonly currentUser = this.authService.currentUser;
  readonly isLoggedIn  = this.authService.isLoggedIn;

  readonly userInitial = computed(() => {
    const u = this.currentUser();
    return u ? u.firstName.charAt(0).toUpperCase() : '';
  });

  // ── Local state ───────────────────────────────────────────────────────────
  mobileMenuOpen = false;
  searchOpen     = false;
  searchQuery    = '';
  accountMenuOpen = false;

  // ── Keyboard close ────────────────────────────────────────────────────────
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.mobileMenuOpen  = false;
    this.searchOpen      = false;
    this.accountMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.navbar__account')) {
      this.accountMenuOpen = false;
    }
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  toggleMobileMenu(): void {
    this.mobileMenuOpen  = !this.mobileMenuOpen;
    this.accountMenuOpen = false;
    this.searchOpen      = false;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  toggleSearch(): void {
    this.searchOpen     = !this.searchOpen;
    this.mobileMenuOpen = false;
    if (this.searchOpen) {
      // focus input after render
      setTimeout(() => {
        const el = document.getElementById('navbar-search-input');
        el?.focus();
      }, 50);
    }
  }

  submitSearch(): void {
    const q = this.searchQuery.trim();
    if (q) {
      this.router.navigate(['/catalogue'], { queryParams: { q } });
      this.searchOpen  = false;
      this.searchQuery = '';
      this.mobileMenuOpen = false;
    }
  }

  toggleAccountMenu(): void {
    this.accountMenuOpen = !this.accountMenuOpen;
  }

  logout(): void {
    this.authService.logout();
    this.accountMenuOpen = false;
    this.mobileMenuOpen  = false;
    this.router.navigate(['/']);
  }
}
