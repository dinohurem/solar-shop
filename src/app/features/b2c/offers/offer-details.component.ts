import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, from, of } from 'rxjs';
import { takeUntil, switchMap, map, catchError } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { OffersService } from './services/offers.service';
import { AddToCartButtonComponent } from '../cart/components/add-to-cart-button/add-to-cart-button.component';
import { SupabaseService } from '../../../services/supabase.service';
import { Offer } from '../../../shared/models/offer.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { addAllToCartFromOffer } from '../cart/store/cart.actions';
import { ToastService } from '../../../shared/services/toast.service';
import { TranslationService } from '../../../shared/services/translation.service';

@Component({
  selector: 'app-offer-details',
  standalone: true,
  imports: [CommonModule, AddToCartButtonComponent, TranslatePipe],
  template: `
    <div class="min-h-screen bg-gray-50" *ngIf="offer$ | async as offer; else loadingTemplate">
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
                -{{ offer.discountPercentage }}%
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

              <!-- Pricing -->
              <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8" *ngIf="(relatedProducts$ | async)?.length">
                <div class="flex items-center gap-4 mb-4">
                  <span class="text-2xl text-white/70 line-through font-medium">
                    {{ getTotalOriginalPrice() | currency:'EUR':'symbol':'1.2-2' }}
                  </span>
                  <span class="text-4xl font-bold text-white">
                    {{ getTotalDiscountedPrice(offer.discountPercentage) | currency:'EUR':'symbol':'1.2-2' }}
                  </span>
                </div>
                <div class="text-lg text-white/90">
                  {{ 'offers.youSave' | translate }} {{ getTotalSavings(offer.discountPercentage) | currency:'EUR':'symbol':'1.2-2' }}
                </div>
              </div>

              <!-- Coupon Code -->
              <div *ngIf="offer.couponCode" class="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-sm text-white/70">{{ 'offers.couponCode' | translate }}:</span>
                    <div class="text-xl font-bold text-white font-mono">{{ offer.couponCode }}</div>
                  </div>
                  <button 
                    (click)="copyCouponCode(offer.couponCode!)"
                    class="bg-white text-solar-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    {{ copiedCoupon ? ('offers.copied' | translate) : ('offers.copy' | translate) }}
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
                    {{ 'offers.expires' | translate }}: {{ offer.endDate | date:'medium' }}
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
          {{ 'offers.productsIncluded' | translate }}
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
              <div class="absolute top-4 left-4 bg-solar-600 text-white text-sm font-bold px-3 py-2 rounded-full">
                {{ 'offers.specialOffer' | translate }}
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
                <span class="text-xl font-bold text-solar-600">
                  {{ calculateDiscountedPrice(product.price, offer.discountPercentage) | currency:'EUR':'symbol':'1.2-2' }}
                </span>
              </div>

              <!-- Add to Cart -->
              <div class="space-y-3">
                <app-add-to-cart-button 
                  [availability]="product.availability"
                  [productId]="product.id" 
                  [quantity]="1" 
                  buttonText="{{ 'offers.addToCart' | translate }}"
                  [fullWidth]="true"
                  size="md">
                </app-add-to-cart-button>
                
                <button 
                  (click)="navigateToProduct(product.id)"
                  class="w-full px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold font-['DM_Sans']"
                >
                  {{ 'offers.viewDetails' | translate }}
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
            <h3 class="text-xl font-bold text-gray-900 mb-2 font-['Poppins']">{{ 'offers.generalOffer' | translate }}</h3>
            <p class="text-gray-600 font-['DM_Sans']">{{ 'offers.generalOfferDescription' | translate }}</p>
            <button 
              (click)="navigateToProducts()"
              class="mt-6 px-6 py-3 bg-solar-600 text-white font-semibold rounded-lg hover:bg-solar-700 transition-colors font-['DM_Sans']"
            >
              {{ 'offers.browseProducts' | translate }}
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
                  {{ offer.description || ('offers.defaultDescription' | translate) }}
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
          <p class="text-gray-600 font-['DM_Sans']">{{ 'hero.loading' | translate }}</p>
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
  private currentProducts: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private offersService: OffersService,
    private supabaseService: SupabaseService,
    private store: Store,
    private toastService: ToastService,
    private translationService: TranslationService
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
      map(products => {
        this.currentProducts = products;
        return products;
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
        .eq('offer_id', offer.id)
        .eq('is_active', true)
        .order('sort_order')
    ).pipe(
      switchMap(({ data: offerProducts, error }) => {
        if (error) {
          console.error('Error fetching related products:', error);
          // Fallback to featured products on error
          return from(this.supabaseService.getProducts({ featured: true, limit: 3 }));
        }

        if (offerProducts && offerProducts.length > 0) {
          // Map offer products to the expected format
          const products = offerProducts.map((op: any) => ({
            id: op.products.id,
            name: op.products.name,
            description: op.products.description,
            price: op.products.price,
            availability: this.getProductAvailability(op.products.stock_quantity),
            images: op.products.images || [],
            category: op.products.categories?.name,
            stock_quantity: op.products.stock_quantity || 0
          }));
          return of(products);
        } else {
          // If no specific products, fallback to featured products
          return from(this.supabaseService.getProducts({ featured: true, limit: 6 }));
        }
      }),
      map(products => products || []),
      catchError((error: any) => {
        console.error('Error fetching fallback products:', error);
        return of([]);
      })
    );
  }

  private getProductAvailability(stockQuantity: number): string {
    if (stockQuantity > 10) return 'in_stock';
    if (stockQuantity > 0) return 'low_stock';
    return 'out_of_stock';
  }



  getProductImage(product: any): string {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0].url || product.images[0];
    }
    return 'assets/images/product-placeholder.svg';
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

  trackByProductId(_index: number, product: any): string {
    return product.id;
  }

  navigateToProduct(productId: string): void {
    this.router.navigate(['/products', productId]);
  }

  navigateToProducts(): void {
    this.router.navigate(['/products']);
  }

  getTotalOriginalPrice(): number {
    return this.currentProducts.reduce((total, product) => total + product.price, 0);
  }

  getTotalDiscountedPrice(discountPercentage: number): number {
    return this.currentProducts.reduce((total, product) => {
      return total + this.calculateDiscountedPrice(product.price, discountPercentage);
    }, 0);
  }

  getTotalSavings(discountPercentage: number): number {
    return this.getTotalOriginalPrice() - this.getTotalDiscountedPrice(discountPercentage);
  }

  async addAllToCart(): Promise<void> {
    if (!this.currentProducts || this.currentProducts.length === 0) {
      this.toastService.showWarning(this.translationService.translate('offers.noProductsToAdd'));
      return;
    }

    // Get current offer to pass offer information
    this.offer$.pipe(takeUntil(this.destroy$)).subscribe(offer => {
      if (!offer) {
        this.toastService.showError(this.translationService.translate('offers.offerNotFound'));
        return;
      }

      // Filter out out-of-stock products
      const availableProducts = this.currentProducts.filter(product =>
        product.availability !== 'out_of_stock' && product.stock_quantity > 0
      );

      if (availableProducts.length === 0) {
        this.toastService.showWarning(this.translationService.translate('offers.allProductsOutOfStock'));
        return;
      }

      // Prepare products for the action
      const products = availableProducts.map(product => ({
        productId: product.id,
        quantity: 1,
        variantId: undefined
      }));

      // Dispatch the offer-based add all to cart action
      this.store.dispatch(addAllToCartFromOffer({
        products,
        offerId: offer.id,
        offerName: offer.title,
        offerType: offer.discount_type as 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'bundle',
        offerDiscount: offer.discountPercentage || 0,
        offerValidUntil: offer.endDate
      }));

      // Show success message
      this.toastService.showSuccess(
        this.translationService.translate('offers.addedProductsToCart', { count: availableProducts.length })
      );

      // Show warning for out-of-stock products if any
      const outOfStockCount = this.currentProducts.length - availableProducts.length;
      if (outOfStockCount > 0) {
        this.toastService.showWarning(
          this.translationService.translate('offers.productsOutOfStock', { count: outOfStockCount })
        );
      }
    });
  }
} 