import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { B2BShippingInfo } from '../../../cart/models/b2b-cart.model';
import { selectCurrentUser } from '../../../../../core/auth/store/auth.selectors';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-b2b-shipping',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="bg-white rounded-lg shadow-sm border p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-6">
        {{ 'b2bShipping.title' | translate }}
      </h2>

      <form [formGroup]="shippingForm" (ngSubmit)="onSubmit()">
        
        <!-- Company Information Section -->
        <div class="mb-8">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ 'b2bShipping.companyInformation' | translate }}
          </h3>
          <div class="bg-gray-50 rounded-lg p-4 border">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <!-- Company Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ 'b2bShipping.companyName' | translate }}
                </label>
                <input type="text" 
                       formControlName="companyName"
                       readonly
                       class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500">
              </div>

              <!-- Company Email -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ 'b2bShipping.companyEmail' | translate }}
                </label>
                <input type="email" 
                       formControlName="companyEmail"
                       readonly
                       class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500">
              </div>
            </div>
          </div>
        </div>

        <!-- Contact Person Information -->
        <div class="mb-8">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ 'b2bShipping.contactPerson' | translate }}
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <!-- Contact Person Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ 'b2bShipping.contactPersonName' | translate }}
                <span class="text-red-500">*</span>
              </label>
              <input type="text" 
                     formControlName="contactPersonName"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
            </div>

            <!-- Contact Person Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ 'b2bShipping.contactPersonEmail' | translate }}
                <span class="text-red-500">*</span>
              </label>
              <input type="email" 
                     formControlName="contactPersonEmail"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
            </div>
          </div>
        </div>

        <!-- Delivery Address Section -->
        <div class="mb-8">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ 'b2bShipping.deliveryAddress' | translate }}
          </h3>
          
          <div class="grid grid-cols-1 gap-4">
            <!-- Delivery Address -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ 'b2bShipping.deliveryAddressField' | translate }}
                <span class="text-red-500">*</span>
              </label>
              <input type="text" 
                     formControlName="deliveryAddress"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
            </div>

            <!-- City and Postal Code -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ 'b2bShipping.deliveryCity' | translate }}
                  <span class="text-red-500">*</span>
                </label>
                <input type="text" 
                       formControlName="deliveryCity"
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ 'b2bShipping.deliveryPostalCode' | translate }}
                  <span class="text-red-500">*</span>
                </label>
                <input type="text" 
                       formControlName="deliveryPostalCode"
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
              </div>
            </div>

            <!-- Country -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ 'b2bShipping.deliveryCountry' | translate }}
                <span class="text-red-500">*</span>
              </label>
              <select formControlName="deliveryCountry"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="">{{ 'b2bShipping.selectCountry' | translate }}</option>
                <option value="HR">Croatia</option>
                <option value="SI">Slovenia</option>
                <option value="BA">Bosnia and Herzegovina</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Shipping Options -->
        <div class="mb-8">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ 'b2bShipping.shippingMethod' | translate }}
          </h3>
          <div class="space-y-3">
            <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="radio" 
                     formControlName="shippingMethod"
                     value="standard"
                     class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300">
              <div class="ml-3 flex-1">
                <div class="font-medium">{{ 'b2bShipping.standardShipping' | translate }}</div>
                <div class="text-sm text-gray-500">{{ 'b2bShipping.standardShippingDesc' | translate }}</div>
              </div>
              <div class="text-right">
                <div class="font-medium">€50</div>
              </div>
            </label>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-3">
          <button type="submit" 
                  [disabled]="shippingForm.invalid"
                  class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {{ 'b2bShipping.continue' | translate }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class B2BShippingComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  shippingForm!: FormGroup;
  currentUser$ = this.store.select(selectCurrentUser);

  constructor(
    private fb: FormBuilder,
    private store: Store
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadUserAndCompanyData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.shippingForm = this.fb.group({
      companyName: [{ value: '', disabled: true }],
      companyEmail: [{ value: '', disabled: true }],
      contactPersonName: ['', [Validators.required]],
      contactPersonEmail: ['', [Validators.required, Validators.email]],
      deliveryAddress: ['', [Validators.required]],
      deliveryCity: ['', [Validators.required]],
      deliveryPostalCode: ['', [Validators.required]],
      deliveryCountry: ['HR', [Validators.required]],
      shippingMethod: ['standard', [Validators.required]]
    });
  }

  private loadUserAndCompanyData(): void {
    this.currentUser$.pipe(
      filter(user => !!user),
      takeUntil(this.destroy$)
    ).subscribe(user => {
      if (user) {
        const mockCompanyData = {
          companyName: 'Solar Innovations d.o.o.',
          companyEmail: 'orders@solarinnovations.hr'
        };

        this.shippingForm.patchValue({
          ...mockCompanyData,
          contactPersonName: `${user.firstName} ${user.lastName}`,
          contactPersonEmail: user.email
        });
      }
    });
  }

  onSubmit(): void {
    if (this.shippingForm.valid) {
      // Save shipping info to localStorage for the payment step
      const shippingData = this.shippingForm.value;
      localStorage.setItem('b2b_shipping_info', JSON.stringify(shippingData));

      // Navigate to payment step
      if (typeof window !== 'undefined') {
        window.location.href = '/partners/checkout/payment';
      }
    } else {
      Object.keys(this.shippingForm.controls).forEach(key => {
        this.shippingForm.get(key)?.markAsTouched();
      });
    }
  }
} 