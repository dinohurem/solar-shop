import { Component, Input, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, filter, map, take } from 'rxjs/operators';
import { Product } from '../../../product-list/product-list.component';
import { TranslatePipe } from '../../../../../../shared/pipes/translate.pipe';
import { ToastService } from '../../../../../../shared/services/toast.service';
import { TranslationService } from '../../../../../../shared/services/translation.service';
import * as WishlistActions from '../../../../../b2c/wishlist/store/wishlist.actions';
import {
  selectIsProductInWishlist,
  selectAddingToWishlist,
  selectRemovingFromWishlist
} from '../../../../../b2c/wishlist/store/wishlist.selectors';
import { selectCurrentUser } from '../../../../../../core/auth/store/auth.selectors';
import * as CartActions from '../../../../../b2c/cart/store/cart.actions';
import {
  selectAverageRating,
  selectReviewCount
} from '../../store/product-details.selectors';
import { LucideAngularModule, Star, StarHalf, ShoppingCart } from 'lucide-angular';

@Component({
  selector: 'app-product-info',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, LucideAngularModule],
  template: `
    <div class="space-y-6">
      <!-- Product Title and Rating -->
      <div>
        <div class="flex items-center gap-3 mb-4">
          <h1 class="text-3xl font-bold text-gray-900 font-['Poppins']">
            {{ product.name }}
          </h1>
          <!-- On Sale Badge -->
          <div 
            *ngIf="product.isOnSale" 
            class="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full"
          >
            {{ 'productDetails.onSale' | translate }}
          </div>
        </div>
        
        <!-- Rating and Reviews -->
        <div class="flex items-center mb-4">
          <div class="flex items-center">
            <div class="flex">
              <svg 
                *ngFor="let star of getStarArray((averageRating$ | async) || 0); let i = index" 
                class="w-5 h-5"
                [class]="star === 1 ? 'text-yellow-400 fill-current' : star === 0.5 ? 'text-yellow-400' : 'text-gray-300'"
                viewBox="0 0 20 20"
              >
                <defs *ngIf="star === 0.5">
                  <linearGradient id="half-star-{{i}}">
                    <stop offset="50%" stop-color="currentColor"/>
                    <stop offset="50%" stop-color="transparent"/>
                  </linearGradient>
                </defs>
                <path 
                  [attr.fill]="star === 0.5 ? 'url(#half-star-' + i + ')' : 'currentColor'"
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </div>
            <span class="ml-2 text-sm font-medium text-gray-900">{{ (averageRating$ | async) || 0 }}</span>
          </div>
          <span class="mx-2 text-gray-300">|</span>
          <button 
            (click)="scrollToReviews()"
            class="text-sm text-solar-600 hover:text-solar-700 font-['DM_Sans'] cursor-pointer"
          >
            {{ (reviewCount$ | async) || 0 }} {{ 'productList.reviews' | translate }}
          </button>
        </div>

        <!-- Availability -->
        <div class="flex items-center mb-6">
          <span class="text-sm font-medium text-gray-700 mr-2 font-['DM_Sans']">{{ 'productDetails.availability' | translate }}:</span>
          <span 
            class="px-2 py-1 rounded-full text-xs font-semibold"
            [ngClass]="{
              'bg-green-100 text-green-800': product.availability === 'available',
              'bg-yellow-100 text-yellow-800': product.availability === 'limited',
              'bg-red-100 text-red-800': product.availability === 'out-of-stock'
            }"
          >
            {{ getAvailabilityText(product.availability) | translate }}
          </span>
        </div>
      </div>

      <!-- Price -->
      <div class="border-t border-gray-200 pt-6">
        <!-- Company Pricing Badge -->
        <div *ngIf="isCompanyPricing" class="mb-4">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-solar-100 text-solar-800">
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {{ 'b2b.products.partnerPrice' | translate }}
          </span>
        </div>

        <!-- Regular Pricing -->
        <div *ngIf="!isCompanyPricing" class="flex items-center space-x-4 mb-4">
          <span class="text-3xl font-bold text-gray-900 font-['DM_Sans']">
            €{{ product.price.toLocaleString() }}
          </span>
          <span 
            *ngIf="product.originalPrice && product.originalPrice !== product.price" 
            class="text-xl text-gray-500 line-through font-['DM_Sans']"
          >
            €{{ product.originalPrice.toLocaleString() }}
          </span>
          <span 
            *ngIf="product.discount" 
            class="bg-solar-600 text-white px-2 py-1 rounded-full text-sm font-semibold"
          >
            -{{ product.discount }}%
          </span>
        </div>

        <!-- Company Pricing -->
        <div *ngIf="isCompanyPricing" class="space-y-3 mb-4">
          <!-- Retail Price -->
          <div class="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            <span class="text-sm text-gray-600 font-['DM_Sans']">{{ 'b2b.products.retailPrice' | translate }}:</span>
            <span class="text-lg text-gray-500 line-through font-['DM_Sans']">
              €{{ product.price.toLocaleString() }}
            </span>
          </div>
          
          <!-- Company Price -->
          <div class="flex items-center justify-between bg-solar-50 p-4 rounded-lg border-2 border-solar-200">
            <span class="text-base font-semibold text-solar-700 font-['DM_Sans']">{{ 'b2b.products.partnerPrice' | translate }}:</span>
            <span class="text-3xl font-bold text-solar-600 font-['DM_Sans']">
              €{{ getCompanyPrice().toLocaleString() }}
            </span>
          </div>
          
          <!-- Savings -->
          <div class="flex items-center justify-between bg-green-50 p-3 rounded-lg">
            <span class="text-sm font-medium text-green-700 font-['DM_Sans']">{{ 'b2b.products.savings' | translate }}:</span>
            <span class="text-lg font-bold text-green-600 font-['DM_Sans']">
              €{{ getCompanySavings().toLocaleString() }} ({{ COMPANY_DISCOUNT_PERCENTAGE }}% off)
            </span>
          </div>
        </div>

        <p class="text-sm text-gray-600 font-['DM_Sans']">
          {{ 'productDetails.priceIncludesVat' | translate }}
        </p>
      </div>

      <!-- Product Description -->
      <div class="border-t border-gray-200 pt-6">
        <button 
          type="button" 
          (click)="toggleDescription()" 
          class="flex items-center w-full justify-between group focus:outline-none" 
          [attr.aria-expanded]="descriptionOpen" 
          [attr.aria-controls]="'description-content'"
        >
          <h3 class="text-lg font-semibold text-gray-900 font-['Poppins']">{{ 'productDetails.description' | translate }}</h3>
          <svg 
            [ngClass]="{'rotate-180': descriptionOpen, 'rotate-0': !descriptionOpen}" 
            class="w-5 h-5 text-gray-500 transition-transform duration-200" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div id="description-content" *ngIf="descriptionOpen" class="mt-3">
          <p class="text-gray-700 leading-relaxed font-['DM_Sans']">
            {{ product.description }}
          </p>
        </div>
      </div>

      <!-- Product Details -->
      <div class="border-t border-gray-200 pt-6">
        <button 
          type="button" 
          (click)="toggleProductDetails()" 
          class="flex items-center w-full justify-between group focus:outline-none" 
          [attr.aria-expanded]="productDetailsOpen" 
          [attr.aria-controls]="'product-details-content'"
        >
          <h3 class="text-lg font-semibold text-gray-900 font-['Poppins']">{{ 'productDetails.productDetails' | translate }}</h3>
          <svg 
            [ngClass]="{'rotate-180': productDetailsOpen, 'rotate-0': !productDetailsOpen}" 
            class="w-5 h-5 text-gray-500 transition-transform duration-200" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div id="product-details-content" *ngIf="productDetailsOpen" class="mt-4">
        <dl class="grid grid-cols-1 gap-4">
          <div class="flex justify-between">
            <dt class="text-sm font-medium text-gray-500 font-['DM_Sans']">{{ 'productDetails.category' | translate }}:</dt>
            <dd class="text-sm font-['DM_Sans']">
              <button 
                *ngIf="product.category"
                (click)="navigateToCategory(product.category)"
                class="text-solar-600 hover:text-solar-700 hover:underline transition-colors"
              >
                {{ product.category }}
              </button>
              <span *ngIf="!product.category" class="text-gray-500">-</span>
            </dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm font-medium text-gray-500 font-['DM_Sans']">{{ 'productDetails.brand' | translate }}:</dt>
            <dd class="text-sm text-gray-900 font-['DM_Sans']">{{ product.manufacturer }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm font-medium text-gray-500 font-['DM_Sans']">{{ 'productDetails.model' | translate }}:</dt>
            <dd class="text-sm text-gray-900 font-['DM_Sans']">{{ product.model || '-' }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm font-medium text-gray-500 font-['DM_Sans']">{{ 'productDetails.sku' | translate }}:</dt>
            <dd class="text-sm text-gray-900 font-['DM_Sans']">{{ product.sku }}</dd>
          </div>
          <div class="flex justify-between" *ngIf="product.weight">
            <dt class="text-sm font-medium text-gray-500 font-['DM_Sans']">{{ 'productDetails.weight' | translate }}:</dt>
            <dd class="text-sm text-gray-900 font-['DM_Sans']">{{ product.weight }} kg</dd>
          </div>
          <div class="flex justify-between" *ngIf="product.dimensions">
            <dt class="text-sm font-medium text-gray-500 font-['DM_Sans']">{{ 'productDetails.dimensions' | translate }}:</dt>
            <dd class="text-sm text-gray-900 font-['DM_Sans']">{{ product.dimensions }}</dd>
          </div>
        </dl>

        <!-- Specifications Subsection -->
        <ng-container *ngIf="hasSpecifications()">
          <div class="mt-6 pt-6 border-t border-gray-100">
            <button type="button" (click)="toggleSpecifications()" class="flex items-center w-full justify-between group focus:outline-none" [attr.aria-expanded]="specificationsOpen" [attr.aria-controls]="'specifications-content'">
              <h4 class="text-base font-semibold text-gray-900 mb-3 font-['Poppins']">{{ 'productDetails.specifications' | translate }}</h4>
              <svg [ngClass]="{'rotate-180': specificationsOpen, 'rotate-0': !specificationsOpen}" class="w-5 h-5 text-gray-500 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div id="specifications-content" *ngIf="specificationsOpen" class="mt-2">
              <dl class="grid grid-cols-1 gap-3">
                <div *ngFor="let spec of getSpecificationsArray()" class="flex justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <dt class="text-sm font-medium text-gray-600 font-['DM_Sans']">{{ formatSpecificationKey(spec.key) }}:</dt>
                  <dd class="text-sm text-gray-900 font-semibold font-['DM_Sans']">{{ spec.value }}</dd>
                </div>
              </dl>
            </div>
          </div>
        </ng-container>

        <!-- Features Subsection -->
        <ng-container *ngIf="hasFeatures()">
          <div class="mt-6 pt-6 border-t border-gray-100">
            <button type="button" (click)="toggleFeatures()" class="flex items-center w-full justify-between group focus:outline-none" [attr.aria-expanded]="featuresOpen" [attr.aria-controls]="'features-content'">
              <h4 class="text-base font-semibold text-gray-900 mb-3 font-['Poppins']">{{ 'productDetails.features' | translate }}</h4>
              <svg [ngClass]="{'rotate-180': featuresOpen, 'rotate-0': !featuresOpen}" class="w-5 h-5 text-gray-500 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div id="features-content" *ngIf="featuresOpen" class="mt-2">
              <div class="grid grid-cols-1 gap-2">
                <div *ngFor="let feature of product.features" class="flex items-center py-2 px-3 bg-blue-50 rounded-lg">
                  <svg class="w-4 h-4 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span class="text-sm text-blue-900 font-medium font-['DM_Sans']">{{ feature }}</span>
                </div>
              </div>
            </div>
          </div>
        </ng-container>
        </div>
      </div>

      <!-- Certificates -->
      <div class="border-t border-gray-200 pt-6">
        <button 
          type="button" 
          (click)="toggleCertificates()" 
          class="flex items-center w-full justify-between group focus:outline-none" 
          [attr.aria-expanded]="certificatesOpen" 
          [attr.aria-controls]="'certificates-content'"
        >
          <h3 class="text-lg font-semibold text-gray-900 font-['Poppins']">{{ 'productDetails.certifications' | translate }}</h3>
          <svg 
            [ngClass]="{'rotate-180': certificatesOpen, 'rotate-0': !certificatesOpen}" 
            class="w-5 h-5 text-gray-500 transition-transform duration-200" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div id="certificates-content" *ngIf="certificatesOpen" class="mt-4">
          <div class="flex flex-wrap gap-2">
            <span 
              *ngFor="let certificate of product.certificates"
              class="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full font-['DM_Sans']"
            >
              {{ certificate }}
            </span>
          </div>
        </div>
      </div>

      <!-- Quantity and Add to Cart -->
      <div class="border-t border-gray-200 pt-6">
        <div class="flex items-center space-x-4 mb-6">
          <div class="flex items-center">
            <label class="text-sm font-medium text-gray-700 mr-3 font-['DM_Sans']">{{ 'productDetails.quantity' | translate }}:</label>
            <div class="flex items-center border border-gray-300 rounded-md">
              <button 
                (click)="decreaseQuantity()"
                [disabled]="quantity <= 1"
                class="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -
              </button>
              <input 
                type="number" 
                [(ngModel)]="quantity"
                [min]="1"
                [max]="99"
                class="w-16 px-2 py-2 text-center border-0 focus:ring-0 font-['DM_Sans']"
              >
              <button 
                (click)="increaseQuantity()"
                [disabled]="quantity >= 99"
                class="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3">
          <button 
            (click)="addToCart()"
            [disabled]="product.availability === 'out-of-stock'"
            class="w-full px-6 py-3 bg-solar-600 text-white font-semibold rounded-lg hover:bg-solar-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-['DM_Sans']"
          >
            <lucide-angular 
              name="shopping-cart" 
              class="w-6 h-6 inline mr-2"
              [img]="ShoppingCartIcon">
            </lucide-angular>
            {{ product.availability === 'out-of-stock' ? ('productDetails.outOfStock' | translate) : ('productDetails.addToCart' | translate) }}
          </button>
          
          <button 
            (click)="toggleWishlist()"
            [disabled]="(wishlistState$ | async)?.addingToWishlist || (wishlistState$ | async)?.removingFromWishlist === product.id"
            class="w-full px-6 py-3 font-semibold border rounded-lg transition-colors font-['DM_Sans']"
            [ngClass]="{
              'bg-red-50 text-red-700 border-red-300 hover:bg-red-100': (wishlistState$ | async)?.isInWishlist,
              'bg-white text-gray-700 border-gray-300 hover:bg-gray-50': !(wishlistState$ | async)?.isInWishlist,
              'opacity-50 cursor-not-allowed': (wishlistState$ | async)?.addingToWishlist || (wishlistState$ | async)?.removingFromWishlist === product.id
            }"
          >
            <!-- Loading spinner when adding/removing -->
            <svg 
              *ngIf="(wishlistState$ | async)?.addingToWishlist || (wishlistState$ | async)?.removingFromWishlist === product.id" 
              class="w-5 h-5 inline mr-2 animate-spin" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            
            <!-- Heart icon -->
            <svg 
              *ngIf="!((wishlistState$ | async)?.addingToWishlist || (wishlistState$ | async)?.removingFromWishlist === product.id)"
              class="w-5 h-5 inline mr-2" 
              [class.fill-current]="(wishlistState$ | async)?.isInWishlist"
              [class.text-red-500]="(wishlistState$ | async)?.isInWishlist"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            
            <span *ngIf="(wishlistState$ | async)?.isInWishlist">{{ 'productDetails.removeFromWishlist' | translate }}</span>
            <span *ngIf="!(wishlistState$ | async)?.isInWishlist">{{ 'productDetails.addToWishlist' | translate }}</span>
          </button>
        </div>

        <!-- Additional Info -->
        <div class="mt-6 pt-6 border-t border-gray-200">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-2 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span class="font-['DM_Sans']">{{ 'productDetails.freeShipping' | translate }}</span>
            </div>
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-2 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span class="font-['DM_Sans']">{{ 'productDetails.twoYearWarranty' | translate }}</span>
            </div>
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-2 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
              </svg>
              <span class="font-['DM_Sans']">{{ 'productDetails.easyReturns' | translate }}</span>
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
    .rotate-180 { transform: rotate(180deg); }
    .rotate-0 { transform: rotate(0deg); }
  `]
})
export class ProductInfoComponent implements OnInit, OnDestroy {
  @Input() product!: Product;
  @Input() isCompanyPricing: boolean = false;

