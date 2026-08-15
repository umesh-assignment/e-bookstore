import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './register.component.html',
  styleUrl:    './register.component.scss',
})
export class RegisterComponent {
  private readonly authSvc = inject(AuthService);
  private readonly router  = inject(Router);

  // Form fields
  firstName = '';
  lastName  = '';
  email     = '';
  password  = '';
  confirmPassword = '';

  // UI state
  readonly isLoading     = signal(false);
  readonly error         = signal('');
  readonly showPassword  = signal(false);

  togglePassword(): void { this.showPassword.update(v => !v); }

  get passwordStrength(): 'weak' | 'medium' | 'strong' | '' {
    const p = this.password;
    if (!p) return '';
    const hasUpper   = /[A-Z]/.test(p);
    const hasLower   = /[a-z]/.test(p);
    const hasDigit   = /\d/.test(p);
    const hasSpecial = /[^A-Za-z0-9]/.test(p);
    const score = [hasUpper, hasLower, hasDigit, hasSpecial, p.length >= 8].filter(Boolean).length;
    if (score <= 2) return 'weak';
    if (score <= 3) return 'medium';
    return 'strong';
  }

  onSubmit(): void {
    this.error.set('');

    if (!this.firstName.trim() || !this.lastName.trim()) {
      this.error.set('Please enter your full name.');
      return;
    }
    if (!this.email.trim()) {
      this.error.set('Please enter a valid email address.');
      return;
    }
    if (this.password.length < 8) {
      this.error.set('Password must be at least 8 characters.');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error.set('Passwords do not match.');
      return;
    }

    this.isLoading.set(true);
    setTimeout(() => {
      const result = this.authSvc.register(
        this.firstName.trim(),
        this.lastName.trim(),
        this.email.trim(),
        this.password
      );
      this.isLoading.set(false);
      if (result.success) {
        this.router.navigate(['/']);
      } else {
        this.error.set(result.error ?? 'Registration failed.');
      }
    }, 300);
  }
}
