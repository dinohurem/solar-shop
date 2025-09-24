import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Observable, from, of, firstValueFrom, BehaviorSubject } from 'rxjs';
import { takeUntil, switchMap, map, catchError, filter } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { SupabaseService } from '../../../../services/supabase.service';
import { applyB2BCoupon, addAllToB2BCartFromOffer, addAllToB2BCartFromOfferSuccess } from '../../cart/store/b2b-cart.actions';
import { selectB2BCartHasCompanyId, selectB2BCartCompanyId } from '../../cart/store/b2b-cart.selectors';
import { ToastService } from '../../../../shared/services/toast.service';
import { TranslationService } from '../../../../shared/services/translation.service';
import { B2BCartService } from '../../cart/services/b2b-cart.service';

interface PartnerOffer {
  id: string;
  title: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  discount_type?: 'percentage' | 'fixed_amount';
  discount_value?: number;
  imageUrl: string;
  description: string;
  shortDescription: string;
  type: string;
  status: string;
  couponCode?: string;
  startDate: string;
  endDate: string;
  featured: boolean;
  isB2B: boolean;
  applicable_category_ids?: string[];
}

interface PartnerProduct {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  category: string;
  sku: string;
  stock_quantity?: number;
  discount_percentage?: number;
  discount_amount?: number;
  has_partner_pricing?: boolean;
  partner_price?: number;
  partner_discounted_price?: number;
  partner_savings?: number;
}

