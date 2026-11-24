import { Component, input, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormValueControl } from '@angular/forms/signals';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="star-rating-container"
      [class.disabled]="disabled()"
      [class.readonly]="readonly()"
      [class.invalid]="invalid()"
      (blur)="handleBlur()"
      tabindex="-1"
    >
      <div class="stars-row" role="radiogroup" aria-label="Skill Rating">
        @for (star of stars; track star) {
          <button
            type="button"
            class="star-button"
            [class.filled]="star <= (hoverRating() || value())"
            [class.hovered]="hoverRating() > 0 && star <= hoverRating()"
            [disabled]="disabled() || readonly()"
            [attr.aria-label]="star + ' of 5 stars'"
            [attr.aria-checked]="value() === star"
            role="radio"
            (mouseenter)="onHover(star)"
            (mouseleave)="onHoverLeave()"
            (click)="selectRating(star)"
            (keydown)="handleKeyDown($event, star)"
          >
            <svg
              viewBox="0 0 24 24"
              class="star-icon"
              fill="currentColor"
              stroke="currentColor"
              stroke-width="1"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        }
      </div>

      <span class="rating-text">
        @if (value() > 0) {
          <span class="rating-value">{{ value() }}</span> / 5
        } @else {
          <span class="unrated-hint">Select rating</span>
        }
      </span>
    </div>
  `,
  styles: [`
    .star-rating-container {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      user-select: none;
    }
    .stars-row {
      display: inline-flex;
      align-items: center;
      gap: 2px;
    }
    .star-button {
      background: transparent;
      border: none;
      padding: 2px;
      margin: 0;
      cursor: pointer;
      color: #d1d5db;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: color 0.15s ease, transform 0.1s ease;
      outline: none;
    }
    .star-button:focus-visible {
      outline: 2px solid #3b82f6;
      outline-offset: 1px;
    }
    .star-button:not(:disabled):hover {
      transform: scale(1.15);
    }
    .star-button.filled {
      color: #f59e0b;
    }
    .star-button.hovered {
      color: #fbbf24;
    }
    .star-button:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
    .star-icon {
      width: 22px;
      height: 22px;
    }
    .rating-text {
      font-size: 0.8125rem;
      font-weight: 500;
      color: #6b7280;
      min-width: 80px;
    }
    .rating-value {
      font-weight: 700;
      color: #1f2937;
    }
    .unrated-hint {
      color: #9ca3af;
      font-style: italic;
    }
    .star-rating-container.invalid .unrated-hint {
      color: #ef4444;
    }
  `],
})
export class StarRatingComponent implements FormValueControl<number> {
  // Required model signal for FormValueControl
  readonly value = model<number>(0);

  // Optional signals synchronized by FormField
  readonly touched = model<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly invalid = input<boolean>(false);

  protected readonly stars = [1, 2, 3, 4, 5];
  protected readonly hoverRating = signal<number>(0);

  selectRating(rating: number): void {
    if (this.disabled() || this.readonly()) return;
    this.value.set(rating);
    this.touched.set(true);
  }

  onHover(star: number): void {
    if (this.disabled() || this.readonly()) return;
    this.hoverRating.set(star);
  }

  onHoverLeave(): void {
    this.hoverRating.set(0);
  }

  handleBlur(): void {
    this.touched.set(true);
  }

  handleKeyDown(event: KeyboardEvent, star: number): void {
    if (this.disabled() || this.readonly()) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      const next = Math.min(5, star + 1);
      this.selectRating(next);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      const prev = Math.max(1, star - 1);
      this.selectRating(prev);
    }
  }
}
