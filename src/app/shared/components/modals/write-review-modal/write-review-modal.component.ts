import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SupabaseService } from '../../../../services/supabase.service';
import { Review, ReviewStatus } from '../../../models/review.model';

@Component({
    selector: 'app-write-review-modal',
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
          class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-gray-200 pb-4">
            <h3 class="text-lg font-semibold leading-6 text-gray-900" id="modal-title">
              Write a Review
            </h3>
            <button
              type="button"
              class="text-gray-400 hover:text-gray-600"
              (click)="onCancel()"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Form -->
          <form [formGroup]="reviewForm" (ngSubmit)="onSubmit()" class="mt-6">
            <!-- Star Rating -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-3">Rating *</label>
              <div class="flex items-center space-x-1">
                <button
                  *ngFor="let star of stars; let i = index"
                  type="button"
                  class="focus:outline-none transition-colors duration-200"
                  (click)="setRating(i + 1)"
                  (mouseenter)="setHoverRating(i + 1)"
                  (mouseleave)="setHoverRating(0)"
                >
                  <svg 
                    class="w-8 h-8 transition-colors duration-200"
                    [class.text-yellow-400]="i < (hoverRating || rating)"
                    [class.text-gray-300]="i >= (hoverRating || rating)"
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </button>
              </div>
              <div *ngIf="reviewForm.get('rating')?.invalid && reviewForm.get('rating')?.touched" class="mt-1 text-sm text-red-600">
                Please select a rating
              </div>
            </div>

            <!-- Title -->
            <div class="mb-6">
              <label for="title" class="block text-sm font-medium text-gray-700 mb-2">Review Title *</label>
              <input
                type="text"
                id="title"
                formControlName="title"
                placeholder="Summarize your review in one line"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
              <div *ngIf="reviewForm.get('title')?.invalid && reviewForm.get('title')?.touched" class="mt-1 text-sm text-red-600">
                Title is required
              </div>
            </div>

            <!-- Comment -->
            <div class="mb-6">
              <label for="comment" class="block text-sm font-medium text-gray-700 mb-2">Your Review *</label>
              <textarea
                id="comment"
                formControlName="comment"
                rows="4"
                placeholder="Tell others about your experience with this product"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              ></textarea>
              <div *ngIf="reviewForm.get('comment')?.invalid && reviewForm.get('comment')?.touched" class="mt-1 text-sm text-red-600">
                Review comment is required
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                (click)="onCancel()"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="reviewForm.invalid || isSubmitting"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span *ngIf="!isSubmitting">Submit Review</span>
                <span *ngIf="isSubmitting" class="flex items-center">
                  <svg class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
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
export class WriteReviewModalComponent {
    @Input() isOpen: boolean = false;
    @Input() productId!: string;
    @Input() userId!: string;
    @Input() orderId?: string;

    @Output() submitted = new EventEmitter<any>();
    @Output() cancelled = new EventEmitter<void>();

    private fb = inject(FormBuilder);
    private supabaseService = inject(SupabaseService);

    reviewForm: FormGroup;
    stars = Array(5).fill(0);
    rating = 0;
    hoverRating = 0;
    isSubmitting = false;

    constructor() {
        this.reviewForm = this.fb.group({
            rating: [0, [Validators.required, Validators.min(1)]],
            title: ['', [Validators.required, Validators.maxLength(200)]],
            comment: ['', [Validators.required, Validators.maxLength(1000)]]
        });
    }

    onBackdropClick(event: Event): void {
        if (event.target === event.currentTarget) {
            this.onCancel();
        }
    }

    setRating(rating: number): void {
        this.rating = rating;
        this.reviewForm.patchValue({ rating });
    }

    setHoverRating(rating: number): void {
        this.hoverRating = rating;
    }

    async onSubmit(): Promise<void> {
        if (this.reviewForm.invalid || this.isSubmitting) {
            this.reviewForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;

        try {
            const formValue = this.reviewForm.value;

            const reviewData = {
                user_id: this.userId,
                product_id: this.productId,
                order_id: this.orderId,
                rating: formValue.rating,
                title: formValue.title,
                comment: formValue.comment,
                is_verified_purchase: !!this.orderId,
                is_approved: false,
                status: 'pending' as ReviewStatus,
                helpful_count: 0,
                reported_count: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const createdReview = await this.supabaseService.createRecord('reviews', reviewData);

            if (createdReview) {
                this.submitted.emit(createdReview);
                this.resetForm();
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            // You might want to show an error message here
        } finally {
            this.isSubmitting = false;
        }
    }

    onCancel(): void {
        this.resetForm();
        this.cancelled.emit();
    }

    private resetForm(): void {
        this.reviewForm.reset();
        this.rating = 0;
        this.hoverRating = 0;
        this.isSubmitting = false;
    }
}
