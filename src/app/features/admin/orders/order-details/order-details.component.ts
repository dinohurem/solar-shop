import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { SupabaseService } from '../../../../services/supabase.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="space-y-6" *ngIf="order">
      <!-- Header -->
      <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-4">
            <button 
              (click)="goBack()"
              class="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors duration-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
            </button>
            <div>
              <h1 class="text-3xl font-bold text-gray-900">{{ 'admin.orderNumber' | translate }} {{ order.order_number }}</h1>
              <p class="text-gray-600 mt-1">{{ 'admin.orderDetailsAndLineItems' | translate }}</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-3">
            <span class="px-3 py-1 rounded-full text-sm font-medium"
                  [class]="getStatusClass(order.status)">
              {{ formatStatus(order.status) }}
            </span>
            <span class="px-3 py-1 rounded-full text-sm font-medium"
                  [class]="getPaymentStatusClass(order.payment_status)">
              {{ formatPaymentStatus(order.payment_status) }}
            </span>
            <button 
              (click)="editOrder()"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              <span>{{ 'admin.editOrder' | translate }}</span>
            </button>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
            <h3 class="text-sm font-medium text-gray-700 mb-2">{{ 'admin.totalAmount' | translate }}</h3>
            <p class="text-2xl font-bold text-blue-600">{{ getOrderTotal() | currency:'EUR':'symbol':'1.2-2' }}</p>
          </div>
          
          <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
            <h3 class="text-sm font-medium text-gray-700 mb-2">{{ 'admin.items' | translate }}</h3>
            <p class="text-2xl font-bold text-green-600">{{ orderItems.length }}</p>
          </div>
          
          <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
            <h3 class="text-sm font-medium text-gray-700 mb-2">{{ 'admin.orderDate' | translate }}</h3>
            <p class="text-lg font-semibold text-purple-600">{{ order.created_at | date:'mediumDate' }}</p>
          </div>
          
          <div class="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-100">
            <h3 class="text-sm font-medium text-gray-700 mb-2">{{ 'admin.paymentMethod' | translate }}</h3>
            <p class="text-lg font-semibold text-orange-600 capitalize">{{ order.payment_method || ('admin.creditCard' | translate) }}</p>
          </div>
        </div>
      </div>

      <!-- Customer Information -->
      <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">{{ 'admin.customerInformation' | translate }}</h2>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">{{ 'admin.billingAddress' | translate }}</h3>
            <div class="space-y-2 text-gray-700">
              <p class="font-medium">{{ order.customer_name || order.customer_email }}</p>
              <p>{{ order.billing_address?.street || 'N/A' }}</p>
              <p>{{ order.billing_address?.city || 'N/A' }}, {{ order.billing_address?.postal_code || 'N/A' }}</p>
              <p>{{ order.billing_address?.country || 'N/A' }}</p>
              <p class="text-blue-600">{{ order.customer_email }}</p>
              <p *ngIf="order.customer_phone">{{ order.customer_phone }}</p>
            </div>
          </div>

          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">{{ 'admin.shippingAddress' | translate }}</h3>
            <div class="space-y-2 text-gray-700">
              <p class="font-medium">{{ order.shipping_address?.name || order.customer_name || order.customer_email }}</p>
              <p>{{ order.shipping_address?.street || order.billing_address?.street || 'N/A' }}</p>
              <p>{{ order.shipping_address?.city || order.billing_address?.city || 'N/A' }}, {{ order.shipping_address?.postal_code || order.billing_address?.postal_code || 'N/A' }}</p>
              <p>{{ order.shipping_address?.country || order.billing_address?.country || 'N/A' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Items -->
      <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6" [formGroup]="orderItemsForm">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900">{{ 'admin.orderItems' | translate }}</h2>
          <button 
            (click)="addItem()"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            <span>{{ 'admin.addItem' | translate }}</span>
          </button>
        </div>

        <div formArrayName="items" class="space-y-4" *ngIf="orderItemsArray.length > 0; else noItems">
          <div *ngFor="let item of orderItemsArray.controls; let i = index" [formGroupName]="i"
               class="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors duration-200">
            <div class="grid grid-cols-1 lg:grid-cols-7 gap-4 items-end">
              <div class="relative">
                <input 
                  type="text"
                  formControlName="product_name"
                  class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                  placeholder="Product Name">
                <label class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                  {{ 'admin.productName' | translate }}
                </label>
              </div>

              <div class="relative">
                <input 
                  type="text"
                  formControlName="product_sku"
                  class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                  placeholder="SKU">
                <label class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                  SKU
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
                  placeholder="0.00">
                <label class="absolute left-10 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                  {{ 'admin.unitPrice' | translate }}
                </label>
              </div>

              <div class="relative">
                <input 
                  type="number"
                  formControlName="quantity"
                  min="1"
                  class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                  placeholder="1">
                <label class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                  {{ 'admin.quantity' | translate }}
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
                  placeholder="0">
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
                  (click)="removeItem(i)"
                  class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <ng-template #noItems>
          <div class="text-center py-12">
            <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">{{ 'admin.noItemsInOrder' | translate }}</h3>
            <p class="text-gray-500 mb-4">{{ 'admin.addItemsToOrder' | translate }}</p>
            <button 
              (click)="addItem()"
              class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
              {{ 'admin.addFirstItem' | translate }}
            </button>
          </div>
        </ng-template>
      </div>

      <!-- Order Discounts -->
      <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6" [formGroup]="orderDiscountForm">
        <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <svg class="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
          </svg>
          {{ 'admin.orderDiscount' | translate }}
        </h3>
        
        <div class="relative max-w-xs">
          <input
            type="number"
            formControlName="discount_percentage"
            min="0"
            max="100"
            step="0.1"
            class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
            placeholder="0">
          <label class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
            {{ 'admin.orderDiscountPercent' | translate }}
          </label>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200 p-6">
        <h3 class="text-xl font-semibold text-gray-900 mb-6">{{ 'admin.orderSummary' | translate }}</h3>
        
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-gray-700">{{ 'admin.subtotal' | translate }}:</span>
            <span class="font-semibold text-gray-900">{{ getSubtotal() | currency:'EUR':'symbol':'1.2-2' }}</span>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="text-gray-700">{{ 'admin.itemDiscounts' | translate }}:</span>
            <span class="font-semibold text-red-600">-{{ getItemDiscountsTotal() | currency:'EUR':'symbol':'1.2-2' }}</span>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="text-gray-700">{{ 'admin.orderDiscount' | translate }}:</span>
            <span class="font-semibold text-red-600">-{{ getOrderDiscountAmount() | currency:'EUR':'symbol':'1.2-2' }}</span>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="text-gray-700">{{ 'admin.shipping' | translate }}:</span>
            <span class="font-semibold text-gray-900">{{ order.shipping_cost || 0 | currency:'EUR':'symbol':'1.2-2' }}</span>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="text-gray-700">{{ 'admin.tax' | translate }}:</span>
            <span class="font-semibold text-gray-900">{{ order.tax_amount || 0 | currency:'EUR':'symbol':'1.2-2' }}</span>
          </div>
          
          <div class="border-t border-gray-300 pt-4 flex justify-between items-center">
            <span class="text-xl font-bold text-gray-900">{{ 'admin.total' | translate }}:</span>
            <span class="text-2xl font-bold text-blue-600">{{ getOrderTotal() | currency:'EUR':'symbol':'1.2-2' }}</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end space-x-4 pb-6">
        <button 
          (click)="printInvoice()"
          class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
          </svg>
          <span>{{ 'admin.printInvoice' | translate }}</span>
        </button>
        
        <button 
          (click)="saveChanges()"
          [disabled]="!hasChanges"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
          </svg>
          <span>{{ 'admin.saveChanges' | translate }}</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div *ngIf="!order && !error" class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div *ngIf="error" class="text-center py-12">
      <svg class="w-16 h-16 text-red-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">{{ 'admin.orderNotFound' | translate }}</h3>
      <p class="text-gray-500 mb-4">{{ error }}</p>
      <button 
        (click)="goBack()"
        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
        {{ 'admin.goBack' | translate }}
      </button>
    </div>
  `
})
export class OrderDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private supabaseService = inject(SupabaseService);
  private title = inject(Title);
  private fb = inject(FormBuilder);

  order: any = null;
  orderItems: any[] = [];
  originalOrderItems: any[] = [];
  originalOrderDiscount = 0;
  hasChanges = false;
  error: string | null = null;

  orderItemsForm: FormGroup;
  orderDiscountForm: FormGroup;

  constructor() {
    this.orderItemsForm = this.fb.group({
      items: this.fb.array([])
    });

    this.orderDiscountForm = this.fb.group({
      discount_percentage: [0, [Validators.min(0), Validators.max(100)]]
    });

    // Subscribe to form changes
    this.orderItemsForm.valueChanges.subscribe(() => this.checkForChanges());
    this.orderDiscountForm.valueChanges.subscribe(() => this.checkForChanges());
  }

  get orderItemsArray(): FormArray {
    return this.orderItemsForm.get('items') as FormArray;
  }

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrderDetails(orderId);
    } else {
      this.error = 'No order ID provided';
    }
  }

  private async loadOrderDetails(orderId: string): Promise<void> {
    try {
      this.order = await this.supabaseService.getTableById('orders', orderId);
      if (this.order) {
        this.title.setTitle(`Order ${this.order.order_number} - Order Details - Solar Shop Admin`);
        await this.loadOrderItems(orderId);
        this.loadOrderDiscount();
      } else {
        this.error = 'Order not found';
      }
    } catch (error) {
      console.error('Error loading order:', error);
      this.error = 'Error loading order details';
    }
  }

  private async loadOrderItems(orderId: string): Promise<void> {
    try {
      // Simulate order items (in a real implementation, you'd load from order_items table)
      const simulatedItems = [
        {
          id: '1',
          product_id: 'prod_1',
          product_name: 'Solar Panel 400W',
          product_sku: 'SP-400W-001',
          unit_price: 299.99,
          quantity: 2,
          discount_percentage: 5,
          product: {
            name: 'Solar Panel 400W',
            sku: 'SP-400W-001',
            category: 'Solar Panels',
            image_url: '/assets/images/solar-panel-placeholder.jpg'
          }
        },
        {
          id: '2',
          product_id: 'prod_2',
          product_name: 'Inverter 5kW',
          product_sku: 'INV-5KW-001',
          unit_price: 1299.99,
          quantity: 1,
          discount_percentage: 0,
          product: {
            name: 'Inverter 5kW',
            sku: 'INV-5KW-001',
            category: 'Inverters',
            image_url: '/assets/images/inverter-placeholder.jpg'
          }
        }
      ];

      this.orderItems = simulatedItems;
      this.originalOrderItems = JSON.parse(JSON.stringify(simulatedItems));

      // Populate form array
      const itemsArray = this.orderItemsArray;
      itemsArray.clear();
      this.orderItems.forEach(item => {
        itemsArray.push(this.createItemFormGroup(item));
      });

    } catch (error) {
      console.error('Error loading order items:', error);
      this.orderItems = [];
      this.originalOrderItems = [];
    }
  }

  private loadOrderDiscount(): void {
    const discountPercentage = this.order.order_discount_percentage || 0;
    this.originalOrderDiscount = discountPercentage;
    this.orderDiscountForm.patchValue({ discount_percentage: discountPercentage });
  }

  private createItemFormGroup(item?: any): FormGroup {
    return this.fb.group({
      id: [item?.id || ''],
      product_name: [item?.product_name || '', Validators.required],
      product_sku: [item?.product_sku || ''],
      unit_price: [item?.unit_price || 0, [Validators.required, Validators.min(0)]],
      quantity: [item?.quantity || 1, [Validators.required, Validators.min(1)]],
      discount_percentage: [item?.discount_percentage || 0, [Validators.min(0), Validators.max(100)]]
    });
  }

  addItem(): void {
    this.orderItemsArray.push(this.createItemFormGroup());
    this.checkForChanges();
  }

  removeItem(index: number): void {
    if (confirm('Are you sure you want to remove this item from the order?')) {
      this.orderItemsArray.removeAt(index);
      this.checkForChanges();
    }
  }

  getItemSubtotal(index: number): number {
    const item = this.orderItemsArray.at(index);
    const unitPrice = item.get('unit_price')?.value || 0;
    const quantity = item.get('quantity')?.value || 0;
    const discountPercentage = item.get('discount_percentage')?.value || 0;

    const subtotal = unitPrice * quantity;
    const discountAmount = subtotal * (discountPercentage / 100);
    return subtotal - discountAmount;
  }

  getSubtotal(): number {
    let total = 0;
    for (let i = 0; i < this.orderItemsArray.length; i++) {
      const item = this.orderItemsArray.at(i);
      const unitPrice = item.get('unit_price')?.value || 0;
      const quantity = item.get('quantity')?.value || 0;
      total += unitPrice * quantity;
    }
    return total;
  }

  getItemDiscountsTotal(): number {
    let totalDiscount = 0;
    for (let i = 0; i < this.orderItemsArray.length; i++) {
      const item = this.orderItemsArray.at(i);
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
    const subtotalAfterItemDiscounts = this.getSubtotal() - this.getItemDiscountsTotal();
    const orderDiscountPercentage = this.orderDiscountForm.get('discount_percentage')?.value || 0;
    return subtotalAfterItemDiscounts * (orderDiscountPercentage / 100);
  }

  getOrderTotal(): number {
    const subtotal = this.getSubtotal();
    const itemDiscounts = this.getItemDiscountsTotal();
    const orderDiscount = this.getOrderDiscountAmount();
    const shipping = this.order?.shipping_cost || 0;
    const tax = this.order?.tax_amount || 0;
    return Math.max(0, subtotal - itemDiscounts - orderDiscount + shipping + tax);
  }

  trackByItemId(index: number, item: any): any {
    return item.id;
  }

  private checkForChanges(): void {
    const currentItems = this.orderItemsForm.value.items;
    const currentDiscount = this.orderDiscountForm.get('discount_percentage')?.value || 0;

    const itemsChanged = JSON.stringify(currentItems) !== JSON.stringify(this.originalOrderItems.map(item => ({
      id: item.id,
      product_name: item.product_name,
      product_sku: item.product_sku,
      unit_price: item.unit_price,
      quantity: item.quantity,
      discount_percentage: item.discount_percentage
    })));

    const discountChanged = currentDiscount !== this.originalOrderDiscount;

    this.hasChanges = itemsChanged || discountChanged;
  }

  async saveChanges(): Promise<void> {
    if (!this.hasChanges) return;

    try {
      // In a real implementation, you would save to order_items table and update order
      console.log('Saving order changes:', {
        items: this.orderItemsForm.value.items,
        discount: this.orderDiscountForm.value.discount_percentage,
        total: this.getOrderTotal()
      });

      this.originalOrderItems = JSON.parse(JSON.stringify(this.orderItemsForm.value.items));
      this.originalOrderDiscount = this.orderDiscountForm.get('discount_percentage')?.value || 0;
      this.hasChanges = false;

      alert('Order changes saved successfully!');
    } catch (error) {
      console.error('Error saving order changes:', error);
      alert('Error saving changes. Please try again.');
    }
  }

  printInvoice(): void {
    console.log('Printing invoice for order:', this.order.order_number);
    alert(`Invoice printing for order ${this.order.order_number} would start here`);
  }

  editOrder(): void {
    this.router.navigate(['/admin/orders/edit', this.order.id]);
  }

  goBack(): void {
    this.router.navigate(['/admin/orders']);
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'processing': 'bg-purple-100 text-purple-800',
      'shipped': 'bg-indigo-100 text-indigo-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'refunded': 'bg-gray-100 text-gray-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }

  getPaymentStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'paid': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
      'refunded': 'bg-orange-100 text-orange-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }

  formatStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'processing': 'Processing',
      'shipped': 'Shipped',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
      'refunded': 'Refunded'
    };
    return statusMap[status] || status;
  }

  formatPaymentStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Payment Pending',
      'paid': 'Paid',
      'failed': 'Payment Failed',
      'refunded': 'Refunded'
    };
    return statusMap[status] || status;
  }
} 