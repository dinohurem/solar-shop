import { Component, Input, Output, EventEmitter, inject, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { SupabaseService } from '../../../../services/supabase.service';
import { Review, ReviewStatus } from '../../../models/review.model';
import { TranslatePipe } from '../../../pipes/translate.pipe';

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image_url?: string;
  quantity: number;
  unit_price: number;
  hasReview: boolean;
}

interface UserOrder {
  id: string;
  order_number: string;
  order_date: string;
  status: string;
  items: OrderItem[];
}

@Component({
  selector: 'app-write-review-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
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
          class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6 max-h-[90vh] overflow-y-auto"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-gray-200 pb-4">
            <h3 class="text-lg font-semibold leading-6 text-gray-900" id="modal-title">
               {{ 'reviews.writeReview' | translate }}
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
            <!-- Order Selection (if not preselected) -->
            <div *ngIf="!preselectedOrderId && userOrders.length > 0" class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-3">{{ 'reviews.selectOrder' | translate }} *</label>
              <select 
                formControlName="selectedOrderId"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                (change)="onOrderSelected($event)"
              >
                <option value="">{{ 'reviews.selectOrderPlaceholder' | translate }}</option>
                <option *ngFor="let order of userOrders" [value]="order.id">
                  {{ 'reviews.orderNumber' | translate }}: {{ order.order_number }} - {{ order.order_date | date:'MMM d, yyyy' }}
                </option>
              </select>
              <div *ngIf="reviewForm.get('selectedOrderId')?.invalid && reviewForm.get('selectedOrderId')?.touched" class="mt-1 text-sm text-red-600">
                {{ 'reviews.pleaseSelectOrder' | translate }}
              </div>
            </div>

            <!-- Order Item Selection -->
            <div *ngIf="selectedOrder && selectedOrder.items.length > 0" class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-3">{{ 'reviews.selectProducts' | translate }} *</label>
              
              <!-- Select All Products Checkbox -->
              <div class="mb-4">
                <label class="flex items-center">
                  <input 
                    type="checkbox" 
                    [checked]="allProductsSelected"
                    (change)="toggleAllProducts($event)"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  >
                  <span class="ml-2 text-sm text-gray-700">{{ 'reviews.addSameReviewForAllProducts' | translate }}</span>
                </label>
              </div>

              <!-- Order Items List -->
              <div class="space-y-3">
                <div 
                  *ngFor="let item of selectedOrder.items; let i = index" 
                  class="flex items-center p-3 border border-gray-200 rounded-lg"
                  [class.bg-gray-50]="item.hasReview"
                >
                  <input 
                    type="checkbox" 
                    [value]="item.id"
                    [checked]="selectedOrderItemIds.includes(item.id)"
                    (change)="toggleOrderItem(item.id, $event)"
                    [disabled]="item.hasReview"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  >
                  <div class="ml-3 flex-1">
                    <div class="flex items-center">
                      <img 
                        *ngIf="item.product_image_url" 
                        [src]="item.product_image_url" 
                        [alt]="item.product_name"
                        class="w-12 h-12 object-cover rounded mr-3"
                      >
                      <div class="flex-1">
                        <h4 class="font-medium text-gray-900">{{ item.product_name }}</h4>
                        <p class="text-sm text-gray-500">{{ 'reviews.quantity' | translate }}: {{ item.quantity }}</p>
                      </div>
                      <div *ngIf="item.hasReview" class="ml-2">
                        <span class="inline-flex items-center px-2.5 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                          </svg>
                          {{ 'reviews.reviewed' | translate }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div *ngIf="selectedOrderItemIds.length === 0 && reviewForm.get('selectedOrderItemIds')?.touched" class="mt-1 text-sm text-red-600">
                {{ 'reviews.pleaseSelectProducts' | translate }}
              </div>
            </div>

            <!-- Star Rating -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-3">{{ 'reviews.rating' | translate }} *</label>
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
                {{ 'reviews.pleaseSelectRating' | translate }}
              </div>
            </div>

            <!-- Title -->
            <div class="mb-6">
              <label for="title" class="block text-sm font-medium text-gray-700 mb-2">{{ 'reviews.writeReview' | translate }} *</label>
              <input
                type="text"
                id="title"
                formControlName="title"
                placeholder="{{ 'reviews.summarizeReview' | translate }}"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
              <div *ngIf="reviewForm.get('title')?.invalid && reviewForm.get('title')?.touched" class="mt-1 text-sm text-red-600">
                {{ 'reviews.titleRequired' | translate }}
              </div>
            </div>

            <!-- Comment -->
            <div class="mb-6">
              <label for="comment" class="block text-sm font-medium text-gray-700 mb-2">{{ 'reviews.yourReview' | translate }} *</label>
              <textarea
                id="comment"
                formControlName="comment"
                rows="4"
                placeholder="{{ 'reviews.tellOthersAboutExperience' | translate }}"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              ></textarea>
              <div *ngIf="reviewForm.get('comment')?.invalid && reviewForm.get('comment')?.touched" class="mt-1 text-sm text-red-600">
                {{ 'reviews.reviewCommentRequired' | translate }}
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                (click)="onCancel()"
              >
                {{ 'common.cancel' | translate }}
              </button>
              <button
                type="submit"
                [disabled]="reviewForm.invalid || isSubmitting"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span *ngIf="!isSubmitting">{{ 'reviews.submitReview' | translate }}</span>
                <span *ngIf="isSubmitting" class="flex items-center">
                  <svg class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {{ 'common.submitting' | translate }}
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
export class WriteReviewModalComponent implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() productId!: string;
  @Input() userId!: string;
  @Input() preselectedOrderId?: string;

  @Output() submitted = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private supabaseService = inject(SupabaseService);

  reviewForm: FormGroup;
  stars = Array(5).fill(0);
  rating = 0;
  hoverRating = 0;
  isSubmitting = false;

  userOrders: UserOrder[] = [];
  selectedOrder: UserOrder | null = null;
  selectedOrderItemIds: string[] = [];
  allProductsSelected = false;

  constructor() {
    this.reviewForm = this.fb.group({
      selectedOrderId: ['', Validators.required],
      selectedOrderItemIds: [[], Validators.required],
      rating: [0, [Validators.required, Validators.min(1)]],
      title: ['', [Validators.required, Validators.maxLength(200)]],
      comment: ['', [Validators.required, Validators.maxLength(1000)]]
    });
  }

  ngOnInit(): void {
    // Don't load orders here - wait for isOpen to be true
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Load user orders when modal opens
    if (changes['isOpen'] && this.isOpen && this.userId) {
      console.log('Modal opened, loading user orders for userId:', this.userId);
      this.loadUserOrders();
    }
  }

  async loadUserOrders(): Promise<void> {
    try {
      console.log('Loading user orders...'); // Debug log
      // Load user's delivered orders with order items
      const { data: orders, error } = await this.supabaseService.client
        .from('orders')
        .select(`
          id,
          order_number,
          order_date,
          status,
          order_items(
            id,
            product_id,
            product_name,
            product_image_url,
            quantity,
            unit_price
          )
        `)
        .eq('user_id', this.userId)
        .eq('status', 'delivered')
        .order('order_date', { ascending: false });

      if (error) {
        console.error('Error loading orders:', error);
        return;
      }

      console.log('Orders loaded:', orders?.length || 0); // Debug log

      // Check which order items already have reviews
      const { data: existingReviews } = await this.supabaseService.client
        .from('reviews')
        .select('order_item_id')
        .eq('user_id', this.userId);

      this.userOrders = (orders || []).map((order: any) => ({
        id: order.id,
        order_number: order.order_number,
        order_date: order.order_date,
        status: order.status,
        items: order.order_items.map((item: any) => ({
          ...item,
          hasReview: existingReviews?.some((review: any) =>
            review.order_item_id === item.id
          ) || false
        }))
      }));

      console.log('User orders processed:', this.userOrders.length); // Debug log

      // If preselected order, set it
      if (this.preselectedOrderId) {
        this.selectedOrder = this.userOrders.find(order => order.id === this.preselectedOrderId) || null;
        if (this.selectedOrder) {
          this.reviewForm.patchValue({ selectedOrderId: this.preselectedOrderId });
          this.onOrderSelected({ target: { value: this.preselectedOrderId } });
        }
      }
    } catch (error) {
      console.error('Error loading user orders:', error);
    }
  }

  onOrderSelected(event: any): void {
    const orderId = event.target.value;
    this.selectedOrder = this.userOrders.find(order => order.id === orderId) || null;
    this.selectedOrderItemIds = [];
    this.allProductsSelected = false;

    if (this.selectedOrder) {
      // Auto-select order items that don't have reviews yet
      const availableOrderItems = this.selectedOrder.items
        .filter(item => !item.hasReview)
        .map(item => item.id);

      this.selectedOrderItemIds = availableOrderItems;
      this.allProductsSelected = availableOrderItems.length > 0;

      this.reviewForm.patchValue({ selectedOrderItemIds: this.selectedOrderItemIds });
    }
  }

  toggleOrderItem(orderItemId: string, event: any): void {
    if (event.target.checked) {
      this.selectedOrderItemIds.push(orderItemId);
    } else {
      this.selectedOrderItemIds = this.selectedOrderItemIds.filter(id => id !== orderItemId);
    }
    this.allProductsSelected = this.selectedOrderItemIds.length === this.selectedOrder?.items.filter(item => !item.hasReview).length;
    this.reviewForm.patchValue({ selectedOrderItemIds: this.selectedOrderItemIds });
  }

  toggleAllProducts(event: any): void {
    this.allProductsSelected = event.target.checked;
    if (this.allProductsSelected && this.selectedOrder) {
      this.selectedOrderItemIds = this.selectedOrder.items
        .filter(item => !item.hasReview)
        .map(item => item.id);
    } else {
      this.selectedOrderItemIds = [];
    }
    this.reviewForm.patchValue({ selectedOrderItemIds: this.selectedOrderItemIds });
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
      const orderId = this.preselectedOrderId || formValue.selectedOrderId;
      const orderItemIds = formValue.selectedOrderItemIds;

      const reviews = [];

      for (const orderItemId of orderItemIds) {
        // Get the order item to get the product_id
        const { data: orderItem } = await this.supabaseService.client
          .from('order_items')
          .select('product_id')
          .eq('id', orderItemId)
          .single();

        if (!orderItem) continue;

        const reviewData = {
          user_id: this.userId,
          product_id: orderItem.product_id,
          order_id: orderId,
          order_item_id: orderItemId,
          rating: formValue.rating,
          title: formValue.title,
          comment: formValue.comment,
          is_verified_purchase: true,
          is_approved: false,
          status: 'pending' as ReviewStatus,
          helpful_count: 0,
          reported_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const createdReview = await this.supabaseService.createRecord('reviews', reviewData);
        if (createdReview) {
          reviews.push(createdReview);
        }
      }

      if (reviews.length > 0) {
        this.submitted.emit({
          reviews,
          orderId,
          orderItemIds,
          rating: formValue.rating,
          title: formValue.title,
          comment: formValue.comment
        });
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
    this.selectedOrder = null;
    this.selectedOrderItemIds = [];
    this.allProductsSelected = false;
  }
}
