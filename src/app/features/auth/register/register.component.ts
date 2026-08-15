import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="page" id="main-content">
      <div class="container">
        <h1>Create Account</h1>
        <p style="color: var(--color-muted); margin-top: 8px;">
          Registration form implemented in Phase 3.
        </p>
        <a routerLink="/login" class="btn btn--ghost" style="margin-top: 16px;">
          Already have an account? Login
        </a>
      </div>
    </main>
  `
})
export class RegisterComponent {}
