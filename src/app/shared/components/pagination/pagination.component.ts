import { Component, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    @if (totalPages() > 1) {
      <nav class="pagination" aria-label="Page navigation">
        <button
          class="pagination__btn"
          type="button"
          [disabled]="currentPage() <= 1"
          (click)="go(currentPage() - 1)"
          aria-label="Previous page"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        @for (page of pages(); track page) {
          @if (page === -1) {
            <span class="pagination__ellipsis" aria-hidden="true">…</span>
          } @else {
            <button
              class="pagination__btn"
              [class.pagination__btn--active]="page === currentPage()"
              type="button"
              (click)="go(page)"
              [attr.aria-label]="'Page ' + page"
              [attr.aria-current]="page === currentPage() ? 'page' : null"
            >{{ page }}</button>
          }
        }

        <button
          class="pagination__btn"
          type="button"
          [disabled]="currentPage() >= totalPages()"
          (click)="go(currentPage() + 1)"
          aria-label="Next page"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </nav>
    }
  `,
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent {
  currentPage = input.required<number>();
  totalPages  = input.required<number>();

  pageChange = output<number>();

  protected pages = computed(() => {
    const total   = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: number[] = [1];
    if (current > 3) pages.push(-1); // ellipsis
    for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
      pages.push(p);
    }
    if (current < total - 2) pages.push(-1); // ellipsis
    pages.push(total);
    return pages;
  });

  protected go(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.pageChange.emit(page);
    }
  }
}
