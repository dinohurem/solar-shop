import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Observable, from, of } from 'rxjs';
import { takeUntil, switchMap, map, catchError } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { SupabaseService } from '../../../../services/supabase.service';
import { addToB2BCart, applyB2BCoupon, addAllToB2BCartFromOffer } from '../../cart/store/b2b-cart.actions';
import { selectB2BCartHasCompanyId, selectB2BCartCompanyId } from '../../cart/store/b2b-cart.selectors';
import { ToastService } from '../../../../shared/services/toast.service';
import { TranslationService } from '../../../../shared/services/translation.service';

interface PartnerOffer {
  id: string;
  title: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  discount_type?: string;
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
                <span *ngIf="offer.discount_type === 'percentage' || !offer.discount_type">-{{ offer.discountPercentage }}%</span>
                <span *ngIf="offer.discount_type === 'fixed_amount'">-{{ offer.discount_value | currency:'EUR':'symbol':'1.0-2' }}</span>
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
                <div class="text-center mb-4">
                  <h3 class="text-lg font-semibold text-white mb-2">{{ 'b2b.products.partnerPrice' | translate }}</h3>
                </div>
                <div class="flex items-center gap-4 mb-4">
                  <span class="text-2xl text-white/70 line-through font-medium">
                    {{ offer.originalPrice | currency:'EUR':'symbol':'1.2-2' }}
                  </span>
                  <span class="text-4xl font-bold text-white">
                    {{ offer.discountedPrice | currency:'EUR':'symbol':'1.2-2' }}
                  </span>
                </div>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div class="text-center">
                    <div class="text-white/70">{{ 'b2b.offers.savings' | translate }}</div>
                    <div class="text-lg font-bold text-accent-200">
                      {{ (offer.originalPrice - offer.discountedPrice) | currency:'EUR':'symbol':'1.2-2' }}
                    </div>
                  </div>
                  <div class="text-center">
                    <div class="text-white/70">{{ 'admin.offersForm.totalDiscount' | translate }}</div>
                    <div class="text-lg font-bold text-accent-200">
                      {{ ((offer.originalPrice - offer.discountedPrice) / offer.originalPrice * 100).toFixed(2) }}%
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
                    {{ copiedCoupon ? 'Copied!' : ('b2b.offers.copy' | translate) }}
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
                <button 
                  *ngIf="!isOfferExpired(offer.endDate)"
                  (click)="claimOffer(offer)"
                  class="flex-1 bg-white text-solar-600 py-3 px-6 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg">
                  {{ 'b2b.offers.claimOffer' | translate }}
                </button>
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
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 class="text-3xl font-bold text-gray-900 mb-8 font-['Poppins']">
          {{ 'b2b.offers.productsIncluded' | translate }}
        </h2>

        <!-- Add All to Cart Button -->
        <div *ngIf="(relatedProducts$ | async)?.length" class="mb-8">
          <button 
            (click)="addAllToCart()"
            class="w-full md:w-auto px-8 py-3 bg-solar-600 text-white font-semibold rounded-lg hover:bg-solar-700 transition-colors font-['DM_Sans'] mb-6"
          >
            {{ 'offers.addAllToCart' | translate }}
          </button>
        </div>

        <!-- Product Cards with Partner Pricing -->
        <div *ngIf="relatedProducts$ | async as relatedProducts" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            *ngFor="let product of relatedProducts; trackBy: trackByProductId"
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
                <span *ngIf="offer.discount_type === 'percentage' || !offer.discount_type">-{{ offer.discountPercentage }}%</span>
                <span *ngIf="offer.discount_type === 'fixed_amount'">-{{ offer.discount_value | currency:'EUR':'symbol':'1.0-2' }}</span>
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
                <!-- Retail Price -->
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-500">{{ 'b2b.products.retailPrice' | translate }}:</span>
                  <span class="text-lg text-gray-500 line-through">
                    {{ product.price | currency:'EUR':'symbol':'1.2-2' }}
                  </span>
                </div>
                
                <!-- Partner Price -->
                <div class="flex items-center justify-between bg-solar-50 p-2 rounded-lg">
                  <span class="text-sm font-medium text-solar-700">{{ 'b2b.products.partnerPrice' | translate }}:</span>
                  <span class="text-xl font-bold text-solar-600">
                    {{ getProductPartnerPrice(product, offer) | currency:'EUR':'symbol':'1.2-2' }}
                  </span>
                </div>
                
                <!-- Total Savings -->
                <div class="flex items-center justify-between border-t pt-2">
                  <span class="text-sm font-medium text-green-700">{{ 'b2b.products.savings' | translate }}:</span>
                  <span class="text-lg font-bold text-green-600">
                    {{ getProductTotalSavings(product, offer) | currency:'EUR':'symbol':'1.2-2' }}
                  </span>
                </div>
              </div>

