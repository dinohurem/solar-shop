import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AdminFormComponent } from '../../shared/admin-form/admin-form.component';
import { SupabaseService } from '../../../../services/supabase.service';
import { TranslationService } from '../../../../shared/services/translation.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

interface Product {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compare_at_price?: number;
  sku: string;
  brand: string;
  model: string;
  category_id?: string;
  images?: string[];
  specifications?: { [key: string]: string };
  features?: string[];
  is_active: boolean;
  is_featured: boolean;
  is_on_sale: boolean;
  stock_quantity: number;
  weight?: number;
  dimensions?: string;
  created_at?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminFormComponent, TranslatePipe],
  template: `
    <app-admin-form
      [title]="isEditMode ? translationService.translate('admin.editProduct') : translationService.translate('admin.createProduct')"
      [subtitle]="isEditMode ? translationService.translate('admin.updateProductInformation') : translationService.translate('admin.addNewProductToCatalog')"
      [form]="productForm"
      [isEditMode]="isEditMode"
      [isSubmitting]="isSubmitting"
      [backRoute]="'/admin/products'"
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
              <select
                id="category_id"
                formControlName="category_id"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 bg-white"
              >
                <option value="">{{ 'admin.selectCategory' | translate }}</option>
                <option *ngFor="let category of categories" [value]="category.id">
                  {{ category.name }}
                </option>
              </select>
              <label class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700">
                {{ 'admin.productCategory' | translate }}
              </label>
            </div>
          </div>

          <!-- Specifications -->
          <div class="mt-6">
            <div class="relative">
              <textarea
                id="specifications"
                formControlName="specifications"
                rows="6"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent resize-none font-mono text-sm"
                placeholder='{"frequency": "50Hz", "ac_voltage": "230V", "efficiency": "97.6%"}'
              ></textarea>
              <label for="specifications" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.productSpecifications' | translate }} (JSON)
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
      </div>
    </app-admin-form>
  `
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private supabaseService = inject(SupabaseService);
  private title = inject(Title);
  translationService = inject(TranslationService);

  productForm!: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  productId: string | null = null;
  categories: any[] = [];

  constructor() {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadCategories();
    this.checkEditMode();
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
      features: ['']
    });
  }

  private async loadCategories(): Promise<void> {
    try {
      this.categories = await this.supabaseService.getCategories(false);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  private checkEditMode(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.isEditMode = true;
      this.loadProduct();
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
          features: this.formatFeatures(data.features)
        };

        this.productForm.patchValue(formData);
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

      // If it's an object, convert to JSON string
      if (typeof specifications === 'object') {
        return JSON.stringify(specifications, null, 2);
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

      // Parse specifications JSON string to object
      let specificationsObj = {};
      if (formValue.specifications && formValue.specifications.trim()) {
        try {
          specificationsObj = JSON.parse(formValue.specifications.trim());
        } catch (error) {
          console.error('Error parsing specifications JSON:', error);
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
        category_id: formValue.category_id || undefined,
        stock_quantity: Number(formValue.stock_quantity),
        weight: formValue.weight ? Number(formValue.weight) : undefined,
        dimensions: formValue.dimensions || '',
        is_active: Boolean(formValue.is_active),
        is_featured: Boolean(formValue.is_featured),
        is_on_sale: Boolean(formValue.is_on_sale),
        images: imagesArray, // Use JSONB array format
        specifications: specificationsObj,
        features: featuresArray,
        certifications: [], // Default empty certifications
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

      if (this.isEditMode && this.productId) {
        await this.supabaseService.updateRecord('products', this.productId, productData);
      } else {
        (productData as any).created_at = new Date().toISOString();
        await this.supabaseService.createRecord('products', productData);
      }

      this.router.navigate(['/admin/products']);
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      this.isSubmitting = false;
    }
  }
} 