@Component({
  selector: 'app-partners-offer-details',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="min-h-screen bg-gray-50" *ngIf="offer; else loadingTemplate">
      <!-- Hero Section -->
      <div class="relative bg-gradient-to-r from-solar-600 to-solar-800 text-white py-20">
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
              <div class="absolute top-6 left-6 bg-accent-500 text-white text-lg font-bold px-4 py-3 rounded-full shadow-lg">
                <span *ngIf="isPercentageDiscount()">-{{ offer.discount_value || offer.discountPercentage }}%</span>
                <span *ngIf="isFixedAmountDiscount()">{{ offer.discount_value | currency:'EUR':'symbol':'1.0-2' }} OFF</span>
              </div>
              <!-- Partner Only Badge -->
              <div class="absolute top-6 right-6 bg-solar-100 text-solar-800 text-sm font-bold px-3 py-2 rounded-full shadow-lg">
                {{ 'b2b.offers.partnerOnly' | translate }}
              </div>
            </div>

            <!-- Offer Info -->
            <div>
              <div class="mb-6">
                <h1 class="text-5xl lg:text-6xl font-bold mb-6 font-['Poppins']">
                  {{ offer.title }}
                </h1>
                <p class="text-xl lg:text-2xl text-white/90 font-['DM_Sans']">
                  {{ offer.description || offer.shortDescription }}
                </p>
              </div>

              <!-- Partner Pricing -->
              <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
                <!-- Loading state -->
                <div *ngIf="isLoading" class="text-center">
                  <div class="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto mb-2"></div>
                  <p class="text-white/70">{{ 'common.loading' | translate }}</p>
                </div>

                <!-- Category offer (no specific products) -->
                <div *ngIf="!isLoading && isCategoryOffer" class="text-center">
                  <h3 class="text-lg font-semibold text-white mb-2">{{ 'b2b.offers.categoryDiscount' | translate }}</h3>
                  <div class="text-4xl font-bold text-white mb-2">
                    <span *ngIf="isPercentageDiscount()">{{ offer.discount_value || offer.discountPercentage }}%</span>
                    <span *ngIf="isFixedAmountDiscount()">{{ offer.discount_value | currency:'EUR':'symbol':'1.0-2' }}</span>
                    <span class="text-lg text-white/70 ml-2">{{ 'b2b.offers.discount' | translate }}</span>
                  </div>
                  <div class="text-xl text-white/90 mb-3" *ngIf="offerCategoryName">
                    {{ 'b2b.offers.forCategory' | translate }}: <span class="font-semibold">{{ offerCategoryName }}</span>
                  </div>
                  <p class="text-white/70">{{ 'b2b.offers.categoryDiscountDescription' | translate }}</p>
                </div>

                <!-- Product offer section -->
                <div *ngIf="!isLoading && !isCategoryOffer">
                  <!-- Percentage discount -->
                  <div *ngIf="isPercentageDiscount()" class="text-center">
                    <h3 class="text-lg font-semibold text-white mb-2">{{ 'b2b.offers.productDiscount' | translate }}</h3>
                    <div class="text-4xl font-bold text-white mb-2">
                      {{ offer.discount_value || offer.discountPercentage }}%
                      <span class="text-lg text-white/70 ml-2">{{ 'b2b.offers.discount' | translate }}</span>
                    </div>
                    <p class="text-white/70">{{ 'b2b.offers.percentageDiscountDescription' | translate }}</p>
                  </div>

                  <!-- Fixed amount discount -->
                  <div *ngIf="isFixedAmountDiscount()">
                    <!-- Show partner pricing if available -->
                    <div *ngIf="hasPartnerPricing" class="text-center">
                      <h3 class="text-lg font-semibold text-white mb-2">{{ 'b2b.products.partnerPrice' | translate }}</h3>

                      <!-- Partner Price vs Final Price -->
                      <div class="flex items-center gap-4 mb-4 justify-center">
                        <div class="text-center">
                          <div class="text-sm text-white/70">{{ 'b2b.products.partnerPrice' | translate }}</div>
                          <span class="text-2xl text-white/70 line-through font-medium">
                            {{ totalPartnerPrice | currency:'EUR':'symbol':'1.2-2' }}
                          </span>
                        </div>
                        <div class="text-center">
                          <div class="text-sm text-white/70">{{ 'b2b.offers.finalPrice' | translate }}</div>
                          <span class="text-4xl font-bold text-white">
                            {{ totalDiscountedPrice | currency:'EUR':'symbol':'1.2-2' }}
                          </span>
                        </div>
                      </div>

                      <!-- Offer Discount Applied -->
                      <div class="bg-white/10 rounded-lg p-3 mb-4">
                        <div class="text-sm text-white/70">{{ 'admin.offersForm.offerDiscount' | translate }}</div>
                        <div class="text-lg font-bold text-accent-200">
                          <span *ngIf="isPercentageDiscount()">-{{ offer.discount_value || offer.discountPercentage }}%</span>
                          <span *ngIf="isFixedAmountDiscount()">-{{ offer.discount_value | currency:'EUR':'symbol':'1.0-2' }} {{ 'b2b.offers.perProduct' | translate }}</span>
                        </div>
                      </div>

                      <div class="grid grid-cols-2 gap-4 text-sm">
                        <div class="text-center">
                          <div class="text-white/70">{{ 'b2b.offers.totalSavings' | translate }}</div>
                          <div class="text-lg font-bold text-accent-200">
                            {{ totalSavings | currency:'EUR':'symbol':'1.2-2' }}
                          </div>
                        </div>
                        <div class="text-center">
                          <div class="text-white/70">{{ 'admin.offersForm.totalDiscount' | translate }}</div>
                          <div class="text-lg font-bold text-accent-200">
                            {{ totalDiscountPercentage }}%
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- No partner pricing message -->
                    <div *ngIf="!hasPartnerPricing" class="text-center">
                      <h3 class="text-lg font-semibold text-white mb-2">{{ 'b2b.offers.contactSupport' | translate }}</h3>
                      <p class="text-white/70">{{ 'b2b.offers.contactSupportDescription' | translate }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Coupon Code -->
              <div *ngIf="offer.couponCode" class="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-sm text-white/70">{{ 'b2b.offers.couponCode' | translate }}:</span>
                    <div class="text-xl font-bold text-white font-mono">{{ offer.couponCode }}</div>
                  </div>
                  <button
                    (click)="copyCouponCode(offer.couponCode!)"
                    class="bg-white text-solar-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    {{ copiedCoupon ? ('offers.copied' | translate) : ('b2b.offers.copy' | translate) }}
                  </button>
                </div>
              </div>

              <!-- Offer Validity -->
              <div *ngIf="offer.endDate" class="bg-accent-500/20 border border-accent-300/30 rounded-xl p-4 mb-6">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-accent-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V5z"/>
                  </svg>
                  <span class="text-white font-semibold">
                    {{ 'b2b.offers.expires' | translate }}: {{ formatDate(offer.endDate) }}
                  </span>
                </div>
              </div>

              <!-- Action Button -->
              <div class="flex space-x-4">
                <!-- Show Claim Offer only if partner pricing is available and offer not expired -->
                <button
                  *ngIf="!isOfferExpired(offer.endDate) && hasPartnerPricing"
                  (click)="claimOffer(offer)"
                  class="flex-1 bg-white text-solar-600 py-3 px-6 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg">
                  {{ 'b2b.offers.claimOffer' | translate }}
                </button>
                <!-- Show Contact Support if no partner pricing -->
                <button
                  *ngIf="!hasPartnerPricing"
                  (click)="contactSupport()"
                  class="flex-1 bg-yellow-500 text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-yellow-600 transition-colors shadow-lg">
                  {{ 'b2b.offers.contactSupport' | translate }}
                </button>
                <!-- Show expired button -->
                <button
                  *ngIf="isOfferExpired(offer.endDate)"
                  disabled
                  class="flex-1 bg-gray-400 text-white py-3 px-6 rounded-lg font-bold text-lg cursor-not-allowed shadow-lg">
                  {{ 'b2b.offers.expired' | translate }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Products Included Section -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" *ngIf="!isCategoryOffer">
        <h2 class="text-3xl font-bold text-gray-900 mb-8 font-['Poppins']">
          {{ 'b2b.offers.productsIncluded' | translate }}
        </h2>

        <!-- Add All to Cart Button - only show if partner pricing is available -->
        <div *ngIf="products.length && hasPartnerPricing" class="mb-8">
          <button
            (click)="addAllToCart()"
            class="w-full md:w-auto px-8 py-3 bg-solar-600 text-white font-semibold rounded-lg hover:bg-solar-700 transition-colors font-['DM_Sans'] mb-6"
          >
            {{ 'offers.addAllToCart' | translate }}
          </button>
        </div>

        <!-- Contact Support Message - show if no partner pricing -->
        <div *ngIf="products.length && !hasPartnerPricing" class="mb-8">
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h3 class="text-lg font-semibold text-yellow-800 mb-2">{{ 'b2b.offers.contactSupport' | translate }}</h3>
            <p class="text-yellow-700 mb-4">{{ 'b2b.offers.contactSupportForPricingDescription' | translate }}</p>
            <button
              (click)="contactSupport()"
              class="px-6 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
            >
              {{ 'b2b.offers.contactSupport' | translate }}
            </button>
          </div>
        </div>

        <!-- Product Cards -->
        <div *ngIf="products.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            *ngFor="let product of products; trackBy: trackByProductId"
            class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <!-- Product Image -->
            <div class="relative h-64 bg-gray-50 overflow-hidden">
              <img
                [src]="product.imageUrl"
                [alt]="product.name"
                class="w-full h-full object-cover"
              >
              <!-- Partner Exclusive Badge -->
              <div class="absolute top-4 left-4 bg-solar-600 text-white text-xs font-bold px-3 py-2 rounded-full">
                {{ 'offers.specialOffer' | translate }}
              </div>
              <!-- Discount Badge -->
              <div class="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                <span *ngIf="isPercentageDiscount()">-{{ offer.discount_value || offer.discountPercentage }}%</span>
                <span *ngIf="isFixedAmountDiscount()">{{ offer.discount_value | currency:'EUR':'symbol':'1.0-2' }} OFF</span>
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

              <!-- Pricing Comparison -->
              <div class="space-y-3 mb-4">
                <!-- Retail Price (Always crossed out) -->
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-500">{{ 'b2b.products.retailPrice' | translate }}:</span>
                  <span class="text-lg text-gray-500 line-through">
                    {{ product.price | currency:'EUR':'symbol':'1.2-2' }}
                  </span>
                </div>

                <!-- Partner Price (Before Offer Discount) - Only show for fixed amount or when different from final price -->
                <div *ngIf="product.has_partner_pricing && (isFixedAmountDiscount() || product.partner_price !== product.partner_discounted_price)" class="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                  <span class="text-sm font-medium text-gray-700">{{ 'b2b.products.partnerPrice' | translate }}:</span>
                  <span class="text-lg text-gray-500 line-through">
                    {{ product.partner_price | currency:'EUR':'symbol':'1.2-2' }}
                  </span>
                </div>

                <!-- Final Partner Price (After All Discounts) - HIGHLIGHTED -->
                <div *ngIf="product.has_partner_pricing" class="flex items-center justify-between bg-gradient-to-r from-solar-50 to-green-50 p-3 rounded-lg border-2 border-solar-200 shadow-sm">
                  <div class="flex flex-col">
                    <span class="text-sm font-medium text-solar-700">{{ 'b2b.offers.yourPrice' | translate }}:</span>
                    <span class="text-xs text-gray-600">({{ 'b2b.offers.afterAllDiscounts' | translate }})</span>
                  </div>
                  <div class="text-right">
                    <span class="text-2xl font-bold text-solar-600">
                      {{ product.partner_discounted_price | currency:'EUR':'symbol':'1.2-2' }}
                    </span>
                    <!-- Show discount percentage if applied -->
                    <div *ngIf="offer.discount_type" class="text-xs text-green-600 font-medium">
                      <span *ngIf="isPercentageDiscount()">-{{ offer.discount_value || offer.discountPercentage }}% {{ 'b2b.offers.offerDiscount' | translate }}</span>
                      <span *ngIf="isFixedAmountDiscount()">-{{ offer.discount_value | currency:'EUR':'symbol':'1.0-2' }} {{ 'b2b.offers.offerDiscount' | translate }}</span>
                    </div>
                  </div>
                </div>

                <!-- No Partner Price -->
                <div *ngIf="!product.has_partner_pricing" class="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                  <span class="text-sm font-medium text-gray-700">{{ 'b2b.products.partnerPrice' | translate }}:</span>
                  <span class="text-lg font-medium text-gray-500">
                    {{ 'b2b.offers.contactSupport' | translate }}
                  </span>
                </div>

                <!-- Total Savings Breakdown -->
                <div *ngIf="product.has_partner_pricing" class="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-green-700">{{ 'b2b.products.totalSavings' | translate }}:</span>
                    <span class="text-lg font-bold text-green-600">
                      {{ product.partner_savings | currency:'EUR':'symbol':'1.2-2' }}
                    </span>
                  </div>
                  <!-- Savings breakdown -->
                  <div class="text-xs text-green-600 space-y-1">
                    <div class="flex justify-between">
                      <span>{{ 'b2b.offers.fromRetailPrice' | translate }}:</span>
                      <span>{{ (product.price - (product.partner_discounted_price || 0)) | currency:'EUR':'symbol':'1.2-2' }}</span>
                    </div>
                    <div *ngIf="(product.partner_price || 0) !== (product.partner_discounted_price || 0)" class="flex justify-between">
                      <span>{{ 'b2b.offers.additionalOfferDiscount' | translate }}:</span>
                      <span>{{ ((product.partner_price || 0) - (product.partner_discounted_price || 0)) | currency:'EUR':'symbol':'1.2-2' }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Add to Cart -->
              <div class="space-y-3">
                <!-- Add to Cart button - only show if partner pricing is available -->
                <button
                  *ngIf="product.has_partner_pricing"
                  (click)="addToCart(product)"
                  class="w-full px-4 py-3 bg-solar-600 text-white rounded-lg hover:bg-solar-700 transition-colors font-semibold font-['DM_Sans']"
                >
                  {{ 'b2b.offers.addToCartPartnerPrice' | translate }}
                </button>

                <!-- No partner pricing message -->
                <div *ngIf="!product.has_partner_pricing" class="w-full px-4 py-3 bg-gray-100 text-gray-600 rounded-lg text-center font-medium">
                  {{ 'b2b.offers.contactSupportForPricing' | translate }}
                </div>

                <button
                  (click)="navigateToProduct(product.id)"
                  class="w-full px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold font-['DM_Sans']"
                >
                  {{ 'b2b.offers.viewDetails' | translate }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- No Products Message -->
        <div *ngIf="!products.length" class="text-center py-12">
          <div class="bg-white rounded-2xl p-12 shadow-lg">
            <div class="text-gray-400 mb-4">
              <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4.5"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2 font-['Poppins']">{{ 'b2b.offers.generalOffer' | translate }}</h3>
            <p class="text-gray-600 font-['DM_Sans']">{{ 'b2b.offers.generalOfferDescription' | translate }}</p>
            <button
              (click)="navigateToProducts()"
              class="mt-6 px-6 py-3 bg-solar-600 text-white font-semibold rounded-lg hover:bg-solar-700 transition-colors font-['DM_Sans']"
            >
              {{ 'b2b.offers.browseProducts' | translate }}
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
                {{ 'offers.aboutThisOffer' | translate }}
              </h2>
              <div class="prose prose-lg max-w-none">
                <p class="text-gray-600 leading-relaxed font-['DM_Sans']">
                  {{ offer.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Template -->
    <ng-template #loadingTemplate>
      <div class="min-h-screen bg-gray-50 flex items-center justify-center">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-solar-600 border-t-transparent mx-auto mb-4"></div>
          <p class="text-gray-600 font-['DM_Sans']">{{ 'common.loading' | translate }}</p>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class PartnersOfferDetailsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private supabaseService = inject(SupabaseService);
  private store = inject(Store);
  private actions$ = inject(Actions);
  private toastService = inject(ToastService);
  private translationService = inject(TranslationService);
  private b2bCartService = inject(B2BCartService);

  offer: PartnerOffer | null = null;
  products: PartnerProduct[] = [];
  copiedCoupon = false;
  isLoading = true;
  isCategoryOffer = false;
  offerCategoryName = '';
  hasPartnerPricing = false;
  totalPartnerPrice = 0;
  totalDiscountedPrice = 0;
  totalSavings = 0;
  totalDiscountPercentage = 0;

  private destroy$ = new Subject<void>();
  private offerProductsData: any[] = [];

  // Observables
  userCompanyId$ = this.store.select(selectB2BCartCompanyId);
  hasCompanyId$ = this.store.select(selectB2BCartHasCompanyId);

  // Helper methods for discount type checking
  isPercentageDiscount(): boolean {
    return !this.offer?.discount_type || this.offer.discount_type === 'percentage';
  }

  isFixedAmountDiscount(): boolean {
    return this.offer?.discount_type === 'fixed_amount';
  }

  async ngOnInit(): Promise<void> {
    const offerId = this.route.snapshot.params['id'];
    await this.loadOfferData(offerId);
    window.scrollTo(0, 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadOfferData(offerId: string): Promise<void> {
    try {
      this.isLoading = true;

      // Load offer
      await this.loadOffer(offerId);

      if (!this.offer) {
        return;
      }

      // Get company ID
      const companyId = await firstValueFrom(this.userCompanyId$);

      // Load products
      await this.loadProducts(offerId, companyId);

      // Determine if this is a category offer
      this.isCategoryOffer = this.products.length === 0 &&
                           !!this.offer.applicable_category_ids &&
                           this.offer.applicable_category_ids.length > 0;

      // Calculate totals if fixed amount discount
      if (this.isFixedAmountDiscount() && this.products.length > 0) {
        this.calculateTotals();
      }

    } catch (error) {
      console.error('Error loading offer data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async loadOffer(offerId: string): Promise<void> {
    try {
      const offer = await this.supabaseService.getTableById('offers', offerId);

      if (!offer || !offer.is_b2b) {
        console.error('Offer not found or not a B2B offer');
        return;
      }

      const originalPrice = offer.original_price || 0;
      const discountPercentage = (offer.discount_type === 'percentage' || !offer.discount_type) ? offer.discount_value : 0;
      let discountedPrice = offer.discounted_price || 0;

      if (discountedPrice === 0 && originalPrice > 0) {
        if ((offer.discount_type === 'percentage' || !offer.discount_type) && offer.discount_value > 0) {
          discountedPrice = originalPrice * (1 - offer.discount_value / 100);
        } else if (offer.discount_type === 'fixed_amount' && offer.discount_value > 0) {
          discountedPrice = Math.max(0, originalPrice - offer.discount_value);
        }
      }

      this.offer = {
        id: offer.id,
        title: offer.title,
        originalPrice: originalPrice,
        discountedPrice: discountedPrice,
        discountPercentage: discountPercentage,
        discount_type: offer.discount_type,
        discount_value: offer.discount_value,
        imageUrl: offer.image_url || 'assets/images/product-placeholder.svg',
        description: offer.description || '',
        shortDescription: offer.short_description || '',
        type: 'partner-exclusive',
        status: offer.status || 'active',
        couponCode: offer.code,
        startDate: offer.start_date || '',
        endDate: offer.end_date || '',
        featured: offer.featured || false,
        isB2B: offer.is_b2b,
        applicable_category_ids: offer.applicable_category_ids || []
      };

      // Load category name if applicable
      if (this.offer.applicable_category_ids && this.offer.applicable_category_ids.length > 0) {
        await this.loadOfferCategoryName(this.offer.applicable_category_ids[0]);
      }
    } catch (error) {
      console.error('Error loading offer:', error);
    }
  }

  private async loadOfferCategoryName(categoryId: string): Promise<void> {
    try {
      const { data, error } = await this.supabaseService.client
        .from('categories')
        .select('name')
        .eq('id', categoryId)
        .single();

      if (data && !error) {
        this.offerCategoryName = data.name;
      }
    } catch (error) {
      console.error('Error loading category name:', error);
    }
  }

  private async loadProducts(offerId: string, companyId: string | null): Promise<void> {
    try {
      const { data, error } = await this.supabaseService.client
        .from('offer_products')
        .select(`
          *,
          products (
            id,
            name,
            description,
            price,
            sku,
            stock_quantity,
            images,
            category_id,
            categories (
              name
            )
          )
        `)
        .eq('offer_id', offerId)
        .order('sort_order');

      if (error) {
        console.error('Error loading offer products:', error);
        return;
      }

      this.offerProductsData = data || [];

      if (!data || data.length === 0) {
        this.products = [];
        return;
      }

      // Process products with partner pricing
      this.products = await Promise.all(
        data.map(async (offerProduct: any) => {
          const productId = offerProduct.products.id;
          let partnerPrice = 0;
          let hasPartnerPricing = false;

          // Check partner pricing if company ID exists
          if (companyId) {
            try {
              const partnerPricing = await this.b2bCartService.getPartnerPricingDetails(productId, companyId);
              if (partnerPricing && partnerPricing.price_tier_1 > 0) {
                partnerPrice = partnerPricing.price_tier_1;
                hasPartnerPricing = true;
              }
            } catch (error) {
              console.warn(`Error getting partner pricing for product ${productId}:`, error);
            }
          }

          // Calculate discounted price
          let partnerDiscountedPrice = partnerPrice;
          if (hasPartnerPricing && this.offer) {
            if (this.isPercentageDiscount()) {
              partnerDiscountedPrice = partnerPrice * (1 - (this.offer.discount_value || 0) / 100);
            } else if (this.isFixedAmountDiscount()) {
              partnerDiscountedPrice = Math.max(0, partnerPrice - (this.offer.discount_value || 0));
            }
          }

          const savings = hasPartnerPricing ? (offerProduct.products.price - partnerDiscountedPrice) : 0;

          return {
            id: productId,
            name: offerProduct.products.name,
            description: offerProduct.products.description,
            imageUrl: this.getProductImageUrl(offerProduct.products.images),
            price: offerProduct.products.price || 0,
            category: offerProduct.products.categories?.name || 'Solar Equipment',
            sku: offerProduct.products.sku || '',
            stock_quantity: offerProduct.products.stock_quantity || 0,
            discount_percentage: offerProduct.discount_percentage || 0,
            discount_amount: offerProduct.discount_amount || 0,
            has_partner_pricing: hasPartnerPricing,
            partner_price: partnerPrice,
            partner_discounted_price: partnerDiscountedPrice,
            partner_savings: savings
          };
        })
      );

      // Calculate hasPartnerPricing - true only if ALL products have partner pricing
      const productsWithPricing = this.products.filter(p => p.has_partner_pricing);
      this.hasPartnerPricing = this.products.length > 0 && productsWithPricing.length === this.products.length;

    } catch (error) {
      console.error('Error loading products:', error);
    }
  }

  private calculateTotals(): void {
    const productsWithPricing = this.products.filter(p => p.has_partner_pricing);

    // hasPartnerPricing should be true only if ALL products have partner pricing
    this.hasPartnerPricing = this.products.length > 0 && productsWithPricing.length === this.products.length;

    if (this.hasPartnerPricing) {
      this.totalPartnerPrice = productsWithPricing.reduce((sum, p) => sum + (p.partner_price || 0), 0);
      this.totalDiscountedPrice = productsWithPricing.reduce((sum, p) => sum + (p.partner_discounted_price || 0), 0);
      this.totalSavings = this.totalPartnerPrice - this.totalDiscountedPrice;
      this.totalDiscountPercentage = this.totalPartnerPrice > 0 ?
        Math.round((this.totalSavings / this.totalPartnerPrice) * 100) : 0;
    }
  }

  private getProductImageUrl(images: any): string {
    if (images && Array.isArray(images) && images.length > 0) {
      return images[0].url || images[0];
    }
    return 'assets/images/product-placeholder.svg';
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

  claimOffer(offer: PartnerOffer): void {
    this.userCompanyId$.pipe(takeUntil(this.destroy$)).subscribe(companyId => {
      if (!companyId) {
        this.toastService.showError(this.translationService.translate('b2b.auth.pleaseLoginAsPartner'));
        return;
      }

      if (this.isOfferExpired(offer.endDate)) {
        this.toastService.showError(this.translationService.translate('b2b.offers.offerExpired'));
        return;
      }

      if (this.products.length === 0) {
        // Category offer
        let message = this.translationService.translate('b2b.offers.offerClaimed', { title: offer.title });
        if (offer.couponCode) {
          message += ' ' + this.translationService.translate('b2b.offers.couponAppliedAutomatically', { code: offer.couponCode });
          this.applyCouponCode(offer.couponCode, companyId);
        }
        this.toastService.showSuccess(message);
        return;
      }

      // Product offer
      this.addOfferProductsToCart(this.products, offer, companyId);

      if (offer.couponCode) {
        // Wait for cart items to be successfully added before applying coupon
        this.actions$.pipe(
          ofType(addAllToB2BCartFromOfferSuccess),
          filter(action => action.addedCount > 0),
          takeUntil(this.destroy$)
        ).subscribe(() => {
          this.applyCouponCode(offer.couponCode!, companyId);
        });
      }
    });
  }

  private addOfferProductsToCart(products: PartnerProduct[], offer: PartnerOffer, companyId: string): void {
    const availableProducts = products.filter(product => (product.stock_quantity || 0) > 0 && product.has_partner_pricing);

    if (availableProducts.length === 0) {
      this.toastService.showWarning(this.translationService.translate('b2b.offers.allProductsOutOfStock'));
      return;
    }

    const productsToAdd = availableProducts.map(product => {
      const offerProduct = this.offerProductsData?.find(op => op.products.id === product.id);
      const hasIndividualDiscount = offerProduct &&
        ((offerProduct.discount_percentage && offerProduct.discount_percentage > 0) ||
         (offerProduct.discount_amount && offerProduct.discount_amount > 0));

      return {
        productId: product.id,
        quantity: 1,
        individualDiscount: hasIndividualDiscount ? (offerProduct.discount_percentage || offerProduct.discount_amount) : undefined,
        individualDiscountType: hasIndividualDiscount
          ? (offerProduct.discount_amount > 0 ? 'fixed_amount' : 'percentage') as 'percentage' | 'fixed_amount'
          : undefined,
        originalPrice: product.partner_price || product.price // Use partner price as the base, fall back to retail price if no partner pricing
      };
    });

    const offerType = (offer.discount_type || 'percentage') as 'percentage' | 'fixed_amount' | 'tier_based' | 'bundle';
    const discountValue = offer.discount_value || offer.discountPercentage || 0;

    this.store.dispatch(addAllToB2BCartFromOffer({
      products: productsToAdd,
      companyId,
      partnerOfferId: offer.id,
      partnerOfferName: offer.title,
      partnerOfferType: offerType,
      partnerOfferDiscount: discountValue,
      partnerOfferValidUntil: offer.endDate
    }));

    let message = this.translationService.translate('b2b.offers.offerClaimedWithProducts', {
      title: offer.title,
      count: availableProducts.length
    });

    if (offer.couponCode) {
      message += ' ' + this.translationService.translate('b2b.offers.couponAppliedAutomatically', { code: offer.couponCode });
    }

    const outOfStockCount = products.length - availableProducts.length;
    if (outOfStockCount > 0) {
      message += ' ' + this.translationService.translate('b2b.offers.itemsOutOfStock', { count: outOfStockCount });
    }

    this.toastService.showSuccess(message);
  }

  addToCart(product: PartnerProduct): void {
    this.userCompanyId$.pipe(takeUntil(this.destroy$)).subscribe(companyId => {
      if (!companyId) {
        this.toastService.showError(this.translationService.translate('b2b.auth.pleaseLoginAsPartner'));
        return;
      }

      if ((product.stock_quantity || 0) <= 0) {
        this.toastService.showWarning(
          this.translationService.translate('b2b.offers.productsOutOfStock', { count: 1 })
        );
        return;
      }

      if (!this.offer) {
        this.toastService.showError(this.translationService.translate('b2b.offers.offerNotFound'));
        return;
      }

      const offerProduct = this.offerProductsData?.find(op => op.products.id === product.id);
      const hasIndividualDiscount = offerProduct &&
        ((offerProduct.discount_percentage && offerProduct.discount_percentage > 0) ||
         (offerProduct.discount_amount && offerProduct.discount_amount > 0));

      const productPayload = {
        productId: product.id,
        quantity: 1,
        individualDiscount: hasIndividualDiscount ? (offerProduct.discount_percentage || offerProduct.discount_amount) : undefined,
        individualDiscountType: hasIndividualDiscount
          ? (offerProduct.discount_amount > 0 ? 'fixed_amount' : 'percentage') as 'percentage' | 'fixed_amount'
          : undefined,
        originalPrice: product.partner_price || product.price // Use partner price as the base, fall back to retail price if no partner pricing
      };

      const offerType = (this.offer.discount_type || 'percentage') as 'percentage' | 'fixed_amount' | 'tier_based' | 'bundle';
      const discountValue = this.offer.discount_value || this.offer.discountPercentage || 0;

      this.store.dispatch(addAllToB2BCartFromOffer({
        products: [productPayload],
        companyId,
        partnerOfferId: this.offer.id,
        partnerOfferName: this.offer.title,
        partnerOfferType: offerType,
        partnerOfferDiscount: discountValue,
        partnerOfferValidUntil: this.offer.endDate
      }));

      this.toastService.showSuccess(this.translationService.translate('cart.itemAddedToCart'));
    });
  }

  async addAllToCart(): Promise<void> {
    if (!this.offer) {
      this.toastService.showError(this.translationService.translate('b2b.offers.offerNotFound'));
      return;
    }

    this.userCompanyId$.pipe(takeUntil(this.destroy$)).subscribe(companyId => {
      if (!companyId) {
        this.toastService.showError(this.translationService.translate('b2b.auth.pleaseLoginAsPartner'));
        return;
      }

      if (!this.products.length) {
        this.toastService.showWarning(this.translationService.translate('b2b.offers.noProductsToAdd'));
        return;
      }

      const availableProducts = this.products.filter(product => (product.stock_quantity || 0) > 0 && product.has_partner_pricing);

      if (availableProducts.length === 0) {
        this.toastService.showWarning(this.translationService.translate('b2b.offers.allProductsOutOfStock'));
        return;
      }

      const productsToAdd = availableProducts.map(product => {
        const offerProduct = this.offerProductsData.find(op => op.products.id === product.id);
        const hasIndividualDiscount = offerProduct &&
          ((offerProduct.discount_percentage && offerProduct.discount_percentage > 0) ||
           (offerProduct.discount_amount && offerProduct.discount_amount > 0));

        return {
          productId: product.id,
          quantity: 1,
          individualDiscount: hasIndividualDiscount ?
            (offerProduct.discount_percentage || offerProduct.discount_amount) : undefined,
          individualDiscountType: hasIndividualDiscount ?
            (offerProduct.discount_amount > 0 ? 'fixed_amount' : 'percentage') as 'percentage' | 'fixed_amount' : undefined,
          originalPrice: product.partner_price || product.price // Use partner price as the base, fall back to retail price if no partner pricing
        };
      });

      const offerType = (this.offer!.discount_type || 'percentage') as 'percentage' | 'fixed_amount' | 'tier_based' | 'bundle';
      const discountValue = this.offer!.discount_value || this.offer!.discountPercentage || 0;

      this.store.dispatch(addAllToB2BCartFromOffer({
        products: productsToAdd,
        companyId,
        partnerOfferId: this.offer!.id,
        partnerOfferName: this.offer!.title,
        partnerOfferType: offerType,
        partnerOfferDiscount: discountValue,
        partnerOfferValidUntil: this.offer!.endDate
      }));

      this.toastService.showSuccess(
        this.translationService.translate('offers.addedProductsToCart', { count: availableProducts.length })
      );

      const outOfStockCount = this.products.length - availableProducts.length;
      if (outOfStockCount > 0) {
        this.toastService.showWarning(
          this.translationService.translate('b2b.offers.productsOutOfStock', { count: outOfStockCount })
        );
      }
    });
  }

  isOfferExpired(endDate?: string): boolean {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  }

  trackByProductId(_index: number, product: PartnerProduct): string {
    return product.id;
  }

  navigateToProduct(productId: string): void {
    this.router.navigate(['/partneri/proizvodi', productId]);
  }

  navigateToProducts(): void {
    this.router.navigate(['/partneri/proizvodi']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  private applyCouponCode(couponCode: string, companyId: string): void {
    this.store.dispatch(applyB2BCoupon({
      code: couponCode,
      companyId: companyId
    }));
  }

  contactSupport(): void {
    // Navigate to contact page or open contact modal
    this.router.navigate(['/partneri/kontakt']);
  }
}