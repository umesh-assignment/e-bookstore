import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  template: `
    <div
      class="star-rating"
      [class.star-rating--sm]="size() === 'sm'"
      [class.star-rating--lg]="size() === 'lg'"
      role="img"
      [attr.aria-label]="ariaLabel()"
    >
      @for (star of stars(); track star.index) {
        <svg
          class="star"
          [class.star--full]="star.type === 'full'"
          [class.star--half]="star.type === 'half'"
          [class.star--empty]="star.type === 'empty'"
          viewBox="0 0 24 24"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
        >
          @if (star.type === 'half') {
            <defs>
              <linearGradient [attr.id]="'half-' + star.index">
                <stop offset="50%" stop-color="currentColor"/>
                <stop offset="50%" stop-color="transparent" stop-opacity="1"/>
              </linearGradient>
            </defs>
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              [attr.fill]="'url(#half-' + star.index + ')'"
              stroke="currentColor"
              stroke-width="1.5"
            />
          } @else {
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              [class.star__path--filled]="star.type === 'full'"
            />
          }
        </svg>
      }

      @if (showCount() && reviewCount() !== null) {
        <span class="star-rating__count">({{ reviewCount() }})</span>
      }
    </div>
  `,
  styleUrl: './star-rating.component.scss'
})
export class StarRatingComponent {
  /** Rating value 0–5, one decimal */
  rating      = input.required<number>();
  reviewCount = input<number | null>(null);
  showCount   = input(true);
  size        = input<'sm' | 'md' | 'lg'>('md');

  protected ariaLabel = computed(() => {
    const base = `Rating: ${this.rating().toFixed(1)} out of 5`;
    const count = this.reviewCount();
    return count !== null ? `${base} (${count} review${count !== 1 ? 's' : ''})` : base;
  });

  protected stars = computed(() => {
    const value = Math.max(0, Math.min(5, this.rating()));
    return Array.from({ length: 5 }, (_, i) => {
      const diff = value - i;
      let type: 'full' | 'half' | 'empty';
      if (diff >= 1)       type = 'full';
      else if (diff >= 0.4) type = 'half';
      else                   type = 'empty';
      return { index: i, type };
    });
  });
}
