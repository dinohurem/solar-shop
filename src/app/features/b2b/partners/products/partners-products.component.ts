import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, Subject } from 'rxjs';
import { map, filter, switchMap, takeUntil, debounceTime, distinctUntilChanged, take, skip } from 'rxjs/operators';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../shared/services/translation.service';
import { selectCurrentUser } from '../../../../core/auth/store/auth.selectors';
import { User } from '../../../../shared/models/user.model';
import { Company } from '../../../../shared/models/company.model';
import { SupabaseService } from '../../../../services/supabase.service';
import * as B2BCartActions from '../../cart/store/b2b-cart.actions';
import { selectB2BCartTotalItems } from '../../cart/store/b2b-cart.selectors';
import * as ProductsActions from '../../shared/store/products.actions';
import { selectProductsWithPricing, selectProductsLoading, selectCategories, selectCategoriesLoading, selectFilteredProducts, selectFilters, selectPaginatedProducts, selectPaginationInfo, selectCurrentPage, selectItemsPerPage, selectTotalPages, selectAllManufacturers, selectCategoryCounts, selectManufacturersLoading, selectCategoryCountsLoading, selectManufacturerCounts, selectManufacturerCountsLoading } from '../../shared/store/products.selectors';
import { ProductWithPricing, Category } from '../../shared/store/products.actions';
import { ProductCategory, CategoriesService } from '../../../b2c/products/services/categories.service';
import { B2BProductsUrlStateService, B2BProductListUrlState } from './services/b2b-products-url-state.service';

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
      <div *ngIf="isAuthenticated && !isCompanyContact" class="bg-accent-50 border-b border-accent-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <svg class="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
              <div>
                <p class="text-sm font-medium text-accent-800">
                  {{ 'b2b.products.companyNotApproved' | translate }}
                </p>
                <p class="text-sm text-accent-700">
                  {{ 'b2b.products.companyNotApprovedMessage' | translate }}
                </p>
              </div>
            </div>
            <button (click)="navigateToRegister()" 
                    class="bg-accent-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-700 transition-colors">
              {{ 'b2b.products.applyForPartnership' | translate }}
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading$ | async" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-solar-600"></div>
      </div>

      <!-- Main Content Area -->
      <div *ngIf="!(loading$ | async)" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col lg:flex-row gap-8">
          
          <!-- Filters Sidebar (Left) -->
          <div class="lg:w-1/4">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 class="text-lg font-semibold text-gray-900 mb-6 font-['Poppins']">{{ 'b2b.products.filters' | translate }}</h3>
              
              <!-- Search Bar -->
              <div class="mb-6">
                <h4 class="text-sm font-medium text-gray-900 mb-3 font-['DM_Sans']">{{ 'b2b.products.search' | translate }}</h4>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                  </div>
                  <input type="text" 
                         [value]="(filters$ | async)?.searchQuery || ''"
                         (input)="onSearchChange($event)"
                         [placeholder]="'b2b.products.searchProducts' | translate"
                         class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-solar-500 text-sm font-['DM_Sans']">
                </div>
              </div>

              <!-- Categories Filter -->
              <div class="mb-6">
                <h4 class="text-sm font-medium text-gray-900 mb-3 font-['DM_Sans']">{{ 'b2b.products.category' | translate }}</h4>
                <div class="space-y-1">
                  <!-- Hierarchical Category List -->
                  <div *ngFor="let parentCategory of nestedCategories">
                    <!-- Parent Category -->
                    <div class="flex items-center justify-between py-1">
                      <label class="flex items-center flex-1 cursor-pointer">
                        <input 
                          type="checkbox" 
                          [value]="parentCategory.name"
                          [checked]="isParentCategorySelected(parentCategory)"
                          (change)="onParentCategoryChange(parentCategory, $event)"
                          class="rounded border-gray-300 text-solar-600 focus:ring-solar-500"
                        >
                        <span class="ml-2 text-sm text-gray-900 font-['DM_Sans'] font-semibold">
                          {{ parentCategory.name }}
                        </span>
                        <span class="ml-2 text-xs text-gray-500">
                          ({{ (categoryCounts$ | async)?.[parentCategory.name] || 0 }})
                        </span>
                      </label>
                      <!-- Collapse/Expand Button -->
                      <button
                        *ngIf="parentCategory.subcategories && parentCategory.subcategories.length > 0"
                        type="button"
                        (click)="toggleCategoryExpansion(parentCategory.id)"
                        class="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        [title]="isCategoryExpanded(parentCategory.id) ? 'Collapse subcategories' : 'Expand subcategories'"
                      >
                        <svg class="w-4 h-4 transform transition-transform duration-200"
                             [class.rotate-180]="isCategoryExpanded(parentCategory.id)"
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                      </button>
                    </div>
                    
                    <!-- Subcategories (Collapsible, indented) -->
                    <div 
                      *ngIf="parentCategory.subcategories && parentCategory.subcategories.length > 0 && isCategoryExpanded(parentCategory.id)"
                      class="ml-4 space-y-1 border-l-2 border-gray-100 pl-3 mt-1 animate-fade-in"
                    >
                      <label *ngFor="let subCategory of parentCategory.subcategories" 
                             class="flex items-center cursor-pointer py-1 hover:bg-gray-50 px-2 rounded transition-colors">
                        <input 
                          type="checkbox" 
                          [value]="subCategory.name"
                          [checked]="(filters$ | async)?.categories?.includes(subCategory.name) || false"
                          (change)="onSubCategoryChange(parentCategory, subCategory.name, $event)"
                          class="rounded border-gray-300 text-solar-600 focus:ring-solar-500"
                        >
                        <span class="ml-2 text-sm text-gray-700 font-['DM_Sans']">
                          {{ subCategory.name }}
                        </span>
                        <span class="ml-2 text-xs text-gray-500">
                          ({{ (categoryCounts$ | async)?.[subCategory.name] || 0 }})
                        </span>
                      </label>
                    </div>
                  </div>
                  
                  <!-- Fallback for flat categories -->
                  <div *ngIf="nestedCategories.length === 0">
                    <label *ngFor="let category of categories$ | async" class="flex items-center py-1 cursor-pointer">
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
              </div>

              <!-- Manufacturers Filter -->
              <div class="mb-6">
                <h4 class="text-sm font-medium text-gray-900 mb-3 font-['DM_Sans']">
                  {{ 'b2b.products.manufacturer' | translate }}
                  <span *ngIf="manufacturersLoading$ | async" class="ml-2 text-xs text-gray-500">Loading...</span>
                </h4>
                <div class="space-y-1 max-h-48 overflow-y-auto">
                  <label *ngFor="let manufacturer of allManufacturers$ | async" class="flex items-center py-1 cursor-pointer">
                    <input 
                      type="checkbox" 
                      [value]="manufacturer"
                      [checked]="isManufacturerSelected(manufacturer)"
                      (change)="onManufacturerChange(manufacturer, $event)"
                      class="rounded border-gray-300 text-solar-600 focus:ring-solar-500"
                    >
                    <span class="ml-2 text-sm text-gray-700 font-['DM_Sans']">{{ manufacturer }}</span>
                    <span class="ml-2 text-xs text-gray-500">
                      ({{ (manufacturerCounts$ | async)?.[manufacturer] || 0 }})
                    </span>
                  </label>
                </div>
              </div>

              <!-- Availability Filter -->
              <div class="mb-6">
                <h4 class="text-sm font-medium text-gray-900 mb-3 font-['DM_Sans']">{{ 'b2b.products.availability' | translate }}</h4>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input type="radio" 
                           name="availability"
                           value=""
                           [checked]="(filters$ | async)?.availability === ''"
                           (change)="onAvailabilityChange('')"
                           class="rounded border-gray-300 text-gray-600 focus:ring-gray-500">
                    <span class="ml-2 text-sm text-gray-700 font-['DM_Sans']">{{ 'b2b.products.allProducts' | translate }}</span>
                  </label>
                  <label class="flex items-center">
                    <input type="radio" 
                           name="availability"
                           value="in-stock"
                           [checked]="(filters$ | async)?.availability === 'in-stock'"
                           (change)="onAvailabilityChange('in-stock')"
                           class="rounded border-gray-300 text-green-600 focus:ring-green-500">
                    <span class="ml-2 text-sm text-gray-700 font-['DM_Sans']">{{ 'b2b.products.inStock' | translate }}</span>
                  </label>
                  <label class="flex items-center">
                    <input type="radio" 
                           name="availability"
                           value="partner-only"
                           [checked]="(filters$ | async)?.availability === 'partner-only'"
                           (change)="onAvailabilityChange('partner-only')"
                           class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                    <span class="ml-2 text-sm text-gray-700 font-['DM_Sans']">{{ 'b2b.products.partnerOnly' | translate }}</span>
                  </label>
                </div>
              </div>
              
              <!-- Clear Filters -->
              <button (click)="clearFilters()" 
                      class="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors font-['DM_Sans']">
                {{ 'b2b.products.clearAllFilters' | translate }}
              </button>
            </div>
          </div>

          <!-- Products Grid (Right) -->
          <div class="lg:w-3/4">
            <!-- Results Header with Layout and Sort Controls -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <!-- Left: View Layout Controls -->
                <div class="flex items-center space-x-4">
                  <div class="flex items-center space-x-2">
                    <span class="text-sm font-medium text-gray-700 font-['DM_Sans']">{{ 'b2b.products.view' | translate }}:</span>
                    <button (click)="toggleGridView()" 
                            [class.bg-solar-600]="gridView === 'grid'"
                            [class.text-white]="gridView === 'grid'"
                            [class.bg-gray-100]="gridView !== 'grid'"
                            [class.text-gray-600]="gridView !== 'grid'"
                            class="p-2 rounded-md hover:bg-solar-600 hover:text-white transition-colors" 
                            [title]="'b2b.products.gridView' | translate">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                      </svg>
                    </button>
                    <button (click)="toggleListView()" 
                            [class.bg-solar-600]="gridView === 'list'"
                            [class.text-white]="gridView === 'list'"
                            [class.bg-gray-100]="gridView !== 'list'"
                            [class.text-gray-600]="gridView !== 'list'"
                            class="p-2 rounded-md hover:bg-solar-600 hover:text-white transition-colors"
                            [title]="'b2b.products.listView' | translate">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                      </svg>
                    </button>
                  </div>
                  
                  <!-- Results Count -->
                  <p class="text-sm text-gray-600 font-['DM_Sans']">
                    {{ 'b2b.products.showing' | translate }} {{ (paginationInfo$ | async)?.totalItems || 0 }} {{ 'b2b.products.productsCount' | translate }}
                  </p>
                </div>

                <!-- Right: Items Per Page & Sort Controls -->
                <div class="flex items-center space-x-4">
                  <!-- Items Per Page -->
                  <div class="flex items-center space-x-2">
                    <label class="text-sm font-medium text-gray-700 whitespace-nowrap font-['DM_Sans']">{{ 'productList.itemsPerPage' | translate }}:</label>
                    <select [value]="itemsPerPage$ | async" (change)="onItemsPerPageChange($event)" 
                            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-solar-500 text-sm font-medium font-['DM_Sans']">
                      <option *ngFor="let option of itemsPerPageOptions" [value]="option">{{ option }}</option>
                    </select>
                  </div>
                  
                  <!-- Sort Controls -->
                  <div class="flex items-center space-x-2">
                    <label class="text-sm font-medium text-gray-700 whitespace-nowrap font-['DM_Sans']">{{ 'b2b.products.sortBy' | translate }}:</label>
                    <select [value]="(filters$ | async)?.sortBy || 'name'" (change)="onSortChange($event)" 
                            class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-solar-500 text-sm font-medium font-['DM_Sans']">
                      <option value="name">{{ 'b2b.products.name' | translate }}</option>
                      <option value="price-low">{{ 'b2b.products.priceLowToHigh' | translate }}</option>
                      <option value="price-high">{{ 'b2b.products.priceHighToLow' | translate }}</option>
                      <option value="savings">{{ 'b2b.products.bestSavings' | translate }}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- Products Grid/List -->
            <div class="space-y-6">
              <!-- Products Grid -->
              <div [ngClass]="{
                'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6': gridView === 'grid',
                'space-y-4': gridView === 'list'
              }">
                <div *ngFor="let product of paginatedProducts$ | async" 
                     [ngClass]="{
                       'bg-white rounded-lg shadow-sm border-2 border-orange-200 hover:border-orange-300 overflow-hidden hover:shadow-md transition-all flex flex-col h-full': gridView === 'grid',
                       'bg-white rounded-lg shadow-sm border border-orange-200 hover:border-orange-300 p-4 flex items-center space-x-4 hover:shadow-md transition-all': gridView === 'list'
                     }"
                     (click)="viewDetails(product)"
                     class="cursor-pointer">
                  
                  <!-- Grid View Layout -->
                  <ng-container *ngIf="gridView === 'grid'">
                    <!-- Product Image -->
                    <div class="w-full h-48 bg-gray-50 relative overflow-hidden flex items-center justify-center border-b border-gray-100">
                      <img [src]="getProductImageUrl(product)" 
                           [alt]="product.name" 
                           class="w-full h-full object-contain"
                           (error)="onImageError($event)"
                           loading="lazy">
                    </div>

                    <!-- Product Info -->
                    <div class="p-4 flex-1 flex flex-col min-h-0">
                      <!-- Category & SKU -->
                      <div class="flex items-center justify-between mb-2 h-[20px]">
                        <span class="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">
                          {{ product.category }}
                        </span>
                        <span class="text-xs text-gray-400 ml-2 flex-shrink-0">{{ product.sku }}</span>
                      </div>

                      <!-- Product Name -->
                      <h3 class="text-lg font-semibold text-gray-900 mb-2 font-['Poppins'] h-[3.5rem] overflow-hidden">
                        <span class="line-clamp-2">{{ product.name }}</span>
                      </h3>

                      <!-- Description -->
                      <p class="text-sm text-gray-600 mb-3 font-['DM_Sans'] h-[4.5rem] overflow-hidden">
                        <span class="line-clamp-3">{{ product.description }}</span>
                      </p>

                      <!-- Pricing Section -->
                      <div class="mb-3 h-[100px] flex flex-col justify-center">
                        <div *ngIf="!isAuthenticated" class="text-center py-2 bg-gray-50 rounded-lg">
                          <svg class="w-6 h-6 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                          </svg>
                          <p class="text-xs text-gray-500 font-medium">
                            {{ 'b2b.products.loginToViewPrices' | translate }}
                          </p>
                        </div>

                        <div *ngIf="isAuthenticated" class="space-y-1">
                          <!-- Company Specific Price -->
                          <div *ngIf="product.company_price && isCompanyContact" class="flex items-center justify-between">
                            <span class="text-xs font-medium text-green-700">{{ 'b2b.products.yourPrice' | translate }}:</span>
                            <span class="text-sm font-bold text-green-600">€{{ product.company_price | number:'1.2-2':'de' }}</span>
                          </div>

                          <!-- Partner Price -->
                          <div *ngIf="product.partner_price && (!product.company_price || !isCompanyContact)" class="flex items-center justify-between">
                            <span class="text-xs font-medium text-solar-700">{{ 'b2b.products.partnerPrice' | translate }}:</span>
                            <span class="text-sm font-bold text-solar-600">€{{ product.partner_price | number:'1.2-2':'de' }}</span>
                          </div>

                          <!-- Retail Price -->
                          <div class="flex items-center justify-between">
                            <span class="text-xs text-gray-500">{{ 'b2b.products.retailPrice' | translate }}:</span>
                            <span class="text-xs text-gray-500 line-through">€{{ product.price | number:'1.2-2':'de' }}</span>
                          </div>

                          <!-- Savings -->
                          <div *ngIf="product.savings" class="flex items-center justify-between">
                            <span class="text-xs font-medium text-green-700">{{ 'b2b.products.savings' | translate }}:</span>
                            <span class="text-xs font-bold text-green-600">€{{ product.savings | number:'1.2-2':'de' }}</span>
                          </div>
                        </div>
                      </div>

                      <!-- Minimum Order -->
                      <div class="mb-2 h-[20px] flex items-center">
                        <div class="flex items-center justify-between text-xs w-full">
                          <span class="text-gray-600">{{ 'b2b.products.minimumOrder' | translate }}:</span>
                          <span class="font-medium">{{ getMinimumOrder(product) }} {{ 'b2b.products.pieces' | translate }}</span>
                        </div>
                      </div>

                      <!-- Status Badges -->
                      <div class="flex items-center justify-between mb-3 h-[32px]">
                        <div class="flex space-x-1 flex-wrap">
                          <span *ngIf="product.in_stock" 
                                class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {{ 'b2b.products.inStock' | translate }}
                          </span>
                          <span *ngIf="!product.in_stock" 
                                class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {{ 'b2b.products.outOfStock' | translate }}
                          </span>
                          <span *ngIf="product.partner_only" 
                                class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-solar-100 text-solar-800">
                            {{ 'b2b.products.partnerOnly' | translate }}
                          </span>
                        </div>
                      </div>

                      <!-- Actions - Always at bottom with fixed height -->
                      <div class="mt-auto space-y-2 h-[100px] flex flex-col justify-end">
                        <!-- Add to Cart Button - only show if has B2B price and in stock -->
                        <button *ngIf="isCompanyContact && product.in_stock && hasB2BPrice(product)" 
                                (click)="addToCart(product, $event)"
                                class="w-full bg-solar-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-solar-700 transition-colors">
                          {{ 'b2b.products.addToCart' | translate }}
                        </button>
                        
                        <!-- Request Quote Button - only show if no B2B price OR out of stock -->
                        <button *ngIf="isCompanyContact && (!hasB2BPrice(product) || !product.in_stock)" 
                                (click)="requestQuote(product, $event)"
                                class="w-full bg-accent-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-accent-700 transition-colors">
                          {{ 'b2b.products.requestQuote' | translate }}
                        </button>
                        
                        <!-- Sign In Button -->
                        <button *ngIf="!isAuthenticated" 
                                (click)="navigateToLogin()"
                                class="w-full bg-solar-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-solar-700 transition-colors">
                          {{ 'b2b.products.signInToOrder' | translate }}
                        </button>
                        
                        <!-- Apply for Partnership Button -->
                        <button *ngIf="!isCompanyContact && isAuthenticated" 
                                (click)="navigateToRegister()"
                                class="w-full bg-accent-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-accent-700 transition-colors">
                          {{ 'b2b.products.applyForPartnership' | translate }}
                        </button>
                        
                        <!-- View Details Button -->
                        <button (click)="viewDetails(product, $event)" 
                                class="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                          {{ 'b2b.products.viewDetails' | translate }}
                        </button>
                      </div>
                    </div>
                  </ng-container>

                  <!-- List View Layout -->
                  <ng-container *ngIf="gridView === 'list'">
                    <!-- Product Image -->
                    <div class="w-24 h-24 bg-gray-50 rounded-lg flex-shrink-0 flex items-center justify-center border border-gray-200">
                      <img [src]="getProductImageUrl(product)" 
                           [alt]="product.name" 
                           class="w-full h-full object-contain rounded-lg"
                           (error)="onImageError($event)"
                           loading="lazy">
                    </div>
                    
                    <!-- Product Info -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-start justify-between">
                        <div class="min-w-0 flex-1">
                          <h3 class="text-lg font-semibold text-gray-900 font-['Poppins'] overflow-hidden">
                            <span class="line-clamp-1">{{ product.name }}</span>
                          </h3>
                          <p class="text-sm text-gray-600 mt-1 font-['DM_Sans'] overflow-hidden">
                            <span class="line-clamp-2">{{ product.description }}</span>
                          </p>
                          <div class="flex items-center space-x-4 mt-2 flex-wrap">
                            <span class="text-xs font-medium text-gray-500 uppercase">{{ product.category }}</span>
                            <span class="text-xs text-gray-400">{{ product.sku }}</span>
                            <span *ngIf="product.in_stock" 
                                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {{ 'b2b.products.inStock' | translate }}
                            </span>
                          </div>
                        </div>
                        
                        <!-- Pricing and Actions -->
                        <div class="ml-4 flex-shrink-0 text-right">
                          <div *ngIf="isAuthenticated && hasB2BPrice(product)" class="mb-2">
                            <div *ngIf="product.company_price && isCompanyContact" class="text-lg font-bold text-green-600">€{{ product.company_price | number:'1.2-2':'de' }}</div>
                            <div *ngIf="product.partner_price && (!product.company_price || !isCompanyContact)" class="text-lg font-bold text-solar-600">€{{ product.partner_price | number:'1.2-2':'de' }}</div>
                            <div class="text-sm text-gray-500 line-through">€{{ product.price | number:'1.2-2':'de' }}</div>
                          </div>
                          <div class="space-x-2">
                            <button (click)="viewDetails(product)" 
                                    class="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50">
                              {{ 'b2b.products.viewDetails' | translate }}
                            </button>
                            <button *ngIf="isCompanyContact && product.in_stock && hasB2BPrice(product)" 
                                    (click)="addToCart(product)"
                                    class="px-3 py-1 bg-solar-600 text-white rounded text-sm hover:bg-solar-700">
                              {{ 'b2b.products.addToCart' | translate }}
                            </button>
                            <button *ngIf="isCompanyContact && (!hasB2BPrice(product) || !product.in_stock)" 
                                    (click)="requestQuote(product)"
                                    class="px-3 py-1 bg-accent-600 text-white rounded text-sm hover:bg-accent-700">
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
              <div *ngIf="(paginatedProducts$ | async)?.length === 0 && (paginationInfo$ | async)?.totalItems === 0" class="text-center py-12">
                <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                </svg>
                <h3 class="text-lg font-medium text-gray-900 mb-2">{{ 'b2b.products.noProductsFound' | translate }}</h3>
                <p class="text-gray-600">{{ 'b2b.products.tryAdjustingFilters' | translate }}</p>
              </div>

              <!-- Pagination Controls -->
              <div *ngIf="(totalPages$ | async) && (totalPages$ | async)! > 1" class="mt-8">
                <!-- Pagination Info -->
                <div class="text-center mb-4" *ngIf="paginationInfo$ | async as paginationInfo">
                  <p class="text-sm text-gray-600 font-['DM_Sans']">
                    {{ 'b2b.products.showing' | translate }} {{ paginationInfo.startIndex }} - {{ paginationInfo.endIndex }} {{ 'b2b.products.of' | translate }} {{ paginationInfo.totalItems }} {{ 'b2b.products.productsCount' | translate }}
                  </p>
                </div>

                <!-- Pagination Navigation -->
                <div class="flex justify-center">
                  <nav class="flex items-center space-x-1">
                    <!-- First Page Button -->
                    <button 
                      (click)="onPageChange(1)"
                      [disabled]="(currentPage$ | async) === 1"
                      class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-['DM_Sans']">
                      ««
                    </button>
                    
                    <!-- Previous Button -->
                    <button 
                      (click)="onPreviousPage()"
                      [disabled]="(currentPage$ | async) === 1"
                      class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-['DM_Sans']">
                      «
                    </button>
                    
                    <!-- Page Numbers with Smart Display -->
                    <ng-container *ngIf="getSmartPageNumbers() | async as pageInfo">
                      <!-- First page if not in visible range -->
                      <ng-container *ngIf="pageInfo.showFirstPage">
                        <button
                          (click)="onPageChange(1)"
                          class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                          1
                        </button>
                        <span *ngIf="pageInfo.showFirstEllipsis" class="px-2 py-2 text-sm text-gray-500">...</span>
                      </ng-container>
                      
                      <!-- Visible page numbers -->
                      <button
                        *ngFor="let page of pageInfo.visiblePages"
                        (click)="onPageChange(page)"
                        class="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        [class.font-bold]="page === (currentPage$ | async)"
                        [class.font-medium]="page !== (currentPage$ | async)"
                        [class.text-gray-900]="page === (currentPage$ | async)"
                        [class.text-gray-700]="page !== (currentPage$ | async)">
                        {{ page }}
                      </button>
                      
                      <!-- Last page if not in visible range -->
                      <ng-container *ngIf="pageInfo.showLastPage">
                        <span *ngIf="pageInfo.showLastEllipsis" class="px-2 py-2 text-sm text-gray-500">...</span>
                        <button
                          (click)="onPageChange(pageInfo.totalPages)"
                          class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                          {{ pageInfo.totalPages }}
                        </button>
                      </ng-container>
                    </ng-container>
                    
                    <!-- Next Button -->
                    <button 
                      (click)="onNextPage()"
                      [disabled]="(currentPage$ | async) === (totalPages$ | async)"
                      class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-['DM_Sans']">
                      »
                    </button>
                    
                    <!-- Last Page Button -->
                    <button 
                      (click)="onLastPage()"
                      [disabled]="(currentPage$ | async) === (totalPages$ | async)"
                      class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-['DM_Sans']">
                      »»
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-1 {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .animate-fade-in {
      animation: fadeIn 0.2s ease-in-out;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .rotate-180 {
      transform: rotate(180deg);
    }
  `]
})
export class PartnersProductsComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private supabaseService = inject(SupabaseService);
  private translateService = inject(TranslationService);
  private destroy$ = new Subject<void>();

  currentUser$: Observable<User | null>;
  cartItemsCount$: Observable<number>;
  products$: Observable<ProductWithPricing[]>;
  filteredProducts$: Observable<ProductWithPricing[]>;
  paginatedProducts$: Observable<ProductWithPricing[]>;
  categories$: Observable<Category[]>;
  loading$: Observable<boolean>;
  categoriesLoading$: Observable<boolean>;
  filters$: Observable<any>;

  // Pagination observables
  paginationInfo$: Observable<any>;
  currentPage$: Observable<number>;
  itemsPerPage$: Observable<number>;
  totalPages$: Observable<number>;
  itemsPerPageOptions = [12, 30, 60];

  // Dynamic filter observables
  allManufacturers$: Observable<string[]>;
  categoryCounts$: Observable<{ [categoryName: string]: number }>;
  manufacturersLoading$: Observable<boolean>;
  categoryCountsLoading$: Observable<boolean>;
  manufacturerCounts$: Observable<{ [manufacturerName: string]: number }>;
  manufacturerCountsLoading$: Observable<boolean>;

  isAuthenticated = false;
  isCompanyContact = false;
  company: Company | null = null;

  gridView = 'grid';
  showMobileFilters = false;

  // Category expansion state
  categoryExpansionState: { [categoryId: string]: boolean } = {};
  nestedCategories: ProductCategory[] = [];
  searchQuery: string = '';

  private searchSubject = new Subject<string>();

  constructor(
    private categoriesService: CategoriesService,
    private urlStateService: B2BProductsUrlStateService
  ) {
    this.currentUser$ = this.store.select(selectCurrentUser);
    this.cartItemsCount$ = this.store.select(selectB2BCartTotalItems);
    this.products$ = this.store.select(selectProductsWithPricing);
    this.filteredProducts$ = this.store.select(selectFilteredProducts);
    this.paginatedProducts$ = this.store.select(selectPaginatedProducts);
    this.categories$ = this.store.select(selectCategories);
    this.loading$ = this.store.select(selectProductsLoading);
    this.categoriesLoading$ = this.store.select(selectCategoriesLoading);
    this.filters$ = this.store.select(selectFilters);

    // Initialize pagination observables
    this.paginationInfo$ = this.store.select(selectPaginationInfo);
    this.currentPage$ = this.store.select(selectCurrentPage);
    this.itemsPerPage$ = this.store.select(selectItemsPerPage);
    this.totalPages$ = this.store.select(selectTotalPages);

    // Dynamic filter observables
    this.allManufacturers$ = this.store.select(selectAllManufacturers);
    this.categoryCounts$ = this.store.select(selectCategoryCounts);
    this.manufacturersLoading$ = this.store.select(selectManufacturersLoading);
    this.categoryCountsLoading$ = this.store.select(selectCategoryCountsLoading);
    this.manufacturerCounts$ = this.store.select(selectManufacturerCounts);
    this.manufacturerCountsLoading$ = this.store.select(selectManufacturerCountsLoading);
  }

  ngOnInit(): void {
    // Load categories first
    this.store.dispatch(ProductsActions.loadCategories());
    
    // Load all manufacturers and initial counts
    this.store.dispatch(ProductsActions.loadAllManufacturers());
    this.store.dispatch(ProductsActions.loadCategoryCounts({ filters: {} }));
    this.store.dispatch(ProductsActions.loadManufacturerCounts({ filters: {} }));
    
    // Load nested categories for hierarchical display
    this.loadNestedCategories();

    // Subscribe to user changes
    this.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(async (user) => {
      this.isAuthenticated = !!user;

      if (user) {
        await this.loadUserAndCompanyInfo(user);

        // Load company pricing if user is company contact
        if (this.isCompanyContact && this.company) {
          this.store.dispatch(ProductsActions.loadCompanyPricing({ companyId: this.company.id }));
        }
      }
    });

    // Handle debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.store.dispatch(ProductsActions.setSearchQuery({ query }));
    });

    // Handle URL state restoration FIRST (before loading products)
    this.activatedRoute.queryParams.pipe(
      take(1), // Only take the initial params to avoid loops
      takeUntil(this.destroy$)
    ).subscribe(params => {
      // Restore state from URL parameters
      const urlState = this.urlStateService.deserializeFromQueryParams(params);
      
      if (Object.keys(urlState).length > 0) {
        console.log('🔄 B2B Restoring state from URL:', urlState);
        
        // Clear existing filters first
        this.store.dispatch(ProductsActions.clearFilters());
        
        // Restore filters
        if (urlState.filters) {
          // Apply search query
          if (urlState.filters.searchQuery) {
            this.store.dispatch(ProductsActions.setSearchQuery({ 
              query: urlState.filters.searchQuery 
            }));
            this.searchQuery = urlState.filters.searchQuery; // Update component property
          }
          
          // Apply category filters
          if (urlState.filters.categories && urlState.filters.categories.length > 0) {
            urlState.filters.categories.forEach(categoryName => {
              this.store.dispatch(ProductsActions.toggleCategoryFilter({
                category: categoryName,
                checked: true
              }));
            });
          }
          
          // Apply manufacturer filters
          if (urlState.filters.manufacturers && urlState.filters.manufacturers.length > 0) {
            urlState.filters.manufacturers.forEach(manufacturer => {
              this.store.dispatch(ProductsActions.toggleManufacturerFilter({
                manufacturer: manufacturer,
                checked: true
              }));
            });
          }
          
          // Apply availability filter
          if (urlState.filters.availability) {
            this.store.dispatch(ProductsActions.setAvailabilityFilter({ 
              availability: urlState.filters.availability 
            }));
          }
          
          // Apply sort option
          if (urlState.filters.sortBy) {
            this.store.dispatch(ProductsActions.setSortOption({ 
              sortBy: urlState.filters.sortBy 
            }));
          }
        }
        
        // Restore pagination
        if (urlState.currentPage && urlState.currentPage > 1) {
          this.store.dispatch(ProductsActions.setCurrentPage({ 
            page: urlState.currentPage 
          }));
        }
        
        if (urlState.itemsPerPage && urlState.itemsPerPage !== 12) {
          this.store.dispatch(ProductsActions.setItemsPerPage({ 
            itemsPerPage: urlState.itemsPerPage 
          }));
        }
      }
      
      // Handle legacy category parameter for backwards compatibility
      if (params['category'] && !urlState.filters?.categories?.length) {
        console.log('🏷️ B2B Legacy category param found:', params['category']);
        
        // Wait for categories to be loaded, then find the matching category
        this.categories$.pipe(
          takeUntil(this.destroy$),
          filter((categories): categories is Category[] => categories !== null && categories.length > 0)
        ).subscribe((categories) => {
          const matchingCategory = categories.find((cat) =>
            cat.slug === params['category'] ||
            cat.id === params['category'] ||
            cat.name.toLowerCase() === params['category'].toLowerCase()
          );

          if (matchingCategory) {
            console.log('✅ B2B Applying matched category filter:', matchingCategory.name);
            this.store.dispatch(ProductsActions.toggleCategoryFilter({
              category: matchingCategory.name,
              checked: true
            }));
          }
        });
      }
      
      // Load initial products AFTER processing query params
      // Use setTimeout to ensure all filters are applied first
      setTimeout(() => {
        this.loadProductsWithCurrentState();
      }, 0);
    });

    // Subscribe to filter and pagination changes to reload products
    this.setupProductReloading();

    // Subscribe to filter changes to update counts
    this.filters$.pipe(
      skip(1),
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(filters => {
      // Load dynamic counts based on current filters
      const categoryFilters = {
        searchQuery: filters.searchQuery,
        manufacturers: filters.manufacturers,
        availability: filters.availability
      };
      const manufacturerFilters = {
        searchQuery: filters.searchQuery,
        categories: filters.categories,
        availability: filters.availability
      };
      
      this.store.dispatch(ProductsActions.loadCategoryCounts({ filters: categoryFilters }));
      this.store.dispatch(ProductsActions.loadManufacturerCounts({ filters: manufacturerFilters }));
    });

    // Set up URL state synchronization - sync store state to URL
    this.setupUrlStateSynchronization();
  }

  /**
   * Set up automatic URL state synchronization
   */
  private setupUrlStateSynchronization(): void {
    // Combine relevant store selectors for state changes
    combineLatest([
      this.filters$,
      this.currentPage$,
      this.itemsPerPage$
    ]).pipe(
      skip(1), // Skip initial emission
      debounceTime(300), // Debounce to avoid too many URL updates
      takeUntil(this.destroy$)
    ).subscribe(([filters, currentPage, itemsPerPage]) => {
      const currentState: B2BProductListUrlState = {
        filters,
        currentPage: currentPage || 1,
        itemsPerPage: itemsPerPage || 12
      };

      // Update URL with current state
      const queryParams = this.urlStateService.serializeToQueryParams(currentState);
      
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams,
        queryParamsHandling: 'merge',
        replaceUrl: true // Use replaceUrl to avoid creating history entries
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadUserAndCompanyInfo(user: User): Promise<void> {
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

  /**
   * Check if product has any B2B pricing (company or partner price)
   */
  hasB2BPrice(product: ProductWithPricing): boolean {
    return !!(product.company_price || product.partner_price);
  }

  /**
   * Get minimum order for a product, using company-specific minimum order if available
   */
  getMinimumOrder(product: ProductWithPricing): number {
    // Use company-specific minimum order if available, otherwise use product default
    if (this.isCompanyContact && product.company_minimum_order !== undefined) {
      return product.company_minimum_order;
    }
    return product.minimum_order || 1;
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
        return this.translateService.translate('b2b.products.pendingApproval');
      case 'approved':
        return this.translateService.translate('b2b.products.approvedPartner');
      case 'rejected':
        return this.translateService.translate('b2b.products.rejected');
      default:
        return status;
    }
  }

  private loadNestedCategories(): void {
    this.categoriesService.getNestedCategories().pipe(
      takeUntil(this.destroy$)
    ).subscribe(categories => {
      this.nestedCategories = categories;
      // Initialize expansion state for parent categories (collapsed by default)
      categories.forEach(category => {
        if (category.subcategories && category.subcategories.length > 0) {
          this.categoryExpansionState[category.id] = false;
        }
      });
    });
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }

  onCategoryChange(category: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.store.dispatch(ProductsActions.toggleCategoryFilter({ category, checked: target.checked }));
  }

  onParentCategoryChange(parentCategory: ProductCategory, event: Event): void {
    const target = event.target as HTMLInputElement;
    const isChecked = target.checked;
    
    if (isChecked) {
      // Always include the parent category itself
      this.store.dispatch(ProductsActions.toggleCategoryFilter({
        category: parentCategory.name,
        checked: true
      }));

      // When parent is selected, also select all its subcategories
      if (parentCategory.subcategories && parentCategory.subcategories.length > 0) {
        parentCategory.subcategories.forEach(subCategory => {
          this.store.dispatch(ProductsActions.toggleCategoryFilter({
            category: subCategory.name,
            checked: true
          }));
        });
      }
    } else {
      // When parent is deselected, deselect parent and all subcategories
      this.store.dispatch(ProductsActions.toggleCategoryFilter({
        category: parentCategory.name,
        checked: false
      }));

      if (parentCategory.subcategories && parentCategory.subcategories.length > 0) {
        parentCategory.subcategories.forEach(subCategory => {
          this.store.dispatch(ProductsActions.toggleCategoryFilter({
            category: subCategory.name,
            checked: false
          }));
        });
      }
    }
  }

  onSubCategoryChange(parentCategory: ProductCategory, subCategoryName: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const isChecked = target.checked;
    
    // Toggle the specific subcategory
    this.store.dispatch(ProductsActions.toggleCategoryFilter({
      category: subCategoryName,
      checked: isChecked
    }));
  }

  onManufacturerChange(manufacturer: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.store.dispatch(ProductsActions.toggleManufacturerFilter({ manufacturer, checked: target.checked }));
  }

  isManufacturerSelected(manufacturer: string): boolean {
    let isSelected = false;
    this.filters$.pipe(take(1)).subscribe(filters => {
      isSelected = filters?.manufacturers?.includes(manufacturer) || false;
    });
    return isSelected;
  }

  onAvailabilityChange(availability: string): void {
    this.store.dispatch(ProductsActions.setAvailabilityFilter({ availability }));
  }

  onSortChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.store.dispatch(ProductsActions.setSortOption({ sortBy: target.value }));
  }

  // Helper methods for improved category filtering
  isParentCategorySelected(parentCategory: ProductCategory): boolean {
    // Get current filters synchronously using store selector
    let isSelected = false;
    this.filters$.pipe(
      take(1)
    ).subscribe(filters => {
      if (parentCategory.subcategories && parentCategory.subcategories.length > 0) {
        // Parent is considered selected if the parent itself OR ANY of its subcategories are selected
        const parentSelected = filters?.categories?.includes(parentCategory.name) || false;
        const anySubcategorySelected = parentCategory.subcategories.some(sub => 
          filters?.categories?.includes(sub.name) || false
        );
        isSelected = parentSelected || anySubcategorySelected;
      } else {
        // For categories without subcategories, check if directly selected
        isSelected = filters?.categories?.includes(parentCategory.name) || false;
      }
    });
    return isSelected;
  }

  getTotalProductCount(parentCategory: ProductCategory): number {
    // Get count from dynamic counts observable
    let count = 0;
    this.categoryCounts$.pipe(take(1)).subscribe(counts => {
      count = counts?.[parentCategory.name] || 0;
    });
    return count;
  }

  // Legacy expansion methods (kept for compatibility)
  toggleCategoryExpansion(categoryId: string): void {
    this.categoryExpansionState[categoryId] = !this.categoryExpansionState[categoryId];
  }

  isCategoryExpanded(categoryId: string): boolean {
    return this.categoryExpansionState[categoryId] || false;
  }

  navigateToLogin(): void {
    this.router.navigate(['/prijava']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/partneri/register']);
  }

  addToCart(product: ProductWithPricing, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.isAuthenticated && this.isCompanyContact && this.company) {
      this.store.dispatch(B2BCartActions.addToB2BCart({
        productId: product.id,
        quantity: 1,
        companyId: this.company.id
      }));
    }
  }

  requestQuote(product: ProductWithPricing, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    // Navigate to partner contact page
    this.router.navigate(['/partneri/kontakt'], {
      queryParams: {
        subject: 'pricingInquiry',
        productId: product.id,
        productName: product.name,
        sku: product.sku
      }
    });
  }

  viewDetails(product: ProductWithPricing, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    // Get current state for URL preservation
    combineLatest([
      this.filters$,
      this.currentPage$,
      this.itemsPerPage$
    ]).pipe(take(1)).subscribe(([filters, currentPage, itemsPerPage]) => {
      const currentState: B2BProductListUrlState = {
        filters,
        currentPage: currentPage || 1,
        itemsPerPage: itemsPerPage || 12
      };

      // Create query parameters to preserve current state
      const queryParams = this.urlStateService.createStatePreservingParams(currentState);
      
      // Navigate to B2B product details with preserved state
      this.router.navigate(['/partneri/proizvodi', product.id], {
        queryParams
      });
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
    this.store.dispatch(ProductsActions.clearFilters());
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/images/product-placeholder.svg';
    }
  }

  getProductImageUrl(product: ProductWithPricing): string {
    // If image_url is already computed and not empty, use it
    if (product.image_url && product.image_url.trim()) {
      return product.image_url;
    }

    // Extract from images array - use first image
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      // Find primary image first
      const primaryImage = product.images.find(img => img.is_primary && img.url && img.url.trim());
      if (primaryImage) {
        return primaryImage.url;
      }

      // Fallback to first image with valid url
      const firstImageWithUrl = product.images.find(img => img.url && img.url.trim());
      if (firstImageWithUrl) {
        return firstImageWithUrl.url;
      }
    }

    // Return placeholder SVG as fallback only if no valid images found
    return 'assets/images/product-placeholder.svg';
  }

  hasProductImage(product: ProductWithPricing): boolean {
    return !!this.getProductImageUrl(product);
  }

  // Pagination methods
  onPageChange(page: number): void {
    this.store.dispatch(ProductsActions.setCurrentPage({ page }));
  }

  onPreviousPage(): void {
    combineLatest([this.currentPage$, this.totalPages$]).pipe(
      takeUntil(this.destroy$),
      take(1)
    ).subscribe(([currentPage, totalPages]) => {
      if (currentPage > 1) {
        this.onPageChange(currentPage - 1);
      }
    });
  }

  onNextPage(): void {
    combineLatest([this.currentPage$, this.totalPages$]).pipe(
      takeUntil(this.destroy$),
      take(1)
    ).subscribe(([currentPage, totalPages]) => {
      if (currentPage < totalPages) {
        this.onPageChange(currentPage + 1);
      }
    });
  }

  onLastPage(): void {
    this.totalPages$.pipe(
      takeUntil(this.destroy$),
      take(1)
    ).subscribe(totalPages => {
      if (totalPages > 0) {
        this.onPageChange(totalPages);
      }
    });
  }

  onItemsPerPageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const itemsPerPage = +target.value;
    this.store.dispatch(ProductsActions.setItemsPerPage({ itemsPerPage }));
  }

  // Helper method for smart pagination display
  getSmartPageNumbers(): Observable<{
    visiblePages: number[];
    showFirstPage: boolean;
    showLastPage: boolean;
    showFirstEllipsis: boolean;
    showLastEllipsis: boolean;
    totalPages: number;
  }> {
    return combineLatest([this.currentPage$, this.totalPages$]).pipe(
      map(([currentPage, totalPages]) => {
        const visiblePages: number[] = [];
        let showFirstPage = false;
        let showLastPage = false;
        let showFirstEllipsis = false;
        let showLastEllipsis = false;
        
        // Calculate visible page range (current page + 1 adjacent page on each side)
        const startPage = Math.max(1, currentPage - 1);
        const endPage = Math.min(totalPages, currentPage + 1);
        
        // Add visible pages
        for (let i = startPage; i <= endPage; i++) {
          visiblePages.push(i);
        }
        
        // Show first page if not in visible range
        if (startPage > 1) {
          showFirstPage = true;
          showFirstEllipsis = startPage > 2;
        }
        
        // Show last page if not in visible range
        if (endPage < totalPages) {
          showLastPage = true;
          showLastEllipsis = endPage < totalPages - 1;
        }
        
        return {
          visiblePages,
          showFirstPage,
          showLastPage,
          showFirstEllipsis,
          showLastEllipsis,
          totalPages
        };
      })
    );
  }

  private loadProductsWithCurrentState(): void {
    combineLatest([
      this.filters$,
      this.currentPage$,
      this.itemsPerPage$
    ]).pipe(
      take(1) // Only take the initial values
    ).subscribe(([filters, currentPage, itemsPerPage]) => {
      const query = {
        page: currentPage,
        itemsPerPage: itemsPerPage,
        searchQuery: filters.searchQuery,
        categories: filters.categories,
        manufacturers: filters.manufacturers,
        availability: filters.availability,
        sortBy: filters.sortBy
      };
      
      this.store.dispatch(ProductsActions.loadProducts({ query }));
    });
  }

  private setupProductReloading(): void {
    let previousPage = 1; // Track previous page to detect page changes
    
    // React to filter changes (skip initial values)
    combineLatest([
      this.filters$,
      this.currentPage$,
      this.itemsPerPage$
    ]).pipe(
      skip(1), // Skip initial emission
      debounceTime(300), // Debounce rapid changes
      takeUntil(this.destroy$)
    ).subscribe(([filters, currentPage, itemsPerPage]: [any, number, number]) => {
      const query = {
        page: currentPage,
        itemsPerPage: itemsPerPage,
        searchQuery: filters.searchQuery,
        categories: filters.categories,
        manufacturers: filters.manufacturers,
        availability: filters.availability,
        sortBy: filters.sortBy
      };
      
      this.store.dispatch(ProductsActions.loadProducts({ query }));
      
      // Only scroll to top when the page actually changes
      if (currentPage !== previousPage) {
        this.scrollToTop();
        previousPage = currentPage;
      }
    });
  }

  private scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}