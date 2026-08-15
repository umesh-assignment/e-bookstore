import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="page" id="main-content">
      <div class="container">
        <h1>Login</h1>
        <p style="color: var(--color-muted); margin-top: 8px;">
          Login form implemented in Phase 3.
        </p>
        <a routerLink="/register" class="btn btn--secondary" style="margin-top: 16px;">
          Create Account
        </a>
      </div>
    </main>
  `
})
export class LoginComponent {}
