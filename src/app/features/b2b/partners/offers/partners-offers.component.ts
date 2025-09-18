import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, from } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { Offer } from '../../../../shared/models/offer.model';
import { SupabaseService } from '../../../../services/supabase.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { selectCurrentUser, selectIsAuthenticated } from '../../../../core/auth/store/auth.selectors';
import { addAllToB2BCartFromOffer } from '../../cart/store/b2b-cart.actions';
import { selectB2BCartHasCompanyId, selectB2BCartCompanyId } from '../../cart/store/b2b-cart.selectors';
import { TranslationService } from '../../../../shared/services/translation.service';
import { User } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-partners-offers',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 class="text-3xl font-bold text-gray-900 font-['Poppins']">
            {{ 'b2b.offers.title' | translate }}
          </h1>
          <p class="mt-2 text-lg text-gray-600 font-['DM_Sans']">
            {{ 'b2b.offers.subtitle' | translate }}
          </p>
        </div>
      </div>

      <!-- Login Required Banner (for non-authenticated users) -->
      <div *ngIf="!isAuthenticated || !hasCompanyId" class="bg-solar-50 border-b border-solar-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <svg class="w-6 h-6 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              <div>
                <p class="text-sm font-medium text-solar-800">
                  <span *ngIf="!isAuthenticated">{{ 'b2b.offers.loginRequired' | translate }}</span>
                  <span *ngIf="isAuthenticated && !hasCompanyId">{{ 'b2b.auth.partnerVerificationRequired' | translate }}</span>
                </p>
              </div>
            </div>
            <button *ngIf="!isAuthenticated" 
                    (click)="navigateToLogin()" 
                    class="bg-solar-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-solar-700 transition-colors">
              {{ 'b2b.offers.loginToViewOffers' | translate }}
            </button>
            <button *ngIf="isAuthenticated && !hasCompanyId" 
                    (click)="navigateToPartnerRegistration()" 
                    class="bg-solar-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-solar-700 transition-colors">
              {{ 'b2b.auth.becomePartner' | translate }}
            </button>
          </div>
        </div>
      </div>

      <!-- Offers Grid -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Loading State -->
        <div *ngIf="loading" class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-solar-600"></div>
          <span class="ml-3 text-lg text-gray-600">{{ 'b2b.offers.loadingOffers' | translate }}</span>
        </div>

        <!-- Offers Grid -->
        <div *ngIf="!loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div *ngFor="let offer of b2bOffers" 
               class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            
            <!-- Offer Image -->
            <div class="relative">
              <img [src]="offer.imageUrl" [alt]="offer.title" 
                   class="w-full h-48 object-cover">
              
              <!-- Discount Badge -->
              <div class="absolute top-4 left-4">
                <span class="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  <span *ngIf="offer.discount_type === 'percentage' || !offer.discount_type">-{{ offer.discountPercentage }}%</span>
                  <span *ngIf="offer.discount_type === 'fixed_amount'">{{ offer.discount_value | currency:'EUR':'symbol':'1.0-2' }} OFF</span>
                </span>
              </div>

              <!-- Partner Only Badge -->
              <div class="absolute top-4 right-4">
                <span class="bg-solar-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                  {{ 'b2b.offers.partnerOnly' | translate }}
                </span>
              </div>

              <!-- Expiry Date -->
              <div *ngIf="offer.endDate" class="absolute bottom-4 right-4">
                <span class="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                  {{ 'b2b.offers.expires' | translate }}: {{ formatDate(offer.endDate) }}
                </span>
              </div>
            </div>

            <!-- Offer Content -->
            <div class="p-6">
              <!-- Title -->
              <h3 class="text-xl font-bold text-gray-900 mb-2 font-['Poppins']">
                {{ offer.title }}
              </h3>

              <!-- Description -->
              <p class="text-gray-600 mb-4 font-['DM_Sans'] line-clamp-3">
                {{ offer.description }}
              </p>

              <!-- Pricing -->
              <div *ngIf="isAuthenticated && hasCompanyId" class="mb-4">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-2xl font-bold text-solar-600">
                      €{{ offer.discountedPrice | number:'1.2-2' }}
                    </span>
                    <span class="text-lg text-gray-500 line-through ml-2">
                      €{{ offer.originalPrice | number:'1.2-2' }}
                    </span>
                  </div>
                  <div class="text-right">
                    <div class="text-sm text-gray-500">{{ 'b2b.offers.savings' | translate }}</div>
                    <div class="text-lg font-bold text-green-600">
                      €{{ (offer.originalPrice - offer.discountedPrice) | number:'1.2-2' }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Login Required Pricing -->
              <div *ngIf="!isAuthenticated || !hasCompanyId" class="mb-4 text-center py-4 bg-gray-50 rounded-lg">
                <svg class="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <p class="text-sm text-gray-500 font-medium">
                  <span *ngIf="!isAuthenticated">{{ 'b2b.offers.loginToViewPrices' | translate }}</span>
                  <span *ngIf="isAuthenticated && !hasCompanyId">{{ 'b2b.auth.partnerVerificationRequiredPricing' | translate }}</span>
                </p>
              </div>

              <!-- Coupon Code -->
              <div *ngIf="offer.couponCode && isAuthenticated && hasCompanyId" class="mb-4">
                <div class="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-3">
                  <div class="flex items-center justify-between">
                    <div>
                      <span class="text-sm text-gray-600">{{ 'b2b.offers.couponCode' | translate }}:</span>
                      <span class="ml-2 font-mono font-bold text-solar-600">{{ offer.couponCode }}</span>
                    </div>
                    <button (click)="copyCouponCode(offer.couponCode)" 
                            class="text-solar-600 hover:text-solar-700 text-sm font-medium">
                      {{ 'b2b.offers.copy' | translate }}
                    </button>
                  </div>
                </div>
              </div>



              <!-- Actions -->
              <div class="space-y-2">
                <button *ngIf="isAuthenticated && hasCompanyId" 
                        (click)="claimOffer(offer)"
                        [disabled]="isOfferExpired(offer.endDate)"
                        class="w-full bg-solar-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-solar-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                  <span *ngIf="!isOfferExpired(offer.endDate)">{{ 'b2b.offers.claimOffer' | translate }}</span>
                  <span *ngIf="isOfferExpired(offer.endDate)">{{ 'b2b.offers.expired' | translate }}</span>
                </button>
                
                <button *ngIf="!isAuthenticated" 
                        (click)="navigateToLogin()"
                        class="w-full bg-solar-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-solar-700 transition-colors">
                  {{ 'b2b.offers.signInToClaim' | translate }}
                </button>

                <button *ngIf="isAuthenticated && !hasCompanyId" 
                        (click)="navigateToPartnerRegistration()"
                        class="w-full bg-solar-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-solar-700 transition-colors">
                  {{ 'b2b.offers.claimOffer' | translate }}
                </button>
                
                <button (click)="viewOfferDetails(offer)" 
                        class="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  {{ 'b2b.offers.viewDetails' | translate }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- No Offers Available -->
        <div *ngIf="!loading && b2bOffers.length === 0" class="text-center py-12">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">{{ 'b2b.offers.noOffers' | translate }}</h3>
          <p class="text-gray-600">{{ 'b2b.offers.noOffersText' | translate }}</p>
        </div>
      </div>
    </div>
  `,
})
export class PartnersOffersComponent implements OnInit, OnDestroy {
  private supabaseService = inject(SupabaseService);
  private store = inject(Store);
  private toastService = inject(ToastService);
  private translationService = inject(TranslationService);
  private destroy$ = new Subject<void>();

  // Observables
  currentUser$: Observable<User | null> = this.store.select(selectCurrentUser);
  isAuthenticated$: Observable<boolean> = this.store.select(selectIsAuthenticated);
  userCompanyId$: Observable<string | null> = this.store.select(selectB2BCartCompanyId);
  hasCompanyId$: Observable<boolean> = this.store.select(selectB2BCartHasCompanyId);

  isAuthenticated = false;
  hasCompanyId = false;
  isPartner = false;
  loading = false;
  currentUser: User | null = null;
  userCompanyId: string | null = null;

  // B2B offers loaded from database
  b2bOffers: Offer[] = [];

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Subscribe to auth state
    this.isAuthenticated$.pipe(takeUntil(this.destroy$)).subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });

    this.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.currentUser = user;
      this.isPartner = !!user?.companyId && (user?.role?.name === 'company_admin' || user?.role?.name === 'admin');
    });

    this.hasCompanyId$.pipe(takeUntil(this.destroy$)).subscribe(hasCompanyId => {
      this.hasCompanyId = hasCompanyId;
    });

    this.userCompanyId$.pipe(takeUntil(this.destroy$)).subscribe(companyId => {
      this.userCompanyId = companyId;
    });

    // Load B2B offers from database
    this.loadB2BOffers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadB2BOffers(): Promise<void> {
    this.loading = true;
    try {
      // Load offers where is_b2b is true and status is active
      const offers = await this.supabaseService.getTable('offers', {
        is_b2b: true,
        status: 'active'
      });

      // Transform database offers to Offer model
      this.b2bOffers = offers.map(offer => {
        const originalPrice = offer.original_price || 0;
        const discountPercentage = offer.discount_type === 'percentage' ? offer.discount_value : 0;
        let discountedPrice = offer.discounted_price || 0;

        // Calculate discounted price for percentage-only offers if not provided
        if (discountedPrice === 0 && discountPercentage > 0 && originalPrice > 0) {
          discountedPrice = originalPrice * (1 - discountPercentage / 100);
        }

        return {
          id: offer.id,
          title: offer.title,
          originalPrice: originalPrice,
          discountedPrice: discountedPrice,
          discountPercentage: discountPercentage,
          imageUrl: offer.image_url || 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop',
          description: offer.description,
          shortDescription: offer.short_description || '',
          status: offer.status,
          couponCode: offer.code || '',
          startDate: offer.start_date,
          endDate: offer.end_date,
          featured: offer.featured || false,
          isB2B: offer.is_b2b || false,
          discount_type: offer.discount_type,
          discount_value: offer.discount_value
        };
      });
    } catch (error) {
      console.error('Error loading B2B offers:', error);
    } finally {
      this.loading = false;
    }
  }

  navigateToLogin(): void {
    // Navigate to login page
    window.location.href = '/prijava';
  }

  navigateToPartnerRegistration(): void {
    // Navigate to partner registration page
    this.router.navigate(['/partneri/registracija']);
  }

  claimOffer(offer: Offer): void {
    // Check if user is authenticated and has company ID
    if (!this.isAuthenticated || !this.userCompanyId) {
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
          message += ' ' + this.translationService.translate('b2b.offers.useCouponCode', { code: offer.couponCode });
        }
        this.toastService.showSuccess(message);
        return;
      }

      // Use the bulk add action for better performance and consistency
      this.addOfferProductsToCartBulk(products, offer);
    });
  }

  private loadOfferProducts(offerId: string): Observable<any[]> {
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
            images
          )
        `)
        .eq('offer_id', offerId)
        .order('sort_order')
    ).pipe(
      switchMap(({ data, error }) => {
        if (error) {
          console.error('Error loading offer products:', error);
          return [];
        }
        return [data || []];
      })
    );
  }

  private addOfferProductsToCartBulk(offerProducts: any[], offer: Offer): void {
    if (!this.userCompanyId) {
      this.toastService.showError(this.translationService.translate('b2b.auth.companyIdNotFound'));
      return;
    }

    // Filter and prepare products for bulk add with individual discounts
    const availableProducts = offerProducts
      .filter(offerProduct => {
        const product = offerProduct.products;
        return product && product.stock_quantity > 0;
      })
      .map(offerProduct => {
        // Determine individual discount type and value
        const hasIndividualDiscount = (offerProduct.discount_percentage && offerProduct.discount_percentage > 0) ||
                                      (offerProduct.discount_amount && offerProduct.discount_amount > 0);

        return {
          productId: offerProduct.products.id,
          quantity: 1,
          individualDiscount: hasIndividualDiscount ?
            (offerProduct.discount_percentage || offerProduct.discount_amount) : undefined,
          individualDiscountType: hasIndividualDiscount ?
            (offerProduct.discount_amount > 0 ? 'fixed_amount' : 'percentage') as 'percentage' | 'fixed_amount' : undefined,
          originalPrice: offerProduct.products.price
        };
      });

    if (availableProducts.length === 0) {
      this.toastService.showWarning(this.translationService.translate('b2b.offers.allProductsOutOfStock'));
      return;
    }

    // Get offer details for the bulk action
    const offerType = (offer.discount_type || 'percentage') as 'percentage' | 'fixed_amount' | 'tier_based' | 'bundle';
    const discountValue = offer.discount_value || offer.discountPercentage || 0;

    // Dispatch the bulk add action
    this.store.dispatch(addAllToB2BCartFromOffer({
      products: availableProducts,
      companyId: this.userCompanyId,
      partnerOfferId: offer.id,
      partnerOfferName: offer.title,
      partnerOfferType: offerType,
      partnerOfferDiscount: discountValue,
      partnerOfferValidUntil: offer.endDate
    }));

    // Show immediate feedback for skipped products
    const skippedCount = offerProducts.length - availableProducts.length;
    if (skippedCount > 0) {
      this.toastService.showWarning(
        this.translationService.translate('b2b.offers.productsOutOfStock', { count: skippedCount })
      );
    }
  }

  viewOfferDetails(offer: Offer): void {
    this.router.navigate(['/partneri/ponude', offer.id]);
  }

  copyCouponCode(couponCode: string): void {
    navigator.clipboard.writeText(couponCode).then(() => {
      this.toastService.showSuccess(this.translationService.translate('b2b.offers.couponCopied'));
    }).catch(err => {
      console.error('Failed to copy coupon code:', err);
      this.toastService.showError(this.translationService.translate('b2b.offers.failedToCopyCoupon'));
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  isOfferExpired(endDate?: string): boolean {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  }


} 