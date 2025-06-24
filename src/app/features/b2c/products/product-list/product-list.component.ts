import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { ProductListActions } from './store/product-list.actions';
import {
  selectProducts,
  selectFilteredProducts,
  selectIsLoading,
  selectFilters,
  selectSortOption,
  selectCategories,
  selectManufacturers,
  selectCertificates,
  selectSearchQuery
} from './store/product-list.selectors';
import { AddToCartButtonComponent } from '../../cart/components/add-to-cart-button/add-to-cart-button.component';
import * as CartActions from '../../cart/store/cart.actions';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { ProductCategory } from '../services/categories.service';
import { selectProductCategories } from '../store/products.selectors';
import { ProductsActions } from '../store/products.actions';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  imageUrl: string;
  category: string;
  manufacturer: string;
  certificates: string[];
  rating: number;
  reviewCount: number;
  availability: 'available' | 'limited' | 'out-of-stock';
  featured: boolean;
  createdAt: Date;
}

export interface ProductFilters {
  categories: string[];
  priceRange: { min: number; max: number };
  certificates: string[];
  manufacturers: string[];
}

export type SortOption = 'featured' | 'newest' | 'name-asc' | 'name-desc' | 'price-low' | 'price-high';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AddToCartButtonComponent, TranslatePipe],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 class="text-3xl font-bold text-gray-900 font-['Poppins']">{{ 'productList.title' | translate }}</h1>
          <p class="mt-2 text-gray-600 font-['DM_Sans']">{{ 'productList.subtitle' | translate }}</p>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col lg:flex-row gap-8">
          <!-- Filters Sidebar -->
          <div class="lg:w-1/4">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 class="text-lg font-semibold text-gray-900 mb-6 font-['Poppins']">{{ 'productList.filters' | translate }}</h3>
              
              <!-- Search Bar -->
              <div class="mb-6">
                <h4 class="text-sm font-medium text-gray-900 mb-3 font-['DM_Sans']">{{ 'search.search' | translate }}</h4>
                <div class="relative">
                  <input 
                    type="text"
                    [value]="searchQuery$ | async"
                    (input)="onSearchChange($event)"
                    [placeholder]="'search.searchByName' | translate"
                    class="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md text-sm focus:ring-solar-500 focus:border-solar-500 font-['DM_Sans']"
                  >
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Categories Filter -->
              <div class="mb-6">
                <h4 class="text-sm font-medium text-gray-900 mb-3 font-['DM_Sans']">{{ 'productList.categories' | translate }}</h4>
                <div class="space-y-2">
                  <label *ngFor="let category of categories$ | async" class="flex items-center">
                    <input 
                      type="checkbox" 
                      [value]="category.name"
                      [checked]="(filters$ | async)?.categories?.includes(category.name) || false"
                      (change)="onCategoryChange(category.name, $event)"
                      class="rounded border-gray-300 text-solar-600 focus:ring-solar-500"
                    >
                    <span class="ml-2 text-sm text-gray-700 font-['DM_Sans']">{{ category.name }}</span>
                  </label>
                </div>
              </div>

              <!-- Price Range Filter -->
              <div class="mb-6">
                <h4 class="text-sm font-medium text-gray-900 mb-3 font-['DM_Sans']">{{ 'productList.priceRange' | translate }}</h4>
                <div class="space-y-3">
                  <div class="flex items-center space-x-2">
                    <input 
                      type="number" 
                      [placeholder]="'productList.min' | translate"
                      [value]="(filters$ | async)?.priceRange?.min || 0"
                      (input)="onPriceRangeChange('min', $event)"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-solar-500 focus:border-solar-500"
                    >
                    <span class="text-gray-500">-</span>
                    <input 
                      type="number" 
                      [placeholder]="'productList.max' | translate"
                      [value]="(filters$ | async)?.priceRange?.max || 0"
                      (input)="onPriceRangeChange('max', $event)"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-solar-500 focus:border-solar-500"
                    >
                  </div>
                </div>
              </div>

              <!-- Manufacturer Filter -->
              <div class="mb-6">
                <h4 class="text-sm font-medium text-gray-900 mb-3 font-['DM_Sans']">{{ 'productList.manufacturer' | translate }}</h4>
                <div class="space-y-2">
                  <label *ngFor="let manufacturer of manufacturers$ | async" class="flex items-center">
                    <input 
                      type="checkbox" 
                      [value]="manufacturer"
                      [checked]="(filters$ | async)?.manufacturers?.includes(manufacturer) || false"
                      (change)="onManufacturerChange(manufacturer, $event)"
                      class="rounded border-gray-300 text-solar-600 focus:ring-solar-500"
                    >
                    <span class="ml-2 text-sm text-gray-700 font-['DM_Sans']">{{ manufacturer }}</span>
                  </label>
                </div>
              </div>

              <!-- Clear Filters -->
              <button 
                (click)="clearFilters()"
                class="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors font-['DM_Sans']"
              >
                {{ 'productList.clearAllFilters' | translate }}
              </button>
            </div>
          </div>

          <!-- Products Grid -->
          <div class="lg:w-3/4">
            <!-- Sort Options -->
            <div class="flex justify-between items-center mb-6">
              <p class="text-sm text-gray-600 font-['DM_Sans']">
                {{ 'productList.productsFound' | translate:{ count: (filteredProducts$ | async)?.length || 0 } }}
              </p>
              <div class="flex items-center space-x-2">
                <label class="text-sm font-medium text-gray-700 font-['DM_Sans']">{{ 'productList.sortBy' | translate }}</label>
                <select 
                  [value]="sortOption$ | async"
                  (change)="onSortChange($event)"
                  class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-solar-500 focus:border-solar-500 font-['DM_Sans']"
                >
                  <option value="featured">{{ 'productList.featured' | translate }}</option>
                  <option value="newest">{{ 'productList.newestArrivals' | translate }}</option>
                  <option value="name-asc">{{ 'productList.nameAZ' | translate }}</option>
                  <option value="name-desc">{{ 'productList.nameZA' | translate }}</option>
                  <option value="price-low">{{ 'productList.priceLowHigh' | translate }}</option>
                  <option value="price-high">{{ 'productList.priceHighLow' | translate }}</option>
                </select>
              </div>
            </div>

            <!-- Products Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div 
                *ngFor="let product of filteredProducts$ | async; trackBy: trackByProductId"
                class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 group cursor-pointer"
                [routerLink]="['/products', product.id]"
              >
                <!-- Product Image -->
                <div class="relative aspect-square overflow-hidden">
                  <img 
                    [src]="product.imageUrl" 
                    [alt]="product.name"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  >
                  <!-- Discount Badge -->
                  <div 
                    *ngIf="product.discount" 
                    class="absolute top-3 left-3 bg-solar-500 text-white px-2 py-1 rounded-full text-xs font-semibold"
                  >
                    -{{ product.discount }}%
                  </div>
                  <!-- Availability Badge -->
                  <div 
                    class="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold"
                    [ngClass]="{
                      'bg-green-100 text-green-800': product.availability === 'available',
                      'bg-yellow-100 text-yellow-800': product.availability === 'limited',
                      'bg-red-100 text-red-800': product.availability === 'out-of-stock'
                    }"
                  >
                    {{ getAvailabilityText(product.availability) | translate }}
                  </div>
                </div>

                <!-- Product Info -->
                <div class="p-4">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2 font-['Poppins'] line-clamp-2">
                    {{ product.name }}
                  </h3>
                  <p class="text-sm text-gray-600 mb-3 font-['DM_Sans'] line-clamp-2">
                    {{ product.description }}
                  </p>

                  <!-- Rating -->
                  <div class="flex items-center mb-3">
                    <div class="flex items-center">
                      <span class="text-sm font-medium text-gray-900 mr-1">{{ product.rating }}</span>
                      <div class="flex">
                        <svg 
                          *ngFor="let star of getStarArray(product.rating)" 
                          class="w-4 h-4 text-yellow-400 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      </div>
                    </div>
                    <span class="text-xs text-gray-500 ml-2 font-['DM_Sans']">({{ product.reviewCount }} {{ 'productList.reviews' | translate }})</span>
                  </div>

                  <!-- Price and Add to Cart -->
                  <div class="space-y-3">
                    <div class="flex items-center space-x-2">
                      <span class="text-xl font-bold text-gray-900 font-['DM_Sans']">
                        €{{ product.price.toLocaleString() }}
                      </span>
                      <span 
                        *ngIf="product.originalPrice" 
                        class="text-sm text-gray-500 line-through font-['DM_Sans']"
                      >
                        €{{ product.originalPrice.toLocaleString() }}
                      </span>
                    </div>
                    <app-add-to-cart-button 
                      [productId]="product.id" 
                      [quantity]="1" 
                      [buttonText]="'productList.addToCart' | translate"
                      size="sm"
                      [fullWidth]="true"
                      (click)="$event.stopPropagation()">
                    </app-add-to-cart-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Loading State -->
            <div *ngIf="isLoading$ | async" class="flex justify-center items-center py-12">
              <div class="animate-spin rounded-full h-12 w-12 border-4 border-solar-500 border-t-transparent"></div>
            </div>

            <!-- Empty State -->
            <div 
              *ngIf="!(isLoading$ | async) && (filteredProducts$ | async)?.length === 0"
              class="text-center py-12"
            >
              <div class="text-gray-400 mb-4">
                <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4.5"/>
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2 font-['Poppins']">{{ 'productList.noProductsFound' | translate }}</h3>
              <p class="text-gray-600 font-['DM_Sans']">{{ 'productList.adjustFilters' | translate }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Custom font loading */
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
    
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class ProductListComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  products$: Observable<Product[]>;
  filteredProducts$: Observable<Product[]>;
  isLoading$: Observable<boolean>;
  filters$: Observable<ProductFilters>;
  sortOption$: Observable<SortOption>;
  categories$: Observable<ProductCategory[]>;
  manufacturers$: Observable<string[]>;
  certificates$: Observable<string[]>;
  searchQuery$: Observable<string>;

  private searchSubject = new Subject<string>();

  constructor() {
    this.products$ = this.store.select(selectProducts);
    this.filteredProducts$ = this.store.select(selectFilteredProducts);
    this.isLoading$ = this.store.select(selectIsLoading);
    this.filters$ = this.store.select(selectFilters);
    this.sortOption$ = this.store.select(selectSortOption);
    this.categories$ = this.store.select(selectProductCategories);
    this.manufacturers$ = this.store.select(selectManufacturers);
    this.certificates$ = this.store.select(selectCertificates);
    this.searchQuery$ = this.store.select(selectSearchQuery);
  }

  ngOnInit(): void {
    this.store.dispatch(ProductListActions.loadProducts());
    this.store.dispatch(ProductsActions.loadProductCategories());

    // Check if we should clear filters based on navigation source
    this.checkAndClearFiltersIfNeeded();

    // Handle query parameters (for initial load and external navigation)
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      // Handle search from navbar or direct URL access
      if (params['search'] !== undefined) {
        this.store.dispatch(ProductListActions.searchProducts({
          query: params['search'] || ''
        }));
      }

      // Handle category filtering from query parameters
      if (params['category']) {
        // Clear existing filters first (but not search if it was just set)
        if (params['search'] === undefined) {
          this.store.dispatch(ProductListActions.clearFilters());
        }

        // Wait for categories to be loaded, then find the matching category
        this.categories$.pipe(
          takeUntil(this.destroy$),
          // Only process when categories are actually loaded
          filter((categories): categories is ProductCategory[] =>
            categories !== null && categories.length > 0
          )
        ).subscribe((categories) => {
          const matchingCategory = categories.find((cat) =>
            cat.slug === params['category'] ||
            cat.id === params['category'] ||
            cat.name.toLowerCase() === params['category'].toLowerCase()
          );

          if (matchingCategory) {
            // Apply category filter using the category name (what products use)
            this.store.dispatch(ProductListActions.toggleCategoryFilter({
              category: matchingCategory.name,
              checked: true
            }));
          }
        });
      }
    });

    // Handle debounced search input (for user typing)
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      // Update the store
      this.store.dispatch(ProductListActions.searchProducts({ query }));

      // Update the URL to maintain the search parameter
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: query ? { search: query } : {},
        queryParamsHandling: 'merge',
        replaceUrl: true // Use replaceUrl to avoid creating history entries for each keystroke
      });
    });
  }

  ngOnDestroy(): void {
    // Clear filters when leaving the product list page to ensure clean state
    this.store.dispatch(ProductListActions.clearFilters());
    this.store.dispatch(ProductListActions.searchProducts({ query: '' }));

    this.destroy$.next();
    this.destroy$.complete();
    this.searchSubject.complete();
  }

  private checkAndClearFiltersIfNeeded(): void {
    // Get navigation state to check if coming from navbar search or hero explore
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state;

    // Check if this navigation came from navbar search or hero explore buttons
    // Don't clear filters if coming from products page (category navigation)
    if (state?.['clearFilters'] === true ||
      state?.['fromHero'] === true) {
      // Clear all existing filters when navigating from hero explore
      this.store.dispatch(ProductListActions.clearFilters());
      this.store.dispatch(ProductListActions.searchProducts({ query: '' }));
    } else if (state?.['fromNavbar'] === true) {
      // Clear only non-search filters when coming from navbar search
      this.store.dispatch(ProductListActions.clearFilters());
      // Don't clear search query as it will be set from query params
    }
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const query = target.value;

    // Use the subject to debounce the search
    this.searchSubject.next(query);
  }

  onCategoryChange(category: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.store.dispatch(ProductListActions.toggleCategoryFilter({ category, checked: target.checked }));
  }

  onPriceRangeChange(type: 'min' | 'max', event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = parseFloat(target.value) || 0;
    this.store.dispatch(ProductListActions.updatePriceRange({ rangeType: type, value }));
  }

  onCertificateChange(certificate: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.store.dispatch(ProductListActions.toggleCertificateFilter({ certificate, checked: target.checked }));
  }

  onManufacturerChange(manufacturer: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.store.dispatch(ProductListActions.toggleManufacturerFilter({ manufacturer, checked: target.checked }));
  }

  onSortChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const sortOption = target.value as SortOption;
    this.store.dispatch(ProductListActions.updateSortOption({ sortOption }));
  }

  clearFilters(): void {
    this.store.dispatch(ProductListActions.clearFilters());
    this.store.dispatch(ProductListActions.searchProducts({ query: '' }));

    // Clear search parameter from URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      queryParamsHandling: 'replace'
    });
  }

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }

  getAvailabilityText(availability: string): string {
    switch (availability) {
      case 'available': return 'productDetails.inStock';
      case 'limited': return 'productDetails.limitedStock';
      case 'out-of-stock': return 'productDetails.outOfStock';
      default: return '';
    }
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : 0);
  }
} 