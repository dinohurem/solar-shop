import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { SupabaseService } from '../../../services/supabase.service';
import { CartService } from '../cart/services/cart.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../shared/services/translation.service';
import * as CartActions from '../cart/store/cart.actions';

import { Order } from '../../../shared/models/order.model';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, DatePipe],
  providers: [DatePipe],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 font-['Poppins']">{{ 'orderDetails.title' | translate }}</h1>
              <p class="mt-2 text-gray-600 font-['DM_Sans']" *ngIf="order">
                {{ 'orderDetails.orderPlacedOn' | translate }} {{ getFormattedDate(order.orderDate) }}
              </p>
            </div>
            <button 
              routerLink="/profil"
              [queryParams]="{tab: 'my-orders'}"
              class="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium font-['DM_Sans'] flex items-center space-x-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              <span>{{ 'orderDetails.backToOrders' | translate }}</span>
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
          <h3 class="text-lg font-medium text-red-800 mb-2">{{ 'orderDetails.orderNotFound' | translate }}</h3>
          <p class="text-red-600">{{ 'orderDetails.orderNotFoundMessage' | translate }}</p>
        </div>

        <!-- Order Content -->
        <div *ngIf="order && !loading" class="space-y-6">
          <!-- Order Summary -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <!-- Order Number -->
              <div>
                <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide font-['DM_Sans']">{{ 'orderDetails.orderNumber' | translate }}</h3>
                <p class="mt-1 text-lg font-semibold text-gray-900 font-['Poppins']">{{ order.orderNumber }}</p>
              </div>

              <!-- Order Status -->
              <div>
                <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide font-['DM_Sans']">{{ 'orderDetails.status' | translate }}</h3>
                <span class="mt-1 inline-flex px-3 py-1 text-sm font-medium rounded-full font-['DM_Sans']"
                      [ngClass]="{
                        'bg-yellow-100 text-yellow-800': order.status === 'pending',
                        'bg-blue-100 text-blue-800': order.status === 'confirmed',
                        'bg-purple-100 text-purple-800': order.status === 'processing',
                        'bg-indigo-100 text-indigo-800': order.status === 'shipped',
                        'bg-green-100 text-green-800': order.status === 'delivered',
                        'bg-red-100 text-red-800': order.status === 'cancelled'
                      }">
                  {{ 'admin.orderStatus.' + order.status | translate }}
                </span>
              </div>

              <!-- Payment Status -->
              <div>
                <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide font-['DM_Sans']">{{ 'orderDetails.payment' | translate }}</h3>
                <span class="mt-1 inline-flex px-3 py-1 text-sm font-medium rounded-full font-['DM_Sans']"
                      [ngClass]="{
                        'bg-yellow-100 text-yellow-800': order.paymentStatus === 'pending',
                        'bg-green-100 text-green-800': order.paymentStatus === 'paid',
                        'bg-red-100 text-red-800': order.paymentStatus === 'failed'
                      }">
                  {{ 'admin.paymentStatus.' + order.paymentStatus | translate }}
                </span>
              </div>

              <!-- Total Amount -->
              <div>
                <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide font-['DM_Sans']">{{ 'orderDetails.total' | translate }}</h3>
                <p class="mt-1 text-lg font-semibold text-gray-900 font-['Poppins']">
                  {{ order.subtotal | currency:'EUR':'symbol':'1.2-2' }}
                </p>
              </div>
            </div>

            <!-- Tracking Number -->
            <div *ngIf="order.trackingNumber" class="mt-6 pt-6 border-t border-gray-200">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide font-['DM_Sans']">{{ 'orderDetails.trackingNumber' | translate }}</h3>
                  <p class="mt-1 text-lg font-medium text-gray-900 font-['DM_Sans']">{{ order.trackingNumber }}</p>
                </div>
                <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-['DM_Sans']">
                  {{ 'orderDetails.trackPackage' | translate }}
                </button>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gray-900 font-['Poppins']">{{ 'orderDetails.orderItems' | translate }}</h2>
            </div>
            <div class="space-y-4" *ngIf="order.items && order.items.length > 0; else noItems">
              <div *ngFor="let item of order.items" 
                   class="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <!-- Product Image -->
                <div class="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
                  <img 
                    *ngIf="item.productImageUrl && !hasImageError(item.id); else productIcon"
                    [src]="item.productImageUrl" 
                    [alt]="item.productName"
                    class="w-full h-full object-cover"
                    (error)="onImageError(item.id)"
                    (load)="onImageLoad(item.id)">
                  <ng-template #productIcon>
                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                    </svg>
                  </ng-template>
                </div>
                
                <!-- Product Details -->
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-medium text-gray-900 font-['Poppins']">{{ item.productName }}</h3>
                  <p class="text-sm text-gray-500 font-['DM_Sans']" *ngIf="item.productSku">SKU: {{ item.productSku }}</p>
                  <div class="mt-2 flex items-center space-x-4 text-sm text-gray-600 font-['DM_Sans']">
                    <span>{{ 'orderDetails.qty' | translate }}: {{ item.quantity }}</span>
                    <span>{{ 'orderDetails.unitPrice' | translate }}: {{ item.unitPrice | currency:'EUR':'symbol':'1.2-2' }}</span>
                    <span *ngIf="item.discountAmount && item.discountAmount > 0" class="text-red-600">
                      {{ 'orderDetails.itemDiscount' | translate }}: -{{ item.discountAmount | currency:'EUR':'symbol':'1.2-2' }}
                      <span *ngIf="item.discountPercentage && item.discountPercentage > 0" class="text-xs">
                        ({{ item.discountPercentage }}%)
                      </span>
                    </span>
                  </div>
                  <div class="mt-2">
                    <a 
                      *ngIf="item.productId || item.productName; else disabledLink"
                      [routerLink]="item.productId ? ['/proizvodi', item.productId] : ['/proizvodi']"
                      [queryParams]="!item.productId && item.productName ? { search: item.productName } : null"
                      class="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer transition-colors">
                      {{ item.productId ? ('orderDetails.viewDetails' | translate) : ('orderDetails.searchForProduct' | translate) }}
                    </a>
                    <ng-template #disabledLink>
                      <span class="inline-flex items-center text-xs text-gray-400 font-medium">
                        {{ 'orderDetails.productDetailsNotAvailable' | translate }}
                      </span>
                    </ng-template>
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
            <ng-template #noItems>
              <div class="text-center py-8">
                <p class="text-gray-500 font-['DM_Sans']">{{ 'orderDetails.noItemsFound' | translate }}</p>
              </div>
            </ng-template>
          </div>

          <!-- Order Summary -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6 font-['Poppins']">{{ 'orderDetails.orderSummary' | translate }}</h2>
            <div class="space-y-3">
              <div class="flex justify-between font-['DM_Sans']">
                <span class="text-gray-600">{{ 'orderDetails.subtotal' | translate }}</span>
                <span class="text-gray-900">{{ order.subtotal | currency:'EUR':'symbol':'1.2-2' }}</span>
              </div>
              <div class="flex justify-between font-['DM_Sans']" *ngIf="order.discountAmount > 0">
                <span class="text-gray-600">{{ 'orderDetails.discount' | translate }}</span>
                <span class="text-red-600">-{{ order.discountAmount | currency:'EUR':'symbol':'1.2-2' }}</span>
              </div>
              <div class="border-t border-gray-200 pt-3">
                <div class="flex justify-between text-lg font-semibold text-gray-900 font-['Poppins']">
                  <span>{{ 'orderDetails.total' | translate }}</span>
                  <span>{{ order.subtotal | currency:'EUR':'symbol':'1.2-2' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Shipping Information -->
          <div *ngIf="order.shippingAddress" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6 font-['Poppins']">{{ 'orderDetails.shippingInformation' | translate }}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Shipping Address -->
              <div>
                <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3 font-['DM_Sans']">{{ 'orderDetails.shippingAddress' | translate }}</h3>
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
                <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3 font-['DM_Sans']">{{ 'orderDetails.billingAddress' | translate }}</h3>
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
            <h2 class="text-xl font-semibold text-gray-900 mb-4 font-['Poppins']">{{ 'orderDetails.paymentMethod' | translate }}</h2>
            <div class="flex items-center space-x-3">
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              <span class="text-gray-900 font-medium font-['DM_Sans']">{{ getPaymentMethodTranslation(order.paymentMethod) | translate }}</span>
            </div>
          </div>

          <!-- Order Notes -->
          <div *ngIf="order.notes" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4 font-['Poppins']">{{ 'orderDetails.orderNotes' | translate }}</h2>
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
  private store = inject(Store);
  private cartService = inject(CartService);
  private translationService = inject(TranslationService);
  private datePipe = inject(DatePipe);

  order: Order | null = null;
  loading = true;
  error = false;
  imageErrors = new Set<string>();

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

      console.log(`Loading order details for ID: ${orderId}`);

      // Load order from database
      const orderData = await this.supabaseService.getTableById('orders', orderId);

      if (!orderData) {
        console.error(`Order not found with ID: ${orderId}`);
        this.error = true;
        return;
      }

      console.log('Order data loaded:', orderData);

      // Load order items
      const orderItemsData = await this.supabaseService.getTable('order_items', {
        order_id: orderId
      });

      console.log(`Loaded ${orderItemsData?.length || 0} order items:`, orderItemsData);

      // Convert database order to Order model
      this.order = {
        id: orderData.id,
        orderNumber: orderData.order_number,
        userId: orderData.user_id || undefined,
        customerEmail: orderData.customer_email,
        customerName: orderData.customer_name || undefined,
        customerPhone: orderData.customer_phone || undefined,
        totalAmount: orderData.total_amount || 0,
        subtotal: orderData.subtotal || 0,
        taxAmount: orderData.tax_amount || 0,
        shippingCost: orderData.shipping_cost || 0,
        discountAmount: orderData.discount_amount || 0,
        status: orderData.status,
        paymentStatus: orderData.payment_status,
        shippingStatus: orderData.shipping_status || undefined,
        paymentMethod: orderData.payment_method || undefined,
        orderDate: orderData.order_date,
        shippingAddress: orderData.shipping_address || undefined,
        billingAddress: orderData.billing_address || undefined,
        trackingNumber: orderData.tracking_number || undefined,
        notes: orderData.notes || undefined,
        adminNotes: orderData.admin_notes || undefined,
        items: await Promise.all((orderItemsData || []).map(async (itemData: any) => {
          let productImageUrl = itemData.product_image_url;

          // If no image URL in order item and we have a product ID, try to get it from products table
          if (!productImageUrl && itemData.product_id) {
            try {
              const productData = await this.supabaseService.getTableById('products', itemData.product_id);
              if (productData?.images && productData.images.length > 0) {
                productImageUrl = productData.images[0].url || productData.images[0];
              }
            } catch (error) {
              console.warn('Could not load product image for product ID:', itemData.product_id, error);
            }
          }

          const orderItem = {
            id: itemData.id,
            orderId: itemData.order_id,
            productId: itemData.product_id || undefined,
            productName: itemData.product_name || 'Unknown Product',
            productSku: itemData.product_sku || undefined,
            quantity: itemData.quantity || 0,
            unitPrice: itemData.unit_price || 0,
            totalPrice: itemData.total_price || 0,
            discountAmount: itemData.discount_amount || 0,
            discountPercentage: itemData.discount_percentage || 0,
            productImageUrl: productImageUrl || undefined,
            productSpecifications: itemData.product_specifications || undefined,
            createdAt: itemData.created_at
          };

          console.log('Mapped order item:', orderItem);
          return orderItem;
        })),
        createdAt: orderData.created_at,
        updatedAt: orderData.updated_at
      };

      console.log('Successfully loaded complete order:', this.order);

    } catch (error) {
      console.error('Error loading order:', error);
      this.error = true;
    } finally {
      this.loading = false;
    }
  }

  hasImageError(itemId: string): boolean {
    return this.imageErrors.has(itemId);
  }

  onImageError(itemId: string): void {
    this.imageErrors.add(itemId);
  }

  onImageLoad(itemId: string): void {
    this.imageErrors.delete(itemId);
  }

  getPaymentMethodTranslation(paymentMethod: string): string {
    const translationKey = this.getPaymentMethodKey(paymentMethod);
    return translationKey;
  }

  private getPaymentMethodKey(paymentMethod: string): string {
    switch (paymentMethod) {
      case 'credit_card':
        return 'admin.ordersForm.creditCard';
      case 'debit_card':
        return 'admin.ordersForm.debitCard';
      case 'bank_transfer':
        return 'admin.ordersForm.bankTransfer';
      case 'cash_on_delivery':
        return 'admin.ordersForm.cashOnDelivery';
      case 'paypal':
        return 'checkout.paypal';
      default:
        return paymentMethod;
    }
  }

  getFormattedDate(date: string): string {
    const currentLanguage = this.translationService.getCurrentLanguage();
    const locale = currentLanguage === 'hr' ? 'hr-HR' : 'en-US';
    return this.datePipe.transform(date, 'fullDate', undefined, locale) || date;
  }
} 