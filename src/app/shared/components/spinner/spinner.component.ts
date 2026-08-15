import { Component, input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    @if (overlay()) {
      <div class="spinner-overlay" role="status" [attr.aria-label]="label()">
        <div class="spinner-ring" aria-hidden="true">
          <div></div><div></div><div></div><div></div>
        </div>
        @if (label()) {
          <p class="spinner-overlay__label">{{ label() }}</p>
        }
      </div>
    } @else {
      <span
        class="spinner-ring"
        [class.spinner-ring--sm]="size() === 'sm'"
        [class.spinner-ring--lg]="size() === 'lg'"
        role="status"
        [attr.aria-label]="label()"
      >
        <span aria-hidden="true"><span></span><span></span><span></span><span></span></span>
        <span class="sr-only">{{ label() }}</span>
      </span>
    }
  `,
  styleUrl: './spinner.component.scss'
})
export class SpinnerComponent {
  /** When true, renders a full-viewport overlay with a centred spinner */
  overlay = input(false);
  /** 'sm' | 'md' (default) | 'lg' */
  size    = input<'sm' | 'md' | 'lg'>('md');
  /** Accessible label announced to screen readers */
  label   = input('Loading…');
}
