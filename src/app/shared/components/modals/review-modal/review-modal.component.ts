import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-review-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div 
      *ngIf="isOpen" 
      class="fixed inset-0 z-50 overflow-y-auto"
      (click)="onBackdropClick($event)"
    >
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
      
      <!-- Modal Container -->
      <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div 
          class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ title || 'Write a Review' }}
            </h3>
            <button
              type="button"
              class="text-gray-400 hover:text-gray-600 transition-colors"
              (click)="onCancel()"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <form [formGroup]="reviewForm" (ngSubmit)="onSubmit()">
            <!-- Product Info (if provided) -->
            <div *ngIf="productName" class="mb-4 p-3 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-600">Reviewing:</p>
              <p class="font-medium text-gray-900">{{ productName }}</p>
            </div>

            <!-- Rating -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Rating *
              </label>
              <div class="flex items-center space-x-1">
                <button
                  *ngFor="let star of [1,2,3,4,5]; let i = index"
                  type="button"
                  class="p-1 transition-colors"
                  (click)="setRating(star)"
                  [class.text-yellow-400]="star <= selectedRating"
                  [class.text-gray-300]="star > selectedRating"
                >
                  <svg class="w-8 h-8 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </button>
              </div>
              <div *ngIf="reviewForm.get('rating')?.invalid && reviewForm.get('rating')?.touched" class="mt-1 text-sm text-red-600">
                Please select a rating
              </div>
            </div>

            <!-- Title -->
            <div class="mb-4">
              <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
                Review Title *
              </label>
              <input
                type="text"
                id="title"
                formControlName="title"
                placeholder="Summarize your experience"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
              <div *ngIf="reviewForm.get('title')?.invalid && reviewForm.get('title')?.touched" class="mt-1 text-sm text-red-600">
                Please enter a review title
              </div>
            </div>

            <!-- Comment -->
            <div class="mb-6">
              <label for="comment" class="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                id="comment"
                formControlName="comment"
                rows="4"
                placeholder="Tell others about your experience with this product..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              ></textarea>
              <p class="mt-1 text-xs text-gray-500">
                {{ reviewForm.get('comment')?.value?.length || 0 }}/500 characters
              </p>
            </div>

            <!-- Actions -->
            <div class="flex space-x-3">
              <button
                type="button"
                class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                (click)="onCancel()"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="reviewForm.invalid || isSubmitting"
                class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <span *ngIf="!isSubmitting">Submit Review</span>
                <span *ngIf="isSubmitting" class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
    styles: [`
    :host {
      display: block;
    }
  `]
})
export class ReviewModalComponent implements OnInit {
    @Input() isOpen: boolean = false;
    @Input() title?: string;
    @Input() productName?: string;
    @Input() productId?: string;

    @Output() submitted = new EventEmitter<{
        rating: number;
        title: string;
        comment: string;
        productId: string;
    }>();
    @Output() cancelled = new EventEmitter<void>();

    reviewForm!: FormGroup;
    selectedRating = 0;
    isSubmitting = false;

    constructor(private fb: FormBuilder) { }

    ngOnInit(): void {
        this.initializeForm();
    }

    private initializeForm(): void {
        this.reviewForm = this.fb.group({
            rating: [0, [Validators.required, Validators.min(1)]],
            title: ['', [Validators.required, Validators.maxLength(100)]],
            comment: ['', [Validators.maxLength(500)]]
        });
    }

    setRating(rating: number): void {
        this.selectedRating = rating;
        this.reviewForm.patchValue({ rating });
    }

    onSubmit(): void {
        if (this.reviewForm.valid && this.productId) {
            this.isSubmitting = true;

            const reviewData = {
                rating: this.selectedRating,
                title: this.reviewForm.value.title,
                comment: this.reviewForm.value.comment,
                productId: this.productId
            };

            this.submitted.emit(reviewData);
        }
    }

    onCancel(): void {
        this.resetForm();
        this.cancelled.emit();
    }

    onBackdropClick(event: Event): void {
        if (event.target === event.currentTarget) {
            this.onCancel();
        }
    }

    private resetForm(): void {
        this.reviewForm.reset();
        this.selectedRating = 0;
        this.isSubmitting = false;
    }

    // Called from parent to reset form state after successful submission
    resetSubmissionState(): void {
        this.isSubmitting = false;
        this.resetForm();
    }
}
