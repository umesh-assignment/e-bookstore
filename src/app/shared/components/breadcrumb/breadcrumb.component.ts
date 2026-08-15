import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface Breadcrumb {
  label: string;
  path?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <ol class="breadcrumb__list" role="list">
        @for (crumb of crumbs(); track crumb.label; let last = $last) {
          <li class="breadcrumb__item">
            @if (!last && crumb.path) {
              <a class="breadcrumb__link" [routerLink]="crumb.path">{{ crumb.label }}</a>
              <span class="breadcrumb__sep" aria-hidden="true">/</span>
            } @else {
              <span class="breadcrumb__current" aria-current="page">{{ crumb.label }}</span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent {
  crumbs = input.required<Breadcrumb[]>();
}
