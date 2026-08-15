import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './login.component.html',
  styleUrl:    './login.component.scss',
})
export class LoginComponent {
  private readonly authSvc = inject(AuthService);
  private readonly router  = inject(Router);
  private readonly route   = inject(ActivatedRoute);

  // Form fields
  email    = '';
  password = '';

  // UI state
  readonly isLoading   = signal(false);
  readonly error       = signal('');
  readonly showPassword = signal(false);

  get returnUrl(): string {
    return this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
  }

  togglePassword(): void { this.showPassword.update(v => !v); }

  onSubmit(): void {
    this.error.set('');
    if (!this.email.trim() || !this.password) {
      this.error.set('Please enter your email and password.');
      return;
    }

    this.isLoading.set(true);
    // Simulate async (auth is synchronous, but UX needs a tiny delay)
    setTimeout(() => {
      const result = this.authSvc.login(this.email.trim(), this.password);
      this.isLoading.set(false);
      if (result.success) {
        this.router.navigateByUrl(this.returnUrl);
      } else {
        this.error.set(result.error ?? 'Login failed.');
      }
    }, 300);
  }
}
