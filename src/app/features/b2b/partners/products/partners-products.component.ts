import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, Subject } from 'rxjs';
import { map, filter, switchMap, takeUntil } from 'rxjs/operators';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../shared/services/translation.service';
import { selectCurrentUser } from '../../../../core/auth/store/auth.selectors';
import { User } from '../../../../shared/models/user.model';
import { Company } from '../../../../shared/models/company.model';
import { SupabaseService } from '../../../../services/supabase.service';
import * as B2BCartActions from '../../cart/store/b2b-cart.actions';
import { selectB2BCartTotalItems } from '../../cart/store/b2b-cart.selectors';
import * as ProductsActions from '../../shared/store/products.actions';
import { selectProductsWithPricing, selectProductsLoading, selectCategories, selectCategoriesLoading } from '../../shared/store/products.selectors';
import { ProductWithPricing, Category } from '../../shared/store/products.actions';

export interface B2BHierarchicalCategory {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  children: B2BHierarchicalCategory[];
  level: number;
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
                         [(ngModel)]="searchTerm" 
                         (ngModelChange)="filterProducts()"
                         [placeholder]="'b2b.products.searchProducts' | translate"
                         class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-solar-500 text-sm font-['DM_Sans']">
                </div>
              </div>

              <!-- Categories Filter -->
              <div class="mb-6">
                <h4 class="text-sm font-medium text-gray-900 mb-3 font-['DM_Sans']">{{ 'b2b.products.category' | translate }}</h4>
                <div class="space-y-1">
                  <!-- All Categories Option -->
                  <label class="flex items-center py-1">
                    <input type="radio" 
                           name="category"
                           value=""
                           [checked]="selectedCategory === ''"
                           (change)="selectedCategory = ''; filterProducts()"
                           class="rounded border-gray-300 text-solar-600 focus:ring-solar-500">
                    <span class="ml-2 text-sm font-medium text-gray-900 font-['DM_Sans']">{{ 'b2b.products.allCategories' | translate }}</span>
                  </label>
                  
                  <!-- Hierarchical Categories -->
                  <ng-container *ngFor="let category of hierarchicalCategories">
                    <div 
                      class="flex items-center"
                      [style.padding-left.px]="category.level * 16"
                    >
                      <!-- Expand/Collapse button for parent categories -->
                      <button 
                        *ngIf="category.children.length > 0"
                        (click)="toggleCategoryExpansion(category.id)"
                        class="mr-2 p-1 hover:bg-gray-100 rounded transition-colors"
                        type="button"
                      >
                        <svg 
                          class="w-3 h-3 text-gray-400 transition-transform duration-200"
                          [class.rotate-90]="expandedCategories.has(category.id)"
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                      </button>
                      <!-- Spacer for leaf categories -->
                      <div *ngIf="category.children.length === 0" class="w-5 mr-2"></div>
                      
                      <label class="flex items-center flex-1 py-1">
                        <input type="radio" 
                               name="category"
                               [value]="category.slug"
                               [checked]="selectedCategory === category.slug"
                               (change)="selectedCategory = category.slug; filterProducts()"
                               class="rounded border-gray-300 text-solar-600 focus:ring-solar-500">
                        <span 
                          class="ml-2 text-sm font-['DM_Sans']"
                          [class.font-medium]="category.level === 0"
                          [class.text-gray-900]="category.level === 0"
                          [class.text-gray-700]="category.level > 0"
                        >
                          {{ category.name }}
                        </span>
                      </label>
                    </div>
                    
                    <!-- Render children recursively if expanded -->
                    <ng-container *ngIf="expandedCategories.has(category.id)">
                      <ng-container *ngFor="let child of category.children">
                        <div 
                          class="flex items-center"
                          [style.padding-left.px]="child.level * 16"
                        >
                          <!-- Expand/Collapse button for child categories -->
                          <button 
                            *ngIf="child.children.length > 0"
                            (click)="toggleCategoryExpansion(child.id)"
                            class="mr-2 p-1 hover:bg-gray-100 rounded transition-colors"
                            type="button"
                          >
                            <svg 
                              class="w-3 h-3 text-gray-400 transition-transform duration-200"
                              [class.rotate-90]="expandedCategories.has(child.id)"
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                            </svg>
                          </button>
                          <!-- Spacer for leaf categories -->
                          <div *ngIf="child.children.length === 0" class="w-5 mr-2"></div>
                          
