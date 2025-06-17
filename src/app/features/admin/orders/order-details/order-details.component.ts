import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { SupabaseService } from '../../../../services/supabase.service';

@Component({
    selector: 'app-order-details',
    standalone: true,
    imports: [CommonModule],
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
              <h1 class="text-3xl font-bold text-gray-900">Order {{ order.order_number }}</h1>
              <p class="text-gray-600 mt-1">Order Details & Line Items</p>
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
              <span>Edit Order</span>
            </button>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
            <h3 class="text-sm font-medium text-gray-700 mb-2">Total Amount</h3>
            <p class="text-2xl font-bold text-blue-600">{{ order.total_amount | currency:'EUR':'symbol':'1.2-2' }}</p>
          </div>
          
          <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
            <h3 class="text-sm font-medium text-gray-700 mb-2">Items</h3>
            <p class="text-2xl font-bold text-green-600">{{ orderItems.length }}</p>
          </div>
          
          <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
            <h3 class="text-sm font-medium text-gray-700 mb-2">Order Date</h3>
            <p class="text-lg font-semibold text-purple-600">{{ order.created_at | date:'mediumDate' }}</p>
          </div>
          
          <div class="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-100">
            <h3 class="text-sm font-medium text-gray-700 mb-2">Payment Method</h3>
            <p class="text-lg font-semibold text-orange-600 capitalize">{{ order.payment_method || 'Credit Card' }}</p>
          </div>
        </div>
      </div>

      <!-- Customer Information -->
      <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Customer Information</h2>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Billing Address</h3>
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
            <h3 class="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>
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
      <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900">Order Items</h2>
          <button 
            (click)="addItem()"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            <span>Add Item</span>
          </button>
        </div>

        <div class="space-y-4" *ngIf="orderItems.length > 0; else noItems">
          <div *ngFor="let item of orderItems; trackBy: trackByItemId" 
               class="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors duration-200">
            <div class="flex items-center space-x-4">
              <img [src]="item.product?.image_url || '/assets/images/product-placeholder.jpg'" 
                   [alt]="item.product?.name || 'Product'"
                   class="w-16 h-16 object-cover rounded-lg border border-gray-200">
              
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900">{{ item.product?.name || item.product_name || 'Unknown Product' }}</h4>
                <p class="text-sm text-gray-600">SKU: {{ item.product?.sku || item.product_sku || 'N/A' }}</p>
                <p class="text-sm text-gray-600" *ngIf="item.product?.category">Category: {{ item.product?.category }}</p>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                <div class="text-center">
                  <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Unit Price</p>
                  <p class="font-semibold text-gray-900">{{ item.unit_price | currency:'EUR':'symbol':'1.2-2' }}</p>
                </div>

                <div class="text-center">
                  <label class="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Quantity</label>
                  <input 
                    type="number" 
                    [value]="item.quantity"
                    (input)="updateItemQuantity(item.id, $event)"
                    min="1" 
                    class="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </div>

                <div class="text-center">
                  <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Subtotal</p>
                  <p class="font-semibold text-blue-600">
                    {{ (item.unit_price * item.quantity) | currency:'EUR':'symbol':'1.2-2' }}
                  </p>
                </div>

                <div class="text-center">
                  <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Discount</p>
                  <p class="font-semibold text-green-600">
                    {{ (item.discount_amount || 0) | currency:'EUR':'symbol':'1.2-2' }}
                  </p>
                </div>
              </div>

              <button 
                (click)="removeItem(item.id)"
                class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <ng-template #noItems>
          <div class="text-center py-12">
            <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No items in this order</h3>
            <p class="text-gray-500 mb-4">Add items to this order to get started</p>
            <button 
              (click)="addItem()"
              class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
              Add First Item
            </button>
          </div>
        </ng-template>
      </div>

      <!-- Order Summary -->
      <div class="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200 p-6">
        <h3 class="text-xl font-semibold text-gray-900 mb-6">Order Summary</h3>
        
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-gray-700">Subtotal:</span>
            <span class="font-semibold text-gray-900">{{ getSubtotal() | currency:'EUR':'symbol':'1.2-2' }}</span>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="text-gray-700">Discount:</span>
            <span class="font-semibold text-green-600">-{{ getTotalDiscount() | currency:'EUR':'symbol':'1.2-2' }}</span>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="text-gray-700">Shipping:</span>
            <span class="font-semibold text-gray-900">{{ order.shipping_cost || 0 | currency:'EUR':'symbol':'1.2-2' }}</span>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="text-gray-700">Tax:</span>
            <span class="font-semibold text-gray-900">{{ order.tax_amount || 0 | currency:'EUR':'symbol':'1.2-2' }}</span>
          </div>
          
          <div class="border-t border-gray-300 pt-4 flex justify-between items-center">
            <span class="text-xl font-bold text-gray-900">Total:</span>
            <span class="text-2xl font-bold text-blue-600">{{ order.total_amount | currency:'EUR':'symbol':'1.2-2' }}</span>
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
          <span>Print Invoice</span>
        </button>
        
        <button 
          (click)="saveChanges()"
          [disabled]="!hasChanges"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
          </svg>
          <span>Save Changes</span>
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
      <h3 class="text-lg font-medium text-gray-900 mb-2">Order not found</h3>
      <p class="text-gray-500 mb-4">{{ error }}</p>
      <button 
        (click)="goBack()"
        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
        Go Back
      </button>
    </div>
  `
})
export class OrderDetailsComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private supabaseService = inject(SupabaseService);
    private title = inject(Title);

    order: any = null;
    orderItems: any[] = [];
    originalOrderItems: any[] = [];
    hasChanges = false;
    error: string | null = null;

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
                    discount_amount: 20.00,
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
                    discount_amount: 0,
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
        } catch (error) {
            console.error('Error loading order items:', error);
            this.orderItems = [];
            this.originalOrderItems = [];
        }
    }

    trackByItemId(index: number, item: any): any {
        return item.id;
    }

    updateItemQuantity(itemId: string, event: Event): void {
        const target = event.target as HTMLInputElement;
        const quantity = parseInt(target.value) || 1;

        const itemIndex = this.orderItems.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
            this.orderItems[itemIndex].quantity = quantity;
            this.checkForChanges();
        }
    }

    addItem(): void {
        // In a real implementation, you would open a product selection modal
        alert('Product selection modal would open here');
    }

    removeItem(itemId: string): void {
        if (confirm('Are you sure you want to remove this item from the order?')) {
            this.orderItems = this.orderItems.filter(item => item.id !== itemId);
            this.checkForChanges();
        }
    }

    getSubtotal(): number {
        return this.orderItems.reduce((total, item) => total + (item.unit_price * item.quantity), 0);
    }

    getTotalDiscount(): number {
        return this.orderItems.reduce((total, item) => total + (item.discount_amount || 0), 0);
    }

    private checkForChanges(): void {
        this.hasChanges = JSON.stringify(this.orderItems) !== JSON.stringify(this.originalOrderItems);
    }

    async saveChanges(): Promise<void> {
        if (!this.hasChanges) return;

        try {
            // In a real implementation, you would save to order_items table
            console.log('Saving order changes:', this.orderItems);

            this.originalOrderItems = JSON.parse(JSON.stringify(this.orderItems));
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