import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { selectB2BCartItems } from '../../../cart/store/b2b-cart.selectors';
import * as B2BCartActions from '../../../cart/store/b2b-cart.actions';
import { B2BCartItem } from '../../../cart/models/b2b-cart.model';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';

@Component({
    selector: 'app-b2b-order-review',
    standalone: true,
    imports: [CommonModule, TranslatePipe],
    template: `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6 font-['Poppins']">{{ 'b2bCheckout.reviewOrder' | translate }}</h2>
      
      <!-- Cart Items -->
      <div class="space-y-6">
        <div 
          *ngFor="let item of cartItems$ | async; trackBy: trackByItemId"
          class="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg"
        >
          <!-- Product Image -->
          <div class="flex-shrink-0">
            <div class="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
              <img 
                *ngIf="getProductImageUrl(item)" 
                [src]="getProductImageUrl(item)" 
                [alt]="item.name"
                class="w-full h-full object-cover rounded-lg"
                (error)="onImageError($event)"
              >
              <div *ngIf="!getProductImageUrl(item)" class="text-gray-400">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Product Details -->
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-semibold text-gray-900 mb-2 font-['Poppins']">{{ item.name }}</h3>
            <p class="text-sm text-gray-600 mb-3 font-['DM_Sans']">SKU: {{ item.sku }} | {{ item.category }}</p>
            
            <!-- Quantity Controls -->
            <div class="flex items-center space-x-3">
              <span class="text-sm text-gray-600 font-['DM_Sans']">{{ 'b2bCheckout.quantity' | translate }}:</span>
              <div class="flex items-center space-x-2">
                <button 
                  (click)="decreaseQuantity(item.id)"
                  class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  [disabled]="item.quantity <= 1"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                  </svg>
                </button>
                <span class="w-8 text-center font-medium font-['DM_Sans']">{{ item.quantity }}</span>
                <button 
                  (click)="increaseQuantity(item.id)"
                  class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                </button>
              </div>
              <button 
                (click)="removeItem(item.id)"
                class="text-red-600 hover:text-red-700 text-sm font-medium font-['DM_Sans'] ml-4"
              >
                {{ 'cart.remove' | translate }}
              </button>
            </div>
          </div>

          <!-- Price -->
          <div class="text-right">
            <div class="text-lg font-bold text-gray-900 font-['DM_Sans']">
              {{ (item.unitPrice * item.quantity) | currency:'EUR':'symbol':'1.2-2' }}
            </div>
            <div class="text-sm text-gray-500 font-['DM_Sans']">
              {{ item.unitPrice | currency:'EUR':'symbol':'1.2-2' }} {{ 'b2bCheckout.each' | translate }}
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div 
        *ngIf="(cartItems$ | async)?.length === 0"
        class="text-center py-12"
      >
        <div class="text-gray-400 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2 font-['Poppins']">{{ 'cart.empty' | translate }}</h3>
        <p class="text-gray-600 font-['DM_Sans']">{{ 'cart.emptyText' | translate }}</p>
      </div>

      <!-- Continue Button -->
      <div class="mt-8 pt-6 border-t border-gray-200">
        <button 
          (click)="continueToShipping()"
          [disabled]="(cartItems$ | async)?.length === 0"
          class="w-full px-6 py-4 bg-solar-600 text-white rounded-lg hover:bg-solar-700 transition-colors font-semibold text-lg font-['DM_Sans'] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ 'b2bCheckout.nextStep' | translate }} {{ 'b2bCheckout.step2' | translate }}
        </button>
      </div>
    </div>
  `,
    styles: [`
    /* Custom font loading */
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
  `]
})
export class B2bOrderReviewComponent implements OnInit {
    private store = inject(Store);
    private router = inject(Router);

    cartItems$: Observable<B2BCartItem[]>;

    constructor() {
        this.cartItems$ = this.store.select(selectB2BCartItems);
    }

    ngOnInit() {
        // Cart is already loaded by the B2B layout
    }

    trackByItemId(index: number, item: B2BCartItem): string {
        return item.id;
    }

    increaseQuantity(itemId: string) {
        // Get the current item to determine new quantity
        this.cartItems$.pipe(take(1)).subscribe(items => {
            const item = items.find(i => i.id === itemId);
            if (item) {
                this.store.dispatch(B2BCartActions.updateB2BCartItem({
                    productId: item.productId,
                    quantity: item.quantity + 1
                }));
            }
        });
    }

    decreaseQuantity(itemId: string) {
        // Get the current item to determine new quantity
        this.cartItems$.pipe(take(1)).subscribe(items => {
            const item = items.find(i => i.id === itemId);
            if (item && item.quantity > 1) {
                this.store.dispatch(B2BCartActions.updateB2BCartItem({
                    productId: item.productId,
                    quantity: item.quantity - 1
                }));
            }
        });
    }

    removeItem(itemId: string) {
        // Get the current item to get productId
        this.cartItems$.pipe(take(1)).subscribe(items => {
            const item = items.find(i => i.id === itemId);
            if (item) {
                this.store.dispatch(B2BCartActions.removeFromB2BCart({ productId: item.productId }));
            }
        });
    }

    continueToShipping() {
        // Save current cart items to localStorage for order processing
        this.cartItems$.pipe(take(1)).subscribe(cartItems => {
            console.log('Saving B2B cart items for checkout:', cartItems);
            localStorage.setItem('b2bCheckoutItems', JSON.stringify(cartItems));
        });

        this.router.navigate(['/partners/checkout/shipping']);
    }

    getProductImageUrl(item: B2BCartItem): string {
        return item.imageUrl || '';
    }

    onImageError(event: Event): void {
        const img = event.target as HTMLImageElement;
        if (img) {
            img.style.display = 'none';
        }
    }
} 