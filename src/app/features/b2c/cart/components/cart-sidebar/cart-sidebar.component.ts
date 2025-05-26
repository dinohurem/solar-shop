import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Cart, CartItem } from '../../../../../shared/models/cart.model';
import { Coupon } from '../../../../../shared/models/coupon.model';
import * as CartActions from '../../store/cart.actions';
import * as CartSelectors from '../../store/cart.selectors';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Cart Overlay -->
    <div 
      *ngIf="isCartOpen$ | async" 
      class="fixed inset-0 z-50 overflow-hidden"
      (click)="onOverlayClick($event)"
    >
      <!-- Background overlay -->
      <div class="absolute inset-0 bg-black bg-opacity-50 transition-opacity"></div>
      
      <!-- Cart sidebar -->
      <div class="absolute right-0 top-0 h-screen w-full max-w-md bg-white shadow-xl transform transition-transform flex flex-col" (click)="$event.stopPropagation()">
        <!-- Cart Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Your cart</h2>
          <button 
            (click)="closeCart()"
            class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close cart"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Cart Content -->
        <div class="flex flex-col flex-1 min-h-0">
          <!-- Empty Cart State -->
          <div 
            *ngIf="isCartEmpty$ | async" 
            class="flex-1 flex flex-col items-center justify-center p-8 text-center"
          >
            <div class="w-24 h-24 mb-6 text-gray-300">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/>
                <path d="M9 8V17H11V8H9ZM13 8V17H15V8H13Z"/>
              </svg>
            </div>
            <h3 class="text-xl font-medium text-gray-900 mb-2">Il tuo carrello è vuoto!</h3>
            <p class="text-gray-500 mb-6">Aggiungi alcuni prodotti per iniziare lo shopping.</p>
            <button 
              (click)="closeCart()"
              class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue shopping
            </button>
          </div>

          <!-- Populated Cart State -->
          <div *ngIf="!(isCartEmpty$ | async)" class="flex-1 flex flex-col min-h-0">
            <!-- Cart Items -->
            <div class="flex-1 overflow-y-auto p-4 min-h-0">
              <div class="space-y-3">
                                  <div 
                    *ngFor="let item of cartItems$ | async; trackBy: trackByItemId"
                    class="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg"
                  >
                                      <!-- Product Image -->
                    <div class="flex-shrink-0">
                      <img 
                        [src]="getImageSrc(item.image)" 
                        [alt]="item.name"
                        class="w-14 h-14 object-cover rounded-lg bg-gray-100"
                        (error)="onImageError($event, item.id)"
                        loading="lazy"
                      >
                    </div>

                  <!-- Product Details -->
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-medium text-gray-900 truncate">{{ item.name }}</h4>
                    <p class="text-xs text-gray-500 mt-1">{{ item.category }}</p>
                    
                    <!-- Price -->
                    <div class="flex items-center space-x-2 mt-2">
                      <span class="text-sm font-semibold text-gray-900">
                        {{ item.price | currency:'EUR':'symbol':'1.2-2' }}
                      </span>
                      <span 
                        *ngIf="item.originalPrice && item.originalPrice > item.price"
                        class="text-xs text-gray-500 line-through"
                      >
                        {{ item.originalPrice | currency:'EUR':'symbol':'1.2-2' }}
                      </span>
                    </div>

                    <!-- Quantity Controls -->
                    <div class="flex items-center justify-between mt-2">
                                              <div class="flex items-center space-x-1">
                          <button 
                            (click)="decreaseQuantity(item.id)"
                            [disabled]="item.quantity <= item.minQuantity"
                            class="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                          </svg>
                        </button>
                        
                                                  <span class="w-7 text-center text-sm font-medium">{{ item.quantity }}</span>
                          
                          <button 
                            (click)="increaseQuantity(item.id)"
                            [disabled]="item.quantity >= item.maxQuantity"
                            class="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                          </svg>
                        </button>
                      </div>

                      <!-- Remove Button -->
                      <button 
                        (click)="removeItem(item.id)"
                        class="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Coupon Section -->
              <div class="mt-4 p-3 bg-gray-50 rounded-lg flex-shrink-0">
                  <h4 class="text-sm font-medium text-gray-900 mb-3">Discount code</h4>
                
                <!-- Applied Coupons -->
                <div *ngIf="appliedCoupons$ | async as coupons" class="mb-3">
                  <div 
                    *ngFor="let coupon of coupons"
                    class="flex items-center justify-between p-2 bg-green-100 text-green-800 rounded text-sm"
                  >
                    <span>{{ coupon.code }} (-{{ coupon.discountAmount | currency:'EUR':'symbol':'1.2-2' }})</span>
                    <button 
                      (click)="removeCoupon(coupon.id)"
                      class="text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <!-- Coupon Input -->
                <div class="flex space-x-2">
                  <input 
                    type="text"
                    [(ngModel)]="couponCode"
                    placeholder="Enter discount code"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    [disabled]="(isCouponLoading$ | async) || false"
                  >
                  <button 
                    (click)="applyCoupon()"
                    [disabled]="isApplyButtonDisabled || (isCouponLoading$ | async)"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span *ngIf="!(isCouponLoading$ | async)">Apply</span>
                    <span *ngIf="isCouponLoading$ | async">...</span>
                  </button>
                </div>

                <!-- Coupon Error -->
                <div 
                  *ngIf="couponError$ | async as error"
                  class="mt-2 text-sm text-red-600"
                >
                  {{ error }}
                </div>
              </div>
            </div>

            <!-- Cart Summary -->
            <div class="border-t border-gray-200 p-4 flex-shrink-0">
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Subtotal</span>
                  <span>{{ (cartSummary$ | async)?.subtotal | currency:'EUR':'symbol':'1.2-2' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Tax</span>
                  <span>{{ (cartSummary$ | async)?.tax | currency:'EUR':'symbol':'1.2-2' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Shipping</span>
                     <span>
                       <span *ngIf="(cartSummary$ | async)?.shipping === 0; else shippingCost">Free</span>
                       <ng-template #shippingCost>{{ (cartSummary$ | async)?.shipping | currency:'EUR':'symbol':'1.2-2' }}</ng-template>
                     </span>
                </div>
                <div 
                  *ngIf="(cartSummary$ | async)?.discount && (cartSummary$ | async)!.discount > 0"
                  class="flex justify-between text-green-600"
                >
                  <span>Discount</span>
                  <span>-{{ (cartSummary$ | async)?.discount | currency:'EUR':'symbol':'1.2-2' }}</span>
                </div>
                <div class="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>{{ (cartSummary$ | async)?.total | currency:'EUR':'symbol':'1.2-2' }}</span>
                </div>
              </div>

              <!-- Free Shipping Progress -->
              <div 
                *ngIf="(cartSummary$ | async)?.freeShippingRemaining && (cartSummary$ | async)!.freeShippingRemaining > 0"
                class="mt-4 p-3 bg-blue-50 rounded-lg"
              >
                <div class="text-sm text-blue-800 mb-2">
                  Add {{ (cartSummary$ | async)?.freeShippingRemaining | currency:'EUR':'symbol':'1.2-2' }} for free shipping!
                </div>
                <div class="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    [style.width.%]="getFreeShippingProgress()"
                  ></div>
                </div>
              </div>

              <!-- Checkout Button -->
              <div class="mt-6">
                <button 
                  (click)="proceedToCheckout()"
                  class="w-full px-6 py-4 bg-[#0ACF83] text-white rounded-lg hover:bg-[#09b574] transition-colors font-semibold text-lg font-['DM_Sans']"
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
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
export class CartSidebarComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);

  // Observables
  isCartOpen$ = this.store.select(CartSelectors.selectIsCartOpen);
  isCartEmpty$ = this.store.select(CartSelectors.selectIsCartEmpty);
  cartItems$ = this.store.select(CartSelectors.selectCartItems);
  cartSummary$ = this.store.select(CartSelectors.selectCartSummary);
  appliedCoupons$ = this.store.select(CartSelectors.selectAppliedCoupons);
  couponError$ = this.store.select(CartSelectors.selectCouponError);
  isCouponLoading$ = this.store.select(CartSelectors.selectIsCouponLoading);
  canApplyCoupon$ = this.store.select(CartSelectors.selectCanApplyCoupon);

  // Component state
  couponCode = '';
  private imageErrors = new Set<string>();

  // Helper properties for template
  get isApplyButtonDisabled(): boolean {
    // Simple synchronous check for better performance
    return !this.couponCode.trim();
  }

  ngOnInit() {
    // Load cart on component initialization
    this.store.dispatch(CartActions.loadCart());
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent) {
    this.closeCart();
  }

  closeCart() {
    this.store.dispatch(CartActions.closeCart());
  }

  onOverlayClick(event: MouseEvent) {
    // Close cart if clicking on the overlay (not the sidebar content)
    if (event.target === event.currentTarget) {
      this.closeCart();
    }
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

  applyCoupon() {
    if (this.couponCode.trim()) {
      this.store.dispatch(CartActions.applyCoupon({ code: this.couponCode.trim() }));
      // Clear the input after applying
      this.couponCode = '';
    }
  }

  removeCoupon(couponId: string) {
    this.store.dispatch(CartActions.removeCoupon({ couponId }));
  }

  proceedToCheckout() {
    // Close the cart sidebar and navigate to checkout
    this.store.dispatch(CartActions.closeCart());
    // Navigate to the first step of checkout
    this.router.navigate(['/checkout/order-review']);
  }

  trackByItemId(index: number, item: CartItem): string {
    return item.id;
  }

  getImageSrc(imagePath: string): string {
    // Ensure we have a valid image path and handle potential errors
    if (!imagePath) {
      return 'assets/images/product-placeholder.svg';
    }

    // If this image has already failed to load, return the fallback immediately
    if (this.imageErrors.has(imagePath)) {
      return 'assets/images/product-placeholder.svg';
    }

    return imagePath;
  }

  onImageError(event: any, itemId: string) {
    // Prevent infinite error loops by tracking failed images
    const originalSrc = event.target.src;

    // Add to error set to prevent retrying
    this.imageErrors.add(originalSrc);

    // Set fallback image only if it's not already the fallback
    if (!originalSrc.includes('product-placeholder.svg')) {
      event.target.src = 'assets/images/product-placeholder.svg';
    }

    // Suppress console errors by preventing default behavior
    event.preventDefault();
  }

  getFreeShippingProgress(): number {
    // Calculate progress towards free shipping
    // This would need to be calculated properly with the actual values from the store
    return 75; // Placeholder - in real implementation, calculate based on cart summary
  }
} 