import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Product } from '../product-list/product-list.component';
import { ProductDetailsActions } from './store/product-details.actions';
import { selectProduct, selectIsLoading, selectError } from './store/product-details.selectors';
import { ProductPhotosComponent } from './components/product-photos/product-photos.component';
import { ProductInfoComponent } from './components/product-info/product-info.component';
import { ProductReviewsComponent } from './components/product-reviews/product-reviews.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ProductPhotosComponent,
    ProductInfoComponent,
    ProductReviewsComponent,
    TranslatePipe
  ],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Breadcrumb -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav class="flex" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-4">
              <li>
                <div>
                  <a [routerLink]="['/home']" class="text-gray-400 hover:text-gray-500 font-['DM_Sans']">
                    {{ 'productDetails.home' | translate }}
                  </a>
                </div>
              </li>
              <li>
                <div class="flex items-center">
                  <svg class="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                  </svg>
                  <a [routerLink]="['/products']" class="ml-4 text-gray-400 hover:text-gray-500 font-['DM_Sans']">
                    {{ 'productDetails.products' | translate }}
                  </a>
                </div>
              </li>
              <li>
                <div class="flex items-center">
                  <svg class="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                  </svg>
                  <span class="ml-4 text-gray-500 font-['DM_Sans']">
                    {{ (product$ | async)?.name || ('productDetails.productDetails' | translate) }}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading$ | async" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-[#0ACF83] border-t-transparent"></div>
      </div>

      <!-- Error State -->
      <div *ngIf="error$ | async as error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div class="text-center">
          <div class="text-red-400 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2 font-['Poppins']">{{ 'productDetails.productNotFound' | translate }}</h3>
          <p class="text-gray-600 mb-6 font-['DM_Sans']">{{ error }}</p>
          <button 
            [routerLink]="['/products']"
            class="px-6 py-3 bg-[#0ACF83] text-white font-semibold rounded-lg hover:bg-[#09b574] transition-colors font-['DM_Sans']"
          >
            {{ 'productDetails.backToProducts' | translate }}
          </button>
        </div>
      </div>

      <!-- Product Details -->
      <div *ngIf="product$ | async as product" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          <!-- Product Photos -->
          <div class="lg:sticky lg:top-8">
            <app-product-photos [product]="product"></app-product-photos>
          </div>

          <!-- Product Info -->
          <div>
            <app-product-info [product]="product" [isCompanyPricing]="isCompanyPricing"></app-product-info>
          </div>
        </div>

        <!-- Product Reviews -->
        <div class="border-t border-gray-200 pt-12">
          <app-product-reviews [productId]="product.id"></app-product-reviews>
        </div>

        <!-- Related Products -->
        <div class="border-t border-gray-200 pt-12 mt-12">
          <h3 class="text-2xl font-bold text-gray-900 mb-8 font-['Poppins']">{{ 'productDetails.relatedProducts' | translate }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Related products would be loaded here -->
            <div class="text-center py-8 text-gray-500 font-['DM_Sans']">
              {{ 'productDetails.relatedProductsComingSoon' | translate }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Custom font loading */
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
    
    :host {
      display: block;
    }
  `]
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  product$: Observable<Product | null>;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;
  isCompanyPricing = false;

  constructor() {
    this.product$ = this.store.select(selectProduct);
    this.isLoading$ = this.store.select(selectIsLoading);
    this.error$ = this.store.select(selectError);
  }

  ngOnInit(): void {
    // Check if this is company pricing mode
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(queryParams => {
      this.isCompanyPricing = queryParams['companyPricing'] === 'true';
    });

    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const productId = params['id'];
      if (productId) {
        this.store.dispatch(ProductDetailsActions.loadProduct({ productId }));
      } else {
        this.router.navigate(['/products']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(ProductDetailsActions.clearProduct());
  }
} 