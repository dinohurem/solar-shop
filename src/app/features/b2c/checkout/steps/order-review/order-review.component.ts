import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import * as CartSelectors from '../../../cart/store/cart.selectors';
import * as CartActions from '../../../cart/store/cart.actions';
import { CartItem, AppliedCoupon } from '../../../../../shared/models/cart.model';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-order-review',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6 font-['Poppins']">{{ 'checkout.title' | translate }}</h2>
      
      <!-- Cart Items -->
      <div class="space-y-6">
        <div 
          *ngFor="let item of cartItems$ | async; trackBy: trackByItemId"
          class="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg"
        >
          <!-- Product Image -->
          <div class="flex-shrink-0">
            <img 
              [src]="item.image" 
              [alt]="item.name"
              class="w-20 h-20 object-cover rounded-lg bg-gray-100"
            >
          </div>

          <!-- Product Details -->
          <div class="flex-1 min-w-0">
            <a 
              [routerLink]="['/proizvodi', item.productId || item.id]"
              class="text-lg font-semibold text-gray-900 hover:text-solar-600 mb-2 font-['Poppins'] block cursor-pointer"
            >
              {{ item.name }}
            </a>
            
            <!-- Quantity Controls -->
            <div class="flex items-center space-x-3">
              <span class="text-sm text-gray-600 font-['DM_Sans']">{{ 'checkout.quantity' | translate }}:</span>
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
              {{ (item.price * item.quantity) | currency:'EUR':'symbol':'1.2-2' }}
            </div>
            <div class="text-sm text-gray-500 font-['DM_Sans']">
              {{ item.price | currency:'EUR':'symbol':'1.2-2' }} {{ 'checkout.each' | translate }}
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

      <!-- Applied Coupons -->
      <div *ngIf="appliedCoupons$ | async as coupons" class="mt-6">
        <div *ngIf="coupons.length > 0" class="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 class="text-sm font-medium text-green-800 mb-2 font-['DM_Sans']">{{ 'cart.appliedCoupons' | translate }}</h4>
          <div class="space-y-2">
            <div 
              *ngFor="let coupon of coupons"
              class="flex items-center justify-between text-sm text-green-700"
            >
              <span class="font-['DM_Sans']">{{ coupon.code }}</span>
              <span class="font-semibold font-['DM_Sans']">-{{ coupon.discountAmount | currency:'EUR':'symbol':'1.2-2' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 class="text-lg font-semibold text-gray-900 mb-4 font-['Poppins']">{{ 'checkout.orderSummary' | translate }}</h4>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600 font-['DM_Sans']">{{ 'cart.subtotal' | translate }}</span>
            <span class="font-['DM_Sans']">{{ (cartSummary$ | async)?.subtotal | currency:'EUR':'symbol':'1.2-2' }}</span>
          </div>
          <div 
            *ngIf="(cartSummary$ | async)?.discount && (cartSummary$ | async)!.discount > 0"
            class="flex justify-between text-green-600"
          >
            <span class="font-['DM_Sans']">{{ 'cart.discount' | translate }}</span>
            <span class="font-['DM_Sans']">-{{ (cartSummary$ | async)?.discount | currency:'EUR':'symbol':'1.2-2' }}</span>
          </div>
          <div class="flex justify-between font-semibold text-lg border-t pt-2">
            <span class="font-['Poppins']">{{ 'cart.total' | translate }}</span>
            <span class="font-['Poppins']">{{ (cartSummary$ | async)?.total | currency:'EUR':'symbol':'1.2-2' }}</span>
          </div>
        </div>
      </div>

      <!-- Continue Button -->
      <div class="mt-8 pt-6 border-t border-gray-200">
        <button 
          (click)="continueToShipping()"
          [disabled]="(cartItems$ | async)?.length === 0"
          class="w-full px-6 py-4 bg-solar-600 text-white rounded-lg hover:bg-solar-700 transition-colors font-semibold text-lg font-['DM_Sans'] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ 'checkout.nextStep' | translate }} {{ 'checkout.step2' | translate }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* Custom font loading */
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
  `]
})
export class OrderReviewComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);

  cartItems$: Observable<CartItem[]>;
  appliedCoupons$: Observable<AppliedCoupon[]>;
  cartSummary$: Observable<{
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
    itemCount: number;
  }>;

  constructor() {
    this.cartItems$ = this.store.select(CartSelectors.selectCartItems);
    this.appliedCoupons$ = this.store.select(CartSelectors.selectAppliedCoupons);
    this.cartSummary$ = this.store.select(CartSelectors.selectCartSummary);
  }

  ngOnInit() {
    // Cart is already loaded by the cart sidebar in the page layout
    // No need to dispatch loadCart here as it would be redundant
  }

  trackByItemId(index: number, item: CartItem): string {
    return item.id;
  }

  increaseQuantity(itemId: string) {
    this.store.dispatch(CartActions.increaseQuantity({ itemId }));
  }

  decreaseQuantity(itemId: string) {
    this.store.dispatch(CartActions.decreaseQuantity({ itemId }));
  }

  removeItem(itemId: string) {
    this.store.dispatch(CartActions.removeFromCart({ itemId }));
  }

  continueToShipping() {
    // Save current cart items to localStorage for order processing
    this.cartItems$.pipe(take(1)).subscribe(cartItems => {
      console.log('Saving cart items for checkout:', cartItems);
      localStorage.setItem('checkoutItems', JSON.stringify(cartItems));
    });

    this.router.navigate(['/blagajna/dostava']);
  }
} 