import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MonriPaymentService } from '../../../../shared/services/monri-payment.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import * as OrdersActions from '../../../admin/orders/store/orders.actions';
import * as CartActions from '../../cart/store/cart.actions';

@Component({
  selector: 'app-payment-callback',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div class="max-w-md w-full">
        <!-- Processing State -->
        <div *ngIf="isProcessing" class="bg-white rounded-lg shadow-lg p-8 text-center">
          <div class="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <h2 class="text-2xl font-bold text-gray-900 mb-4 font-['Poppins']">
            {{ 'payment.processing' | translate }}
          </h2>
          <p class="text-gray-600 font-['DM_Sans']">
            {{ 'payment.processingDescription' | translate }}
          </p>
        </div>

        <!-- Success State -->
        <div *ngIf="paymentStatus === 'success'" class="bg-white rounded-lg shadow-lg p-8 text-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-green-900 mb-4 font-['Poppins']">
            {{ 'payment.success' | translate }}
          </h2>
          <p class="text-gray-600 mb-6 font-['DM_Sans']">
            {{ 'payment.successDescription' | translate }}
          </p>
          <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p class="text-sm text-green-800 font-['DM_Sans']">
              <span class="font-medium">{{ 'payment.orderNumber' | translate }}:</span> {{ orderNumber }}
            </p>
          </div>
          <button 
            (click)="goToOrderConfirmation()"
            class="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold font-['DM_Sans']"
          >
            {{ 'payment.viewOrder' | translate }}
          </button>
        </div>

        <!-- Failed State -->
        <div *ngIf="paymentStatus === 'failed'" class="bg-white rounded-lg shadow-lg p-8 text-center">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-red-900 mb-4 font-['Poppins']">
            {{ 'payment.failed' | translate }}
          </h2>
          <p class="text-gray-600 mb-6 font-['DM_Sans']">
            {{ 'payment.failedDescription' | translate }}
          </p>
          <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p class="text-sm text-red-800 font-['DM_Sans']">{{ errorMessage }}</p>
          </div>
          <div class="space-y-3">
            <button 
              (click)="retryPayment()"
              class="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold font-['DM_Sans']"
            >
              {{ 'payment.retryPayment' | translate }}
            </button>
            <button 
              (click)="goToCart()"
              class="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium font-['DM_Sans']"
            >
              {{ 'payment.backToCart' | translate }}
            </button>
          </div>
        </div>

        <!-- Cancelled State -->
        <div *ngIf="paymentStatus === 'cancelled'" class="bg-white rounded-lg shadow-lg p-8 text-center">
          <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-yellow-900 mb-4 font-['Poppins']">
            {{ 'payment.cancelled' | translate }}
          </h2>
          <p class="text-gray-600 mb-6 font-['DM_Sans']">
            {{ 'payment.cancelledDescription' | translate }}
          </p>
          <div class="space-y-3">
            <button 
              (click)="retryPayment()"
              class="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold font-['DM_Sans']"
            >
              {{ 'payment.tryAgain' | translate }}
            </button>
            <button 
              (click)="goToCart()"
              class="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium font-['DM_Sans']"
            >
              {{ 'payment.backToCart' | translate }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    
  `]
})
export class PaymentCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store);
  private monriPaymentService = inject(MonriPaymentService);

  isProcessing = true;
  paymentStatus: 'success' | 'failed' | 'cancelled' | null = null;
  orderNumber = '';
  errorMessage = '';

  ngOnInit(): void {
    this.processPaymentCallback();
  }

  private async processPaymentCallback(): Promise<void> {
    try {
      // Get query parameters from Monri callback
      this.route.queryParams.subscribe(async (params) => {
        console.log('Payment callback received with params:', params);
        
        const status = params['status'];
        const orderNumber = params['order_number'] || params['order-number'];
        const transactionId = params['transaction_id'] || params['transaction-id'];
        const errorMessage = params['error_message'] || params['error-message'];
        const responseCode = params['response_code'] || params['response-code'];
        
        this.orderNumber = orderNumber || '';
        
        console.log('Processed callback parameters:', {
          status,
          orderNumber: this.orderNumber,
          transactionId,
          responseCode,
          errorMessage
        });

        // Handle different Monri response statuses
        if (status === 'approved' || status === 'success' || responseCode === '0000') {
          await this.handleSuccessfulPayment(params);
        } else if (status === 'declined' || status === 'error' || status === 'failed') {
          this.handleFailedPayment(errorMessage || 'Payment was declined');
        } else if (status === 'cancelled' || status === 'canceled') {
          this.handleCancelledPayment();
        } else {
          console.warn('Unknown payment status received:', status);
          this.handleFailedPayment(`Unknown payment status: ${status}`);
        }

        this.isProcessing = false;
      });
    } catch (error) {
      console.error('Error processing payment callback:', error);
      this.handleFailedPayment('Error processing payment callback');
      this.isProcessing = false;
    }
  }

  private async handleSuccessfulPayment(callbackParams: any): Promise<void> {
    try {
      this.paymentStatus = 'success';

      // Get pending order data from localStorage
      const pendingOrderData = JSON.parse(localStorage.getItem('pendingOrderData') || '{}');
      
      if (pendingOrderData.orderNumber) {
        this.orderNumber = pendingOrderData.orderNumber;

        // Create the order in the database now that payment is successful
        await this.createOrderAfterPayment(pendingOrderData, callbackParams);

        // Clear pending order data
        localStorage.removeItem('pendingOrderData');
      }
    } catch (error) {
      console.error('Error handling successful payment:', error);
      this.handleFailedPayment('Error processing successful payment');
    }
  }

  private async createOrderAfterPayment(pendingOrderData: any, callbackParams: any): Promise<void> {
    try {
      // Get cart items and shipping info
      const cartItems = JSON.parse(localStorage.getItem('checkoutItems') || '[]');
      const shippingInfo = JSON.parse(localStorage.getItem('shippingInfo') || '{}');

      if (!cartItems.length) {
        throw new Error('No cart items found');
      }

      const currentUser = pendingOrderData.currentUser;
      const subtotal = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

      // Create shipping address
      const shippingAddress = {
        firstName: shippingInfo.firstName || currentUser.firstName || '',
        lastName: shippingInfo.lastName || currentUser.lastName || '',
        addressLine1: shippingInfo.address || '',
        addressLine2: shippingInfo.addressLine2 || null,
        city: shippingInfo.city || '',
        state: shippingInfo.state || '',
        postalCode: shippingInfo.postalCode || '',
        country: shippingInfo.country || '',
        phone: shippingInfo.phone || currentUser.phone || ''
      };

      // Create order data
      const orderData = {
        order_number: this.orderNumber,
        user_id: currentUser.id,
        customer_email: currentUser.email,
        customer_name: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim(),
        customer_phone: shippingInfo.phone || currentUser.phone,
        subtotal: subtotal,
        tax_amount: 0,
        shipping_cost: 0,
        discount_amount: 0,
        total_amount: subtotal,
        status: 'confirmed' as const, // Confirmed since payment is successful
        payment_status: 'paid' as const, // Mark as paid
        shipping_status: 'not_shipped' as const,
        payment_method: 'credit_card' as const,
        is_b2b: false,
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
        order_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Add payment reference
        notes: `Monri Payment ID: ${callbackParams.transaction_id || 'N/A'}`
      };

      // Dispatch order creation
      this.store.dispatch(OrdersActions.createB2COrder({
        orderData,
        cartItems
      }));

      // Clear cart after successful payment
      this.store.dispatch(CartActions.orderCompleted({
        orderId: '',
        orderNumber: this.orderNumber
      }));

      // Clear localStorage
      localStorage.removeItem('checkoutItems');
      localStorage.removeItem('shippingInfo');

    } catch (error) {
      console.error('Error creating order after payment:', error);
      throw error;
    }
  }

  private handleFailedPayment(errorMessage: string): void {
    this.paymentStatus = 'failed';
    this.errorMessage = errorMessage;
  }

  private handleCancelledPayment(): void {
    this.paymentStatus = 'cancelled';
  }

  goToOrderConfirmation(): void {
    this.router.navigate(['/order-confirmation'], { 
      queryParams: { orderNumber: this.orderNumber } 
    });
  }

  retryPayment(): void {
    this.router.navigate(['/blagajna/placanje']);
  }

  goToCart(): void {
    this.router.navigate(['/kosarica']);
  }
}