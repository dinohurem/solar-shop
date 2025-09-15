import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AdminFormComponent } from '../../shared/admin-form/admin-form.component';
import { SupabaseService } from '../../../../services/supabase.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../shared/services/translation.service';

@Component({
  selector: 'app-offer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminFormComponent, TranslatePipe],
  template: `
    <app-admin-form
      [title]="isEditMode ? translationService.translate('admin.offersForm.editOffer') : translationService.translate('admin.offersForm.createOffer')"
      [subtitle]="isEditMode ? translationService.translate('admin.offersForm.updateOfferInformation') : translationService.translate('admin.offersForm.createNewOffer')"
      [form]="offerForm"
      [isEditMode]="isEditMode"
      [isSubmitting]="isSubmitting"
      [backRoute]="'/admin/ponude'"
      (formSubmit)="onSubmit($event)"
    >
      <div [formGroup]="offerForm" class="space-y-8">
        <!-- Basic Info -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
            </svg>
            {{ 'admin.basicInformation' | translate }}
          </h3>
          
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div class="relative">
            <input
              type="text"
              id="title"
              formControlName="title"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="Offer Title"
              >
              <label for="title" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.offersForm.offerTitle' | translate }} *
              </label>
              <div *ngIf="offerForm.get('title')?.invalid && offerForm.get('title')?.touched" class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
              {{ 'admin.offersForm.offerTitleRequired' | translate }}
            </div>
          </div>

          <!-- Coupon Code -->
          <div class="relative">
            <input
              type="text"
              id="code"
              formControlName="code"
              class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
              placeholder="Coupon Code"
            >
              <label for="code" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.offersForm.couponCode' | translate }}
              </label>
              <div *ngIf="offerForm.get('code')?.invalid && offerForm.get('code')?.touched" class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
              {{ 'admin.offersForm.couponCodeRequired' | translate }}
            </div>
            </div>
        </div>

          <div class="mt-6">
            <div class="relative">
          <textarea
            id="description"
            formControlName="description"
            rows="3"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent resize-none"
                placeholder="Offer Description"
          ></textarea>
              <label for="description" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.offersForm.description' | translate }}
              </label>
            </div>
          </div>

          <!-- Offer Image -->
          <div class="mt-6">
            <div class="relative">
              <input
                type="text"
                id="image_url"
                formControlName="image_url"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="Image URL"
              >
              <label for="image_url" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.common.image' | translate }}
              </label>
              <p class="mt-3 text-sm text-gray-500 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                  {{ 'admin.common.imageUrl' | translate }}
              </p>
            </div>
          </div>
        </div>

        <!-- Discount Details -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
            </svg>
            {{ 'admin.offersForm.discountConfiguration' | translate }}
          </h3>
          
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div class="relative">
            <select
              id="discount_type"
              formControlName="discount_type"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 bg-white"
            >
              <option value="">{{ 'admin.offersForm.selectDiscountType' | translate }}</option>
              <option value="percentage">{{ 'admin.offersForm.percentageDiscount' | translate }}</option>
              <option value="fixed_amount">{{ 'admin.offersForm.fixedAmount' | translate }}</option>
            </select>
              <label class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700">
                {{ 'admin.offersForm.discountType' | translate }} *
              </label>
              <div *ngIf="offerForm.get('discount_type')?.invalid && offerForm.get('discount_type')?.touched" class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
              {{ 'admin.offersForm.discountTypeRequired' | translate }}
            </div>
          </div>

            <div class="relative">
            <input
              type="number"
              id="discount_value"
              formControlName="discount_value"
              step="0.01"
              min="0"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
              [placeholder]="offerForm.get('discount_type')?.value === 'percentage' ? '10' : '50.00'"
            >
              <label for="discount_value" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.offersForm.discountValue' | translate }} *
              </label>
              <div *ngIf="offerForm.get('discount_value')?.invalid && offerForm.get('discount_value')?.touched" class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
              {{ 'admin.offersForm.discountValueRequired' | translate }}
            </div>
          </div>

            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span class="text-gray-500 text-lg">€</span>
              </div>
            <input
              type="number"
              id="min_order_amount"
              formControlName="min_order_amount"
              step="0.01"
              min="0"
                class="peer w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
              placeholder="0.00"
            >
              <label for="min_order_amount" class="absolute left-10 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.offersForm.minimumPurchase' | translate }} (€)
              </label>
            </div>
          </div>
          
          <!-- Apply Global Discount Button -->
          <div *ngIf="productsArray.length > 0 && offerForm.get('discount_type')?.value && offerForm.get('discount_value')?.value > 0" class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-sm font-medium text-blue-900">{{ 'admin.offersForm.globalDiscount' | translate }}</h4>
                <p class="text-sm text-blue-700" *ngIf="offerForm.get('discount_type')?.value === 'percentage'">{{ 'admin.offersForm.applyGlobalDiscountToAll' | translate: { discount: offerForm.get('discount_value')?.value } }}</p>
                <p class="text-sm text-blue-700" *ngIf="offerForm.get('discount_type')?.value === 'fixed_amount'">Distribute €{{ offerForm.get('discount_value')?.value }} discount across all products</p>
              </div>
              <button
                type="button"
                (click)="applyGlobalDiscountToProducts()"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                <span *ngIf="offerForm.get('discount_type')?.value === 'percentage'">{{ 'admin.offersForm.applyToAllProducts' | translate }}</span>
                <span *ngIf="offerForm.get('discount_type')?.value === 'fixed_amount'">Distribute Discount</span>
              </button>
            </div>

            <!-- Warning for fixed amount -->
            <div *ngIf="offerForm.get('discount_type')?.value === 'fixed_amount'" class="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <p class="text-xs text-yellow-800 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                </svg>
                Total product discounts cannot exceed €{{ offerForm.get('discount_value')?.value }}
              </p>
            </div>
          </div>
        </div>

        <!-- Category Selection -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
            {{ 'admin.offersForm.categoryProductsSelection' | translate }}
          </h3>
          
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div class="relative">
              <select
                id="category_id"
                formControlName="category_id"
                (change)="onCategoryChange($any($event.target).value)"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 bg-white"
                [disabled]="isLoadingCategories"
              >
                <option value="">{{ 'admin.offersForm.selectCategory' | translate }}</option>
                <option *ngFor="let category of categories" [value]="category.id">
                  {{ category.name }}
                </option>
              </select>
              <label class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700">
                {{ 'admin.offersForm.selectCategory' | translate }}
              </label>
              
              <!-- Loading indicator -->
              <div *ngIf="isLoadingCategories" class="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
              
              <!-- Tooltip -->
              <div class="mt-2 text-sm text-gray-500 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {{ 'admin.offersForm.categoryTooltip' | translate }}
              </div>
            </div>

            <div class="relative">
              <label class="relative flex items-center p-4 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-300 transition-colors duration-200 w-full">
                <input
                  type="checkbox"
                  formControlName="apply_to_category"
                  (change)="onApplyToCategoryChange($any($event.target).checked)"
                  class="sr-only"
                  [disabled]="!selectedCategory"
                >
                <span class="flex items-center">
                  <span class="flex-shrink-0 w-5 h-5 border-2 border-gray-300 rounded mr-3 transition-colors duration-200" 
                        [class.bg-blue-600]="offerForm.get('apply_to_category')?.value"
                        [class.border-blue-600]="offerForm.get('apply_to_category')?.value">
                    <svg *ngIf="offerForm.get('apply_to_category')?.value" class="w-3 h-3 text-white mx-auto mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </span>
                  <span class="text-sm font-medium text-gray-700">{{ 'admin.offersForm.applyToCategory' | translate }}</span>
                </span>
              </label>
              
              <!-- Tooltip -->
              <div class="mt-2 text-sm text-gray-500 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {{ 'admin.offersForm.applyToCategoryTooltip' | translate }}
              </div>
            </div>
          </div>

          <!-- Category Products Info -->
          <div *ngIf="selectedCategory && categoryProducts.length > 0" class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-sm font-medium text-blue-900">{{ 'admin.offersForm.productsInCategory' | translate }}</h4>
                <p class="text-sm text-blue-700">{{ 'admin.offersForm.categoryProductsCount' | translate: { count: categoryProducts.length } }}</p>
              </div>
              
              <button
                type="button"
                (click)="applyDiscountToCategory()"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                <span>{{ 'admin.offersForm.addProductsFromCategory' | translate }}</span>
              </button>
            </div>
            
            <!-- Loading indicator for products -->
            <div *ngIf="isLoadingProducts" class="mt-4 flex justify-center">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>

            <!-- Products Management -->
            <!-- <div *ngIf="!isLoadingProducts && categoryProducts.length > 0" class="mt-4">
              <h5 class="text-sm font-medium text-blue-900 mb-3">{{ 'admin.offersForm.selectProductsFromCategory' | translate }}</h5>
              <div class="space-y-2 max-h-60 overflow-y-auto">
                <div *ngFor="let product of categoryProducts; let i = index" 
                     class="bg-white rounded-lg p-3 border border-blue-100 hover:border-blue-300 transition-colors duration-200">
                  <div class="grid grid-cols-1 lg:grid-cols-4 gap-3 items-center">
                    <div class="lg:col-span-2">
                      <p class="font-medium text-gray-900">{{ product.name }}</p>
                      <p class="text-sm text-gray-500">SKU: {{ product.sku || 'N/A' }}</p>
                    </div>
                    
                    <div class="text-center">
                      <p class="text-sm font-medium text-gray-700">{{ 'admin.originalPrice' | translate }}</p>
                      <p class="text-lg font-semibold text-gray-900">€{{ product.price | number:'1.2-2' }}</p>
                    </div>
                    
                    <div class="text-center">
                      <button 
                        type="button"
                        (click)="addProductToOffer(product)"
                        class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors duration-200">
                        {{ 'admin.addProduct' | translate }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div> -->
          </div>
        </div>

        <!-- Products Management -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900 flex items-center">
              <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
              {{ 'admin.productsInOffer' | translate }}
            </h3>
            <button 
              type="button"
              (click)="addProduct()"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              <span>{{ 'admin.addProduct' | translate }}</span>
            </button>
          </div>

          <div formArrayName="products" class="space-y-4" *ngIf="productsArray.length > 0; else noProducts">
            <div *ngFor="let product of productsArray.controls; let i = index" [formGroupName]="i"
                 class="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors duration-200">
              <div class="grid grid-cols-1 lg:grid-cols-7 gap-4 items-end">
                <div class="relative">
                  <select
                    formControlName="id"
                    (change)="onProductSelect($any($event.target).value, i)"
                    class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 bg-white"
                    [disabled]="isLoadingAllProducts"
                  >
                    <option value="">{{ 'admin.offersForm.selectProduct' | translate }}</option>
                    <option *ngFor="let prod of getFilteredProducts()" [value]="prod.id" [disabled]="isProductAlreadyAdded(prod.id)">
                      {{ prod.name }}{{ isProductAlreadyAdded(prod.id) ? ('admin.offersForm.alreadyAdded' | translate) : '' }}
                    </option>
                  </select>
                  <label class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700">
                    {{ 'admin.productName' | translate }} *
                  </label>
                </div>

                <div class="relative">
                  <input 
                    type="text"
                    formControlName="sku"
                    class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                    placeholder="SKU"
                    readonly>
                  <label class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                    SKU
                  </label>
                </div>

                <div class="relative">
                  <input 
                    type="text"
                    formControlName="category"
                    class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                    placeholder="Category"
                    readonly>
                  <label class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                    {{ 'admin.category' | translate }}
                  </label>
                </div>

                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span class="text-gray-500 text-lg">€</span>
                  </div>
                  <input 
                    type="number"
                    formControlName="price"
                    step="0.01"
                    min="0"
                    class="peer w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent bg-gray-50"
                    placeholder="0.00"
                    readonly>
                  <label class="absolute left-10 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                    {{ 'admin.originalPrice' | translate }}
                  </label>
                </div>

                <div class="relative">
                  <!-- Discount Type Selector for Individual Product -->
                  <div class="flex space-x-2 mb-3">
                    <button type="button" 
                            (click)="setProductDiscountType(i, 'percentage')"
                            [class]="getProductDiscountType(i) === 'percentage' ? 'px-3 py-1 bg-blue-600 text-white rounded text-sm' : 'px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300'">
                      %
                    </button>
                    <button type="button" 
                            (click)="setProductDiscountType(i, 'fixed_amount')"
                            [class]="getProductDiscountType(i) === 'fixed_amount' ? 'px-3 py-1 bg-blue-600 text-white rounded text-sm' : 'px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300'">
                      €
                    </button>
                  </div>
                  
                  <!-- Percentage Input -->
                  <input *ngIf="getProductDiscountType(i) === 'percentage'"
                    type="number"
                    formControlName="discount_percentage"
                    min="0"
                    max="100"
                    step="0.1"
                    class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                    placeholder="0">
                  
                  <!-- Fixed Amount Input -->
                  <div *ngIf="getProductDiscountType(i) === 'fixed_amount'" class="relative">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span class="text-gray-500 text-lg">€</span>
                    </div>
                    <input 
                      type="number"
                      formControlName="discount_amount"
                      min="0"
                      [max]="getProductPrice(i)"
                      step="0.01"
                      class="peer w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                      placeholder="0.00">
                  </div>
                  
                  <label class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                    {{ getProductDiscountType(i) === 'percentage' ? ('admin.discountPercent' | translate) : ('admin.discountAmount' | translate) }}
                  </label>
                </div>

                <div class="text-center">
                  <p class="text-sm font-medium text-gray-700 mb-2">{{ 'admin.finalPrice' | translate }}</p>
                  <p class="text-lg font-semibold text-green-600">
                    {{ calculateDiscountedPriceByType(getProductPrice(i), getProductDiscountValue(i), getProductDiscountType(i)) | currency:'EUR':'symbol':'1.2-2' }}
                  </p>
                </div>

                <div class="flex justify-center">
                  <button 
                    type="button"
                    (click)="removeProduct(i)"
                    class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <ng-template #noProducts>
            <div class="text-center py-12">
              <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
              <h3 class="text-lg font-medium text-gray-900 mb-2">{{ 'admin.noProductsAssigned' | translate }}</h3>
              <p class="text-gray-500 mb-4">{{ 'admin.addProductsToOffer' | translate }}</p>
              <button 
                type="button"
                (click)="addProduct()"
                class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                {{ 'admin.addFirstProduct' | translate }}
              </button>
            </div>
          </ng-template>
        </div>

        <!-- Date Range -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            {{ 'admin.offersForm.validityPeriod' | translate }}
          </h3>
          
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div class="relative">
            <input
              type="datetime-local"
              id="start_date"
              formControlName="start_date"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200"
              >
              <label for="start_date" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700">
                {{ 'admin.offersForm.startDate' | translate }} *
              </label>
              <div *ngIf="offerForm.get('start_date')?.invalid && offerForm.get('start_date')?.touched" class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
              {{ 'admin.offersForm.startDateRequired' | translate }}
            </div>
          </div>

            <div class="relative">
            <input
              type="datetime-local"
              id="end_date"
              formControlName="end_date"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200"
            >
              <label for="end_date" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700">
                {{ 'admin.offersForm.endDate' | translate }}
              </label>
            </div>
          </div>
        </div>

        <!-- Usage Limits -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            {{ 'admin.offersForm.usageConfiguration' | translate }}
          </h3>
          
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div class="relative">
            <input
              type="number"
              id="max_usage"
              formControlName="max_usage"
              min="1"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
              placeholder="Unlimited"
            >
              <label for="max_usage" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.offersForm.usageLimit' | translate }}
              </label>
              <p class="mt-2 text-sm text-gray-500 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {{ 'admin.offersForm.leaveEmptyForUnlimitedUsage' | translate }}
              </p>
          </div>

            <div class="relative">
            <input
              type="number"
              id="priority"
              formControlName="priority"
              min="0"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
              placeholder="0"
            >
              <label for="priority" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.offersForm.priority' | translate }}
              </label>
              <p class="mt-2 text-sm text-gray-500 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {{ 'admin.offersForm.higherNumbersHigherPriority' | translate }}
              </p>
            </div>
          </div>
        </div>

        <!-- Status -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Offer Status
          </h3>
          
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div class="relative">
              <select
                id="status"
                formControlName="status"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 bg-white"
              >
                <option value="draft">{{ 'admin.offersForm.draft' | translate }}</option>
                <option value="active">{{ 'admin.offersForm.active' | translate }}</option>
                <option value="paused">{{ 'admin.offersForm.paused' | translate }}</option>
                <option value="expired">{{ 'admin.offersForm.expired' | translate }}</option>
              </select>
              <label class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700">
                {{ 'admin.offersForm.status' | translate }} *
              </label>
            </div>


            <div class="flex items-center">
              <label class="relative flex items-center p-4 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-300 transition-colors duration-200 w-full">
              <input
                id="is_b2b"
                type="checkbox"
                formControlName="is_b2b"
                  class="sr-only"
                >
                <span class="flex items-center">
                  <span class="flex-shrink-0 w-5 h-5 border-2 border-gray-300 rounded mr-3 transition-colors duration-200" 
                        [class.bg-blue-600]="offerForm.get('is_b2b')?.value"
                        [class.border-blue-600]="offerForm.get('is_b2b')?.value">
                    <svg *ngIf="offerForm.get('is_b2b')?.value" class="w-3 h-3 text-white mx-auto mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </span>
                  <span class="text-sm font-medium text-gray-700">{{ 'admin.offersForm.b2bOffer' | translate }}</span>
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </app-admin-form>
  `
})
export class OfferFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private supabaseService = inject(SupabaseService);
  private title = inject(Title);
  translationService = inject(TranslationService);

  offerForm!: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  offerId: string | null = null;
  categories: any[] = [];
  selectedCategory: any = null;
  categoryProducts: any[] = [];
  isLoadingCategories = false;
  isLoadingProducts = false;
  allProducts: any[] = [];
  isLoadingAllProducts = false;

  constructor() {
    this.initForm();
  }

  ngOnInit(): void {
    this.checkEditMode();
    this.loadCategories();
    this.loadAllProducts();
    this.setupDiscountChangeListeners();
  }

  private initForm(): void {
    const now = new Date();
    const defaultStart = new Date(now.getTime());
    const defaultEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    this.offerForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      image_url: [''],
      code: ['', [Validators.required]],
      discount_type: ['', [Validators.required]],
      discount_value: [0, [Validators.required, Validators.min(0)]],
      min_order_amount: [null],
      start_date: [this.formatDateTimeLocal(defaultStart), [Validators.required]],
      end_date: [this.formatDateTimeLocal(defaultEnd)],
      max_usage: [null],
      priority: [0],
      status: ['draft', [Validators.required]],
      is_b2b: [false],
      category_id: [null],
      apply_to_category: [false],
      products: this.fb.array([])
    });
  }

  private formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private setupDiscountChangeListeners(): void {
    // Listen for changes to discount type and value
    this.offerForm.get('discount_type')?.valueChanges.subscribe(() => {
      this.applyGlobalDiscountToProducts();
    });

    this.offerForm.get('discount_value')?.valueChanges.subscribe(() => {
      this.applyGlobalDiscountToProducts();
    });
  }

  applyGlobalDiscountToProducts(): void {
    const discountType = this.offerForm.get('discount_type')?.value;
    const discountValue = this.offerForm.get('discount_value')?.value;

    if (discountValue && discountValue > 0) {
      // Update all products in the form array with the global discount
      this.productsArray.controls.forEach(productControl => {
        if (discountType === 'percentage') {
          productControl.get('discount_percentage')?.setValue(discountValue, { emitEvent: false });
          productControl.get('discount_amount')?.setValue(0, { emitEvent: false });
          productControl.get('discount_type')?.setValue('percentage', { emitEvent: false });
        } else if (discountType === 'fixed_amount') {
          productControl.get('discount_amount')?.setValue(discountValue, { emitEvent: false });
          productControl.get('discount_percentage')?.setValue(0, { emitEvent: false });
          productControl.get('discount_type')?.setValue('fixed_amount', { emitEvent: false });
        }
      });
    }
  }

  private checkEditMode(): void {
    this.offerId = this.route.snapshot.paramMap.get('id');
    if (this.offerId) {
      this.isEditMode = true;
      this.loadOffer();
    }
    // Set title after determining edit mode
    this.title.setTitle(this.isEditMode ? 'Edit Offer - Solar Shop Admin' : 'Create Offer - Solar Shop Admin');
  }

  private async loadOffer(): Promise<void> {
    if (!this.offerId) return;

    try {
      const data = await this.supabaseService.getTableById('offers', this.offerId);
      if (data) {
        // Convert applicable_category_ids array to category_id
        const categoryId = data.applicable_category_ids && data.applicable_category_ids.length > 0
          ? data.applicable_category_ids[0]
          : null;

        const formData = {
          ...data,
          category_id: categoryId,
          start_date: data.start_date ? this.formatDateTimeLocal(new Date(data.start_date)) : '',
          end_date: data.end_date ? this.formatDateTimeLocal(new Date(data.end_date)) : ''
        };
        this.offerForm.patchValue(formData);

        // Load offer products
        await this.loadOfferProducts();
      }
    } catch (error) {
      console.error('Error loading offer:', error);
    }
  }

  private async loadOfferProducts(): Promise<void> {
    if (!this.offerId) return;

    try {
      const { data, error } = await this.supabaseService.client
        .from('offer_products')
        .select(`
          *,
          products (
            id,
            name,
            sku,
            price,
            category_id,
            categories (
              name
            )
          )
        `)
        .eq('offer_id', this.offerId)
        .order('sort_order');

      if (error) throw error;

      if (data && data.length > 0) {
        // Clear existing products array
        this.productsArray.clear();

        // Add each offer product to the form
        data.forEach((offerProduct: any) => {
          const product = offerProduct.products;
          // Determine discount type based on which field has a value
          const discountType = (offerProduct.discount_amount && offerProduct.discount_amount > 0) ? 'fixed_amount' : 'percentage';
          
          const productFormGroup = this.fb.group({
            id: [product.id, Validators.required],
            name: [product.name, Validators.required],
            sku: [product.sku || ''],
            category: [product.categories?.name || ''],
            price: [product.price || 0, [Validators.required, Validators.min(0)]],
            discount_percentage: [offerProduct.discount_percentage || 0, [Validators.min(0), Validators.max(100)]],
            discount_amount: [offerProduct.discount_amount || 0, [Validators.min(0)]],
            discount_type: [discountType]
          });

          this.productsArray.push(productFormGroup);
        });
      }
    } catch (error) {
      console.error('Error loading offer products:', error);
    }
  }

  async onSubmit(formValue: any): Promise<void> {
    if (this.offerForm.invalid) return;

    this.isSubmitting = true;

    try {
      // Extract products from form array
      const products = this.productsArray.value;

      // Remove products and apply_to_category from form data to avoid saving them to offers table
      const { products: _, apply_to_category: __, category_id: ___, ...offerData } = formValue;

      // Convert category_id to applicable_category_ids array only if apply_to_category is checked
      const categoryId = formValue.category_id;
      const applyToCategory = formValue.apply_to_category;
      const applicableCategoryIds = (applyToCategory && categoryId) ? [categoryId] : [];

      // Calculate total original and discounted prices
      const totalOriginalPrice = this.getTotalOriginalPrice();
      const totalDiscountedPrice = this.getTotalDiscountedPrice();

      const finalOfferData = {
        ...offerData,
        applicable_category_ids: applicableCategoryIds,
        original_price: totalOriginalPrice,
        discounted_price: totalDiscountedPrice,
        start_date: offerData.start_date ? new Date(offerData.start_date).toISOString() : null,
        end_date: offerData.end_date ? new Date(offerData.end_date).toISOString() : null,
        updated_at: new Date().toISOString()
      };

      let savedOfferId: string;

      if (this.isEditMode && this.offerId) {
        await this.supabaseService.updateRecord('offers', this.offerId, finalOfferData);
        savedOfferId = this.offerId;
      } else {
        finalOfferData.created_at = new Date().toISOString();
        const result = await this.supabaseService.createRecord('offers', finalOfferData);
        if (!result) {
          throw new Error('Failed to create offer');
        }
        savedOfferId = result.id;
      }

      // Save products to offer_products table
      await this.saveOfferProducts(savedOfferId, products);

      this.router.navigate(['/admin/ponude']);
    } catch (error) {
      console.error('Error saving offer:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  private async saveOfferProducts(offerId: string, products: any[]): Promise<void> {
    try {
      // First, delete existing offer products for this offer
      await this.supabaseService.client
        .from('offer_products')
        .delete()
        .eq('offer_id', offerId);

      // Then insert new offer products
      if (products.length > 0) {
        const offerProducts = products.map((product, index) => {
          const discountType = product.discount_type || 'percentage';
          const discountValue = discountType === 'percentage' 
            ? (product.discount_percentage || 0) 
            : (product.discount_amount || 0);
          
          return {
            offer_id: offerId,
            product_id: product.id,
            discount_percentage: product.discount_percentage || 0,
            discount_amount: product.discount_amount || 0,
            original_price: product.price,
            discounted_price: this.calculateDiscountedPriceByType(product.price, discountValue, discountType),
            sort_order: index
          };
        });

        await this.supabaseService.client
          .from('offer_products')
          .insert(offerProducts);
      }
    } catch (error) {
      console.error('Error saving offer products:', error);
      throw error;
    }
  }

  private async loadCategories(): Promise<void> {
    this.isLoadingCategories = true;
    try {
      const { data, error } = await this.supabaseService.client
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error loading categories:', error);
        // Fallback: try without is_active filter
        const { data: fallbackData, error: fallbackError } = await this.supabaseService.client
          .from('categories')
          .select('*')
          .order('name');
        
        if (fallbackError) throw fallbackError;
        this.categories = fallbackData || [];
      } else {
        this.categories = data || [];
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      this.categories = [];
    } finally {
      this.isLoadingCategories = false;
    }
  }

  async onCategoryChange(categoryId: string): Promise<void> {
    if (!categoryId) {
      this.selectedCategory = null;
      this.categoryProducts = [];
      this.offerForm.patchValue({ category_id: null });
      return;
    }

    // Check if there are products already added that don't belong to the selected category
    const existingProducts = this.getExistingProductsNotInCategory(categoryId);

    if (existingProducts.length > 0) {
      const categoryName = this.categories.find(c => c.id === categoryId)?.name || '';
      const promptMessage = this.translationService.translate('admin.offersForm.categoryChangePrompt', {
        count: existingProducts.length,
        categoryName: categoryName
      });

      const shouldClearProducts = confirm(promptMessage);

      if (shouldClearProducts) {
        // Remove products that don't belong to the selected category
        this.removeProductsNotInCategory(categoryId);
      }
    }

    this.selectedCategory = this.categories.find(c => c.id === categoryId);
    this.offerForm.patchValue({ category_id: categoryId });
    await this.loadCategoryProducts(categoryId);
  }

  private async loadCategoryProducts(categoryId: string): Promise<void> {
    this.isLoadingProducts = true;
    try {
      const { data, error } = await this.supabaseService.client
        .from('products')
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error loading category products:', error);
        // Fallback: try without is_active filter
        const { data: fallbackData, error: fallbackError } = await this.supabaseService.client
          .from('products')
          .select(`
            *,
            categories (
              name
            )
          `)
          .eq('category_id', categoryId)
          .order('name');
        
        if (fallbackError) throw fallbackError;
        // Map category names for easier access
        this.categoryProducts = (fallbackData || []).map(product => ({
          ...product,
          category_name: product.categories?.name || ''
        }));
      } else {
        // Map category names for easier access
        this.categoryProducts = (data || []).map(product => ({
          ...product,
          category_name: product.categories?.name || ''
        }));
      }
    } catch (error) {
      console.error('Error loading category products:', error);
      this.categoryProducts = [];
    } finally {
      this.isLoadingProducts = false;
    }
  }

  applyDiscountToCategory(): void {
    if (!this.selectedCategory || this.categoryProducts.length === 0) return;

    // Get already added product IDs
    const alreadyAddedIds = this.getAlreadyAddedProductIds();

    // Add only products that haven't been added yet
    const productsToAdd = this.categoryProducts.filter(product => !alreadyAddedIds.includes(product.id));

    if (productsToAdd.length === 0) {
      alert(this.translationService.translate('admin.offersForm.allCategoryProductsAdded'));
      return;
    }

    // Add remaining products from the category
    productsToAdd.forEach(product => {
      this.addProductToOffer(product);
    });
  }

  private async loadAllProducts(): Promise<void> {
    this.isLoadingAllProducts = true;
    try {
      const { data, error } = await this.supabaseService.client
        .from('products')
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error loading all products:', error);
        // Fallback: try without is_active filter
        const { data: fallbackData, error: fallbackError } = await this.supabaseService.client
          .from('products')
          .select(`
            *,
            categories (
              name
            )
          `)
          .order('name');
        
        if (fallbackError) throw fallbackError;
        // Map category names for easier access
        this.allProducts = (fallbackData || []).map(product => ({
          ...product,
          category_name: product.categories?.name || ''
        }));
      } else {
        // Map category names for easier access
        this.allProducts = (data || []).map(product => ({
          ...product,
          category_name: product.categories?.name || ''
        }));
      }
    } catch (error) {
      console.error('Error loading all products:', error);
      this.allProducts = [];
    } finally {
      this.isLoadingAllProducts = false;
    }
  }

  get productsArray(): FormArray {
    return this.offerForm.get('products') as FormArray;
  }

  private createProductFormGroup(product?: any): FormGroup {
    // Get the global discount to apply
    const globalDiscountType = this.offerForm.get('discount_type')?.value;
    const globalDiscountValue = this.offerForm.get('discount_value')?.value;
    
    let discountPercentage = 0;
    let discountAmount = 0;
    let discountType = 'percentage';

    if (globalDiscountType === 'percentage' && globalDiscountValue > 0) {
      discountPercentage = globalDiscountValue;
      discountType = 'percentage';
    } else if (globalDiscountType === 'fixed_amount' && globalDiscountValue > 0) {
      discountAmount = globalDiscountValue;
      discountType = 'fixed_amount';
    } else if (product) {
      discountPercentage = product.discount_percentage || 0;
      discountAmount = product.discount_amount || 0;
      discountType = product.discount_type || 'percentage';
    }

    return this.fb.group({
      id: [product?.id || '', Validators.required],
      name: [product?.name || '', Validators.required],
      sku: [product?.sku || ''],
      category: [product?.category_name || ''],
      price: [product?.price || 0, [Validators.required, Validators.min(0)]],
      discount_percentage: [discountPercentage, [Validators.min(0), Validators.max(100)]],
      discount_amount: [discountAmount, [Validators.min(0)]],
      discount_type: [discountType]
    });
  }

  addProduct(): void {
    const selectedCategoryId = this.offerForm.get('category_id')?.value;

    if (selectedCategoryId) {
      // Check if we've already added all products from this category
      const categoryProducts = this.allProducts.filter(product => product.category_id === selectedCategoryId);
      const alreadyAddedProducts = this.getAlreadyAddedProductIds();
      const availableProducts = categoryProducts.filter(product => !alreadyAddedProducts.includes(product.id));

      if (availableProducts.length === 0) {
        alert(this.translationService.translate('admin.offersForm.allCategoryProductsAdded'));
        return;
      }
    }

    this.productsArray.push(this.createProductFormGroup());
  }

  addProductToOffer(product: any): void {
    const existingIndex = this.productsArray.controls.findIndex(
      (control: any) => control.get('id')?.value === product.id
    );

    if (existingIndex === -1) {
      // Check if we're in category mode and if this product belongs to the selected category
      const selectedCategoryId = this.offerForm.get('category_id')?.value;
      if (selectedCategoryId && product.category_id !== selectedCategoryId) {
        alert(this.translationService.translate('admin.offersForm.productNotInSelectedCategory'));
        return;
      }

      const productFormGroup = this.fb.group({
        id: [product.id, Validators.required],
        name: [product.name, Validators.required],
        sku: [product.sku || ''],
        category: [product.category_name || ''],
        price: [product.price || 0, [Validators.required, Validators.min(0)]],
        discount_percentage: [0, [Validators.min(0), Validators.max(100)]],
        discount_amount: [0, [Validators.min(0)]],
        discount_type: ['percentage']
      });

      this.productsArray.push(productFormGroup);
    } else {
      alert(this.translationService.translate('admin.offersForm.productAlreadyAdded'));
    }
  }

  removeProduct(index: number): void {
    this.productsArray.removeAt(index);
  }

  onProductSelect(productId: string, index: number): void {
    const product = this.allProducts.find(p => p.id === productId);
    if (product) {
      const productControl = this.productsArray.at(index);

      // Apply discount based on global discount type
      const globalDiscountType = this.offerForm.get('discount_type')?.value;
      const globalDiscountValue = this.offerForm.get('discount_value')?.value;
      
      let discountPercentage = 0;
      let discountAmount = 0;
      let discountType = 'percentage';
      
      if (globalDiscountType === 'percentage' && globalDiscountValue > 0) {
        discountPercentage = globalDiscountValue;
        discountType = 'percentage';
      } else if (globalDiscountType === 'fixed_amount' && globalDiscountValue > 0) {
        discountAmount = globalDiscountValue;
        discountType = 'fixed_amount';
      }

      productControl.patchValue({
        id: productId,
        name: product.name,
        sku: product.sku || '',
        category: product.category_name || '',
        price: product.price || 0,
        discount_percentage: discountPercentage,
        discount_amount: discountAmount,
        discount_type: discountType
      });
    } else if (productId === '') {
      // Clear the form when no product is selected
      const productControl = this.productsArray.at(index);
      productControl.patchValue({
        id: '',
        name: '',
        sku: '',
        category: '',
        price: 0,
        discount_percentage: 0,
        discount_amount: 0,
        discount_type: 'percentage'
      });
    }
  }

  getProductPrice(index: number): number {
    const product = this.productsArray.at(index);
    return product.get('price')?.value || 0;
  }

  getProductDiscount(index: number): number {
    const product = this.productsArray.at(index);
    return product.get('discount_percentage')?.value || 0;
  }

  calculateDiscountedPrice(originalPrice: number, discountPercentage: number): number {
    if (!discountPercentage) return originalPrice;
    return originalPrice * (1 - discountPercentage / 100);
  }

  calculateDiscountedPriceByType(originalPrice: number, discountValue: number, discountType: string): number {
    if (!discountValue || discountValue <= 0) return originalPrice;
    
    if (discountType === 'percentage') {
      return originalPrice * (1 - discountValue / 100);
    } else if (discountType === 'fixed_amount') {
      return Math.max(0, originalPrice - discountValue);
    }
    
    return originalPrice;
  }

  getProductDiscountType(index: number): string {
    const product = this.productsArray.at(index);
    return product.get('discount_type')?.value || 'percentage';
  }

  setProductDiscountType(index: number, type: string): void {
    const product = this.productsArray.at(index);
    product.get('discount_type')?.setValue(type);
    
    // Reset the other discount field when switching types
    if (type === 'percentage') {
      product.get('discount_amount')?.setValue(0);
    } else {
      product.get('discount_percentage')?.setValue(0);
    }
  }

  getProductDiscountValue(index: number): number {
    const product = this.productsArray.at(index);
    const discountType = this.getProductDiscountType(index);
    
    if (discountType === 'percentage') {
      return product.get('discount_percentage')?.value || 0;
    } else {
      return product.get('discount_amount')?.value || 0;
    }
  }

  getTotalOriginalPrice(): number {
    return this.productsArray.controls.reduce((total, productControl) => {
      const price = productControl.get('price')?.value || 0;
      return total + price;
    }, 0);
  }

  getTotalDiscountedPrice(): number {
    return this.productsArray.controls.reduce((total, productControl) => {
      const price = productControl.get('price')?.value || 0;
      const discountPercentage = productControl.get('discount_percentage')?.value || 0;
      return total + this.calculateDiscountedPrice(price, discountPercentage);
    }, 0);
  }

  getFilteredProducts(): any[] {
    const selectedCategoryId = this.offerForm.get('category_id')?.value;

    let filteredProducts = this.allProducts;

    if (selectedCategoryId) {
      filteredProducts = this.allProducts.filter(product => product.category_id === selectedCategoryId);
    }

    return filteredProducts;
  }

  getExistingProductsNotInCategory(categoryId: string): any[] {
    const existingProducts = [];
    for (let i = 0; i < this.productsArray.length; i++) {
      const productControl = this.productsArray.at(i);
      const productId = productControl.get('id')?.value;
      if (productId) {
        const product = this.allProducts.find(p => p.id === productId);
        if (product && product.category_id !== categoryId) {
          existingProducts.push({ index: i, product });
        }
      }
    }
    return existingProducts;
  }

  removeProductsNotInCategory(categoryId: string): void {
    const productsToRemove = this.getExistingProductsNotInCategory(categoryId);
    // Remove from the end to avoid index shifting issues
    productsToRemove.reverse().forEach(({ index }) => {
      this.productsArray.removeAt(index);
    });
  }

  getAlreadyAddedProductIds(): string[] {
    const addedIds: string[] = [];
    for (let i = 0; i < this.productsArray.length; i++) {
      const productId = this.productsArray.at(i).get('id')?.value;
      if (productId) {
        addedIds.push(productId);
      }
    }
    return addedIds;
  }

  isProductAlreadyAdded(productId: string): boolean {
    return this.getAlreadyAddedProductIds().includes(productId);
  }

  onApplyToCategoryChange(checked: boolean): void {
    if (checked && this.selectedCategory && this.categoryProducts.length > 0) {
      // Clear existing products first
      this.productsArray.clear();

      // Add all products from the category
      this.categoryProducts.forEach(product => {
        const productFormGroup = this.fb.group({
          id: [product.id, Validators.required],
          name: [product.name, Validators.required],
          sku: [product.sku || ''],
          category: [product.category_name || this.selectedCategory.name],
          price: [product.price || 0, [Validators.required, Validators.min(0)]],
          discount_percentage: [0, [Validators.min(0), Validators.max(100)]],
          discount_amount: [0, [Validators.min(0)]],
          discount_type: ['percentage']
        });

        this.productsArray.push(productFormGroup);
      });
    } else if (!checked) {
      // Clear all products when unchecking
      this.productsArray.clear();
    }
  }
} 