  quantity: number = 1;

  // Partner discount percentage (additional discount for company pricing)
  readonly COMPANY_DISCOUNT_PERCENTAGE = 15;

  readonly StarIcon = Star;
  readonly StarHalfIcon = StarHalf;
  readonly ShoppingCartIcon = ShoppingCart;

  private store = inject(Store);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private translationService = inject(TranslationService);

  private destroy$ = new Subject<void>();

  // Combined wishlist state observable for template
  wishlistState$!: Observable<{
    isInWishlist: boolean;
    addingToWishlist: boolean;
    removingFromWishlist: string | null;
  }>;

  // Product reviews observables
  averageRating$ = this.store.select(selectAverageRating);
  reviewCount$ = this.store.select(selectReviewCount);

  // Collapsible sections - all collapsed by default
  descriptionOpen = false;
  productDetailsOpen = false;
  certificatesOpen = false;
  specificationsOpen = false;
  featuresOpen = false;

  ngOnInit(): void {
    // Create combined observable for template
    this.wishlistState$ = combineLatest([
      this.store.select(selectIsProductInWishlist(this.product.id)),
      this.store.select(selectAddingToWishlist),
      this.store.select(selectRemovingFromWishlist)
    ]).pipe(
      map(([isInWishlist, addingToWishlist, removingFromWishlist]) => ({
        isInWishlist,
        addingToWishlist,
        removingFromWishlist
      }))
    );

    // Load wishlist data
    this.store.dispatch(WishlistActions.loadWishlist());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getStarArray(rating: number): number[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(1);
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(0.5);
    }

    // Add empty stars to complete 5 stars
    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(0);
    }

