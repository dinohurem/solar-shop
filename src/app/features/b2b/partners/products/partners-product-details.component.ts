import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, switchMap, map } from 'rxjs/operators';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { LucideAngularModule, ShoppingCart } from 'lucide-angular';
import { selectCurrentUser } from '../../../../core/auth/store/auth.selectors';
import { User } from '../../../../shared/models/user.model';
import { Company } from '../../../../shared/models/company.model';
import { SupabaseService } from '../../../../services/supabase.service';
import { ErpIntegrationService, StockItem } from '../../../../shared/services/erp-integration.service';
import * as ProductsActions from '../../shared/store/products.actions';
import { selectProductsWithPricing, selectProductsLoading } from '../../shared/store/products.selectors';
import { ProductWithPricing } from '../../shared/store/products.actions';
import * as B2BCartActions from '../../cart/store/b2b-cart.actions';

@Component({
  selector: 'app-partners-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Breadcrumb -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav class="flex" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-4">
              <li>
                <div>
                  <a [routerLink]="['/partneri']" class="text-gray-400 hover:text-gray-500 font-['DM_Sans']">
                    {{ 'b2bNav.home' | translate }}
                  </a>
                </div>
              </li>
              <li>
                <div class="flex items-center">
                  <svg class="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                  </svg>
                  <a [routerLink]="['/partneri/proizvodi']" class="ml-4 text-gray-400 hover:text-gray-500 font-['DM_Sans']">
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
            [routerLink]="['/partneri/proizvodi']"
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
          <div class="lg:sticky lg:top-8 space-y-6">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div class="aspect-w-1 aspect-h-1 bg-gray-50 flex items-center justify-center min-h-[400px] relative">
                <!-- Show actual image if available -->
                <img *ngIf="getProductImages().length > 0" 
                     [src]="getCurrentImageUrl()" 
                     [alt]="product.name" 
                     class="w-full h-96 object-contain"
                     (error)="onImageError($event)">
                
                <!-- Show placeholder if no images -->
                <img *ngIf="getProductImages().length === 0" 
                     src="assets/images/product-placeholder.svg" 
                     [alt]="product.name" 
                     class="w-full h-96 object-contain">
                
                <!-- Navigation arrows for multiple images -->
                <div *ngIf="hasMultipleImages()" class="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4">
                  <button 
                    (click)="previousImage()" 
                    class="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
                    [disabled]="currentImageIndex === 0"
                    [class.opacity-50]="currentImageIndex === 0"
                  >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                  </button>
                  <button 
                    (click)="nextImage()" 
                    class="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
                    [disabled]="currentImageIndex === getImageCount() - 1"
                    [class.opacity-50]="currentImageIndex === getImageCount() - 1"
                  >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
                
                <!-- Image counter -->
                <div *ngIf="hasMultipleImages()" class="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                  {{ currentImageIndex + 1 }} / {{ getImageCount() }}
                </div>
              </div>
              <!-- Thumbnail Images (if available) -->
              <div *ngIf="hasMultipleImages()" class="p-4">
                <div class="flex space-x-2 overflow-x-auto">
                  <div *ngFor="let image of getProductImages(); let i = index" 
                       class="w-16 h-16 bg-gray-100 rounded border border-gray-200 cursor-pointer hover:opacity-75 flex items-center justify-center flex-shrink-0"
                       [class.border-solar-500]="i === currentImageIndex"
                       [class.border-2]="i === currentImageIndex"
                       (click)="selectImage(i)">
                    <img 
                         [src]="image" 
                         [alt]="product.name"
                         class="w-full h-full object-contain rounded"
                         (error)="onThumbnailImageError($event, i)">
                  </div>
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

            <!-- ERP Stock Information -->
            <div *ngIf="erpStock && erpStock.length > 0" class="bg-white rounded-lg border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ 'b2b.products.stockByLocation' | translate }}</h3>
              <div class="space-y-3">
                <div *ngFor="let stock of erpStock" class="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <span class="text-gray-700 font-medium">
                    {{ stock.unitName || stock.unitId }}
                  </span>
                  <span class="text-lg font-bold text-solar-600">
                    {{ stock.quantity }} {{ 'productDetails.units' | translate }}
                  </span>
                </div>
                <div class="pt-3 mt-3 border-t border-gray-200 flex items-center justify-between">
                  <span class="text-base font-semibold text-gray-900">
                    {{ 'productDetails.totalStock' | translate }}:
                  </span>
                  <span class="text-xl font-bold text-solar-600">
                    {{ getTotalErpStock() }} {{ 'productDetails.units' | translate }}
                  </span>
                </div>
              </div>
            </div>

            <!-- ERP Stock Loading -->
            <div *ngIf="erpStockLoading" class="bg-white rounded-lg border border-gray-200 p-6">
              <div class="flex items-center justify-center">
                <div class="animate-spin rounded-full h-5 w-5 border-2 border-solar-600 border-t-transparent mr-3"></div>
                <span class="text-sm text-gray-600">
                  {{ 'productDetails.loadingStockInformation' | translate }}
                </span>
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
                <!-- Multiple Categories Display -->
                <div *ngIf="product.categories && product.categories.length > 0" class="flex flex-wrap items-center gap-1">
                  <button 
                    *ngFor="let category of product.categories; let last = last"
                    (click)="navigateToCategory(category.name)"
                    class="text-sm font-medium text-solar-600 hover:text-solar-700 hover:underline uppercase transition-colors"
                    [class.font-bold]="category.isPrimary"
                    [title]="category.isPrimary ? 'Primary category' : ''"
                  >
                    {{ category.name }}{{ !last ? ',' : '' }}
                  </button>
                </div>
                <!-- Fallback to single category for legacy products -->
                <button 
                  *ngIf="(!product.categories || product.categories.length === 0) && product.category"
                  (click)="navigateToCategory(product.category)"
                  class="text-sm font-medium text-solar-600 hover:text-solar-700 hover:underline uppercase transition-colors"
                >
                  {{ product.category }}
                </button>
                <span 
                  *ngIf="(!product.categories || product.categories.length === 0) && !product.category"
                  class="text-sm font-medium text-gray-500 uppercase"
                >
                  Product
                </span>
                <span class="text-sm text-gray-400">{{ product.sku }}</span>
              </div>
              <h1 class="text-3xl font-bold text-gray-900 font-['Poppins']">{{ product.name }}</h1>
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
                <!-- Company Specific Price with Quantity Tiers -->
                <div *ngIf="product.company_price && isCompanyContact">
                  <!-- Show lowest price prominently -->
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-lg font-medium text-green-700">{{ 'b2b.products.yourCompanyPrice' | translate }}:</span>
                    <div class="text-right">
                      <span class="text-2xl font-bold text-green-600">€{{ product.company_price | number:'1.2-2':'de' }}</span>
                      <div *ngIf="product.company_pricing_tiers && product.company_pricing_tiers.length > 1" class="text-xs text-gray-500">
                        {{ 'b2b.products.lowestPrice' | translate }}
                      </div>
                    </div>
                  </div>
                  
                  <!-- Show pricing tiers if available -->
                  <div *ngIf="product.company_pricing_tiers && product.company_pricing_tiers.length > 1" 
                       class="bg-gray-50 rounded-lg p-3 space-y-2">
                    <h4 class="text-sm font-semibold text-gray-700 mb-2">{{ 'b2b.products.quantityPricing' | translate }}:</h4>
                    <div *ngFor="let tier of product.company_pricing_tiers" 
                         class="flex items-center justify-between text-sm">
                      <span class="text-gray-600">
                        <span class="font-medium">{{ tier.quantity }}+</span> {{ 'b2b.products.pieces' | translate }}
                      </span>
                      <span class="font-medium" 
                            [class.text-green-600]="tier.price === product.company_price"
                            [class.text-gray-900]="tier.price !== product.company_price">
                        €{{ tier.price | number:'1.2-2':'de' }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Partner Price -->
                <div *ngIf="product.partner_price && (!product.company_price || !isCompanyContact)" class="flex items-center justify-between">
                  <span class="text-lg font-medium text-solar-700">{{ 'b2b.products.partnerPrice' | translate }}:</span>
                  <span class="text-2xl font-bold text-solar-600">€{{ product.partner_price | number:'1.2-2':'de' }}</span>
                </div>

                <!-- Retail Price -->
                <div class="flex items-center justify-between text-gray-500">
                  <span>{{ 'b2b.products.retailPrice' | translate }}:</span>
                  <span class="line-through">€{{ product.price | number:'1.2-2':'de' }}</span>
                </div>

                <!-- Savings -->
                <div *ngIf="product.savings" class="flex items-center justify-between">
                  <span class="font-medium text-green-700">{{ 'b2b.products.yourSavings' | translate }}:</span>
                  <span class="font-bold text-green-600">€{{ product.savings | number:'1.2-2':'de' }}</span>
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

            <!-- Product Details & Specifications -->
            <div class="bg-white rounded-lg border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900">{{ 'b2b.products.productDetails' | translate }}</h3>
              </div>
              
              <!-- Description Section -->
              <div class="mb-6">
                <div class="flex items-center justify-between mb-3">
                  <h4 class="text-md font-medium text-gray-700">{{ 'b2b.products.description' | translate }}</h4>
                  <button 
                    (click)="toggleDescription()"
                    class="flex items-center space-x-2 text-solar-600 hover:text-solar-700 transition-colors duration-200"
                    [attr.aria-expanded]="isDescriptionExpanded"
                    [attr.aria-label]="isDescriptionExpanded ? 'Collapse description' : 'Expand description'"
                  >
                    <svg 
                      class="w-4 h-4 transition-transform duration-200"
                      [class.rotate-180]="isDescriptionExpanded"
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
                  [class.max-h-0]="!isDescriptionExpanded"
                  [class.max-h-screen]="isDescriptionExpanded"
                >
                  <p class="text-gray-600 font-['DM_Sans'] leading-relaxed whitespace-pre-line">{{ product.description }}</p>
                </div>
              </div>
              
              <!-- Specifications Section -->
              <div *ngIf="product.specifications" class="border-t border-gray-200 pt-6">
                <div class="flex items-center justify-between mb-3">
                  <h4 class="text-md font-medium text-gray-700">{{ 'b2b.products.specifications' | translate }}</h4>
                  <button 
                    (click)="toggleSpecifications()"
                    class="flex items-center space-x-2 text-solar-600 hover:text-solar-700 transition-colors duration-200"
                    [attr.aria-expanded]="isSpecificationsExpanded"
                    [attr.aria-label]="isSpecificationsExpanded ? 'Collapse specifications' : 'Expand specifications'"
                  >
                    <svg 
                      class="w-4 h-4 transition-transform duration-200"
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
              
              <!-- Technical Sheet Section -->
              <div *ngIf="product.technical_sheet" class="border-t border-gray-200 pt-6">
                <div class="flex items-center justify-between mb-3">
                  <h4 class="text-md font-medium text-gray-700">{{ 'admin.productTechnicalSheet' | translate }}</h4>
                  <button 
                    (click)="toggleTechnicalSheet()"
                    class="flex items-center space-x-2 text-solar-600 hover:text-solar-700 transition-colors duration-200"
                    [attr.aria-expanded]="isTechnicalSheetExpanded"
                    [attr.aria-label]="isTechnicalSheetExpanded ? 'Collapse technical sheet' : 'Expand technical sheet'"
                  >
                    <svg 
                      class="w-4 h-4 transition-transform duration-200"
                      [class.rotate-180]="isTechnicalSheetExpanded"
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
                  [class.max-h-0]="!isTechnicalSheetExpanded"
                  [class.max-h-screen]="isTechnicalSheetExpanded"
                >
                  <div class="flex items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <a 
                      [href]="getFullTechnicalSheetUrl(product.technical_sheet || '')" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      class="inline-flex items-center px-6 py-3 bg-solar-600 text-white rounded-lg hover:bg-solar-700 transition-colors duration-200 font-medium"
                    >
                      {{ 'b2b.products.downloadTechnicalSheet' | translate }}
                      <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M7 7h10v10M15 3h6v6m-6 0l6-6"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            

            <!-- Quantity Selector for Add to Cart -->
            <div *ngIf="isCompanyContact && product.in_stock && hasB2BPrice(product)" class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ 'b2b.products.quantity' | translate }}:
              </label>
              <div class="flex items-center space-x-4">
                <div class="flex items-center border border-gray-300 rounded-lg">
                  <button
                    (click)="decreaseQuantity()"
                    class="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors rounded-l-lg"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                    </svg>
                  </button>
                  <input
                    type="number"
                    [(ngModel)]="selectedQuantity"
                    (change)="onQuantityChange($event)"
                    min="1"
                    class="w-20 px-3 py-2 text-center border-x border-gray-300 focus:outline-none focus:ring-2 focus:ring-solar-500"
                  >
                  <button
                    (click)="increaseQuantity()"
                    class="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors rounded-r-lg"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                  </button>
                </div>
                <div class="text-sm text-gray-600">
                  <span *ngIf="getMinimumOrder(product) > 1" class="text-amber-600">
                    {{ 'b2b.products.minimumOrder' | translate }}: {{ getMinimumOrder(product) }}
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
                <span class="flex items-center justify-center space-x-2">
                  <lucide-angular
                    name="shopping-cart"
                    class="w-6 h-6"
                    [img]="ShoppingCartIcon">
                  </lucide-angular>
                  <span *ngIf="selectedQuantity === 1">{{ 'b2b.products.addToCart' | translate }}</span>
                  <span *ngIf="selectedQuantity > 1">{{ 'b2b.products.addToCart' | translate }} ({{ selectedQuantity }} {{ 'b2b.products.pieces' | translate }})</span>
                </span>
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

            

          </div>
        </div>
        
        <!-- Suggested Products Section -->
        <div class="mt-16" *ngIf="suggestedProducts.length > 0">
          <h2 class="text-2xl font-bold text-gray-900 mb-8 font-['Poppins']">
            {{ 'b2b.products.suggestedProducts' | translate }}
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div *ngFor="let suggested of suggestedProducts" 
                 class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                 (click)="navigateToProduct(suggested.id)">
              <!-- Product Image -->
              <div class="aspect-w-1 aspect-h-1 bg-gray-100">
                <img 
                     [src]="getSuggestedProductImageUrl(suggested)" 
                     [alt]="suggested.name" 
                     class="w-full h-48 object-contain"
                     (error)="onSuggestedImageError($event)">
              </div>
              
              <!-- Product Info -->
              <div class="p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ suggested.name }}</h3>
                <!-- Multiple Categories Display -->
                <div *ngIf="suggested.categories && suggested.categories.length > 0" class="text-sm text-gray-500 mb-3">
                  <span *ngFor="let category of suggested.categories; let last = last" 
                        [class.font-semibold]="category.isPrimary">
                    {{ category.name }}{{ !last ? ', ' : '' }}
                  </span>
                </div>
                <!-- Fallback to single category for legacy products -->
                <p *ngIf="(!suggested.categories || suggested.categories.length === 0)" class="text-sm text-gray-500 mb-3">
                  {{ suggested.category || 'Product' }}
                </p>
                
                <!-- Pricing -->
                <div *ngIf="isCompanyContact && suggested.company_price" class="space-y-1">
                  <div class="text-lg font-bold text-green-600">
                    €{{ suggested.company_price | number:'1.2-2':'de' }}
                    <span *ngIf="suggested.company_pricing_tiers && suggested.company_pricing_tiers.length > 1" 
                          class="text-xs font-normal text-gray-500">
                      ({{ 'b2b.products.from' | translate }})
                    </span>
                  </div>
                  <div class="text-sm text-gray-500 line-through">
                    €{{ suggested.price | number:'1.2-2':'de' }}
                  </div>
                </div>
                
                <div *ngIf="!isCompanyContact || !suggested.company_price" class="text-lg font-bold text-gray-900">
                  €{{ suggested.price | number:'1.2-2':'de' }}
                </div>
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
  private erpService = inject(ErpIntegrationService);
  private destroy$ = new Subject<void>();

  currentUser: User | null = null;
  isAuthenticated = false;
  isCompanyContact = false;
  company: Company | null = null;

  product: ProductWithPricing | null = null;
  loading = true;
  error: string | null = null;
  suggestedProducts: ProductWithPricing[] = [];

  // Collapsible state
  isDescriptionExpanded = true;
  isSpecificationsExpanded = false;

  // Lucide icons
  ShoppingCartIcon = ShoppingCart;
  isTechnicalSheetExpanded = true;

  // Image carousel state
  currentImageIndex = 0;

  // Quantity selector
  selectedQuantity = 1;

  products$: Observable<ProductWithPricing[]>;
  loading$: Observable<boolean>;

  // ERP stock information
  erpStock: StockItem[] = [];
  erpStockLoading = false;

  constructor() {
    this.products$ = this.store.select(selectProductsWithPricing);
    this.loading$ = this.store.select(selectProductsLoading);
  }

  ngOnInit(): void {
    // First, get the product ID from route
    const productId = this.route.snapshot.params['id'];
    if (!productId) {
      this.error = 'Product ID not found';
      this.loading = false;
      return;
    }

    // Load user and company info first, then load products
    this.store.select(selectCurrentUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (user) => {
        this.currentUser = user;
        this.isAuthenticated = !!user;

        if (user) {
          // Load company info and wait for it to complete
          await this.loadCompanyInfo(user.id);

          // Now load the product with company pricing if available
          this.loadProduct(productId);
        } else {
          // No user, load product without company pricing
          this.loadProduct(productId);
        }
      });

    // Subscribe to products from store
    this.products$
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(products => {
        if (products && products.length > 0 && productId) {
          const foundProduct = products.find(p => p.id === productId);
          if (foundProduct) {
            this.product = foundProduct;
            this.error = null;
            // Load suggested products
            this.loadSuggestedProducts(foundProduct.id);
            // Load ERP stock
            this.loadErpStock(foundProduct);
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

    // Always load all products first
    this.store.dispatch(ProductsActions.loadProducts({}));

    // If we have company info, load company-specific pricing
    // Use a small delay to ensure company info is fully loaded
    if (this.isCompanyContact && this.company) {
      setTimeout(() => {
        if (this.company) {
          this.store.dispatch(ProductsActions.loadCompanyPricing({ companyId: this.company.id }));
        }
      }, 100);
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
      // Ensure quantity meets minimum order requirement
      const quantity = Math.max(this.selectedQuantity, this.getMinimumOrder(product));

      this.store.dispatch(B2BCartActions.addToB2BCart({
        productId: product.id,
        quantity: quantity,
        companyId: this.company.id
      }));

      // Open cart sidebar after adding
      this.store.dispatch(B2BCartActions.openB2BCartSidebar());

      // Reset quantity to minimum order or 1
      this.selectedQuantity = Math.max(1, this.getMinimumOrder(product));
    }
  }

  increaseQuantity(): void {
    this.selectedQuantity++;
  }

  decreaseQuantity(): void {
    if (this.selectedQuantity > 1) {
      this.selectedQuantity--;
    }
  }

  onQuantityChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value);
    if (!isNaN(value) && value > 0) {
      this.selectedQuantity = value;
    } else {
      this.selectedQuantity = 1;
    }
  }

  requestQuote(product: ProductWithPricing): void {
    this.router.navigate(['/partneri/kontakt'], {
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
      img.src = 'assets/images/product-placeholder.svg';
    }
  }

  onThumbnailImageError(event: Event, index: number): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/images/product-placeholder.svg';
    }
  }

  onSuggestedImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/images/product-placeholder.svg';
    }
  }

  getCurrentImageUrl(): string {
    const images = this.getProductImages();
    if (images.length > 0 && this.currentImageIndex < images.length) {
      return images[this.currentImageIndex];
    }
    return 'assets/images/product-placeholder.svg';
  }

  getProductImages(): string[] {
    if (!this.product) return [];

    const images: string[] = [];

    // Add primary image from image_url if available and not empty
    if (this.product.image_url && this.product.image_url.trim()) {
      images.push(this.product.image_url);
    }

    // Add images from images array
    if (this.product.images && Array.isArray(this.product.images)) {
      this.product.images.forEach(img => {
        if (img.url && img.url.trim() && !images.includes(img.url)) {
          images.push(img.url);
        }
      });
    }

    // Only return images if we found valid ones, otherwise return empty array
    return images;
  }

  hasMultipleImages(): boolean {
    const images = this.getProductImages();
    return images.length > 1;
  }

  getImageCount(): number {
    return this.getProductImages().length;
  }

  previousImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    }
  }

  nextImage(): void {
    const imageCount = this.getImageCount();
    if (this.currentImageIndex < imageCount - 1) {
      this.currentImageIndex++;
    }
  }

  selectImage(index: number): void {
    this.currentImageIndex = index;
  }

  getSuggestedProductImageUrl(product: ProductWithPricing): string {
    // If image_url is available and not empty, use it
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

    // Return placeholder if no valid image available
    return 'assets/images/product-placeholder.svg';
  }

  navigateToLogin(): void {
    this.router.navigate(['/prijava']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/partneri/registracija']);
  }

  toggleDescription(): void {
    this.isDescriptionExpanded = !this.isDescriptionExpanded;
  }

  toggleSpecifications(): void {
    this.isSpecificationsExpanded = !this.isSpecificationsExpanded;
  }

  toggleTechnicalSheet(): void {
    this.isTechnicalSheetExpanded = !this.isTechnicalSheetExpanded;
  }

  private async loadSuggestedProducts(productId: string): Promise<void> {
    try {
      // Reset image carousel when loading new product
      this.currentImageIndex = 0;

      // Load product relationships
      const { data: relationships, error } = await this.supabaseService.client
        .from('product_relationships')
        .select(`
          *,
          related_product_id,
          related_category_id
        `)
        .eq('product_id', productId)
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;

      if (relationships && relationships.length > 0) {
        // Get related product IDs
        const relatedProductIds = relationships
          .filter(r => r.related_product_id)
          .map(r => r.related_product_id);

        // Get products from related categories
        const relatedCategoryIds = relationships
          .filter(r => r.related_category_id)
          .map(r => r.related_category_id);

        // Use the existing products from store and filter
        this.products$
          .pipe(takeUntil(this.destroy$))
          .subscribe(products => {
            this.suggestedProducts = products.filter(p => {
              // Don't suggest the current product
              if (p.id === productId) return false;

              // Include if it's a directly related product
              if (relatedProductIds.includes(p.id)) return true;

              // Include if it's from a related category
              if (relatedCategoryIds.includes(p.category_id)) return true;

              return false;
            }).slice(0, 4); // Limit to 4 suggested products
          });
      } else {
        // If no relationships defined, show products from same category
        if (this.product?.category_id) {
          this.products$
            .pipe(takeUntil(this.destroy$))
            .subscribe(products => {
              this.suggestedProducts = products
                .filter(p => p.id !== productId && p.category_id === this.product?.category_id)
                .slice(0, 4);
            });
        }
      }
    } catch (error) {
      console.error('Error loading suggested products:', error);
      this.suggestedProducts = [];
    }
  }

  navigateToProduct(productId: string): void {
    // Navigate to the new product and reload
    this.router.navigate(['/partneri/proizvodi', productId]).then(() => {
      // Force component reload by scrolling to top
      window.scrollTo(0, 0);
    });
  }

  getFullTechnicalSheetUrl(url: string): string {
    if (!url) return '';
    
    // If URL already has protocol, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If URL starts with www., add https://
    if (url.startsWith('www.')) {
      return `https://${url}`;
    }
    
    // If it doesn't start with www. or protocol, assume it needs https://www.
    if (!url.includes('.')) {
      // If it doesn't contain a dot, it's probably not a valid URL
      return url;
    }
    
    return `https://${url}`;
  }

  navigateToCategory(category: string): void {
    // Navigate to product list with category filter
    // Use the category name to create a slug-like parameter
    const categorySlug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    this.router.navigate(['/partneri/proizvodi'], {
      queryParams: {
        category: categorySlug,
        categories: category // Pass the actual category name for filtering
      }
    });
  }

  /**
   * Load ERP stock information for the current product
   */
  private loadErpStock(product: ProductWithPricing): void {
    if (!product.sku) {
      console.warn('[B2B Product Details] No SKU available for product');
      return;
    }

    this.erpStockLoading = true;
    this.erpService.getStockBySku(product.sku)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.erpStock = response.data;
            console.log('[B2B Product Details] ERP stock loaded:', this.erpStock);
          } else {
            console.warn('[B2B Product Details] Failed to load ERP stock:', response.error);
            this.erpStock = [];
          }
          this.erpStockLoading = false;
        },
        error: (error) => {
          console.error('[B2B Product Details] Error loading ERP stock:', error);
          this.erpStock = [];
          this.erpStockLoading = false;
        }
      });
  }

  /**
   * Get total ERP stock across all units
   */
  getTotalErpStock(): number {
    return this.erpStock.reduce((total, stock) => total + stock.quantity, 0);
  }
} 