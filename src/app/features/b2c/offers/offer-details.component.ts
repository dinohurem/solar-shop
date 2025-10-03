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
                <span *ngIf="offer.discount_type === 'percentage' || !offer.discount_type">-{{ offer.discountPercentage }}%</span>
                <span *ngIf="offer.discount_type === 'fixed_amount'">{{ offer.discount_value | currency:'EUR':'symbol':'1.0-2' }} OFF</span>
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
                    {{ calculateTotalDiscountedPrice(offer) | currency:'EUR':'symbol':'1.2-2' }}
                  </span>
                </div>
                <div class="text-lg text-white/90">
                  {{ 'offers.youSave' | translate }} {{ getTotalSavings(offer) | currency:'EUR':'symbol':'1.2-2' }}
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
                  {{ calculateDiscountedPrice(product.price, offer, product) | currency:'EUR':'symbol':'1.2-2' }}
                </span>
              </div>

              <!-- Individual Product Discount Badge (Only if product has specific discount) -->
              <div *ngIf="hasProductSpecificDiscount(product)" class="mb-3">
                <span class="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                  <span *ngIf="product.discount_type === 'percentage'">{{ product.discount_percentage }}% discount</span>
                  <span *ngIf="product.discount_type === 'fixed_amount'">{{ product.discount_amount | currency:'EUR':'symbol':'1.0-2' }} off</span>
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
                  size="md"
                  [offerId]="!isBundle ? offer.id : undefined"
                  [offerName]="!isBundle ? offer.title : undefined"
                  [offerType]="!isBundle ? (product.discount_type === 'fixed_amount' ? 'fixed_amount' : 'percentage') : undefined"
                  [offerDiscount]="!isBundle ? (product.discount_type === 'fixed_amount' ? product.discount_amount : product.discount_percentage) : undefined"
                  [offerOriginalPrice]="!isBundle ? product.price : undefined"
                  [offerValidUntil]="!isBundle ? offer.endDate : undefined"
                  [individualDiscount]="!isBundle ? (product.discount_type === 'fixed_amount' ? product.discount_amount : product.discount_percentage) : undefined"
                  [individualDiscountType]="!isBundle ? product.discount_type : undefined">
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
  isBundle = false;
  currentOffer: any = null;

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

    // Load offer data and check if it's a bundle
    this.offer$.subscribe(async offer => {
      if (offer) {
        this.currentOffer = offer;

        // Fetch full offer details from database to get bundle flag
        try {
          const fullOffer = await this.supabaseService.getTableById('offers', offer.id);
          if (fullOffer) {
            this.isBundle = fullOffer.bundle || false;
            console.log('Offer Details - Loaded offer:', {
              id: offer.id,
              title: offer.title,
              discount_type: offer.discount_type,
              discount_value: offer.discount_value,
              discountPercentage: offer.discountPercentage,
              code: (offer as any).code,
              isBundle: this.isBundle
            });
          }
        } catch (error) {
          console.error('Error loading full offer details:', error);
        }
      }
    });
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
        .order('sort_order')
    ).pipe(
      switchMap(({ data: offerProducts, error }) => {
        console.log('Raw offer products from database:', offerProducts);

        if (error) {
          console.error('Error fetching related products:', error);
          // Fallback to featured products on error
          return from(this.supabaseService.getProducts({ featured: true, limit: 3 }));
        }

        if (offerProducts && offerProducts.length > 0) {
          // Map offer products to the expected format including discount information
          const products = offerProducts.map((op: any) => {
            // Determine discount type based on which field has a value
            const discountType = (op.discount_amount && op.discount_amount > 0) ? 'fixed_amount' : 'percentage';
            
            const productResult = {
              id: op.products.id,
              name: op.products.name,
              description: op.products.description,
              price: op.products.price,
              availability: this.getProductAvailability(op.products.stock_quantity),
              images: op.products.images || [],
              category: op.products.categories?.name,
              stock_quantity: op.products.stock_quantity || 0,
              discount_percentage: op.discount_percentage || 0,
              discount_amount: op.discount_amount || 0,
              discount_type: discountType
            };

            console.log('Offer Details - Product with discount info:', {
              productId: productResult.id,
              price: productResult.price,
              discount_percentage: productResult.discount_percentage,
              discount_amount: productResult.discount_amount,
              discount_type: productResult.discount_type,
              raw_op: op
            });

            return productResult;
          });
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

  calculateDiscountedPrice(originalPrice: number, offer: Offer, product?: any): number {
    // If we have product-specific discount information, use that
    if (product && (product.discount_percentage > 0 || product.discount_amount > 0)) {
      if (product.discount_type === 'fixed_amount') {
        return Math.max(0, originalPrice - (product.discount_amount || 0));
      } else {
        return originalPrice * (1 - (product.discount_percentage || 0) / 100);
      }
    }
    
    // Fallback to offer-level discount calculation
    if (!offer.discount_type || offer.discount_type === 'percentage') {
      const discountPercentage = offer.discountPercentage || 0;
      return originalPrice * (1 - discountPercentage / 100);
    } else if (offer.discount_type === 'fixed_amount') {
      // For fixed amount discounts, calculate proportional discount per product
      const totalOriginalPrice = this.getTotalOriginalPrice();
      const fixedDiscountAmount = offer.discount_value || 0;
      if (totalOriginalPrice > 0) {
        const proportionalDiscount = (originalPrice / totalOriginalPrice) * fixedDiscountAmount;
        return Math.max(0, originalPrice - proportionalDiscount);
      }
    }
    return originalPrice;
  }

  calculateTotalDiscountedPrice(offer: Offer): number {
    // Calculate total using individual product discounts
    return this.currentProducts.reduce((total, product) => {
      return total + this.calculateDiscountedPrice(product.price, offer, product);
    }, 0);
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
    this.router.navigate(['/proizvodi', productId]);
  }

  navigateToProducts(): void {
    this.router.navigate(['/proizvodi']);
  }

  getTotalOriginalPrice(): number {
    return this.currentProducts.reduce((total, product) => total + product.price, 0);
  }


  getTotalSavings(offer: Offer): number {
    return this.getTotalOriginalPrice() - this.calculateTotalDiscountedPrice(offer);
  }

  hasProductSpecificDiscount(product: any): boolean {
    return (product.discount_percentage && product.discount_percentage > 0) ||
           (product.discount_amount && product.discount_amount > 0);
  }

  async addAllToCart(): Promise<void> {
    if (!this.currentProducts || this.currentProducts.length === 0) {
      this.toastService.showWarning(this.translationService.translate('offers.noProductsToAdd'));
      return;
    }

    // Get current offer to pass offer information
    this.offer$.pipe(takeUntil(this.destroy$)).subscribe(async offer => {
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

      // Prepare products for the action with individual discounts
      const products = availableProducts.map(product => {
        // Get the correct individual discount based on type
        let individualDiscount;
        if (product.discount_type === 'fixed_amount' && product.discount_amount > 0) {
          individualDiscount = product.discount_amount;
        } else if (product.discount_type === 'percentage' && product.discount_percentage > 0) {
          individualDiscount = product.discount_percentage;
        } else {
          individualDiscount = undefined;
        }

        const productData = {
          productId: product.id,
          quantity: 1,
          variantId: undefined,
          individualDiscount: individualDiscount,
          individualDiscountType: product.discount_type || undefined,
          originalPrice: product.price
        };

        console.log('Offer Details - Sending product to cart:', {
          productId: productData.productId,
          individualDiscount: productData.individualDiscount,
          individualDiscountType: productData.individualDiscountType,
          originalPrice: productData.originalPrice,
          product_discount_amount: product.discount_amount,
          product_discount_percentage: product.discount_percentage,
          product_discount_type: product.discount_type
        });

        return productData;
      });

      // Get the original offer from database to get discount_value and bundle flag
      let discountValue = offer.discountPercentage || 0;
      let isBundle = false;
      let totalProductsInOffer = this.currentProducts.length;

      try {
        const originalOffer = await this.supabaseService.getTableById('offers', offer.id);
        if (originalOffer) {
          discountValue = originalOffer.discount_value || offer.discountPercentage || 0;
          isBundle = originalOffer.bundle || false;
        }
      } catch (error) {
        console.error('Error fetching original offer data:', error);
      }

      // Dispatch the offer-based add all to cart action
      const actionPayload = {
        products,
        offerId: offer.id,
        offerName: offer.title,
        offerType: (offer.discount_type || 'percentage') as 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'bundle',
        offerDiscount: discountValue,
        offerValidUntil: offer.endDate,
        isBundle: isBundle,
        bundleProductIds: isBundle ? this.currentProducts.map(p => p.id) : undefined
      };

      console.log('Offer Details - Dispatching cart action:', {
        offerType: actionPayload.offerType,
        offerDiscount: actionPayload.offerDiscount,
        products: actionPayload.products
      });

      this.store.dispatch(addAllToCartFromOffer(actionPayload));

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