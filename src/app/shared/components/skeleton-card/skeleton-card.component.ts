import { Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  template: `
    @for (i of items(); track i) {
      <div class="skeleton-card" aria-hidden="true">
        <div class="skeleton-card__image skeleton-pulse"></div>
        <div class="skeleton-card__body">
          <div class="skeleton-card__title skeleton-pulse"></div>
          <div class="skeleton-card__subtitle skeleton-pulse"></div>
          <div class="skeleton-card__row">
            <div class="skeleton-card__price skeleton-pulse"></div>
            <div class="skeleton-card__stars skeleton-pulse"></div>
          </div>
          <div class="skeleton-card__btn skeleton-pulse"></div>
        </div>
      </div>
    }
  `,
  styleUrl: './skeleton-card.component.scss'
})
export class SkeletonCardComponent {
  /** Number of skeleton cards to render */
  count = input(4);

  protected items(): number[] {
    return Array.from({ length: this.count() }, (_, i) => i);
  }
}
