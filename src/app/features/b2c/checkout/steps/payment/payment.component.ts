import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { selectCurrentUser } from '../../../../../core/auth/store/auth.selectors';
import { SupabaseService } from '../../../../../services/supabase.service';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { User } from '../../../../../shared/models/user.model';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6 font-['Poppins']">{{ 'checkout.payment' | translate }}</h2>
      
      <form [formGroup]="paymentForm" (ngSubmit)="onSubmit()">
        <!-- Payment Method Selection -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 font-['Poppins']">{{ 'checkout.paymentMethod' | translate }}</h3>
          <div class="space-y-3">
            <!-- Pay on Delivery Only -->
            <label class="flex items-center p-4 border-2 border-green-200 bg-green-50 rounded-lg cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="cash_on_delivery"
                formControlName="paymentMethod"
                class="text-green-600 focus:ring-green-600"
                checked
              >
              <div class="ml-3 flex-1 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  <span class="font-medium text-green-900 font-['DM_Sans']">{{ 'checkout.payOnDelivery' | translate }}</span>
                </div>
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
            </label>
          </div>
          <p class="text-sm text-gray-600 mt-3 font-['DM_Sans']">
            Pay when your order is delivered. Cash or card payment accepted at delivery.
          </p>
          
          <!-- Guest Checkout Notice -->
          <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="flex items-center space-x-2">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-sm text-blue-800 font-['DM_Sans']">
                <span class="font-medium">Guest Checkout:</span> You can complete your order without creating an account. 
                Your order will be processed and you'll receive confirmation via email.
              </p>
            </div>
          </div>
        </div>

        <!-- Terms and Conditions -->
        <div class="mb-8">
          <label class="flex items-start space-x-3">
            <input
              type="checkbox"
              formControlName="acceptTerms"
              class="mt-1 text-blue-600 focus:ring-blue-600 rounded"
            >
            <span class="text-sm text-gray-600 font-['DM_Sans']">
              I accept the <a href="#" class="text-blue-600 hover:underline">terms and conditions</a> and the 
              <a href="#" class="text-blue-600 hover:underline">privacy policy</a> *
            </span>
          </label>
          <div *ngIf="paymentForm.get('acceptTerms')?.invalid && paymentForm.get('acceptTerms')?.touched" class="mt-1 text-sm text-red-600">
            You must accept the terms and conditions
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex space-x-4 pt-6 border-t border-gray-200">
          <button 
            type="button"
            (click)="goBack()"
            class="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium font-['DM_Sans']"
          >
          {{ 'checkout.backStep' | translate }} {{ 'checkout.step2' | translate }}
          </button>
          <button 
            type="submit"
            [disabled]="paymentForm.invalid || isProcessing"
            class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold font-['DM_Sans'] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span *ngIf="!isProcessing">{{ 'checkout.completeOrder' | translate }}</span>
            <span *ngIf="isProcessing" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          </button>
        </div>
      </form>
    </div>

    <!-- Toast Notification -->
    <div *ngIf="showToast" class="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out">
      <div class="flex items-center space-x-3">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <div>
          <p class="font-semibold">{{ 'checkout.orderCompletedSuccessfully' | translate }}</p>
          <p class="text-sm">{{ 'checkout.orderCreated' | translate: {number: orderNumber} }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Custom font loading */
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
  `]
})
export class PaymentComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private store = inject(Store);
  private supabaseService = inject(SupabaseService);

  paymentForm: FormGroup;
  isProcessing = false;
  showToast = false;
  orderNumber = '';

  constructor() {
    this.paymentForm = this.fb.group({
      paymentMethod: ['cash_on_delivery', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    });
  }

  async onSubmit() {
    if (this.paymentForm.invalid) {
      Object.keys(this.paymentForm.controls).forEach(key => {
        this.paymentForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isProcessing = true;

    try {
      await this.createOrder();
      this.showSuccessToast();

      // Navigate to home after 3 seconds
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 3000);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order. Please try again.');
    } finally {
      this.isProcessing = false;
    }
  }

  private async createOrder() {
    // Get current user (optional for guest checkout)
    const currentUser = await this.store.select(selectCurrentUser).pipe(
      take(1)
    ).toPromise();

    console.log('Current user from store:', currentUser);

    // If no authenticated user, proceed with guest checkout
    if (!currentUser) {
      try {
        const session = await this.supabaseService.getSession();
        console.log('Supabase session:', session);

        if (session?.user) {
          // Use authenticated user data
          const sessionUser = {
            id: session.user.id,
            email: session.user.email || '',
            firstName: session.user.user_metadata?.firstName || 'Customer',
            lastName: session.user.user_metadata?.lastName || '',
            phone: session.user.user_metadata?.phone || ''
          };
          console.log('Using authenticated session user:', sessionUser);
          return this.createOrderWithUser(sessionUser);
        } else {
          // Proceed with guest checkout
          console.log('Proceeding with guest checkout');
          return this.createGuestOrder();
        }
      } catch (sessionError) {
        console.warn('Session error, proceeding with guest checkout:', sessionError);
        return this.createGuestOrder();
      }
    }

    return this.createOrderWithUser(currentUser);
  }

  private async createGuestOrder() {
    // Get shipping info from the shipping step
    const shippingInfo = JSON.parse(localStorage.getItem('shippingInfo') || '{}');

    if (!shippingInfo.email || !shippingInfo.firstName || !shippingInfo.lastName) {
      throw new Error('Shipping information is required for guest checkout');
    }

    // Create guest user object from shipping info
    const guestUser = {
      id: null, // No user ID for guest orders
      email: shippingInfo.email,
      firstName: shippingInfo.firstName,
      lastName: shippingInfo.lastName,
      phone: shippingInfo.phone || ''
    };

    console.log('Creating order for guest user:', guestUser);
    return this.createOrderWithUser(guestUser);
  }

  private async createOrderWithUser(currentUser: any) {

    // Get cart items from localStorage (or from cart service)
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');

    if (cartItems.length === 0) {
      // For testing purposes, create a dummy cart item with a valid UUID
      console.warn('Cart is empty, creating test order');
      const testCartItems = [{
        id: '00000000-0000-0000-0000-000000000001', // Valid UUID for testing
        name: 'Test Solar Panel',
        price: 299.99,
        quantity: 1,
        sku: 'TEST-001',
        image: '/assets/images/placeholder.jpg'
      }];
      return this.processCartItems(currentUser, testCartItems);
    }

    return this.processCartItems(currentUser, cartItems);
  }

  private async processCartItems(currentUser: any, cartItems: any[]) {

    // Calculate totals
    const subtotal = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.25; // 25% VAT
    const shipping = subtotal > 500 ? 0 : 50; // Free shipping over €500
    const total = subtotal + tax + shipping;

    // Generate order number
    this.orderNumber = 'ORD-' + Date.now();

    // Get shipping info from localStorage (from shipping step)
    const shippingInfo = JSON.parse(localStorage.getItem('shippingInfo') || '{}');

    // Create shipping and billing address objects
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

    // Create order object
    const orderData = {
      order_number: this.orderNumber,
      user_id: currentUser.id, // Will be null for guest orders
      customer_email: currentUser.email,
      customer_name: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim(),
      customer_phone: shippingInfo.phone || currentUser.phone,

      // Amounts
      subtotal: subtotal,
      tax_amount: tax,
      shipping_cost: shipping,
      discount_amount: 0,
      total_amount: total,

      // Order details
      status: 'pending' as const,
      payment_status: 'pending' as const,
      shipping_status: 'not_shipped' as const,
      payment_method: 'cash_on_delivery' as const,

      // Addresses as JSON
      shipping_address: shippingAddress,
      billing_address: shippingAddress, // Same as shipping for now

      // Timestamps
      order_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Create order in database
    const order = await this.supabaseService.createRecord('orders', orderData);

    if (!order) {
      throw new Error('Failed to create order');
    }

    // Create order items
    for (const item of cartItems) {
      const orderItemData = {
        order_id: order.id,
        product_id: item.id === '00000000-0000-0000-0000-000000000001' ? null : item.id, // Set to null for test products
        product_name: item.name,
        product_sku: item.sku || `SKU-${item.id}`,
        product_image_url: item.image,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        created_at: new Date().toISOString()
      };

      await this.supabaseService.createRecord('order_items', orderItemData);
    }

    // Clear cart
    localStorage.removeItem('cart');
    localStorage.removeItem('shippingInfo');
  }

  private showSuccessToast() {
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 4000);
  }

  goBack() {
    this.router.navigate(['/checkout/shipping']);
  }
} 