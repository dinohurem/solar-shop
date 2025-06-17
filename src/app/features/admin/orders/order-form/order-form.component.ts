import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { SupabaseService } from '../../../../services/supabase.service';
import { AdminFormComponent } from '../../shared/admin-form/admin-form.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminFormComponent, TranslatePipe],
  template: `
    <app-admin-form
      *ngIf="orderForm"
      [title]="isEditMode ? ('admin.editOrder' | translate) : ('admin.createOrder' | translate)"
      [subtitle]="isEditMode ? ('admin.updateOrderInformation' | translate) : ('admin.addNewOrder' | translate)"
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
            {{ 'admin.orderInformation' | translate }}
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
                {{ 'admin.orderNumber' | translate }} *
              </label>
              <div *ngIf="orderForm.get('order_number')?.invalid && orderForm.get('order_number')?.touched" class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                {{ 'admin.orderNumberRequired' | translate }}
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
                {{ 'admin.orderDate' | translate }} *
              </label>
              <div *ngIf="orderForm.get('order_date')?.invalid && orderForm.get('order_date')?.touched" class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                {{ 'admin.orderDateRequired' | translate }}
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
            {{ 'admin.customerInformation' | translate }}
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
                {{ 'admin.customerEmail' | translate }} *
              </label>
              <div *ngIf="orderForm.get('customer_email')?.invalid && orderForm.get('customer_email')?.touched" class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                <span *ngIf="orderForm.get('customer_email')?.errors?.['required']">{{ 'admin.customerEmailRequired' | translate }}</span>
                <span *ngIf="orderForm.get('customer_email')?.errors?.['email']">{{ 'admin.validEmailRequired' | translate }}</span>
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
                {{ 'admin.customerName' | translate }}
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
                {{ 'admin.customerPhone' | translate }}
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
                {{ 'admin.shippingAddress' | translate }}
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
                {{ 'admin.billingAddress' | translate }}
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
              {{ 'admin.orderItems' | translate }}
            </h3>
            <button
              type="button"
              (click)="addOrderItem()"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              <span>{{ 'admin.addItem' | translate }}</span>
            </button>
          </div>

          <div formArrayName="order_items" class="space-y-4">
            <div *ngFor="let item of orderItems.controls; let i = index" [formGroupName]="i" 
                 class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div class="grid grid-cols-1 lg:grid-cols-6 gap-4 items-end">
                <div class="relative">
                  <input
                    type="text"
                    formControlName="product_name"
                    class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                    placeholder="Product Name"
                  >
                  <label class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                    {{ 'admin.productName' | translate }} *
                  </label>
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
                    {{ 'admin.unitPrice' | translate }} *
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
                    {{ 'admin.quantity' | translate }} *
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
                    {{ 'admin.discountPercent' | translate }}
                  </label>
                </div>

                <div class="text-center">
                  <p class="text-sm font-medium text-gray-700 mb-2">{{ 'admin.subtotal' | translate }}</p>
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
            <p class="mb-4">{{ 'admin.noOrderItems' | translate }}</p>
            <button
              type="button"
              (click)="addOrderItem()"
              class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
              {{ 'admin.addFirstItem' | translate }}
            </button>
          </div>
        </div>

        <!-- Pricing & Discounts -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
            </svg>
            {{ 'admin.pricingDiscounts' | translate }}
          </h3>
          
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div class="relative">
              <input
                type="number"
                id="order_discount_percentage"
                formControlName="order_discount_percentage"
                step="0.1"
                min="0"
                max="100"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="0"
              >
              <label for="order_discount_percentage" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.orderDiscountPercent' | translate }}
              </label>
            </div>

            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
              <h4 class="text-sm font-medium text-gray-700 mb-3">{{ 'admin.orderSummary' | translate }}</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">{{ 'admin.subtotal' | translate }}:</span>
                  <span class="font-medium">{{ getOrderSubtotal() | currency:'EUR':'symbol':'1.2-2' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">{{ 'admin.itemDiscounts' | translate }}:</span>
                  <span class="font-medium text-red-600">-{{ getItemDiscountsTotal() | currency:'EUR':'symbol':'1.2-2' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">{{ 'admin.orderDiscount' | translate }}:</span>
                  <span class="font-medium text-red-600">-{{ getOrderDiscountAmount() | currency:'EUR':'symbol':'1.2-2' }}</span>
                </div>
                <div class="border-t border-blue-200 pt-2 flex justify-between">
                  <span class="font-semibold text-gray-900">{{ 'admin.total' | translate }}:</span>
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
            {{ 'admin.statusInformation' | translate }}
          </h3>
          
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div class="relative">
              <select
                id="status"
                formControlName="status"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 bg-white appearance-none"
              >
                <option value="">{{ 'admin.selectStatus' | translate }}</option>
                <option value="pending">{{ 'admin.pending' | translate }}</option>
                <option value="confirmed">{{ 'admin.confirmed' | translate }}</option>
                <option value="processing">{{ 'admin.processing' | translate }}</option>
                <option value="shipped">{{ 'admin.shipped' | translate }}</option>
                <option value="delivered">{{ 'admin.delivered' | translate }}</option>
                <option value="cancelled">{{ 'admin.cancelled' | translate }}</option>
                <option value="refunded">{{ 'admin.refunded' | translate }}</option>
              </select>
              <label class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700">
                {{ 'admin.orderStatus' | translate }} *
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
                {{ 'admin.orderStatusRequired' | translate }}
              </div>
            </div>

            <div class="relative">
              <select
                id="payment_status"
                formControlName="payment_status"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 bg-white appearance-none"
              >
                <option value="">{{ 'admin.selectPaymentStatus' | translate }}</option>
                <option value="pending">{{ 'admin.pending' | translate }}</option>
                <option value="paid">{{ 'admin.paid' | translate }}</option>
                <option value="failed">{{ 'admin.failed' | translate }}</option>
                <option value="refunded">{{ 'admin.refunded' | translate }}</option>
                <option value="partially_refunded">{{ 'admin.partiallyRefunded' | translate }}</option>
              </select>
              <label class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700">
                {{ 'admin.paymentStatus' | translate }} *
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
                {{ 'admin.paymentStatusRequired' | translate }}
              </div>
            </div>

            <div class="relative">
              <select
                id="payment_method"
                formControlName="payment_method"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 bg-white appearance-none"
              >
                <option value="">{{ 'admin.selectPaymentMethod' | translate }}</option>
                <option value="credit_card">{{ 'admin.creditCard' | translate }}</option>
                <option value="debit_card">{{ 'admin.debitCard' | translate }}</option>
                <option value="paypal">PayPal</option>
                <option value="bank_transfer">{{ 'admin.bankTransfer' | translate }}</option>
                <option value="cash_on_delivery">{{ 'admin.cashOnDelivery' | translate }}</option>
              </select>
              <label class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700">
                {{ 'admin.paymentMethod' | translate }}
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
            {{ 'admin.additionalNotes' | translate }}
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
              {{ 'admin.notesAboutOrder' | translate }}
            </label>
          </div>
        </div>
      </div>
    </app-admin-form>
  `
})
export class OrderFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private supabaseService = inject(SupabaseService);
  private title = inject(Title);

  orderForm: FormGroup | null = null;
  loading = false;
  isEditMode = false;
  orderId: string | null = null;

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
      order_discount_percentage: [0, [Validators.min(0), Validators.max(100)]],
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

    // Set page title
    this.title.setTitle(this.isEditMode ? 'Edit Order - Solar Shop Admin' : 'Create Order - Solar Shop Admin');
  }

  createOrderItem(): FormGroup {
    return this.fb.group({
      product_name: ['', Validators.required],
      unit_price: [0, [Validators.required, Validators.min(0)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      discount_percentage: [0, [Validators.min(0), Validators.max(100)]]
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
    const orderDiscountPercentage = this.orderForm?.get('order_discount_percentage')?.value || 0;
    return subtotalAfterItemDiscounts * (orderDiscountPercentage / 100);
  }

  getOrderTotal(): number {
    const subtotal = this.getOrderSubtotal();
    const itemDiscounts = this.getItemDiscountsTotal();
    const orderDiscount = this.getOrderDiscountAmount();
    return Math.max(0, subtotal - itemDiscounts - orderDiscount);
  }

  private async loadOrder(): Promise<void> {
    if (!this.orderId || !this.orderForm) return;

    this.loading = true;
    try {
      const data = await this.supabaseService.getTableById('orders', this.orderId);
      if (data) {
        // Format dates for datetime-local inputs
        const formData = {
          ...data,
          order_date: data.order_date ? new Date(data.order_date).toISOString().slice(0, 16) : ''
        };
        this.orderForm.patchValue(formData);

        // Load order items if they exist
        // For now, add a sample item
        this.addOrderItem();
      }
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      this.loading = false;
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

      // Convert datetime-local back to ISO string
      if (formData.order_date) {
        formData.order_date = new Date(formData.order_date).toISOString();
      }

      // Calculate total amount from order items and discounts
      formData.total_amount = this.getOrderTotal();

      if (this.isEditMode && this.orderId) {
        await this.supabaseService.updateRecord('orders', this.orderId, formData);
        alert('Order updated successfully');
      } else {
        await this.supabaseService.createRecord('orders', formData);
        alert('Order created successfully');
      }

      this.router.navigate(['/admin/orders']);
    } catch (error) {
      console.warn('Orders table not found in database:', error);
      alert('Orders functionality is not yet available. The orders table needs to be created in the database.');
      this.router.navigate(['/admin/orders']);
    } finally {
      this.loading = false;
    }
  }
} 