import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { take, map, filter, distinctUntilChanged } from 'rxjs/operators';
import { selectCurrentUser } from '../../../../../core/auth/store/auth.selectors';
import { SupabaseService } from '../../../../../services/supabase.service';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { User } from '../../../../../shared/models/user.model';
import * as CartActions from '../../../cart/store/cart.actions';
import * as OrdersActions from '../../../../admin/orders/store/orders.actions';
import { selectB2COrderCreating, selectB2COrderCreated, selectB2COrderError } from '../../../../admin/orders/store/orders.selectors';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6 font-['Poppins']">{{ 'checkout.paymentMethod' | translate }}</h2>
      
      <form [formGroup]="paymentForm" (ngSubmit)="onSubmit()">
        <!-- Payment Method Selection -->
        <div class="mb-8">
          <div class="space-y-3">
            <!-- Credit Card -->
            <!-- <label class="flex items-center p-4 border-2 border-blue-200 bg-blue-50 rounded-lg cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="credit_card"
                formControlName="paymentMethod"
                class="text-blue-600 focus:ring-blue-600"
              >
              <div class="ml-3 flex-1 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                  </svg>
                  <span class="font-medium text-blue-900 font-['DM_Sans']">{{ 'checkout.creditCard' | translate }}</span>
                </div>
              </div>
            </label> -->

            <!-- Pay on Delivery -->
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
          
          <!-- Credit Card Form -->
          <div *ngIf="paymentForm.get('paymentMethod')?.value === 'credit_card'" class="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 class="text-lg font-semibold text-gray-900 mb-4 font-['Poppins']">Card Details</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label for="cardNumber" class="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">{{ 'checkout.cardNumber' | translate }}</label>
                <input
                  type="text"
                  id="cardNumber"
                  formControlName="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-['DM_Sans']"
                >
                <div *ngIf="paymentForm.get('cardNumber')?.invalid && paymentForm.get('cardNumber')?.touched" class="mt-1 text-sm text-red-600">
                  Card number is required
                </div>
              </div>
              <div>
                <label for="expiryDate" class="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">{{ 'checkout.expiryDate' | translate }}</label>
                <input
                  type="text"
                  id="expiryDate"
                  formControlName="expiryDate"
                  placeholder="MM/YY"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-['DM_Sans']"
                >
                <div *ngIf="paymentForm.get('expiryDate')?.invalid && paymentForm.get('expiryDate')?.touched" class="mt-1 text-sm text-red-600">
                  Expiry date is required
                </div>
              </div>
              <div>
                <label for="cvv" class="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">{{ 'checkout.cvv' | translate }}</label>
                <input
                  type="text"
                  id="cvv"
                  formControlName="cvv"
                  placeholder="123"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-['DM_Sans']"
                >
                <div *ngIf="paymentForm.get('cvv')?.invalid && paymentForm.get('cvv')?.touched" class="mt-1 text-sm text-red-600">
                  CVV is required
                </div>
              </div>
            </div>
          </div>

          <p class="text-sm text-gray-600 mt-3 font-['DM_Sans']" *ngIf="paymentForm.get('paymentMethod')?.value === 'cash_on_delivery'">
            {{ 'checkout.payOnDeliveryDescription' | translate }}
          </p>
          <p class="text-sm text-gray-600 mt-3 font-['DM_Sans']" *ngIf="paymentForm.get('paymentMethod')?.value === 'credit_card'">
            {{ 'checkout.creditCardDescription' | translate }}
          </p>
          
          <!-- Guest Checkout Notice (only show for non-authenticated users) -->
          <div *ngIf="!(currentUser$ | async)" class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="flex items-center space-x-2">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-sm text-blue-800 font-['DM_Sans']">
                <span class="font-medium">{{ 'checkout.guestCheckout' | translate }}:</span> {{ 'checkout.guestCheckoutDescription' | translate }}
              </p>
            </div>
          </div>
        </div>

        <!-- B2B Order Option (only show for company users) -->
        <div *ngIf="isCompanyUser$ | async" class="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
          <label class="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              formControlName="isB2BOrder"
              class="mt-1 text-purple-600 focus:ring-purple-600 rounded"
            >
            <div class="flex-1">
              <div class="flex items-center space-x-2">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
                <span class="font-medium text-purple-900 font-['DM_Sans']">{{ 'checkout.businessOrder' | translate }}</span>
                <span class="px-2 py-1 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full">B2B</span>
              </div>
              <p class="mt-1 text-sm text-purple-700 font-['DM_Sans']">
                {{ 'checkout.businessOrderDescription' | translate }}
              </p>
              <div class="mt-2 flex items-center space-x-4 text-xs text-purple-600">
                <div class="flex items-center space-x-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  <span>{{ 'checkout.bulkDiscounts' | translate }}</span>
                </div>
                <div class="flex items-center space-x-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  <span>{{ 'checkout.prioritySupport' | translate }}</span>
                </div>
                <div class="flex items-center space-x-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  <span>{{ 'checkout.customInvoicing' | translate }}</span>
                </div>
              </div>
            </div>
          </label>
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
              {{ 'checkout.termsAndConditions' | translate }} <a href="#" class="text-blue-600 hover:underline">{{ 'checkout.terms' | translate }}</a> {{ 'checkout.and' | translate }}
              <a href="#" class="text-blue-600 hover:underline">{{ 'checkout.privacyPolicy' | translate }}</a> *
            </span>
          </label>
          <div *ngIf="paymentForm.get('acceptTerms')?.invalid && paymentForm.get('acceptTerms')?.touched" class="mt-1 text-sm text-red-600">
            {{ 'checkout.termsAndConditionsRequired' | translate }}
          </div>
        </div>

        <!-- Error Message -->
        <div *ngIf="(orderCreationError$ | async) as error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
            <p class="text-sm text-red-800 font-['DM_Sans']">{{ error }}</p>
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
              {{ 'checkout.processing' | translate }}
            </span>
          </button>
        </div>
      </form>
    </div>


  `,
  styles: [`
    /* Custom font loading */
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
  `]
})
export class PaymentComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private store = inject(Store);
  private supabaseService = inject(SupabaseService);

  paymentForm: FormGroup;
  isProcessing = false;
  orderNumber = '';
  currentUser$: Observable<User | null>;
  isCompanyUser$: Observable<boolean>;
  orderCreationError$ = new BehaviorSubject<string | null>(null);
  private subscriptions = new Subscription();

  constructor() {
    this.currentUser$ = this.store.select(selectCurrentUser);
    this.isCompanyUser$ = this.currentUser$.pipe(
      map((user: User | null) => user?.companyId != null)
    );

    this.paymentForm = this.fb.group({
      paymentMethod: ['cash_on_delivery', [Validators.required]],
      cardNumber: [''],
      expiryDate: [''],
      cvv: [''],
      isB2BOrder: [false],
      acceptTerms: [false, [Validators.requiredTrue]]
    });

    // Add conditional validators for credit card fields
    this.paymentForm.get('paymentMethod')?.valueChanges.subscribe(method => {
      const cardNumber = this.paymentForm.get('cardNumber');
      const expiryDate = this.paymentForm.get('expiryDate');
      const cvv = this.paymentForm.get('cvv');

      if (method === 'credit_card') {
        cardNumber?.setValidators([Validators.required]);
        expiryDate?.setValidators([Validators.required]);
        cvv?.setValidators([Validators.required]);
      } else {
        cardNumber?.clearValidators();
        expiryDate?.clearValidators();
        cvv?.clearValidators();
      }

      cardNumber?.updateValueAndValidity();
      expiryDate?.updateValueAndValidity();
      cvv?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    // Subscribe to order creation success
    this.subscriptions.add(
      this.store.select(selectB2COrderCreated)
        .pipe(
          distinctUntilChanged()
        )
        .subscribe(order => {
          console.log('Order state changed in payment component:', order, 'isProcessing:', this.isProcessing);
          if (order && this.isProcessing) {
            console.log('Order created successfully:', order);
            this.isProcessing = false;
            this.orderNumber = order.orderNumber;
            this.handleOrderSuccess();
          }
        })
    );

    // Subscribe to order creation errors
    this.subscriptions.add(
      this.store.select(selectB2COrderError)
        .pipe(
          distinctUntilChanged()
        )
        .subscribe(error => {
          console.log('Error state changed in payment component:', error, 'isProcessing:', this.isProcessing);
          if (error && this.isProcessing) {
            console.error('Order creation failed:', error);
            this.isProcessing = false;

            // Check for specific error types
            if (error.includes('Insufficient stock')) {
              this.orderCreationError$.next('One or more items in your cart are no longer available in the requested quantity. Please review your cart and try again.');
            } else {
              this.orderCreationError$.next('Error creating order. Please try again.');
            }
          }
        })
    );
  }

  async onSubmit() {
    if (this.paymentForm.invalid) {
      Object.keys(this.paymentForm.controls).forEach(key => {
        this.paymentForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isProcessing = true;
    this.orderCreationError$.next(null); // Clear any previous errors

    // Clear any previous order state
    this.store.dispatch(OrdersActions.clearB2COrderState());

    await this.createOrder();
  }

  private async createOrder() {
    // Get current user (optional for guest checkout)
    const currentUser = await this.store.select(selectCurrentUser).pipe(
      take(1)
    ).toPromise();

    // If no authenticated user, proceed with guest checkout
    if (!currentUser) {
      try {
        const session = await this.supabaseService.getSession();

        if (session?.user) {
          // Use authenticated user data
          const sessionUser = {
            id: session.user.id,
            email: session.user.email || '',
            firstName: session.user.user_metadata?.firstName || 'Customer',
            lastName: session.user.user_metadata?.lastName || '',
            phone: session.user.user_metadata?.phone || ''
          };
          return this.createOrderWithUser(sessionUser);
        } else {
          // Proceed with guest checkout
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

    return this.createOrderWithUser(guestUser);
  }

  private async createOrderWithUser(currentUser: any) {

    // Get cart items from localStorage that was saved during checkout flow
    const cartItems = JSON.parse(localStorage.getItem('checkoutItems') || '[]');

    console.log('Cart items for order processing:', cartItems);

    if (!cartItems.length) {
      throw new Error('No items in cart for checkout');
    }

    return this.processCartItems(currentUser, cartItems);
  }

  private async processCartItems(currentUser: any, cartItems: any[]) {

    // Calculate totals from CartItem objects
    const subtotal = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const total = subtotal; // No tax or shipping

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

    // Get B2B flag from form
    const isB2BOrder = this.paymentForm.get('isB2BOrder')?.value || false;

    // Create order object
    const orderData = {
      order_number: this.orderNumber,
      user_id: currentUser.id, // Will be null for guest orders
      customer_email: currentUser.email,
      customer_name: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim(),
      customer_phone: shippingInfo.phone || currentUser.phone,

      // Amounts
      subtotal: subtotal,
      tax_amount: 0,
      shipping_cost: 0,
      discount_amount: 0,
      total_amount: total,

      // Order details
      status: 'pending' as const,
      payment_status: 'pending' as const,
      shipping_status: 'not_shipped' as const,
      payment_method: 'cash_on_delivery' as const,
      is_b2b: isB2BOrder,

      // Addresses as JSON
      shipping_address: shippingAddress,
      billing_address: shippingAddress, // Same as shipping for now

      // Timestamps
      order_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Dispatch NgRx action to create order with stock management
    console.log('Dispatching createB2COrder action with data:', { orderData, cartItems });
    this.store.dispatch(OrdersActions.createB2COrder({
      orderData,
      cartItems
    }));
  }

  private handleOrderSuccess() {
    console.log('Handling order success, orderNumber:', this.orderNumber);

    // Clear cart - localStorage and NgRx store
    localStorage.removeItem('checkoutItems');
    localStorage.removeItem('shippingInfo');

    // Dispatch order completion action which will automatically clear cart
    this.store.dispatch(CartActions.orderCompleted({
      orderId: '', // Will be filled by the effect
      orderNumber: this.orderNumber
    }));

    // Clear the order state after success
    this.store.dispatch(OrdersActions.clearB2COrderState());

  }



  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  goBack() {
    this.router.navigate(['/checkout/shipping']);
  }
} 