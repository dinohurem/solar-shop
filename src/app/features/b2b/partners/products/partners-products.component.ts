import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, combineLatest } from 'rxjs';
import { map, filter, switchMap } from 'rxjs/operators';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { selectCurrentUser } from '../../../../core/auth/store/auth.selectors';
import { User } from '../../../../shared/models/user.model';
import { Company } from '../../../../shared/models/company.model';
import { SupabaseService } from '../../../../services/supabase.service';

interface PartnerProduct {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  sku: string;
  retailPrice: number;
  partnerPrice?: number;
  companyPrice?: number; // Specific price for the authenticated company
  savings?: number;
  minimumOrder: number;
  inStock: boolean;
  partnerOnly: boolean;
  hasPendingPrice?: boolean; // Flag for products without company-specific pricing
}

@Component({
  selector: 'app-partners-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 class="text-3xl font-bold text-gray-900 font-['Poppins']">
            {{ 'b2b.products.title' | translate }}
          </h1>
          <p class="mt-2 text-lg text-gray-600 font-['DM_Sans']">
            {{ 'b2b.products.subtitle' | translate }}
          </p>
          <div *ngIf="company" class="mt-3 flex items-center space-x-2">
            <span class="text-sm font-medium text-gray-600">{{ 'b2b.products.companyAccount' | translate }}:</span>
            <span class="text-sm font-bold text-solar-600">{{ company.companyName }}</span>
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  [class]="getStatusClass(company.status)">
              {{ getStatusLabel(company.status) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Login Required Banner (for non-authenticated users) -->
      <div *ngIf="!isAuthenticated" class="bg-solar-50 border-b border-solar-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <svg class="w-6 h-6 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              <div>
                <p class="text-sm font-medium text-solar-800">
                  {{ 'b2b.products.loginRequired' | translate }}
                </p>
              </div>
            </div>
            <button (click)="navigateToLogin()" 
                    class="bg-solar-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-solar-700 transition-colors">
              {{ 'b2b.products.loginToViewPrices' | translate }}
            </button>
          </div>
        </div>
      </div>

      <!-- Company Not Approved Banner -->
      <div *ngIf="isAuthenticated && !isCompanyContact" class="bg-yellow-50 border-b border-yellow-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
              <div>
                <p class="text-sm font-medium text-yellow-800">
                  {{ 'b2b.products.companyNotApproved' | translate }}
                </p>
                <p class="text-sm text-yellow-700">
                  {{ 'b2b.products.companyNotApprovedMessage' | translate }}
                </p>
              </div>
            </div>
            <button (click)="navigateToRegister()" 
                    class="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors">
              {{ 'b2b.products.applyForPartnership' | translate }}
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col lg:flex-row gap-6">
          <!-- Left Sidebar - Filters -->
          <div class="w-full lg:w-1/4 space-y-6">
            <!-- Mobile Filter Toggle -->
            <div class="lg:hidden">
              <button (click)="toggleMobileFilters()" 
                      class="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                <span>Filters</span>
                <svg class="w-5 h-5 transform transition-transform" [class.rotate-180]="showMobileFilters" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
            </div>

            <!-- Filter Panel -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6" 
                 [class.hidden]="!showMobileFilters" 
                 [class.lg:block]="true">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Filter Products</h3>
              
              <div class="space-y-6">
                <!-- Category Filter -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">Category</label>
                  <select [(ngModel)]="selectedCategory" (ngModelChange)="filterProducts()" 
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500">
                    <option value="">All Categories</option>
                    <option value="solar-panels">Solar Panels</option>
                    <option value="inverters">Inverters</option>
                    <option value="batteries">Batteries</option>
                    <option value="mounting">Mounting Systems</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>

                <!-- Search -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">Search</label>
                  <input [(ngModel)]="searchTerm" (ngModelChange)="filterProducts()" 
                         type="text" placeholder="Search products..." 
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500">
                </div>

                <!-- Availability Filter -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">Availability</label>
                  <select [(ngModel)]="availabilityFilter" (ngModelChange)="filterProducts()" 
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500">
                    <option value="">All Products</option>
                    <option value="in-stock">In Stock</option>
                    <option value="partner-only">{{ 'b2b.products.availableForPartners' | translate }}</option>
                  </select>
                </div>

                <!-- Sort -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">Sort By</label>
                  <select [(ngModel)]="sortBy" (ngModelChange)="sortProducts()" 
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500">
                    <option value="name">Name</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="savings">Best Savings</option>
                  </select>
                </div>

                <!-- Clear Filters -->
                <div class="pt-4 border-t border-gray-200">
                  <button (click)="clearFilters()" 
                          class="w-full px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Content - Products Grid -->
          <div class="flex-1">
            <!-- Results Header -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div class="flex items-center justify-between">
                <p class="text-sm text-gray-600">
                  Showing {{ filteredProducts.length }} of {{ allProducts.length }} products
                </p>
                <div class="flex items-center space-x-2">
                  <span class="text-sm text-gray-500">View:</span>
                  <button (click)="toggleGridView()" 
                          [class.bg-solar-100]="gridView === 'grid'"
                          [class.text-solar-600]="gridView === 'grid'"
                          class="p-2 rounded-md hover:bg-gray-100">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                    </svg>
                  </button>
                  <button (click)="toggleListView()" 
                          [class.bg-solar-100]="gridView === 'list'"
                          [class.text-solar-600]="gridView === 'list'"
                          class="p-2 rounded-md hover:bg-gray-100">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Products Grid -->
            <div [ngClass]="{
              'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6': gridView === 'grid',
              'space-y-4': gridView === 'list'
            }">
              <div *ngFor="let product of filteredProducts" 
                   [ngClass]="{
                     'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow': gridView === 'grid',
                     'bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center space-x-4 hover:shadow-md transition-shadow': gridView === 'list'
                   }">
                
                <!-- Grid View Layout -->
                <ng-container *ngIf="gridView === 'grid'">
                  <!-- Product Image -->
                  <div class="aspect-w-16 aspect-h-12 bg-gray-100">
                    <img [src]="product.imageUrl" [alt]="product.name" 
                         class="w-full h-48 object-cover">
                  </div>

                  <!-- Product Info -->
                  <div class="p-4">
                    <!-- Category & SKU -->
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {{ product.category }}
                      </span>
                      <span class="text-xs text-gray-400">{{ product.sku }}</span>
                    </div>

                    <!-- Product Name -->
                    <h3 class="text-lg font-semibold text-gray-900 mb-2 font-['Poppins'] line-clamp-2">
                      {{ product.name }}
                    </h3>

                    <!-- Description -->
                    <p class="text-sm text-gray-600 mb-4 line-clamp-2 font-['DM_Sans']">
                      {{ product.description }}
                    </p>

                    <!-- Pricing Section -->
                    <div class="mb-4">
                      <div *ngIf="!isAuthenticated" class="text-center py-4 bg-gray-50 rounded-lg">
                        <svg class="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                        </svg>
                        <p class="text-sm text-gray-500 font-medium">
                          {{ 'b2b.products.loginToViewPrices' | translate }}
                        </p>
                      </div>

                      <div *ngIf="isAuthenticated" class="space-y-2">
                        <!-- Company Specific Price -->
                        <div *ngIf="product.companyPrice && isCompanyContact" class="flex items-center justify-between">
                          <span class="text-sm font-medium text-green-700">{{ 'b2b.products.yourPrice' | translate }}:</span>
                          <span class="text-lg font-bold text-green-600">€{{ product.companyPrice | number:'1.2-2' }}</span>
                        </div>

                        <!-- Partner Price -->
                        <div *ngIf="product.partnerPrice && (!product.companyPrice || !isCompanyContact)" class="flex items-center justify-between">
                          <span class="text-sm font-medium text-solar-700">{{ 'b2b.products.partnerPrice' | translate }}:</span>
                          <span class="text-lg font-bold text-solar-600">€{{ product.partnerPrice | number:'1.2-2' }}</span>
                        </div>

                        <!-- Pending Price Label -->
                        <div *ngIf="isCompanyContact && product.hasPendingPrice" class="text-center py-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div class="flex items-center justify-center space-x-2">
                            <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <span class="text-sm font-medium text-yellow-800">{{ 'b2b.products.pendingPrice' | translate }}</span>
                          </div>
                          <p class="text-xs text-yellow-600 mt-1">{{ 'b2b.products.pendingPriceMessage' | translate }}</p>
                        </div>

                        <!-- Retail Price -->
                        <div class="flex items-center justify-between">
                          <span class="text-sm text-gray-500">{{ 'b2b.products.retailPrice' | translate }}:</span>
                          <span class="text-sm text-gray-500 line-through">€{{ product.retailPrice | number:'1.2-2' }}</span>
                        </div>

                        <!-- Savings -->
                        <div *ngIf="product.savings" class="flex items-center justify-between">
                          <span class="text-sm font-medium text-green-700">{{ 'b2b.products.savings' | translate }}:</span>
                          <span class="text-sm font-bold text-green-600">€{{ product.savings | number:'1.2-2' }}</span>
                        </div>

                        <!-- Contact for Pricing -->
                        <div *ngIf="!product.partnerPrice && !product.companyPrice && !product.hasPendingPrice" class="text-center py-2">
                          <p class="text-sm text-gray-600">{{ 'b2b.products.contactForPricing' | translate }}</p>
                        </div>
                      </div>
                    </div>

                    <!-- Minimum Order -->
                    <div class="mb-4">
                      <div class="flex items-center justify-between text-sm">
                        <span class="text-gray-600">{{ 'b2b.products.minimumOrder' | translate }}:</span>
                        <span class="font-medium">{{ product.minimumOrder }} {{ 'b2b.products.pieces' | translate }}</span>
                      </div>
                    </div>

                    <!-- Status Badges -->
                    <div class="flex items-center justify-between mb-4">
                      <div class="flex space-x-2 flex-wrap">
                        <span *ngIf="product.inStock" 
                              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          In Stock
                        </span>
                        <span *ngIf="!product.inStock" 
                              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Out of Stock
                        </span>
                        <span *ngIf="product.partnerOnly" 
                              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-solar-100 text-solar-800">
                          {{ 'b2b.products.partnerOnly' | translate }}
                        </span>
                        <span *ngIf="product.hasPendingPrice && isCompanyContact" 
                              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {{ 'b2b.products.pendingPrice' | translate }}
                        </span>
                      </div>
                    </div>

                    <!-- Actions -->
                    <div class="space-y-2">
                      <button *ngIf="isCompanyContact && product.inStock && (product.companyPrice || product.partnerPrice)" 
                              (click)="addToCart(product)"
                              class="w-full bg-solar-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-solar-700 transition-colors">
                        Add to Cart
                      </button>
                      <button *ngIf="isCompanyContact && product.hasPendingPrice" 
                              (click)="requestQuote(product)"
                              class="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors">
                        {{ 'b2b.products.requestQuote' | translate }}
                      </button>
                      <button *ngIf="isCompanyContact && !product.inStock" 
                              (click)="requestQuote(product)"
                              class="w-full bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
                        Request Quote
                      </button>
                      <button *ngIf="!isAuthenticated" 
                              (click)="navigateToLogin()"
                              class="w-full bg-solar-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-solar-700 transition-colors">
                        Sign In to Order
                      </button>
                      <button *ngIf="!isCompanyContact && isAuthenticated" 
                              (click)="navigateToRegister()"
                              class="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors">
                        Apply for Partnership
                      </button>
                      <button (click)="viewDetails(product)" 
                              class="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </ng-container>

                <!-- List View Layout -->
                <ng-container *ngIf="gridView === 'list'">
                  <!-- Product Image -->
                  <img [src]="product.imageUrl" [alt]="product.name" 
                       class="w-24 h-24 object-cover rounded-lg bg-gray-100 flex-shrink-0">
                  
                  <!-- Product Info -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between">
                      <div class="min-w-0 flex-1">
                        <h3 class="text-lg font-semibold text-gray-900 font-['Poppins'] truncate">
                          {{ product.name }}
                        </h3>
                        <p class="text-sm text-gray-600 mt-1 line-clamp-2 font-['DM_Sans']">
                          {{ product.description }}
                        </p>
                        <div class="flex items-center space-x-4 mt-2 flex-wrap">
                          <span class="text-xs font-medium text-gray-500 uppercase">{{ product.category }}</span>
                          <span class="text-xs text-gray-400">{{ product.sku }}</span>
                          <span *ngIf="product.inStock" 
                                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            In Stock
                          </span>
                          <span *ngIf="product.hasPendingPrice && isCompanyContact" 
                                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {{ 'b2b.products.pendingPrice' | translate }}
                          </span>
                        </div>
                      </div>
                      
                      <!-- Pricing and Actions -->
                      <div class="ml-4 flex-shrink-0 text-right">
                        <div *ngIf="isAuthenticated && (product.companyPrice || product.partnerPrice)" class="mb-2">
                          <div *ngIf="product.companyPrice && isCompanyContact" class="text-lg font-bold text-green-600">€{{ product.companyPrice | number:'1.2-2' }}</div>
                          <div *ngIf="product.partnerPrice && (!product.companyPrice || !isCompanyContact)" class="text-lg font-bold text-solar-600">€{{ product.partnerPrice | number:'1.2-2' }}</div>
                          <div class="text-sm text-gray-500 line-through">€{{ product.retailPrice | number:'1.2-2' }}</div>
                        </div>
                        <div *ngIf="isCompanyContact && product.hasPendingPrice" class="mb-2">
                          <div class="text-sm font-medium text-yellow-600">{{ 'b2b.products.pendingPrice' | translate }}</div>
                        </div>
                        <div class="space-x-2">
                          <button (click)="viewDetails(product)" 
                                  class="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50">
                            Details
                          </button>
                          <button *ngIf="isCompanyContact && product.inStock && (product.companyPrice || product.partnerPrice)" 
                                  (click)="addToCart(product)"
                                  class="px-3 py-1 bg-solar-600 text-white rounded text-sm hover:bg-solar-700">
                            Add to Cart
                          </button>
                          <button *ngIf="isCompanyContact && product.hasPendingPrice" 
                                  (click)="requestQuote(product)"
                                  class="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700">
                            {{ 'b2b.products.requestQuote' | translate }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </ng-container>
              </div>
            </div>

            <!-- No Products Found -->
            <div *ngIf="filteredProducts.length === 0" class="text-center py-12">
              <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
              </svg>
              <h3 class="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p class="text-gray-600">Try adjusting your filters or search terms.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PartnersProductsComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private supabaseService = inject(SupabaseService);

  currentUser$: Observable<User | null>;

  isAuthenticated = false;
  isCompanyContact = false;
  company: Company | null = null;

  selectedCategory = '';
  searchTerm = '';
  availabilityFilter = '';
  sortBy = 'name';
  gridView = 'grid';
  showMobileFilters = false;

  allProducts: PartnerProduct[] = [
    {
      id: '1',
      name: 'SolarMax Pro 400W Monocrystalline Panel',
      description: 'High-efficiency monocrystalline solar panel with 21.5% efficiency rating and 25-year warranty.',
      imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&h=500&fit=crop',
      category: 'solar-panels',
      sku: 'SM-400-MONO',
      retailPrice: 299.99,
      partnerPrice: 239.99,
      companyPrice: 220.00, // Company-specific price
      savings: 79.99,
      minimumOrder: 10,
      inStock: true,
      partnerOnly: false
    },
    {
      id: '2',
      name: 'PowerInvert 5000W Hybrid Inverter',
      description: 'Advanced hybrid inverter with battery storage capability and smart grid integration.',
      imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=500&h=500&fit=crop',
      category: 'inverters',
      sku: 'PI-5000-HYB',
      retailPrice: 1899.99,
      partnerPrice: 1519.99,
      savings: 380.00,
      minimumOrder: 1,
      inStock: true,
      partnerOnly: true,
      hasPendingPrice: true // This product has pending company pricing
    },
    {
      id: '3',
      name: 'EnergyStore 10kWh Lithium Battery',
      description: 'High-capacity lithium iron phosphate battery system with 6000+ cycle life.',
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&h=500&fit=crop',
      category: 'batteries',
      sku: 'ES-10KWH-LFP',
      retailPrice: 4999.99,
      companyPrice: 3800.00, // Company gets better pricing than standard partner price
      partnerPrice: 3999.99,
      savings: 1199.99,
      minimumOrder: 1,
      inStock: false,
      partnerOnly: true
    },
    {
      id: '4',
      name: 'SecureMount Roof Mounting System',
      description: 'Universal roof mounting system compatible with most panel types and roof materials.',
      imageUrl: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=500&h=500&fit=crop',
      category: 'mounting',
      sku: 'SM-ROOF-UNI',
      retailPrice: 149.99,
      partnerPrice: 119.99,
      savings: 30.00,
      minimumOrder: 5,
      inStock: true,
      partnerOnly: false,
      hasPendingPrice: true // Pending company-specific pricing
    }
  ];

  filteredProducts: PartnerProduct[] = [];

  constructor() {
    this.currentUser$ = this.store.select(selectCurrentUser);
  }

  ngOnInit(): void {
    this.loadUserAndCompanyInfo();
    this.filteredProducts = [...this.allProducts];
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory = params['category'];
        this.filterProducts();
      }
    });
  }

  private async loadUserAndCompanyInfo(): Promise<void> {
    this.currentUser$.subscribe(async (user) => {
      this.isAuthenticated = !!user;

      if (user) {
        // Check if user is a company contact person
        try {
          const { data: companies, error } = await this.supabaseService.client
            .from('companies')
            .select('*')
            .eq('contact_person_id', user.id)
            .eq('status', 'approved')
            .single();

          if (!error && companies) {
            this.company = companies;
            this.isCompanyContact = true;
          } else {
            this.isCompanyContact = false;
            this.company = null;
          }
        } catch (error) {
          console.error('Error checking company status:', error);
          this.isCompanyContact = false;
        }
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pending Approval';
      case 'approved':
        return 'Approved Partner';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  }

  filterProducts(): void {
    this.filteredProducts = this.allProducts.filter(product => {
      const matchesCategory = !this.selectedCategory || product.category === this.selectedCategory;
      const matchesSearch = !this.searchTerm ||
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesAvailability = !this.availabilityFilter ||
        (this.availabilityFilter === 'in-stock' && product.inStock) ||
        (this.availabilityFilter === 'partner-only' && product.partnerOnly);

      return matchesCategory && matchesSearch && matchesAvailability;
    });

    this.sortProducts();
  }

  sortProducts(): void {
    this.filteredProducts.sort((a, b) => {
      switch (this.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          const priceA = a.companyPrice || a.partnerPrice || a.retailPrice;
          const priceB = b.companyPrice || b.partnerPrice || b.retailPrice;
          return priceA - priceB;
        case 'price-high':
          const priceA2 = a.companyPrice || a.partnerPrice || a.retailPrice;
          const priceB2 = b.companyPrice || b.partnerPrice || b.retailPrice;
          return priceB2 - priceA2;
        case 'savings':
          return (b.savings || 0) - (a.savings || 0);
        default:
          return 0;
      }
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/partners/register']);
  }

  addToCart(product: PartnerProduct): void {
    // TODO: Implement add to cart functionality
    console.log('Adding to cart:', product);
  }

  requestQuote(product: PartnerProduct): void {
    // TODO: Implement quote request functionality
    console.log('Requesting quote for:', product);
  }

  viewDetails(product: PartnerProduct): void {
    // Navigate to product details with company pricing flag
    this.router.navigate(['/products', product.id], {
      queryParams: { companyPricing: true }
    });
  }

  toggleMobileFilters(): void {
    this.showMobileFilters = !this.showMobileFilters;
  }

  toggleGridView(): void {
    this.gridView = this.gridView === 'grid' ? 'list' : 'grid';
  }

  toggleListView(): void {
    this.gridView = 'list';
  }

  clearFilters(): void {
    this.selectedCategory = '';
    this.searchTerm = '';
    this.availabilityFilter = '';
    this.sortBy = 'name';
    this.filterProducts();
  }
} 