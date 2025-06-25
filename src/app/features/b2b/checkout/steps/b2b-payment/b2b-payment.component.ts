import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { selectCurrentUser } from '../../../../../core/auth/store/auth.selectors';
import { SupabaseService } from '../../../../../services/supabase.service';
import { User } from '../../../../../shared/models/user.model';
import { Company } from '../../../../../shared/models/company.model';
import { selectB2BCartItems, selectB2BCartSubtotal } from '../../../cart/store/b2b-cart.selectors';
import * as B2BCartActions from '../../../cart/store/b2b-cart.actions';
import { B2BCartItem } from '../../../cart/models/b2b-cart.model';

@Component({
  selector: 'app-b2b-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6 font-['Poppins']">{{ 'b2bCheckout.paymentMethod' | translate }}</h2>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Payment Form -->
        <div class="lg:col-span-2">
          <form [formGroup]="paymentForm" (ngSubmit)="onSubmit()">
            <!-- Payment Methods -->
            <div class="mb-8">
              <h3 class="text-lg font-semibold text-gray-900 mb-4 font-['Poppins']">{{ 'b2bCheckout.selectPaymentMethod' | translate }}</h3>
              <div class="space-y-3">
                
                <!-- Bank Transfer -->
                <label class="flex items-start p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    formControlName="paymentMethod"
                    class="mt-1 text-solar-600 focus:ring-solar-500"
                  >
                  <div class="ml-3 flex-1">
                    <div class="flex items-center justify-between">
                      <span class="font-medium text-gray-900 font-['DM_Sans']">{{ 'b2bCheckout.bankTransfer' | translate }}</span>
                      <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                      </svg>
                    </div>
                    <p class="text-sm text-gray-600 font-['DM_Sans'] mt-1">{{ 'b2bCheckout.bankTransferDescription' | translate }}</p>
                  </div>
                </label>

                <!-- Cash on Delivery -->
                <label class="flex items-start p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash_on_delivery"
                    formControlName="paymentMethod"
                    class="mt-1 text-solar-600 focus:ring-solar-500"
                  >
                  <div class="ml-3 flex-1">
                    <div class="flex items-center justify-between">
                      <span class="font-medium text-gray-900 font-['DM_Sans']">{{ 'b2bCheckout.cashOnDelivery' | translate }}</span>
                      <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                      </svg>
                    </div>
                    <p class="text-sm text-gray-600 font-['DM_Sans'] mt-1">{{ 'b2bCheckout.cashOnDeliveryDescription' | translate }}</p>
                  </div>
                </label>

                <!-- Credit Terms (30 days) -->
                <label class="flex items-start p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit_30_days"
                    formControlName="paymentMethod"
                    class="mt-1 text-solar-600 focus:ring-solar-500"
                  >
                  <div class="ml-3 flex-1">
                    <div class="flex items-center justify-between">
                      <span class="font-medium text-gray-900 font-['DM_Sans']">{{ 'b2bCheckout.creditTerms30' | translate }}</span>
                      <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                    </div>
                    <p class="text-sm text-gray-600 font-['DM_Sans'] mt-1">{{ 'b2bCheckout.creditTerms30Description' | translate }}</p>
                  </div>
                </label>
              </div>
            </div>

            <!-- Special Instructions -->
            <div class="mb-8">
              <h3 class="text-lg font-semibold text-gray-900 mb-4 font-['Poppins']">{{ 'b2bCheckout.specialInstructions' | translate }}</h3>
              <textarea
                formControlName="specialInstructions"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-transparent font-['DM_Sans']"
                [placeholder]="'b2bCheckout.specialInstructionsPlaceholder' | translate"
              ></textarea>
            </div>

            <!-- Terms and Conditions -->
            <div class="mb-8">
              <label class="flex items-start space-x-3">
                <input
                  type="checkbox"
                  formControlName="acceptTerms"
                  class="mt-1 rounded border-gray-300 text-solar-600 focus:ring-solar-500"
                >
                <span class="text-sm text-gray-700 font-['DM_Sans']">
                  {{ 'b2bCheckout.acceptTermsText' | translate }}
                  <a href="/terms" target="_blank" class="text-solar-600 hover:text-solar-700 underline">{{ 'b2bCheckout.termsAndConditions' | translate }}</a>
                  {{ 'b2bCheckout.and' | translate }}
                  <a href="/privacy" target="_blank" class="text-solar-600 hover:text-solar-700 underline">{{ 'b2bCheckout.privacyPolicy' | translate }}</a>
                </span>
              </label>
            </div>

            <!-- Navigation Buttons -->
            <div class="flex space-x-4 pt-6 border-t border-gray-200">
              <button 
                type="button"
                (click)="goBack()"
                class="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium font-['DM_Sans']"
              >
                {{ 'b2bCheckout.backStep' | translate }} {{ 'b2bCheckout.step2' | translate }}
              </button>
              <button 
                type="submit"
                [disabled]="paymentForm.invalid || processing"
                class="flex-1 px-6 py-3 bg-solar-600 text-white rounded-lg hover:bg-solar-700 transition-colors font-semibold font-['DM_Sans'] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span *ngIf="!processing">{{ 'b2bCheckout.placeOrder' | translate }}</span>
                <span *ngIf="processing" class="flex items-center justify-center space-x-2">
                  <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{{ 'b2bCheckout.processing' | translate }}</span>
                </span>
              </button>
            </div>
          </form>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <div class="bg-gray-50 rounded-lg p-6 sticky top-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 font-['Poppins']">{{ 'b2bCheckout.orderSummary' | translate }}</h3>
            
            <!-- Cart Items -->
            <div class="space-y-3 mb-4">
              <div *ngFor="let item of cartItems" class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-white rounded border flex-shrink-0 flex items-center justify-center">
                                    <img *ngIf="item.imageUrl"
                       [src]="item.imageUrl"
                       [alt]="item.name"
                       class="w-full h-full object-cover rounded">
                  <svg *ngIf="!item.imageUrl" class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ item.name }}</p>
                  <p class="text-xs text-gray-500">{{ 'b2bCheckout.quantity' | translate }}: {{ item.quantity }}</p>
                </div>
                <div class="text-sm font-medium text-gray-900">
                  €{{ (item.unitPrice * item.quantity) | number:'1.2-2' }}
                </div>
              </div>
            </div>

            <!-- Totals -->
            <div class="border-t border-gray-200 pt-4 space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">{{ 'b2bCheckout.subtotal' | translate }}</span>
                <span class="font-medium">€{{ cartTotal | number:'1.2-2' }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">{{ 'b2bCheckout.shipping' | translate }}</span>
                <span class="font-medium">{{ 'b2bCheckout.free' | translate }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">{{ 'b2bCheckout.tax' | translate }} (25%)</span>
                <span class="font-medium">€{{ (cartTotal * 0.25) | number:'1.2-2' }}</span>
              </div>
              <div class="border-t border-gray-200 pt-2">
                <div class="flex justify-between">
                  <span class="text-base font-semibold text-gray-900">{{ 'b2bCheckout.total' | translate }}</span>
                  <span class="text-base font-semibold text-gray-900">€{{ (cartTotal * 1.25) | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>

            <!-- Company Info -->
            <div *ngIf="company" class="mt-6 pt-4 border-t border-gray-200">
              <h4 class="text-sm font-medium text-gray-900 mb-2">{{ 'b2bCheckout.billingTo' | translate }}</h4>
              <div class="text-xs text-gray-600 space-y-1">
                <p class="font-medium">{{ company.companyName }}</p>
                <p>{{ company.companyAddress }}</p>
                <p>{{ company.taxNumber }}</p>
              </div>
            </div>
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
export class B2bPaymentComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private store = inject(Store);
  private supabaseService = inject(SupabaseService);
  private destroy$ = new Subject<void>();

  paymentForm: FormGroup;
  currentUser: User | null = null;
  company: Company | null = null;
  cartItems: B2BCartItem[] = [];
  cartTotal = 0;
  processing = false;

  constructor() {
    this.paymentForm = this.fb.group({
      paymentMethod: ['bank_transfer', [Validators.required]],
      specialInstructions: [''],
      acceptTerms: [false, [Validators.requiredTrue]]
    });
  }

  async ngOnInit(): Promise<void> {
    // Get current user and cart data
    combineLatest([
      this.store.select(selectCurrentUser),
      this.store.select(selectB2BCartItems),
      this.store.select(selectB2BCartSubtotal)
    ]).pipe(takeUntil(this.destroy$)).subscribe(async ([user, items, total]) => {
      this.currentUser = user;
      this.cartItems = items;
      this.cartTotal = total;

      if (user) {
        await this.loadCompanyInfo(user.id);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadCompanyInfo(userId: string): Promise<void> {
    try {
      const { data: companies, error } = await this.supabaseService.client
        .from('companies')
        .select('*')
        .eq('contact_person_id', userId)
        .eq('status', 'approved')
        .single();

      if (!error && companies) {
        this.company = {
          id: companies.id,
          contactPersonId: companies.contact_person_id,
          contactPersonName: companies.contact_person_name,
          companyName: companies.company_name,
          taxNumber: companies.tax_number,
          companyAddress: companies.company_address,
          companyPhone: companies.company_phone,
          companyEmail: companies.company_email,
          website: companies.website,
          businessType: companies.business_type,
          yearsInBusiness: companies.years_in_business,
          annualRevenue: companies.annual_revenue,
          numberOfEmployees: companies.number_of_employees,
          description: companies.description,
          status: companies.status,
          approved: companies.approved,
          approvedAt: companies.approved_at ? new Date(companies.approved_at) : undefined,
          approvedBy: companies.approved_by,
          rejectedAt: companies.rejected_at ? new Date(companies.rejected_at) : undefined,
          rejectedBy: companies.rejected_by,
          rejectionReason: companies.rejection_reason,
          createdAt: new Date(companies.created_at),
          updatedAt: new Date(companies.updated_at)
        };
      }
    } catch (error) {
      console.error('Error loading company info:', error);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.paymentForm.invalid || !this.currentUser || !this.company || this.cartItems.length === 0) {
      return;
    }

    this.processing = true;

    try {
      // Get checkout data from localStorage
      const shippingInfo = JSON.parse(localStorage.getItem('b2b_shipping_info') || '{}');
      const paymentData = this.paymentForm.value;

      // Calculate totals
      const subtotal = this.cartTotal;
      const taxAmount = subtotal * 0.25; // 25% tax
      const totalAmount = subtotal + taxAmount;

      // Generate order number
      const orderNumber = 'B2B-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();

      // Create order
      const orderData = {
        order_number: orderNumber,
        user_id: this.currentUser.id,
        customer_email: this.currentUser.email,
        customer_name: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
        customer_phone: this.currentUser.phone || '',
        total_amount: totalAmount,
        subtotal: subtotal,
        tax_amount: taxAmount,
        shipping_cost: 0,
        discount_amount: 0,
        status: 'pending',
        payment_status: paymentData.paymentMethod === 'credit_30_days' ? 'pending' : 'pending',
        payment_method: paymentData.paymentMethod,
        shipping_address: {
          contactName: shippingInfo.contactName || '',
          contactEmail: shippingInfo.contactEmail || '',
          contactPhone: shippingInfo.contactPhone || '',
          address: shippingInfo.deliveryAddress || '',
          city: shippingInfo.deliveryCity || '',
          postalCode: shippingInfo.deliveryPostalCode || '',
          country: shippingInfo.deliveryCountry || '',
          shippingMethod: shippingInfo.shippingMethod || 'standard',
          deliveryInstructions: shippingInfo.deliveryInstructions || '',
          purchaseOrderNumber: shippingInfo.purchaseOrderNumber || ''
        },
        billing_address: {
          companyId: this.company.id,
          companyName: this.company.companyName,
          address: this.company.companyAddress,
          email: this.company.companyEmail,
          phone: this.company.companyPhone,
          taxNumber: this.company.taxNumber
        },
        notes: paymentData.specialInstructions || '',
        is_b2b: true,
        order_date: new Date().toISOString()
      };

      // Insert order
      const { data: order, error: orderError } = await this.supabaseService.client
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        return;
      }

      // Insert order items
      const orderItems = this.cartItems.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.name,
        product_sku: item.sku || '',
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.unitPrice * item.quantity,
        product_image_url: item.imageUrl || '',
        product_specifications: {}
      }));

      const { error: itemsError } = await this.supabaseService.client
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        return;
      }

      // Clear cart
      this.store.dispatch(B2BCartActions.clearB2BCart());

      // Clear checkout data
      localStorage.removeItem('b2b_shipping_info');

      // Show success message and redirect
      this.showSuccessToast();

      // Redirect to order confirmation or profile
      setTimeout(() => {
        this.router.navigate(['/partners/profile'], {
          queryParams: { orderSuccess: true, orderNumber: orderNumber }
        });
      }, 2000);

    } catch (error) {
      console.error('Error processing order:', error);
    } finally {
      this.processing = false;
    }
  }

  private showSuccessToast(): void {
    // Create and show success toast
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
    toast.innerHTML = `
            <div class="flex items-center space-x-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span>Order placed successfully!</span>
            </div>
        `;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-x-full');
    }, 100);

    // Remove after 5 seconds
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 5000);
  }

  goBack(): void {
    this.router.navigate(['/partners/checkout/shipping']);
  }
} 