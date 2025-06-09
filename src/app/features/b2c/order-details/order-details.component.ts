import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';

import { Order } from '../../../shared/models/order.model';

@Component({
    selector: 'app-order-details',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 font-['Poppins']">Order Details</h1>
              <p class="mt-2 text-gray-600 font-['DM_Sans']" *ngIf="order">
                Order placed on {{ order.orderDate | date:'fullDate' }}
              </p>
            </div>
            <button 
              routerLink="/profile"
              [queryParams]="{tab: 'my-orders'}"
              class="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium font-['DM_Sans'] flex items-center space-x-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              <span>Back to Orders</span>
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg class="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
          <h3 class="text-lg font-medium text-red-800 mb-2">Order Not Found</h3>
          <p class="text-red-600">The order you're looking for could not be found.</p>
        </div>

        <!-- Order Content -->
        <div *ngIf="order && !loading" class="space-y-6">
          <!-- Order Summary -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <!-- Order Number -->
              <div>
                <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide font-['DM_Sans']">Order Number</h3>
                <p class="mt-1 text-lg font-semibold text-gray-900 font-['Poppins']">{{ order.orderNumber }}</p>
              </div>

              <!-- Order Status -->
              <div>
                <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide font-['DM_Sans']">Status</h3>
                <span class="mt-1 inline-flex px-3 py-1 text-sm font-medium rounded-full font-['DM_Sans']"
                      [ngClass]="{
                        'bg-yellow-100 text-yellow-800': order.status === 'pending',
                        'bg-blue-100 text-blue-800': order.status === 'confirmed',
                        'bg-purple-100 text-purple-800': order.status === 'processing',
                        'bg-indigo-100 text-indigo-800': order.status === 'shipped',
                        'bg-green-100 text-green-800': order.status === 'delivered',
                        'bg-red-100 text-red-800': order.status === 'cancelled'
                      }">
                  {{ order.status | titlecase }}
                </span>
              </div>

              <!-- Payment Status -->
              <div>
                <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide font-['DM_Sans']">Payment</h3>
                <span class="mt-1 inline-flex px-3 py-1 text-sm font-medium rounded-full font-['DM_Sans']"
                      [ngClass]="{
                        'bg-yellow-100 text-yellow-800': order.paymentStatus === 'pending',
                        'bg-green-100 text-green-800': order.paymentStatus === 'paid',
                        'bg-red-100 text-red-800': order.paymentStatus === 'failed'
                      }">
                  {{ order.paymentStatus | titlecase }}
                </span>
              </div>

              <!-- Total Amount -->
              <div>
                <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide font-['DM_Sans']">Total</h3>
                <p class="mt-1 text-lg font-semibold text-gray-900 font-['Poppins']">
                  {{ order.totalAmount | currency:'EUR':'symbol':'1.2-2' }}
                </p>
              </div>
            </div>

            <!-- Tracking Number -->
            <div *ngIf="order.trackingNumber" class="mt-6 pt-6 border-t border-gray-200">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide font-['DM_Sans']">Tracking Number</h3>
                  <p class="mt-1 text-lg font-medium text-gray-900 font-['DM_Sans']">{{ order.trackingNumber }}</p>
                </div>
                <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-['DM_Sans']">
                  Track Package
                </button>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6 font-['Poppins']">Order Items</h2>
            <div class="space-y-4">
              <div *ngFor="let item of order.items" 
                   class="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <!-- Product Image -->
                <img 
                  [src]="item.productImageUrl || '/assets/images/placeholder.jpg'" 
                  [alt]="item.productName"
                  class="w-20 h-20 object-cover rounded-lg bg-gray-100">
                
                <!-- Product Details -->
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-medium text-gray-900 font-['Poppins']">{{ item.productName }}</h3>
                  <p class="text-sm text-gray-500 font-['DM_Sans']" *ngIf="item.productSku">SKU: {{ item.productSku }}</p>
                  <div class="mt-2 flex items-center space-x-4 text-sm text-gray-600 font-['DM_Sans']">
                    <span>Qty: {{ item.quantity }}</span>
                    <span>Unit Price: {{ item.unitPrice | currency:'EUR':'symbol':'1.2-2' }}</span>
                  </div>
                </div>

                <!-- Item Total -->
                <div class="text-right">
                  <p class="text-lg font-semibold text-gray-900 font-['Poppins']">
                    {{ item.totalPrice | currency:'EUR':'symbol':'1.2-2' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6 font-['Poppins']">Order Summary</h2>
            <div class="space-y-3">
              <div class="flex justify-between font-['DM_Sans']">
                <span class="text-gray-600">Subtotal</span>
                <span class="text-gray-900">{{ order.subtotal | currency:'EUR':'symbol':'1.2-2' }}</span>
              </div>
              <div class="flex justify-between font-['DM_Sans']" *ngIf="order.taxAmount > 0">
                <span class="text-gray-600">Tax</span>
                <span class="text-gray-900">{{ order.taxAmount | currency:'EUR':'symbol':'1.2-2' }}</span>
              </div>
              <div class="flex justify-between font-['DM_Sans']" *ngIf="order.shippingCost > 0">
                <span class="text-gray-600">Shipping</span>
                <span class="text-gray-900">{{ order.shippingCost | currency:'EUR':'symbol':'1.2-2' }}</span>
              </div>
              <div class="flex justify-between font-['DM_Sans']" *ngIf="order.discountAmount > 0">
                <span class="text-gray-600">Discount</span>
                <span class="text-red-600">-{{ order.discountAmount | currency:'EUR':'symbol':'1.2-2' }}</span>
              </div>
              <div class="border-t border-gray-200 pt-3">
                <div class="flex justify-between text-lg font-semibold text-gray-900 font-['Poppins']">
                  <span>Total</span>
                  <span>{{ order.totalAmount | currency:'EUR':'symbol':'1.2-2' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Shipping Information -->
          <div *ngIf="order.shippingAddress" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6 font-['Poppins']">Shipping Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Shipping Address -->
              <div>
                <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3 font-['DM_Sans']">Shipping Address</h3>
                <div class="space-y-1 text-gray-900 font-['DM_Sans']">
                  <p class="font-medium">{{ order.shippingAddress.firstName }} {{ order.shippingAddress.lastName }}</p>
                  <p>{{ order.shippingAddress.addressLine1 }}</p>
                  <p *ngIf="order.shippingAddress.addressLine2">{{ order.shippingAddress.addressLine2 }}</p>
                  <p>{{ order.shippingAddress.city }}, {{ order.shippingAddress.state }} {{ order.shippingAddress.postalCode }}</p>
                  <p>{{ order.shippingAddress.country }}</p>
                  <p *ngIf="order.shippingAddress.phone">{{ order.shippingAddress.phone }}</p>
                </div>
              </div>

              <!-- Billing Address -->
              <div *ngIf="order.billingAddress">
                <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3 font-['DM_Sans']">Billing Address</h3>
                <div class="space-y-1 text-gray-900 font-['DM_Sans']">
                  <p class="font-medium">{{ order.billingAddress.firstName }} {{ order.billingAddress.lastName }}</p>
                  <p>{{ order.billingAddress.addressLine1 }}</p>
                  <p *ngIf="order.billingAddress.addressLine2">{{ order.billingAddress.addressLine2 }}</p>
                  <p>{{ order.billingAddress.city }}, {{ order.billingAddress.state }} {{ order.billingAddress.postalCode }}</p>
                  <p>{{ order.billingAddress.country }}</p>
                  <p *ngIf="order.billingAddress.phone">{{ order.billingAddress.phone }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Method -->
          <div *ngIf="order.paymentMethod" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4 font-['Poppins']">Payment Method</h2>
            <div class="flex items-center space-x-3">
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              <span class="text-gray-900 font-medium font-['DM_Sans']">{{ order.paymentMethod | titlecase }}</span>
            </div>
          </div>

          <!-- Order Notes -->
          <div *ngIf="order.notes" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4 font-['Poppins']">Order Notes</h2>
            <p class="text-gray-700 font-['DM_Sans']">{{ order.notes }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  `]
})
export class OrderDetailsComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private supabaseService = inject(SupabaseService);

    order: Order | null = null;
    loading = true;
    error = false;

    ngOnInit(): void {
        const orderId = this.route.snapshot.paramMap.get('id');
        if (orderId) {
            this.loadOrder(orderId);
        } else {
            this.error = true;
            this.loading = false;
        }
    }

    private async loadOrder(orderId: string): Promise<void> {
        try {
            this.loading = true;
            this.error = false;

            // Load order from database
            const orderData = await this.supabaseService.getTableById('orders', orderId);

            if (!orderData) {
                this.error = true;
                return;
            }

            // Load order items
            const orderItemsData = await this.supabaseService.getTable('order_items', {
                order_id: orderId
            });

            // Convert database order to Order model
            this.order = {
                id: orderData.id,
                orderNumber: orderData.order_number,
                userId: orderData.user_id,
                customerEmail: orderData.customer_email,
                customerName: orderData.customer_name,
                customerPhone: orderData.customer_phone,
                totalAmount: orderData.total_amount,
                subtotal: orderData.subtotal,
                taxAmount: orderData.tax_amount || 0,
                shippingCost: orderData.shipping_cost || 0,
                discountAmount: orderData.discount_amount || 0,
                status: orderData.status,
                paymentStatus: orderData.payment_status,
                shippingStatus: orderData.shipping_status,
                paymentMethod: orderData.payment_method,
                orderDate: orderData.order_date,
                shippingAddress: orderData.shipping_address,
                billingAddress: orderData.billing_address,
                trackingNumber: orderData.tracking_number,
                notes: orderData.notes,
                adminNotes: orderData.admin_notes,
                items: (orderItemsData || []).map((itemData: any) => ({
                    id: itemData.id,
                    orderId: itemData.order_id,
                    productId: itemData.product_id,
                    productName: itemData.product_name,
                    productSku: itemData.product_sku,
                    quantity: itemData.quantity,
                    unitPrice: itemData.unit_price,
                    totalPrice: itemData.total_price,
                    productImageUrl: itemData.product_image_url,
                    productSpecifications: itemData.product_specifications,
                    createdAt: itemData.created_at
                })),
                createdAt: orderData.created_at,
                updatedAt: orderData.updated_at
            };

        } catch (error) {
            console.error('Error loading order:', error);
            this.error = true;
        } finally {
            this.loading = false;
        }
    }
} 