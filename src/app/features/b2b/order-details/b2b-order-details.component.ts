import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { Order } from '../../../shared/models/order.model';

@Component({
  selector: 'app-b2b-order-details',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 font-['Poppins']">{{ 'orderDetails.title' | translate }}</h1>
              <p class="mt-2 text-gray-600 font-['DM_Sans']" *ngIf="order">
                {{ 'orderDetails.orderPlacedOn' | translate }} {{ order.orderDate | date:'fullDate' }}
              </p>
            </div>
            <button 
              routerLink="/partners/profile"
              [queryParams]="{tab: 'company-orders'}"
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
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-solar-600"></div>
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
                  {{ getStatusLabel(order.status) | translate }}
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
                  {{ getPaymentStatusLabel(order.paymentStatus) | translate }}
                </span>
              </div>

              <!-- Total Amount (Subtotal for B2B) -->
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
                  <p class="mt-1 text-sm font-medium text-gray-900">{{ order.trackingNumber }}</p>
                </div>
                <button class="text-solar-600 hover:text-solar-700 text-sm font-medium">
                  {{ 'orderDetails.trackPackage' | translate }}
                </button>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6 font-['Poppins']">{{ 'orderDetails.orderItems' | translate }}</h2>
            
            <div class="space-y-4">
              <div *ngFor="let item of order.items" class="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
                <!-- Product Image -->
                <div class="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                  <img *ngIf="item.productImageUrl" 
                       [src]="item.productImageUrl" 
                       [alt]="item.productName"
                       class="w-full h-full object-cover rounded-lg"
                       (error)="onImageError($event)">
                  <svg *ngIf="!item.productImageUrl" class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                </div>

                <!-- Product Details -->
                <div class="flex-1 min-w-0">
                  <h3 class="text-base font-medium text-gray-900 font-['Poppins']">{{ item.productName }}</h3>
                  <p class="text-sm text-gray-500 font-['DM_Sans']" *ngIf="item.productSku">SKU: {{ item.productSku }}</p>
                </div>

                <!-- Quantity and Price -->
                <div class="text-right">
                  <p class="text-sm text-gray-500 font-['DM_Sans']">{{ 'orderDetails.qty' | translate }}: {{ item.quantity }}</p>
                  <p class="text-sm text-gray-900 font-['DM_Sans']">{{ 'orderDetails.unitPrice' | translate }}: {{ item.unitPrice | currency:'EUR':'symbol':'1.2-2' }}</p>
                  <p class="text-base font-semibold text-gray-900 font-['Poppins']">{{ item.totalPrice | currency:'EUR':'symbol':'1.2-2' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6 font-['Poppins']">{{ 'orderDetails.orderSummary' | translate }}</h2>
            
            <div class="space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">{{ 'orderDetails.subtotal' | translate }}</span>
                <span class="font-medium">{{ order.subtotal | currency:'EUR':'symbol':'1.2-2' }}</span>
              </div>
              
              <div *ngIf="order.discountAmount > 0" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ 'orderDetails.discount' | translate }}</span>
                <span class="font-medium text-green-600">-{{ order.discountAmount | currency:'EUR':'symbol':'1.2-2' }}</span>
              </div>
              
              <!-- B2B Orders don't show tax and shipping -->
              <div class="border-t border-gray-200 pt-3">
                <div class="flex justify-between">
                  <span class="text-base font-semibold text-gray-900">{{ 'orderDetails.total' | translate }}</span>
                  <span class="text-base font-semibold text-gray-900">{{ order.subtotal | currency:'EUR':'symbol':'1.2-2' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Shipping and Billing Information -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Shipping Information -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4 font-['Poppins']">{{ 'orderDetails.shippingInformation' | translate }}</h2>
              
              <div *ngIf="order.shippingAddress" class="space-y-2">
                <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide font-['DM_Sans']">{{ 'orderDetails.shippingAddress' | translate }}</h3>
                <div class="text-sm text-gray-900 font-['DM_Sans']">
                  <p *ngIf="getShippingAddressField('contactName')">{{ getShippingAddressField('contactName') }}</p>
                  <p *ngIf="getShippingAddressField('address')">{{ getShippingAddressField('address') }}</p>
                  <p *ngIf="getShippingAddressField('city') && getShippingAddressField('postalCode')">
                    {{ getShippingAddressField('city') }}, {{ getShippingAddressField('postalCode') }}
                  </p>
                  <p *ngIf="getShippingAddressField('country')">{{ getShippingAddressField('country') }}</p>
                  <p *ngIf="getShippingAddressField('contactPhone')" class="mt-2">{{ getShippingAddressField('contactPhone') }}</p>
                  <p *ngIf="getShippingAddressField('contactEmail')">{{ getShippingAddressField('contactEmail') }}</p>
                </div>
              </div>
              
              <div class="mt-4">
                <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide font-['DM_Sans']">{{ 'orderDetails.paymentMethod' | translate }}</h3>
                <p class="mt-1 text-sm text-gray-900 font-['DM_Sans']">{{ getPaymentMethodLabel(order.paymentMethod || '') | translate }}</p>
              </div>
            </div>

            <!-- Billing Information -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4 font-['Poppins']">{{ 'orderDetails.billingAddress' | translate }}</h2>
              
              <div *ngIf="order.billingAddress" class="text-sm text-gray-900 font-['DM_Sans']">
                <p *ngIf="getBillingAddressField('companyName')" class="font-medium">{{ getBillingAddressField('companyName') }}</p>
                <p *ngIf="getBillingAddressField('address')">{{ getBillingAddressField('address') }}</p>
                <p *ngIf="getBillingAddressField('taxNumber')" class="mt-2">{{ getBillingAddressField('taxNumber') }}</p>
                <p *ngIf="getBillingAddressField('email')" class="mt-2">{{ getBillingAddressField('email') }}</p>
                <p *ngIf="getBillingAddressField('phone')">{{ getBillingAddressField('phone') }}</p>
              </div>
            </div>
          </div>

          <!-- Order Notes -->
          <div *ngIf="order.notes" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4 font-['Poppins']">{{ 'orderDetails.orderNotes' | translate }}</h2>
            <p class="text-sm text-gray-700 font-['DM_Sans']">{{ order.notes }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Custom font loading */
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
  `]
})
export class B2bOrderDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private supabaseService = inject(SupabaseService);

  order: Order | null = null;
  loading = true;
  error = false;

  async ngOnInit(): Promise<void> {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      await this.loadOrderDetails(orderId);
    } else {
      this.error = true;
      this.loading = false;
    }
  }

  private async loadOrderDetails(orderId: string): Promise<void> {
    try {
      const { data: order, error } = await this.supabaseService.client
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            product_name,
            product_sku,
            quantity,
            unit_price,
            total_price,
            product_image_url,
            product_specifications
          )
        `)
        .eq('id', orderId)
        .eq('is_b2b', true)
        .single();

      if (error) {
        console.error('Error loading order details:', error);
        this.error = true;
        return;
      }

      if (!order) {
        this.error = true;
        return;
      }

      // Map the order data
      this.order = {
        id: order.id,
        orderNumber: order.order_number,
        userId: order.user_id,
        customerEmail: order.customer_email,
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        totalAmount: order.total_amount,
        subtotal: order.subtotal,
        taxAmount: order.tax_amount,
        shippingCost: order.shipping_cost,
        discountAmount: order.discount_amount,
        status: order.status,
        paymentStatus: order.payment_status,
        shippingStatus: order.shipping_status,
        paymentMethod: order.payment_method,
        orderDate: order.order_date,
        shippingAddress: order.shipping_address,
        billingAddress: order.billing_address,
        trackingNumber: order.tracking_number,
        notes: order.notes,
        adminNotes: order.admin_notes,
        items: (order.order_items || []).map((item: any) => ({
          id: item.id,
          orderId: item.order_id,
          productId: item.product_id,
          productName: item.product_name,
          productSku: item.product_sku,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
          productImageUrl: item.product_image_url,
          productSpecifications: item.product_specifications,
          createdAt: item.created_at
        })),
        is_b2b: order.is_b2b,
        createdAt: order.created_at,
        updatedAt: order.updated_at
      };

    } catch (error) {
      console.error('Error loading order details:', error);
      this.error = true;
    } finally {
      this.loading = false;
    }
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'b2b.orders.pending',
      'confirmed': 'b2b.orders.confirmed',
      'processing': 'b2b.orders.processing',
      'shipped': 'b2b.orders.shipped',
      'delivered': 'b2b.orders.delivered',
      'cancelled': 'b2b.orders.cancelled'
    };
    return statusMap[status] || status;
  }

  getPaymentStatusLabel(paymentStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'b2b.orders.pending',
      'paid': 'b2b.orders.paid',
      'failed': 'b2b.orders.failed'
    };
    return statusMap[paymentStatus] || paymentStatus;
  }

  getPaymentMethodLabel(paymentMethod: string): string {
    const methodMap: { [key: string]: string } = {
      'payment_upon_collection': 'b2b.orders.paymentUponCollection',
      'bank_transfer': 'b2b.orders.bankTransfer',
      'cash_on_delivery': 'b2b.orders.cashOnDelivery',
      'credit_30_days': 'b2b.orders.creditTerms30Days'
    };
    return methodMap[paymentMethod] || paymentMethod;
  }

  getShippingAddressField(field: string): string | null {
    if (!this.order?.shippingAddress) return null;
    // Type assertion to handle dynamic B2B address fields
    const address = this.order.shippingAddress as any;
    return address[field] || null;
  }

  getBillingAddressField(field: string): string | null {
    if (!this.order?.billingAddress) return null;
    // Type assertion to handle dynamic B2B address fields
    const address = this.order.billingAddress as any;
    return address[field] || null;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      // Hide the broken image and let the fallback icon show
      img.style.display = 'none';
    }
  }
}