              <!-- Add to Cart -->
              <div class="space-y-3">
                <button 
                  (click)="addToCart(product)"
                  class="w-full px-4 py-3 bg-solar-600 text-white rounded-lg hover:bg-solar-700 transition-colors font-semibold font-['DM_Sans']"
                >
                  {{ 'b2b.offers.addToCartPartnerPrice' | translate }}
                </button>
                
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
        <div *ngIf="!(relatedProducts$ | async) || (relatedProducts$ | async)?.length === 0" class="text-center py-12">
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
  private toastService = inject(ToastService);
  private translationService = inject(TranslationService);

  offer: PartnerOffer | null = null;
  relatedProducts$: Observable<PartnerProduct[]> = of([]);
  copiedCoupon = false;
  private destroy$ = new Subject<void>();

  // Partner discount percentage (additional discount on top of offer discount)
  readonly PARTNER_DISCOUNT_PERCENTAGE = 15;

  // Observables
  userCompanyId$ = this.store.select(selectB2BCartCompanyId);
  hasCompanyId$ = this.store.select(selectB2BCartHasCompanyId);

  ngOnInit(): void {
    this.relatedProducts$ = this.route.params.pipe(
      switchMap(params => {
        const offerId = params['id'];
        return this.loadOfferProducts(offerId);
      }),
      takeUntil(this.destroy$)
    );

    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(async params => {
      const offerId = params['id'];
      await this.loadOffer(offerId);
    });

    window.scrollTo(0, 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadOffer(offerId: string): Promise<void> {
    try {
      // Load the specific B2B offer
      const offer = await this.supabaseService.getTableById('offers', offerId);

      if (!offer || !offer.is_b2b) {
        console.error('Offer not found or not a B2B offer');
        return;
      }

      // Convert database offer to PartnerOffer interface
      const originalPrice = offer.original_price || 0;
      const discountPercentage = offer.discount_type === 'percentage' ? offer.discount_value : 0;
      let discountedPrice = offer.discounted_price || 0;

      // Calculate discounted price based on discount type
      if (discountedPrice === 0 && originalPrice > 0) {
        if (offer.discount_type === 'percentage' && offer.discount_value > 0) {
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
        type: 'partner-exclusive', // Default type for B2B offers
        status: offer.status || 'active',
        couponCode: offer.code,
        startDate: offer.start_date || '',
        endDate: offer.end_date || '',
        featured: offer.featured || false,
        isB2B: offer.is_b2b
      };

      // Load related products for this offer
      this.loadOfferProducts(offerId);
    } catch (error) {
      console.error('Error loading offer:', error);
    }
  }

  private loadOfferProducts(offerId: string): Observable<PartnerProduct[]> {
    return from(
      this.supabaseService.client
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
        .order('sort_order')
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error loading offer products:', error);
          return [];
        }

        if (data && data.length > 0) {
          return data.map((offerProduct: any) => ({
            id: offerProduct.products.id,
            name: offerProduct.products.name,
            description: offerProduct.products.description,
            imageUrl: this.getProductImageUrl(offerProduct.products.images),
            price: offerProduct.products.price || 0,
            category: offerProduct.products.categories?.name || 'Solar Equipment',
            sku: offerProduct.products.sku || '',
            stock_quantity: offerProduct.products.stock_quantity || 0
          }));
        }
        return [];
      }),
      catchError(error => {
        console.error('Error loading offer products:', error);
        return of([]);
      })
    );
  }

  private getProductImageUrl(images: any): string {
    if (images && Array.isArray(images) && images.length > 0) {
      return images[0].url || images[0];
    }
    return 'assets/images/product-placeholder.svg';
  }

  calculateDiscountedPrice(originalPrice: number, offer: PartnerOffer): number {
    if (!offer.discount_type || offer.discount_type === 'percentage') {
      const discountPercentage = offer.discountPercentage || 0;
      return originalPrice * (1 - discountPercentage / 100);
    } else if (offer.discount_type === 'fixed_amount') {
      const discountAmount = offer.discount_value || 0;
      return Math.max(0, originalPrice - discountAmount);
    }
    return originalPrice;
  }

  getPartnerPrice(offer: PartnerOffer): number {
    // TODO: get partner price from company pricing table per company id and then filter by products in the offer

    // if no company pricing, return the discounted price
    return offer.discountedPrice;
  }

  getPartnerSavings(offer: PartnerOffer): number {
    return offer.originalPrice - this.getPartnerPrice(offer);
  }

  getTotalDiscountPercentage(offer: PartnerOffer): number {
    const partnerPrice = this.getPartnerPrice(offer);
    return Math.round(((offer.originalPrice - partnerPrice) / offer.originalPrice) * 100);
  }

  getProductPartnerPrice(product: PartnerProduct, offer: PartnerOffer): number {
    const offerDiscountedPrice = this.calculateDiscountedPrice(product.price, offer);
    return offerDiscountedPrice * (1 - this.PARTNER_DISCOUNT_PERCENTAGE / 100);
  }

