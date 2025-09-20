import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, take, map } from 'rxjs/operators';
import { B2BCartItem, B2BCartSummary, B2BAppliedCoupon } from '../../models/b2b-cart.model';
import * as B2BCartSelectors from '../../store/b2b-cart.selectors';
import * as B2BCartActions from '../../store/b2b-cart.actions';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../../shared/services/translation.service';
import { LucideAngularModule, ShoppingCart } from 'lucide-angular';

@Component({
  selector: 'app-b2b-cart-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe, LucideAngularModule],
  template: `
    <!-- Cart Overlay -->
    <div 
      *ngIf="sidebarOpen$ | async" 
      class="fixed inset-0 z-50 overflow-hidden cart-overlay"
      (click)="onOverlayClick($event)"
    >
      <!-- Background overlay -->
      <div 
        class="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        (click)="closeSidebar()"
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
            (click)="closeSidebar()"
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
          <!-- Loading State -->
          <div *ngIf="loading$ | async" class="flex-1 flex items-center justify-center p-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-solar-600"></div>
          </div>

          <!-- Empty Cart State -->
          <div 
            *ngIf="(isEmpty$ | async) && !(loading$ | async)" 
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
              (click)="closeSidebar()"
              class="px-6 py-3 bg-solar-600 text-white rounded-lg hover:bg-solar-700 transition-colors"
            >
              {{ 'cart.continueShopping' | translate }}
            </button>
          </div>

          <!-- Populated Cart State -->
          <div *ngIf="!(isEmpty$ | async) && !(loading$ | async)" class="flex-1 flex flex-col min-h-0">
            <!-- Company Info -->
            <div *ngIf="companyInfo$ | async as company" class="p-4 bg-solar-50 border-b border-gray-200">
              <div class="text-sm text-solar-800">
                <span class="font-medium">{{ 'b2bCart.orderingFor' | translate }}:</span> 
                {{ company.companyName || ('b2bCart.unknownCompany' | translate) }}
              </div>
            </div>

            <!-- Cart Items -->
            <div class="flex-1 overflow-y-auto p-4 min-h-0">
              <div class="space-y-3">
                <div 
                  *ngFor="let item of cartItems$ | async; trackBy: trackByProductId"
                  class="flex items-start space-x-3 p-3 border rounded-lg cart-item"
                  [class.border-gray-200]="isMinimumOrderMet(item)"
                  [class.border-amber-300]="!isMinimumOrderMet(item)"
                  [class.bg-amber-50]="!isMinimumOrderMet(item)"
                >
                  <!-- Product Image -->
                  <div class="flex-shrink-0">
                    <img 
                      [src]="getImageSrc(item.imageUrl)" 
                      [alt]="item.name"
                      class="w-14 h-14 object-cover rounded-lg bg-gray-100"
                      (error)="onImageError($event, item.productId)"
                      loading="lazy"
                    >
                  </div>

                  <!-- Product Details -->
                  <div class="flex-1 min-w-0">
                    <a 
                      [routerLink]="['/partneri/proizvodi', item.productId]"
                      (click)="closeSidebar()"
                      class="text-sm font-medium text-gray-900 hover:text-solar-600 truncate block cursor-pointer"
                    >
                      {{ item.name }}
                    </a>
                    <p class="text-xs text-gray-500 mt-1">{{ 'b2bCart.sku' | translate }}: {{ item.sku }}</p>
                    
                    <!-- Price -->
                    <div class="flex items-center space-x-2 mt-2">
                      <span class="text-sm font-semibold text-gray-900">
                        {{ item.unitPrice | currency:'EUR':'symbol':'1.2-2' }}
                      </span>
                      <span
                        *ngIf="item.partnerOfferOriginalPrice && item.partnerOfferOriginalPrice > item.unitPrice"
                        class="text-xs text-gray-500 line-through"
                      >
                        {{ item.partnerOfferOriginalPrice | currency:'EUR':'symbol':'1.2-2' }}
                      </span>
                      <span
                        *ngIf="!item.partnerOfferOriginalPrice && item.retailPrice && item.retailPrice > item.unitPrice"
                        class="text-xs text-gray-500 line-through"
                      >
                        {{ item.retailPrice | currency:'EUR':'symbol':'1.2-2' }}
                      </span>
                      <span *ngIf="item.savings && item.savings > 0"
                            class="text-xs text-green-600 font-medium">
                        {{ 'b2bCart.save' | translate }} {{ (item.savings / item.quantity) | currency:'EUR':'symbol':'1.2-2' }}
                      </span>
                    </div>

                    <!-- Next Tier Hint -->
                    <div *ngIf="getNextTierHint(item)" class="mt-1 text-xs text-amber-600">
                      <svg class="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      {{ getNextTierHint(item) }}
                    </div>

                    <!-- Partner Offer Badge -->
                    <div *ngIf="item.partnerOfferId" class="mt-1">
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                        {{ item.partnerOfferName }}
                      </span>
                    </div>
                    
                    <!-- Additional Partner Offer Savings -->
                    <div *ngIf="item.additionalSavings && item.additionalSavings > 0" class="mt-1">
                      <span class="text-xs text-blue-600 font-medium">
                        {{ 'b2bCart.additionalOfferSavings' | translate }}: {{ (item.additionalSavings / item.quantity) | currency:'EUR':'symbol':'1.2-2' }}
                      </span>
                    </div>

                    <!-- Quantity Controls -->
                    <div class="flex items-center justify-between mt-2">
                      <div class="flex items-center space-x-1">
                        <button 
                          (click)="decreaseQuantity(item.productId)"
                          [disabled]="!canDecreaseQuantity(item)"
                          class="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                          </svg>
                        </button>
                        
                        <span class="w-7 text-center text-sm font-medium">{{ item.quantity }}</span>
                        
                        <button 
                          (click)="increaseQuantity(item.productId)"
                          class="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-50"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                          </svg>
                        </button>
                      </div>

                      <!-- Remove Button -->
                      <button 
                        (click)="removeItem(item.productId)"
                        class="text-red-500 hover:text-red-700 text-sm"
                      >
                        {{ 'cart.remove' | translate }}
                      </button>
                    </div>

                    <!-- Minimum Order Warning -->
                    <div *ngIf="!isMinimumOrderMet(item)" class="mt-2">
                      <div class="flex items-center space-x-1 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.884-.833-2.654 0L3.16 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                        </svg>
                        <span>{{ 'b2bCart.minimumOrder' | translate }}: {{ item.minimumOrder }}</span>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          </div>

          <!-- Coupon Section -->
          <div class="mt-4 p-3 bg-gray-50 rounded-lg mx-4">
            <h4 class="text-sm font-medium text-gray-900 mb-3">{{ 'cart.discountCode' | translate }}</h4>

            <div *ngIf="appliedCoupons$ | async as coupons">
              <div
                *ngFor="let coupon of coupons"
                class="flex items-center justify-between p-2 bg-blue-50 text-blue-800 rounded text-sm mb-2 last:mb-0"
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
                  class="text-blue-600 hover:text-blue-800"
                  aria-label="Remove coupon"
                >
                  ×
                </button>
              </div>
            </div>

            <div class="flex space-x-2">
              <input
                type="text"
                [(ngModel)]="couponCode"
                [placeholder]="'cart.enterDiscountCode' | translate"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-solar-500"
                [disabled]="(isCouponLoading$ | async) || false"
              >
              <button
                (click)="applyCoupon()"
                [disabled]="isApplyButtonDisabled || (isCouponLoading$ | async)"
                class="px-4 py-2 bg-solar-600 text-white rounded-lg text-sm hover:bg-solar-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span *ngIf="!(isCouponLoading$ | async)">{{ 'cart.apply' | translate }}</span>
                <span *ngIf="isCouponLoading$ | async">...</span>
              </button>
            </div>

            <div *ngIf="couponError$ | async as error" class="mt-2 text-sm text-red-600">
              {{ error }}
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
                  *ngIf="(cartSummary$ | async)?.totalSavings && (cartSummary$ | async)!.totalSavings > 0"
                  class="flex justify-between text-green-600"
                >
                  <span>{{ 'b2bCart.totalSavings' | translate }}</span>
                  <span>-{{ (cartSummary$ | async)?.totalSavings | currency:'EUR':'symbol':'1.2-2' }}</span>
                </div>
                <div 
                  *ngIf="(cartSummary$ | async)?.couponDiscount && (cartSummary$ | async)!.couponDiscount > 0"
                  class="flex justify-between text-blue-600"
                >
                  <span>{{ 'cart.couponDiscount' | translate }}</span>
                  <span>-{{ (cartSummary$ | async)?.couponDiscount | currency:'EUR':'symbol':'1.2-2' }}</span>
                </div>
                <div class="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>{{ 'cart.total' | translate }}</span>
                  <span>{{ (cartSummary$ | async)?.total | currency:'EUR':'symbol':'1.2-2' }}</span>
                </div>
              </div>

              <!-- Checkout Button -->
              <div class="mt-6">
                <!-- Minimum Order Violations Warning -->
                <div *ngIf="hasMinimumOrderViolations$ | async" class="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div class="flex items-center space-x-2 text-amber-700">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.884-.833-2.654 0L3.16 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                    <span class="text-sm font-medium">{{ 'b2bCart.minimumOrderViolation' | translate }}</span>
                  </div>
                </div>
                
                <button 
                  (click)="proceedToCheckout()"
                  [disabled]="hasMinimumOrderViolations$ | async"
                  class="w-full px-6 py-4 bg-solar-600 text-white rounded-lg hover:bg-solar-700 transition-colors font-semibold text-lg font-['DM_Sans'] disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
                >
                  {{ 'cart.proceedToCheckout' | translate }}
                </button>
                <button 
                  (click)="clearCart()" 
                  class="w-full mt-2 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                >
                  {{ 'b2bCart.clearCart' | translate }}
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

    /* Minimum order violation styling */
    .cart-item.border-amber-300 {
      border-left: 4px solid #f59e0b;
    }

    /* Disabled button styling */
    .disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class B2BCartSidebarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private imageErrors = new Set<string>();

  // Observables
  cartItems$: Observable<B2BCartItem[]>;
  cartSummary$: Observable<B2BCartSummary>;
  loading$: Observable<boolean>;
  isEmpty$: Observable<boolean>;
  companyInfo$: Observable<{ companyId: string | null; companyName: string | null }>;
  sidebarOpen$: Observable<boolean>;
  hasMinimumOrderViolations$: Observable<boolean>;
  appliedCoupons$: Observable<B2BAppliedCoupon[]>;
  couponError$: Observable<string | null>;
  isCouponLoading$: Observable<boolean>;

  couponCode = '';

  // Lucide Icons
  readonly ShoppingCartIcon = ShoppingCart;

  get isApplyButtonDisabled(): boolean {
    return !this.couponCode.trim();
  }

  constructor(private store: Store, private router: Router, private translationService: TranslationService) {
    this.cartItems$ = this.store.select(B2BCartSelectors.selectB2BCartItems);
    this.cartSummary$ = this.store.select(B2BCartSelectors.selectB2BCartSummary);
    this.loading$ = this.store.select(B2BCartSelectors.selectB2BCartLoading);
    this.isEmpty$ = this.store.select(B2BCartSelectors.selectB2BCartIsEmpty);
    this.companyInfo$ = this.store.select(B2BCartSelectors.selectB2BCartCompanyInfo);
    this.sidebarOpen$ = this.store.select(B2BCartSelectors.selectB2BCartSidebarOpen);
    this.appliedCoupons$ = this.store.select(B2BCartSelectors.selectB2BCartAppliedCoupons);
    this.couponError$ = this.store.select(B2BCartSelectors.selectB2BCartCouponError);
    this.isCouponLoading$ = this.store.select(B2BCartSelectors.selectB2BCartIsCouponLoading);
    this.hasMinimumOrderViolations$ = this.cartItems$.pipe(
      takeUntil(this.destroy$),
      // Check if any item has quantity below minimum order
      map((items: B2BCartItem[]) => items.some(item => item.quantity < item.minimumOrder))
    );
  }

  ngOnInit(): void {
    // Component initialization
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(_event: KeyboardEvent) {
    this.closeSidebar();
  }

  closeSidebar(): void {
    this.store.dispatch(B2BCartActions.closeB2BCartSidebar());
  }

  applyCoupon(): void {
    const code = this.couponCode.trim();
    if (!code) {
      return;
    }

    this.companyInfo$.pipe(take(1)).subscribe(info => {
      if (!info.companyId) {
        this.store.dispatch(
          B2BCartActions.applyB2BCouponFailure({
            error: this.translationService.translate('b2b.auth.companyIdNotFound')
          })
        );
        return;
      }

      this.store.dispatch(B2BCartActions.applyB2BCoupon({ code, companyId: info.companyId }));
      this.couponCode = '';
    });
  }

  removeCoupon(couponId: string): void {
    this.store.dispatch(B2BCartActions.removeB2BCoupon({ couponId }));
  }

  onOverlayClick(event: MouseEvent) {
    // Close cart if clicking on the overlay (not the sidebar content)
    const target = event.target as HTMLElement;
    const currentTarget = event.currentTarget as HTMLElement;

    // Check if the click target is the overlay itself or the background div
    if (target === currentTarget || target.classList.contains('cart-overlay') || target.classList.contains('bg-black')) {
      this.closeSidebar();
    }
  }

  increaseQuantity(productId: string): void {
    // Get current quantity and increase by 1
    this.cartItems$.pipe(
      takeUntil(this.destroy$),
      // Take only the first emission to avoid multiple subscriptions
      take(1)
    ).subscribe((items: B2BCartItem[]) => {
      const item = items.find((i: B2BCartItem) => i.productId === productId);
      if (item) {
        this.store.dispatch(B2BCartActions.updateB2BCartItem({
          productId,
          quantity: item.quantity + 1
        }));
      }
    });
  }

  decreaseQuantity(productId: string): void {
    // Get current quantity and decrease by 1 (minimum is the minimum order requirement)
    this.cartItems$.pipe(
      takeUntil(this.destroy$),
      // Take only the first emission to avoid multiple subscriptions
      take(1)
    ).subscribe((items: B2BCartItem[]) => {
      const item = items.find((i: B2BCartItem) => i.productId === productId);
      if (item && item.quantity > item.minimumOrder) {
        this.store.dispatch(B2BCartActions.updateB2BCartItem({
          productId,
          quantity: item.quantity - 1
        }));
      }
    });
  }

  removeItem(productId: string): void {
    this.store.dispatch(B2BCartActions.removeFromB2BCart({ productId }));
  }

  clearCart(): void {
    const confirmMessage = this.translationService.translate('b2bCart.clearCartConfirm');
    if (confirm(confirmMessage)) {
      this.store.dispatch(B2BCartActions.clearB2BCart());
    }
  }

  proceedToCheckout(): void {
    this.closeSidebar();
    this.router.navigate(['/partneri/blagajna']);
  }

  trackByProductId(_index: number, item: B2BCartItem): string {
    return item.productId;
  }

  // Minimum order validation methods
  isMinimumOrderMet(item: B2BCartItem): boolean {
    return item.quantity >= item.minimumOrder;
  }

  canDecreaseQuantity(item: B2BCartItem): boolean {
    return item.quantity > item.minimumOrder;
  }

  getMinimumOrderMessage(item: B2BCartItem): string {
    if (this.isMinimumOrderMet(item)) {
      return '';
    }
    return this.translationService.translate('b2bCart.minimumOrderRequired', {
      minimum: item.minimumOrder,
      current: item.quantity
    });
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

  onImageError(event: any, _productId: string) {
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

  getNextTierHint(item: B2BCartItem): string {
    if (!item.priceTier1) {
      return '';
    }

    // Check if there's a next tier available
    if (item.appliedTier === 1 && item.quantityTier2 && item.priceTier2) {
      const neededQty = item.quantityTier2 - item.quantity;
      if (neededQty > 0 && neededQty <= 5) {
        const savings = ((item.unitPrice - item.priceTier2) * item.quantityTier2).toFixed(2);
        return this.translationService.translate('b2bCart.addMoreForTier', {
          qty: neededQty,
          price: item.priceTier2.toFixed(2),
          savings: savings
        });
      }
    } else if (item.appliedTier === 2 && item.quantityTier3 && item.priceTier3) {
      const neededQty = item.quantityTier3 - item.quantity;
      if (neededQty > 0 && neededQty <= 10) {
        const savings = ((item.unitPrice - item.priceTier3) * item.quantityTier3).toFixed(2);
        return this.translationService.translate('b2bCart.addMoreForTier', {
          qty: neededQty,
          price: item.priceTier3.toFixed(2),
          savings: savings
        });
      }
    }

    return '';
  }
} 