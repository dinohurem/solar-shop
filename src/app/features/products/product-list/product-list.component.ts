import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { ProductListActions } from './store/product-list.actions';
import {
  selectProducts,
  selectFilteredProducts,
  selectIsLoading,
  selectFilters,
  selectSortOption,
  selectCategories,
  selectManufacturers,
  selectCertificates
} from './store/product-list.selectors';

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
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 class="text-3xl font-bold text-gray-900 font-['Poppins']">Products</h1>
          <p class="mt-2 text-gray-600 font-['DM_Sans']">Discover our sustainable building solutions</p>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col lg:flex-row gap-8">
          <!-- Filters Sidebar -->
          <div class="lg:w-1/4">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 class="text-lg font-semibold text-gray-900 mb-6 font-['Poppins']">Filters</h3>
              
              <!-- Categories Filter -->
              <div class="mb-6">
                <h4 class="text-sm font-medium text-gray-900 mb-3 font-['DM_Sans']">Categories</h4>
                <div class="space-y-2">
                  <label *ngFor="let category of categories$ | async" class="flex items-center">
                    <input 
                      type="checkbox" 
                      [value]="category"
                      [checked]="(filters$ | async)?.categories?.includes(category) || false"
                      (change)="onCategoryChange(category, $event)"
                      class="rounded border-gray-300 text-[#0ACF83] focus:ring-[#0ACF83]"
                    >
                    <span class="ml-2 text-sm text-gray-700 font-['DM_Sans']">{{ category }}</span>
                  </label>
                </div>
              </div>

              <!-- Price Range Filter -->
              <div class="mb-6">
                <h4 class="text-sm font-medium text-gray-900 mb-3 font-['DM_Sans']">Price Range</h4>
                <div class="space-y-3">
                  <div class="flex items-center space-x-2">
                    <input 
                      type="number" 
                      placeholder="Min"
                      [value]="(filters$ | async)?.priceRange?.min || 0"
                      (input)="onPriceRangeChange('min', $event)"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-[#0ACF83] focus:border-[#0ACF83]"
                    >
                    <span class="text-gray-500">-</span>
                    <input 
                      type="number" 
                      placeholder="Max"
                      [value]="(filters$ | async)?.priceRange?.max || 0"
                      (input)="onPriceRangeChange('max', $event)"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-[#0ACF83] focus:border-[#0ACF83]"
                    >
                  </div>
                </div>
              </div>

              <!-- Certificates Filter -->
              <div class="mb-6">
                <h4 class="text-sm font-medium text-gray-900 mb-3 font-['DM_Sans']">Certificates</h4>
                <div class="space-y-2">
                  <label *ngFor="let certificate of certificates$ | async" class="flex items-center">
                    <input 
                      type="checkbox" 
                      [value]="certificate"
                      [checked]="(filters$ | async)?.certificates?.includes(certificate) || false"
                      (change)="onCertificateChange(certificate, $event)"
                      class="rounded border-gray-300 text-[#0ACF83] focus:ring-[#0ACF83]"
                    >
                    <span class="ml-2 text-sm text-gray-700 font-['DM_Sans']">{{ certificate }}</span>
                  </label>
                </div>
              </div>

              <!-- Manufacturer Filter -->
              <div class="mb-6">
                <h4 class="text-sm font-medium text-gray-900 mb-3 font-['DM_Sans']">Manufacturer</h4>
                <div class="space-y-2">
                  <label *ngFor="let manufacturer of manufacturers$ | async" class="flex items-center">
                    <input 
                      type="checkbox" 
                      [value]="manufacturer"
                      [checked]="(filters$ | async)?.manufacturers?.includes(manufacturer) || false"
                      (change)="onManufacturerChange(manufacturer, $event)"
                      class="rounded border-gray-300 text-[#0ACF83] focus:ring-[#0ACF83]"
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
                Clear All Filters
              </button>
            </div>
          </div>

          <!-- Products Grid -->
          <div class="lg:w-3/4">
            <!-- Sort Options -->
            <div class="flex justify-between items-center mb-6">
              <p class="text-sm text-gray-600 font-['DM_Sans']">
                {{ (filteredProducts$ | async)?.length || 0 }} products found
              </p>
              <div class="flex items-center space-x-2">
                <label class="text-sm font-medium text-gray-700 font-['DM_Sans']">Sort by:</label>
                <select 
                  [value]="sortOption$ | async"
                  (change)="onSortChange($event)"
                  class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-[#0ACF83] focus:border-[#0ACF83] font-['DM_Sans']"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest Arrivals</option>
                  <option value="name-asc">Name A - Z</option>
                  <option value="name-desc">Name Z - A</option>
                  <option value="price-low">Price Low to High</option>
                  <option value="price-high">Price High to Low</option>
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
                    class="absolute top-3 left-3 bg-[#0ACF83] text-white px-2 py-1 rounded-full text-xs font-semibold"
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
                    {{ getAvailabilityText(product.availability) }}
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
                    <span class="text-xs text-gray-500 ml-2 font-['DM_Sans']">({{ product.reviewCount }} reviews)</span>
                  </div>

                  <!-- Price -->
                  <div class="flex items-center justify-between">
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
                    <button 
                      class="px-4 py-2 bg-[#0ACF83] text-white text-sm font-semibold rounded-lg hover:bg-[#09b574] transition-colors font-['DM_Sans']"
                      (click)="addToCart(product, $event)"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Loading State -->
            <div *ngIf="isLoading$ | async" class="flex justify-center items-center py-12">
              <div class="animate-spin rounded-full h-12 w-12 border-4 border-[#0ACF83] border-t-transparent"></div>
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
              <h3 class="text-lg font-medium text-gray-900 mb-2 font-['Poppins']">No products found</h3>
              <p class="text-gray-600 font-['DM_Sans']">Try adjusting your filters to see more results.</p>
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
  private destroy$ = new Subject<void>();

  products$: Observable<Product[]>;
  filteredProducts$: Observable<Product[]>;
  isLoading$: Observable<boolean>;
  filters$: Observable<ProductFilters>;
  sortOption$: Observable<SortOption>;
  categories$: Observable<string[]>;
  manufacturers$: Observable<string[]>;
  certificates$: Observable<string[]>;

  constructor() {
    this.products$ = this.store.select(selectProducts);
    this.filteredProducts$ = this.store.select(selectFilteredProducts);
    this.isLoading$ = this.store.select(selectIsLoading);
    this.filters$ = this.store.select(selectFilters);
    this.sortOption$ = this.store.select(selectSortOption);
    this.categories$ = this.store.select(selectCategories);
    this.manufacturers$ = this.store.select(selectManufacturers);
    this.certificates$ = this.store.select(selectCertificates);
  }

  ngOnInit(): void {
    this.store.dispatch(ProductListActions.loadProducts());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
  }

  addToCart(product: Product, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    // TODO: Implement add to cart functionality
    console.log('Add to cart:', product);
  }

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }

  getAvailabilityText(availability: string): string {
    switch (availability) {
      case 'available': return 'Available';
      case 'limited': return 'Limited';
      case 'out-of-stock': return 'Out of Stock';
      default: return '';
    }
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : 0);
  }
} 