    return stars;
  }

  getAvailabilityText(availability: string): string {
    switch (availability) {
      case 'available': return 'productDetails.inStock';
      case 'limited': return 'productDetails.limitedStock';
      case 'out-of-stock': return 'productDetails.outOfStock';
      default: return '';
    }
  }

  increaseQuantity(): void {
    if (this.quantity < 99) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    this.store.dispatch(CartActions.addToCart({ productId: this.product.id, quantity: this.quantity }));
  }

  toggleWishlist(): void {
    // Check authentication first
    this.store.select(selectCurrentUser).pipe(
      takeUntil(this.destroy$),
      take(1)
    ).subscribe(user => {
      if (!user) {
        this.toastService.showError(this.translationService.translate('productDetails.loginRequiredForWishlist'));
        return;
      }

      // Get current wishlist state and toggle
      this.store.select(selectIsProductInWishlist(this.product.id)).pipe(
        take(1)
      ).subscribe(isInWishlist => {
        if (isInWishlist) {
          this.store.dispatch(WishlistActions.removeFromWishlist({ productId: this.product.id }));
        } else {
          this.store.dispatch(WishlistActions.addToWishlist({ productId: this.product.id }));
        }
      });
    });
  }

  getCompanyPrice(): number {
    return this.product.price * (1 - this.COMPANY_DISCOUNT_PERCENTAGE / 100);
  }

  getCompanySavings(): number {
    return this.product.price - this.getCompanyPrice();
  }

  getSpecificationsArray(): { key: string; value: string }[] {
    if (!this.product.specifications) {
      return [];
    }
    return Object.entries(this.product.specifications).map(([key, value]) => ({
      key,
      value: String(value)
    }));
  }

  formatSpecificationKey(key: string): string {
    return key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
  }

  hasSpecifications(): boolean {
    return !!(this.product.specifications && Object.keys(this.product.specifications).length > 0);
  }

  hasFeatures(): boolean {
    return !!(this.product.features && this.product.features.length > 0);
  }

  toggleDescription() {
    this.descriptionOpen = !this.descriptionOpen;
  }

  toggleProductDetails() {
    this.productDetailsOpen = !this.productDetailsOpen;
  }

  toggleCertificates() {
    this.certificatesOpen = !this.certificatesOpen;
  }

  toggleSpecifications() {
    this.specificationsOpen = !this.specificationsOpen;
  }

  toggleFeatures() {
    this.featuresOpen = !this.featuresOpen;
  }

  scrollToReviews() {
    const reviewsElement = document.getElementById('reviews');
    if (reviewsElement) {
      reviewsElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  navigateToCategory(categoryName: string) {
    this.router.navigate(['/proizvodi'], {
      queryParams: { category: categoryName }
    });
  }
} 