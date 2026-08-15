import { Component } from '@angular/core';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [],
  template: `
    <main class="page" id="main-content">
      <div class="container">
        <h1>Book Details</h1>
        <p style="color: var(--color-muted); margin-top: 8px;">
          Book detail implemented in Phase 4.
        </p>
      </div>
    </main>
  `
})
export class BookDetailComponent {}
