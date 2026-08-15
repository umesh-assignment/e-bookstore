import { Component, input } from '@angular/core';

export type BadgeVariant = 'success' | 'danger' | 'info' | 'warning' | 'muted' | 'processing';

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `
    <span
      class="badge"
      [class]="'badge--' + variant()"
      [class.badge--pill]="pill()"
    >
      {{ label() }}
    </span>
  `,
  styleUrl: './badge.component.scss'
})
export class BadgeComponent {
  label   = input.required<string>();
  variant = input<BadgeVariant>('info');
  /** Fully rounded pill shape */
  pill    = input(false);
}
