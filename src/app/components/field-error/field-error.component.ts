import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidationError } from '@angular/forms/signals';

@Component({
  selector: 'app-field-error',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if ((touched() || submitted()) && errors() && errors()!.length > 0) {
      <div class="field-errors-container" role="alert">
        @for (error of errors()!; track error.kind) {
          @if (error.message) {
            <span class="error-text">
              <svg class="error-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ error.message }}
            </span>
          }
        }
      </div>
    }
  `,
  styles: [`
    .field-errors-container {
      display: flex;
      flex-direction: column;
      gap: 3px;
      margin-top: 5px;
    }
    .error-text {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.8125rem;
      color: #dc2626;
      font-weight: 500;
      line-height: 1.25;
    }
    .error-icon {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
    }
  `],
})
export class FieldErrorComponent {
  readonly errors = input<readonly ValidationError[] | null | undefined>([]);
  readonly touched = input<boolean>(false);
  readonly submitted = input<boolean>(false);
}
