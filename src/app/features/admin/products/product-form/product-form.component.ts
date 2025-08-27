import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminFormComponent } from '../../shared/admin-form/admin-form.component';
import { SupabaseService } from '../../../../services/supabase.service';
import { TranslationService } from '../../../../shared/services/translation.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { ToastService } from '../../../../shared/services/toast.service';
import { loadProducts, loadCategories } from '../../../b2b/shared/store/products.actions';
import { selectProducts, selectCategories, selectProductsLoading } from '../../../b2b/shared/store/products.selectors';
import { Product, Category } from '../../../b2b/shared/store/products.actions';


interface ProductRelationship {
  id?: string;
  product_id: string;
  related_product_id?: string;
  related_category_id?: string;
  relationship_type: string;
  sort_order: number;
  is_active: boolean;
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AdminFormComponent, TranslatePipe],
  template: `
    <app-admin-form
      [title]="isEditMode ? translationService.translate('admin.editProduct') : translationService.translate('admin.createProduct')"
      [subtitle]="isEditMode ? translationService.translate('admin.updateProductInformation') : translationService.translate('admin.addNewProductToCatalog')"
      [form]="productForm"
      [isEditMode]="isEditMode"
      [isSubmitting]="isSubmitting"
      [backRoute]="'/admin/proizvodi'"
      (formSubmit)="onSubmit($event)"
    >
      <div [formGroup]="productForm" class="space-y-8">
        <!-- Product Basic Info -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
            </svg>
            {{ 'admin.basicInformation' | translate }}
          </h3>
          
          <!-- Product UUID and Actions (only shown in edit mode) -->
          <div *ngIf="isEditMode && productId" class="mb-6">
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ID (UUID)
              </label>
              <div class="flex items-center mb-3">
                <input
                  type="text"
                  [value]="productId"
                  readonly
                  class="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-600 cursor-not-allowed"
                >
                <button
                  type="button"
                  (click)="copyToClipboard(productId)"
                  class="ml-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm transition-colors"
                  title="Copy UUID">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  </svg>
                </button>
              </div>
              <!-- View as User Link -->
              <div class="flex items-center">
                <a
                  [href]="'/proizvodi/' + productId"
                  target="_blank"
                  class="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm transition-colors"
                  [title]="'admin.viewProduct' | translate">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M7 7h10v10M15 3h6v6m-6 0l6-6"/>
                  </svg>
                  {{ 'adminWishlist.viewProduct' | translate }}
                </a>
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div class="relative">
              <input
                type="text"
                id="name"
                formControlName="name"
                (input)="onNameChange($event)"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="Product Name"
              >
              <label for="name" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.productName' | translate }} *
              </label>
              <div *ngIf="productForm.get('name')?.invalid && productForm.get('name')?.touched" class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                {{ 'admin.productNameRequired' | translate }}
              </div>
            </div>

            <div class="relative">
              <input
                type="text"
                id="slug"
                formControlName="slug"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="URL Slug"
              >
              <label for="slug" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.urlSlug' | translate }} *
              </label>
              <div *ngIf="productForm.get('slug')?.invalid && productForm.get('slug')?.touched" class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                {{ 'admin.urlSlugRequired' | translate }}
              </div>
            </div>
          </div>

          <div class="mt-6">
            <div class="relative">
              <textarea
                id="description"
                formControlName="description"
                rows="4"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent resize-none"
                placeholder="Product Description"
              ></textarea>
              <label for="description" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.productDescription' | translate }}
              </label>
            </div>
          </div>
        </div>

        <!-- Product Details -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            {{ 'admin.productDetails' | translate }}
          </h3>
          
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div class="relative">
              <input
                type="text"
                id="sku"
                formControlName="sku"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="SKU"
              >
              <label for="sku" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.productSKU' | translate }} *
              </label>
              <div *ngIf="productForm.get('sku')?.invalid && productForm.get('sku')?.touched" class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                {{ 'admin.productSKURequired' | translate }}
              </div>
            </div>

            <div class="relative">
              <input
                type="text"
                id="brand"
                formControlName="brand"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="Brand"
              >
              <label for="brand" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.productBrand' | translate }}
              </label>
            </div>

            <div class="relative">
              <input
                type="text"
                id="model"
                formControlName="model"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="Model"
              >
              <label for="model" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.productModel' | translate }}
              </label>
            </div>

            <div class="relative">
              <div class="border-2 border-gray-200 rounded-lg p-3 min-h-[120px] max-h-[240px] overflow-y-auto bg-white">
                <div class="space-y-1">
                  <div *ngFor="let category of organizedCategories" class="space-y-1">
                    <!-- Parent Category -->
                    <div class="flex items-center py-1" [class.border-l-4]="!category.parent_id" [class.border-blue-500]="!category.parent_id" [class.pl-2]="!category.parent_id">
                      <input
                        type="radio"
                        name="category"
                        [id]="'category_' + category.id"
                        [value]="category.id"
                        (change)="onCategorySelectionChange(category.id, $event)"
                        [checked]="selectedCategoryId === category.id"
                        class="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      >
                      <label [for]="'category_' + category.id" [class]="!category.parent_id ? 'ml-2 text-sm font-semibold text-gray-900 cursor-pointer' : 'ml-2 text-sm text-gray-700 cursor-pointer'">
                        <span *ngIf="!category.parent_id" class="inline-flex items-center">
                          <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-9 9a1 1 0 001.414 1.414L2 12.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-4.586l.293.293a1 1 0 001.414-1.414l-9-9z"/>
                          </svg>
                          {{ category.name }}
                        </span>
                        <span *ngIf="category.parent_id" class="inline-flex items-center ml-4">
                          <svg class="w-3 h-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                          </svg>
                          {{ category.name }}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <label class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700">
                {{ 'admin.productCategory' | translate }}
              </label>
              <p class="mt-2 text-xs text-gray-500 flex items-start">
                <svg class="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-9 9a1 1 0 001.414 1.414L2 12.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-4.586l.293.293a1 1 0 001.414-1.414l-9-9z"/>
                </svg>
                <span class="mr-3">{{ 'admin.parentCategories' | translate }}</span>
                <svg class="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
                <span>{{ 'admin.childCategories' | translate }}</span>
              </p>
            </div>
          </div>

          <!-- Specifications -->
          <div class="mt-6">
            <div class="relative">
              <textarea
                id="specifications"
                formControlName="specifications"
                rows="6"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent resize-none"
                placeholder="Frequency: 50Hz&#10;AC Voltage: 230V&#10;Efficiency: 97.6%"
              ></textarea>
              <label for="specifications" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.productSpecifications' | translate }}
              </label>
            </div>
            <p class="mt-3 text-sm text-gray-500 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {{ 'admin.productSpecificationsHelp' | translate }}
            </p>
          </div>

          <!-- Features -->
          <div class="mt-6">
            <div class="relative">
              <textarea
                id="features"
                formControlName="features"
                rows="6"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent resize-none"
                placeholder="Dual MPPT trackers&#10;WiFi monitoring&#10;Fanless design&#10;Compact size&#10;Easy installation"
              ></textarea>
              <label for="features" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.productFeatures' | translate }}
              </label>
            </div>
            <p class="mt-3 text-sm text-gray-500 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {{ 'admin.productFeaturesHelp' | translate }}
            </p>
          </div>

          <!-- Certifications -->
          <div class="mt-6">
            <div class="relative">
              <textarea
                id="certifications"
                formControlName="certifications"
                rows="4"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent resize-none"
                placeholder="CE Certification&#10;RoHS Compliance&#10;ISO 9001&#10;IEC 61215"
              ></textarea>
              <label for="certifications" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.productCertifications' | translate }}
              </label>
            </div>
            <p class="mt-3 text-sm text-gray-500 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {{ 'admin.productCertificationsHelp' | translate }}
            </p>
          </div>
        </div>

        <!-- Pricing -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
            </svg>
            {{ 'admin.productPricing' | translate }}
          </h3>
          
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span class="text-gray-500 text-lg">€</span>
              </div>
              <input
                type="number"
                id="price"
                formControlName="price"
                step="0.01"
                min="0"
                class="peer w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="0.00"
              >
              <label for="price" class="absolute left-10 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.productPrice' | translate }} *
              </label>
              <div *ngIf="productForm.get('price')?.invalid && productForm.get('price')?.touched" class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                {{ 'admin.productPriceRequired' | translate }}
              </div>
            </div>

            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span class="text-gray-500 text-lg">€</span>
              </div>
              <input
                type="number"
                id="compare_at_price"
                formControlName="compare_at_price"
                step="0.01"
                min="0"
                class="peer w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="0.00"
              >
              <label for="compare_at_price" class="absolute left-10 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.productCompareAtPrice' | translate }}
              </label>
            </div>
          </div>
        </div>

        <!-- Inventory -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
            {{ 'admin.productInventoryAndShipping' | translate }}
          </h3>
          
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div class="relative">
              <input
                type="number"
                id="stock_quantity"
                formControlName="stock_quantity"
                min="0"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="0"
              >
              <label for="stock_quantity" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.productStockQuantity' | translate }} *
              </label>
              <div *ngIf="productForm.get('stock_quantity')?.invalid && productForm.get('stock_quantity')?.touched" class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                {{ 'admin.productStockQuantityRequired' | translate }}
              </div>
            </div>

            <div class="relative">
              <input
                type="number"
                id="weight"
                formControlName="weight"
                step="0.1"
                min="0"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="0.0"
              >
              <label for="weight" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.productWeight' | translate }} (kg)
              </label>
            </div>

            <div class="relative">
              <input
                type="text"
                id="dimensions"
                formControlName="dimensions"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="100x50x20cm"
              >
              <label for="dimensions" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.productDimensions' | translate }}
              </label>
            </div>
            <p class="mt-3 text-sm text-gray-500 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {{ 'admin.productDimensionsHelp' | translate }}
            </p>
          </div>
        </div>

        <!-- Product Status -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {{ 'admin.productStatus' | translate }}
          </h3>
          
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label class="relative flex items-center p-4 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-300 transition-colors duration-200">
              <input
                id="is_active"
                type="checkbox"
                formControlName="is_active"
                class="sr-only"
              >
              <span class="flex items-center">
                <span class="flex-shrink-0 w-5 h-5 border-2 border-gray-300 rounded mr-3 transition-colors duration-200" 
                      [class.bg-blue-600]="productForm.get('is_active')?.value"
                      [class.border-blue-600]="productForm.get('is_active')?.value">
                  <svg *ngIf="productForm.get('is_active')?.value" class="w-3 h-3 text-white mx-auto mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                </span>
                <span class="text-sm font-medium text-gray-700">{{ 'admin.active' | translate }}</span>
              </span>
            </label>

            <label class="relative flex items-center p-4 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-300 transition-colors duration-200">
              <input
                id="is_featured"
                type="checkbox"
                formControlName="is_featured"
                class="sr-only"
              >
              <span class="flex items-center">
                <span class="flex-shrink-0 w-5 h-5 border-2 border-gray-300 rounded mr-3 transition-colors duration-200" 
                      [class.bg-blue-600]="productForm.get('is_featured')?.value"
                      [class.border-blue-600]="productForm.get('is_featured')?.value">
                  <svg *ngIf="productForm.get('is_featured')?.value" class="w-3 h-3 text-white mx-auto mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                </span>
                <span class="text-sm font-medium text-gray-700">{{ 'admin.featured' | translate }}</span>
              </span>
            </label>

            <label class="relative flex items-center p-4 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-300 transition-colors duration-200">
              <input
                id="is_on_sale"
                type="checkbox"
                formControlName="is_on_sale"
                class="sr-only"
              >
              <span class="flex items-center">
                <span class="flex-shrink-0 w-5 h-5 border-2 border-gray-300 rounded mr-3 transition-colors duration-200" 
                      [class.bg-blue-600]="productForm.get('is_on_sale')?.value"
                      [class.border-blue-600]="productForm.get('is_on_sale')?.value">
                  <svg *ngIf="productForm.get('is_on_sale')?.value" class="w-3 h-3 text-white mx-auto mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                </span>
                <span class="text-sm font-medium text-gray-700">{{ 'admin.onSale' | translate }}</span>
              </span>
            </label>
          </div>
        </div>

        <!-- Images -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            {{ 'admin.productImages' | translate }}
          </h3>
          
          <div class="relative">
            <textarea
              id="images"
              formControlName="images"
              rows="3"
              class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent resize-none"
              placeholder="Image URLs"
            ></textarea>
            <label for="images" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
              {{ 'admin.productImages' | translate }}
            </label>
            <p class="mt-3 text-sm text-gray-500 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {{ 'admin.productEnterOneImageUrlPerLine' | translate }}
            </p>
          </div>
        </div>

        <!-- Product Relationships -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
            </svg>
            {{ 'admin.productRelationshipsTitle' | translate }}
          </h3>
          
          <!-- Add Relationship Form -->
          <div class="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 class="text-sm font-medium text-gray-900 mb-4">{{ 'admin.productRelationshipsAddNew' | translate }}</h4>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'admin.productRelationshipsType' | translate }}</label>
                <select
                  [(ngModel)]="newRelationship.relationship_type"
                  [ngModelOptions]="{standalone: true}"
                  (ngModelChange)="onRelationshipTypeChange($event)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="suggested">{{ 'admin.productRelationshipsSuggested' | translate }}</option>
                  <option value="complementary">{{ 'admin.productRelationshipsComplementary' | translate }}</option>
                  <option value="alternative">{{ 'admin.productRelationshipsAlternative' | translate }}</option>
                  <option value="bundle">{{ 'admin.productRelationshipsBundle' | translate }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'admin.productRelationshipsRelatedProduct' | translate }}</label>
                <select
                  [(ngModel)]="newRelationship.related_product_id"
                  [ngModelOptions]="{standalone: true}"
                  (ngModelChange)="onRelatedProductChange($event)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{{ 'admin.offersForm.selectProduct' | translate }}</option>
                  <option *ngFor="let product of availableProducts" [value]="product.id">
                    {{ product.name }} ({{ product.sku }})
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'admin.productRelationshipsRelatedCategory' | translate }}</label>
                <select
                  [(ngModel)]="newRelationship.related_category_id"
                  [ngModelOptions]="{standalone: true}"
                  (ngModelChange)="onRelatedCategoryChange($event)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{{ 'admin.selectCategory' | translate }}</option>
                  <option *ngFor="let category of categories" [value]="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'admin.productRelationshipsSortOrder' | translate }}</label>
                <input
                  type="number"
                  [(ngModel)]="newRelationship.sort_order"
                  [ngModelOptions]="{standalone: true}"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                >
              </div>
            </div>
            <div class="mt-4 flex justify-end">
              <button
                type="button"
                (click)="addRelationship()"
                [disabled]="!canAddRelationship()"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                [title]="!canAddRelationship() ? 'Please select a relationship type and either a product or category' : ''"
              >
                {{ 'admin.productRelationshipsAddNew' | translate }}
              </button>
            </div>
          </div>

          <!-- Existing Relationships -->
          <div *ngIf="relationships.length > 0">
            <h4 class="text-sm font-medium text-gray-900 mb-4">{{ 'admin.productRelationshipsExistingRelationships' | translate }}</h4>
            <div class="space-y-3">
              <div 
                *ngFor="let relationship of relationships; trackBy: trackByRelationshipId"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center space-x-3">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [class.bg-blue-100]="relationship.relationship_type === 'suggested'"
                        [class.text-blue-800]="relationship.relationship_type === 'suggested'"
                        [class.bg-green-100]="relationship.relationship_type === 'complementary'"
                        [class.text-green-800]="relationship.relationship_type === 'complementary'"
                        [class.bg-yellow-100]="relationship.relationship_type === 'alternative'"
                        [class.text-yellow-800]="relationship.relationship_type === 'alternative'"
                        [class.bg-purple-100]="relationship.relationship_type === 'bundle'"
                        [class.text-purple-800]="relationship.relationship_type === 'bundle'">
                    {{ getRelationshipTypeLabel(relationship.relationship_type) }}
                  </span>
                  <div class="text-sm text-gray-900">
                    <span *ngIf="relationship.related_product_id">
                      {{ 'admin.reviewsForm.reviewProduct' | translate }}: {{ getProductName(relationship.related_product_id) }}
                    </span>
                    <span *ngIf="relationship.related_category_id">
                      {{ 'admin.category' | translate }}: {{ getCategoryName(relationship.related_category_id) }}
                    </span>
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ 'admin.productRelationshipsSortOrder' | translate }}: {{ relationship.sort_order }}
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <button
                    type="button"
                    (click)="toggleRelationshipStatus(relationship)"
                    [class.bg-green-100]="relationship.is_active"
                    [class.text-green-800]="relationship.is_active"
                    [class.bg-red-100]="!relationship.is_active"
                    [class.text-red-800]="!relationship.is_active"
                    class="px-2 py-1 text-xs font-medium rounded-md transition-colors"
                  >
                    {{ relationship.is_active ? ('admin.active' | translate) : ('admin.inactive' | translate) }}
                  </button>
                  <button
                    type="button"
                    (click)="removeRelationship(relationship)"
                    class="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- No Relationships Message -->
          <div *ngIf="relationships.length === 0" class="text-center py-8">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">{{ 'admin.productRelationshipsNoRelationships' | translate }}</h3>
            <p class="mt-1 text-sm text-gray-500">{{ 'admin.productRelationshipsNoRelationshipsDescription' | translate }}</p>
          </div>
        </div>
      </div>
    </app-admin-form>
  `
})
export class ProductFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private supabaseService = inject(SupabaseService);
  private title = inject(Title);
  private store = inject(Store);
  private toastService = inject(ToastService);
  private destroy$ = new Subject<void>();
  translationService = inject(TranslationService);

  productForm!: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  productId: string | null = null;
  categories$: Observable<Category[]>;
  products$: Observable<Product[]>;
  loading$: Observable<boolean>;
  categories: Category[] = [];
  organizedCategories: Category[] = [];
  products: Product[] = [];
  relationships: ProductRelationship[] = [];
  availableProducts: Product[] = [];
  selectedCategoryId: string | null = null;
  newRelationship: Partial<ProductRelationship> = {
    relationship_type: 'suggested',
    related_product_id: undefined,
    related_category_id: undefined,
    sort_order: 0,
    is_active: true
  };

  constructor() {
    this.initForm();
    this.categories$ = this.store.select(selectCategories);
    this.products$ = this.store.select(selectProducts);
    this.loading$ = this.store.select(selectProductsLoading);
  }

  ngOnInit(): void {
    this.loadCategoriesAndProducts();
    this.checkEditMode();
    this.subscribeToStoreData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      slug: ['', [Validators.required]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0.01)]],
      compare_at_price: [''],
      sku: ['', [Validators.required]],
      brand: [''],
      model: [''],
      category_id: [''],
      images: [''],
      stock_quantity: [0, [Validators.required, Validators.min(0)]],
      weight: [null],
      dimensions: [''],
      is_active: [true],
      is_featured: [false],
      is_on_sale: [false],
      specifications: [''],
      features: [''],
      certifications: ['']
    });
  }

  private loadCategoriesAndProducts(): void {
    this.store.dispatch(loadCategories());
    this.store.dispatch(loadProducts({}));
  }

  private subscribeToStoreData(): void {
    this.categories$.pipe(takeUntil(this.destroy$)).subscribe(categories => {
      this.categories = categories;
      this.organizeCategories();
    });

    this.products$.pipe(takeUntil(this.destroy$)).subscribe(products => {
      this.products = products;
      this.updateAvailableProducts();
    });
  }

  private organizeCategories(): void {
    // Organize categories hierarchically: parent categories first, then their children
    const parentCategories = this.categories.filter(cat => !cat.parent_id);
    const childCategories = this.categories.filter(cat => cat.parent_id);
    
    this.organizedCategories = [];
    
    // Add each parent category followed by its children
    parentCategories.forEach(parent => {
      this.organizedCategories.push(parent);
      const children = childCategories.filter(child => child.parent_id === parent.id);
      this.organizedCategories.push(...children);
    });
    
    // Add any orphaned child categories at the end
    const parentIds = parentCategories.map(p => p.id);
    const orphanedChildren = childCategories.filter(child => !parentIds.includes(child.parent_id || ''));
    this.organizedCategories.push(...orphanedChildren);
  }

  private checkEditMode(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.isEditMode = true;
      this.loadProduct();
      this.loadProductRelationships();
    }
    // Set title after determining edit mode
    this.title.setTitle(this.isEditMode ? 'Edit Product - Solar Shop Admin' : 'Create Product - Solar Shop Admin');
  }

  private async loadProduct(): Promise<void> {
    if (!this.productId) return;

    try {
      const data = await this.supabaseService.getTableById('products', this.productId);

      if (data) {
        // Map database fields to form fields
        const productName = data.name || '';
        const formData = {
          name: productName,
          slug: (data as any).slug || this.generateSlug(productName),
          description: data.description || '',
          price: Number(data.price) || 0,
          compare_at_price: (data as any).compare_at_price || data.original_price || '',
          sku: data.sku || '',
          brand: data.brand || '',
          model: data.model || '',
          category_id: data.category_id || '',
          stock_quantity: Number(data.stock_quantity) || 0,
          weight: data.weight ? Number(data.weight) : null,
          dimensions: data.dimensions || '',
          is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
          is_featured: data.is_featured !== undefined ? Boolean(data.is_featured) : false,
          is_on_sale: data.is_on_sale !== undefined ? Boolean(data.is_on_sale) : false,
          images: this.formatImages(data),
          specifications: this.formatSpecifications(data.specifications),
          features: this.formatFeatures(data.features),
          certifications: this.formatCertifications(data.certifications)
        };

        this.productForm.patchValue(formData);
        this.loadProductCategories();
        this.updateAvailableProducts();
      }
    } catch (error) {
      console.error('Error loading product:', error);
    }
  }

  private formatImages(data: any): string {
    // Handle JSONB images array format from database
    if (data.images && Array.isArray(data.images)) {
      return data.images.map((img: any) => img.url || img).join('\n');
    } else if (typeof data.images === 'string') {
      return data.images;
    }
    return '';
  }

  private formatSpecifications(specifications: any): string {
    if (!specifications) {
      return '';
    }

    try {
      // If it's already a string, return it
      if (typeof specifications === 'string') {
        return specifications;
      }

      // If it's an object, convert to line-separated format
      if (typeof specifications === 'object') {
        return Object.entries(specifications)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');
      }

      return '';
    } catch (error) {
      console.error('Error formatting specifications:', error);
      return '';
    }
  }

  private formatFeatures(features: any): string {
    if (!features) {
      return '';
    }

    try {
      // If it's already a string, return it
      if (typeof features === 'string') {
        return features;
      }

      // If it's an array, join with newlines
      if (Array.isArray(features)) {
        return features.join('\n');
      }

      return '';
    } catch (error) {
      console.error('Error formatting features:', error);
      return '';
    }
  }

  private formatCertifications(certifications: any): string {
    if (!certifications) {
      return '';
    }

    try {
      // If it's already a string, return it
      if (typeof certifications === 'string') {
        return certifications;
      }

      // If it's an array, join with newlines
      if (Array.isArray(certifications)) {
        return certifications.join('\n');
      }

      return '';
    } catch (error) {
      console.error('Error formatting certifications:', error);
      return '';
    }
  }

  onNameChange(event: any): void {
    const name = event.target.value;
    const slug = this.generateSlug(name);
    this.productForm.patchValue({ slug });
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  async onSubmit(formValue: any): Promise<void> {
    if (this.productForm.invalid) return;

    this.isSubmitting = true;

    try {
      // Process images - convert from text input to JSONB array format
      const imageUrls = formValue.images ? formValue.images.split('\n').filter((url: string) => url.trim()) : [];
      const imagesArray = imageUrls.map((url: string, index: number) => ({
        url: url.trim(),
        alt: `${formValue.name} - Image ${index + 1}`,
        is_primary: index === 0,
        order: index,
        type: index === 0 ? 'main' : 'gallery'
      }));

      // Parse specifications line-separated format to object
      let specificationsObj: { [key: string]: string } = {};
      if (formValue.specifications && formValue.specifications.trim()) {
        try {
          const specs = formValue.specifications.trim().split('\n');
          specs.forEach((spec: string) => {
            const [key, ...valueParts] = spec.split(':');
            if (key && valueParts.length > 0) {
              const value = valueParts.join(':').trim();
              if (value) {
                specificationsObj[key.trim()] = value;
              }
            }
          });
        } catch (error) {
          console.error('Error parsing specifications:', error);
          // Continue with empty specifications if parsing fails
        }
      }

      // Parse features string to array
      let featuresArray: string[] = [];
      if (formValue.features && formValue.features.trim()) {
        featuresArray = formValue.features.split('\n')
          .map((feature: string) => feature.trim())
          .filter((feature: string) => feature.length > 0);
      }

      // Parse certifications string to array
      let certificationsArray: string[] = [];
      if (formValue.certifications && formValue.certifications.trim()) {
        certificationsArray = formValue.certifications.split('\n')
          .map((certification: string) => certification.trim())
          .filter((certification: string) => certification.length > 0);
      }

      // Map form fields to database fields
      const productData: any = {
        name: formValue.name,
        slug: formValue.slug,
        description: formValue.description,
        short_description: formValue.description, // Use description as short_description if not provided
        price: Number(formValue.price),
        currency: 'EUR', // Default currency
        sku: formValue.sku,
        brand: formValue.brand,
        model: formValue.model,
        category_id: formValue.category_id || null,
        stock_quantity: Number(formValue.stock_quantity),
        weight: formValue.weight ? Number(formValue.weight) : undefined,
        dimensions: formValue.dimensions || '',
        is_active: Boolean(formValue.is_active),
        is_featured: Boolean(formValue.is_featured),
        is_on_sale: Boolean(formValue.is_on_sale),
        images: imagesArray, // Use JSONB array format
        specifications: specificationsObj,
        features: featuresArray,
        certifications: certificationsArray,
        tags: [], // Default empty tags
        stock_status: Number(formValue.stock_quantity) > 0 ? 'in_stock' as const : 'out_of_stock' as const,
        updated_at: new Date().toISOString()
      };

      // Explicitly handle original_price to ensure it's always included in the payload
      if (formValue.compare_at_price && formValue.compare_at_price !== '' && formValue.compare_at_price !== null) {
        productData.original_price = Number(formValue.compare_at_price);
      } else {
        productData.original_price = null; // Explicitly set to null to clear the field
      }

      let savedProductId: string;
      if (this.isEditMode && this.productId) {
        await this.supabaseService.updateRecord('products', this.productId, productData);
        savedProductId = this.productId;
      } else {
        (productData as any).created_at = new Date().toISOString();
        const result = await this.supabaseService.createRecord('products', productData);
        if (!result) {
          throw new Error('Failed to create product - no result returned');
        }
        savedProductId = result.id;
      }

      // Save product categories
      await this.saveProductCategories(savedProductId);

      this.router.navigate(['/admin/proizvodi']);
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  // Product Relationships Methods
  private async loadProductRelationships(): Promise<void> {
    if (!this.productId) return;

    try {
      const { data, error } = await this.supabaseService.client
        .from('product_relationships')
        .select('*')
        .eq('product_id', this.productId)
        .order('sort_order');

      if (error) {
        console.error('Error loading product relationships:', error);
        this.relationships = [];
        return;
      }

      this.relationships = data || [];
    } catch (error) {
      console.error('Error loading product relationships:', error);
      this.relationships = [];
    }
  }

  private updateAvailableProducts(): void {
    // Filter out the current product and already related products
    const relatedProductIds = this.relationships
      .filter(r => r.related_product_id)
      .map(r => r.related_product_id);

    this.availableProducts = this.products.filter(product =>
      product.id !== this.productId &&
      !relatedProductIds.includes(product.id)
    );
  }

  onRelationshipTypeChange(type: string): void {
    this.newRelationship.relationship_type = type;
  }

  onRelatedProductChange(productId: string): void {
    // Convert empty string to undefined
    this.newRelationship.related_product_id = productId || undefined;
    // Clear the other selection if this one has a value
    if (productId) {
      this.newRelationship.related_category_id = undefined;
    }
  }

  onRelatedCategoryChange(categoryId: string): void {
    // Convert empty string to undefined
    this.newRelationship.related_category_id = categoryId || undefined;
    // Clear the other selection if this one has a value
    if (categoryId) {
      this.newRelationship.related_product_id = undefined;
    }
  }

  canAddRelationship(): boolean {
    const hasType = !!this.newRelationship.relationship_type;
    const hasRelatedProduct = !!this.newRelationship.related_product_id;
    const hasRelatedCategory = !!this.newRelationship.related_category_id;
    const hasRelation = hasRelatedProduct || hasRelatedCategory;

    return hasType && hasRelation;
  }

  async addRelationship(): Promise<void> {
    if (!this.canAddRelationship() || !this.productId) return;

    try {
      const relationshipData = {
        product_id: this.productId,
        related_product_id: this.newRelationship.related_product_id || null,
        related_category_id: this.newRelationship.related_category_id || null,
        relationship_type: this.newRelationship.relationship_type || 'suggested',
        sort_order: this.newRelationship.sort_order || 0,
        is_active: true
      };

      const { error } = await this.supabaseService.client
        .from('product_relationships')
        .insert(relationshipData);

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to create relationship: ${error.message}`);
      }

      // Create bidirectional relationship if it's a product relationship
      if (this.newRelationship.related_product_id) {
        const reverseRelationshipData = {
          product_id: this.newRelationship.related_product_id,
          related_product_id: this.productId,
          related_category_id: null,
          relationship_type: this.newRelationship.relationship_type || 'suggested',
          sort_order: this.newRelationship.sort_order || 0,
          is_active: true
        };

        const { error: reverseError } = await this.supabaseService.client
          .from('product_relationships')
          .insert(reverseRelationshipData);

        if (reverseError) {
          console.error('Database error creating reverse relationship:', reverseError);
          // Don't throw here, the main relationship was already created successfully
        }
      }

      // Reset form and reload relationships
      this.newRelationship = {
        relationship_type: 'suggested',
        related_product_id: undefined,
        related_category_id: undefined,
        sort_order: 0,
        is_active: true
      };

      await this.loadProductRelationships();
      this.updateAvailableProducts();

      // Show success message
      this.toastService.showSuccess('Product relationship added successfully!');
    } catch (error: any) {
      console.error('Error adding relationship:', error);

      // Check if it's an RLS policy error
      if (error.message && error.message.includes('row-level security policy')) {
        this.toastService.showError('Permission denied: You may not have sufficient privileges to add product relationships. Please contact your administrator.');
      } else {
        this.toastService.showError(`Error adding relationship: ${error.message || 'Please try again.'}`);
      }
    }
  }

  async removeRelationship(relationship: ProductRelationship): Promise<void> {
    if (!relationship.id) return;

    try {
      const { error } = await this.supabaseService.client
        .from('product_relationships')
        .delete()
        .eq('id', relationship.id);

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to delete relationship: ${error.message}`);
      }

      await this.loadProductRelationships();
      this.updateAvailableProducts();

      // Show success message
      this.toastService.showSuccess('Product relationship removed successfully!');
    } catch (error: any) {
      console.error('Error removing relationship:', error);
      this.toastService.showError(`Error removing relationship: ${error.message || 'Please try again.'}`);
    }
  }

  async toggleRelationshipStatus(relationship: ProductRelationship): Promise<void> {
    if (!relationship.id) return;

    try {
      const { error } = await this.supabaseService.client
        .from('product_relationships')
        .update({ is_active: !relationship.is_active })
        .eq('id', relationship.id);

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to update relationship: ${error.message}`);
      }

      await this.loadProductRelationships();

      // Show success message
      const statusText = relationship.is_active ? 'deactivated' : 'activated';
      this.toastService.showSuccess(`Product relationship ${statusText} successfully!`);
    } catch (error: any) {
      console.error('Error toggling relationship status:', error);
      this.toastService.showError(`Error updating relationship status: ${error.message || 'Please try again.'}`);
    }
  }

  getRelationshipTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      suggested: this.translationService.translate('admin.productRelationshipsSuggested'),
      complementary: this.translationService.translate('admin.productRelationshipsComplementary'),
      alternative: this.translationService.translate('admin.productRelationshipsAlternative'),
      bundle: this.translationService.translate('admin.productRelationshipsBundle')
    };
    return labels[type] || type;
  }

  getProductName(productId: string): string {
    const product = this.products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown Category';
  }

  trackByRelationshipId(index: number, relationship: ProductRelationship): string {
    return relationship.id || index.toString();
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // You could show a toast notification here if you have one
      console.log('UUID copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy UUID: ', err);
    });
  }

  // Category selection methods
  onCategorySelectionChange(categoryId: string, event: any): void {
    const isChecked = event.target.checked;
    
    if (isChecked) {
      this.selectedCategoryId = categoryId;
      // Update form control
      this.productForm.patchValue({ category_id: categoryId });
    }
  }


  private async loadProductCategories(): Promise<void> {
    if (!this.productId) return;

    try {
      // Since we're using single category now, get it directly from the product record
      const productData = await this.supabaseService.getTableById('products', this.productId);
      
      if (productData && productData.category_id) {
        this.selectedCategoryId = productData.category_id;
        this.productForm.patchValue({
          category_id: this.selectedCategoryId
        });
      }
    } catch (error) {
      console.error('Error loading product category:', error);
    }
  }

  private async saveProductCategories(productId: string): Promise<void> {
    // Since we're using single category stored directly in the product record,
    // we don't need to manage the product_categories table anymore.
    // The category_id is already saved in the main product record.
  }
}