  getProductTotalSavings(product: PartnerProduct, offer: PartnerOffer): number {
    return product.price - this.getProductPartnerPrice(product, offer);
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
    // Check if user is authenticated and has company ID
    this.userCompanyId$.pipe(takeUntil(this.destroy$)).subscribe(companyId => {
      if (!companyId) {
        this.toastService.showError(this.translationService.translate('b2b.auth.pleaseLoginAsPartner'));
        return;
      }

      // Check if offer is expired
      if (this.isOfferExpired(offer.endDate)) {
        this.toastService.showError(this.translationService.translate('b2b.offers.offerExpired'));
        return;
      }

      // Load offer products and add them to cart
      this.loadOfferProducts(offer.id).pipe(
        takeUntil(this.destroy$)
      ).subscribe(products => {
        if (!products || products.length === 0) {
          // If no products, just show success message (general offer)
          let message = this.translationService.translate('b2b.offers.offerClaimed', { title: offer.title });
          if (offer.couponCode) {
            message += ' ' + this.translationService.translate('b2b.offers.couponAppliedAutomatically', { code: offer.couponCode });
            this.applyCouponCode(offer.couponCode, companyId);
          }
          this.toastService.showSuccess(message);
          return;
        }

        // Add products to B2B cart
        this.addOfferProductsToCart(products, offer, companyId);

        // Apply coupon code if offer has one
        if (offer.couponCode) {
          this.applyCouponCode(offer.couponCode, companyId);
        }
      });
    });
  }

  private addOfferProductsToCart(products: PartnerProduct[], offer: PartnerOffer, companyId: string): void {
    let successCount = 0;
    let errorCount = 0;
    let outOfStockCount = 0;

    for (const product of products) {
      try {
        // Check stock availability
        if (product.stock_quantity !== undefined && product.stock_quantity <= 0) {
          console.warn(`Product ${product.name} is out of stock`);
          outOfStockCount++;
          continue;
        }

        // Add to cart
        this.store.dispatch(addToB2BCart({
          companyId,
          productId: product.id,
          quantity: 1
        }));

        successCount++;
      } catch (error) {
        console.error(`Error adding product ${product.name} to cart:`, error);
        errorCount++;
      }
    }

    // Provide detailed feedback
    if (successCount > 0) {
      let message = this.translationService.translate('b2b.offers.offerClaimedWithProducts', {
        title: offer.title,
        count: successCount
      });

      if (offer.couponCode) {
        message += ' ' + this.translationService.translate('b2b.offers.couponAppliedAutomatically', { code: offer.couponCode });
      }

      if (outOfStockCount > 0) {
        message += ' ' + this.translationService.translate('b2b.offers.itemsOutOfStock', { count: outOfStockCount });
      }

      this.toastService.showSuccess(message);
    } else if (outOfStockCount > 0) {
      this.toastService.showWarning(this.translationService.translate('b2b.offers.offerClaimedButOutOfStock', { title: offer.title }));
    } else {
      this.toastService.showError(this.translationService.translate('b2b.offers.failedToAddProducts'));
    }
  }

  addToCart(product: PartnerProduct): void {
    this.userCompanyId$.pipe(takeUntil(this.destroy$)).subscribe(companyId => {
      if (!companyId) {
        this.toastService.showError(this.translationService.translate('b2b.auth.pleaseLoginAsPartner'));
        return;
      }

      this.store.dispatch(addToB2BCart({
        companyId,
        productId: product.id,
        quantity: 1
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

      this.relatedProducts$.pipe(takeUntil(this.destroy$)).subscribe(products => {
        if (!products || products.length === 0) {
          this.toastService.showWarning(this.translationService.translate('b2b.offers.noProductsToAdd'));
          return;
        }

        // Filter out out-of-stock products
        const availableProducts = products.filter(product => (product.stock_quantity || 0) > 0);

        if (availableProducts.length === 0) {
          this.toastService.showWarning(this.translationService.translate('b2b.offers.allProductsOutOfStock'));
          return;
        }

        // Prepare products for the action
        const productsToAdd = availableProducts.map(product => ({
          productId: product.id,
          quantity: 1
        }));

        // Get the offer discount type from the original database offer
        const offerType = (this.offer!.discount_type || 'percentage') as 'percentage' | 'fixed_amount' | 'tier_based' | 'bundle';
        const discountValue = this.offer!.discount_value || this.offer!.discountPercentage || 0;

        // Dispatch the partner offer-based add all to cart action
        this.store.dispatch(addAllToB2BCartFromOffer({
          products: productsToAdd,
          companyId,
          partnerOfferId: this.offer!.id,
          partnerOfferName: this.offer!.title,
          partnerOfferType: offerType,
          partnerOfferDiscount: discountValue,
          partnerOfferValidUntil: this.offer!.endDate
        }));

        // Show success message
        this.toastService.showSuccess(
          this.translationService.translate('offers.addedProductsToCart', { count: availableProducts.length })
        );

        // Show warning for out-of-stock products if any
        const outOfStockCount = products.length - availableProducts.length;
        if (outOfStockCount > 0) {
          this.toastService.showWarning(
            this.translationService.translate('b2b.offers.productsOutOfStock', { count: outOfStockCount })
          );
        }
      });
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
    this.router.navigate(['/partneri/products', productId]);
  }

  navigateToProducts(): void {
    this.router.navigate(['/partneri/products']);
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
} 