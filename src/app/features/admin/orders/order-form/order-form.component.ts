import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { SupabaseService } from '../../../../services/supabase.service';
import { AdminFormComponent } from '../../shared/admin-form/admin-form.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { SuccessModalComponent } from '../../../../shared/components/modals/success-modal/success-modal.component';
import { TranslationService } from '../../../../shared/services/translation.service';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of, fromEvent, merge, EMPTY, from } from 'rxjs';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminFormComponent, TranslatePipe, SuccessModalComponent],
  template: `
    <app-admin-form
      *ngIf="orderForm"
      [title]="isEditMode ? ('admin.ordersForm.editOrder' | translate) : ('admin.ordersForm.createOrder' | translate)"
      [subtitle]="isEditMode ? ('admin.ordersForm.updateOrderInformation' | translate) : ('admin.ordersForm.addNewOrder' | translate)"
      [form]="orderForm"
      [isEditMode]="isEditMode"
      [isSubmitting]="loading"
      backRoute="/admin/orders"
      (formSubmit)="onSave()">
      
      <div [formGroup]="orderForm" class="space-y-8">
        <!-- Order Basic Info -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            {{ 'admin.ordersForm.orderInformation' | translate }}
          </h3>
          
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div class="relative">
              <input
                type="text"
                id="order_number"
                formControlName="order_number"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="Order Number"
              >
              <label for="order_number" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.ordersForm.orderNumber' | translate }} *
              </label>
              <div *ngIf="orderForm.get('order_number')?.invalid && orderForm.get('order_number')?.touched" class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                {{ 'admin.ordersForm.orderNumberRequired' | translate }}
              </div>
            </div>

            <div class="relative">
              <input
                type="datetime-local"
                id="order_date"
                formControlName="order_date"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="Order Date"
              >
              <label for="order_date" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.ordersForm.orderDate' | translate }} *
              </label>
              <div *ngIf="orderForm.get('order_date')?.invalid && orderForm.get('order_date')?.touched" class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                {{ 'admin.ordersForm.orderDateRequired' | translate }}
              </div>
            </div>
          </div>
        </div>

        <!-- Customer Information -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            {{ 'admin.ordersForm.customerInformation' | translate }}
          </h3>
          
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div class="relative">
              <input
                type="email"
                id="customer_email"
                formControlName="customer_email"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="Customer Email"
              >
              <label for="customer_email" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.ordersForm.customerEmail' | translate }} *
              </label>
              <!-- Error Messages -->
              <div *ngIf="orderForm.get('customer_email')?.invalid && orderForm.get('customer_email')?.touched" class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                <span *ngIf="orderForm.get('customer_email')?.errors?.['required']">{{ 'admin.ordersForm.customerEmailRequired' | translate }}</span>
                <span *ngIf="orderForm.get('customer_email')?.errors?.['email']">{{ 'admin.ordersForm.validEmailRequired' | translate }}</span>
              </div>
              
              <!-- User Lookup Feedback -->
              <div *ngIf="isLookingUpUser" class="mt-2 text-sm text-blue-600 flex items-center">
                <div class="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                {{ 'admin.ordersForm.lookingUpUser' | translate }}
              </div>
              
              <div *ngIf="foundUser && !isLookingUpUser" class="mt-2 text-sm text-green-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                {{ 'admin.ordersForm.userFound' | translate }}: {{ foundUser.first_name }} {{ foundUser.last_name }}
              </div>
              
              <div *ngIf="!foundUser && !isLookingUpUser && orderForm.get('customer_email')?.value?.includes('@')" class="mt-2 text-sm text-gray-500 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                {{ 'admin.ordersForm.newCustomer' | translate }}
              </div>
            </div>

            <div class="relative">
              <input
                type="text"
                id="customer_name"
                formControlName="customer_name"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="Customer Name"
              >
              <label for="customer_name" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.ordersForm.customerName' | translate }}
              </label>
            </div>

            <div class="relative">
              <input
                type="tel"
                id="customer_phone"
                formControlName="customer_phone"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="Customer Phone"
              >
              <label for="customer_phone" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.ordersForm.customerPhone' | translate }}
              </label>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-6">
            <div class="relative">
              <textarea
                id="shipping_address"
                formControlName="shipping_address"
                rows="3"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent resize-none"
                placeholder="Shipping Address"
              ></textarea>
              <label for="shipping_address" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.ordersForm.shippingAddress' | translate }}
              </label>
            </div>

            <div class="relative">
              <textarea
                id="billing_address"
                formControlName="billing_address"
                rows="3"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent resize-none"
                placeholder="Billing Address"
              ></textarea>
              <label for="billing_address" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.ordersForm.billingAddress' | translate }}
              </label>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900 flex items-center">
              <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
              {{ 'admin.ordersForm.orderItems' | translate }}
            </h3>
            <button
              type="button"
              (click)="addOrderItem()"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              <span>{{ 'admin.ordersForm.addItem' | translate }}</span>
            </button>
          </div>

          <div formArrayName="order_items" class="space-y-4">
            <div *ngFor="let item of orderItems.controls; let i = index" [formGroupName]="i" 
                 class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div class="grid grid-cols-1 lg:grid-cols-6 gap-4 items-end">
                <!-- Product Search Combobox -->
                <div class="relative">
                  <input
                    type="text"
                    formControlName="product_name"
                    (input)="onProductInputChange($any($event.target).value, i)"
                    (focus)="onProductInputFocus(i)"
                    (blur)="onProductInputBlur(i)"
                    class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                    placeholder="Search product..."
                    autocomplete="off"
                  >
                  <label class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                    {{ 'admin.ordersForm.productName' | translate }} *
                  </label>
                  
                  <!-- Loading indicator -->
                  <div *ngIf="isSearching && activeSearchIndex === i" class="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                  
                  <!-- Search Results Dropdown -->
                  <div *ngIf="searchResults.length > 0 && activeSearchIndex === i" 
                       class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div *ngFor="let product of searchResults; let productIndex = index"
                         (mousedown)="selectProduct(product, i)"
                         class="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0">
                      <div class="flex items-center justify-between">
                        <div class="flex-1">
                          <p class="font-medium text-gray-900">{{ product.name }}</p>
                          <p class="text-sm text-gray-500">SKU: {{ product.sku || 'N/A' }}</p>
                          <p class="text-sm text-blue-600 font-semibold">€{{ product.price | number:'1.2-2' }}</p>
                        </div>
                        <div class="ml-3">
                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                                [class.bg-green-100]="product.is_active"
                                [class.text-green-800]="product.is_active"
                                [class.bg-red-100]="!product.is_active"
                                [class.text-red-800]="!product.is_active">
                            {{ product.is_active ? 'Active' : 'Inactive' }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- No results message -->
                  <div *ngIf="searchResults.length === 0 && !isSearching && activeSearchIndex === i && item.get('product_name')?.value?.length > 2"
                       class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
                    {{ 'admin.ordersForm.noProductsFound' | translate }}
                  </div>
                </div>

                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span class="text-gray-500 text-lg">€</span>
                  </div>
                  <input
                    type="number"
                    formControlName="unit_price"
                    step="0.01"
                    min="0"
                    class="peer w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                    placeholder="0.00"
                  >
                  <label class="absolute left-10 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                    {{ 'admin.ordersForm.unitPrice' | translate }} *
                  </label>
                </div>

                <div class="relative">
                  <input
                    type="number"
                    formControlName="quantity"
                    min="1"
                    class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                    placeholder="1"
                  >
                  <label class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                    {{ 'admin.ordersForm.quantity' | translate }} *
                  </label>
                </div>

                <div class="relative">
                  <input
                    type="number"
                    formControlName="discount_percentage"
                    min="0"
                    max="100"
                    step="0.1"
                    class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                    placeholder="0"
                  >
                  <label class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                    {{ 'admin.ordersForm.discountPercent' | translate }}
                  </label>
                </div>

                <div class="text-center">
                  <p class="text-sm font-medium text-gray-700 mb-2">{{ 'admin.ordersForm.subtotal' | translate }}</p>
                  <p class="text-lg font-semibold text-blue-600">
                    {{ getItemSubtotal(i) | currency:'EUR':'symbol':'1.2-2' }}
                  </p>
                </div>

                <div class="flex justify-center">
                  <button
                    type="button"
                    (click)="removeOrderItem(i)"
                    class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="orderItems.length === 0" class="text-center py-8 text-gray-500">
            <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
            <p class="mb-4">{{ 'admin.ordersForm.noOrderItems' | translate }}</p>
            <button
              type="button"
              (click)="addOrderItem()"
              class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
              {{ 'admin.ordersForm.addFirstItem' | translate }}
            </button>
          </div>
        </div>

        <!-- Pricing & Discounts -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
            </svg>
            {{ 'admin.ordersForm.pricingDiscounts' | translate }}
          </h3>
          
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <!-- Order Discount Percentage -->
            <div class="relative">
              <input
                type="number"
                id="discount_percentage"
                formControlName="discount_percentage"
                step="0.1"
                min="0"
                max="100"
                class="peer w-full pl-4 pr-10 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="0"
              >
              <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <span class="text-gray-500 text-lg">%</span>
              </div>
              <label for="discount_percentage" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.ordersForm.discountPercentage' | translate }}
              </label>
            </div>

            <!-- Shipping Cost -->
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span class="text-gray-500 text-lg">€</span>
              </div>
              <input
                type="number"
                id="shipping_cost"
                formControlName="shipping_cost"
                step="0.01"
                min="0"
                class="peer w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="0.00"
              >
              <label for="shipping_cost" class="absolute left-10 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.ordersForm.shippingCost' | translate }}
              </label>
            </div>

            <!-- Tax Percentage -->
            <div class="relative">
              <input
                type="number"
                id="tax_percentage"
                formControlName="tax_percentage"
                step="0.1"
                min="0"
                max="100"
                class="peer w-full pl-4 pr-10 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="0"
              >
              <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <span class="text-gray-500 text-lg">%</span>
              </div>
              <label for="tax_percentage" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.ordersForm.taxPercentage' | translate }}
              </label>
            </div>

            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
              <h4 class="text-sm font-medium text-gray-700 mb-3">{{ 'admin.ordersForm.orderSummary' | translate }}</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">{{ 'admin.ordersForm.subtotal' | translate }}:</span>
                  <span class="font-medium">{{ getOrderSubtotal() | currency:'EUR':'symbol':'1.2-2' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">{{ 'admin.ordersForm.itemDiscounts' | translate }}:</span>
                  <span class="font-medium text-red-600">-{{ getItemDiscountsTotal() | currency:'EUR':'symbol':'1.2-2' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">{{ 'admin.ordersForm.orderDiscount' | translate }}:</span>
                  <span class="font-medium text-red-600">-{{ getOrderDiscountAmount() | currency:'EUR':'symbol':'1.2-2' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">{{ 'admin.ordersForm.shippingCost' | translate }}:</span>
                  <span class="font-medium text-green-600">+{{ getShippingCost() | currency:'EUR':'symbol':'1.2-2' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">{{ 'admin.ordersForm.taxAmount' | translate }} ({{ orderForm.get('tax_percentage')?.value || 0 }}%):</span>
                  <span class="font-medium text-green-600">+{{ getTaxAmount() | currency:'EUR':'symbol':'1.2-2' }}</span>
                </div>
                <div class="border-t border-blue-200 pt-2 flex justify-between">
                  <span class="font-semibold text-gray-900">{{ 'admin.ordersForm.total' | translate }}:</span>
                  <span class="font-bold text-blue-600">{{ getOrderTotal() | currency:'EUR':'symbol':'1.2-2' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Information -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {{ 'admin.ordersForm.statusInformation' | translate }}
          </h3>

          <!-- B2B Checkbox -->
          <div class="mb-6">
            <label class="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                formControlName="is_b2b"
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              >
              <span class="text-sm font-medium text-gray-700">
                {{ 'admin.ordersForm.isB2BOrder' | translate }}
              </span>
            </label>
            <p class="mt-1 text-sm text-gray-500">{{ 'admin.ordersForm.isB2BOrderDescription' | translate }}</p>
          </div>
          
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div class="relative">
              <select
                id="status"
                formControlName="status"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 bg-white appearance-none"
              >
                <option value="">{{ 'admin.ordersForm.selectStatus' | translate }}</option>
                <option value="pending">{{ 'admin.ordersForm.pending' | translate }}</option>
                <option value="confirmed">{{ 'admin.ordersForm.confirmed' | translate }}</option>
                <option value="processing">{{ 'admin.ordersForm.processing' | translate }}</option>
                <option value="shipped">{{ 'admin.ordersForm.shipped' | translate }}</option>
                <option value="delivered">{{ 'admin.ordersForm.delivered' | translate }}</option>
                <option value="cancelled">{{ 'admin.ordersForm.cancelled' | translate }}</option>
                <option value="refunded">{{ 'admin.ordersForm.refunded' | translate }}</option>
              </select>
              <label class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700">
                {{ 'admin.ordersForm.orderStatus' | translate }} *
              </label>
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
              <div *ngIf="orderForm.get('status')?.invalid && orderForm.get('status')?.touched" class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                {{ 'admin.ordersForm.orderStatusRequired' | translate }}
              </div>
            </div>

            <div class="relative">
              <select
                id="payment_status"
                formControlName="payment_status"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 bg-white appearance-none"
              >
                <option value="">{{ 'admin.ordersForm.selectPaymentStatus' | translate }}</option>
                <option value="pending">{{ 'admin.ordersForm.pending' | translate }}</option>
                <option value="paid">{{ 'admin.ordersForm.paid' | translate }}</option>
                <option value="failed">{{ 'admin.ordersForm.failed' | translate }}</option>
                <option value="refunded">{{ 'admin.ordersForm.refunded' | translate }}</option>
                <option value="partially_refunded">{{ 'admin.ordersForm.partiallyRefunded' | translate }}</option>
              </select>
              <label class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700">
                {{ 'admin.ordersForm.paymentStatus' | translate }} *
              </label>
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
              <div *ngIf="orderForm.get('payment_status')?.invalid && orderForm.get('payment_status')?.touched" class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                {{ 'admin.ordersForm.paymentStatusRequired' | translate }}
              </div>
            </div>

            <div class="relative">
              <select
                id="payment_method"
                formControlName="payment_method"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 bg-white appearance-none"
              >
                <option value="">{{ 'admin.ordersForm.selectPaymentMethod' | translate }}</option>
                <option value="credit_card">{{ 'admin.ordersForm.creditCard' | translate }}</option>
                <option value="debit_card">{{ 'admin.ordersForm.debitCard' | translate }}</option>
                <option value="paypal">PayPal</option>
                <option value="bank_transfer">{{ 'admin.ordersForm.bankTransfer' | translate }}</option>
                <option value="cash_on_delivery">{{ 'admin.ordersForm.cashOnDelivery' | translate }}</option>
              </select>
              <label class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700">
                {{ 'admin.ordersForm.paymentMethod' | translate }}
              </label>
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
            </svg>
            {{ 'admin.ordersForm.additionalNotes' | translate }}
          </h3>
          
          <div class="relative">
            <textarea
              id="notes"
              formControlName="notes"
              rows="4"
              class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent resize-none"
              placeholder="Additional notes"
            ></textarea>
            <label for="notes" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
              {{ 'admin.ordersForm.notesAboutOrder' | translate }}
            </label>
          </div>
        </div>
      </div>
    </app-admin-form>
    
    <!-- Success Modal -->
    <app-success-modal
      [isOpen]="showSuccessModal"
      [title]="successModalTitle"
      [message]="successModalMessage"
      [closeText]="'common.close' | translate"
      (closed)="onSuccessModalClose()">
    </app-success-modal>
  `
})
export class OrderFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private supabaseService = inject(SupabaseService);
  private title = inject(Title);
  private translationService = inject(TranslationService);

  orderForm: FormGroup | null = null;
  loading = false;
  isEditMode = false;
  orderId: string | null = null;

  // Product search properties
  searchResults: any[] = [];
  isSearching = false;
  activeSearchIndex = -1;

  // User lookup properties
  foundUser: any = null;
  isLookingUpUser = false;

  // Success modal properties
  showSuccessModal = false;
  successModalTitle = '';
  successModalMessage = '';

  constructor() {
    this.orderForm = this.fb.group({
      order_number: ['', Validators.required],
      customer_email: ['', [Validators.required, Validators.email]],
      customer_name: [''],
      customer_phone: [''],
      order_date: ['', Validators.required],
      status: ['pending', Validators.required],
      payment_status: ['pending', Validators.required],
      payment_method: [''],
      shipping_address: [''],
      billing_address: [''],
      discount_percentage: [0, [Validators.min(0), Validators.max(100)]],
      discount_amount: [0, [Validators.min(0)]],
      shipping_cost: [0, [Validators.min(0)]],
      tax_percentage: [0, [Validators.min(0), Validators.max(100)]],
      tax_amount: [0, [Validators.min(0)]],
      is_b2b: [false],
      notes: [''],
      order_items: this.fb.array([])
    });
  }

  get orderItems(): FormArray {
    return this.orderForm?.get('order_items') as FormArray;
  }

  ngOnInit(): void {
    // Check if we're in edit mode
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.isEditMode = true;
      this.orderId = orderId;
      this.loadOrder();
    } else {
      // Add one initial item for new orders
      this.addOrderItem();
    }

    // Set default order date to now for new orders
    if (!this.isEditMode) {
      const now = new Date();
      const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      this.orderForm?.patchValue({ order_date: localDateTime });
    }

    // Set up email field listener for user lookup
    this.setupEmailListener();

    // Set page title
    this.title.setTitle(this.translationService.translate('admin.ordersForm.title'));
  }

  createOrderItem(): FormGroup {
    return this.fb.group({
      product_id: [''],
      product_name: ['', Validators.required],
      product_sku: [''],
      unit_price: [0, [Validators.required, Validators.min(0)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      discount_percentage: [0, [Validators.min(0), Validators.max(100)]],
      discount_amount: [0, [Validators.min(0)]]
    });
  }

  addOrderItem(): void {
    this.orderItems.push(this.createOrderItem());
  }

  removeOrderItem(index: number): void {
    this.orderItems.removeAt(index);
  }

  getItemSubtotal(index: number): number {
    const item = this.orderItems.at(index);
    const unitPrice = item.get('unit_price')?.value || 0;
    const quantity = item.get('quantity')?.value || 0;
    const discountPercentage = item.get('discount_percentage')?.value || 0;

    const subtotal = unitPrice * quantity;
    const discountAmount = subtotal * (discountPercentage / 100);
    return subtotal - discountAmount;
  }

  getOrderSubtotal(): number {
    let subtotal = 0;
    for (let i = 0; i < this.orderItems.length; i++) {
      const item = this.orderItems.at(i);
      const unitPrice = item.get('unit_price')?.value || 0;
      const quantity = item.get('quantity')?.value || 0;
      subtotal += unitPrice * quantity;
    }
    return subtotal;
  }

  getItemDiscountsTotal(): number {
    let totalDiscount = 0;
    for (let i = 0; i < this.orderItems.length; i++) {
      const item = this.orderItems.at(i);
      const unitPrice = item.get('unit_price')?.value || 0;
      const quantity = item.get('quantity')?.value || 0;
      const discountPercentage = item.get('discount_percentage')?.value || 0;

      const subtotal = unitPrice * quantity;
      const discountAmount = subtotal * (discountPercentage / 100);
      totalDiscount += discountAmount;
    }
    return totalDiscount;
  }

  getOrderDiscountAmount(): number {
    const subtotalAfterItemDiscounts = this.getOrderSubtotal() - this.getItemDiscountsTotal();
    const discountPercentage = this.orderForm?.get('discount_percentage')?.value || 0;
    return subtotalAfterItemDiscounts * (discountPercentage / 100);
  }

  getShippingCost(): number {
    return this.orderForm?.get('shipping_cost')?.value || 0;
  }

  getTaxAmount(): number {
    const subtotalAfterDiscounts = this.getOrderSubtotal() - this.getItemDiscountsTotal() - this.getOrderDiscountAmount() + this.getShippingCost();
    const taxPercentage = this.orderForm?.get('tax_percentage')?.value || 0;
    return subtotalAfterDiscounts * (taxPercentage / 100);
  }

  getOrderTotal(): number {
    const subtotal = this.getOrderSubtotal();
    const itemDiscounts = this.getItemDiscountsTotal();
    const orderDiscount = this.getOrderDiscountAmount();
    const shipping = this.getShippingCost();
    const tax = this.getTaxAmount();
    return Math.max(0, subtotal - itemDiscounts - orderDiscount + shipping + tax);
  }

  // User lookup method
  private async findUserByEmail(email: string): Promise<string | null> {
    if (!email || !email.includes('@')) {
      return null;
    }

    try {
      console.log(`Looking up user by email: ${email}`);
      const matchingUser = await this.supabaseService.findAuthUserByEmail(email);

      if (matchingUser) {
        console.log(`Found matching user for email ${email}:`, matchingUser.id);
        return matchingUser.id;
      } else {
        console.log(`No matching user found for email: ${email}`);
        return null;
      }
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  private setupEmailListener(): void {
    if (!this.orderForm) return;

    const emailControl = this.orderForm.get('customer_email');
    if (emailControl) {
      emailControl.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(email => {
          if (!email || !email.includes('@')) {
            this.foundUser = null;
            this.isLookingUpUser = false;
            return EMPTY;
          }

          this.isLookingUpUser = true;
          return from(this.lookupUserForDisplay(email));
        }),
        catchError(error => {
          console.error('Error in email lookup:', error);
          this.isLookingUpUser = false;
          return EMPTY;
        })
      ).subscribe();
    }
  }

  private async lookupUserForDisplay(email: string): Promise<void> {
    try {
      // Use the database function to find user by email
      const authUser = await this.supabaseService.findAuthUserByEmail(email);

      if (authUser && authUser.profile) {
        this.foundUser = {
          user_id: authUser.id,
          email: authUser.email,
          first_name: authUser.profile.first_name,
          last_name: authUser.profile.last_name,
          full_name: authUser.profile.full_name,
          role: authUser.profile.role
        };
      } else {
        this.foundUser = null;
      }
    } catch (error) {
      console.error('Error looking up user for display:', error);
      this.foundUser = null;
    } finally {
      this.isLookingUpUser = false;
    }
  }

  // Product search methods
  async searchProducts(query: string, itemIndex: number): Promise<void> {
    if (!query || query.length < 2) {
      this.searchResults = [];
      return;
    }

    this.isSearching = true;
    try {
      const products = await this.supabaseService.getProducts({ search: query, limit: 10 });
      this.searchResults = products || [];
      this.activeSearchIndex = itemIndex;
    } catch (error) {
      console.error('Error searching products:', error);
      this.searchResults = [];
    } finally {
      this.isSearching = false;
    }
  }

  selectProduct(product: any, itemIndex: number): void {
    const item = this.orderItems.at(itemIndex);
    if (item) {
      item.patchValue({
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku || '',
        unit_price: product.price || 0
      });
    }
    this.searchResults = [];
    this.activeSearchIndex = -1;
  }

  onProductInputFocus(itemIndex: number): void {
    this.activeSearchIndex = itemIndex;
  }

  onProductInputBlur(itemIndex: number): void {
    // Add a small delay to allow click on search results
    setTimeout(() => {
      if (this.activeSearchIndex === itemIndex) {
        this.searchResults = [];
        this.activeSearchIndex = -1;
      }
    }, 200);
  }

  onProductInputChange(query: string, itemIndex: number): void {
    this.searchProducts(query, itemIndex);
  }

  private async loadOrder(): Promise<void> {
    if (!this.orderId || !this.orderForm) return;

    this.loading = true;
    try {
      console.log('Loading order with ID:', this.orderId);
      const data = await this.supabaseService.getTableById('orders', this.orderId);
      if (data) {
        console.log('Order loaded successfully:', data);
        // Format dates for datetime-local inputs
        const formData = {
          ...data,
          order_date: data.order_date ? new Date(data.order_date).toISOString().slice(0, 16) : ''
        };
        this.orderForm.patchValue(formData);

        // Load order items
        await this.loadOrderItems();
      } else {
        console.error('Order not found with ID:', this.orderId);
        alert('Order not found. You will be redirected to the orders list.');
        this.router.navigate(['/admin/orders']);
      }
    } catch (error) {
      console.error('Error loading order:', error);
      alert('Error loading order: ' + (error as any).message);
      this.router.navigate(['/admin/orders']);
    } finally {
      this.loading = false;
    }
  }

  private async loadOrderItems(): Promise<void> {
    if (!this.orderId) return;

    try {
      const orderItems = await this.supabaseService.getTable('order_items', { order_id: this.orderId });

      // Clear existing items
      while (this.orderItems.length !== 0) {
        this.orderItems.removeAt(0);
      }

      if (orderItems && orderItems.length > 0) {
        for (const item of orderItems) {
          const orderItemForm = this.createOrderItem();
          orderItemForm.patchValue({
            product_id: item.product_id || '',
            product_name: item.product_name || '',
            product_sku: item.product_sku || '',
            unit_price: item.unit_price || 0,
            quantity: item.quantity || 1,
            discount_percentage: (item as any).discount_percentage || 0,
            discount_amount: (item as any).discount_amount || 0
          });
          this.orderItems.push(orderItemForm);
        }
      } else {
        // Add one empty item for editing
        this.addOrderItem();
      }
    } catch (error) {
      console.error('Error loading order items:', error);
      // Add one empty item if loading fails
      this.addOrderItem();
    }
  }

  async onSave(): Promise<void> {
    if (!this.orderForm || this.orderForm.invalid) {
      this.orderForm?.markAllAsTouched();
      return;
    }

    this.loading = true;
    try {
      const formData = { ...this.orderForm.value };

      // Remove order_items from the order data (it should be saved separately)
      const orderItems = formData.order_items;
      delete formData.order_items;

      // Convert datetime-local back to ISO string
      if (formData.order_date) {
        formData.order_date = new Date(formData.order_date).toISOString();
      }

      // Calculate and set amounts from percentages
      formData.subtotal = this.getOrderSubtotal();
      formData.discount_amount = this.getOrderDiscountAmount();
      formData.tax_amount = this.getTaxAmount();
      formData.total_amount = this.getOrderTotal();

      // Find matching user by email and set user_id
      formData.user_id = await this.findUserByEmail(formData.customer_email);

      // Clean up form data - ensure all numeric fields are properly typed
      const cleanedFormData = {
        ...formData,
        subtotal: Number(formData.subtotal) || 0,
        discount_amount: Number(formData.discount_amount) || 0,
        tax_amount: Number(formData.tax_amount) || 0,
        total_amount: Number(formData.total_amount) || 0,
        shipping_cost: Number(formData.shipping_cost) || 0,
        discount_percentage: Number(formData.discount_percentage) || 0,
        tax_percentage: Number(formData.tax_percentage) || 0,
        is_b2b: Boolean(formData.is_b2b)
      };

      console.log('Cleaned form data for order save:', cleanedFormData);

      // Handle empty payment method - ensure valid values only
      if (!cleanedFormData.payment_method || cleanedFormData.payment_method === '') {
        delete cleanedFormData.payment_method; // Remove the field entirely if empty
      } else {
        // Ensure the payment method is one of the allowed values
        const validPaymentMethods = ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery'];
        if (!validPaymentMethods.includes(cleanedFormData.payment_method)) {
          console.error('Invalid payment method:', cleanedFormData.payment_method);
          delete cleanedFormData.payment_method;
        }
      }

      // Debug: Log the data being saved
      console.log('Order data being saved:', cleanedFormData);
      console.log('Payment method value:', cleanedFormData.payment_method);

      let savedOrder: any;

      if (this.isEditMode && this.orderId) {
        // Update existing order
        console.log('Updating order with ID:', this.orderId);
        console.log('Update data:', formData);

        try {
          // First verify the order exists
          const existingOrder = await this.supabaseService.getTableById('orders', this.orderId);
          if (!existingOrder) {
            throw new Error(`Order with ID ${this.orderId} not found`);
          }
          console.log('Existing order found:', existingOrder);

          savedOrder = await this.supabaseService.updateRecord('orders', this.orderId, cleanedFormData);
          console.log('Order updated successfully:', savedOrder);

          // Delete existing order items and create new ones
          await this.deleteExistingOrderItems();
          await this.saveOrderItems(this.orderId, orderItems);

          this.successModalTitle = this.translationService.translate('common.success');
          this.successModalMessage = this.translationService.translate('admin.orderUpdatedSuccessfully');
          this.showSuccessModal = true;
        } catch (updateError: any) {
          console.error('Error updating order:', updateError);
          throw new Error(`Failed to update order: ${updateError.message}`);
        }
      } else {
        // Create new order
        savedOrder = await this.supabaseService.createRecord('orders', cleanedFormData);

        if (savedOrder && savedOrder.id) {
          // Save order items
          await this.saveOrderItems(savedOrder.id, orderItems);
        }

        this.successModalTitle = this.translationService.translate('common.success');
        this.successModalMessage = this.translationService.translate('admin.orderCreatedSuccessfully');
        this.showSuccessModal = true;
      }
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Error saving order: ' + (error as any).message);
    } finally {
      this.loading = false;
    }
  }

  private async deleteExistingOrderItems(): Promise<void> {
    if (!this.orderId) return;

    try {
      // Get existing order items
      const existingItems = await this.supabaseService.getTable('order_items', { order_id: this.orderId });

      // Delete each item
      if (existingItems && existingItems.length > 0) {
        for (const item of existingItems) {
          await this.supabaseService.deleteRecord('order_items', item.id);
        }
      }
    } catch (error) {
      console.error('Error deleting existing order items:', error);
    }
  }

  private async saveOrderItems(orderId: string, orderItems: any[]): Promise<void> {
    if (!orderItems || orderItems.length === 0) return;

    try {
      for (const item of orderItems) {
        if (item.product_name && item.unit_price && item.quantity) {
          const unitPrice = parseFloat(item.unit_price) || 0;
          const quantity = parseInt(item.quantity) || 1;
          const discountPercentage = parseFloat(item.discount_percentage) || 0;

          // Calculate amounts
          const itemSubtotal = unitPrice * quantity;
          const discountAmount = itemSubtotal * (discountPercentage / 100);
          const totalPrice = itemSubtotal - discountAmount;

          const orderItemData = {
            order_id: orderId,
            product_id: item.product_id || null,
            product_name: item.product_name,
            product_sku: item.product_sku || null,
            unit_price: unitPrice,
            quantity: quantity,
            total_price: totalPrice,
            discount_percentage: discountPercentage,
            discount_amount: discountAmount
          };

          await this.supabaseService.createRecord('order_items', orderItemData);
        }
      }
    } catch (error) {
      console.error('Error saving order items:', error);
      throw error;
    }
  }

  onSuccessModalClose(): void {
    this.showSuccessModal = false;
    this.router.navigate(['/admin/orders']);
  }
} 