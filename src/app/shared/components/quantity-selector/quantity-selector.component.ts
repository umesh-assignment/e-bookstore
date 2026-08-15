import { Component, input, output, signal, OnInit } from '@angular/core';

@Component({
  selector: 'app-quantity-selector',
  standalone: true,
  template: `
    <div class="qty" role="group" [attr.aria-label]="'Quantity for ' + (itemLabel() || 'item')">
      <button
        class="qty__btn"
        type="button"
        [disabled]="currentValue() <= min()"
        (click)="decrement()"
        [attr.aria-label]="'Decrease quantity'"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>

      <output class="qty__value" [attr.aria-live]="'polite'">{{ currentValue() }}</output>

      <button
        class="qty__btn"
        type="button"
        [disabled]="currentValue() >= max()"
        (click)="increment()"
        [attr.aria-label]="'Increase quantity'"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>
  `,
  styleUrl: './quantity-selector.component.scss'
})
export class QuantitySelectorComponent implements OnInit {
  value     = input(1);
  min       = input(1);
  max       = input(10);
  itemLabel = input('');

  changed = output<number>();

  protected currentValue = signal(1);

  ngOnInit(): void {
    this.currentValue.set(this.value());
  }

  protected increment(): void {
    if (this.currentValue() < this.max()) {
      const next = this.currentValue() + 1;
      this.currentValue.set(next);
      this.changed.emit(next);
    }
  }

  protected decrement(): void {
    if (this.currentValue() > this.min()) {
      const next = this.currentValue() - 1;
      this.currentValue.set(next);
      this.changed.emit(next);
    }
  }
}
