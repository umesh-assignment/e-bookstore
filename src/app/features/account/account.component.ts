import { Component } from '@angular/core';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [],
  template: `
    <main class="page" id="main-content">
      <div class="container">
        <h1>My Account</h1>
        <p style="color: var(--color-muted); margin-top: 8px;">
          Account page implemented in Phase 7.
        </p>
      </div>
    </main>
  `
})
export class AccountComponent {}