                          <label class="flex items-center flex-1 py-1">
                            <input type="radio" 
                                   name="category"
                                   [value]="child.slug"
                                   [checked]="selectedCategory === child.slug"
                                   (change)="selectedCategory = child.slug; filterProducts()"
                                   class="rounded border-gray-300 text-solar-600 focus:ring-solar-500">
                            <span 
                              class="ml-2 text-sm text-gray-700 font-['DM_Sans']"
                            >
                              {{ child.name }}
                            </span>
                          </label>
                        </div>
                        
                        <!-- Render grandchildren if expanded -->
                        <ng-container *ngIf="expandedCategories.has(child.id)">
                          <ng-container *ngFor="let grandchild of child.children">
                            <div 
                              class="flex items-center"
                              [style.padding-left.px]="grandchild.level * 16"
                            >
                              <div class="w-5 mr-2"></div>
                              <label class="flex items-center flex-1 py-1">
                                <input type="radio" 
                                       name="category"
                                       [value]="grandchild.slug"
                                       [checked]="selectedCategory === grandchild.slug"
                                       (change)="selectedCategory = grandchild.slug; filterProducts()"
                                       class="rounded border-gray-300 text-solar-600 focus:ring-solar-500">
                                <span class="ml-2 text-sm text-gray-700 font-['DM_Sans']">
                                  {{ grandchild.name }}
                                </span>
                              </label>
                            </div>
                          </ng-container>
                        </ng-container>
                      </ng-container>
                    </ng-container>
                  </ng-container>
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
                           [checked]="availabilityFilter === ''"
                           (change)="availabilityFilter = ''; filterProducts()"
                           class="rounded border-gray-300 text-gray-600 focus:ring-gray-500">
                    <span class="ml-2 text-sm text-gray-700 font-['DM_Sans']">{{ 'b2b.products.allProducts' | translate }}</span>
                  </label>
                  <label class="flex items-center">
                    <input type="radio" 
                           name="availability"
                           value="in-stock"
                           [checked]="availabilityFilter === 'in-stock'"
                           (change)="availabilityFilter = 'in-stock'; filterProducts()"
                           class="rounded border-gray-300 text-green-600 focus:ring-green-500">
                    <span class="ml-2 text-sm text-gray-700 font-['DM_Sans']">{{ 'b2b.products.inStock' | translate }}</span>
                  </label>
                  <label class="flex items-center">
                    <input type="radio" 
                           name="availability"
                           value="partner-only"
                           [checked]="availabilityFilter === 'partner-only'"
                           (change)="availabilityFilter = 'partner-only'; filterProducts()"
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
                    {{ 'b2b.products.showing' | translate }} {{ filteredProducts.length }} {{ 'b2b.products.of' | translate }} {{ allProducts.length }} {{ 'b2b.products.productsCount' | translate }}
                  </p>
                </div>

                <!-- Right: Sort Controls -->
                <div class="flex items-center space-x-3">
                  <label class="text-sm font-medium text-gray-700 whitespace-nowrap font-['DM_Sans']">{{ 'b2b.products.sortBy' | translate }}:</label>
                  <select [(ngModel)]="sortBy" (ngModelChange)="sortProducts()" 
                          class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-solar-500 text-sm font-medium font-['DM_Sans']">
                    <option value="name">{{ 'b2b.products.name' | translate }}</option>
                    <option value="price-low">{{ 'b2b.products.priceLowToHigh' | translate }}</option>
                    <option value="price-high">{{ 'b2b.products.priceHighToLow' | translate }}</option>
                    <option value="savings">{{ 'b2b.products.bestSavings' | translate }}</option>
                  </select>
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
                <div *ngFor="let product of filteredProducts" 
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
                           class="w-full h-full object-cover"
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
                            <span class="text-sm font-bold text-green-600">€{{ product.company_price | number:'1.2-2' }}</span>
                          </div>

