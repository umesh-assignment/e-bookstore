import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  inject,
  input,
  output,
} from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [A11yModule],
  template: `
    @if (open()) {
      <!-- Backdrop (aria-hidden: real dialog is the panel) -->
      <div class="modal-backdrop" aria-hidden="true"></div>

      <!-- Panel — CDK focus trap keeps Tab inside the dialog -->
      <div class="modal-panel-wrap" aria-hidden="true" (click)="onWrapClick($event)">
      </div>
      <div class="modal-panel-wrap modal-panel-wrap--content">
        <div
          class="modal-panel"
          #panelRef
          cdkTrapFocus
          cdkTrapFocusAutoCapture
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="title()"
          (keydown)="onPanelKeydown($event)"
        >
          <!-- Header -->
          <div class="modal-panel__header">
            <h2 class="modal-panel__title" id="modal-title">{{ title() }}</h2>
            <button
              class="btn-icon modal-panel__close"
              type="button"
              (click)="dismiss()"
              aria-label="Close dialog"
              #closeBtnRef
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Body (projected content) -->
          <div class="modal-panel__body">
            <ng-content />
          </div>

          <!-- Footer actions -->
          @if (confirmLabel() || cancelLabel()) {
            <div class="modal-panel__footer">
              @if (cancelLabel()) {
                <button class="btn btn--secondary" type="button" (click)="dismiss()">
                  {{ cancelLabel() }}
                </button>
              }
              @if (confirmLabel()) {
                <button
                  class="btn"
                  [class]="destructive() ? 'btn--danger' : 'btn--primary'"
                  type="button"
                  (click)="confirm()"
                >
                  {{ confirmLabel() }}
                </button>
              }
            </div>
          }
        </div>
      </div>
    }
  `,
  styleUrl: './modal.component.scss'
})
export class ModalComponent implements OnInit, OnDestroy {
  open         = input(false);
  title        = input('');
  confirmLabel = input('');
  cancelLabel  = input('Cancel');
  destructive  = input(false);

  confirmed  = output<void>();
  dismissed  = output<void>();

  /** Reference to the element that triggered the modal — focus returns here on close */
  triggerEl: HTMLElement | null = null;

  private readonly hostEl = inject(ElementRef<HTMLElement>);

  ngOnInit(): void {
    // Store the currently-focused element so we can restore focus on close
    this.triggerEl = document.activeElement as HTMLElement;
  }

  ngOnDestroy(): void {
    this.restoreFocus();
  }

  protected onWrapClick(event: MouseEvent): void {
    // The aria-hidden wrap behind the panel handles backdrop-click-to-dismiss
    if ((event.target as HTMLElement).classList.contains('modal-panel-wrap')) {
      this.dismiss();
    }
  }

  protected onPanelKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.dismiss();
    }
  }

  protected confirm(): void {
    this.confirmed.emit();
  }

  protected dismiss(): void {
    this.dismissed.emit();
    this.restoreFocus();
  }

  private restoreFocus(): void {
    this.triggerEl?.focus();
  }
}
