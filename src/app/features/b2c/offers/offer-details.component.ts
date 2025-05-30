import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, switchMap, map } from 'rxjs/operators';
import { OffersService, Offer } from './services/offers.service';
import { AddToCartButtonComponent } from '../cart/components/add-to-cart-button/add-to-cart-button.component';
import { SupabaseService } from '../../../services/supabase.service';
import { CartSidebarComponent } from "../cart/components/cart-sidebar/cart-sidebar.component";

@Component({
  selector: 'app-offer-details',
  standalone: true,
  imports: [CommonModule, AddToCartButtonComponent, CartSidebarComponent],
  template: `
    <div class="min-h-screen bg-gray-50" *ngIf="offer$ | async as offer; else loadingTemplate">
      <!-- Hero Section -->
      <div class="relative bg-gradient-to-r from-[#0ACF83] to-[#0ACFAC] text-white py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <!-- Offer Image -->
            <div class="relative">
              <img 
                [src]="offer.imageUrl" 
                [alt]="offer.title"
                class="w-full h-96 object-cover rounded-2xl shadow-2xl"
              >
              <!-- Discount Badge -->
              <div class="absolute top-6 left-6 bg-red-500 text-white text-lg font-bold px-4 py-3 rounded-full shadow-lg">
                -{{ offer.discountPercentage }}%
              </div>
            </div>

            <!-- Offer Info -->
            <div>
              <div class="mb-6">
                <span class="inline-block bg-white/20 text-white text-sm font-semibold px-3 py-1 rounded-full mb-4">
                  {{ getOfferTypeDisplay(offer.type) }}
                </span>
                <h1 class="text-5xl lg:text-6xl font-bold mb-6 font-['Poppins']">
                  {{ offer.title }}
                </h1>
                <p class="text-xl lg:text-2xl text-white/90 font-['DM_Sans']">
                  {{ offer.description || offer.shortDescription }}
                </p>
              </div>

              <!-- Pricing -->
              <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
                <div class="flex items-center gap-4 mb-4">
                  <span class="text-2xl text-white/70 line-through font-medium">
                    {{ offer.originalPrice | currency:'EUR':'symbol':'1.2-2' }}
                  </span>
                  <span class="text-4xl font-bold text-white">
                    {{ offer.discountedPrice | currency:'EUR':'symbol':'1.2-2' }}
                  </span>
                </div>
                <div class="text-lg text-white/90">
                  You save {{ (offer.originalPrice - offer.discountedPrice) | currency:'EUR':'symbol':'1.2-2' }}
                </div>
              </div>

              <!-- Coupon Code -->
              <div *ngIf="offer.couponCode" class="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-sm text-white/70">Coupon Code:</span>
                    <div class="text-xl font-bold text-white font-mono">{{ offer.couponCode }}</div>
                  </div>
                  <button 
                    (click)="copyCouponCode(offer.couponCode!)"
                    class="bg-white text-[#0ACF83] px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    {{ copiedCoupon ? 'Copied!' : 'Copy' }}
                  </button>
                </div>
              </div>

              <!-- Offer Validity -->
              <div *ngIf="offer.endDate" class="bg-red-500/20 border border-red-300/30 rounded-xl p-4 mb-6">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-red-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V5z"/>
                  </svg>
                  <span class="text-white font-semibold">
                    Offer expires: {{ offer.endDate | date:'medium' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Products Section -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 class="text-3xl font-bold text-gray-900 mb-8 font-['Poppins']">
          Products Included in This Offer
        </h2>

        <!-- Product Cards -->
        <div *ngIf="relatedProducts$ | async as products" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            *ngFor="let product of products; trackBy: trackByProductId"
            class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <!-- Product Image -->
            <div class="relative h-64 bg-gray-50 overflow-hidden">
              <img 
                [src]="getProductImage(product)"
                [alt]="product.name"
                class="w-full h-full object-cover"
              >
              <!-- Offer Badge -->
              <div class="absolute top-4 left-4 bg-[#0ACF83] text-white text-sm font-bold px-3 py-2 rounded-full">
                Special Offer
              </div>
            </div>

            <!-- Product Info -->
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-2 font-['Poppins']">
                {{ product.name }}
              </h3>
              <p class="text-gray-600 text-sm mb-4 font-['DM_Sans'] line-clamp-2">
                {{ product.description }}
              </p>

              <!-- Product Price -->
              <div class="flex items-center gap-3 mb-4">
                <span class="text-lg text-gray-500 line-through">
                  {{ product.price | currency:'EUR':'symbol':'1.2-2' }}
                </span>
                <span class="text-xl font-bold text-[#0ACF83]">
                  {{ calculateDiscountedPrice(product.price, offer.discountPercentage) | currency:'EUR':'symbol':'1.2-2' }}
                </span>
              </div>

              <!-- Add to Cart -->
              <div class="space-y-3">
                <app-add-to-cart-button 
                  [productId]="product.id" 
                  [quantity]="1" 
                  buttonText="Add to Cart"
                  [fullWidth]="true"
                  size="md">
                </app-add-to-cart-button>
                
                <button 
                  (click)="navigateToProduct(product.id)"
                  class="w-full px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold font-['DM_Sans']"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- No Products Message -->
        <div *ngIf="!(relatedProducts$ | async) || (relatedProducts$ | async)?.length === 0" class="text-center py-12">
          <div class="bg-white rounded-2xl p-12 shadow-lg">
            <div class="text-gray-400 mb-4">
              <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4.5"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2 font-['Poppins']">General Offer</h3>
            <p class="text-gray-600 font-['DM_Sans']">This offer applies to multiple products. Browse our catalog to find eligible items.</p>
            <button 
              (click)="navigateToProducts()"
              class="mt-6 px-6 py-3 bg-[#0ACF83] text-white font-semibold rounded-lg hover:bg-[#09b574] transition-colors font-['DM_Sans']"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>

      <!-- Offer Details Section -->
      <div class="bg-white py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Offer Description -->
            <div class="lg:col-span-2">
              <h2 class="text-3xl font-bold text-gray-900 mb-6 font-['Poppins']">
                About This Offer
              </h2>
              <div class="prose prose-lg max-w-none">
                <p class="text-gray-600 leading-relaxed font-['DM_Sans']">
                  {{ offer.description || 'Take advantage of this limited-time offer to get amazing savings on premium solar and energy products. Our special promotions are designed to help you start your journey toward sustainable energy while saving money.' }}
                </p>
              </div>
            </div>

            <!-- Offer Highlights -->
            <div class="bg-gray-50 rounded-2xl p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-4 font-['Poppins']">
                Offer Highlights
              </h3>
              <ul class="space-y-3">
                <li class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-[#0ACF83]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                  </svg>
                  <span class="text-gray-700 font-['DM_Sans']">{{ offer.discountPercentage }}% Discount</span>
                </li>
                <li class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-[#0ACF83]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                  </svg>
                  <span class="text-gray-700 font-['DM_Sans']">Limited Time Only</span>
                </li>
                <li class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-[#0ACF83]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                  </svg>
                  <span class="text-gray-700 font-['DM_Sans']">Premium Quality Products</span>
                </li>
                <li class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-[#0ACF83]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                  </svg>
                  <span class="text-gray-700 font-['DM_Sans']">Free Shipping Available</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <app-cart-sidebar></app-cart-sidebar>

    <!-- Loading Template -->
    <ng-template #loadingTemplate>
      <div class="min-h-screen bg-gray-50 flex items-center justify-center">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-[#0ACF83] border-t-transparent mx-auto mb-4"></div>
          <p class="text-gray-600 font-['DM_Sans']">Loading offer details...</p>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
    
    :host {
      display: block;
    }

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .prose {
      max-width: none;
    }
  `]
})
export class OfferDetailsComponent implements OnInit, OnDestroy {
  offer$: Observable<Offer | null>;
  relatedProducts$: Observable<any[]>;
  copiedCoupon = false;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private offersService: OffersService,
    private supabaseService: SupabaseService
  ) {
    this.offer$ = this.route.params.pipe(
      switchMap(params => this.offersService.getOfferById(params['id'])),
      takeUntil(this.destroy$)
    );

    this.relatedProducts$ = this.offer$.pipe(
      switchMap(offer => {
        if (!offer) return [];
        return this.getRelatedProducts(offer);
      }),
      takeUntil(this.destroy$)
    );
  }

  ngOnInit(): void {
    // Scroll to top when component loads
    window.scrollTo(0, 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getRelatedProducts(offer: Offer): Observable<any[]> {
    // For now, we'll get a few featured products as related products
    // In a real app, you might have specific product mappings for offers
    return new Observable(observer => {
      this.supabaseService.getProducts({ featured: true, limit: 3 })
        .then(products => {
          observer.next(products || []);
          observer.complete();
        })
        .catch(error => {
          console.error('Error fetching related products:', error);
          observer.next([]);
          observer.complete();
        });
    });
  }

  getOfferTypeDisplay(type?: string): string {
    const typeMap: { [key: string]: string } = {
      'seasonal_sale': 'Seasonal Sale',
      'flash_sale': 'Flash Sale',
      'free_shipping': 'Free Shipping',
      'bundle_deal': 'Bundle Deal',
      'percentage_discount': 'Special Discount',
      'fixed_amount_discount': 'Fixed Discount',
      'first_time_customer': 'New Customer Offer'
    };
    return typeMap[type || ''] || 'Special Offer';
  }

  getProductImage(product: any): string {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0].url || product.images[0];
    }
    return 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&h=500&fit=crop';
  }

  calculateDiscountedPrice(originalPrice: number, discountPercentage: number): number {
    return originalPrice * (1 - discountPercentage / 100);
  }

  copyCouponCode(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      this.copiedCoupon = true;
      setTimeout(() => {
        this.copiedCoupon = false;
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy coupon code:', err);
    });
  }

  trackByProductId(index: number, product: any): string {
    return product.id;
  }

  navigateToProduct(productId: string): void {
    this.router.navigate(['/products', productId]);
  }

  navigateToProducts(): void {
    this.router.navigate(['/products']);
  }
} 