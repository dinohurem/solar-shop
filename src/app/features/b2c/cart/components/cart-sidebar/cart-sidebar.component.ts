import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Cart, CartItem } from '../../../../../shared/models/cart.model';
import * as CartActions from '../../store/cart.actions';
import * as CartSelectors from '../../store/cart.selectors';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { LucideAngularModule, ShoppingCart } from 'lucide-angular';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe, LucideAngularModule],
  template: `
    <!-- Cart Overlay -->
    <div 
      *ngIf="isCartOpen$ | async" 
      class="fixed inset-0 z-50 overflow-hidden cart-overlay"
      (click)="onOverlayClick($event)"
    >
      <!-- Background overlay -->
      <div 
        class="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        (click)="closeCart()"
      ></div>
      
      <!-- Cart sidebar -->
      <div 
        class="absolute right-0 top-0 h-screen w-full max-w-md bg-white shadow-xl transform transition-all duration-300 ease-out flex flex-col cart-sidebar animate-slide-in-right"
        (click)="$event.stopPropagation()"
      >
        <!-- Cart Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">{{ 'cart.yourCart' | translate }}</h2>
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
            <div class="w-24 h-24 mb-6 text-gray-300 flex items-center justify-center">
              <lucide-angular 
                name="shopping-cart" 
                class="w-24 h-24 text-gray-300"
                [img]="ShoppingCartIcon">
              </lucide-angular>
            </div>
            <h3 class="text-xl font-medium text-gray-900 mb-2">{{ 'cart.empty' | translate }}</h3>
            <p class="text-gray-500 mb-6">{{ 'cart.emptyText' | translate }}</p>
            <button 
              (click)="closeCart()"
              class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {{ 'cart.continueShopping' | translate }}
            </button>
          </div>

          <!-- Populated Cart State -->
          <div *ngIf="!(isCartEmpty$ | async)" class="flex-1 flex flex-col min-h-0">
            <!-- Cart Items -->
            <div class="flex-1 overflow-y-auto p-4 min-h-0">
              <div class="space-y-3">
                <div 
                  *ngFor="let item of cartItems$ | async; trackBy: trackByItemId"
                  class="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg cart-item"
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
                    <a 
                      [routerLink]="['/proizvodi', item.productId || item.id]"
                      (click)="closeCart()"
                      class="text-sm font-medium text-gray-900 hover:text-solar-600 truncate block cursor-pointer"
                    >
                      {{ item.name }}
                    </a>
                    <p class="text-xs text-gray-500 mt-1">{{ item.category }}</p>
                    
                    <!-- Price -->
                    <div class="flex items-center space-x-2 mt-2">
                      <span class="text-sm font-semibold text-gray-900">
                        {{ item.price | currency:'EUR':'symbol':'1.2-2' }}
                      </span>
                      <span 
                        *ngIf="item.offerOriginalPrice && item.offerOriginalPrice > item.price"
                        class="text-xs text-gray-500 line-through"
                      >
                        {{ item.offerOriginalPrice | currency:'EUR':'symbol':'1.2-2' }}
                      </span>
                      <span 
                        *ngIf="!item.offerOriginalPrice && item.originalPrice && item.originalPrice > item.price"
                        class="text-xs text-gray-500 line-through"
                      >
                        {{ item.originalPrice | currency:'EUR':'symbol':'1.2-2' }}
                      </span>
                    </div>
                    
                    <!-- Offer Badge -->
                    <div *ngIf="item.offerId" class="mt-1">
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                        {{ item.offerName }}
                      </span>
                    </div>
                    
                    <!-- Offer Savings -->
                    <div *ngIf="item.offerSavings && item.offerSavings > 0" class="mt-1">
                      <span class="text-xs text-green-600 font-medium">
                        {{ 'cart.saveFromOffer' | translate }}:
                        <ng-container *ngIf="item.offerType === 'percentage'">
                          {{ item.offerDiscount }}% OFF ({{ item.offerSavings | currency:'EUR':'symbol':'1.2-2' }})
                        </ng-container>
                        <ng-container *ngIf="item.offerType === 'fixed_amount'">
                          {{ item.offerDiscount | currency:'EUR':'symbol':'1.2-2' }} OFF
                        </ng-container>
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
                        {{ 'cart.remove' | translate }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Coupon Section -->
              <div class="mt-4 p-3 bg-gray-50 rounded-lg flex-shrink-0">
                <h4 class="text-sm font-medium text-gray-900 mb-3">{{ 'cart.discountCode' | translate }}</h4>
                
                <!-- Applied Coupons -->
                <div *ngIf="appliedCoupons$ | async as coupons" class="mb-3">
                  <div
                    *ngFor="let coupon of coupons"
                    class="flex items-center justify-between p-2 bg-green-100 text-green-800 rounded text-sm"
                  >
                    <span>
                      {{ coupon.code }} -
                      <ng-container *ngIf="coupon.type === 'percentage'">
                        {{ coupon.value }}% ({{ coupon.discountAmount | currency:'EUR':'symbol':'1.2-2' }})
                      </ng-container>
                      <ng-container *ngIf="coupon.type === 'fixed_amount'">
                        {{ coupon.discountAmount | currency:'EUR':'symbol':'1.2-2' }}
                      </ng-container>
                      <ng-container *ngIf="coupon.type === 'free_shipping'">
                        {{ 'cart.freeShipping' | translate }}
                      </ng-container>
                    </span>
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
                    [placeholder]="'cart.enterDiscountCode' | translate"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    [disabled]="(isCouponLoading$ | async) || false"
                  >
                  <button 
                    (click)="applyCoupon()"
                    [disabled]="isApplyButtonDisabled || (isCouponLoading$ | async)"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span *ngIf="!(isCouponLoading$ | async)">{{ 'cart.apply' | translate }}</span>
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
                  <span class="text-gray-600">{{ 'cart.subtotal' | translate }}</span>
                  <span>{{ (cartSummary$ | async)?.subtotal | currency:'EUR':'symbol':'1.2-2' }}</span>
                </div>
                <div 
                  *ngIf="(cartSummary$ | async)?.discount && (cartSummary$ | async)!.discount > 0"
                  class="flex justify-between text-green-600"
                >
                  <span>{{ 'cart.discount' | translate }}</span>
                  <span>-{{ (cartSummary$ | async)?.discount | currency:'EUR':'symbol':'1.2-2' }}</span>
                </div>
                <div class="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>{{ 'cart.total' | translate }}</span>
                  <span>{{ (((cartSummary$ | async)?.subtotal || 0) - ((cartSummary$ | async)?.discount || 0)) | currency:'EUR':'symbol':'1.2-2' }}</span>
                </div>
              </div>


              <!-- Checkout Button -->
              <div class="mt-6">
                <button 
                  (click)="proceedToCheckout()"
                  class="w-full px-6 py-4 bg-solar-600 text-white rounded-lg hover:bg-solar-700 transition-colors font-semibold text-lg font-['DM_Sans']"
                >
                  {{ 'cart.checkout' | translate }}
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

    .cart-overlay {
      backdrop-filter: blur(4px);
      pointer-events: auto;
    }

    .cart-sidebar {
      will-change: transform;
      backface-visibility: hidden;
      pointer-events: auto;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes slideInRight {
      from {
        transform: translate3d(100%, 0, 0);
      }
      to {
        transform: translate3d(0, 0, 0);
      }
    }

    .animate-slide-in-right {
      animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Cart item animations - staggered for better performance */
    .cart-item {
      opacity: 0;
      transform: translateY(10px);
      animation: slideInUp 0.5s ease-out forwards;
    }

    .cart-item:nth-child(1) { animation-delay: 0.05s; }
    .cart-item:nth-child(2) { animation-delay: 0.1s; }
    .cart-item:nth-child(3) { animation-delay: 0.15s; }
    .cart-item:nth-child(4) { animation-delay: 0.2s; }
    .cart-item:nth-child(n+5) { animation-delay: 0.25s; }

    @keyframes slideInUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Smooth transitions for quantity changes */
    .cart-item {
      transition: all 0.5s ease;
    }

    /* Remove unused notification styles since we have a separate component */
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

  // Lucide Icons
  readonly ShoppingCartIcon = ShoppingCart;

  // Helper properties for template
  get isApplyButtonDisabled(): boolean {
    // Simple synchronous check for better performance
    return !this.couponCode.trim();
  }

  constructor() {
    // Debug: Log cart state changes
    this.isCartOpen$.subscribe(isOpen => {
    });

    this.cartItems$.subscribe(items => {
    });

    // Debug: Log cart loading state
    this.store.select(CartSelectors.selectIsCartLoading).subscribe(isLoading => {
    });

    // Debug: Log cart errors
    this.store.select(CartSelectors.selectCartError).subscribe(error => {
      if (error) {
      }
    });

    // Debug: Log the entire cart state
    this.store.select(CartSelectors.selectCartState).subscribe(cartState => {
    });
  }

  ngOnInit() {
    // Primary cart loading - this component should be included only once in the page layout
    // to avoid duplicate loadCart dispatches. Other components should not dispatch loadCart
    // as the cart sidebar handles this responsibility.
    this.store.dispatch(CartActions.loadCart());

    // Reset coupon errors when cart opens
    this.isCartOpen$.subscribe(isOpen => {
      if (isOpen) {
        this.store.dispatch(CartActions.resetCouponError());
      }
    });
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
    const target = event.target as HTMLElement;
    const currentTarget = event.currentTarget as HTMLElement;

    // Check if the click target is the overlay itself or the background div
    if (target === currentTarget || target.classList.contains('cart-overlay') || target.classList.contains('bg-black')) {
      console.log('Overlay clicked - closing cart');
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
    // Reset cart step to first step and close the cart sidebar
    this.store.dispatch(CartActions.setCartStep({ step: 'cart' }));
    this.store.dispatch(CartActions.closeCart());
    // Navigate to the first step of checkout
    this.router.navigate(['/blagajna/pregled-narudzbe']);
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