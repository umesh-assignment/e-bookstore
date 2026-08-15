import { Component } from '@angular/core';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [],
  template: `
    <main class="page" id="main-content">
      <div class="container">
        <h1>Browse Books</h1>
        <p style="color: var(--color-muted); margin-top: 8px;">
          Catalogue implemented in Phase 4.
        </p>
      </div>
    </main>
  `
})
export class CatalogueComponent {}