                          <!-- Partner Price -->
                          <div *ngIf="product.partner_price && (!product.company_price || !isCompanyContact)" class="flex items-center justify-between">
                            <span class="text-xs font-medium text-solar-700">{{ 'b2b.products.partnerPrice' | translate }}:</span>
                            <span class="text-sm font-bold text-solar-600">€{{ product.partner_price | number:'1.2-2' }}</span>
                          </div>

                          <!-- Retail Price -->
                          <div class="flex items-center justify-between">
                            <span class="text-xs text-gray-500">{{ 'b2b.products.retailPrice' | translate }}:</span>
                            <span class="text-xs text-gray-500 line-through">€{{ product.price | number:'1.2-2' }}</span>
                          </div>

                          <!-- Savings -->
                          <div *ngIf="product.savings" class="flex items-center justify-between">
                            <span class="text-xs font-medium text-green-700">{{ 'b2b.products.savings' | translate }}:</span>
                            <span class="text-xs font-bold text-green-600">€{{ product.savings | number:'1.2-2' }}</span>
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
                           class="w-full h-full object-cover rounded-lg"
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
                            <div *ngIf="product.company_price && isCompanyContact" class="text-lg font-bold text-green-600">€{{ product.company_price | number:'1.2-2' }}</div>
                            <div *ngIf="product.partner_price && (!product.company_price || !isCompanyContact)" class="text-lg font-bold text-solar-600">€{{ product.partner_price | number:'1.2-2' }}</div>
                            <div class="text-sm text-gray-500 line-through">€{{ product.price | number:'1.2-2' }}</div>
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
              <div *ngIf="filteredProducts.length === 0" class="text-center py-12">
                <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                </svg>
                <h3 class="text-lg font-medium text-gray-900 mb-2">{{ 'b2b.products.noProductsFound' | translate }}</h3>
                <p class="text-gray-600">{{ 'b2b.products.tryAdjustingFilters' | translate }}</p>
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
  categories$: Observable<Category[]>;
  loading$: Observable<boolean>;
  categoriesLoading$: Observable<boolean>;

  isAuthenticated = false;
  isCompanyContact = false;
  company: Company | null = null;

  selectedCategory = '';
  searchTerm = '';
  availabilityFilter = '';
  sortBy = 'name';
  gridView = 'grid';
  showMobileFilters = false;

  allProducts: ProductWithPricing[] = [];
  filteredProducts: ProductWithPricing[] = [];
  
  // Category hierarchy state
  hierarchicalCategories: B2BHierarchicalCategory[] = [];
  expandedCategories = new Set<string>();

  constructor() {
    this.currentUser$ = this.store.select(selectCurrentUser);
    this.cartItemsCount$ = this.store.select(selectB2BCartTotalItems);
    this.products$ = this.store.select(selectProductsWithPricing);
    this.categories$ = this.store.select(selectCategories);
    this.loading$ = this.store.select(selectProductsLoading);
    this.categoriesLoading$ = this.store.select(selectCategoriesLoading);
  }

  ngOnInit(): void {
    // Load products and categories
    this.store.dispatch(ProductsActions.loadProducts());
    this.store.dispatch(ProductsActions.loadCategories());

    // Subscribe to categories to build hierarchy
    this.categories$.pipe(
      takeUntil(this.destroy$),
      filter(categories => categories && categories.length > 0)
    ).subscribe(categories => {
      this.buildCategoryHierarchy(categories);
    });

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

    // Subscribe to products
    this.products$.pipe(takeUntil(this.destroy$)).subscribe(products => {
      this.allProducts = products;
      this.filterProducts();
    });

    // Handle query params
    this.activatedRoute.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['category']) {
        this.selectedCategory = params['category'];
        this.filterProducts();
      }
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

