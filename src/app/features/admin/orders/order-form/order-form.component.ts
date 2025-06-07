import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { SupabaseService } from '../../../../services/supabase.service';
import { AdminFormComponent } from '../../shared/admin-form/admin-form.component';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminFormComponent],
  template: `
    <app-admin-form
      *ngIf="orderForm"
      [title]="isEditMode ? 'Edit Order' : 'Create Order'"
      subtitle="Manage customer orders and transactions"
      [form]="orderForm"
      [isEditMode]="isEditMode"
      [isSubmitting]="loading"
      backRoute="/admin/orders"
      (formSubmit)="onSave()">
      
      <div *ngIf="orderForm">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Order Information -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900">Order Information</h3>
            
            <!-- Order Number -->
            <div>
              <label for="order_number" class="block text-sm font-medium text-gray-700">Order Number *</label>
              <input
                type="text"
                id="order_number"
                formControlName="order_number"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                [class.border-red-300]="orderForm.get('order_number')?.invalid && orderForm.get('order_number')?.touched">
              <div *ngIf="orderForm.get('order_number')?.invalid && orderForm.get('order_number')?.touched" 
                   class="mt-1 text-sm text-red-600">
                Order number is required
              </div>
            </div>

            <!-- Customer Email -->
            <div>
              <label for="customer_email" class="block text-sm font-medium text-gray-700">Customer Email *</label>
              <input
                type="email"
                id="customer_email"
                formControlName="customer_email"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                [class.border-red-300]="orderForm.get('customer_email')?.invalid && orderForm.get('customer_email')?.touched">
              <div *ngIf="orderForm.get('customer_email')?.invalid && orderForm.get('customer_email')?.touched" 
                   class="mt-1 text-sm text-red-600">
                <span *ngIf="orderForm.get('customer_email')?.errors?.['required']">Customer email is required</span>
                <span *ngIf="orderForm.get('customer_email')?.errors?.['email']">Please enter a valid email</span>
              </div>
            </div>

            <!-- Total Amount -->
            <div>
              <label for="total_amount" class="block text-sm font-medium text-gray-700">Total Amount *</label>
              <div class="mt-1 relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span class="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="total_amount"
                  formControlName="total_amount"
                  step="0.01"
                  min="0"
                  class="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  [class.border-red-300]="orderForm.get('total_amount')?.invalid && orderForm.get('total_amount')?.touched">
              </div>
              <div *ngIf="orderForm.get('total_amount')?.invalid && orderForm.get('total_amount')?.touched" 
                   class="mt-1 text-sm text-red-600">
                Total amount is required
              </div>
            </div>

            <!-- Order Date -->
            <div>
              <label for="order_date" class="block text-sm font-medium text-gray-700">Order Date *</label>
              <input
                type="datetime-local"
                id="order_date"
                formControlName="order_date"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                [class.border-red-300]="orderForm.get('order_date')?.invalid && orderForm.get('order_date')?.touched">
              <div *ngIf="orderForm.get('order_date')?.invalid && orderForm.get('order_date')?.touched" 
                   class="mt-1 text-sm text-red-600">
                Order date is required
              </div>
            </div>
          </div>

          <!-- Status Information -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900">Status Information</h3>
            
            <!-- Order Status -->
            <div>
              <label for="status" class="block text-sm font-medium text-gray-700">Order Status *</label>
              <select
                id="status"
                formControlName="status"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                [class.border-red-300]="orderForm.get('status')?.invalid && orderForm.get('status')?.touched">
                <option value="">Select status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
              <div *ngIf="orderForm.get('status')?.invalid && orderForm.get('status')?.touched" 
                   class="mt-1 text-sm text-red-600">
                Order status is required
              </div>
            </div>

            <!-- Payment Status -->
            <div>
              <label for="payment_status" class="block text-sm font-medium text-gray-700">Payment Status *</label>
              <select
                id="payment_status"
                formControlName="payment_status"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                [class.border-red-300]="orderForm.get('payment_status')?.invalid && orderForm.get('payment_status')?.touched">
                <option value="">Select payment status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
                <option value="partially_refunded">Partially Refunded</option>
              </select>
              <div *ngIf="orderForm.get('payment_status')?.invalid && orderForm.get('payment_status')?.touched" 
                   class="mt-1 text-sm text-red-600">
                Payment status is required
              </div>
            </div>

            <!-- Shipping Status -->
            <div>
              <label for="shipping_status" class="block text-sm font-medium text-gray-700">Shipping Status</label>
              <select
                id="shipping_status"
                formControlName="shipping_status"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option value="">Select shipping status</option>
                <option value="not_shipped">Not Shipped</option>
                <option value="preparing">Preparing</option>
                <option value="shipped">Shipped</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="returned">Returned</option>
              </select>
            </div>

            <!-- Payment Method -->
            <div>
              <label for="payment_method" class="block text-sm font-medium text-gray-700">Payment Method</label>
              <select
                id="payment_method"
                formControlName="payment_method"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option value="">Select payment method</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="paypal">PayPal</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash_on_delivery">Cash on Delivery</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Customer Information -->
        <div class="mt-8 space-y-4">
          <h3 class="text-lg font-medium text-gray-900">Customer Information</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Customer Name -->
            <div>
              <label for="customer_name" class="block text-sm font-medium text-gray-700">Customer Name</label>
              <input
                type="text"
                id="customer_name"
                formControlName="customer_name"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            </div>

            <!-- Customer Phone -->
            <div>
              <label for="customer_phone" class="block text-sm font-medium text-gray-700">Customer Phone</label>
              <input
                type="tel"
                id="customer_phone"
                formControlName="customer_phone"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            </div>

            <!-- Shipping Address -->
            <div>
              <label for="shipping_address" class="block text-sm font-medium text-gray-700">Shipping Address</label>
              <textarea
                id="shipping_address"
                formControlName="shipping_address"
                rows="3"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter shipping address"></textarea>
            </div>

            <!-- Billing Address -->
            <div>
              <label for="billing_address" class="block text-sm font-medium text-gray-700">Billing Address</label>
              <textarea
                id="billing_address"
                formControlName="billing_address"
                rows="3"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter billing address"></textarea>
            </div>
          </div>

          <!-- Notes -->
          <div>
            <label for="notes" class="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              id="notes"
              formControlName="notes"
              rows="4"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Additional notes about the order"></textarea>
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
      total_amount: [0, [Validators.required, Validators.min(0)]],
      order_date: ['', Validators.required],
      status: ['pending', Validators.required],
      payment_status: ['pending', Validators.required],
      shipping_status: [''],
      payment_method: [''],
      shipping_address: [''],
      billing_address: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    // Check if we're in edit mode
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.isEditMode = true;
      this.orderId = orderId;
      this.loadOrder();
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