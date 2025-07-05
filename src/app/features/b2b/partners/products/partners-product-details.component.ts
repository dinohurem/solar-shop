import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, switchMap, map } from 'rxjs/operators';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { selectCurrentUser } from '../../../../core/auth/store/auth.selectors';
import { User } from '../../../../shared/models/user.model';
import { Company } from '../../../../shared/models/company.model';
import { SupabaseService } from '../../../../services/supabase.service';
import * as ProductsActions from '../../shared/store/products.actions';
import { selectProductsWithPricing, selectProductsLoading } from '../../shared/store/products.selectors';
import { ProductWithPricing } from '../../shared/store/products.actions';
import * as B2BCartActions from '../../cart/store/b2b-cart.actions';

@Component({
  selector: 'app-partners-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Breadcrumb -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav class="flex" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-4">
              <li>
                <div>
                  <a [routerLink]="['/partners']" class="text-gray-400 hover:text-gray-500 font-['DM_Sans']">
                    {{ 'b2bNav.home' | translate }}
                  </a>
                </div>
              </li>
              <li>
                <div class="flex items-center">
                  <svg class="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                  </svg>
                  <a [routerLink]="['/partners/products']" class="ml-4 text-gray-400 hover:text-gray-500 font-['DM_Sans']">
                    {{ 'b2bNav.products' | translate }}
                  </a>
                </div>
              </li>
              <li>
                <div class="flex items-center">
                  <svg class="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                  </svg>
                  <span class="ml-4 text-gray-500 font-['DM_Sans']">
                    {{ product?.name || 'Product Details' }}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading$ | async" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-solar-600 border-t-transparent"></div>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div class="text-center">
          <div class="text-red-400 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2 font-['Poppins']">{{ 'b2b.products.productNotFound' | translate }}</h3>
          <p class="text-gray-600 mb-6 font-['DM_Sans']">{{ error }}</p>
          <button 
            [routerLink]="['/partners/products']"
            class="px-6 py-3 bg-solar-600 text-white font-semibold rounded-lg hover:bg-solar-700 transition-colors font-['DM_Sans']"
          >
            {{ 'b2b.products.backToProducts' | translate }}
          </button>
        </div>
      </div>

      <!-- Product Details -->
      <div *ngIf="product && !(loading$ | async)" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <!-- Product Images -->
          <div class="lg:sticky lg:top-8">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div class="aspect-w-1 aspect-h-1 bg-gray-50 flex items-center justify-center min-h-[400px]">
                <img *ngIf="hasProductImage(product)" 
                     [src]="getProductImageUrl(product)" 
                     [alt]="product.name" 
                     class="w-full h-96 object-cover"
                     (error)="onImageError($event)">
                <!-- Fallback Icon -->
                <div *ngIf="!hasProductImage(product)" class="text-gray-500 text-center py-12">
                  <svg class="w-32 h-32 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="0.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                  <p class="text-xl font-medium text-gray-600 mb-2">{{ product.category || ('b2b.products.product' | translate) }}</p>
                  <p class="text-sm text-gray-500">{{ 'b2b.products.noImageAvailable' | translate }}</p>
                </div>
              </div>
              <!-- Additional Images (if available) -->
              <div *ngIf="product.images && product.images.length > 1" class="p-4">
                <div class="flex space-x-2 overflow-x-auto">
                  <div *ngFor="let image of product.images" 
                       class="w-16 h-16 bg-gray-100 rounded border border-gray-200 cursor-pointer hover:opacity-75 flex items-center justify-center flex-shrink-0">
                    <img *ngIf="image.url" 
                         [src]="image.url" 
                         [alt]="image.alt || product.name"
                         class="w-full h-full object-cover rounded"
                         (error)="onImageError($event)">
                    <!-- Fallback for gallery images -->
                    <svg *ngIf="!image.url" class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Product Info -->
          <div class="space-y-6">
            <!-- Company Banner -->
            <div *ngIf="company" class="bg-solar-50 border border-solar-200 rounded-lg p-4">
              <div class="flex items-center space-x-2">
                <svg class="w-5 h-5 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
                <span class="text-sm font-medium text-solar-800">{{ 'b2b.products.viewingAs' | translate }}: {{ company.companyName }}</span>
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {{ 'b2b.products.approvedPartner' | translate }}
                </span>
              </div>
            </div>

            <!-- Product Header -->
            <div>
              <div class="flex items-center space-x-2 mb-2">
                <span class="text-sm font-medium text-gray-500 uppercase">{{ product.category || 'Product' }}</span>
                <span class="text-sm text-gray-400">{{ product.sku }}</span>
              </div>
              <h1 class="text-3xl font-bold text-gray-900 font-['Poppins']">{{ product.name }}</h1>
              <p class="mt-4 text-lg text-gray-600 font-['DM_Sans']">{{ product.description }}</p>
            </div>

            <!-- Status Badges -->
            <div class="flex space-x-2 flex-wrap">
              <span *ngIf="product.in_stock" 
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                {{ 'b2b.products.inStock' | translate }}
              </span>
              <span *ngIf="!product.in_stock" 
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                {{ 'b2b.products.outOfStock' | translate }}
              </span>
              <span *ngIf="product.partner_only" 
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-solar-100 text-solar-800">
                {{ 'b2b.products.partnerExclusive' | translate }}
              </span>
            </div>

            <!-- Pricing -->
            <div class="bg-white rounded-lg border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ 'b2b.products.pricing' | translate }}</h3>
              
              <div *ngIf="!isAuthenticated" class="text-center py-8 bg-gray-50 rounded-lg">
                <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <p class="text-gray-500 font-medium">{{ 'b2b.products.signInToViewPricing' | translate }}</p>
                <button (click)="navigateToLogin()" 
                        class="mt-4 bg-solar-600 text-white px-6 py-2 rounded-lg hover:bg-solar-700 transition-colors">
                  {{ 'b2b.products.signIn' | translate }}
                </button>
              </div>

              <div *ngIf="isAuthenticated" class="space-y-4">
                <!-- Company Specific Price -->
                <div *ngIf="product.company_price && isCompanyContact" class="flex items-center justify-between">
                  <span class="text-lg font-medium text-green-700">{{ 'b2b.products.yourCompanyPrice' | translate }}:</span>
                  <span class="text-2xl font-bold text-green-600">€{{ product.company_price | number:'1.2-2' }}</span>
                </div>

                <!-- Partner Price -->
                <div *ngIf="product.partner_price && (!product.company_price || !isCompanyContact)" class="flex items-center justify-between">
                  <span class="text-lg font-medium text-solar-700">{{ 'b2b.products.partnerPrice' | translate }}:</span>
                  <span class="text-2xl font-bold text-solar-600">€{{ product.partner_price | number:'1.2-2' }}</span>
                </div>

                <!-- Retail Price -->
                <div class="flex items-center justify-between text-gray-500">
                  <span>{{ 'b2b.products.retailPrice' | translate }}:</span>
                  <span class="line-through">€{{ product.price | number:'1.2-2' }}</span>
                </div>

                <!-- Savings -->
                <div *ngIf="product.savings" class="flex items-center justify-between">
                  <span class="font-medium text-green-700">{{ 'b2b.products.yourSavings' | translate }}:</span>
                  <span class="font-bold text-green-600">€{{ product.savings | number:'1.2-2' }}</span>
                </div>

                <!-- No B2B Pricing Available -->
                <div *ngIf="!hasB2BPrice(product)" class="text-center py-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <svg class="w-8 h-8 text-yellow-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p class="text-yellow-800 font-medium">{{ 'b2b.products.customPricingRequired' | translate }}</p>
                  <p class="text-yellow-600 text-sm">{{ 'b2b.products.contactForQuote' | translate }}</p>
                </div>
              </div>
            </div>

            <!-- Order Information -->
            <div class="bg-white rounded-lg border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ 'b2b.products.orderInformation' | translate }}</h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">{{ 'b2b.products.minimumOrder' | translate }}:</span>
                  <span class="font-medium">{{ getMinimumOrder(product) }} {{ 'b2b.products.pieces' | translate }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">{{ 'b2b.products.availability' | translate }}:</span>
                  <span class="font-medium" [class]="product.in_stock ? 'text-green-600' : 'text-red-600'">
                    {{ product.in_stock ? ('b2b.products.inStock' | translate) : ('b2b.products.outOfStock' | translate) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="space-y-3">
              <!-- Add to Cart Button -->
              <button *ngIf="isCompanyContact && product.in_stock && hasB2BPrice(product)" 
                      (click)="addToCart(product)"
                      class="w-full bg-solar-600 text-white py-3 px-6 rounded-lg text-lg font-medium hover:bg-solar-700 transition-colors">
                {{ 'b2b.products.addToCart' | translate }}
              </button>
              
              <!-- Request Quote Button -->
              <button *ngIf="isCompanyContact && (!hasB2BPrice(product) || !product.in_stock)" 
                      (click)="requestQuote(product)"
                      class="w-full bg-yellow-600 text-white py-3 px-6 rounded-lg text-lg font-medium hover:bg-yellow-700 transition-colors">
                {{ 'b2b.products.requestQuote' | translate }}
              </button>
              
              <!-- Sign In / Apply Buttons -->
              <div *ngIf="!isAuthenticated" class="space-y-2">
                <button (click)="navigateToLogin()"
                        class="w-full bg-solar-600 text-white py-3 px-6 rounded-lg text-lg font-medium hover:bg-solar-700 transition-colors">
                  {{ 'b2b.products.signInToOrder' | translate }}
                </button>
              </div>
              
              <div *ngIf="isAuthenticated && !isCompanyContact" class="space-y-2">
                <button (click)="navigateToRegister()"
                        class="w-full bg-yellow-600 text-white py-3 px-6 rounded-lg text-lg font-medium hover:bg-yellow-700 transition-colors">
                  {{ 'b2b.products.applyForPartnership' | translate }}
                </button>
              </div>
            </div>

            <!-- Specifications -->
            <div *ngIf="product.specifications" class="bg-white rounded-lg border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900">{{ 'b2b.products.specifications' | translate }}</h3>
                <button 
                  (click)="toggleSpecifications()"
                  class="flex items-center space-x-2 text-solar-600 hover:text-solar-700 transition-colors duration-200"
                  [attr.aria-expanded]="isSpecificationsExpanded"
                  [attr.aria-label]="isSpecificationsExpanded ? 'Collapse specifications' : 'Expand specifications'"
                >
                  <svg 
                    class="w-5 h-5 transition-transform duration-200"
                    [class.rotate-180]="isSpecificationsExpanded"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
              </div>
              <div 
                class="overflow-hidden transition-all duration-300 ease-in-out"
                [class.max-h-0]="!isSpecificationsExpanded"
                [class.max-h-screen]="isSpecificationsExpanded"
              >
                <dl class="space-y-3">
                  <div *ngFor="let spec of getSpecifications(product.specifications)" class="flex justify-between">
                    <dt class="text-gray-600">{{ spec.key }}:</dt>
                    <dd class="font-medium text-gray-900">{{ spec.value }}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
    
    :host {
      display: block;
    }
    
    /* Collapsible specifications animation */
    .max-h-0 {
      max-height: 0;
      opacity: 0;
      padding-top: 0;
      padding-bottom: 0;
      margin-top: 0;
      margin-bottom: 0;
    }
    
    .max-h-screen {
      max-height: 100vh;
      opacity: 1;
    }
    
    /* Smooth rotation for chevron icon */
    .rotate-180 {
      transform: rotate(180deg);
    }
  `]
})
export class PartnersProductDetailsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store);
  private supabaseService = inject(SupabaseService);
  private destroy$ = new Subject<void>();

  currentUser: User | null = null;
  isAuthenticated = false;
  isCompanyContact = false;
  company: Company | null = null;

  product: ProductWithPricing | null = null;
  loading = true;
  error: string | null = null;

  // Collapsible specifications state
  isSpecificationsExpanded = true;

  products$: Observable<ProductWithPricing[]>;
  loading$: Observable<boolean>;

  constructor() {
    this.products$ = this.store.select(selectProductsWithPricing);
    this.loading$ = this.store.select(selectProductsLoading);
  }

  ngOnInit(): void {
    // Load user and company info
    this.store.select(selectCurrentUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (user) => {
        this.currentUser = user;
        this.isAuthenticated = !!user;

        if (user) {
          await this.loadCompanyInfo(user.id);
        }
      });

    // Subscribe to products from store and route params
    this.route.params
      .pipe(
        switchMap(params => {
          const productId = params['id'];
          if (!productId) {
            this.error = 'Product ID not found';
            this.loading = false;
            return [];
          }

          // Load products if not already loaded
          this.loadProduct(productId);

          return this.products$.pipe(
            map(products => ({ products, productId }))
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(({ products, productId }) => {
        if (products && products.length > 0 && productId) {
          const foundProduct = products.find(p => p.id === productId);
          if (foundProduct) {
            this.product = foundProduct;
            this.error = null;
          } else if (!this.loading) {
            // Only set error if we're not still loading
            this.error = 'Product not found';
          }
        }
      });

    // Subscribe to loading state
    this.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.loading = loading;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadCompanyInfo(userId: string): Promise<void> {
    try {
      const { data: company, error } = await this.supabaseService.client
        .from('companies')
        .select('*')
        .eq('contact_person_id', userId)
        .eq('status', 'approved')
        .single();

      if (!error && company) {
        this.company = company;
        this.isCompanyContact = true;
      }
    } catch (error) {
      console.error('Error loading company info:', error);
    }
  }

  private loadProduct(productId: string): void {
    this.loading = true;
    this.error = null;
    // Load all products (which includes the specific product)
    this.store.dispatch(ProductsActions.loadProducts());

    // If we need company-specific pricing, load that too
    if (this.isCompanyContact && this.company) {
      this.store.dispatch(ProductsActions.loadCompanyPricing({ companyId: this.company.id }));
    }
  }

  hasB2BPrice(product: ProductWithPricing): boolean {
    return !!(product.company_price || product.partner_price);
  }

  getMinimumOrder(product: ProductWithPricing): number {
    // Use company-specific minimum order if available, otherwise use product default
    if (this.isCompanyContact && product.company_minimum_order !== undefined) {
      return product.company_minimum_order;
    }
    return product.minimum_order || 1;
  }

  getSpecifications(specs: Record<string, string>): Array<{ key: string, value: string }> {
    return Object.entries(specs).map(([key, value]) => ({ key, value }));
  }

  addToCart(product: ProductWithPricing): void {
    if (this.isCompanyContact && this.company) {
      this.store.dispatch(B2BCartActions.addToB2BCart({
        productId: product.id,
        quantity: 1,
        companyId: this.company.id
      }));
    }
  }

  requestQuote(product: ProductWithPricing): void {
    this.router.navigate(['/partners/contact'], {
      queryParams: {
        subject: 'pricingInquiry',
        productId: product.id,
        productName: product.name,
        sku: product.sku
      }
    });
  }

  getProductImageUrl(product: ProductWithPricing): string {
    // If image_url is already computed, use it
    if (product.image_url) {
      return product.image_url;
    }

    // Extract from images array
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      // Find primary image first
      const primaryImage = product.images.find(img => img.is_primary);
      if (primaryImage) {
        return primaryImage.url;
      }

      // Fallback to first image
      return product.images[0].url;
    }

    // Return empty string to indicate no image available - will show fallback icon
    return '';
  }

  hasProductImage(product: ProductWithPricing): boolean {
    return !!this.getProductImageUrl(product);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      // Hide the broken image and let the fallback icon show
      img.style.display = 'none';
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/partners/register']);
  }

  toggleSpecifications(): void {
    this.isSpecificationsExpanded = !this.isSpecificationsExpanded;
  }
} 