  filterProducts(): void {
    this.filteredProducts = this.allProducts.filter(product => {
      // Check category hierarchically - if parent is selected, include all children
      const matchesCategory = this.matchesCategoryHierarchically(product);

      const matchesSearch = !this.searchTerm ||
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.short_description?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesAvailability = !this.availabilityFilter ||
        (this.availabilityFilter === 'in-stock' && product.in_stock) ||
        (this.availabilityFilter === 'partner-only' && product.partner_only);

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
          const priceA = a.company_price || a.partner_price || a.price;
          const priceB = b.company_price || b.partner_price || b.price;
          return priceA - priceB;
        case 'price-high':
          const priceA2 = a.company_price || a.partner_price || a.price;
          const priceB2 = b.company_price || b.partner_price || b.price;
          return priceB2 - priceA2;
        case 'savings':
          return (b.savings || 0) - (a.savings || 0);
        default:
          return 0;
      }
    });
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
    this.router.navigate(['/partneri/contact'], {
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
    // Navigate to B2B product details
    this.router.navigate(['/partneri/proizvodi', product.id]);
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

  buildCategoryHierarchy(categories: Category[]): void {
    // Create a map for quick lookup
    const categoryMap = new Map<string, B2BHierarchicalCategory>();
    
    // First pass: create all categories
    categories.forEach(cat => {
      categoryMap.set(cat.id, {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        parentId: cat.parent_id,
        children: [],
        level: 0
      });
    });

    // Second pass: build parent-child relationships and set levels
    const rootCategories: B2BHierarchicalCategory[] = [];
    
    categories.forEach(cat => {
      const hierarchicalCat = categoryMap.get(cat.id)!;
      
      if (cat.parent_id) {
        const parent = categoryMap.get(cat.parent_id);
        if (parent) {
          parent.children.push(hierarchicalCat);
          hierarchicalCat.level = parent.level + 1;
        }
      } else {
        rootCategories.push(hierarchicalCat);
      }
    });

    // Sort categories by name at each level
    this.sortCategoriesRecursively(rootCategories);
    
    this.hierarchicalCategories = rootCategories;
  }

  private sortCategoriesRecursively(categories: B2BHierarchicalCategory[]): void {
    categories.sort((a, b) => a.name.localeCompare(b.name));
    categories.forEach(cat => {
      if (cat.children.length > 0) {
        this.sortCategoriesRecursively(cat.children);
      }
    });
  }

  toggleCategoryExpansion(categoryId: string): void {
    if (this.expandedCategories.has(categoryId)) {
      this.expandedCategories.delete(categoryId);
    } else {
      this.expandedCategories.add(categoryId);
    }
  }

  private matchesCategoryHierarchically(product: ProductWithPricing): boolean {
    if (!this.selectedCategory) {
      return true; // No category filter applied
    }

    // Find the selected category in hierarchy
    const selectedCategoryObj = this.findCategoryInHierarchy(this.selectedCategory);
    if (!selectedCategoryObj) {
      // Fallback to original matching logic
      return product.category?.toLowerCase().includes(this.selectedCategory.toLowerCase()) ||
             product.category_id === this.selectedCategory;
    }

    // Get all category names/slugs that should match (selected category + all its children)
    const allowedCategorySlugs = this.getAllSubcategorySlugs(selectedCategoryObj);
    const allowedCategoryNames = this.getAllSubcategoryNames(selectedCategoryObj);

    // Check if product matches any of the allowed categories
    return allowedCategorySlugs.includes(product.category_id) ||
           allowedCategoryNames.some(name => 
             product.category?.toLowerCase().includes(name.toLowerCase())
           );
  }

  private findCategoryInHierarchy(slug: string): B2BHierarchicalCategory | null {
    const searchCategories = (categories: B2BHierarchicalCategory[]): B2BHierarchicalCategory | null => {
      for (const category of categories) {
        if (category.slug === slug) {
          return category;
        }
        const found = searchCategories(category.children);
        if (found) {
          return found;
        }
      }
      return null;
    };
    
    return searchCategories(this.hierarchicalCategories);
  }

  private getAllSubcategorySlugs(category: B2BHierarchicalCategory): string[] {
    const result: string[] = [category.slug]; // Include the category itself
    
    for (const child of category.children) {
      result.push(...this.getAllSubcategorySlugs(child)); // Recursively get children
    }
    
    return result;
  }

  private getAllSubcategoryNames(category: B2BHierarchicalCategory): string[] {
    const result: string[] = [category.name]; // Include the category itself
    
    for (const child of category.children) {
      result.push(...this.getAllSubcategoryNames(child)); // Recursively get children
    }
    
    return result;
  }
} 